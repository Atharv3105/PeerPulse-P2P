import os
import json
import csv
import fitz # PyMuPDF

os.makedirs("data", exist_ok=True)

# 2. mock_statement_bounces.json (Ravi)
statement_bounces = {
    "accountNumber": "91200182749102",
    "accountType": "CURRENT",
    "bank": "State Bank of India",
    "holderName": "Ravi Kumar Verma",
    "businessName": "Ravi General Stores",
    "period": {
        "from": "2025-04-01",
        "to": "2026-03-31"
    },
    "summary": {
        "totalCredit": 4120000,
        "totalDebit": 3950000,
        "netCashFlow": 170000,
        "bounceCount": 2,
        "avgMonthlyBalance": 82000,
        "creditTransactionCount": 512,
        "debitTransactionCount": 430
    },
    "monthlyMetrics": [
        {"month": "2025-04", "credit": 340000, "debit": 325000, "closingBalance": 75000, "bounces": 0},
        {"month": "2025-05", "credit": 350000, "debit": 345000, "closingBalance": 80000, "bounces": 0},
        {"month": "2025-06", "credit": 330000, "debit": 340000, "closingBalance": 70000, "bounces": 1},
        {"month": "2025-07", "credit": 360000, "debit": 350000, "closingBalance": 80000, "bounces": 0},
        {"month": "2025-08", "credit": 345000, "debit": 340000, "closingBalance": 85000, "bounces": 0},
        {"month": "2025-09", "credit": 320000, "debit": 335000, "closingBalance": 70000, "bounces": 1},
        {"month": "2025-10", "credit": 370000, "debit": 355000, "closingBalance": 85000, "bounces": 0},
        {"month": "2025-11", "credit": 350000, "debit": 340000, "closingBalance": 95000, "bounces": 0},
        {"month": "2025-12", "credit": 340000, "debit": 330000, "closingBalance": 105000, "bounces": 0},
        {"month": "2026-01", "credit": 335000, "debit": 325000, "closingBalance": 115000, "bounces": 0},
        {"month": "2026-02", "credit": 330000, "debit": 320000, "closingBalance": 125000, "bounces": 0},
        {"month": "2026-03", "credit": 350000, "debit": 345000, "closingBalance": 130000, "bounces": 0}
    ],
    "vendorDebits": [
        {"vendor": "Metro Cash and Carry", "category": "wholesale_inventory", "totalAmount": 2100000, "frequency": 36},
        {"vendor": "Hindustan Unilever Dist", "category": "fmcg_supplies", "totalAmount": 1150000, "frequency": 24},
        {"vendor": "Shop Rent AutoDebit", "category": "rent", "totalAmount": 360000, "frequency": 12}
    ],
    "narrations": [
        "UPI/CR/712984128/RetailSales",
        "INWARD CLG BOUNCE/INSUFFICIENT FUNDS/CHQ 982144",
        "UPI/CR/712984129/PaytmQrMerchant",
        "NACH DR BOUNCE/BAJAJ FINANCE/RETURN CHARGES APPLIED",
        "UPI/CR/712984130/PhonePeRetail"
    ]
}
with open("data/mock_statement_bounces.json", "w") as f:
    json.dump(statement_bounces, f, indent=2)

# 3. mock_statement_forged.pdf (Kumar)
doc = fitz.open()
page = doc.new_page()

# Inject suspicious metadata: Modified in Adobe Acrobat Pro, modified time minutes before upload
metadata = {
    "title": "Bank Account Statement",
    "author": "Kumar Enterprises",
    "subject": "Current Account Statement 2025-2026",
    "creator": "Adobe Acrobat Pro (v24.2.1) - Unregistered Cracked Copy",
    "producer": "iText / Adobe PDF Library 15.0 / Modified via PDF Editor Suite",
    "creationDate": "D:20250401100000",
    "modDate": "D:20260825203000" # Edited 2 hours before upload
}
doc.set_metadata(metadata)

