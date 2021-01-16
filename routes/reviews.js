const express = require('express');
const router = express.Router({mergeParams: true});
const { validateReview, isLoggedIn, isReviewAuthor } = require('../middleware'); // From middleware file, call these functions <--
const Campspot = require('../models/campspot');
const Review = require('../models/review');
const ExpressError = require('../utilities/ExpressError');
const catchAsync = require('../utilities/catchAsync');


router.post('/', validateReview, catchAsync(async(req, res) => {
    // res.send("We made it, post request succeeded.")
    const campspot = await Campspot.findById(req.params.id);
    const review = new Review(req.body.review);
    review.author = req.user._id;
    campspot.reviews.push(review); //recall reviews property from campspot.js
    await review.save();
    await campspot.save();
    req.flash('success', "Review successfully posted! Awesome!")
    res.redirect(`/campspots/${campspot._id}`);
}))





router.delete('/:reviewId', isLoggedin, isReviewAuthor, catchAsync(async(req, res) => {
    const {id, reviewId } = req.params;
    await Campspot.findByIdAndUpdate(id, {$pull: {reviews: reviewId}}); // review is an array of id's
    await Review.findByIdAndDelete(reviewId);
    req.flash('success', "Review successfully Deleted! :(")
    res.redirect(`/campspots/${id}`);
    // res.send("Delete me")
}))

module.exports = router;