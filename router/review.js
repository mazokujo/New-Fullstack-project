// require express
const express = require('express')
// create new router object
const router = express.Router({ mergeParams: true });
// import joi schema
const { reviewSchema } = require('../joiSchema')
// require Campground model
const Campground = require('../models/Campground');
// require Review model
const Review = require('../models/reviews');
//require new class for error handling: appError
const AppError = require('../Errorhandling utilities/appError');

//require wrapAsync to handle async function error with try and catch
const wrapAsync = require('../Errorhandling utilities/wrapAsync');

//handle potential errors in our review model
const validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new AppError(msg, 400)
    } else {
        next();
    }
}

// *post a review on the campground
router.post('', validateReview, wrapAsync(async (req, res) => {
    // res.send("it's working!");
    const { id } = req.params;
    const item = await Campground.findById(id);
    const newReview = await new Review(req.body.review);
    item.review.push(newReview);
    await newReview.save();
    await item.save();
    res.redirect(`/campground/${item._id}`);
}))

//*delete a review associated to a campground
router.delete('/:reviewId', wrapAsync(async (req, res) => {
    //res.send("it's working!!!!")
    const { id, reviewId } = req.params;
    //The $pull operator removes from an existing array all instances of a value or values that match a specified condition.
    //we remove the review in the campground
    await Campground.findByIdAndUpdate(id, { $pull: { review: reviewId } })
    //remove the review from the Review model
    await Review.findByIdAndDelete(reviewId);
    res.redirect(`/campground/${id}`);
}))

module.exports = router
