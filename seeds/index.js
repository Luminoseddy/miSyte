// Runs seperately from node app, only when making changes to the model
const mongoose = require('mongoose');
const Campspot = require('../models/campspot');
const cities = require('./cities');
const { places, descriptors } = require('./seedHelpers');





// =============================================================================
// local development database. 
// =============================================================================
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




// pass in an array, return a random element from that array.
const sample = array => array[Math.floor(Math.random() * array.length)];

const seedDB = async () => {
    await Campspot.deleteMany({});

    for (let i = 0; i < 50; i++) {
        const r = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random() * 20) + 10;
        const camp = new Campspot({
            location: `${cities[r].city}, ${cities[r].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            image: 'https://source.unsplash.com/collection/483251',
            description: 'Testing for a long description',
            price
        })
        await camp.save();
    }
}


// Recall its async type function, which returns a promise.
// This automatically closes after execution. 
seedDB().then(() => {
    mongoose.connection.close();
})
