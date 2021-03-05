const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const moviepathSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    path: {
        type: String,
        required: true
    }
}, {timestamps: true});

const moviePath = mongoose.model('Movie', moviepathSchema);
module.exports = moviePath;
