const express = require('express');
const router = express.Router();
const processService = require('../services/process');

router.get('/list', async (req, res) => {
  try {
    const processes = await processService.getProcessList();
    res.json({ processes });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/kill', async (req, res) => {
  try {
    const { pid, signal } = req.body;
    if (!pid) {
      return res.status(400).json({ error: 'PID is required' });
    }
    const result = await processService.killProcess(pid, signal);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
