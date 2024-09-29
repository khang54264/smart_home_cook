const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcrypt');

// Login route
router.post('/login', async (req, res) => {
    const { usernameOrEmail, password } = req.body;

    try {
        // Tìm kiếm người dùng bằng username hoặc email
        const user = await User.findOne({
            $or: [{ username: usernameOrEmail }, { email: usernameOrEmail }],
        });

        // Nếu không tìm thấy người dùng
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // So sánh mật khẩu đã mã hóa
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid password' });
        }

        // Kiểm tra role (chỉ cho phép đăng nhập nếu role = 0)
        if (user.role !== 0) {
            return res.status(403).json({ message: 'You do not have permission to access this' });
        }

        // Tạo token hoặc trả về token hiện tại
        const token = user.token || 'your-generated-token';  // Tạo token mới nếu cần
        user.token = token;
        await user.save();

        res.json({
            message: 'Login successful',
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role,
                token: user.token,
            },
        });
    } catch (error) {
        res.status(500).json({ message: 'Error during login' });
    }
});

// Create user
router.post('/create', async (req, res) => {
    try {
        const { username, password, name, email,  role, token } = req.body;
        const newUser = new User({
            username,
            password, // Hash password
            name,
            email,
            role: role || 1,   // Default role user (1)
            token: token || null // Token field 
        });
        await newUser.save();
        res.status(201).json(newUser);
    } catch (error) {
        res.status(500).json({ message: 'Error creating user' });
    }
});

// Delete user by ID
router.delete('/delete/:_id', async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params._id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting user' });
    }
});

// Get all users
router.get('/getall', async (req, res) => {
    const users = await User.find();
    res.json(users);
});

module.exports = router;
