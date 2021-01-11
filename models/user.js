const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');

const UserSchema = new ({
    email: {
        type: String,
        required: true
    }
});

// Passing in the dependent package.
UserSchema.plugin(passportLocalMongoose); 

module.exports = mongoose.model('User', UserSchema);