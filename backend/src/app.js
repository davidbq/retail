const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const { addSecurityHeaders, rateLimiter } = require('./middlewares/security');
const healthCheckRoutes = require('./routes/healthCheck');
const databasesRoutes = require('./routes/databases');
const connectMongoClient = require('./config/database');

const app = express();

// Security middleware
app.use(helmet());
app.use(cors());
app.use(addSecurityHeaders);
app.use(rateLimiter);

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Attach the MongoDB client to request object middleware
app.use(async (req, res, next) => {
  req.mongoClient = await connectMongoClient();
  next();
});

// Routes
app.use('/health', healthCheckRoutes);
app.use('/databases', databasesRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Internal Server Error');
});

module.exports = app;
