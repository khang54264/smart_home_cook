const mongoose = require('mongoose');

const DishStepSchema = new mongoose.Schema({
    _id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Dish', // Tham chiếu tới _id của DishSchema
        required: true
    },
    steps: [{
        step_number: { type: String, required: true },
        step_name: { type: String, required: true },
        description: { type: String, required: true },
        image_url: { type: String } 
    }]
});

module.exports = mongoose.model('DishStep', DishStepSchema);