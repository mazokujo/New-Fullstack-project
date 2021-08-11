if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}

console.log(process.env.CLOUDINARY_CLOUD_NAME)
console.log(process.env.CLOUDINARY_API_KEY)
console.log(process.env.CLOUDINARY_SECRET)
console.log(process.env.MAPBOX_TOKEN)


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
//require passport
const passport = require('passport')
//require passport-local
const localStrategy = require('passport-local')
//require multer
const multer = require('multer')
const upload = multer({ dest: 'uploads/' })
//require UserSchema
const User = require('./models/user')
//require new class for error handling: appError
const AppError = require('./Errorhandling utilities/appError');
// require Campground routes
const campgroundRoutes = require('./router/campground');
//require Review routes
const reviewRoutes = require('./router/review');
//require User routes
const userRoutes = require('./router/user');
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
        //specifies the life of a cookie, in our case 1 week
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}
app.use(session(sessionParam));
app.use(flash());
//execute passport,localStrategy
app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(User.authenticate()));

//serialise user and deserialise user(associaciate or disassociate the user to the session or log him out of the session)
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//flash message middleware can be access in every single request
//we can also add req.user object, it will be accessed in every single request
app.use((req, res, next) => {
    console.log(req.session);
    if (!['/login', '/'].includes(req.originalUrl)) {
        req.session.returnTo = req.originalUrl
    }
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    res.locals.currentUser = req.user
    next()
})

//ROUTES


// All campground routes
app.use('/campground', campgroundRoutes);
//All review routes
app.use('/campground/:id/review', reviewRoutes);
//All user routes
app.use('', userRoutes);

//home
app.get('/', (req, res) => {
    res.render('home')
});
// // handling all remaining error
// app.all('*', (req, res, next) => {
//     next(new AppError('Page Not Found', 404))
// })

// error handling middleware with custom message notificattion
app.use((err, req, res, next) => {
    const { status = 500 } = err;
    if (!err.message) err.message = 'Something went wrong'
    console.log(err)
    // change stack message
    res.status(status).render('error', { err });
});
app.listen(8080, () => {
    console.log('Receiving from port 8080');
});


