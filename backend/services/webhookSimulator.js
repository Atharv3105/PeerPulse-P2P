const { v4: uuidv4 } = require('uuid');

// In-memory buffer of recent webhook events
const recentEvents = [
  {
    eventId: 'evt_' + uuidv4().slice(0, 8),
    eventType: 'enach.mandate.authorized',
    provider: 'NPCI',
    timestamp: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
    status: 'DELIVERED',
    data: {
      umrn: 'NACH0000000049281',
      borrowerId: 'BOR-PRIYA-001',
      maxAmount: 50000,
      frequency: 'MNTH',
      status: 'ACTIVE'
    }
  },
  {
    eventId: 'evt_' + uuidv4().slice(0, 8),
    eventType: 'account_aggregator.consent.approved',
    provider: 'SETU_AA',
    timestamp: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
    status: 'DELIVERED',
    data: {
      consentHandle: 'CON-SETU-98421A',
      customerVpa: 'priya@okhdfcbank',
      accountsLinked: 2,
      dataFlow: 'STREAMING'
    }
  }
];

function logWebhookEvent(eventType, provider, data) {
  const evt = {
    eventId: 'evt_' + uuidv4().slice(0, 8),
    eventType,
    provider,
    timestamp: new Date().toISOString(),
    status: 'DELIVERED',
    data
  };
  recentEvents.unshift(evt);
  if (recentEvents.length > 50) {
    recentEvents.pop();
  }
  return evt;
}

function getRecentWebhooks() {
  return recentEvents;
}

/**
 * Simulates creation of an Account Aggregator Consent Request (Setu / OneMoney)
 */
function createAAConsentRequest({ borrowerId, customerVpa, phone }) {
  const consentHandle = 'CON-SETU-' + Math.random().toString(36).substring(2, 9).toUpperCase();
  const payload = {
    consentHandle,
    borrowerId: borrowerId || 'BOR-PRIYA-001',
    customerVpa: customerVpa || 'priya@okhdfcbank',
    phone: phone || '+91 98765 43210',
    status: 'PENDING_USER_APPROVAL',
    fiTypes: ['DEPOSIT', 'TERM_DEPOSIT'],
    consentExpiry: new Date(Date.now() + 1000 * 60 * 60 * 24 * 365).toISOString(),
    redirectUrl: 'https://peerpulse.fintech/aa/callback?consentHandle=' + consentHandle
  };

  logWebhookEvent('account_aggregator.consent.requested', 'SETU_AA', payload);
  return payload;
}

/**
 * Simulates user approving consent on their mobile banking AA app
 */
function approveAAConsent({ consentHandle }) {
  const payload = {
    consentHandle: consentHandle || 'CON-SETU-DEMO',
    status: 'ACTIVE',
    approvedAt: new Date().toISOString(),
    rebitFiDataReady: true,
    totalTransactionsIngested: 28683,
    institutions: [
      { fipId: 'HDFC-FIP', accountMasked: 'XXXX-XXXX-4819', balance: 412500 },
      { fipId: 'ICICI-FIP', accountMasked: 'XXXX-XXXX-9022', balance: 145000 }
    ]
  };

  logWebhookEvent('account_aggregator.consent.approved', 'SETU_AA', payload);
  return payload;
}

/**
 * Simulates NPCI e-NACH Mandate Registration
 */
function createEnachMandate({ borrowerId, accountNumber, ifsc, maxAmount }) {
  const umrn = 'NACH' + Math.floor(100000000000 + Math.random() * 900000000000);
  const payload = {
    umrn,
    borrowerId: borrowerId || 'BOR-PRIYA-001',
    accountNumber: accountNumber || '50100429184021',
    ifsc: ifsc || 'HDFC0001234',
    maxAmount: maxAmount || 50000,
    frequency: 'MNTH',
    destinationBank: 'HDFC Bank Ltd',
    status: 'ACTIVE',
    sponsorBank: 'IDFC First Bank (Escrow Trustee)'
  };

  logWebhookEvent('enach.mandate.authorized', 'NPCI_MANDATE', payload);
  return payload;
}

/**
 * Simulates an automated monthly NACH debit sweep
 */
async function simulateNachSweep({ loanId, amount, isSuccess = true }) {
  const sweepId = 'SWP-' + Math.random().toString(36).substring(2, 8).toUpperCase();
  const eventType = isSuccess ? 'enach.sweep.success' : 'enach.sweep.failed';
  
  const payload = {
    sweepId,
    loanId: loanId || 'LN-PRIYA-810',
    amount: amount || 4479,
    settlementDate: new Date().toISOString(),
    escrowAccount: 'IDFC-TRUSTEE-ESCROW-P2P',
    failureReason: isSuccess ? null : 'INSUFFICIENT_FUNDS (NACH Reason Code: 02)'
  };

  logWebhookEvent(eventType, 'NPCI_NACH_CLEARING', payload);
  return payload;
}

module.exports = {
  getRecentWebhooks,
  createAAConsentRequest,
  approveAAConsent,
  createEnachMandate,
  simulateNachSweep,
  logWebhookEvent
};
