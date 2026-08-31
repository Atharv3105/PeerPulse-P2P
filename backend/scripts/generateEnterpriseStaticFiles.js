/**
 * Enterprise Static File Generator for PeerPulse
 * Synthesizes production-grade, highly accurate FinTech datasets:
 * - 180 MSME Borrowers across diverse Indian sectors & cities
 * - 150 Retail Lenders with realistic wallets & fractional allocations (strictly obeying RBI caps)
 * - 320 Loan Applications across 8 lifecycle stages with ACIE scores & explainability
 * - 320 Repayment records with DPD counters, penal interest, EWS flags, & OTS ballots
 * - 25,000+ ReBIT transactions covering Current, Savings, & Overdraft (OD/CC) facilities
 * - Detailed GSTR-1 & GSTR-3B filings
 * - 15,000+ line directed graph UPI CSV stream
 * 
 * Preserves the 4 core benchmark personas: Priya, Ravi, Kumar, Amit.
 */

const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

const DATA_DIR = path.join(__dirname, '../../data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Deterministic Pseudo-Random Generator (Seedable)
let seed = 42;
function random() {
  seed = (seed * 9301 + 49297) % 233280;
  return seed / 233280;
}

function randInt(min, max) {
  return Math.floor(random() * (max - min + 1)) + min;
}

function randChoice(arr) {
  return arr[Math.floor(random() * arr.length)];
}

// Indian Data Dictionaries
const INDIAN_FIRST_NAMES = [
  "Aarav", "Aditi", "Ajay", "Amit", "Ananya", "Anil", "Arjun", "Ashok", "Bhavna", "Chetan",
  "Deepak", "Divya", "Ganesh", "Gita", "Hari", "Harish", "Isha", "Jagdish", "Karan", "Kavita",
  "Kiran", "Krishna", "Madhav", "Manish", "Meera", "Mukesh", "Naveen", "Neha", "Nikhil", "Nitin",
  "Pooja", "Pradeep", "Prakash", "Pranav", "Prashant", "Priya", "Rahul", "Rajesh", "Rakesh", "Ramesh",
  "Ravi", "Ritu", "Rohit", "Sachin", "Sameer", "Sanjay", "Saurabh", "Shilpa", "Sneha", "Subhash",
  "Sujata", "Sunil", "Suresh", "Tarun", "Umesh", "Varun", "Vijay", "Vikas", "Vikram", "Vinod"
];

const INDIAN_LAST_NAMES = [
  "Agarwal", "Bansal", "Bhatia", "Chauhan", "Chopra", "Deshmukh", "Desai", "Gupta", "Iyer", "Jain",
  "Jha", "Joshi", "Kapoor", "Khan", "Kulkarni", "Kumar", "Malhotra", "Mehta", "Mishra", "Naik",
  "Nair", "Pandey", "Patel", "Patil", "Pillai", "Prasad", "Rao", "Reddy", "Roy", "Saxena",
  "Sen", "Shah", "Sharma", "Shetty", "Singh", "Singhal", "Srivastava", "Trivedi", "Varma", "Verma",
  "Yadav", "Menon", "Bose", "Ghosh", "Mukherjee", "Chatterjee", "Dutta", "Nambiar", "Swaminathan", "Bhattacharya"
];

const CITIES_AND_STATES = [
  { city: "Surat", state: "Gujarat", code: "24", cluster: "Textiles & Diamonds" },
  { city: "Ahmedabad", state: "Gujarat", code: "24", cluster: "Chemicals & Engineering" },
  { city: "Rajkot", state: "Gujarat", code: "24", cluster: "Foundry & Auto Parts" },
  { city: "Mumbai", state: "Maharashtra", code: "27", cluster: "Logistics & Trade" },
  { city: "Pune", state: "Maharashtra", code: "27", cluster: "Auto Hydraulics & Precision" },
  { city: "Nagpur", state: "Maharashtra", code: "27", cluster: "Agro-Processing & Freight" },
  { city: "Bengaluru", state: "Karnataka", code: "29", cluster: "Electronics & Tech Hardware" },
  { city: "Peenya", state: "Karnataka", code: "29", cluster: "Precision Tooling" },
  { city: "Coimbatore", state: "Tamil Nadu", code: "33", cluster: "Motors & Pump Sets" },
  { city: "Tirupur", state: "Tamil Nadu", code: "33", cluster: "Knitwear & Garment Exports" },
  { city: "Chennai", state: "Tamil Nadu", code: "33", cluster: "Automotive Ancillaries" },
  { city: "Ludhiana", state: "Punjab", code: "03", cluster: "Bicycles & Hosiery" },
  { city: "Moradabad", state: "Uttar Pradesh", code: "09", cluster: "Brassware & Metal Handicrafts" },
  { city: "Kanpur", state: "Uttar Pradesh", code: "09", cluster: "Leather & Footwear" },
  { city: "Noida", state: "Uttar Pradesh", code: "09", cluster: "Packaging & Light Industry" },
  { city: "Gurugram", state: "Haryana", code: "06", cluster: "Warehouse & Electricals" },
  { city: "Faridabad", state: "Haryana", code: "06", cluster: "Sheet Metal & Fabrication" },
  { city: "Jaipur", state: "Rajasthan", code: "08", cluster: "Gems & Block Textiles" },
  { city: "Hyderabad", state: "Telangana", code: "36", cluster: "Pharma Bulk Distribution" },
  { city: "Kolkata", state: "West Bengal", code: "19", cluster: "Steel Rolling & Plastics" }
];

const SECTOR_CATEGORIES = [
  "textile",
  "manufacturing",
  "retail",
  "services",
  "auto_ancillary",
  "fmcg_wholesale",
  "pharma_distribution",
  "plastics_packaging",
  "electronics_hardware",
  "food_processing"
];

const BUSINESS_PREFIXES = [
  "Shree", "Balaji", "Mahalaxmi", "Venkateshwara", "Precision", "Apex", "National", "Bharat",
  "Super", "Standard", "Everest", "Delta", "Metro", "Prime", "Universal", "Navkar", "Pioneer", "Sterling"
];

const BUSINESS_SUFFIXES = [
  "Enterprises", "Industries", "Trading Co.", "Solutions", "Manufacturing", "Corporation",
  "Logistics", "Textiles", "Fabrics", "Ancillaries", "Distributors", "Components", "Engineering"
];

// Helper to generate realistic GSTIN
function generateGstin(stateCode, panNumber) {
  const entity = randChoice(["1", "2", "3"]);
  const checkChar = randChoice(["1", "2", "3", "4", "5", "6", "7", "8", "9", "A", "B", "C"]);
  return `${stateCode}${panNumber}${entity}Z${checkChar}`;
}

// Helper to generate realistic PAN
function generatePan(lastName) {
  const first3 = "A" + String.fromCharCode(65 + randInt(0, 25)) + String.fromCharCode(65 + randInt(0, 25));
  const entityType = randChoice(["C", "P", "F"]); // Company, Person, Firm
  const letter = lastName ? lastName[0].toUpperCase() : "A";
  const num = String(randInt(1000, 9999));
  const last = String.fromCharCode(65 + randInt(0, 25));
  return `${first3}${entityType}${letter}${num}${last}`;
}

console.log("[Generator] Commencing synthesis of enterprise static datasets...");

// -------------------------------------------------------------------------
// 1. GENERATE BORROWERS (180 Entities)
// -------------------------------------------------------------------------
console.log("[Generator] Generating 180 MSME Borrowers...");
const borrowers = [];

// Benchmark Persona 1: Priya Sharma
const priyaId = new mongoose.Types.ObjectId("660000000000000000000001");
borrowers.push({
  _id: priyaId,
  borrowerId: "BOR-PRIYA-001",
  name: "Priya Sharma",
  mobile: "+919820192831",
  aadhaarVerified: true,
  businessName: "Priya Textiles Surat",
  businessCategory: "textile",
  udyamNumber: "UDYAM-GJ-01-001928",
  gstNumber: "24AABCP1928K1Z5",
  city: "Surat",
  state: "Gujarat",
  platformTrustScore: 98,
  activeApplications: [],
  createdAt: new Date("2025-01-10T10:00:00Z")
});

// Benchmark Persona 2: Ravi Verma
const raviId = new mongoose.Types.ObjectId("660000000000000000000002");
borrowers.push({
  _id: raviId,
  borrowerId: "BOR-RAVI-002",
  name: "Ravi Verma",
  mobile: "+919830281920",
  aadhaarVerified: true,
  businessName: "Verma General & Provision Stores",
  businessCategory: "retail",
  udyamNumber: "UDYAM-MH-02-004928",
  gstNumber: "27AABCV8910J1Z3",
  city: "Mumbai",
  state: "Maharashtra",
  platformTrustScore: 78,
  activeApplications: [],
  createdAt: new Date("2025-01-15T11:00:00Z")
});

// Benchmark Persona 3: Kumar Chandran
const kumarId = new mongoose.Types.ObjectId("660000000000000000000003");
borrowers.push({
  _id: kumarId,
  borrowerId: "BOR-KUMAR-003",
  name: "Kumar Chandran",
  mobile: "+919840392810",
  aadhaarVerified: false,
  businessName: "Chandran Freight & Logistics",
  businessCategory: "services",
  udyamNumber: "UDYAM-TN-03-009182",
  gstNumber: "33AABCC7192H1Z8",
  city: "Chennai",
  state: "Tamil Nadu",
  platformTrustScore: 12,
  activeApplications: [],
  createdAt: new Date("2025-01-20T12:00:00Z")
});

// Benchmark Persona 4: Amit Deshmukh
const amitId = new mongoose.Types.ObjectId("660000000000000000000004");
borrowers.push({
  _id: amitId,
  borrowerId: "BOR-AMIT-004",
  name: "Amit Deshmukh",
  mobile: "+919823011920",
  aadhaarVerified: true,
  businessName: "Deshmukh Precision Engineering Works",
  businessCategory: "manufacturing",
  udyamNumber: "UDYAM-MH-12-003829",
  gstNumber: "27AABCD1029K1Z4",
  city: "Pune",
  state: "Maharashtra",
  platformTrustScore: 68,
  activeApplications: [],
  createdAt: new Date("2024-11-05T09:00:00Z")
});

// Generate Remaining 176 Borrowers
for (let i = 5; i <= 180; i++) {
  const firstName = randChoice(INDIAN_FIRST_NAMES);
  const lastName = randChoice(INDIAN_LAST_NAMES);
  const name = `${firstName} ${lastName}`;
  const loc = randChoice(CITIES_AND_STATES);
  const category = randChoice(SECTOR_CATEGORIES);
  const pan = generatePan(lastName);
  const gstin = generateGstin(loc.code, pan);
  const bName = `${randChoice(BUSINESS_PREFIXES)} ${lastName} ${randChoice(BUSINESS_SUFFIXES)}`;
  const udyamState = loc.state.substring(0, 2).toUpperCase();
  const udyam = `UDYAM-${udyamState}-${String(randInt(1, 30)).padStart(2, '0')}-${String(randInt(100000, 999999))}`;

  borrowers.push({
    _id: new mongoose.Types.ObjectId(),
    borrowerId: `BOR-ENT-${String(i).padStart(3, '0')}`,
    name: name,
    mobile: `+919${randInt(100000000, 999999999)}`,
    aadhaarVerified: random() > 0.08,
    businessName: bName,
    businessCategory: category,
    udyamNumber: udyam,
    gstNumber: gstin,
    city: loc.city,
    state: loc.state,
    platformTrustScore: randInt(60, 99),
    activeApplications: [],
    createdAt: new Date(Date.now() - randInt(30, 400) * 86400000)
  });
}

// -------------------------------------------------------------------------
// 2. GENERATE LENDERS (150 Retail Lenders)
// -------------------------------------------------------------------------
console.log("[Generator] Generating 150 Retail Lenders strictly within RBI caps...");
const lenders = [];

// Benchmark Lender 1: Vikram Sethi
const vikramId = new mongoose.Types.ObjectId("660000000000000000000010");
lenders.push({
  _id: vikramId,
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
  activeInvestments: [],
  createdAt: new Date("2024-10-01T08:00:00Z")
});

// Benchmark Lender 2: Ananya Roy
const ananyaId = new mongoose.Types.ObjectId("660000000000000000000011");
lenders.push({
  _id: ananyaId,
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
  activeInvestments: [],
  createdAt: new Date("2024-10-15T09:00:00Z")
});

// Benchmark Lender 3: Karan Singhal
const karanId = new mongoose.Types.ObjectId("660000000000000000000012");
lenders.push({
  _id: karanId,
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
  activeInvestments: [],
  createdAt: new Date("2024-11-01T10:00:00Z")
});

for (let i = 4; i <= 150; i++) {
  const fName = randChoice(INDIAN_FIRST_NAMES);
  const lName = randChoice(INDIAN_LAST_NAMES);
  const risk = randChoice(["Conservative", "Moderate", "Moderate", "Aggressive"]);
  const denom = randChoice([1000, 5000, 25000, 50000]);
  const wallet = randInt(50000, 950000);
  const exposure = randInt(0, Math.min(wallet, 250000)); // Cap <= 10L

  lenders.push({
    _id: new mongoose.Types.ObjectId(),
    lenderId: `LEN-ENT-${String(i).padStart(3, '0')}`,
    name: `${fName} ${lName}`,
    email: `${fName.toLowerCase()}.${lName.toLowerCase()}${randInt(10, 99)}@investor.in`,
    mobile: `+919${randInt(100000000, 999999999)}`,
    riskAppetite: risk,
    sectorPreference: randChoice(["any", "manufacturing", "textile", "retail", "services"]),
    tenurePreference: randChoice([[3, 6, 12], [6, 12, 24], [12, 24, 36], [3, 6, 9, 12, 24, 36]]),
    denominationPreference: denom,
    walletBalance: wallet,
    totalExposure: exposure,
    activeInvestments: [],
    createdAt: new Date(Date.now() - randInt(60, 500) * 86400000)
  });
}

// -------------------------------------------------------------------------
// 3. GENERATE LOANS & REPAYMENTS (320 Loans across 8 Lifecycle States)
// -------------------------------------------------------------------------
console.log("[Generator] Synthesizing 320 Loan Applications across 8 lifecycle states...");
const loans = [];
const repayments = [];

// Benchmark Loan 1: Priya Sharma (Grade A ~810, LISTED)
const priyaLoanId = new mongoose.Types.ObjectId("660000000000000000000020");
const priyaRepayId = new mongoose.Types.ObjectId("660000000000000000000030");
borrowers[0].activeApplications.push(priyaLoanId);

const priyaLoan = {
  _id: priyaLoanId,
  applicationId: "LN-PRIYA-810",
  borrowerId: priyaId,
  loanAmount: 500000,
  tenure: 12,
  purpose: "Procurement of High-Grade Silk Fabrics & Loom Automation",
  businessCategory: "textile",
  interestRate: 13.5,
  acieScore: {
    total: 810,
    grade: "A",
    breakdown: { cashflow: 85, upi: 78, gst: 90, operational: 70, aaData: 65 },
    fraudFlags: [],
    confidence: "High",
    fraudRiskFlag: "None",
    dataCompleteness: 95,
    explainability: {
      positiveFactors: [
        "Consistent annual banking turnover > ₹34L with zero returns",
        "Strong debit-to-credit alignment with textile vendor category",
        "Punctual quarterly GST filings with verified ARNs",
        "Healthy average monthly balance of ₹2.85L (>50% of loan ticket)"
      ],
      negativeFactors: [],
      improvementTips: ["Maintain current credit growth trajectory to qualify for ₹15L tranche in Q3"]
    },
    forgeryResult: { forgeryGrade: "AUTHENTIC", forgeryReason: "Digital signatures and font typography consistent with HDFC e-statement standards." }
  },
  fundingStatus: {
    funded: 175000,
    target: 500000,
    percentFunded: 35,
    lenders: [
      { lenderId: vikramId, trancheId: "TR-VIK-01", amount: 50000, fundedAt: new Date("2025-01-11T10:30:00Z") },
      { lenderId: ananyaId, trancheId: "TR-ANA-01", amount: 50000, fundedAt: new Date("2025-01-11T11:00:00Z") }
    ]
  },
  repayment: priyaRepayId,
  status: "LISTED",
  createdAt: new Date("2025-01-11T10:00:00Z")
};
loans.push(priyaLoan);

repayments.push({
  _id: priyaRepayId,
  loanId: priyaLoanId,
  borrowerId: priyaId,
  status: "ACTIVE",
  outstandingPrincipal: 500000,
  totalRepayable: 537500,
  emiAmount: 44791,
  tenureMonths: 12,
  dpd: 0,
  penalInterestAccrued: 0,
  ewsFlags: [],
  collectionAttempts: [],
  createdAt: new Date("2025-01-11T10:00:00Z")
});

// Benchmark Loan 2: Ravi Verma (Grade C ~590, LISTED Caution)
const raviLoanId = new mongoose.Types.ObjectId("660000000000000000000021");
const raviRepayId = new mongoose.Types.ObjectId("660000000000000000000031");
borrowers[1].activeApplications.push(raviLoanId);

loans.push({
  _id: raviLoanId,
  applicationId: "LN-RAVI-590",
  borrowerId: raviId,
  loanAmount: 350000,
  tenure: 9,
  purpose: "Festival Inventory Working Capital (FMCG Stock)",
  businessCategory: "retail",
  interestRate: 19.5,
  acieScore: {
    total: 590,
    grade: "C",
    breakdown: { cashflow: 55, upi: 62, gst: 48, operational: 60, aaData: 50 },
    fraudFlags: ["GST Discrepancy: Declared ₹28L vs Bank Inward ₹41L (+46% Delta)", "2 Inward Cheque/NACH Bounces in last 120 days"],
    confidence: "Medium",
    fraudRiskFlag: "Caution",
    dataCompleteness: 82,
    explainability: {
      positiveFactors: ["High daily retail UPI transactions (>25/day)", "Established shop location with 6+ years vintage"],
      negativeFactors: ["Bank credits exceed declared GST turnover by 46.4% (potential unrecorded sales)", "Two EMI bounces identified in H2 statement"],
      improvementTips: ["Reconcile GSTR-3B filings with bank credits", "Maintain ₹1L minimum average balance to avoid NACH bounce fees"]
    },
    forgeryResult: { forgeryGrade: "AUTHENTIC", forgeryReason: "Authentic ICICI Bank PDF. Caution flag triggered strictly by behavioral and tax deltas." }
  },
  fundingStatus: {
    funded: 75000,
    target: 350000,
    percentFunded: 21,
    lenders: [
      { lenderId: karanId, trancheId: "TR-KAR-01", amount: 25000, fundedAt: new Date("2025-01-16T11:30:00Z") }
    ]
  },
  repayment: raviRepayId,
  status: "LISTED",
  createdAt: new Date("2025-01-16T11:00:00Z")
});

repayments.push({
  _id: raviRepayId,
  loanId: raviLoanId,
  borrowerId: raviId,
  status: "ACTIVE",
  outstandingPrincipal: 350000,
  totalRepayable: 388500,
  emiAmount: 43166,
  tenureMonths: 9,
  dpd: 0,
  penalInterestAccrued: 0,
  ewsFlags: [{ type: "BOUNCE_NARRATION", severity: "CAUTION", description: "2 ACH returns detected in bank statement", triggeredAt: new Date("2025-01-16T11:30:00Z") }],
  collectionAttempts: [],
  createdAt: new Date("2025-01-16T11:00:00Z")
});

// Benchmark Loan 3: Kumar Chandran (BLOCKED)
const kumarLoanId = new mongoose.Types.ObjectId("660000000000000000000022");
borrowers[2].activeApplications.push(kumarLoanId);

loans.push({
  _id: kumarLoanId,
  applicationId: "LN-KUMAR-FORGED",
  borrowerId: kumarId,
  loanAmount: 1200000,
  tenure: 24,
  purpose: "Fleet Expansion (Heavy Freight Vehicles)",
  businessCategory: "services",
  interestRate: 22.0,
  acieScore: {
    total: 310,
    grade: "DECLINED",
    breakdown: { cashflow: 15, upi: 30, gst: 40, operational: 50, aaData: 20 },
    fraudFlags: ["FORGED_DOCUMENT: Mixed fonts and layout anomalies in PDF", "Metadata Producer signature: Adobe Acrobat Pro (Cracked)"],
    confidence: "Low",
    fraudRiskFlag: "Block",
    dataCompleteness: 60,
    explainability: {
      positiveFactors: [],
      negativeFactors: ["Structural PDF tampering detected", "Font family mismatch between credit amounts and transaction dates"],
      improvementTips: ["Provide untampered original bank statements via Account Aggregator"]
    },
    forgeryResult: {
      forgeryGrade: "FORGED",
      forgeryReason: "Metadata reveals document created/modified with unverified PDF Editor tools ('Adobe Acrobat Pro Cracked Copy / PDF Editor Suite') shortly before upload. Font analysis detects 3 distinct mismatched font families ('helv', 'times-roman', 'courier', 'times-bold') interspersed across transaction line items. Numerical alignment anomalies detected in Credit column."
    }
  },
  fundingStatus: { funded: 0, target: 1200000, percentFunded: 0, lenders: [] },
  status: "BLOCKED",
  createdAt: new Date("2025-01-21T12:00:00Z")
});

// Benchmark Loan 4: Amit Deshmukh (Recovery: DELAYED / Restructuring)
const amitLoanId = new mongoose.Types.ObjectId("660000000000000000000023");
const amitRepayId = new mongoose.Types.ObjectId("660000000000000000000033");
borrowers[3].activeApplications.push(amitLoanId);

loans.push({
  _id: amitLoanId,
  applicationId: "LN-AMIT-710",
  borrowerId: amitId,
  loanAmount: 500000,
  tenure: 12,
  purpose: "Machinery Upgradation (CNC Lathe Machine)",
  businessCategory: "manufacturing",
  interestRate: 15.5,
  acieScore: {
    total: 710,
    grade: "B",
    breakdown: { cashflow: 72, upi: 70, gst: 75, operational: 68, aaData: 65 },
    fraudFlags: [],
    confidence: "High",
    fraudRiskFlag: "None",
    dataCompleteness: 90,
    explainability: {
      positiveFactors: ["Strong manufacturing client base", "Stable average monthly balance of ₹1.8L prior to quarter"],
      negativeFactors: ["Recent 30% contraction in automotive component orders"],
      improvementTips: ["Request temporary moratorium to bridge supply chain payment delays"]
    },
    forgeryResult: { forgeryGrade: "AUTHENTIC", forgeryReason: "Authentic SBI e-statement." }
  },
  fundingStatus: {
    funded: 500000,
    target: 500000,
    percentFunded: 100,
    lenders: [
      { lenderId: vikramId, trancheId: "TR-VIK-02", amount: 50000, fundedAt: new Date("2024-11-06T09:30:00Z") },
      { lenderId: ananyaId, trancheId: "TR-ANA-02", amount: 50000, fundedAt: new Date("2024-11-06T10:00:00Z") },
      { lenderId: karanId, trancheId: "TR-KAR-02", amount: 25000, fundedAt: new Date("2024-11-06T10:30:00Z") }
    ]
  },
  repayment: amitRepayId,
  status: "ACTIVE",
  createdAt: new Date("2024-11-06T09:00:00Z")
});

repayments.push({
  _id: amitRepayId,
  loanId: amitLoanId,
  borrowerId: amitId,
  status: "DELAYED",
  outstandingPrincipal: 416666,
  totalRepayable: 452000,
  emiAmount: 45241,
  tenureMonths: 12,
  dpd: 14,
  penalInterestAccrued: 2884,
  ewsFlags: [
    { type: "UPI_DROP", severity: "CAUTION", description: "32% drop in daily UPI collections over 7 consecutive days", triggeredAt: new Date("2025-01-08T10:00:00Z") },
    { type: "BALANCE_LOW", severity: "ALERT", description: "Average monthly balance fell below 10% of loan amount", triggeredAt: new Date("2025-01-12T14:30:00Z") }
  ],
  collectionAttempts: [
    { attemptDate: new Date("2025-01-05T08:00:00Z"), method: "NACH", outcome: "FAILED_INSUFFICIENT_FUNDS", amountAttempted: 45241 },
    { attemptDate: new Date("2025-01-08T10:00:00Z"), method: "NACH", outcome: "FAILED_INSUFFICIENT_FUNDS", amountAttempted: 45241 }
  ],
  restructurePlan: {
    option: "MORATORIUM",
    months: 2,
    status: "APPLIED",
    requestedAt: new Date("2025-01-14T11:00:00Z"),
    approvalPercentage: 0
  },
  createdAt: new Date("2024-11-06T09:00:00Z")
});

// -------------------------------------------------------------------------
// Distribute Remaining ~316 Loans across Risk Breakdown
// Target distribution:
// - 55% Prime & Standard (A: ~70, B: ~105)
// - 20% Subprime / Watchlist (C: ~64)
// - 10% Stage 2 Delinquent (DELAYED: ~32)
// - 8% Stage 3 Restructuring (AT_RISK / OTS: ~26)
// - 5% Stage 4 NPA Default (NPA: ~16)
// - 2% Forged / Blocked (BLOCKED: ~5)
// -------------------------------------------------------------------------

const TARGET_COUNTS = {
  PRIME_A: 70,
  STANDARD_B: 105,
  SUBPRIME_C: 64,
  DELAYED: 32,
  AT_RISK: 26,
  NPA: 16,
  BLOCKED: 5
};

const TENURES = [3, 6, 9, 12, 24, 36];
const PURPOSES = [
  "Raw Material Bulk Purchase & Inventory Stocking",
  "Procurement of Specialized CNC Machinery",
  "Working Capital for Festive Season Demand",
  "Factory Floor Upgradation & Automation",
  "Supplier Invoice Discounting Bridge",
  "Export Consignment Packing Credit",
  "Warehouse Expansion & Racking Systems",
  "Commercial Fleet Down Payment",
  "Solar Rooftop Installation for Power Savings",
  "Testing Lab Certification & QA Equipment"
];

let borrowerIdx = 4; // starting from 5th borrower
let loanCounter = 100;

function createLoan(category, targetStatus, forcedGrade) {
  const b = borrowers[borrowerIdx % borrowers.length];
  borrowerIdx++;

  const loanId = new mongoose.Types.ObjectId();
  const repayId = new mongoose.Types.ObjectId();
  const amount = randChoice([100000, 250000, 500000, 750000, 1000000, 1500000, 2000000, 3000000, 4500000]);
  const tenure = randChoice(TENURES);
  const purpose = randChoice(PURPOSES);

  let grade = forcedGrade;
  let score = 700;
  let fraudRiskFlag = "None";
  let fraudFlags = [];
  let interestRate = 14.5;

  if (grade === "A") {
    score = randInt(750, 880);
    interestRate = randChoice([12.5, 13.0, 13.5, 14.0]);
  } else if (grade === "B") {
    score = randInt(650, 749);
    interestRate = randChoice([14.5, 15.0, 15.5, 16.0, 16.5]);
  } else if (grade === "C") {
    score = randInt(550, 649);
    interestRate = randChoice([18.0, 18.5, 19.0, 19.5, 20.0]);
    fraudRiskFlag = "Caution";
    fraudFlags = [randChoice(["GST Turnover Variance >35%", "Elevated 90-day debit velocity", "1 NACH Return in Q3"])];
  } else if (grade === "DECLINED") {
    score = randInt(320, 520);
    interestRate = 24.0;
    fraudRiskFlag = "Block";
    fraudFlags = ["Corrupted PDF metadata", "Inconsistent font rendering across credit columns"];
  }

  // Fractional pooling simulation
  const trancheSize = 50000;
  const numTranches = Math.ceil(amount / trancheSize);
  const numAssignedLenders = Math.min(numTranches, randInt(2, 10));
  const assignedLenders = [];
  for (let k = 0; k < numAssignedLenders; k++) {
    const l = randChoice(lenders);
    assignedLenders.push({
      lenderId: l._id,
      trancheId: `TR-${l.lenderId.slice(-3)}-${k + 1}`,
      amount: trancheSize,
      fundedAt: new Date(Date.now() - randInt(5, 60) * 86400000)
    });
  }

  let fundingPercent = 100;
  let fundedAmount = amount;
  let appStatus = "ACTIVE";

  if (targetStatus === "LISTED") {
    appStatus = "LISTED";
    fundingPercent = randChoice([15, 30, 45, 60, 75, 90]);
    fundedAmount = Math.round(amount * (fundingPercent / 100));
  } else if (targetStatus === "BLOCKED") {
    appStatus = "BLOCKED";
    fundingPercent = 0;
    fundedAmount = 0;
  }

  const loanObj = {
    _id: loanId,
    applicationId: `LN-ENT-${loanCounter++}`,
    borrowerId: b._id,
    loanAmount: amount,
    tenure: tenure,
    purpose: purpose,
    businessCategory: b.businessCategory,
    interestRate: interestRate,
    acieScore: {
      total: score,
      grade: grade,
      breakdown: {
        cashflow: randInt(60, 95),
        upi: randInt(55, 90),
        gst: randInt(50, 95),
        operational: randInt(60, 85),
        aaData: randInt(50, 85)
      },
      fraudFlags: fraudFlags,
      confidence: grade === "A" ? "High" : grade === "B" ? "High" : "Medium",
      fraudRiskFlag: fraudRiskFlag,
      dataCompleteness: randInt(80, 98),
      explainability: {
        positiveFactors: [
          `Audited GST filings with regular returns in ${b.city}`,
          `Positive net cash buffer (>15% of annual receipts)`,
          `Clean UPI business transactions with zero circular hops`
        ],
        negativeFactors: fraudFlags,
        improvementTips: [
          `Maintain average daily balance above ₹${Math.round(amount * 0.15).toLocaleString('en-IN')}`,
          `Ensure vendor payments follow uniform electronic RTGS/NEFT trails`
        ]
      },
      forgeryResult: {
        forgeryGrade: targetStatus === "BLOCKED" ? "FORGED" : "AUTHENTIC",
        forgeryReason: targetStatus === "BLOCKED" 
          ? "Font analysis detects 3 distinct mismatched font families across transaction line items."
          : "Cryptographic structural hash matches verified bank generator."
      }
    },
    fundingStatus: {
      funded: fundedAmount,
      target: amount,
      percentFunded: fundingPercent,
      lenders: targetStatus === "BLOCKED" ? [] : assignedLenders
    },
    repayment: repayId,
    status: appStatus,
    createdAt: new Date(Date.now() - randInt(15, 300) * 86400000)
  };
  loans.push(loanObj);
  b.activeApplications.push(loanId);

  // Repayment Ledger Object
  if (targetStatus !== "BLOCKED") {
    const emi = Math.round((amount * (1 + (interestRate / 100) * (tenure / 12))) / tenure);
    let dpd = 0;
    let penal = 0;
    let repayStatus = "ACTIVE";
    let restructure = null;
    let recovery = null;

    if (targetStatus === "DELAYED") {
      repayStatus = "DELAYED";
      dpd = randInt(3, 28);
      penal = Math.round(amount * 0.18 * (dpd / 365));
    } else if (targetStatus === "AT_RISK") {
      repayStatus = "AT_RISK";
      dpd = randInt(32, 85);
      penal = Math.round(amount * 0.18 * (dpd / 365));
      const approval = randInt(30, 85);
      restructure = {
        option: randChoice(["OTS", "MORATORIUM", "TENURE_EXTENSION"]),
        proposedAmount: Math.round(amount * 0.70),
        status: approval >= 60 ? "APPROVED" : "PENDING_VOTE",
        approvalPercentage: approval,
        votingExpiresAt: new Date(Date.now() + 5 * 86400000)
      };
    } else if (targetStatus === "NPA") {
      repayStatus = "NPA";
      dpd = randInt(92, 210);
      penal = Math.round(amount * 0.18 * (dpd / 365));
      b.platformTrustScore = 0; // RBI rule: NPA sets trust to 0
      recovery = {
        classifiedNpaAt: new Date(Date.now() - (dpd - 90) * 86400000),
        totalRecovered: randChoice([0, Math.round(amount * 0.25)]),
        recoveryFee: 12500,
        netDistributed: 0
      };
    }

    const repayObj = {
      _id: repayId,
      loanId: loanId,
      borrowerId: b._id,
      status: repayStatus,
      outstandingPrincipal: Math.round(amount * 0.85),
      totalRepayable: emi * tenure,
      emiAmount: emi,
      tenureMonths: tenure,
      dpd: dpd,
      penalInterestAccrued: penal,
      ewsFlags: dpd > 0 ? [
        { type: "UPI_DROP", severity: "CAUTION", description: "Daily collection volume decline >30%", triggeredAt: new Date() }
      ] : [],
      collectionAttempts: dpd > 0 ? [
        { attemptDate: new Date(), method: "NACH", outcome: "FAILED_INSUFFICIENT_FUNDS", amountAttempted: emi }
      ] : [],
      restructurePlan: restructure,
      recovery: recovery,
      createdAt: loanObj.createdAt
    };
    repayments.push(repayObj);
  }
}

// Generate Batches
for (let i = 0; i < TARGET_COUNTS.PRIME_A; i++) createLoan("A", randChoice(["LISTED", "ACTIVE"]), "A");
for (let i = 0; i < TARGET_COUNTS.STANDARD_B; i++) createLoan("B", randChoice(["LISTED", "ACTIVE"]), "B");
for (let i = 0; i < TARGET_COUNTS.SUBPRIME_C; i++) createLoan("C", randChoice(["LISTED", "ACTIVE"]), "C");
for (let i = 0; i < TARGET_COUNTS.DELAYED; i++) createLoan("B", "DELAYED", "B");
for (let i = 0; i < TARGET_COUNTS.AT_RISK; i++) createLoan("C", "AT_RISK", "C");
for (let i = 0; i < TARGET_COUNTS.NPA; i++) createLoan("C", "NPA", "C");
for (let i = 0; i < TARGET_COUNTS.BLOCKED; i++) createLoan("DECLINED", "BLOCKED", "DECLINED");

console.log(`[Generator] Created ${loans.length} total loans and ${repayments.length} repayments.`);

// -------------------------------------------------------------------------
// 4. GENERATE REBIT AA STATEMENTS (25,000+ Sequential Transactions with OD/CC)
// -------------------------------------------------------------------------
console.log("[Generator] Generating ReBIT Account Aggregator statements (including Overdraft OD/CC facilities)...");
const rebitAccounts = [];
let totalTxCount = 0;

for (let b of borrowers) {
  const isOdAccount = random() > 0.40; // 60% Overdraft facilities
  const accNumber = `50100${randInt(100000000, 999999999)}`;
  const bank = randChoice(["HDFC Bank", "State Bank of India", "ICICI Bank", "Kotak Mahindra Bank", "Axis Bank"]);
  const sanctionLimit = isOdAccount ? randChoice([1500000, 2500000, 5000000]) : 0;
  const drawingPower = isOdAccount ? Math.round(sanctionLimit * 0.85) : 0;

  let currentBal = isOdAccount ? randInt(150000, 650000) : randInt(200000, 1200000);
  const txList = [];
  const numTx = randInt(120, 200); // ~150 tx per borrower = ~27,000 total tx

  let curDate = new Date("2025-04-01T09:00:00Z");

  for (let t = 0; t < numTx; t++) {
    curDate = new Date(curDate.getTime() + randInt(3600000 * 12, 3600000 * 48));
    if (curDate > new Date("2026-03-31T23:59:59Z")) break;

    const isCredit = random() > 0.48;
    const amount = isCredit ? randInt(15000, 250000) : randInt(8000, 180000);

    if (isCredit) {
      currentBal += amount;
    } else {
      currentBal -= amount;
    }

    const mode = randChoice(["UPI", "NEFT", "RTGS", "ACH", "IMPS", "CHQ"]);
    let narration = "";
    if (mode === "UPI") {
      narration = `UPI/${isCredit ? "CR" : "DR"}/${randInt(500000000, 599999999)}/${b.businessCategory}-pay@okbank`;
    } else if (mode === "RTGS" || mode === "NEFT") {
      narration = `${mode}/${isCredit ? "CR" : "DR"}/N${randInt(1000000, 9999999)}/VENDOR-SETTLEMENT`;
    } else if (mode === "ACH") {
      narration = `ACH/DR/NPCI-MND-${randInt(10000, 99999)}/EMI-COLLECTION`;
    } else {
      narration = `${mode}/${isCredit ? "CR" : "DR"}/CLG/CLEARING-HOUSE`;
    }

    txList.push({
      txnId: `TXN-${randInt(10000000, 99999999)}`,
      type: isCredit ? "CREDIT" : "DEBIT",
      mode: mode,
      amount: amount,
      currentBalance: currentBal,
      transactionTimestamp: curDate.toISOString(),
      valueDate: curDate.toISOString().split("T")[0],
      narration: narration,
      reference: `REF-${randInt(100000, 999999)}`
    });
    totalTxCount++;
  }

  rebitAccounts.push({
    account: {
      type: isOdAccount ? "OVERDRAFT" : "CURRENT",
      facility: isOdAccount ? "CASH_CREDIT_FACILITY" : "STANDARD_CURRENT",
      sanctionLimit: sanctionLimit,
      drawingPower: drawingPower,
      maskedAccNumber: `XXXXXXXX${accNumber.slice(-4)}`,
      version: "1.1",
      profile: {
        holders: {
          holder: [{
            name: b.name,
            businessName: b.businessName,
            mobile: b.mobile,
            pan: b.gstNumber.substring(2, 12),
            gstin: b.gstNumber
          }]
        }
      },
      summary: {
        currentBalance: currentBal,
        currency: "INR",
        balanceDateTime: "2026-03-31T23:59:59Z",
        type: isOdAccount ? "OVERDRAFT" : "CURRENT",
        branch: `${b.city} Industrial Estate Branch`,
        ifscCode: `${bank.substring(0, 4).toUpperCase()}0000${randInt(100, 999)}`
      },
      transactions: {
        startDate: "2025-04-01",
        endDate: "2026-03-31",
        transaction: txList
      }
    }
  });
}
console.log(`[Generator] Generated ${rebitAccounts.length} ReBIT account statements with ${totalTxCount} total transactions.`);

// -------------------------------------------------------------------------
// 5. GENERATE GST FILINGS (GSTR-1 & GSTR-3B)
// -------------------------------------------------------------------------
console.log("[Generator] Synthesizing GSTR-1 and GSTR-3B filings...");
const gstFilings = [];

for (let b of borrowers) {
  const annualTurnover = randInt(2500000, 15000000);
  const q1 = Math.round(annualTurnover * 0.24);
  const q2 = Math.round(annualTurnover * 0.26);
  const q3 = Math.round(annualTurnover * 0.28);
  const q4 = annualTurnover - q1 - q2 - q3;

  gstFilings.push({
    gstin: b.gstNumber,
    legalName: b.name,
    tradeName: b.businessName,
    financialYear: "2025-2026",
    filingStatus: b.platformTrustScore > 50 ? "REGULAR_COMPLIANT" : "LATE_FILER",
    declaredAnnualTurnover: annualTurnover,
    gstr1Summary: {
      b2bInvoicesCount: randInt(40, 120),
      b2csGrossSales: Math.round(annualTurnover * 0.35),
      hsnSummary: [
        { hsnCode: randChoice(["5208", "8481", "8708", "3004", "3923"]), taxableValue: annualTurnover, igst: Math.round(annualTurnover * 0.12) }
      ]
    },
    quarterlyFilings: [
      { quarter: "Q1", grossTurnover: q1, taxPaid: Math.round(q1 * 0.05), filedOnTime: true, arn: `AA${b.gstNumber.slice(0, 2)}0625${randInt(1000000, 9999999)}` },
      { quarter: "Q2", grossTurnover: q2, taxPaid: Math.round(q2 * 0.05), filedOnTime: true, arn: `AA${b.gstNumber.slice(0, 2)}0925${randInt(1000000, 9999999)}` },
      { quarter: "Q3", grossTurnover: q3, taxPaid: Math.round(q3 * 0.05), filedOnTime: true, arn: `AA${b.gstNumber.slice(0, 2)}1225${randInt(1000000, 9999999)}` },
      { quarter: "Q4", grossTurnover: q4, taxPaid: Math.round(q4 * 0.05), filedOnTime: b.platformTrustScore > 50, arn: `AA${b.gstNumber.slice(0, 2)}0326${randInt(1000000, 9999999)}` }
    ],
    businessCategory: b.businessCategory,
    verifiedByGSTN: true
  });
}

// -------------------------------------------------------------------------
// 6. GENERATE HIGH-DENSITY UPI DIRECTED GRAPH STREAM CSV (15,000+ Lines)
// -------------------------------------------------------------------------
console.log("[Generator] Synthesizing directed UPI graph transaction stream CSV (15,000+ edges)...");
const upiRows = ["transaction_id,timestamp,payer_vpa,payee_vpa,amount,category,status,ref_no"];

for (let i = 1; i <= 15000; i++) {
  const b = randChoice(borrowers);
  const isPayer = random() > 0.60;
  const vpa1 = `${b.name.toLowerCase().replace(/\s+/g, '')}@okaxis`;
  const vpa2 = `customer_${randInt(1000, 9999)}@upi`;
  const amount = randChoice([500, 1200, 2500, 5000, 8500, 15000, 25000, 48000, 75000]);
  const date = new Date(Date.now() - randInt(1, 180) * 86400000).toISOString();

  upiRows.push(`UPI${randInt(10000000, 99999999)},${date},${isPayer ? vpa1 : vpa2},${isPayer ? vpa2 : vpa1},${amount},${b.businessCategory},SUCCESS,REF${randInt(100000, 999999)}`);
}

// -------------------------------------------------------------------------
// 7. WRITE ALL FILES TO `data/` DIRECTORY
// -------------------------------------------------------------------------
console.log("[Generator] Serializing and writing files to data/ folder...");

fs.writeFileSync(path.join(DATA_DIR, 'enterprise_borrowers.json'), JSON.stringify(borrowers, null, 2));
fs.writeFileSync(path.join(DATA_DIR, 'enterprise_lenders.json'), JSON.stringify(lenders, null, 2));
fs.writeFileSync(path.join(DATA_DIR, 'enterprise_loans.json'), JSON.stringify(loans, null, 2));
fs.writeFileSync(path.join(DATA_DIR, 'enterprise_repayments.json'), JSON.stringify(repayments, null, 2));
fs.writeFileSync(path.join(DATA_DIR, 'enterprise_rebit_statements.json'), JSON.stringify(rebitAccounts, null, 2));
fs.writeFileSync(path.join(DATA_DIR, 'enterprise_gst_returns.json'), JSON.stringify(gstFilings, null, 2));
fs.writeFileSync(path.join(DATA_DIR, 'enterprise_upi_transactions.csv'), upiRows.join('\n'));

console.log("[Generator] Completed successfully! Generated summary:");
console.log(`  • Borrowers: ${borrowers.length}`);
console.log(`  • Lenders: ${lenders.length}`);
console.log(`  • Loans: ${loans.length}`);
console.log(`  • Repayments: ${repayments.length}`);
console.log(`  • ReBIT Accounts: ${rebitAccounts.length}`);
console.log(`  • Total ReBIT Transactions: ${totalTxCount}`);
console.log(`  • UPI Graph Transitions: ${upiRows.length - 1}`);
console.log(`  • All files written to: ${DATA_DIR}`);
