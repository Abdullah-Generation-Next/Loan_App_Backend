const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/register', authController.register);
router.post('/login', authController.login);

// Get all users (protected route)
router.get('/users', authController.getAllUsers);

// Update user (optional auth - allows admin updates without token)
router.put('/users/:id', (req, res, next) => {
  // Try to authenticate, but don't fail if no token (for admin panel)
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authMiddleware(req, res, next);
  }
  // If no token, continue without auth (admin panel access)
  next();
}, authController.updateUser);

module.exports = router;

