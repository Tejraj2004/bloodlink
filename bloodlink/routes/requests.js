const express = require('express');
const router = express.Router();
const { ensureAuth } = require('../middleware/auth');
const BloodRequest = require('../models/BloodRequest');
const DonorProfile = require('../models/DonorProfile');
const { isCompatible, incompatibilityReason, haversineDistance } = require('../config/bloodCompat');

router.get('/new', ensureAuth, (req, res) => {
  res.render('requests/new', { title: 'Post Blood Request - BloodLink', user: req.user, error: req.flash('error') });
});

router.post('/new', ensureAuth, async (req, res) => {
  try {
    const { patientName, patientAge, bloodGroupNeeded, unitsNeeded, hospitalName, hospitalAddress, wardRoom, attendingDoctor, lat, lng, city, contactPhone, contactPerson, notes, urgency } = req.body;
    await BloodRequest.create({ postedBy: req.user._id, patientName, patientAge: parseInt(patientAge), bloodGroupNeeded, unitsNeeded: parseInt(unitsNeeded)||1, hospitalName, hospitalAddress, wardRoom, attendingDoctor, lat: lat?parseFloat(lat):null, lng: lng?parseFloat(lng):null, city, contactPhone, contactPerson, notes, urgency });
    req.flash('success', 'Blood request posted! Matching donors will be notified.');
    res.redirect('/dashboard');
  } catch (err) {
    console.error(err);
    req.flash('error', 'Error posting request. Please fill all required fields.');
    res.redirect('/requests/new');
  }
});

router.get('/find', ensureAuth, async (req, res) => {
  try {
    const requests = await BloodRequest.find({ status: { $in: ['pending','matched'] } })
      .populate('postedBy','name')
      .sort({ urgency: -1, createdAt: -1 });
    res.render('requests/find', { title: 'Find Donors - BloodLink', user: req.user, requests, error: req.flash('error') });
  } catch (err) {
    res.redirect('/dashboard');
  }
});

module.exports = router;
