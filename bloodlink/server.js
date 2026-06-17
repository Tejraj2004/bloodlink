require('dotenv').config();
const express = require('express');
const session = require('express-session');
const passport = require('passport');
const MongoStore = require('connect-mongo');
const flash = require('express-flash');
const methodOverride = require('method-override');
const path = require('path');
const connectDB = require('./config/db');

// Connect Database
connectDB();

// Passport config
require('./config/passport');

const app = express();

// View engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Static files
app.use(express.static(path.join(__dirname, 'public')));

// Body parsing
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Method override
app.use(methodOverride('_method'));

// Session
app.use(session({
  secret: process.env.SESSION_SECRET || 'bloodlink_secret',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
  mongoUrl: process.env.MONGO_URI,
  touchAfter: 24 * 3600
}),
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  }
}));

// Flash messages
app.use(flash());

// Passport
app.use(passport.initialize());
app.use(passport.session());

// Global locals
app.use((req, res, next) => {
  res.locals.user = req.user || null;
  next();
});

// Routes
app.use('/', require('./routes/index'));
app.use('/auth', require('./routes/auth'));
app.use('/dashboard', require('./routes/dashboard'));
app.use('/requests', require('./routes/requests'));
app.use('/admin', require('./routes/admin'));

// 404 handler
app.use((req, res) => {
  res.status(404).render('404', { title: 'Page Not Found - BloodLink', user: req.user || null });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something went wrong! Please try again.');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`\n🩸 BloodLink running on http://localhost:${PORT}`);
  console.log(`📊 Admin panel: http://localhost:${PORT}/admin`);
  console.log(`🔐 Environment: ${process.env.NODE_ENV || 'development'}\n`);
});
