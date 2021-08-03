// require express
const express = require('express')
// create new router object
const router = express.Router();
// import joi schema
const { campgroundSchema } = require('../joiSchema')
// require Campground model
const Campground = require('../models/Campground');

//require new class for error handling: appError
const AppError = require('../Errorhandling utilities/appError');

//require wrapAsync to handle async function error with try and catch
const wrapAsync = require('../Errorhandling utilities/wrapAsync');
//handle potentiel error in our campground model
const validateCampground = (req, res, next) => {
    const { error } = campgroundSchema.validate(req.body);
    console.log(error)
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new AppError(msg, 400)
    } else {
        next();
    }
}

//loggedin middleware
const isLoggedin = require('../middleware');

//create a new campground
router.get('/new', isLoggedin, (req, res) => {
    res.render('campgrounds/new');
})
router.post('/', validateCampground, isLoggedin, wrapAsync(async (req, res) => {
    //if (!req.body.campground) throw new AppError('invalid Campground', 400)
    // const result = campgroundSchema.validate(req.body);
    // console.log(result);
    const newCampground = await new Campground(req.body.campground);
    await newCampground.save();
    req.flash('success', 'you made a new campground')
    res.redirect(`/campground/${newCampground._id}`);
}));

// Edit a campground
router.get('/:id/edit', wrapAsync(
    async (req, res, next) => {
        const { id } = req.params
        const item = await Campground.findById(id);
        if (!item) {
            req.flash('error', 'Cannot find that campground')
            res.redirect('/campground')
        }
        res.render('campgrounds/edit', { item });


    }))
router.put('/:id', validateCampground, wrapAsync(async (req, res) => {
    const { id } = req.params;
    const item = await Campground.findByIdAndUpdate(id, req.body.campground, { runValidators: true, new: true });
    res.redirect(`/campground/${item._id}`)
}))

// create a route to all campgrounds
router.get('', wrapAsync(async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds });
}));
// create a get route to show item details, and display review(using populate function)

router.get('/:id', wrapAsync(async (req, res, next) => {
    const { id } = req.params
    const item = await Campground.findById(id).populate('review')
    if (!item) {
        req.flash('error', 'Cannot find that campground')
        res.redirect('/campground')
    }
    res.render('campgrounds/show', { item });
}))
// deletecamp
router.delete('/:id', wrapAsync(async (req, res, next) => {
    const { id } = req.params;
    const deleteCamp = await Campground.findByIdAndDelete(id);
    res.redirect('/campground');
}))



module.exports = router





