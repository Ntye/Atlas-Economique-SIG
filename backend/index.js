
const express = require('express');
const cors = require('cors');
const path = require('path');
const apiRoutes = require('./routes/api');

const app = express();
const port = process.env.PORT || 3000;

// Enable CORS for all routes
app.use(cors());

// Middleware to parse JSON bodies
app.use(express.json());

// Use the API routes
app.use('/api', apiRoutes);

app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
