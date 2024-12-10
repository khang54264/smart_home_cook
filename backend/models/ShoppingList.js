const mongoose = require('mongoose');

const ShoppingListSchema = new mongoose.Schema({
    _id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Tham chiếu tới _id của UserSchema
        required: true
    },
    r_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Recipe', // Tham chiếu tới _id của RecipeSchema
        required: true
    },
});

module.exports = mongoose.model('ShoppingList', ShoppingListSchema);