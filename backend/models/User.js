const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    username: { type: String, required: true },
    password: { type: String, required: true },
    name: { type: String, default: 'User' },
    email: { type: String, required: true },
    time_created: { type: Date, default: Date.now },  // Ghi lại ngày tạo tài khoản
    role: { type: Number, default: 1 },  // 0 for admin, 1 for user
    token: { type: String, default: null }  // Token để phân quyền (nếu cần trong tương lai)
});

module.exports = mongoose.model('User', UserSchema);