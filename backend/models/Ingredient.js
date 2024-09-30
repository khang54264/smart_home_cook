const mongoose = require('mongoose');

const IngredientSchema = new mongoose.Schema({
    name: { type: String, required: true },
    carb: { type: String, required: true },
    xo: { type: String, required: true },
    fat: { type: String, required: true },
    protein: { type: String, required: true },
    kcal: { type: String, required: true },
});

module.exports = mongoose.model('Ingredient', IngredientSchema);