const express = require('express');
const router = express.Router();
const catchAsync = require('../utilities/catchAsync');


// Destructuring
const { isLoggedIn, isAuthor, validateCampspot } = require('../middleware');

const ExpressError = require('../utilities/ExpressError');
const Campspot = require('../models/campspot');


router.get('/', catchAsync(async (req, res) => {
    const campspots = await Campspot.find({});
    res.render('campspots/index', { campspots })
}));

router.get('/new', isLoggedIn, (req, res) => {
    res.render('campspots/new');
})


router.post('/', isLoggedIn, validateCampspot, catchAsync(async (req, res, next) => {
    const campspot = new Campspot(req.body.campspot);
    await campspot.save();
    req.flash('success', 'Successfully made a new campspot!');
    res.redirect(`/campspots/${campspot._id}`)
}))
 
router.get('/:id', catchAsync(async (req, res,) => {
    // this now has access to username under key of author.username
    const campspot = await Campspot.findById(req.params.id).populate('reviews').populate('author');
    // console.log(campspot);
    campspot.author = req.user._id;
    if (!campspot) {
        req.flash('error', 'Cannot find that campspot!');
        return res.redirect('/campspots');
    }
    res.render('campspots/show', { campspot });
}));

router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(async (req, res) => {
    const { id } = req.params;
    const campspot = await Campspot.findById(id)
    if (!campspot) {
        req.flash('error', 'Cannot find that campspot!');
        return res.redirect('/campspots');
    }
    res.render('campspots/edit', { campspot });
}))

router.put('/:id', isLoggedIn, isAuthor, validateCampspot, catchAsync(async (req, res) => {
    const { id } = req.params;

    const campspot = await Campspot.findByIdAndUpdate(id, { ...req.body.campspot });
    req.flash('success', 'Successfully updated campspot!');
    res.redirect(`/campspots/${campspot._id}`)
}));

router.delete('/:id', isLoggedIn, isAuthor,  catchAsync(async (req, res) => {
    const { id } = req.params;
    await Campspot.findByIdAndDelete(id);
    req.flash('success', 'Successfully deleted campspot')
    res.redirect('/campspots');
}));

module.exports = router;