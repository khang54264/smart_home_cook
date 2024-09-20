const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Create user
router.post('/create', async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const newUser = new User({ username, email, password });
        await newUser.save();
        res.status(201).json(newUser);
    } catch (error) {
        res.statusCode(500).json({message:'Error creating user'})
    }
    
    
});

// Delete user by ID
router.delete('/:id', async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting user' });
    }
});

// Get all users
router.get('/', async (req, res) => {
    const users = await User.find();
    res.json(users);
});

module.exports = router;
