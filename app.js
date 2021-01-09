const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate_Engine = require('ejs-mate');
const {campspotSchema, reviewSchema } = require('./schemas.js');
const catchAsync = require('./utilities/catchAsync');
const ExpressError = require('./utilities/ExpressError');
const methodOverride = require('method-override'); // from Express
const Campspot = require('./models/campspot');
const Review = require('./models/review');

const campspots = require('./routes/campspots');



// local development database. 
mongoose.connect('mongodb://localhost:27017/main-base', {
    useNewUrlParser: true, // https://mongoosejs.com/docs/deprecations.html
    useCreateIndex: true,
    useUnifiedTopology: true
});

// =============================================================================
// Tells us if we are connected. 
// =============================================================================
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("We have successfully connected.\n")
});
// =============================================================================

const app = express();

app.engine('ejs', ejsMate_Engine);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

//Parse the body
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method')); // query string we use will be '_method', allows us to use 'PUT'


const validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if(error){ 
        // then we map over over every error.detail message.
        const msg = error.details.map(el = el.message).join(',')
        throw new ExpressError(msg, 400); // When caught, gets thrown to app.use(a, b, c, next);
    }else{
        next();
    }
}

// Path to pre-fix links to start with this path. 
app.use('/campspots', campspots);

app.get('/', (req, res) => {
    res.render('home');
})


// recall async returns a promise that guarantees a resolve
// app.get('/makecampspot', async (req, res) => {
//     // Creating new camp spot. 
//     const camp = new Campspot({ title: 'New spot: Back yeard', description: 'Elite camping sites' });
//     await camp.save();
//     res.send(camp);
// })

app.post('/campspots/:id/reviews', validateReview, catchAsync(async(req, res) => {
    // res.send("We made it, post request succeeded.")
    const campspot = await Campspot.findById(req.params.id);
    const review = new Review(req.body.review);
    campspot.reviews.push(review); //recall reviews property from campspot.js

    await review.save();
    await campspot.save();

    res.redirect(`/campspots/${campspot._id}/:id`);
}))

app.delete('/campspots/:id/reviews/:reviewId', catchAsync(async(req, res) => {
    const {id, reviewId } = req.params;
    Campspot.findByIdAndUpdate(id, {$pull: {reviews: reviewId}}); // review is an array of id's
    await Review.findByIdAndDelete(reviewId);
    res.redirect(`/campspots/${id}`);
    // res.send("Delete me")
}))


// Only runs if nothing else was matched first.
// This error handler uses next() and calls the next function
app.all('*', (req, res, next) => {
    next(new ExpressError('PAGE not found', 404));
})

app.use((err, req, res, next) =>{
    // Destructor from err. extracting a variable from err, and giving the variable a default.
    const { statusCode=500, message='Shits going down.' } = err;
    res.status(statusCode).render('error', { err} )
})

app.listen(3000, () => {
    console.log('\nRunning from port 3000 ... ');
}) 







