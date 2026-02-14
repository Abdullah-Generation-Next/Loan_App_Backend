const express = require('express');
const router = express.Router();
const loanController = require('../controllers/loanController');
const authMiddleware = require('../middleware/authMiddleware');

// Protected loan apply route (requires Bearer token)
router.post('/apply', authMiddleware, loanController.applyLoan);

// Get all loans (optional - for admin, must be before /:id route)
router.get('/all/list', loanController.getAllLoans);

// Get all loans for authenticated user
router.get('/', authMiddleware, loanController.getUserLoans);

// Get single loan by ID (must be last to avoid route conflicts)
router.get('/:id', authMiddleware, loanController.getLoanById);

module.exports = router;

