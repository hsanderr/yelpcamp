if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}



console.log(process.env.SECRET);

const express = require('express');
const session = require('express-session');
const flash = require('connect-flash');
const app = express();
const path = require('path');
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const ExpressError = require('./utils/ExpressError');
const campgroundRoutes = require('./routes/campgrounds');
const reviewRoutes = require('./routes/reviews');
const userRoutes = require('./routes/users');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/yelp-camp';
const MongoStore = require('connect-mongo');
const secret = process.env.SECRET || 'thisshouldbeabettersecret';

app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true })); // Para conseguir ler req.body
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(mongoSanitize());



const store = MongoStore.create({
    mongoUrl: dbUrl,
    touchAfter: 24 * 60 * 60,
    crypto: {
        secret: secret
    }
});

store.on('error', function (e) {
    console.log('session store error', e);
});

const sessionConfig = {
    store,
    name: 'session',
    secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 3600 * 24 * 7,
        maxAge: 1000 * 3600 * 24 * 7
    }
}

app.use(session(sessionConfig));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com",
    "https://api.tiles.mapbox.com",
    "https://api.mapbox.com",
    "https://kit.fontawesome.com",
    "https://cdnjs.cloudflare.com",
    "https://cdn.jsdelivr.net",
];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com",
    "https://stackpath.bootstrapcdn.com",
    "https://api.mapbox.com",
    "https://api.tiles.mapbox.com",
    "https://fonts.googleapis.com",
    "https://use.fontawesome.com",
    "https://cdn.jsdelivr.net"
];
const connectSrcUrls = [
    "https://api.mapbox.com",
    "https://*.tiles.mapbox.com",
    "https://events.mapbox.com",
];
const fontSrcUrls = [];

app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            childSrc: ["blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "*.cloudinary.com",
                "https://res.cloudinary.com/dtwotjjae", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT! 
                "https://images.unsplash.com",
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

main().catch(err => console.log(err));

async function main() {
    await mongoose.connect(dbUrl);
    console.log('Database connected\n');

    app.use((req, res, next) => {
        res.locals.currentUser = req.user;
        res.locals.success = req.flash('success');
        res.locals.error = req.flash('error');
        next();
    });

    app.get('/fakeUser', async (req, res) => {
        const user = new User({ email: 'hsl@gmail.com', username: 'sander' });
        const newUser = await User.register(user, 'chicken');
        res.send(newUser);
    });

    app.get('/', (req, res) => {
        res.render('home')
    });

    app.use('/', userRoutes)
    app.use('/campgrounds', campgroundRoutes);
    app.use('/campgrounds/:id/reviews', reviewRoutes);

    app.all('*', (err, req, res, next) => {
        console.log(err);
        next(new ExpressError('Page Not Found', 404));
    });

    app.use((err, req, res, next) => {
        const { message = 'Something went wrong', status = 500 } = err;
        if (!err.message) err.message = 'Oh No, Something Went Wrong!';
        res.status(status).render('error', { err });
    });
}

app.listen(3000, () => {
    console.log('Listening on port 3000');
});