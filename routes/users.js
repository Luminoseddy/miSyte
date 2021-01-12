const express = require('express');
const router = express.Router();
const passport = require('passport');
const catchAsync = require('../utilities/catchAsync');
const User = require('../models/user');


router.get('/register', (req, res) => {
    res.render('users/register');
})

router.post('/register', catchAsync(async(req, res) => {
    try{
        // destructure what we want from req.body
        const { email, username, password } = req.body
        const user = new User({email, username}); // Pass email, username in an object
        const registeredUser = await User.register(user, password); // Register the user, saved into db, hashes the password
        req.login(registeredUser, err => { // Take registered user, and log them in
            if(err){
                return next(err);
            }
            // console.log(registeredUser);
            req.flash('success', "Welcoem to Camp spots");
            res.redirect('/campspots');   
        }) 
    }catch(e){
        req.flash('error', e.message);
        res.redirect('register');
    }
}));

router.get('/login', (req, res) => {
    res.render('users/login');
});

// passport.authenticate using local strategy with 2 options, failureFlash/failureRedirect
router.post('/login', passport.authenticate('local', { failureFlash: true, failureRedirect: '/login'}), (req, res) => {
    req.flash('success', 'welcome back!');
    const redirectUrl = req.session.returnTo || 'campspots';
    delete req.session.returnTo;
    res.redirect(redirectUrl);
});

router.get('/logout', (req, res) => {
    req.logout();
    req.flash('success', "Goodbye");
    res.redirect('/campspots');

})

module.exports = router;