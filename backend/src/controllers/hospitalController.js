const HospitalProfile = require('../models/HospitalProfile');
const BloodRequest    = require('../models/BloodRequest');
const Delivery        = require('../models/Delivery');
const { successResponse, errorResponse } = require('../utils/response');

exports.getProfile = async (req, res) => {
  try {
    const profile = await HospitalProfile.findOne({ user: req.user._id }).populate('user', 'name email phone');
    if (!profile) return errorResponse(res, 'Hospital profile not found.', 404);
    return successResponse(res, { profile });
  } catch (err) { return errorResponse(res, err.message); }
};

exports.updateProfile = async (req, res) => {
  try {
    const allowed = ['hospitalName','type','beds','address','city','state','pincode','emergencyContact','website','location'];
    const updates = {};
    allowed.forEach(f => { if (req.body[f] !== undefined) updates[f] = req.body[f]; });
    const profile = await HospitalProfile.findOneAndUpdate({ user: req.user._id }, updates, { new: true });
    return successResponse(res, { profile }, 'Profile updated.');
  } catch (err) { return errorResponse(res, err.message); }
};

exports.getDashboardStats = async (req, res) => {
  try {
    const profile = await HospitalProfile.findOne({ user: req.user._id });
    if (!profile) return errorResponse(res, 'Profile not found.', 404);

    const [active, inTransit, fulfilled, cancelled] = await Promise.all([
      BloodRequest.countDocuments({ hospital: profile._id, status: { $in: ['Pending','Processing','Allocated'] } }),
      BloodRequest.countDocuments({ hospital: profile._id, status: 'In Transit' }),
      BloodRequest.countDocuments({ hospital: profile._id, status: 'Fulfilled' }),
      BloodRequest.countDocuments({ hospital: profile._id, status: 'Cancelled' }),
    ]);

    const recentRequests = await BloodRequest.find({ hospital: profile._id })
      .populate('assignedBank', 'bankName city')
      .sort('-createdAt').limit(8);

    const activeDeliveries = await Delivery.find({
      toHospital: profile._id,
      status: { $in: ['Assigned','Picked Up','In Transit'] }
    }).populate('fromBank', 'bankName city').populate('driver', 'name phone');

    return successResponse(res, { profile, stats: { active, inTransit, fulfilled, cancelled }, recentRequests, activeDeliveries });
  } catch (err) { return errorResponse(res, err.message); }
};

exports.listHospitals = async (req, res) => {
  try {
    const { lat, lng, radius = 100, city } = req.query;
    let filter = { isVerified: true };
    if (city) filter.city = new RegExp(city, 'i');

    let hospitals;
    if (lat && lng) {
      hospitals = await HospitalProfile.find({
        ...filter,
        location: { $near: { $geometry: { type: 'Point', coordinates: [+lng, +lat] }, $maxDistance: +radius * 1000 } }
      }).populate('user', 'name email phone');
    } else {
      hospitals = await HospitalProfile.find(filter).populate('user', 'name email phone').limit(50);
    }
    return successResponse(res, { hospitals });
  } catch (err) { return errorResponse(res, err.message); }
};
