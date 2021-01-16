const { campspotSchema, reviewSchema } = require('./schemas.js');
const ExpressError = require('./utilities/ExpressError');
const Campspot = require('./models/campspot');

module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.session.returnTo = req.originalUrl
        req.flash('error', 'You must be signed in first!');
        return res.redirect('/login');
    }
    next();
}


module.exports.validateCampspot = (req, res, next) => {
    const { error } = campspotSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
}

module.exports.isAuthor = async(req, res, next) => {
    const { id } = req.params;
    const campspot = await Campspot.findById(id);
    if(!campspot.author.equals(req.user._id)){ // Check if its the correct user to do an action delete, edit
        req.flash('error', "You do not have permission to do that");
        return res.redirect(`/campspot/${id}`);
    }
    next(); // Meaning user has access, continue
}

// This require reviewSchema. 
module.exports.validateReview = (req, res, next) => {
    // validate with req.body.
    const { error } = reviewSchema.validate(req.body);
    if(error){ // then we map over over every error.detail message.
        const msg = error.details.map(el = el.message).join(',');
        throw new ExpressError(msg, 400); // When caught, gets thrown to app.use(a, b, c, next);
    }else{
        next();
    }
}