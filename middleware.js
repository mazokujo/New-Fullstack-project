const isLoggedin = (req, res, next) => {
    console.log('REQ.USER', req.user)
    if (!req.isAuthenticated()) {
        req.session.returnTo = req.originalUrl;
        req.flash('error', 'You must be logged in');
        return res.redirect('/login')
    }
    next();
}

module.exports = isLoggedin