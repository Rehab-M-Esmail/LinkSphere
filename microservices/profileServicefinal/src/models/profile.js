const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  username: { type: String, required: true },
  bio: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Profile', profileSchema);
