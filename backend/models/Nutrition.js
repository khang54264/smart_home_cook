const mongoose = require('mongoose');

const NutritionSchema = new mongoose.Schema({
    _id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Recipe', // Tham chiếu tới _id của RecipeSchema
        required: true
    },
    calories: { type: String, default: 0 },
    fat: {type: String, default: 0},
    carbs: {type: String, default: 0},
    protein: {type: String, default: 0},
    cholesterol: {type: String, default: 0},
    sodium: {type: String, default: 0}, 
    saturated_fat: {type: String, default: 0},
});

module.exports = mongoose.model('Nutrition', NutritionSchema);
