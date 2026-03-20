const express = require('express');
const router = express.Router();
const dockerService = require('../services/docker');

router.get('/list', async (req, res) => {
  try {
    const result = await dockerService.getContainerList();
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/start/:id', async (req, res) => {
  try {
    const result = await dockerService.startContainer(req.params.id);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/stop/:id', async (req, res) => {
  try {
    const result = await dockerService.stopContainer(req.params.id);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/restart/:id', async (req, res) => {
  try {
    const result = await dockerService.restartContainer(req.params.id);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
