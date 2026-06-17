const express = require('express');
const router = express.Router();
const { ensureAuth } = require('../middleware/auth');
const DonorProfile = require('../models/DonorProfile');
const BloodRequest = require('../models/BloodRequest');
const User = require('../models/User');
const { isCompatible, incompatibilityReason, haversineDistance } = require('../config/bloodCompat');

router.get('/', ensureAuth, async (req, res) => {
  try {
    const donor = await DonorProfile.findOne({ user: req.user._id });
    const myRequests = await BloodRequest.find({ postedBy: req.user._id }).sort({ createdAt: -1 });

    let matchedRequests = [];
    if (donor && donor.isEligible && donor.isAvailable) {
      const allRequests = await BloodRequest.find({ status: { $in: ['pending', 'matched'] } })
        .populate('postedBy', 'name email');

      matchedRequests = allRequests.map(req => {
        const compatible = isCompatible(donor.bloodGroup, req.bloodGroupNeeded);
        let distance = null;
        if (donor.lat && donor.lng && req.lat && req.lng) {
          distance = haversineDistance(donor.lat, donor.lng, req.lat, req.lng);
        }
        const reason = compatible ? null : incompatibilityReason(donor.bloodGroup, req.bloodGroupNeeded);
        const inRange = distance === null || distance <= 50;
        return { request: req, compatible, distance, reason, inRange };
      }).filter(m => m.inRange);
    }

    res.render('dashboard/index', {
      title: 'Dashboard - BloodLink',
      user: req.user,
      donor,
      myRequests,
      matchedRequests,
      success: req.flash('success'),
      error: req.flash('error')
    });
  } catch (err) {
    console.error(err);
    res.redirect('/');
  }
});

// Donor setup GET
router.get('/donor/setup', ensureAuth, async (req, res) => {
  const donor = await DonorProfile.findOne({ user: req.user._id });
  res.render('dashboard/donor-setup', { title: 'Donor Profile - BloodLink', user: req.user, donor, error: req.flash('error'), success: req.flash('success') });
});

// Donor setup POST
router.post('/donor/setup', ensureAuth, async (req, res) => {
  try {
    const { bloodGroup, age, gender, weight, lastDonatedAt, medicalConditions, onMedication, city, pincode, lat, lng, isAvailable, contactMethod, phone } = req.body;
    const conditions = Array.isArray(medicalConditions) ? medicalConditions : (medicalConditions ? [medicalConditions] : []);
    const lastDonated = lastDonatedAt ? new Date(lastDonatedAt) : null;
    const threeMonthsAgo = new Date(); threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
    const isEligible = parseFloat(weight) >= 45 && conditions.length === 0 && (!lastDonated || lastDonated < threeMonthsAgo) && onMedication !== 'yes';

    await DonorProfile.findOneAndUpdate(
      { user: req.user._id },
      { user: req.user._id, bloodGroup, age: parseInt(age), gender, weight: parseFloat(weight), lastDonatedAt: lastDonated, medicalConditions: conditions, onMedication: onMedication === 'yes', city, pincode, lat: lat ? parseFloat(lat) : null, lng: lng ? parseFloat(lng) : null, isAvailable: isAvailable === 'on' || isAvailable === 'true', contactMethod, phone, isEligible },
      { upsert: true, new: true }
    );
    req.flash('success', 'Donor profile saved successfully!');
    res.redirect('/dashboard');
  } catch (err) {
    console.error(err);
    req.flash('error', 'Error saving donor profile.');
    res.redirect('/dashboard/donor/setup');
  }
});

// Accept a blood request (donor accepts)
router.post('/donor/accept/:requestId', ensureAuth, async (req, res) => {
  try {
    const donor = await DonorProfile.findOne({ user: req.user._id });
    if (!donor) return res.redirect('/dashboard');
    const request = await BloodRequest.findById(req.params.requestId).populate('postedBy');
    if (!request) return res.redirect('/dashboard');

    const alreadyAccepted = request.matches.find(m => m.donor.toString() === donor._id.toString() && m.status === 'accepted');
    if (!alreadyAccepted) {
      request.matches.push({ donor: donor._id, status: 'accepted', compatibilityReason: `${donor.bloodGroup} is compatible with ${request.bloodGroupNeeded}`, aiScore: 90, notifiedAt: new Date() });
      request.status = 'matched';
      await request.save();

      // Try SMS if Twilio configured
      try {
        const twilio = require('twilio')(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
        await twilio.messages.create({
          body: `BloodLink Alert: Donor found for ${request.patientName}!\nDonor: ${req.user.name}\nBlood Type: ${donor.bloodGroup}\nPhone: ${donor.phone}\nCity: ${donor.city}\nPlease contact donor to arrange hospital visit.`,
          from: process.env.TWILIO_PHONE_NUMBER,
          to: request.contactPhone.startsWith('+') ? request.contactPhone : `+91${request.contactPhone}`
        });
      } catch (smsErr) {
        console.log('SMS not sent (Twilio not configured):', smsErr.message);
      }
    }
    req.flash('success', `You accepted the request for ${request.patientName}. The contact person has been notified via SMS.`);
    res.redirect('/dashboard');
  } catch (err) {
    console.error(err);
    res.redirect('/dashboard');
  }
});

// Mark patient recovered
router.post('/request/:requestId/recovered', ensureAuth, async (req, res) => {
  try {
    const request = await BloodRequest.findOne({ _id: req.params.requestId, postedBy: req.user._id });
    if (!request) return res.redirect('/dashboard');
    request.status = 'fulfilled';
    await request.save();

    // Update donor's lives saved
    const acceptedMatch = request.matches.find(m => m.status === 'accepted' || m.status === 'completed');
    if (acceptedMatch) {
      await DonorProfile.findByIdAndUpdate(acceptedMatch.donor, {
        $inc: { livesSaved: 1 },
        lastDonatedAt: new Date(),
        $push: { donationHistory: { requestId: request._id, date: new Date(), patientName: request.patientName } }
      });
      await BloodRequest.findByIdAndUpdate(request._id, { 'matches.$[m].status': 'completed' }, { arrayFilters: [{ 'm.donor': acceptedMatch.donor }] });
    }
    req.flash('success', `${request.patientName} marked as recovered. The donor's life saved count has been updated!`);
    res.redirect('/dashboard');
  } catch (err) {
    console.error(err);
    res.redirect('/dashboard');
  }
});

module.exports = router;
