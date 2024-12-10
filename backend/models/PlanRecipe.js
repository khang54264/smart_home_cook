const mongoose = require('mongoose');

const PlanRecipeSchema = new mongoose.Schema({
    _id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'MealPlan', // Tham chiếu tới _id của MealPlanSchema
        required: true
    },
    r_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Recipe', // Tham chiếu tới _id của RecipeSchema
        required: true
    },
});

module.exports = mongoose.model('PlanRecipe', PlanRecipeSchema);