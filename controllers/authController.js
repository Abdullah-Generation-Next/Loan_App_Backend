const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Register
exports.register = async (req, res) => {
  try {
    const { fullName, mobileNumber, email, password } = req.body;

    if (!fullName || !mobileNumber || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const existingUser = await User.findOne({
      $or: [{ email }, { mobileNumber }],
    });

    if (existingUser) {
      return res.status(409).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      fullName,
      mobileNumber,
      email,
      password: hashedPassword,
    });

    const token = generateToken(user);

    return res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        mobileNumber: user.mobileNumber,
        email: user.email,
      },
    });
  } catch (err) {
    console.error('Register error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

// Login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = generateToken(user);

    return res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        mobileNumber: user.mobileNumber,
        email: user.email,
      },
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

// Get all users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select('-password') // Exclude password from response
      .sort({ createdAt: -1 });

    return res.status(200).json({
      message: 'Users fetched successfully',
      count: users.length,
      users,
    });
  } catch (err) {
    console.error('Get all users error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

// Update user
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { fullName, email, mobileNumber } = req.body;

    // Validate required fields
    if (!fullName || !email || !mobileNumber) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Check if user exists
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if email or mobileNumber is already taken by another user
    const existingUser = await User.findOne({
      _id: { $ne: id },
      $or: [{ email }, { mobileNumber }],
    });

    if (existingUser) {
      return res.status(409).json({ 
        message: 'Email or mobile number already exists' 
      });
    }

    // Update user
    user.fullName = fullName;
    user.email = email;
    user.mobileNumber = mobileNumber;

    await user.save();

    return res.status(200).json({
      message: 'User updated successfully',
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        mobileNumber: user.mobileNumber,
      },
    });
  } catch (err) {
    console.error('Update user error:', err);
    if (err.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid user ID' });
    }
    return res.status(500).json({ message: 'Server error' });
  }
};

const generateToken = (user) => {
  const payload = {
    id: user._id,
    email: user.email,
  };

  const secret = process.env.JWT_SECRET || 'supersecretjwtkeychangeit';
  const options = {
    expiresIn: '7d',
  };

  return jwt.sign(payload, secret, options);
};

