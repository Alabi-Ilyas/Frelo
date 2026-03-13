// controllers/UserController.js
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.register = async (req, res) => {
  try {
    const { fullName, email, password } = req.body;

    
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: "User exists" });

    const hashed = await bcrypt.hash(password, 10);

    const user = await User.create({ fullName, email, password: hashed });

    res.status(201).json({ message: "User created", userId: user._id });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ message: "Invalid password" });

    const token = jwt.sign({ id: user._id }, "SECRET_KEY", { expiresIn: "7d" });

    res.json({ message: "Logged in", token, userId: user._id, fullName: user.fullName });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  // Normally send email code here
  res.json({ message: "Reset code sent (mock)" });
};

exports.changePassword = async (req, res) => {
  const { userId, newPassword } = req.body;
  const hashed = await bcrypt.hash(newPassword, 10);
  await User.findByIdAndUpdate(userId, { password: hashed });
  res.json({ message: "Password changed successfully" });
};
