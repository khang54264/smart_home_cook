const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    username: String,
    email: String,
    password: String,
    role: { type: String, default: 'user' } // 'admin' for admins
});

module.exports = mongoose.model('User', UserSchema);