# Write document content with mixed fonts and misaligned columns
page.insert_text((50, 50), "CANARA BANK - OFFICIAL CURRENT ACCOUNT STATEMENT", fontsize=16, fontname="helv")
page.insert_text((50, 80), "Account Holder: Kumar Chandran | Business: Kumar Logistics & Spares", fontsize=11, fontname="helv")
page.insert_text((50, 100), "Account No: 1049281048201 | Period: 01-Apr-2025 to 31-Mar-2026", fontsize=10, fontname="times-roman") # Mixed font

page.insert_text((50, 140), "Date         Description                     Debit (INR)    Credit (INR)      Balance (INR)", fontsize=9, fontname="helv")
page.draw_line(fitz.Point(50, 145), fitz.Point(550, 145))

# Manipulated rows with mixed fonts and misaligned decimals
txs = [
    ("05/04/2025", "UPI/CR/90214/LogisticsClient", "-", "4,50,000.00", "5,20,000.00", "helv"),
    ("12/05/2025", "NEFT/CR/TataMotorsFleet", "-", "8,20,000.00", "13,40,000.00", "times-roman"), # Font mismatch
    ("20/06/2025", "CHQ/CLG/DieselBulkExpense", "3,10,000.00", "-", "10,30,000.00", "helv"),
    ("15/08/2025", "UPI/CR/DirectFreightPayment", "-", "12,00,000.00", "22,30,000.00", "courier"), # Another font mismatch
    ("10/11/2025", "MODIFIED_TRANSACTION_INJECT", "-", "15,50,000.00", "37,80,000.00", "times-bold"), # Injected font
    ("28/02/2026", "CLOSING_BALANCE_ARTIFICIAL", "-", "10,00,000.00", "47,80,000.00", "times-roman")
]

y = 165
for dt, desc, dr, cr, bal, font in txs:
    page.insert_text((50, y), dt, fontsize=9, fontname=font)
    page.insert_text((120, y), desc, fontsize=9, fontname=font)
    page.insert_text((300, y), dr, fontsize=9, fontname=font)
    page.insert_text((380, y), cr, fontsize=9, fontname=font)
    page.insert_text((470, y), bal, fontsize=9, fontname=font)
    y += 25

page.draw_line(fitz.Point(50, y), fitz.Point(550, y))
y += 20
page.insert_text((50, y), "SUMMARY: Total Credits: INR 50,20,000.00 | Total Debits: INR 3,10,000.00 | Avg Balance: INR 22,50,000", fontsize=10, fontname="helv")

doc.save("data/mock_statement_forged.pdf")
doc.close()

# 4. mock_upi_clean.csv (Priya)
with open("data/mock_upi_clean.csv", "w", newline="") as f:
    writer = csv.writer(f)
    writer.writerow(["transaction_id", "timestamp", "sender_upi", "receiver_upi", "amount", "status", "type"])
    # 40 distinct transactions with realistic diversity
    base_time = "2026-02-0"
    for i in range(1, 41):
        day = (i % 28) + 1
        hour = (i % 12) + 9
        ts = f"2026-02-{day:02d}T{hour:02d}:15:00Z"
        sender = f"customer_{i}@oksbi"
        receiver = "priyatextiles@okhdfcbank"
        amount = 1450 + (i * 375) + ((i % 7) * 89)
        writer.writerow([f"UPI-TXN-{1000+i}", ts, sender, receiver, amount, "SUCCESS", "CREDIT"])

