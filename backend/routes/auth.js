const express = require('express');
const router = express.Router();
const Borrower = require('../models/Borrower');
const Lender = require('../models/Lender');
const LoanApplication = require('../models/LoanApplication');
const { v4: uuidv4 } = require('uuid');

// GET /api/auth/personas - Switcher list for demo evaluators
router.get('/personas', async (req, res) => {
  try {
    const borrowers = await Borrower.find().populate('activeApplications');
    const lenders = await Lender.find();
    res.json({
      borrowers: borrowers.map(b => ({
        id: b._id,
        borrowerId: b.borrowerId,
        name: b.name,
        businessName: b.businessName,
        category: b.businessCategory,
        trustScore: b.platformTrustScore,
        applications: b.activeApplications
      })),
      lenders: lenders.map(l => ({
        id: l._id,
        lenderId: l.lenderId,
        name: l.name,
        email: l.email,
        riskAppetite: l.riskAppetite,
        sectorPreference: l.sectorPreference,
        denominationPreference: l.denominationPreference,
        walletBalance: l.walletBalance,
        totalExposure: l.totalExposure,
        investmentsCount: l.activeInvestments?.length || 0
      }))
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/auth/borrower/:id
router.get('/borrower/:id', async (req, res) => {
  try {
    const borrower = await Borrower.findOne({
      $or: [{ borrowerId: req.params.id }, { _id: req.params.id.match(/^[0-9a-fA-F]{24}$/) ? req.params.id : null }]
    }).populate('activeApplications');

    if (!borrower) return res.status(404).json({ error: 'Borrower not found' });
    res.json(borrower);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/auth/lender/:id
router.get('/lender/:id', async (req, res) => {
  try {
    const lender = await Lender.findOne({
      $or: [{ lenderId: req.params.id }, { _id: req.params.id.match(/^[0-9a-fA-F]{24}$/) ? req.params.id : null }]
    }).populate('activeInvestments.loanId');

    if (!lender) return res.status(404).json({ error: 'Lender not found' });
    res.json(lender);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/auth/lender/onboard - 4-step lender onboarding
router.post('/lender/onboard', async (req, res) => {
  try {
    const {
      name,
      email,
      mobile,
      riskAppetite,
      sectorPreference,
      tenurePreference,
      denominationPreference,
      walletTopUp
    } = req.body;

    const lenderId = `LEN-${uuidv4().substring(0, 8)}`;
    const lender = await Lender.create({
      lenderId,
      name: name || 'Retail Investor',
      email: email || 'investor@peerpulse.in',
      mobile: mobile || '+919811122233',
      riskAppetite: riskAppetite || 'Moderate',
      sectorPreference: sectorPreference || 'any',
      tenurePreference: tenurePreference || [3, 6, 12],
      denominationPreference: denominationPreference || 25000,
      walletBalance: Number(walletTopUp || 200000),
      totalExposure: 0,
      activeInvestments: []
    });

    res.status(201).json(lender);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/auth/login - Unified credentials, OTP, and 1-click persona login
router.post('/login', async (req, res) => {
  try {
    const { identifier, password, role, personaId, otp } = req.body;

    // 1. Instant 1-Click Persona Login
    if (personaId) {
      if (personaId === 'admin-ops') {
        return res.json({
          user: {
            id: 'admin-ops',
            name: 'Risk Operations Admin',
            email: 'risk.ops@peerpulse.in',
            role: 'admin'
          },
          token: 'mock-jwt-admin-token'
        });
      }

      if (personaId === 'NBFC-BAJAJ-01') {
        return res.json({
          user: {
            id: 'NBFC-BAJAJ-01',
            name: 'Bajaj Finserv NBFC',
            businessName: 'Bajaj Finserv Priority Co-Lending Desk',
            email: 'co-lending@bajajfinserv.in',
            role: 'institutional'
          },
          token: 'mock-jwt-nbfc-token'
        });
      }

      if (personaId.startsWith('BOR-')) {
        const borrower = await Borrower.findOne({ borrowerId: personaId });
        if (borrower) {
          return res.json({
            user: {
              id: borrower._id,
              borrowerId: borrower.borrowerId,
              name: borrower.name,
              businessName: borrower.businessName,
              category: borrower.businessCategory,
              mobile: borrower.mobile,
              trustScore: borrower.platformTrustScore,
              role: 'borrower'
            },
            token: `mock-jwt-borrower-${borrower.borrowerId}`
          });
        }
      }

      if (personaId.startsWith('LEN-')) {
        const lender = await Lender.findOne({ lenderId: personaId });
        if (lender) {
          return res.json({
            user: {
              id: lender._id,
              lenderId: lender.lenderId,
              name: lender.name,
              email: lender.email,
              mobile: lender.mobile,
              riskAppetite: lender.riskAppetite,
              walletBalance: lender.walletBalance,
              role: 'lender'
            },
            token: `mock-jwt-lender-${lender.lenderId}`
          });
        }
      }
    }

    // 2. Standard Credentials / OTP Login
    if (!identifier) {
      return res.status(400).json({ error: 'Mobile number, email, or user ID required' });
    }

    const cleanIdentifier = identifier.trim();

    // Check if Admin
    if (cleanIdentifier.toLowerCase() === 'admin' || cleanIdentifier.toLowerCase() === 'admin@peerpulse.in') {
      return res.json({
        user: {
          id: 'admin-ops',
          name: 'Risk Operations Admin',
          email: 'risk.ops@peerpulse.in',
          role: 'admin'
        },
        token: 'mock-jwt-admin-token'
      });
    }

    // Check Borrowers (by mobile, borrowerId, or email)
    const borrower = await Borrower.findOne({
      $or: [
        { mobile: cleanIdentifier },
        { mobile: cleanIdentifier.startsWith('+91') ? cleanIdentifier : `+91${cleanIdentifier}` },
        { borrowerId: cleanIdentifier.toUpperCase() },
        { gstNumber: cleanIdentifier.toUpperCase() }
      ]
    });

    if (borrower) {
      return res.json({
        user: {
          id: borrower._id,
          borrowerId: borrower.borrowerId,
          name: borrower.name,
          businessName: borrower.businessName,
          category: borrower.businessCategory,
          mobile: borrower.mobile,
          trustScore: borrower.platformTrustScore,
          role: 'borrower'
        },
        token: `mock-jwt-borrower-${borrower.borrowerId}`
      });
    }

    // Check Lenders (by mobile, email, or lenderId)
    const lender = await Lender.findOne({
      $or: [
        { mobile: cleanIdentifier },
        { mobile: cleanIdentifier.startsWith('+91') ? cleanIdentifier : `+91${cleanIdentifier}` },
        { email: cleanIdentifier.toLowerCase() },
        { lenderId: cleanIdentifier.toUpperCase() }
      ]
    });

    if (lender) {
      return res.json({
        user: {
          id: lender._id,
          lenderId: lender.lenderId,
          name: lender.name,
          email: lender.email,
          mobile: lender.mobile,
          riskAppetite: lender.riskAppetite,
          walletBalance: lender.walletBalance,
          role: 'lender'
        },
        token: `mock-jwt-lender-${lender.lenderId}`
      });
    }

    // If identifier looks like a phone and test OTP is 123456, allow quick guest onboarding
    if (/^\+?[0-9]{10,13}$/.test(cleanIdentifier) && (!otp || otp === '123456')) {
      const defaultBorrower = await Borrower.findOne();
      if (defaultBorrower) {
        return res.json({
          user: {
            id: defaultBorrower._id,
            borrowerId: defaultBorrower.borrowerId,
            name: defaultBorrower.name,
            businessName: defaultBorrower.businessName,
            role: 'borrower'
          },
          token: `mock-jwt-borrower-guest`
        });
      }
    }

    return res.status(401).json({ error: 'User not found. Please register or select an instant demo persona.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/auth/register/borrower
router.post('/register/borrower', async (req, res) => {
  try {
    const { name, businessName, businessCategory, mobile, gstNumber, udyamNumber } = req.body;

    if (!name || !businessName || !mobile) {
      return res.status(400).json({ error: 'Name, Business Name, and Mobile are required' });
    }

    const count = await Borrower.countDocuments();
    const borrowerId = `BOR-NEW-${String(count + 1).padStart(3, '0')}`;

    const newBorrower = await Borrower.create({
      borrowerId,
      name,
      businessName,
      businessCategory: businessCategory || 'retail',
      mobile: mobile.startsWith('+91') ? mobile : `+91${mobile}`,
      gstNumber: gstNumber || `27AABC${Math.floor(1000 + Math.random() * 9000)}K1Z5`,
      udyamNumber: udyamNumber || `UDYAM-MH-01-${Math.floor(100000 + Math.random() * 900000)}`,
      aadhaarVerified: true,
      platformTrustScore: 85,
      activeApplications: []
    });

    res.status(201).json({
      user: {
        id: newBorrower._id,
        borrowerId: newBorrower.borrowerId,
        name: newBorrower.name,
        businessName: newBorrower.businessName,
        category: newBorrower.businessCategory,
        mobile: newBorrower.mobile,
        trustScore: newBorrower.platformTrustScore,
        role: 'borrower'
      },
      token: `mock-jwt-borrower-${newBorrower.borrowerId}`
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/auth/register/lender
router.post('/register/lender', async (req, res) => {
  try {
    const { name, email, mobile, riskAppetite, sectorPreference, initialDeposit } = req.body;

    if (!name || !email || !mobile) {
      return res.status(400).json({ error: 'Name, Email, and Mobile are required' });
    }

    const count = await Lender.countDocuments();
    const lenderId = `LEN-NEW-${String(count + 1).padStart(3, '0')}`;

    const newLender = await Lender.create({
      lenderId,
      name,
      email: email.toLowerCase(),
      mobile: mobile.startsWith('+91') ? mobile : `+91${mobile}`,
      riskAppetite: riskAppetite || 'Moderate',
      sectorPreference: sectorPreference || 'any',
      tenurePreference: [3, 6, 12],
      denominationPreference: 25000,
      walletBalance: Number(initialDeposit || 200000),
      totalExposure: 0,
      activeInvestments: []
    });

    res.status(201).json({
      user: {
        id: newLender._id,
        lenderId: newLender.lenderId,
        name: newLender.name,
        email: newLender.email,
        mobile: newLender.mobile,
        riskAppetite: newLender.riskAppetite,
        walletBalance: newLender.walletBalance,
        role: 'lender'
      },
      token: `mock-jwt-lender-${newLender.lenderId}`
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/auth/me
router.get('/me', async (req, res) => {
  res.json({ message: 'Auth service operational' });
});

module.exports = router;
