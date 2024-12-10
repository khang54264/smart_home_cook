const mongoose = require('mongoose');

const IngredientSchema = new mongoose.Schema({
    name: { type: String, required: true },
    carb: { type: String, required: true, default: 0 },
    xo: { type: String, required: true, default: 0 },
    fat: { type: String, required: true, default: 0 },
    protein: { type: String, required: true, default: 0 },
    kcal: { type: String, required: true, default: 0 },
    type: { type : String },
});

module.exports = mongoose.model('Ingredient', IngredientSchema);