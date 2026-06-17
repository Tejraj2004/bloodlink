const express = require('express');
const router = express.Router();
const User = require('../models/User');
const DonorProfile = require('../models/DonorProfile');
const BloodRequest = require('../models/BloodRequest');

router.get('/', async (req, res) => {
  try {
    const totalDonors = await DonorProfile.countDocuments();
    const livesSaved = await DonorProfile.aggregate([{ $group: { _id: null, total: { $sum: '$livesSaved' } } }]);
    const criticalRequests = await BloodRequest.countDocuments({ urgency: 'critical', status: { $in: ['pending','matched'] } });
    res.render('index', {
      title: 'BloodLink - Every Drop Counts',
      user: req.user || null,
      totalDonors,
      livesSaved: livesSaved[0]?.total || 0,
      criticalRequests
    });
  } catch (err) {
    res.render('index', { title: 'BloodLink - Every Drop Counts', user: req.user || null, totalDonors: 0, livesSaved: 0, criticalRequests: 0 });
  }
});

module.exports = router;
