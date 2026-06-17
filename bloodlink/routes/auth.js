const express = require('express');
const router = express.Router();
const passport = require('passport');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { ensureGuest } = require('../middleware/auth');

// Login page
router.get('/login', ensureGuest, (req, res) => {
  res.render('auth/login', { title: 'Login - BloodLink', error: req.flash('error'), success: req.flash('success') });
});

// Register page
router.get('/register', ensureGuest, (req, res) => {
  res.render('auth/register', { title: 'Register - BloodLink', error: req.flash('error') });
});

// Local login
router.post('/login', (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) return next(err);
    if (!user) {
      req.flash('error', info.message);
      return res.redirect('/auth/login');
    }
    req.logIn(user, (err) => {
      if (err) return next(err);
      const returnTo = req.session.returnTo || '/dashboard';
      delete req.session.returnTo;
      res.redirect(returnTo);
    });
  })(req, res, next);
});

// Local register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, confirmPassword, phone, city } = req.body;
    if (password !== confirmPassword) {
      req.flash('error', 'Passwords do not match.');
      return res.redirect('/auth/register');
    }
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      req.flash('error', 'An account with that email already exists.');
      return res.redirect('/auth/register');
    }
    const hash = await bcrypt.hash(password, 12);
    const user = await User.create({ name, email, password: hash, phone, city });
    req.logIn(user, (err) => {
      if (err) return res.redirect('/auth/login');
      res.redirect('/dashboard');
    });
  } catch (err) {
    console.error(err);
    req.flash('error', 'Something went wrong. Please try again.');
    res.redirect('/auth/register');
  }
});

// Google OAuth
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback', passport.authenticate('google', { failureRedirect: '/auth/login', failureFlash: true }), (req, res) => {
  const returnTo = req.session.returnTo || '/dashboard';
  delete req.session.returnTo;
  res.redirect(returnTo);
});

// Logout
router.get('/logout', (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    req.flash('success', 'You have been logged out.');
    res.redirect('/');
  });
});

module.exports = router;