# 5. mock_upi_cyclical.csv (Ravi - with 3 A->B->A cycles within 72h window and variance < 5%)
with open("data/mock_upi_cyclical.csv", "w", newline="") as f:
    writer = csv.writer(f)
    writer.writerow(["transaction_id", "timestamp", "sender_upi", "receiver_upi", "amount", "status", "type"])
    
    # Regular transactions
    for i in range(1, 20):
        writer.writerow([f"UPI-REG-{100+i}", f"2026-02-{(i%20)+1:02d}T10:00:00Z", f"retail_buyer_{i}@paytm", "ravistores@oksbi", 1200 + (i*150), "SUCCESS", "CREDIT"])
    
    # Cycle 1: Ravi -> TraderX (50,000) on Day 10, TraderX -> Ravi (49,500 - 1% delta) on Day 11 (within 24h)
    writer.writerow(["UPI-CYC-1A", "2026-02-10T09:30:00Z", "ravistores@oksbi", "trader_x_associates@icici", 50000.0, "SUCCESS", "DEBIT"])
    writer.writerow(["UPI-CYC-1B", "2026-02-11T14:15:00Z", "trader_x_associates@icici", "ravistores@oksbi", 49500.0, "SUCCESS", "CREDIT"])
    
    # Cycle 2: Ravi -> FriendY (75,000) on Day 15, FriendY -> Ravi (74,000 - 1.3% delta) on Day 16
    writer.writerow(["UPI-CYC-2A", "2026-02-15T11:00:00Z", "ravistores@oksbi", "friend_y_fin@hdfcbank", 75000.0, "SUCCESS", "DEBIT"])
    writer.writerow(["UPI-CYC-2B", "2026-02-16T16:45:00Z", "friend_y_fin@hdfcbank", "ravistores@oksbi", 74000.0, "SUCCESS", "CREDIT"])

    # Cycle 3: Ravi -> ShellZ (1,00,000) on Day 20, ShellZ -> Ravi (98,000 - 2% delta) on Day 22 (within 48h)
    writer.writerow(["UPI-CYC-3A", "2026-02-20T08:00:00Z", "ravistores@oksbi", "shell_z_enterprises@axisbank", 100000.0, "SUCCESS", "DEBIT"])
    writer.writerow(["UPI-CYC-3B", "2026-02-22T10:30:00Z", "shell_z_enterprises@axisbank", "ravistores@oksbi", 98000.0, "SUCCESS", "CREDIT"])

    # Statistical flags: 23 uniform amounts of exactly 25,000
    for k in range(23):
        writer.writerow([f"UPI-UNI-{k+1}", f"2026-02-{(k%25)+1:02d}T12:00:00Z", f"frequent_user_{k%3}@upi", "ravistores@oksbi", 25000.0, "SUCCESS", "CREDIT"])

# 6. mock_gst_priya.json
gst_priya = {
    "gstin": "24AABCP1928K1Z5",
    "legalName": "Priya Sharma",
    "tradeName": "Priya Textiles Surat",
    "financialYear": "2025-2026",
    "filingStatus": "REGULAR_COMPLIANT",
    "declaredAnnualTurnover": 3420000,
    "quarterlyFilings": [
        {"quarter": "Q1", "grossTurnover": 845000, "taxPaid": 42250, "filedOnTime": True, "arn": "AA2406250019281"},
        {"quarter": "Q2", "grossTurnover": 865000, "taxPaid": 43250, "filedOnTime": True, "arn": "AA2409250028472"},
        {"quarter": "Q3", "grossTurnover": 890000, "taxPaid": 44500, "filedOnTime": True, "arn": "AA2412250039483"},
        {"quarter": "Q4", "grossTurnover": 820000, "taxPaid": 41000, "filedOnTime": True, "arn": "AA2503250048291"}
    ],
    "businessCategory": "textile",
    "verifiedByGSTN": True
}
with open("data/mock_gst_priya.json", "w") as f:
    json.dump(gst_priya, f, indent=2)

# 7. mock_gst_ravi.json
gst_ravi = {
    "gstin": "27AAACR4920M1Z2",
    "legalName": "Ravi Kumar Verma",
    "tradeName": "Ravi General Stores",
    "financialYear": "2025-2026",
    "filingStatus": "DELAYED_FILINGS",
    "declaredAnnualTurnover": 2800000, # Bank has 41.2L -> Delta = (41.2 - 28) / 28 = 47.1% (> 40% threshold!)
    "quarterlyFilings": [
        {"quarter": "Q1", "grossTurnover": 700000, "taxPaid": 35000, "filedOnTime": True, "arn": "AA2706250082191"},
        {"quarter": "Q2", "grossTurnover": 700000, "taxPaid": 35000, "filedOnTime": False, "arn": "AA2709250091823"},
        {"quarter": "Q3", "grossTurnover": 700000, "taxPaid": 35000, "filedOnTime": False, "arn": "AA2712250019284"},
        {"quarter": "Q4", "grossTurnover": 700000, "taxPaid": 35000, "filedOnTime": True, "arn": "AA2803250037192"}
    ],
    "businessCategory": "retail",
    "verifiedByGSTN": True
}
with open("data/mock_gst_ravi.json", "w") as f:
    json.dump(gst_ravi, f, indent=2)

