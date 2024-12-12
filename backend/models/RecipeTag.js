const mongoose = require('mongoose');

const RecipeTagSchema = new mongoose.Schema({
    r_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Recipe', // Tham chiếu tới _id của RecipeSchema
        required: true
    },
    t_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tag', // Tham chiếu tới _id của TagSchema
        required: true
    },
});

module.exports = mongoose.model('RecipeTag', RecipeTagSchema);