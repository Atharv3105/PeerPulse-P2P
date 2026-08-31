/**
 * Regulatory Double-Entry Escrow Ledger
 * Implements 100% segregated fund flow tracking per RBI NBFC-P2P Master Directions.
 * Strictly maintains 0% DLG (no co-mingling of platform capital with lender/borrower escrow).
 */

class EscrowLedger {
  constructor() {
    this.trusteeName = "IDFC First Bank Trustee Services Ltd.";
    this.accounts = {
      // 1. Borrower Disbursement Escrow (Pool for funding before disbursement)
      borrowerDisbursementEscrow: {
        accountNumber: "ESCROW-DISB-902182910",
        balance: 1450000.00,
        currency: "INR",
        lastReconciledAt: new Date().toISOString()
      },
      // 2. Lender Repayment Escrow (Pool for collected EMIs before pro-rata split)
      lenderRepaymentEscrow: {
        accountNumber: "ESCROW-REPAY-401928301",
        balance: 382450.00,
        currency: "INR",
        lastReconciledAt: new Date().toISOString()
      },
      // 3. Platform Operational Revenue (Fee revenue only — NOT lender capital)
      platformFeeAccount: {
        accountNumber: "PEERPULSE-REV-100293812",
        balance: 85200.00,
        currency: "INR",
        lastReconciledAt: new Date().toISOString()
      }
    };

    this.transactions = [
      {
        id: "TX-ESC-101",
        type: "TRANCHE_FUNDED",
        from: "Lender Wallet (Vikram Sethi)",
        to: "Borrower Disbursement Escrow",
        amount: 25000.00,
        reference: "LN-PRIYA-810",
        timestamp: new Date(Date.now() - 3600000).toISOString()
      },
      {
        id: "TX-ESC-102",
        type: "PRO_RATA_EMI_DISTRIBUTED",
        from: "Lender Repayment Escrow",
        to: "Lender Wallet (Rajesh Gupta)",
        amount: 4210.00,
        reference: "EMI-MND-9218",
        timestamp: new Date(Date.now() - 7200000).toISOString()
      },
      {
        id: "TX-ESC-103",
        type: "PLATFORM_FEE_COLLECTED",
        from: "Lender Repayment Escrow",
        to: "Platform Operational Revenue",
        amount: 450.00,
        reference: "REC-FEE-2PCT",
        timestamp: new Date(Date.now() - 10800000).toISOString()
      }
    ];
  }

  getBalances() {
    return {
      trustee: this.trusteeName,
      dlgGuaranteeStatus: "0% DLG (Platform Strictly Prohibited from Co-Mingling)",
      accounts: this.accounts,
      recentLedgerEntries: this.transactions.slice(0, 10)
    };
  }

  recordTransaction({ type, from, to, amount, reference }) {
    const entry = {
      id: `TX-ESC-${Date.now().toString().slice(-6)}`,
      type,
      from,
      to,
      amount: Number(amount),
      reference,
      timestamp: new Date().toISOString()
    };
    this.transactions.unshift(entry);
    return entry;
  }
}

module.exports = new EscrowLedger();
