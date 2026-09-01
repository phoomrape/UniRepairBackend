const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const locationRoutes = require('./routes/locationRoutes');
const userRoutes = require('./routes/userRoutes');
const repairRoutes = require('./routes/repairRoutes');
const statsRoutes = require('./routes/statsRoutes');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static uploads
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Serve compiled static frontend (Target A: Railway Single-Container Production)
const publicPath = path.join(__dirname, '../public');
app.use(express.static(publicPath));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/locations', locationRoutes);
app.use('/api/users', userRoutes);
app.use('/api/repairs', repairRoutes);
app.use('/api/stats', statsRoutes);

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'UniRepair API Server is running smoothly' });
});

// Database Health Check (Debug DB Connection)
app.get('/api/health/db', async (req, res) => {
  try {
    const prisma = require('./config/prisma');
    const userCount = await prisma.user.count();
    const locationCount = await prisma.location.count();
    const categoryCount = await prisma.repairCategory.count();
    res.json({
      success: true,
      database: 'connected',
      counts: { users: userCount, locations: locationCount, categories: categoryCount }
    });
  } catch (error) {
    console.error('Database connection error:', error);
    res.status(500).json({
      success: false,
      database: 'error',
      message: error.message,
      code: error.code,
      meta: error.meta
    });
  }
});

// SPA Fallback for Single-Container Production
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) {
    return next();
  }
  const indexPath = path.join(publicPath, 'index.html');
  if (require('fs').existsSync(indexPath)) {
    return res.sendFile(indexPath);
  }
  next();
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err);
  res.status(err.status || 500).json({
    message: err.message || 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์'
  });
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
