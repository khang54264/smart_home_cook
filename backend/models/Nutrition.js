const mongoose = require('mongoose');

const NutritionSchema = new mongoose.Schema({
    r_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Recipe', // Tham chiếu tới _id của RecipeSchema
        required: true
    },
    name: { type: String, required: true},
    amount: {type: String, default: ''},
    unit: {type: String, default: ''},
});

module.exports = mongoose.model('Nutrition', NutritionSchema);
