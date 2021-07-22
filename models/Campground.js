const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Review = require('./reviews')

const CampgroundSchema = new Schema({
    title: String,
    price: Number,
    image: String,
    description: String,
    location: String,
    review: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Review'
        }
    ]
})
//exporting Campground model

const Campground = mongoose.model('Campground', CampgroundSchema);
// mongoose delete middleware
//use of mongoose middleware to delete a farm and associated product

CampgroundSchema.post('findOneAndDelete', async function (camp) {

    if (camp) {
        const res = await Review.deleteMany({ _id: { $in: camp.review } })
        console.log(res);
    }
})

module.exports = Campground;


