const express = require('express');
const router = express.Router({ mergeParams: true });

const Campspot = require('../models/campspot');
const Review = require('../models/review');

const { reviewSchema } = require('../schemas.js');


const ExpressError = require('../utils/ExpressError');
const catchAsync = require('../utils/catchAsync');

const validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
}



router.post('/', validateReview, catchAsync(async (req, res) => {
    const campspot = await Campspot.findById(req.params.id);
    const review = new Review(req.body.review);
    campspot.reviews.push(review);
    await review.save();
    await campspot.save();
    req.flash('success', 'Created new review!');
    res.redirect(`/campspots/${campspot._id}`);
}))

router.delete('/:reviewId', catchAsync(async (req, res) => {
    const { id, reviewId } = req.params;
    await Campspot.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    req.flash('success', 'Successfully deleted review')
    res.redirect(`/campspots/${id}`);
}))

module.exports = router;