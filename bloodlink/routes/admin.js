const express = require('express');
const router = express.Router();
const { ensureAdmin } = require('../middleware/auth');
const User = require('../models/User');
const DonorProfile = require('../models/DonorProfile');
const BloodRequest = require('../models/BloodRequest');

router.get('/', ensureAdmin, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalDonors = await DonorProfile.countDocuments();
    const activeRequests = await BloodRequest.countDocuments({ status: { $in: ['pending','matched'] } });
    const fulfilledRequests = await BloodRequest.countDocuments({ status: 'fulfilled' });
    const livesSaved = await DonorProfile.aggregate([{ $group: { _id: null, total: { $sum: '$livesSaved' } } }]);
    const recentUsers = await User.find().sort({ createdAt: -1 }).limit(10);
    const recentRequests = await BloodRequest.find().sort({ createdAt: -1 }).limit(10).populate('postedBy','name email');
    const bloodGroupStats = await DonorProfile.aggregate([{ $group: { _id: '$bloodGroup', count: { $sum: 1 } } }]);

    res.render('admin/index', {
      title: 'Admin Panel - BloodLink', user: req.user,
      stats: { totalUsers, totalDonors, activeRequests, fulfilledRequests, livesSaved: livesSaved[0]?.total || 0 },
      recentUsers, recentRequests, bloodGroupStats,
      success: req.flash('success'), error: req.flash('error')
    });
  } catch (err) {
    console.error(err);
    res.redirect('/dashboard');
  }
});

router.get('/users', ensureAdmin, async (req, res) => {
  const users = await User.find().sort({ createdAt: -1 });
  res.render('admin/users', { title: 'Manage Users - BloodLink', user: req.user, users });
});

router.post('/users/:id/role', ensureAdmin, async (req, res) => {
  await User.findByIdAndUpdate(req.params.id, { role: req.body.role });
  req.flash('success', 'User role updated.');
  res.redirect('/admin/users');
});

router.post('/users/:id/delete', ensureAdmin, async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  req.flash('success', 'User deleted.');
  res.redirect('/admin/users');
});

router.get('/requests', ensureAdmin, async (req, res) => {
  const filter = req.query.status ? { status: req.query.status } : {};
  const requests = await BloodRequest.find(filter).populate('postedBy','name email').sort({ createdAt: -1 });
  res.render('admin/requests', { title: 'Manage Requests - BloodLink', user: req.user, requests, currentFilter: req.query.status || 'all' });
});

router.post('/requests/:id/status', ensureAdmin, async (req, res) => {
  await BloodRequest.findByIdAndUpdate(req.params.id, { status: req.body.status });
  req.flash('success', 'Request status updated.');
  res.redirect('/admin/requests');
});

module.exports = router;
