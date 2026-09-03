const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const Borrower = require('../models/Borrower');
const Lender = require('../models/Lender');
const LoanApplication = require('../models/LoanApplication');
const LoanRepayment = require('../models/LoanRepayment');
const AuditLog = require('../models/AuditLog');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/peerpulse';

async function seedDatabase() {
  try {
    console.log(`[Seed] Connecting to MongoDB: ${MONGO_URI}`);
    await mongoose.connect(MONGO_URI);

    // Clear existing data cleanly (idempotent)
    await Borrower.deleteMany({});
    await Lender.deleteMany({});
    await LoanApplication.deleteMany({});
    await LoanRepayment.deleteMany({});
    await AuditLog.deleteMany({});
    console.log('[Seed] Cleared existing collections.');

    // 1. Seed Lenders
    const lendersData = [
      {
        lenderId: "LEN-VIKRAM-001",
        name: "Vikram Sethi",
        email: "vikram.sethi@example.com",
        mobile: "+919811122233",
        riskAppetite: "Conservative",
        sectorPreference: "manufacturing",
        tenurePreference: [3, 6, 12],
        denominationPreference: 25000,
        walletBalance: 450000,
        totalExposure: 50000,
        activeInvestments: []
      },
      {
        lenderId: "LEN-ANANYA-002",
        name: "Ananya Roy",
        email: "ananya.roy@example.com",
        mobile: "+919822233344",
        riskAppetite: "Moderate",
        sectorPreference: "textile",
        tenurePreference: [6, 12, 24],
        denominationPreference: 50000,
        walletBalance: 700000,
        totalExposure: 100000,
        activeInvestments: []
      },
      {
        lenderId: "LEN-KARAN-003",
        name: "Karan Singhal",
        email: "karan.singhal@example.com",
        mobile: "+919833344455",
        riskAppetite: "Aggressive",
        sectorPreference: "any",
        tenurePreference: [3, 6, 9, 12, 24, 36],
        denominationPreference: 25000,
        walletBalance: 850000,
        totalExposure: 75000,
        activeInvestments: []
      }
    ];

    const seededLenders = await Lender.insertMany(lendersData);
    console.log(`[Seed] Inserted ${seededLenders.length} retail lenders.`);

    // 2. Persona 1: Priya Sharma (Grade A ~810, Clean Financials, Ready to Fund)
    const priyaBorrower = await Borrower.create({
      borrowerId: "BOR-PRIYA-001",
      name: "Priya Sharma",
      mobile: "+919820192831",
      aadhaarVerified: true,
      businessName: "Priya Textiles Surat",
      businessCategory: "textile",
      udyamNumber: "UDYAM-GJ-01-001928",
      gstNumber: "24AABCP1928K1Z5",
      platformTrustScore: 92
    });

    const priyaLoan = await LoanApplication.create({
      applicationId: "LN-PRIYA-810",
      borrowerId: priyaBorrower._id,
      borrowerUuid: priyaBorrower.borrowerId,
      loanAmount: 500000,
      tenure: 12,
      purpose: "Procurement of High-Grade Surat Silk Fabrics & Loom Expansion",
      businessCategory: "textile",
      interestRate: 13.5,
      acieScore: {
        total: 810,
        grade: "A",
        breakdown: {
          cashflow: 85,
          upi: 78,
          gst: 90,
          operational: 70,
          aaData: 65
        },
        fraudFlags: [],
        confidence: "High",
        fraudRiskFlag: "None",
        dataCompleteness: 95,
        explainability: {
          positiveFactors: [
            "Flawless banking repayment discipline with zero inward/outward bounces",
            "High GST filing fidelity (GSTR-1 declared turnover matches bank collections within 5%)",
            "Strong digital presence: Verified Google Business profile (45+ positive reviews)",
            "Organic, well-distributed UPI customer transaction graph with zero circular routing"
          ],
          negativeFactors: [],
          improvementTips: [
            "Maintaining quarterly AA telemetry enables preferential interest rates on subsequent renewals"
          ]
        },
        forgeryResult: {
          forgeryGrade: "AUTHENTIC",
          forgeryReason: "Cryptographic publisher verification matches HDFC Bank statement generator. Consistent typography and layout.",
          metadataFlagged: false,
          layoutAnomalies: []
        }
      },
      fundingStatus: {
        funded: 350000,
        target: 500000,
        percentFunded: 70,
        lenders: [
          { lenderId: seededLenders[0]._id, trancheId: "TR-VIK-01", amount: 50000 },
          { lenderId: seededLenders[1]._id, trancheId: "TR-ANA-01", amount: 50000 },
          { lenderId: seededLenders[2]._id, trancheId: "TR-KAR-01", amount: 25000 }
        ]
      },
      status: "LISTED"
    });

    const priyaRepayment = await LoanRepayment.create({
      loanId: priyaLoan._id,
      status: "ACTIVE",
      dpd: 0,
      penalInterestAccrued: 0,
      monthlyEmi: 44790,
      outstandingPrincipal: 500000,
      nextPaymentDueDate: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000)
    });
    priyaLoan.repayment = priyaRepayment._id;
    await priyaLoan.save();
    priyaBorrower.activeApplications.push(priyaLoan._id);
    await priyaBorrower.save();

    // 3. Persona 2: Ravi Verma (Grade C ~590, Subprime Badge, GST Mismatch + Bounces)
    const raviBorrower = await Borrower.create({
      borrowerId: "BOR-RAVI-002",
      name: "Ravi Kumar Verma",
      mobile: "+919820293842",
      aadhaarVerified: true,
      businessName: "Ravi General Stores",
      businessCategory: "retail",
      udyamNumber: "UDYAM-MH-02-004821",
      gstNumber: "27AAACR4920M1Z2",
      platformTrustScore: 68
    });

    const raviLoan = await LoanApplication.create({
      applicationId: "LN-RAVI-590",
      borrowerId: raviBorrower._id,
      borrowerUuid: raviBorrower.borrowerId,
      loanAmount: 300000,
      tenure: 6,
      purpose: "Seasonal FMCG Inventory Pre-Stocking",
      businessCategory: "retail",
      interestRate: 19.5,
      acieScore: {
        total: 590,
        grade: "C",
        breakdown: {
          cashflow: 55,
          upi: 43,
          gst: 55,
          operational: 65,
          aaData: 60
        },
        fraudFlags: [
          "GST Discrepancy: Bank credits (₹41,20,000) exceed declared GST turnover (₹28,00,000) by 47.1% (threshold: >40%)",
          "2 bank account debit/EMI bounces detected in statement",
          "Circular routing detected: 3 reciprocal A→B→A transaction loops within 72h window",
          "Uniform transaction anomaly: Exactly ₹25,000.00 repeated 23 times"
        ],
        confidence: "Medium",
        fraudRiskFlag: "Caution",
        dataCompleteness: 85,
        explainability: {
          positiveFactors: [
            "Consistent daily retail consumer footfall",
            "Established retail distribution relationship"
          ],
          negativeFactors: [
            "Significant delta between declared GST turnover (₹28L) and bank credits (₹41L)",
            "2 inward cheque/NACH bounces recorded in 12-month bank statement",
            "3 circular UPI transaction loops detected within 72-hour window"
          ],
          improvementTips: [
            "Maintain higher closing balance on the 1st-5th of each month to prevent EMI bounces",
            "Reconcile bank inflows with GSTR-1 declared sales before quarterly filing"
          ]
        },
        forgeryResult: {
          forgeryGrade: "AUTHENTIC",
          forgeryReason: "Bank statement verified authentic. Higher risk driven by cashflow bounce metrics and GST turnover delta.",
          metadataFlagged: false,
          layoutAnomalies: []
        }
      },
      fundingStatus: {
        funded: 75000,
        target: 300000,
        percentFunded: 25,
        lenders: [
          { lenderId: seededLenders[2]._id, trancheId: "TR-KAR-02", amount: 25000 }
        ]
      },
      status: "LISTED"
    });

    const raviRepayment = await LoanRepayment.create({
      loanId: raviLoan._id,
      status: "ACTIVE",
      dpd: 0,
      penalInterestAccrued: 0,
      monthlyEmi: 52880,
      outstandingPrincipal: 300000,
      nextPaymentDueDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000)
    });
    raviLoan.repayment = raviRepayment._id;
    await raviLoan.save();
    raviBorrower.activeApplications.push(raviLoan._id);
    await raviBorrower.save();

    // 4. Persona 3: Kumar Chandran (BLOCKED Forged PDF, LLM reasoning visible in Admin flagged queue)
    const kumarBorrower = await Borrower.create({
      borrowerId: "BOR-KUMAR-003",
      name: "Kumar Chandran",
      mobile: "+919820394853",
      aadhaarVerified: true,
      businessName: "Kumar Logistics & Spares",
      businessCategory: "services",
      udyamNumber: "UDYAM-KA-03-009182",
      gstNumber: "29AAACK9012J1Z3",
      platformTrustScore: 40
    });

    const kumarLoan = await LoanApplication.create({
      applicationId: "LN-KUMAR-FORGED",
      borrowerId: kumarBorrower._id,
      borrowerUuid: kumarBorrower.borrowerId,
      loanAmount: 1200000,
      tenure: 24,
      purpose: "Commercial Fleet Expansion",
      businessCategory: "services",
      interestRate: 15.0,
      acieScore: {
        total: 310,
        grade: "DECLINED",
        breakdown: {
          cashflow: 15,
          upi: 20,
          gst: 20,
          operational: 40,
          aaData: 30
        },
        fraudFlags: [
          "DOCUMENT FORGERY DETECTED: Metadata reveals document created/modified with unverified PDF Editor tools ('Adobe Acrobat Pro Cracked Copy / PDF Editor Suite') shortly before upload. Font analysis detects 3 distinct mismatched font families across transaction line items."
        ],
        confidence: "Low",
        fraudRiskFlag: "Block",
        dataCompleteness: 50,
        explainability: {
          positiveFactors: [],
          negativeFactors: [
            "Manipulated or forged bank statement file detected by Layer-1 forensic scanner",
            "Mixed font families ('helv', 'times-roman', 'courier', 'times-bold') detected in numerical ledger",
            "Misaligned credit amount column (+15pt horizontal skew)"
          ],
          improvementTips: [
            "Submit authentic, untampered bank-issued digital PDF statements or connect direct Account Aggregator"
          ]
        },
        forgeryResult: {
          forgeryGrade: "FORGED",
          forgeryReason: "Metadata reveals document created/modified with unverified PDF Editor tools ('Adobe Acrobat Pro Cracked Copy') shortly before upload. Font analysis detects 3 distinct mismatched font families ('helv', 'times-roman', 'courier', 'times-bold') interspersed across transaction line items. Numerical alignment anomalies detected in Credit column.",
          metadataFlagged: true,
          layoutAnomalies: [
            "Non-uniform vertical row spacing (+12px delta)",
            "Credit amount column misaligned by >15pt"
          ]
        }
      },
      fundingStatus: {
        funded: 0,
        target: 1200000,
        percentFunded: 0,
        lenders: []
      },
      status: "BLOCKED"
    });
    kumarBorrower.activeApplications.push(kumarLoan._id);
    await kumarBorrower.save();

    // 5. Persona 4: Amit Deshmukh (Funded Borrower in Active Recovery Scenario)
    const amitBorrower = await Borrower.create({
      borrowerId: "BOR-AMIT-004",
      name: "Amit Deshmukh",
      mobile: "+919876543210",
      aadhaarVerified: true,
      businessName: "Deshmukh Precision Engineering",
      businessCategory: "manufacturing",
      udyamNumber: "UDYAM-MH-03-0029182",
      gstNumber: "27AAACD9910P1Z8",
      platformTrustScore: 88
    });

    const amitLoan = await LoanApplication.create({
      applicationId: "LN-AMIT-710",
      borrowerId: amitBorrower._id,
      borrowerUuid: amitBorrower.borrowerId,
      loanAmount: 500000,
      tenure: 12,
      purpose: "Purchase CNC Milling Tooling & Raw Steel Stock",
      businessCategory: "manufacturing",
      interestRate: 16.0,
      acieScore: {
        total: 710,
        grade: "B",
        breakdown: {
          cashflow: 72,
          upi: 70,
          gst: 75,
          operational: 68,
          aaData: 66
        },
        fraudFlags: [],
        confidence: "High",
        fraudRiskFlag: "None",
        dataCompleteness: 90,
        explainability: {
          positiveFactors: [
            "Consistent manufacturing invoices",
            "Established 5-year Udyam manufacturing track record"
          ],
          negativeFactors: ["Moderate debt-to-income ratio"],
          improvementTips: ["Maintain current cash reserves above 15% of active loan"]
        },
        forgeryResult: {
          forgeryGrade: "AUTHENTIC",
          forgeryReason: "Bank statement verified authentic from Canara Bank NetBanking.",
          metadataFlagged: false,
          layoutAnomalies: []
        }
      },
      fundingStatus: {
        funded: 500000,
        target: 500000,
        percentFunded: 100,
        lenders: [
          { lenderId: seededLenders[0]._id, trancheId: "TR-VIK-AMIT", amount: 50000 },
          { lenderId: seededLenders[1]._id, trancheId: "TR-ANA-AMIT", amount: 50000 },
          { lenderId: seededLenders[2]._id, trancheId: "TR-KAR-AMIT", amount: 25000 }
        ]
      },
      status: "ACTIVE"
    });

    const amitRepayment = await LoanRepayment.create({
      loanId: amitLoan._id,
      status: "DELAYED",
      dpd: 12,
      penalInterestAccrued: 2958,
      penalInterestRate: 0.18,
      monthlyEmi: 45365,
      outstandingPrincipal: 500000,
      nextPaymentDueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      ewsFlags: [
        {
          triggeredAt: new Date(),
          type: 'BALANCE_LOW',
          severity: 'ALERT',
          description: 'UPI velocity inflow dropped 42%. Account balance below threshold during NACH debit.'
        }
      ],
      restructurePlan: {
        restructureId: 'RES-AMIT-OTS',
        option: 'OTS',
        proposedAmount: 350000,
        status: 'PENDING_VOTE',
        appliedAt: new Date(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        votes: [],
        approvalPercentage: 40.0
      },
      collectionAttempts: [
        {
          attemptDate: new Date(),
          method: 'NACH',
          outcome: 'FAILED',
          amountAttempted: 45365,
          channel: 'HDFC_NACH_GATEWAY',
          notes: 'NACH auto-debit returned R08 Insufficient Balance'
        }
      ]
    });

    amitLoan.repayment = amitRepayment._id;
    await amitLoan.save();
    amitBorrower.activeApplications.push(amitLoan._id);
    await amitBorrower.save();

    console.log('[Seed] Successfully seeded all 4 personas: Priya (810 A), Ravi (590 C), Kumar (BLOCKED), Amit (ACTIVE Recovery)');
    console.log('[Seed] Database is fully primed and demo-ready!');
    process.exit(0);
  } catch (err) {
    console.error('[Seed Error]:', err);
    process.exit(1);
  }
}

seedDatabase();
