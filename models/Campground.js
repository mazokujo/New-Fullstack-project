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


// mongoose delete middleware
//use of mongoose middleware to delete a farm and associated product

CampgroundSchema.post('findOneAndDelete', async function (camp) {
    console.log(camp);
    if (camp.review.length) {
        const res = await Review.deleteMany({ _id: { $in: camp.review } });
        console.log(res);
    }
})



const Campground = mongoose.model('Campground', CampgroundSchema);
module.exports = Campground;


