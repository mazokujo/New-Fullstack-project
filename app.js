const express = require('express');
const app = express();
const path = require('path');
const mongoose = require('mongoose');

// require joiSchema: campgroundSchema
const { campgroundSchema } = require('./joiSchema')

//ejs-mate (to improve html template)
const ejsMate = require('ejs-mate');

// require Campground model
const Campground = require('./models/Campground');
//require method override for put, push, delete route
const methodOverride = require('method-override');
//require new class for error handling: appError
const AppError = require('./Errorhandling utilities/appError');
//require wrapAsync to handle async function error with try and catch
const wrapAsync = require('./Errorhandling utilities/wrapAsync')
//handle potentiel error in our model
const validateCampground = (req, res, next) => {
    const { error } = campgroundSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new AppError(msg, 400)
    } else {
        next();
    }
}
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



//home
app.get('/', (req, res) => {
    res.render('home')
});


//create a new campground
app.get('/campground/new', (req, res) => {
    res.render('campgrounds/new');
})
app.post('/campground', validateCampground, wrapAsync(async (req, res, next) => {
    //if (!req.body.campground) throw new AppError('invalid Campground', 400)
    const result = campgroundSchema.validate(req.body);
    console.log(result);
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


// Edit a campground
app.get('/campground/:id/edit', wrapAsync(
    async (req, res, next) => {
        const { id } = req.params
        const item = await Campground.findById(id);
        res.render('campgrounds/edit', { item });


    }))
app.put('/campground/:id', validateCampground, wrapAsync(async (req, res, next) => {
    const { id } = req.params;
    const item = await Campground.findByIdAndUpdate(id, req.body.campground, { runValidators: true, new: true });
    res.redirect(`/campground/${item._id}`)
}))

// create a route to all campgrounds
app.get('/campground', wrapAsync(async (req, res, next) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds });
}));
// Delete Campground
app.delete('/campground/:id', wrapAsync(async (req, res, next) => {
    const { id } = req.params;
    const deleteCamp = await Campground.findByIdAndDelete(id);
    res.redirect('/campground');
}))

// create a get route to show item details

app.get('/campground/:id', wrapAsync(async (req, res, next) => {
    const { id } = req.params
    const item = await Campground.findById(id);
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
//handle all remaining errors, lol
app.all('*', (req, res, next) => {
    next(new AppError('Page Not Found', 404));
})
// error handling middleware with custom message notificattion
app.use((err, req, res, next) => {
    const { status = 500 } = err;
    if (!err.message) err.message = 'Something went wrong'
    // change stack message
    res.status(status).render('error', { err });
});
//establishing port connection
app.listen(8080, () => {
    console.log('Receiving from port 8080');
});


