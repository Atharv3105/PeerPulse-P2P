const express = require('express');
const router = express.Router();
const simulationEngine = require('../services/simulationEngine');

// POST /api/simulation/fast-forward
router.post('/fast-forward', async (req, res) => {
  try {
    const { days } = req.body;
    const result = await simulationEngine.fastForward(days || 30);
    
    // Broadcast live timeline advancement event
    const eventBus = require('../services/eventBus');
    eventBus.broadcast('timeline_advanced', {
      days: days || 30,
      simulatedDate: result.simulatedDate,
      daysOffset: result.daysOffset
    });

    res.json({
      success: true,
      message: `Successfully advanced timeline by ${days || 30} days`,
      ...result
    });
  } catch (err) {
    console.error('[Simulation Route] Fast-forward error:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/simulation/reset
router.post('/reset', async (req, res) => {
  try {
    const result = await simulationEngine.resetTimeline();
    res.json({
      success: true,
      ...result
    });
  } catch (err) {
    console.error('[Simulation Route] Reset error:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/simulation/status
router.get('/status', (req, res) => {
  res.json(simulationEngine.getStatus());
});

// GET /api/simulation/activity-feed
router.get('/activity-feed', (req, res) => {
  res.json({
    activities: simulationEngine.getActivityFeed()
  });
});

// POST /api/simulation/pulse-investment
router.post('/pulse-investment', async (req, res) => {
  try {
    const result = await simulationEngine.pulseInvestment();
    res.json({
      success: true,
      result
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
