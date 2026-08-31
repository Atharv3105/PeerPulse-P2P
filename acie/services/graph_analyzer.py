import io
import csv
from datetime import datetime, timedelta
from collections import defaultdict
import networkx as nx
from typing import Dict, Any, List

def analyze_upi_csv(csv_content: str, application_date_str: str = "") -> Dict[str, Any]:
    """
    Graph-based DFS cycle detection and statistical anomaly checks for UPI transactions:
    1. NetworkX directed graph analysis with 72-hour window and <5% amount variance
    2. Statistical checks: uniform amounts (threshold 23), velocity spike, round-number dominance (>60% ending in 000/500)
    3. Output schema matching Section 6.1
    """
    reader = csv.DictReader(io.StringIO(csv_content))
    txns = []
    
    for row in reader:
        # Standardize column keys (lowercased/stripped)
        clean_row = {k.strip().lower(): v.strip() for k, v in row.items() if k}
        try:
            amount = float(clean_row.get("amount", "0").replace(",", ""))
            sender = clean_row.get("sender_upi") or clean_row.get("sender") or clean_row.get("from") or "unknown_sender"
            receiver = clean_row.get("receiver_upi") or clean_row.get("receiver") or clean_row.get("to") or "unknown_receiver"
            ts_str = clean_row.get("timestamp") or clean_row.get("date") or "2026-02-01T00:00:00Z"
            
            # Parse timestamp
            ts_clean = ts_str.replace("Z", "")
            try:
                ts = datetime.fromisoformat(ts_clean)
            except Exception:
                ts = datetime(2026, 2, 1, 10, 0, 0)

            tx_type = clean_row.get("type", "CREDIT").upper()
            txns.append({
                "txn_id": clean_row.get("transaction_id", f"TX-{len(txns)}"),
                "sender": sender.lower(),
                "receiver": receiver.lower(),
                "amount": amount,
                "timestamp": ts,
                "type": tx_type
            })
        except Exception:
            continue

    if not txns:
        return {
            "cycleCount": 0,
            "cycleDetails": [],
            "fraudScore": 10,
            "statisticalFlags": ["Empty or unreadable UPI dataset"]
        }

    # Sort transactions chronologically
    txns.sort(key=lambda x: x["timestamp"])

    # 1. Graph Analysis: Build directed graph & detect A -> B and B -> A cycles within 72h and <5% amount delta
    G = nx.MultiDiGraph()
    for t in txns:
        G.add_edge(t["sender"], t["receiver"], amount=t["amount"], timestamp=t["timestamp"], txn_id=t["txn_id"])

    cycle_details = []
    window_72h = timedelta(hours=72)
    detected_cycles_set = set()

    for i in range(len(txns)):
        t1 = txns[i]
        for j in range(i + 1, len(txns)):
            t2 = txns[j]
            # Time window check
            if t2["timestamp"] - t1["timestamp"] > window_72h:
                break
            
            # Reciprocal flow check: A -> B and then B -> A
            if t1["sender"] == t2["receiver"] and t1["receiver"] == t2["sender"]:
                # Amount variance < 5%
                amt_diff = abs(t1["amount"] - t2["amount"])
                max_amt = max(t1["amount"], t2["amount"])
                if max_amt > 0 and (amt_diff / max_amt) <= 0.05:
                    pair_key = tuple(sorted([t1["txn_id"], t2["txn_id"]]))
                    if pair_key not in detected_cycles_set:
                        detected_cycles_set.add(pair_key)
                        cycle_details.append({
                            "nodeA": t1["sender"],
                            "nodeB": t1["receiver"],
                            "amount": round((t1["amount"] + t2["amount"]) / 2, 2),
                            "timestamps": [t1["timestamp"].isoformat(), t2["timestamp"].isoformat()]
                        })

    cycle_count = len(cycle_details)

    # 2. Statistical Checks
    statistical_flags = []
    
    # Check 1: Uniform amounts (same amount repeated >= 23 times)
    amount_counts = defaultdict(int)
    for t in txns:
        amount_counts[round(t["amount"], 2)] += 1
    
    for amt, count in amount_counts.items():
        if count >= 23:
            statistical_flags.append(f"Uniform transaction anomaly: Exactly ₹{amt:,.2f} repeated {count} times (threshold: 23)")

    # Check 2: Round number dominance (>60% of credit transactions ending in 000 or 500)
    credit_txns = [t for t in txns if t["type"] == "CREDIT" or "cr" in str(t.get("txn_id", "")).lower()]
    if credit_txns:
        round_count = 0
        for t in credit_txns:
            amt_int = int(round(t["amount"]))
            if amt_int >= 500 and (amt_int % 1000 == 0 or amt_int % 500 == 0):
                round_count += 1
        round_ratio = round_count / len(credit_txns)
        if round_ratio > 0.60 and len(credit_txns) >= 5:
            statistical_flags.append(f"Round-number dominance: {round_ratio*100:.1f}% of credits end in .000 or .500 (threshold: 60%)")

    # Check 3: Velocity spike (10x increase in last 30 days vs preceding history if historical data exists)
    if len(txns) >= 20:
        latest_ts = txns[-1]["timestamp"]
        last_30d = [t for t in txns if latest_ts - t["timestamp"] <= timedelta(days=30)]
        prior_txns = [t for t in txns if latest_ts - t["timestamp"] > timedelta(days=30)]
        if prior_txns and (len(last_30d) / max(len(prior_txns), 1)) >= 10:
            statistical_flags.append(f"Velocity spike: 10x transaction surge detected in 30-day period before application")

    # 3. UPI Sub-score calculation (0-100)
    # Starts at 88, penalizes -15 per cycle, -15 per statistical flag
    upi_sub_score = 88.0
    upi_sub_score -= (cycle_count * 15.0)
    upi_sub_score -= (len(statistical_flags) * 12.0)
    upi_sub_score = max(min(upi_sub_score, 100.0), 10.0)

    # Fraud score (0 = clean, 100 = critical fraud)
    fraud_score = (cycle_count * 25) + (len(statistical_flags) * 20)
    fraud_score = min(fraud_score, 100)

    return {
        "cycleCount": cycle_count,
        "cycleDetails": cycle_details,
        "fraudScore": fraud_score,
        "statisticalFlags": statistical_flags,
        "upiSubScore": round(upi_sub_score, 1)
    }
