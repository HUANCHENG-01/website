const express = require('express');
const router = express.Router();
const systemService = require('../services/system');

router.get('/info', async (req, res) => {
  try {
    const info = await systemService.getSystemInfo();
    res.json(info);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/cpu', async (req, res) => {
  try {
    const cpu = await systemService.getCpuUsage();
    res.json(cpu);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/memory', async (req, res) => {
  try {
    const memory = await systemService.getMemoryUsage();
    res.json(memory);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/disk', async (req, res) => {
  try {
    const disk = await systemService.getDiskUsage();
    res.json(disk);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/network', async (req, res) => {
  try {
    const network = await systemService.getNetworkStatus();
    res.json(network);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
