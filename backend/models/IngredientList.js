const mongoose = require('mongoose');

const IngredientListSchema = new mongoose.Schema({
    _id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Recipe', // Tham chiếu tới _id của RecipeSchema
        required: true
    },
    i_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Ingredient', // Tham chiếu tới _id của IngredientSchema
        required: true
    },
    amount: { type: String, default: 0 },
    unit: {type: String},
});

module.exports = mongoose.model('IngredientList', IngredientListSchema);
