const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const methodOverride = require('method-override'); // from Express
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

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

//Parse the body
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method')); // query string we use will be '_method', allows us to use 'PUT'

app.get('/', (req, res) => {
    res.render('home');
})

app.get('/campspots', async (req, res) => {
    const campspots = await Campspot.find({});
    res.render('campspots/index', { campspots }) // campspots is how we render it inside index.js
})

app.get('/campspots/new', (req, res) => {
    res.render('campspots/new');
})

app.post('/campspots', async (req, res) => {
    const campspot = new Campspot(req.body.campspot); // empty by default.
    await campspot.save();
    res.redirect(`/campspots/${campspot._id}`);
})


// Show page
app.get('/campspots/:id', async (req, res,) => {
    const campspot = await Campspot.findById(req.params.id);
    res.render('campspots/show', { campspot });
});

app.get('/campspots/:id/edit', async (req, res) => {
    const campspot = await Campspot.findById(req.params.id);
    res.render('campspots/edit', { campspot }); // take 'campspot' and pass it down to /edit
})






app.put('/campspots/:id', async (req, res) => {
    // res.send("Testing app.put request /:id")
    const { id } = req.params;
    // Spread operator '...'
    const campspot = await Campspot.findByIdAndUpdate(id, { ...req.body.campspot });
    res.redirect(`/campspots/${campspot._id}`)
})



// A form sends a post request to this url, and fake out express, to make it seem its a delete request
// because of method-override
app.delete('/campspots/:id', async (req, res) => {
    const { id } = req.params;
    await Campspot.findByIdAndDelete(id);
    res.redirect('/campspots');
});

// recall async returns a promise that guarantees a resolve
// app.get('/makecampspot', async (req, res) => {
//     // Creating new camp spot. 
//     const camp = new Campspot({ title: 'New spot: Back yeard', description: 'Elite camping sites' });
//     await camp.save();
//     res.send(camp);
// })


app.listen(3000, () => {
    console.log('\nRunning from port 3000 ... ');
})