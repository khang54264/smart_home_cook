const mongoose = require('mongoose');

const MealPlanSchema = new mongoose.Schema({
    u_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Tham chiếu tới _id của UserSchema
        required: true
    },
    name: {type: String, required: true, default: 'Untitled Plan'},
    // time: { type: Date} ,
    time_created: { type: Date, default: Date.now },
});

module.exports = mongoose.model('MealPlan', MealPlanSchema);