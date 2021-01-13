const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate_Engine = require('ejs-mate');
const session = require('express-session');
const flash = require('connect-flash');

const ExpressError = require('./utilities/ExpressError');
const methodOverride = require('method-override'); // from Express

const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user');


const userRoutes = require('./routes/users');
const campspotRoutes = require('./routes/campspots');
const reviewRoutes = require('./routes/reviews');


// local development database. 
mongoose.connect('mongodb://localhost:27017/main-base', {
    useNewUrlParser: true, // https://mongoosejs.com/docs/deprecations.html
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false
});

// =============================================================================
// Tells us if we are connected. 
// =============================================================================
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});
// =============================================================================

const app = express();
app.engine('ejs', ejsMate_Engine);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

//Parse the body
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method')); // query string we use will be '_method', allows us to use 'PUT'
app.use(express.static(path.join(__dirname, 'public')));

const sessionConfig = {
    secret: 'thisshouldbeabetterSecret dude.', 
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}

app.use(session(sessionConfig));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session()); // Check out passport docs for more info eddy.
passport.use(new LocalStrategy(User.authenticate())); // hello passport, use localStrategy

passport.serializeUser(User.serializeUser()); // Tells passport how to serailze a user. 
passport.deserializeUser(User.deserializeUser());// Tells user how to get out of the session.

// Every single request, take whats in flash under success, and have access locally with key 'success'.
app.use((req, res, next) => {
    console.log(req.session)
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})

app.use('/', userRoutes)
app.use('/campspots', campspotRoutes); // Path to pre-fix links to start with this path. 
app.use('/campspots/:id/reviews', reviewRoutes);

app.get('/', (req, res) => {
    res.render('home');
})

// Only runs if nothing else was matched first.
// This error handler uses next() and calls the next function
app.all('*', (req, res, next) => {
    next(new ExpressError('PAGE not found', 404));
})

app.use((err, req, res, next) =>{
    // Destructor from err. extracting a variable from err, and giving the variable a default.
    const { statusCode=500 } = err;
    if (!err.message) err.message = 'Oh No, Something Went Wrong!'
    res.status(statusCode).render('error', { err })
})

app.listen(3000, () => {
    console.log('\nRunning from port 3000 ... ');
}) 

// Checked

