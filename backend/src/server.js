require('dotenv').config();
const express    = require('express');
const http       = require('http');
const { Server } = require('socket.io');
const cors       = require('cors');
const helmet     = require('helmet');
const morgan     = require('morgan');
const rateLimit  = require('express-rate-limit');
const connectDB  = require('./config/database');
const errorHandler = require('./middleware/errorHandler');

const app    = express();
const server = http.createServer(app);

// ── Socket.IO ─────────────────────────────────────────────────────────────────
const io = new Server(server, {
  cors: { origin: process.env.CLIENT_URL || 'http://localhost:5173', methods: ['GET','POST'], credentials: true },
  pingInterval: 10000,
  pingTimeout: 5000,
});

// Track online users per role
const onlineUsers = {};   // userId → { role, socketId }
const roleCounts  = {};   // role → Set of userIds

io.on('connection', (socket) => {
  console.log(`🔌 Socket connected: ${socket.id}`);

  // User joins their own room + role room
  socket.on('join', ({ userId, role }) => {
    socket.join(`user:${userId}`);
    socket.join(`role:${role}`);
    onlineUsers[userId] = { role, socketId: socket.id };
    if (!roleCounts[role]) roleCounts[role] = new Set();
    roleCounts[role].add(userId);
    // Broadcast updated counts
    io.emit('online_counts', Object.fromEntries(Object.entries(roleCounts).map(([r,s])=>[r,s.size])));
    console.log(`👤 ${role} user ${userId} joined`);
  });

  // Entity-specific rooms
  socket.on('join_bank',     ({ bankId })     => socket.join(`bank:${bankId}`));
  socket.on('join_hospital', ({ hospitalId }) => socket.join(`hospital:${hospitalId}`));
  socket.on('join_request',  ({ requestId })  => socket.join(`request:${requestId}`));
  socket.on('join_delivery', ({ deliveryId }) => socket.join(`delivery:${deliveryId}`));

  // Live GPS from ambulance driver
  socket.on('driver_gps', ({ deliveryId, coordinates }) => {
    io.to(`delivery:${deliveryId}`).emit('delivery_location', { deliveryId, coordinates, timestamp: new Date() });
  });

  socket.on('disconnect', () => {
    const entry = Object.entries(onlineUsers).find(([,v]) => v.socketId === socket.id);
    if (entry) {
      const [uid, { role }] = entry;
      delete onlineUsers[uid];
      roleCounts[role]?.delete(uid);
      io.emit('online_counts', Object.fromEntries(Object.entries(roleCounts).map(([r,s])=>[r,s.size])));
    }
    console.log(`🔌 Disconnected: ${socket.id}`);
  });
});

app.set('io', io);

// Make SyncService available on req
const SyncService = require('./services/syncService');
app.set('sync', new SyncService(io));

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173', credentials: true }));
app.use(morgan(process.env.NODE_ENV === 'development' ? 'dev' : 'combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

const limiter     = rateLimit({ windowMs: 15*60*1000, max: 300 });
const authLimiter = rateLimit({ windowMs: 15*60*1000, max: 30 });
app.use('/api', limiter);
app.use('/api/auth', authLimiter);

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/auth', require('./routes/auth'));
app.use('/api',      require('./routes/api'));

app.get('/health', (req, res) => res.json({ status: 'OK', service: 'BloodLink API', online: Object.keys(onlineUsers).length }));
app.use('*', (req, res) => res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` }));
app.use(errorHandler);

// ── Start ─────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
const start = async () => {
  await connectDB();
  server.listen(PORT, () => {
    console.log(`\n🚀 BloodLink API → port ${PORT}`);
    console.log(`📡 Socket.IO ready\n`);
  });
};
start();

module.exports = { app, io };
