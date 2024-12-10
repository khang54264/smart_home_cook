const mongoose = require('mongoose');

const RecipeStepSchema = new mongoose.Schema({
    _id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Recipe', // Tham chiếu tới _id của RecipeSchema
        required: true
    },
    step_number: { type: String, required: true },
    step_name: { type: String, required: true },
    description: { type: String, required: true },
    image_url: { type: String } 
});

module.exports = mongoose.model('RecipeStep', RecipeStepSchema);