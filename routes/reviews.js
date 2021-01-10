const express = require('express');
const router = express.Router({mergeParams: true});

const Campspot = require('../models/campspot');
const Review = require('../models/review');

const {campspotSchema, reviewSchema } = require('../schemas.js');

const catchAsync = require('../utilities/catchAsync');
const ExpressError = require('../utilities/ExpressError');


const validateReview = (req, res, next) => {
    // validate with req.body.
    const { error } = reviewSchema.validate(req.body);
    if(error){ // then we map over over every error.detail message.
        const msg = error.details.map(el = el.message).join(',');
        throw new ExpressError(msg, 400); // When caught, gets thrown to app.use(a, b, c, next);
    }else{
        next();
    }
}





router.post('/', validateReview, catchAsync(async(req, res) => {
    // res.send("We made it, post request succeeded.")
    const campspot = await Campspot.findById(req.params.id);
    const review = new Review(req.body.review);
    campspot.reviews.push(review); //recall reviews property from campspot.js

    await review.save();
    await campspot.save();
    res.redirect(`/campspots/${campspot._id}/:id`);
}))

router.delete('/:reviewId', catchAsync(async(req, res) => {
    const {id, reviewId } = req.params;
    Campspot.findByIdAndUpdate(id, {$pull: {reviews: reviewId}}); // review is an array of id's
    await Review.findByIdAndDelete(reviewId);
    res.redirect(`/campspots/${id}`);
    // res.send("Delete me")
}))

module.exports = router;