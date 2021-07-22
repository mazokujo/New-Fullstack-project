const express = require('express');
const app = express();
const path = require('path');
const mongoose = require('mongoose');

// require joiSchema: which contains both campground and review
const { campgroundSchema, reviewSchema } = require('./joiSchema')

//ejs-mate (to improve html template)
const ejsMate = require('ejs-mate');

// require Campground model
const Campground = require('./models/Campground');
// require Review model
const Review = require('./models/reviews');
//require method override for put, push, delete route
const methodOverride = require('method-override');
//require new class for error handling: appError
const AppError = require('./Errorhandling utilities/appError');
//require wrapAsync to handle async function error with try and catch
const wrapAsync = require('./Errorhandling utilities/wrapAsync');
//const { assert } = require('console');

//mongoose connection, our database is yelpcamp
mongoose.connect('mongodb://localhost:27017/yelpcamp', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true
});

// handling error in mongoose connection
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
    // we're connected!
    console.log("Database connected")
});
//use method override
app.use(methodOverride('_method'));

// setting ejs in view engine
app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '/views'));

// we need to parse req.body to make a post request
app.use(express.urlencoded({ extended: true }));

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

//home
app.get('/', (req, res) => {
    res.render('home')
});


//create a new campground
app.get('/campground/new', (req, res) => {
    res.render('campgrounds/new');
})
app.post('/campground', validateCampground, wrapAsync(async (req, res) => {
    //if (!req.body.campground) throw new AppError('invalid Campground', 400)
    // const result = campgroundSchema.validate(req.body);
    // console.log(result);
    const newCampground = await new Campground(req.body.campground);
    await newCampground.save();
    res.redirect(`/campground/${newCampground._id}`);
}));
//create a new campground
// app.get('/newcamp', async (req, res) => {
//     const camp = new Campground({ title: 'bay area', description: 'affordable' });
//     const newCamp = await camp.save();
//     console.log(newCamp)
//     // res.render('/camp', { newCamp });
// })

//*delete a review associated to a campground
app.delete('/campground/:id/review/:reviewId', wrapAsync(async (req, res) => {
    //res.send("it's working!!!!")
    const { id, reviewId } = req.params;
    //The $pull operator removes from an existing array all instances of a value or values that match a specified condition.
    //we remove the review in the campground
    await Campground.findByIdAndUpdate(id, { $pull: { review: reviewId } })
    //remove the review from the Review model
    await Review.findByIdAndDelete(reviewId);
    res.redirect(`/campground/${id}`);
}))

// Edit a campground
app.get('/campground/:id/edit', wrapAsync(
    async (req, res, next) => {
        const { id } = req.params
        const item = await Campground.findById(id);
        res.render('campgrounds/edit', { item });


    }))
app.put('/campground/:id', validateCampground, wrapAsync(async (req, res) => {
    const { id } = req.params;
    const item = await Campground.findByIdAndUpdate(id, req.body.campground, { runValidators: true, new: true });
    res.redirect(`/campground/${item._id}`)
}))

// create a route to all campgrounds
app.get('/campground', wrapAsync(async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds });
}));
// *Delete Campground and all associated reviews
//we use findOneAndDelete, the specific delete middleware that is linked to findByIdAndDelete.
// findOneAndDelete is triggered once the delete route below is used
//findOneAndDelete middleware is found under /models/campground.js


// create a get route to show item details, and display review(using populate function)

app.get('/campground/:id', wrapAsync(async (req, res, next) => {
    const { id } = req.params
    const item = await Campground.findById(id).populate('review')
    res.render('campgrounds/show', { item });
}))



// //function used to handle mangoose error: in this case validation error
// const validationErrorHandler = err => {
//     console.dir(err);
//     return new AppError(`Unsuccessful Validation - ${err.message}`, 400)
// }
// //new error handling middleware: to handle mangoose error
// app.use((err, req, res, next) => {
//     console.log(err.name);
//     if (err.name === 'ValidationError') err = validationErrorHandler(err);
//     next(err);
// })
//handle all remaining errors, 
app.delete('/campground/:id', wrapAsync(async (req, res, next) => {
    const { id } = req.params;
    const deleteCamp = await Campground.findByIdAndDelete(id);
    res.redirect('/campground');
}))
// *post a review on the campground
app.post('/campground/:id/reviews', validateReview, wrapAsync(async (req, res) => {
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
app.delete('/campground/:id/review/:reviewId', wrapAsync(async (req, res) => {
    //res.send("it's working!!!!")
    const { id, reviewId } = req.params;
    //The $pull operator removes from an existing array all instances of a value or values that match a specified condition.
    //we remove the review in the campground
    await Campground.findByIdAndUpdate(id, { $pull: { review: reviewId } })
    //remove the review from the Review model
    await Review.findByIdAndDelete(reviewId);
    res.redirect(`/campground/${id}`);
}))
app.all('*', (req, res, next) => {
    next(new AppError('Page Not Found', 404));
})
// error handling middleware with custom message notificattion
app.use((err, req, res, next) => {
    const { status = 500 } = err;
    if (!err.message) err.message = 'Something went wrong'
    console.log(err)
    // change stack message
    res.status(status).render('error', { err });
});
//establishing port connection
app.listen(8080, () => {
    console.log('Receiving from port 8080');
});


