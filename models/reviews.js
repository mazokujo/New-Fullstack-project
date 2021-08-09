const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ReviewSchema = new Schema({
    text: {
        type: String,
        required: [true, "Can't submit without comment"]
    },
    rating: {
        type: Number,
        minimum: 1
    },
    owner: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
});
//exporting Review model

const Review = mongoose.model('Review', ReviewSchema);

module.exports = Review;
