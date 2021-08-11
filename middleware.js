//require new class for error handling: appError
const AppError = require('./Errorhandling utilities/appError');
// import joi schema
const { campgroundSchema, reviewSchema } = require('./joiSchema')
// require Campground model
const Campground = require('./models/Campground');
// require Campground model
const Review = require('./models/reviews')
//verify if user is logged in
module.exports.isLoggedin = (req, res, next) => {
    console.log('REQ.USER:', req.user)
    if (!req.isAuthenticated()) {
        //req.session.returnTo = req.originalUrl;
        req.flash('error', 'You must be logged in');
        return res.redirect('/login')
    }
    next();
}
// handle potentiel error in our campground model
module.exports.validateCampground = (req, res, next) => {
    const { error } = campgroundSchema.validate(req.body);
    console.log(error)
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new AppError(msg, 400)
    } else {
        next();
    }
}
// is owner middleware
module.exports.isOwner = async (req, res, next) => {
    const { id } = req.params;
    const item = await Campground.findById(id).populate('owner');
    console.log(`item.owner:${item.owner}`)
    console.log(`req.user:${req.user._id}`)
    if (!item.owner.equals(req.user)) {
        req.flash('error', 'You do not have permission')
        res.redirect(`/campground/${id}`);
    }
    next()

}
//is owner middleware
module.exports.isReviewOwner = async (req, res, next) => {
    const { id, reviewId } = req.params;
    const item = await Review.findById(reviewId).populate('owner');
    console.log(`item.owner:${item.owner}`)
    console.log(`req.user:${req.user}`)
    if (!item.owner.equals(req.user)) {
        req.flash('error', 'You do not have permission')
        res.redirect(`/campground/${id}`);
    }
    next()

}
//handle potential errors in our review model
module.exports.validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new AppError(msg, 400)
    } else {
        next();
    }
}

