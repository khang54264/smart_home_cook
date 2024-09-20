const express = require('express');
const router = express.Router();
const Dish = require('../models/Dish');

// Create dish
router.post('/create', async (req, res) => {
    const { name, kcal_quantity, protein, fat, carbs, ingredients } = req.body;
    const newDish = new Dish({ name, kcal_quantity, protein, fat, carbs, ingredients });
    await newDish.save();
    res.json(newDish);
});

// Get all dishes
router.get('/', async (req, res) => {
    const dishes = await Dish.find();
    res.json(dishes);
});

module.exports = router;
