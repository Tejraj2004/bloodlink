const DonationCamp = require('../models/DonationCamp');
const { successResponse, errorResponse, paginatedResponse } = require('../utils/response');

exports.createCamp = async (req, res) => {
  try {
    const { name, venue, address, city, date, startTime, endTime, targetDonors, description, coordinates, bloodBankId } = req.body;
    const camp = await DonationCamp.create({
      organizer: req.user._id,
      bloodBank: bloodBankId||null,
      name, venue, address, city,
      date: new Date(date), startTime, endTime,
      targetDonors:+targetDonors||100, description,
      location: coordinates ? { type:'Point', coordinates } : undefined,
    });

    // Sync → notify all donors
    const sync = req.app.get('sync');
    if (sync) {
      await sync.campPublished(camp.toObject(), req.user.name || 'Blood Bank');
    }
    return successResponse(res,{ camp },'Camp created.',201);
  } catch(err){ return errorResponse(res,err.message); }
};

exports.listCamps = async (req, res) => {
  try {
    const { lat, lng, radius=100, city, status, page=1, limit=20 } = req.query;
    const filter = {};
    if (city)   filter.city = new RegExp(city,'i');
    if (status) filter.status = status;
    else        filter.date = { $gte: new Date() };
    let camps;
    if (lat&&lng) {
      camps = await DonationCamp.find({ ...filter, location:{ $near:{ $geometry:{ type:'Point', coordinates:[+lng,+lat] }, $maxDistance:+radius*1000 } } })
        .populate('organizer','name email').limit(+limit);
      return successResponse(res,{ camps });
    }
    const total = await DonationCamp.countDocuments(filter);
    camps = await DonationCamp.find(filter).populate('organizer','name email').sort('date').skip((page-1)*limit).limit(+limit);
    return paginatedResponse(res,camps,total,page,limit);
  } catch(err){ return errorResponse(res,err.message); }
};

exports.registerForCamp = async (req, res) => {
  try {
    const camp = await DonationCamp.findById(req.params.id);
    if (!camp) return errorResponse(res,'Camp not found.',404);
    if (camp.registeredDonors.includes(req.user._id)) return errorResponse(res,'Already registered.',400);
    if (camp.registeredDonors.length >= camp.targetDonors) return errorResponse(res,'Camp fully booked.',400);
    camp.registeredDonors.push(req.user._id);
    await camp.save();

    // Sync → notify blood bank
    const sync = req.app.get('sync');
    if (sync) await sync.donorRegisteredCamp(camp.toObject(), req.user);

    return successResponse(res,{ registered:camp.registeredDonors.length },'Registered successfully.');
  } catch(err){ return errorResponse(res,err.message); }
};

exports.getCamp = async (req, res) => {
  try {
    const camp = await DonationCamp.findById(req.params.id).populate('organizer','name email');
    if (!camp) return errorResponse(res,'Camp not found.',404);
    return successResponse(res,{ camp });
  } catch(err){ return errorResponse(res,err.message); }
};
