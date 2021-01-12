const express = require('express');
const router = express.Router();
const catchAsync = require('../utilities/catchAsync');
const {campspotSchema, reviewSchema } = require('../schemas.js');
const { isLoggedIn } = require('../middleware');

const ExpressError = require('../utilities/ExpressError');
const Campspot = require('../models/campspot');

//Executes when EDITING and then UPDATE
const validateCampspot = (req, res, next) => {
    console.log("VALIDATE CAMPSPOT SUCCEEDS.");
    // validate with req.body.
    const { error } = reviewSchema.validate(req.body);
    if(error){ // then we map over over every error.detail message.
        const msg = error.details.map(el = el.message).join(',');
        throw new ExpressError(msg, 400); // When caught, gets thrown to app.use(a, b, c, next);
    }else{
        next();
    }
}

router.get('/', catchAsync(async (req, res) => {
    const campspots = await Campspot.find({});
    res.render('campspots/index', { campspots }) // campspots is how we render it inside index.js
}))

router.get('/new', isLoggedIn,  (req, res) => {

    res.render('campspots/new');
})

// CREATES a new campspot.
router.post('/', isLoggedIn, validateCampspot, catchAsync(async(req, res, next) => {

    // if(!req.body.campspot) throw new ExpressError('Invalid camp spot data.', 404); 
    const campspot = new Campspot(req.body.campspot); // empty by default.
    await campspot.save();
    req.flash('success', 'New campspot posted successfully! Thank you'); // After save, process flash
    res.redirect(`/campspots/${campspot._id}`);  // After flash, redirect
}));

// Show route handler page
router.get('/:id', catchAsync(async(req, res,) => {
    const campspot = await Campspot.findById(req.params.id).populate('reviews');
    // console.log(campspot);
    if(!campspot){
        req.flash('error', "Campground can't be found. Bug will be fixed by the dev team. Come back later. :)");
        return res.redirect('/campspots');
    }
    // Otherwise we render /show
    res.render('campspots/show', { campspot });
}));

router.get('/:id/edit',isLoggedIn, catchAsync(async (req, res) => {
    const campspot = await Campspot.findById(req.params.id);
    if(!campspot){
        req.flash('error', "Campground can't be found. Bug will be fixed by the dev team. Come back later. :)");
        return res.redirect('/campspots');
    }
    res.render('campspots/edit', { campspot }); // take 'campspot' and pass it down to /edit
}))

// UPDATE Route.
router.put('/:id', isLoggedIn,validateCampspot, catchAsync(async (req, res) => {
    // res.send("Testing app.put request /:id")
    const { id } = req.params;
    const campspot = await Campspot.findByIdAndUpdate(id, { ...req.body.campspot }); // Spread operator '...'
    req.flash('success', 'Content has been updated. Great!');
    res.redirect(`/campspots/${campspot._id}`)
}))

// A form sends a post request to this url, and fake out express, to make it seem its a delete request
// because of method-override
router.delete('/:id', isLoggedIn, catchAsync(async (req, res) => {
    const { id } = req.params;
    await Campspot.findByIdAndDelete(id);
    req.flash('success', "Campspot successfully Deleted! :(")

    res.redirect('/campspots');
})); 
 
module.exports = router;           