// require express
const express = require('express')
// create new router object
const router = express.Router();
//require wrapAsync to handle async function error with try and catch
const wrapAsync = require('../Errorhandling utilities/wrapAsync');
//require controllers
const campground = require('../controllers/campground')
//loggedin middleware, isOwner middleware, validate campground middleware
const { isLoggedin, isOwner, validateCampground } = require('../middleware');
//require multer and cloudinary packages
const { storage } = require('../cloudinary')
const multer = require('multer')
const upload = multer({ storage })



router.route('/')
    .get(wrapAsync(campground.index))
    .post(upload.array('campground[image]'), validateCampground, isLoggedin, wrapAsync(campground.createCampground))



router.get('/new', isLoggedin, campground.renderNewForm)

router.route('/:id')
    .put(upload.array('campground[image]'), isLoggedin, isOwner, validateCampground, wrapAsync(campground.editCampground))
    .get(wrapAsync(campground.showCampground))
    .delete(isOwner, wrapAsync(campground.deleteCampground))

router.get('/:id/edit', isLoggedin, isOwner, wrapAsync(campground.renderEditForm))

module.exports = router





