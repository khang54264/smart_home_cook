const mongoose = require('mongoose');

const DishSchema = new mongoose.Schema({
    name: { type: String, required: true },
    cook_time: { type: String, required: true },
    cuisine_type: { type: String },
    ingredients: [{
        ingredient_id: {
            type: mongoose.Schema.Types.ObjectId, 
            ref: 'Ingredient', // Tham chiếu tới IngredientSchema
            required: true
        },
        ingredient_amount: { type: String },
    }],
    kcal_quantity: { type: String }, 
    nutritions: { type: String},
    time_added: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Dish', DishSchema);