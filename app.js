const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate_Engine = require('ejs-mate');
const Joi = require('joi');
const catchAsync = require('./utilities/catchAsync');
const methodOverride = require('method-override'); // from Express
const ExpressError = require('./utilities/catchAsync');
const Campspot = require('./models/campspot');



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

app.get('/', (req, res) => {
    res.render('home');
})

app.get('/campspots', catchAsync(async (req, res) => {
    const campspots = await Campspot.find({});
    res.render('campspots/index', { campspots }) // campspots is how we render it inside index.js
}))

app.get('/campspots/new', (req, res) => {
    res.render('campspots/new');
})

app.post('/campspots', catchAsync(async(req, res, next) => {
    // if(!req.body.campspot) throw new ExpressError('Invalid camp spot data.', 404); // Infrastructure set up. 

    // SCHEMA DEFINED
    const campspotSchema = Joi.object({
        campspot: Joi.object().required()({
            title: Joi.string().required(),
            price: Joi.number().required.min(0),
            image: Joi.string().required(),
            location: Joi.string.required(),
            description: Joi.string().required()
        }).required()
    }) 
    const { error } = campspotSchema.validate(req.body);
    if(error){ // then we map over 
        const msg = error.details.map(el = el.message).join(',');
        throw new ExpressError(msg, 400); // When caught, gets thrown to app.use(a, b, c, next);
    }
    console.log(result);
    const campspot = new Campspot(req.body.campspot); // empty by default.
    await campspot.save();
    res.redirect(`/campspots/${campspot._id}`);  
}));

// Show page
app.get('/campspots/:id', catchAsync(async(req, res,) => {
    const campspot = await Campspot.findById(req.params.id);
    res.render('campspots/show', { campspot });
}));

app.get('/campspots/:id/edit', catchAsync(async (req, res) => {
    const campspot = await Campspot.findById(req.params.id);
    res.render('campspots/edit', { campspot }); // take 'campspot' and pass it down to /edit
}))

app.put('/campspots/:id', catchAsync(async (req, res) => {
    // res.send("Testing app.put request /:id")
    const { id } = req.params;
    // Spread operator '...'
    const campspot = await Campspot.findByIdAndUpdate(id, { ...req.body.campspot });
    res.redirect(`/campspots/${campspot._id}`)
}))



// A form sends a post request to this url, and fake out express, to make it seem its a delete request
// because of method-override
app.delete('/campspots/:id', catchAsync(async (req, res) => {
    const { id } = req.params;
    await Campspot.findByIdAndDelete(id);
    res.redirect('/campspots');
}));

// recall async returns a promise that guarantees a resolve
// app.get('/makecampspot', async (req, res) => {
//     // Creating new camp spot. 
//     const camp = new Campspot({ title: 'New spot: Back yeard', description: 'Elite camping sites' });
//     await camp.save();
//     res.send(camp);
// })


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