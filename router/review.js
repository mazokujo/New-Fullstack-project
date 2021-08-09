// require express
const express = require('express')
// create new router object
const router = express.Router({ mergeParams: true });
//require wrapAsync to handle async function error with try and catch
const wrapAsync = require('../Errorhandling utilities/wrapAsync');
//loggedin middleware, isOwner middleware, validate campground middleware
const { validateReview, isLoggedin, isReviewOwner } = require('../middleware');
//require controllers
const review = require('../controllers/review')


// *post a review on the campground
router.post('', isLoggedin, validateReview, wrapAsync(review.postComment))

//*delete a review associated to a campground
router.delete('/:reviewId', isLoggedin, isReviewOwner, wrapAsync(review.deleteComment))

module.exports = router
