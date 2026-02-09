require('dotenv').config(); // Load environment variables
const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
const apiRoutes = require('./routes/api');

const app = express();
const port = process.env.PORT || 3000;

// Configuration CORS
const allowedOrigins = [
  'https://atlas-economique-sig-frontend.vercel.app', // Votre URL Vercel
  'http://localhost:5173',                       // Pour le développement local
  'http://localhost:3000'                        // Pour les tests locaux
];


// Swagger definition
const swaggerOptions = {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: 'Atlas Economique du Cameroun API',
      version: '1.0.0',
      description: 'API for Cameroon Economic Atlas, providing geographical and economic data.',
      contact: {
        name: 'GI26--Student',
        email: 'ntye.nina@gmail.com'
      }
    },
    servers: [
      {
        url: process.env.NODE_ENV === 'production'
          ? `https://atlas-economique-sig-backend/api` // Remplacez par votre URL réelle
          : `http://localhost:${port}/api`,
        description: process.env.NODE_ENV === 'production' ? 'Serveur de Production' : 'Serveur local'
      }
    ],
    servers: [
      {
        url: `http://localhost:${port}/api`,
        description: 'Local development server'
      }
    ]
  },
  apis: ['./routes/*.js'] // Path to the API docs
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Enable CORS for all routes
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Middleware to parse JSON bodies
app.use(express.json());

// Use the API routes
app.use('/api', apiRoutes);

// Error handling for unmatched routes (404)
app.use((req, res) => {
  res.status(404).json({
    error: 'Route non trouvée',
    path: req.path,
    method: req.method
  });
});

app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
  console.log(`Swagger docs available at http://localhost:${port}/api-docs`);
});