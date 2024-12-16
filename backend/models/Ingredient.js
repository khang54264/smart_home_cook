const mongoose = require('mongoose');

const IngredientSchema = new mongoose.Schema({
    name: { type: String, required: true },
    carb: { type: String, default: 0 },
    xo: { type: String, default: 0 },
    fat: { type: String, default: 0 },
    protein: { type: String, default: 0 },
    kcal: { type: String, default: 0 },
    type: { type : String },
});

module.exports = mongoose.model('Ingredient', IngredientSchema);