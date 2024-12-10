const mongoose = require('mongoose');

const FavoriteRecipeSchema = new mongoose.Schema({
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
    time_addedd: { type: Date, default: Date.now },
});

module.exports = mongoose.model('FavoriteRecipe', FavoriteRecipeSchema);