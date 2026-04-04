// ============================================================
// server.js — Main entry point for Rakshak AI backend
// Sets up Express, MongoDB, Socket.io
// ============================================================

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const fitRoutes = require('./routes/fitRoutes');

const authRoutes = require('./routes/authRoutes');
const healthRoutes = require('./routes/healthRoutes');
const passportRoutes = require('./routes/passportRoutes');
const sosRoutes = require('./routes/sosRoutes');

const app = express();
const server = http.createServer(app); // Wrap express in HTTP server for Socket.io

// ─── Socket.io Setup ──────────────────────────────────────
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL,
    methods: ['GET', 'POST'],
  },
});

// Make io accessible in route handlers via req.io
app.set('io', io);

// ─── Socket.io Events ─────────────────────────────────────
io.on('connection', (socket) => {
  console.log(`🔌 New client connected: ${socket.id}`);

  // Client joins a personal room using their userId
  socket.on('join', (userId) => {
    socket.join(userId);
    console.log(`👤 User ${userId} joined their room`);
  });

  socket.on('disconnect', () => {
    console.log(`❌ Client disconnected: ${socket.id}`);
  });
});

// ─── Middleware ────────────────────────────────────────────
app.use(cors({ origin: process.env.CLIENT_URL }));
app.use(express.json());

// ─── Routes ───────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/health', healthRoutes);
app.use('/api/passport', passportRoutes);
app.use('/api/sos', sosRoutes);
app.use('/api/fit-data', fitRoutes);

// Health check route
app.get('/', (req, res) => res.json({ message: '🚀 Rakshak AI Backend Running' }));

// ─── MongoDB + Server Start ────────────────────────────────
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB Connected');
    server.listen(process.env.PORT, () => {
      console.log(`🚀 Server running on port ${process.env.PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB connection failed:', err.message);
    process.exit(1);
  });