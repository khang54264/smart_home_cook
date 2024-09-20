const mongoose = require('mongoose');

const DishSchema = new mongoose.Schema({
    name: String,
    kcal_quantity: Number,
    protein: Number,
    fat: Number,
    carbs: Number,
    ingredients: [String]
});

module.exports = mongoose.model('Dish', DishSchema);