const mongoose = require('mongoose');

const RecipeSchema = new mongoose.Schema({
    name: { type: String, required: true },
    cook_time: { type: String, required: true },
    image_url: { type: String } ,
    time_added: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Recipe', RecipeSchema);

{/*
ingredients: [{
    ingredient_id: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Ingredient', // Tham chiếu tới IngredientSchema
        required: true
    },
    ingredient_amount: { type: String },
}],
*/}