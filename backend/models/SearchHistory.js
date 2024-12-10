const mongoose = require('mongoose');

const SearchHistorySchema = new mongoose.Schema({
    _id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Tham chiếu tới _id của UserSchema
        required: true
    },
    term: { type: String},
    ingredient: {type: String},
    time: {type: Date, default: Date.now},
});

module.exports = mongoose.model('SearchHistory', SearchHistorySchema);