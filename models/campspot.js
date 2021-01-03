const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CampspotSchema = new Schema({
    title: String,
    image: String,
    price: Number,
    description: String,
    location: String
})

//export and compile.
module.exports = mongoose.model('Campspot', CampspotSchema);
