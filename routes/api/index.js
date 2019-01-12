const router = require('express').Router();
const userRoutes = require('./auth');

// API routes
router.use('/auth', userRoutes);

module.exports = router;
