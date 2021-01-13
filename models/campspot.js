const mongoose = require('mongoose');
const Review = require('./review')
const Schema = mongoose.Schema

const CampspotSchema = new Schema({
    title: String,
    image: String,
    price: Number,
    description: String,
    location: String,
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Review'
        }
    ]   
});

// Query middleware:  passes in a document that it found, to the function
CampspotSchema.post('findOneAndDelete', async function(doc) {
    console.log("deletion complete");
    if(doc){
        await Review.deleteMany({
            _id:{
                $in: doc.reviews
            }
        })
    }
})

//export and compile.
module.exports = mongoose.model('Campspot', CampspotSchema);


// checked 