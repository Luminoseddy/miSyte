const isLoggedin = (req, res, next) => {
    if(!req.isAuthenticated()){
        req.flash('error', 'you gotta be sign edin first homie.');
        return res.redirect('/login');
    }
    next();
}