# 8. mock_recovery_amit.json
recovery_amit = {
    "applicationId": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
    "borrower": {
        "borrowerId": "b1111111-1111-1111-1111-111111111111",
        "name": "Amit Deshmukh",
        "mobile": "+919876543210",
        "aadhaarVerified": True,
        "businessName": "Deshmukh Precision Engineering",
        "businessCategory": "manufacturing",
        "udyamNumber": "UDYAM-MH-03-0029182",
        "gstNumber": "27AAACD9910P1Z8",
        "platformTrustScore": 88
    },
    "loanAmount": 500000,
    "tenure": 12,
    "purpose": "Purchase CNC Milling Tooling & Raw Steel Stock",
    "businessCategory": "manufacturing",
    "acieScore": {
        "total": 710,
        "grade": "B",
        "breakdown": {
            "cashflow": 72,
            "upi": 70,
            "gst": 75,
            "operational": 68,
            "aaData": 66
        },
        "fraudFlags": [],
        "confidence": "High",
        "fraudRiskFlag": "None",
        "dataCompleteness": 90,
        "explainability": {
            "positiveFactors": ["Consistent manufacturing invoices", "Established 5-year Udyam track record"],
            "negativeFactors": ["Moderate debt-to-income ratio"],
            "improvementTips": ["Maintain current cash reserves above 15% of loan"]
        }
    },
    "fundingStatus": {
        "funded": 500000,
        "target": 500000,
        "percentFunded": 100,
        "lenders": []
    },
    "status": "ACTIVE",
    "createdAt": "2025-11-15T10:00:00.000Z",
    "updatedAt": "2025-11-15T10:00:00.000Z"
}
with open("data/mock_recovery_amit.json", "w") as f:
    json.dump(recovery_amit, f, indent=2)

# 9. mock_lenders.json
lenders = [
    {
        "lenderId": "l1111111-1111-1111-1111-111111111111",
        "name": "Vikram Sethi",
        "email": "vikram.sethi@example.com",
        "mobile": "+919811122233",
        "riskAppetite": "Conservative",
        "sectorPreference": "manufacturing",
        "tenurePreference": [3, 6, 12],
        "denominationPreference": 25000,
        "walletBalance": 450000,
        "totalExposure": 200000,
        "activeInvestments": []
    },
    {
        "lenderId": "l2222222-2222-2222-2222-222222222222",
        "name": "Ananya Roy",
        "email": "ananya.roy@example.com",
        "mobile": "+919822233344",
        "riskAppetite": "Moderate",
        "sectorPreference": "textile",
        "tenurePreference": [6, 12, 24],
        "denominationPreference": 50000,
        "walletBalance": 700000,
        "totalExposure": 250000,
        "activeInvestments": []
    },
    {
        "lenderId": "l3333333-3333-3333-3333-333333333333",
        "name": "Karan Singhal",
        "email": "karan.singhal@example.com",
        "mobile": "+919833344455",
        "riskAppetite": "Aggressive",
        "sectorPreference": "any",
        "tenurePreference": [3, 6, 9, 12, 24, 36],
        "denominationPreference": 25000,
        "walletBalance": 850000,
        "totalExposure": 150000,
        "activeInvestments": []
    }
]
with open("data/mock_lenders.json", "w") as f:
    json.dump(lenders, f, indent=2)

print("All 9 mock data files successfully generated in /data!")
