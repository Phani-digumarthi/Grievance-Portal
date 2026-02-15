const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // In a real app, hash this!
  pincode: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  role: {
  type: String,
  enum: ['citizen', 'admin'],
  default: 'citizen'
}});

module.exports = mongoose.model('User', UserSchema);