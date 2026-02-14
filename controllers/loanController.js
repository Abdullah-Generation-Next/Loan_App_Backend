const Loan = require('../models/Loan');

// Apply for loan
exports.applyLoan = async (req, res) => {
  try {
    const {
      fullName,
      mobileNumber,
      email,
      loanAmount,
      loanDurationMonths,
      loanPurpose,
      employmentType,
      monthlyIncome,
    } = req.body;

    if (
      !fullName ||
      !mobileNumber ||
      !email ||
      !loanAmount ||
      !loanDurationMonths ||
      !loanPurpose ||
      !employmentType ||
      !monthlyIncome
    ) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const loan = await Loan.create({
      user: req.user?.id || null,
      fullName,
      mobileNumber,
      email,
      loanAmount,
      loanDurationMonths,
      loanPurpose,
      employmentType,
      monthlyIncome,
    });

    // Populate user data in response
    await loan.populate('user', 'fullName email mobileNumber');

    return res.status(201).json({
      message: 'Loan application submitted successfully',
      loan,
    });
  } catch (err) {
    console.error('Loan apply error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

// Get all loans for authenticated user
exports.getUserLoans = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const loans = await Loan.find({ user: userId })
      .sort({ createdAt: -1 })
      .populate('user', 'fullName email mobileNumber');

    return res.status(200).json({
      message: 'Loans fetched successfully',
      count: loans.length,
      loans,
    });
  } catch (err) {
    console.error('Get user loans error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

// Get single loan by ID
exports.getLoanById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    const loan = await Loan.findById(id).populate('user', 'fullName email mobileNumber');

    if (!loan) {
      return res.status(404).json({ message: 'Loan not found' });
    }

    // Check if user owns this loan (if authenticated)
    if (userId && loan.user && loan.user.toString() !== userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    return res.status(200).json({
      message: 'Loan fetched successfully',
      loan,
    });
  } catch (err) {
    console.error('Get loan by ID error:', err);
    if (err.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid loan ID' });
    }
    return res.status(500).json({ message: 'Server error' });
  }
};

// Get all loans (for admin or public - optional)
exports.getAllLoans = async (req, res) => {
  try {
    const loans = await Loan.find()
      .sort({ createdAt: -1 })
      .populate('user', 'fullName email mobileNumber');

    return res.status(200).json({
      message: 'All loans fetched successfully',
      count: loans.length,
      loans,
    });
  } catch (err) {
    console.error('Get all loans error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};
