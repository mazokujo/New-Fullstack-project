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

    }
    // price: Number,
    // image: String,
    // description: String,
    // location: String
});
//exporting Review model

const Review = mongoose.model('Review', ReviewSchema);

module.exports = Review;
