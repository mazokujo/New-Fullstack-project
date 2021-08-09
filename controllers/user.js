// require Campground model
const User = require('../models/user');

module.exports.renderRegisterForm = (req, res) => {
    res.render('users/register')
}

module.exports.registerUser = async (req, res) => {
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
}

module.exports.renderLoginForm = (req, res) => {
    res.render('users/login')
}

module.exports.loginUser = (req, res) => {
    req.flash('success', 'Welcome back!');
    //remember  original Url before login and redirect to original Url after login
    const returnToUrl = req.session.returnTo || '/campground'
    //delete returnTo in the req.session object
    delete req.session.returnTo
    res.redirect(returnToUrl);
}

module.exports.logoutUser = (req, res) => {
    req.logout();
    req.flash('success', 'Goodbye');
    res.redirect('/campground')
}