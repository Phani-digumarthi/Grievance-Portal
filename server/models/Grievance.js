const mongoose = require('mongoose');

const GrievanceSchema = new mongoose.Schema({
  citizenName: String,
  description: {
    type: String,
    required: false,
  },
  category: {
    type: String,
    default: 'General',
  },
  priority: {
    type: String,
    enum: ['High', 'Medium', 'Low', 'Immediate'],
    default: 'Medium',
  },
  area: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['Pending', 'Resolved', 'Spam'],
    default: 'Pending',
  },
  imageUrl: {
    type: String,
    default: null
  },
  audioUrl: {
    type: String,
    default: null
  },
  explanation: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Grievance', GrievanceSchema);