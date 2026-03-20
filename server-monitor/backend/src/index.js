const express = require('express');
const cors = require('cors');
const { createServer } = require('http');
const { Server } = require('socket.io');
const systemService = require('./services/system');

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
    methods: ['GET', 'POST'],
    credentials: true
  },
  path: '/socket.io',
  transports: ['websocket', 'polling']
});

app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true
}));
app.use(express.json());

// Routes
app.use('/api/system', require('./routes/system'));
app.use('/api/process', require('./routes/process'));
app.use('/api/container', require('./routes/container'));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// WebSocket connection
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  let intervalId;

  socket.on('startMonitoring', () => {
    console.log('Starting monitoring for client:', socket.id);

    // 立即发送一次数据
    sendMonitoringData(socket);

    // 然后每2秒发送
    intervalId = setInterval(() => {
      sendMonitoringData(socket);
    }, 2000);
  });

  socket.on('stopMonitoring', () => {
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }
  });

  socket.on('disconnect', () => {
    if (intervalId) {
      clearInterval(intervalId);
    }
    console.log('Client disconnected:', socket.id);
  });
});

async function sendMonitoringData(socket) {
  try {
    const [cpu, memory, disk, network] = await Promise.all([
      systemService.getCpuUsage(),
      systemService.getMemoryUsage(),
      systemService.getDiskUsage(),
      systemService.getNetworkStatus()
    ]);

    socket.emit('monitoringData', { cpu, memory, disk, network });
  } catch (error) {
    console.error('Error getting monitoring data:', error);
    socket.emit('error', error.message);
  }
}

const PORT = process.env.PORT || 3033;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`API: http://localhost:${PORT}/api`);
  console.log(`WebSocket: ws://localhost:${PORT}/socket.io`);
});
