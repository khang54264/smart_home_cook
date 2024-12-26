const mongoose = require('mongoose');

const SearchHistorySchema = new mongoose.Schema({
    u_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Tham chiếu tới _id của UserSchema
        required: true
    },
    term: { type: String},
    r_id: {type: mongoose.Schema.Types.ObjectId,
            ref: 'Recipe'}, // Tham chiếu tới _id của RecipeSchema}
    time: {type: Date, default: Date.now},
});

module.exports = mongoose.model('SearchHistory', SearchHistorySchema);