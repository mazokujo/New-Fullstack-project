const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Review = require('./reviews')

const ImageSchema = new Schema({
    url: String,
    filename: String
});
ImageSchema.virtual('thumbnail').get(function () {
    return this.url.replace('/upload', '/upload/w_200')
})
// opts helps to enable virtuals in JSON
const opts = { toJSON: { virtuals: true } }

const CampgroundSchema = new Schema({
    title: String,
    price: Number,
    images: [ImageSchema],
    description: String,
    location: String,
    owner: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    review: [{
        type: Schema.Types.ObjectId,
        ref: 'Review'
    }],
    geometry: {
        type: {
            type: String,
            enum: ['Point'],
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    }

}, opts)

CampgroundSchema.virtual('properties.popUpMarkup').get(function () {
    return `<strong><a href="/campground/${this._id}">${this.title}</a></strong><p>${this.description}</p>`
})

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


