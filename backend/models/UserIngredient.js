const mongoose = require('mongoose');

const UserIngredientSchema = new mongoose.Schema({
    _id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Tham chiếu tới _id của UserSchema
        required: true
    },
    i_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Ingredient', // Tham chiếu tới _id của IngredientSchema
        required: true
    },
});

module.exports = mongoose.model('UserIngredient', UserIngredientSchema);