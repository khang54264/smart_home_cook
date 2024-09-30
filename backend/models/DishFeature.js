const mongoose = require('mongoose');

const DishFeatureSchema = new mongoose.Schema({
    _id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Dish', // Tham chiếu tới _id của DishSchema
        required: true
    },
    cook_time: { type: String, required: true },
    ingredients: [{
        ingredient_id: {
            type: mongoose.Schema.Types.ObjectId, 
            ref: 'Ingredient', // Tham chiếu tới IngredientSchema
            required: true
        },
        ingredient_amount: { type: String },
    }],
    cuisine_type: { type: String },
    kcal_quantity: { type: String }, 
    nutritions: [{
        nutrition: { type: String},
    }]
});

module.exports = mongoose.model('DishFeature', DishFeatureSchema);