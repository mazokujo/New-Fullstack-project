// require express
const express = require('express')
// create new router object
const router = express.Router({ mergeParams: true });
//require passport
const passport = require('passport')
// require Campground model
const User = require('../models/user');

//require wrapAsync to handle async function error with try and catch
const wrapAsync = require('../Errorhandling utilities/wrapAsync');

//route to register user(sign up)
router.get('/register', (req, res) => {
    res.render('users/register')
})
router.post('/register', wrapAsync(async (req, res) => {
    try {
        const { email, username, password } = (req.body)
        const user = await new User({ email, username });
        const registeredUser = await User.register(user, password)
        console.log(registeredUser);
        //login the registeredUser.
        req.login(registeredUser, err => {
            if (err) return next(err);
            req.flash('success', 'Welcome to yelpCamp!')
            res.redirect('/campground');
        })
    } catch (e) {
        req.flash('error', e.message);
        res.redirect('/register')
    }
}))
// route to login
router.get('/login', (req, res) => {
    res.render('users/login')
})
//directly verify the password and user against the data in mongo
router.post('/login', passport.authenticate('local', { failureFlash: true, failureRedirect: 'login' }), (req, res) => {
    req.flash('success', 'Welcome back!');
    //remember  original Url before login and redirect to original Url after login
    const returnToUrl = req.session.returnTo || '/campground'
    //delete returnTo in the req.session object
    delete req.session.returnTo;
    res.redirect(returnToUrl);
})
//logout route
router.get('/logout', (req, res) => {
    req.logout();
    req.flash('success', 'Goodbye');
    res.redirect('/campground')
})
module.exports = router;
