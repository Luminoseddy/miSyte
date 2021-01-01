const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
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


app.get('/', (req, res) => {
    res.render('home');
})


// recall async returns a promise that guarantees a resolve
app.get('/makecampspot', async (req, res) => {
    // Creating new camp spot. 
    const camp = new Campspot({ title: 'New spot: Back yeard', description: 'Elite camping sites' });
    await camp.save();
    res.send(camp);
})


app.listen(3000, () => {
    console.log('\nRunning from port 3000 ... ');
})