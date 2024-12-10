const mongoose = require('mongoose');

const TagSchema = new mongoose.Schema({
    name: { type: String, required: true },
    info: { type: String, default: ''},
});

module.exports = mongoose.model('Tag', TagSchema);