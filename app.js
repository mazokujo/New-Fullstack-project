const express = require('express');
const app = express();
const path = require('path');
const mongoose = require('mongoose');
// require express session and connect-flash
const session = require('express-session');
const flash = require('connect-flash');
//ejs-mate (to improve html template)
const ejsMate = require('ejs-mate');
//require method override for put, push, delete route
const methodOverride = require('method-override');
//require new class for error handling: appError
const AppError = require('./Errorhandling utilities/appError');
// require Campground router
const campgroundRoutes = require('./router/campground');
//require Review router
const reviewRoutes = require('./router/review');
//mongoose connection, our database is yelpcamp
mongoose.connect('mongodb://localhost:27017/yelpcamp', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    //remove mongoose deprecation error 
    useFindAndModify: false
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
//middleware to enable static files in our boilerplate
app.use(express.static(path.join(__dirname, 'public')));

// setting express-session and flash
const sessionParam = {
    secret: 'mysecret',
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}
app.use(session(sessionParam));
app.use(flash());
//flash message middleware, comes before the route
app.use((req, res, next) => {
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next()
})

//ROUTES

//home
app.get('/', (req, res) => {
    res.render('home')
});
// All campground routes
app.use('/campground', campgroundRoutes)
//All review routes
app.use('/campground/:id/review', reviewRoutes);

//handle all remaining errors, 
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


