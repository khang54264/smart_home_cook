const mongoose = require('mongoose');

const DishSchema = new mongoose.Schema({
    name: { type: String, required: true },
    time_added: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Dish', DishSchema);