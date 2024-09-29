const mongoose = require('mongoose');

const DishSchema = new mongoose.Schema({
    name: { type: String, required: true },
  kcal_quantity: { type: Number, required: true },
  protein: { type: Number, required: true },
  fat: { type: Number, required: true },
  carbs: { type: Number, required: true },
  ingredients: { type: [String], required: true },
});

module.exports = mongoose.model('Dish', DishSchema);