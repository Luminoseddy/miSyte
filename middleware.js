module.exports.isLoggedin = (req, res, next) => {
    if(!req.isAuthenticated()){
        req.session.returnTo = req.originalUrl;
        req.flash('error', 'you gotta be signed in first homie.');
        return res.redirect('/login');
    }
    next();
}

// Checked