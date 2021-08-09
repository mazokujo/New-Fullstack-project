// require Campground model
const Campground = require('../models/Campground');
// require Review model
const Review = require('../models/reviews');

module.exports.postComment = async (req, res) => {
    // res.send("it's working!");
    const { id } = req.params;
    const item = await Campground.findById(id);
    const newReview = await new Review(req.body.review);
    newReview.owner = req.user._id;
    item.review.push(newReview);
    await newReview.save();
    await item.save();
    res.redirect(`/campground/${item._id}`);
}

module.exports.deleteComment = async (req, res) => {
    //res.send("it's working!!!!")
    const { id, reviewId } = req.params;
    //The $pull operator removes from an existing array all instances of a value or values that match a specified condition.
    //we remove the review in the campground
    await Campground.findByIdAndUpdate(id, { $pull: { review: reviewId } })
    //remove the review from the Review model
    await Review.findByIdAndDelete(reviewId);
    res.redirect(`/campground/${id}`);
}