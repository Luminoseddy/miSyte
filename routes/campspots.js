const express = require('express');
const router = express.Router();
const catchAsync = require('../utilities/catchAsync');
const {campspotSchema, reviewSchema } = require('./schemas.js');


const ExpressError = require('../utilities/ExpressError');
const Campspot = require('../models/campspot');


router.get('/', catchAsync(async (req, res) => {
    const campspots = await Campspot.find({});
    res.render('campspots/index', { campspots }) // campspots is how we render it inside index.js
}))

router.get('/new', (req, res) => {
    res.render('campspots/new');
})

const validateCampspot = (req, res, next) => {
    // validate with req.body.
    const { error } = reviewSchema.validate(req.body);
    if(error){ // then we map over over every error.detail message.
        const msg = error.details.map(el = el.message).join(',');
        throw new ExpressError(msg, 400); // When caught, gets thrown to app.use(a, b, c, next);
    }else{
        next();
    }
    // console.log(result);
}


// CREATES a new campspot.
router.post('/', validateCampspot, catchAsync(async(req, res, next) => {
    // if(!req.body.campspot) throw new ExpressError('Invalid camp spot data.', 404); 
    const campspot = new Campspot(req.body.campspot); // empty by default.
    await campspot.save();
    res.redirect(`/campspots/${campspot._id}`);  
}));

// Show page
router.get('/:id', catchAsync(async(req, res,) => {
    const campspot = await Campspot.findById(req.params.id).populate('reviews');
    console.log(campspot);
    res.render('campspots/show', { campspot });
}));

router.get('/:id/edit', catchAsync(async (req, res) => {
    const campspot = await Campspot.findById(req.params.id);
    res.render('campspots/edit', { campspot }); // take 'campspot' and pass it down to /edit
}))

router.put('/:id', validateCampspot, catchAsync(async (req, res) => {
    // res.send("Testing app.put request /:id")
    const { id } = req.params;
    const campspot = await Campspot.findByIdAndUpdate(id, { ...req.body.campspot }); // Spread operator '...'
    res.redirect(`/campspots/${campspot._id}`)
}))

// A form sends a post request to this url, and fake out express, to make it seem its a delete request
// because of method-override
router.delete('/:id', catchAsync(async (req, res) => {
    const { id } = req.params;
    await Campspot.findByIdAndDelete(id);
    res.redirect('/campspots');
}));

module.exports = router;

