const express = require('express');
const router = express.Router();
const webhookSimulator = require('../services/webhookSimulator');

// GET /api/webhooks/events - Get list of recent webhook events
router.get('/events', (req, res) => {
  res.json({ events: webhookSimulator.getRecentWebhooks() });
});

// POST /api/webhooks/aa/consent-request - Create Account Aggregator consent
router.post('/aa/consent-request', (req, res) => {
  const result = webhookSimulator.createAAConsentRequest(req.body);
  res.json(result);
});

// POST /api/webhooks/aa/consent-approve - Simulate user approving consent on mobile app
router.post('/aa/consent-approve', (req, res) => {
  const result = webhookSimulator.approveAAConsent(req.body);
  res.json(result);
});

// POST /api/webhooks/enach/create-mandate - Generate NPCI e-NACH mandate
router.post('/enach/create-mandate', (req, res) => {
  const result = webhookSimulator.createEnachMandate(req.body);
  res.json(result);
});

// POST /api/webhooks/enach/simulate-sweep - Simulate auto-debit NACH clearing sweep
router.post('/enach/simulate-sweep', async (req, res) => {
  const result = await webhookSimulator.simulateNachSweep(req.body);
  res.json(result);
});

module.exports = router;
