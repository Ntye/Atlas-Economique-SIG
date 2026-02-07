/**
 * Express API Server for Atlas Economique du Cameroun
 *
 * Run with: node server/index.js
 * Then start the Vite dev server: npm run dev
 */

const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
const apiRoutes = require('./routes/api.cjs');
app.use('/api', apiRoutes);

// In production, serve the built Vite files
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '..', 'dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'dist', 'index.html'));
  });
}

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Route non trouvee',
    path: req.path,
    method: req.method,
  });
});

// Start server
app.listen(port, () => {
  console.log('');
  console.log('=== ATLAS ECONOMIQUE DU CAMEROUN - API Server ===');
  console.log(`Server running on http://localhost:${port}`);
  console.log('');
  console.log('Available endpoints:');
  console.log(`  GET  http://localhost:${port}/api/health`);
  console.log(`  GET  http://localhost:${port}/api/regions`);
  console.log(`  GET  http://localhost:${port}/api/departements`);
  console.log(`  GET  http://localhost:${port}/api/filters`);
  console.log(`  GET  http://localhost:${port}/api/kpis`);
  console.log(`  GET  http://localhost:${port}/api/charts/top10/cacao`);
  console.log(`  GET  http://localhost:${port}/api/legend/cacao`);
  console.log(`  GET  http://localhost:${port}/api/search?q=douala`);
  console.log('');
});
