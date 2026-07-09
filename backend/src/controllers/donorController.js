const DonorProfile = require('../models/DonorProfile');
const User = require('../models/User');
const Appointment = require('../models/Appointment');
const BloodUnit = require('../models/BloodUnit');
const { successResponse, errorResponse, paginatedResponse } = require('../utils/response');
const { calculateDonorScore, getNextEligibleDate } = require('../utils/helpers');

// GET /donors/profile
exports.getProfile = async (req, res) => {
  try {
    const profile = await DonorProfile.findOne({ user: req.user._id }).populate('user', 'name email phone avatar');
    if (!profile) return errorResponse(res, 'Donor profile not found.', 404);
    return successResponse(res, { profile });
  } catch (err) {
    return errorResponse(res, err.message);
  }
};

// PUT /donors/profile
exports.updateProfile = async (req, res) => {
  try {
    const allowed = ['bloodGroup','dateOfBirth','gender','weight','address','city','state','pincode',
      'medicalConditions','medications','notifyBySMS','notifyByEmail','notifyByPush','location'];
    const updates = {};
    allowed.forEach(f => { if (req.body[f] !== undefined) updates[f] = req.body[f]; });

    const profile = await DonorProfile.findOneAndUpdate(
      { user: req.user._id }, updates, { new: true, runValidators: true }
    ).populate('user', 'name email phone avatar');

    return successResponse(res, { profile }, 'Profile updated.');
  } catch (err) {
    return errorResponse(res, err.message);
  }
};

// GET /donors/eligibility
exports.checkEligibility = async (req, res) => {
  try {
    const profile = await DonorProfile.findOne({ user: req.user._id });
    if (!profile) return errorResponse(res, 'Profile not found.', 404);

    const now = new Date();
    let eligible = true;
    let reason = '';

    if (profile.lastDonationDate) {
      const next = getNextEligibleDate(profile.lastDonationDate);
      if (now < next) {
        eligible = false;
        reason = `Next eligible date: ${next.toDateString()}`;
      }
    }
    if (profile.medicalConditions?.length) {
      const blocking = ['HIV', 'Hepatitis', 'Cancer', 'Active TB'];
      const found = profile.medicalConditions.find(c => blocking.some(b => c.toLowerCase().includes(b.toLowerCase())));
      if (found) { eligible = false; reason = `Medical condition: ${found}`; }
    }

    profile.isEligible = eligible;
    profile.eligibilityNote = reason;
    if (profile.lastDonationDate)
      profile.nextEligibleDate = getNextEligibleDate(profile.lastDonationDate);
    await profile.save();

    return successResponse(res, { eligible, reason, nextEligibleDate: profile.nextEligibleDate });
  } catch (err) {
    return errorResponse(res, err.message);
  }
};

// GET /donors/history
exports.getDonationHistory = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const profile = await DonorProfile.findOne({ user: req.user._id });
    if (!profile) return errorResponse(res, 'Profile not found.', 404);

    const total = await BloodUnit.countDocuments({ donor: profile._id });
    const units = await BloodUnit.find({ donor: profile._id })
      .populate('bloodBank', 'bankName city')
      .sort('-collectedAt')
      .skip((page - 1) * limit)
      .limit(+limit);

    return paginatedResponse(res, units, total, page, limit, 'Donation history fetched.');
  } catch (err) {
    return errorResponse(res, err.message);
  }
};

// GET /donors/appointments
exports.getAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({ donor: req.user._id })
      .populate('bloodBank', 'bankName city address')
      .sort('-scheduledDate');
    return successResponse(res, { appointments });
  } catch (err) {
    return errorResponse(res, err.message);
  }
};

// POST /donors/appointments
exports.bookAppointment = async (req, res) => {
  try {
    const { bloodBankId, scheduledDate, scheduledTime, notes } = req.body;

    const profile = await DonorProfile.findOne({ user: req.user._id });
    if (!profile?.isEligible)
      return errorResponse(res, 'You are not eligible to donate at this time.', 400);

    const appointment = await Appointment.create({
      donor: req.user._id,
      bloodBank: bloodBankId,
      scheduledDate,
      scheduledTime,
      notes,
    });

    return successResponse(res, { appointment }, 'Appointment booked successfully.', 201);
  } catch (err) {
    return errorResponse(res, err.message);
  }
};

// GET /donors/stats
exports.getStats = async (req, res) => {
  try {
    const profile = await DonorProfile.findOne({ user: req.user._id });
    if (!profile) return errorResponse(res, 'Profile not found.', 404);

    const score = calculateDonorScore(profile);
    profile.donorScore = score;
    await profile.save();

    return successResponse(res, {
      totalDonations: profile.totalDonations,
      livesImpacted: profile.totalDonations * 3,
      donorScore: score,
      badges: profile.badges,
      isEligible: profile.isEligible,
      nextEligibleDate: profile.nextEligibleDate,
      lastDonationDate: profile.lastDonationDate,
    });
  } catch (err) {
    return errorResponse(res, err.message);
  }
};

// GET /donors/nearby-banks?lat=&lng=&radius=
exports.getNearbyBanks = async (req, res) => {
  try {
    const { lat, lng, radius = 50 } = req.query;
    if (!lat || !lng) return errorResponse(res, 'lat and lng required.', 400);

    const BloodBankProfile = require('../models/BloodBankProfile');
    const banks = await BloodBankProfile.find({
      location: {
        $near: {
          $geometry: { type: 'Point', coordinates: [+lng, +lat] },
          $maxDistance: +radius * 1000,
        }
      },
      isVerified: true,
    }).populate('user', 'name email phone');

    return successResponse(res, { banks });
  } catch (err) {
    return errorResponse(res, err.message);
  }
};

// Admin: GET /donors (list all with filters)
exports.listDonors = async (req, res) => {
  try {
    const { page = 1, limit = 20, bloodGroup, city, eligible } = req.query;
    const filter = {};
    if (bloodGroup) filter.bloodGroup = bloodGroup;
    if (city) filter.city = new RegExp(city, 'i');
    if (eligible !== undefined) filter.isEligible = eligible === 'true';

    const total = await DonorProfile.countDocuments(filter);
    const donors = await DonorProfile.find(filter)
      .populate('user', 'name email phone avatar')
      .sort('-donorScore')
      .skip((page - 1) * limit)
      .limit(+limit);

    return paginatedResponse(res, donors, total, page, limit);
  } catch (err) {
    return errorResponse(res, err.message);
  }
};
