const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CampspotSchema = new Schema({
    title: String,
    price: String,
    description: String,
    location: String
})

//export and compile.
module.exports = mongoose.model('Campspot', CampspotSchema);