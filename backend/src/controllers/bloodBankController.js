const BloodBankProfile = require('../models/BloodBankProfile');
const BloodUnit        = require('../models/BloodUnit');
const DonorProfile     = require('../models/DonorProfile');
const Appointment      = require('../models/Appointment');
const { generateUnitId, getExpiryDate, getNextEligibleDate, calculateDonorScore } = require('../utils/helpers');
const { successResponse, errorResponse, paginatedResponse } = require('../utils/response');

exports.getProfile = async (req, res) => {
  try {
    const profile = await BloodBankProfile.findOne({ user: req.user._id }).populate('user','name email phone');
    if (!profile) return errorResponse(res,'Blood bank profile not found.',404);
    return successResponse(res,{ profile });
  } catch(err){ return errorResponse(res,err.message); }
};

exports.updateProfile = async (req, res) => {
  try {
    const allowed = ['bankName','address','city','state','pincode','contactPhone','emergencyPhone','website','location','lowStockThreshold','criticalThreshold'];
    const updates = {};
    allowed.forEach(f=>{ if(req.body[f]!==undefined) updates[f]=req.body[f]; });
    const profile = await BloodBankProfile.findOneAndUpdate({ user: req.user._id },updates,{ new:true });
    return successResponse(res,{ profile },'Profile updated.');
  } catch(err){ return errorResponse(res,err.message); }
};

exports.getInventory = async (req, res) => {
  try {
    const profile = await BloodBankProfile.findOne({ user: req.user._id });
    if (!profile) return errorResponse(res,'Profile not found.',404);
    const expiringUnits = await BloodUnit.find({
      bloodBank: profile._id, status:'Approved',
      expiresAt:{ $lte: new Date(Date.now()+7*86400000) }
    }).select('bloodGroup component expiresAt unitId');
    const alerts = [];
    profile.inventory.forEach(inv=>{
      const total = inv.rbc+inv.plasma+inv.platelets+inv.wholeBlood;
      if(total <= profile.criticalThreshold) alerts.push({ bloodGroup:inv.bloodGroup, level:'critical', total });
      else if(total <= profile.lowStockThreshold) alerts.push({ bloodGroup:inv.bloodGroup, level:'low', total });
    });
    return successResponse(res,{ inventory:profile.inventory, expiringUnits, alerts });
  } catch(err){ return errorResponse(res,err.message); }
};

exports.recordDonation = async (req, res) => {
  try {
    const { donorId, bloodGroup, component, volume, notes } = req.body;
    const profile = await BloodBankProfile.findOne({ user: req.user._id });
    if (!profile) return errorResponse(res,'Profile not found.',404);

    const unitId    = generateUnitId();
    const expiresAt = getExpiryDate(component);

    let donorProfile = null, donorName = 'Walk-in Donor', donorUserId = null;
    if (donorId) {
      donorProfile = await DonorProfile.findById(donorId).populate('user','name _id');
      donorName    = donorProfile?.user?.name || 'Walk-in Donor';
      donorUserId  = donorProfile?.user?._id;
    }

    const unit = await BloodUnit.create({
      unitId, bloodBank: profile._id,
      donor: donorProfile?._id || null,
      donorName, bloodGroup, component,
      volume: volume||450, expiresAt, notes, status:'Collected',
    });

    if (donorProfile) {
      donorProfile.totalDonations   += 1;
      donorProfile.lastDonationDate  = new Date();
      donorProfile.nextEligibleDate  = getNextEligibleDate(new Date());
      donorProfile.isEligible        = false;
      donorProfile.donorScore        = calculateDonorScore(donorProfile);
      await donorProfile.save();
    }

    // Real-time sync
    const sync = req.app.get('sync');
    if (sync) {
      await sync.unitRecorded({ ...unit.toObject(), donorUserId }, profile);
    }

    return successResponse(res,{ unit },'Blood unit recorded.',201);
  } catch(err){ return errorResponse(res,err.message); }
};

exports.updateTTI = async (req, res) => {
  try {
    const { hiv, hbv, hcv, malaria, syphilis, testedBy } = req.body;
    const unit = await BloodUnit.findOne({ unitId: req.params.unitId });
    if (!unit) return errorResponse(res,'Unit not found.',404);

    unit.tti = { hiv, hbv, hcv, malaria, syphilis, testedAt:new Date(), testedBy };
    const allClear = [hiv,hbv,hcv,malaria,syphilis].every(r=>r==='Clear');
    unit.status = allClear ? 'Approved' : 'Rejected';
    await unit.save();

    if (allClear) {
      const profile = await BloodBankProfile.findById(unit.bloodBank);
      const inv = profile.inventory.find(i=>i.bloodGroup===unit.bloodGroup);
      if (inv) {
        const key = unit.component==='Whole Blood'?'wholeBlood':unit.component==='RBC'?'rbc':unit.component==='Plasma'?'plasma':'platelets';
        inv[key]        += 1;
        inv.lastUpdated  = new Date();
        await profile.save();

        const sync = req.app.get('sync');
        if (sync) {
          await sync.ttiCompleted(unit.toObject(), profile);
          // Check thresholds
          const total = inv.rbc+inv.plasma+inv.platelets+inv.wholeBlood;
          if (total <= profile.criticalThreshold || total <= profile.lowStockThreshold) {
            const alerts = [{ bloodGroup:inv.bloodGroup, level: total<=profile.criticalThreshold?'critical':'low', total }];
            await sync.thresholdAlert(profile, alerts);
          }
        }
      }
    }
    return successResponse(res,{ unit },`Unit ${allClear?'approved':'rejected'} after TTI.`);
  } catch(err){ return errorResponse(res,err.message); }
};

exports.listUnits = async (req, res) => {
  try {
    const profile = await BloodBankProfile.findOne({ user: req.user._id });
    if (!profile) return errorResponse(res,'Profile not found.',404);
    const { status, bloodGroup, page=1, limit=20 } = req.query;
    const filter = { bloodBank: profile._id };
    if (status)     filter.status     = status;
    if (bloodGroup) filter.bloodGroup = bloodGroup;
    const total = await BloodUnit.countDocuments(filter);
    const units = await BloodUnit.find(filter).sort('-collectedAt').skip((page-1)*limit).limit(+limit);
    return paginatedResponse(res,units,total,page,limit);
  } catch(err){ return errorResponse(res,err.message); }
};

exports.getAppointments = async (req, res) => {
  try {
    const profile = await BloodBankProfile.findOne({ user: req.user._id });
    const appointments = await Appointment.find({ bloodBank: profile._id })
      .populate('donor','name email phone').sort('scheduledDate');
    return successResponse(res,{ appointments });
  } catch(err){ return errorResponse(res,err.message); }
};

exports.getDashboardStats = async (req, res) => {
  try {
    const profile = await BloodBankProfile.findOne({ user: req.user._id });
    if (!profile) return errorResponse(res,'Profile not found.',404);
    const today = new Date(); today.setHours(0,0,0,0);
    const [donationsToday, pendingTests, totalUnitsApproved, expiringCount] = await Promise.all([
      BloodUnit.countDocuments({ bloodBank:profile._id, createdAt:{ $gte:today } }),
      BloodUnit.countDocuments({ bloodBank:profile._id, status:'Collected' }),
      BloodUnit.countDocuments({ bloodBank:profile._id, status:'Approved' }),
      BloodUnit.countDocuments({ bloodBank:profile._id, status:'Approved', expiresAt:{ $lte:new Date(Date.now()+7*86400000) } }),
    ]);
    const totalInventory = profile.inventory.reduce((s,i)=>s+i.rbc+i.plasma+i.platelets+i.wholeBlood,0);
    const alerts = [];
    profile.inventory.forEach(inv=>{
      const total = inv.rbc+inv.plasma+inv.platelets+inv.wholeBlood;
      if(total <= profile.criticalThreshold) alerts.push({ bloodGroup:inv.bloodGroup, level:'critical', total });
      else if(total <= profile.lowStockThreshold) alerts.push({ bloodGroup:inv.bloodGroup, level:'low', total });
    });
    return successResponse(res,{ donationsToday, pendingTests, totalUnitsApproved, expiringCount, totalInventory, inventory:profile.inventory, alerts });
  } catch(err){ return errorResponse(res,err.message); }
};

exports.listBanks = async (req, res) => {
  try {
    const { lat, lng, radius=100, city } = req.query;
    let filter = { isVerified:true };
    if (city) filter.city = new RegExp(city,'i');
    let banks;
    if (lat && lng) {
      banks = await BloodBankProfile.find({ ...filter, location:{ $near:{ $geometry:{ type:'Point', coordinates:[+lng,+lat] }, $maxDistance:+radius*1000 } } }).populate('user','name email phone');
    } else {
      banks = await BloodBankProfile.find(filter).populate('user','name email phone').limit(50);
    }
    return successResponse(res,{ banks });
  } catch(err){ return errorResponse(res,err.message); }
};

// Issue units to hospital → reduce inventory → sync
exports.issueUnits = async (req, res) => {
  try {
    const { unitIds, requestId, hospitalId } = req.body;
    const profile = await BloodBankProfile.findOne({ user: req.user._id });
    if (!profile) return errorResponse(res,'Profile not found.',404);

    const units = await BloodUnit.find({ _id:{ $in:unitIds }, bloodBank:profile._id, status:'Approved' });
    if (!units.length) return errorResponse(res,'No approved units found.',400);

    // Update each unit
    for (const unit of units) {
      unit.status   = 'Issued';
      unit.issuedTo = hospitalId;
      unit.issuedAt = new Date();
      if (requestId) unit.reservedFor = requestId;
      await unit.save();

      // Reduce inventory count
      const inv = profile.inventory.find(i=>i.bloodGroup===unit.bloodGroup);
      if (inv) {
        const key = unit.component==='Whole Blood'?'wholeBlood':unit.component==='RBC'?'rbc':unit.component==='Plasma'?'plasma':'platelets';
        inv[key] = Math.max(0, inv[key]-1);
        inv.lastUpdated = new Date();
      }
    }
    await profile.save();

    // Update request status
    if (requestId) {
      const BloodRequest = require('../models/BloodRequest');
      const req_ = await BloodRequest.findByIdAndUpdate(requestId, { status:'Allocated', assignedBank:profile._id, assignedUnits:unitIds }, { new:true });
      const sync = req.app.get('sync');
      if (sync) {
        await sync.inventoryUpdated(profile);
        await sync.requestStatusChanged(req_, 'bloodbank');
        // Check thresholds
        const alerts = [];
        profile.inventory.forEach(inv=>{ const t=inv.rbc+inv.plasma+inv.platelets+inv.wholeBlood; if(t<=profile.criticalThreshold) alerts.push({ bloodGroup:inv.bloodGroup, level:'critical', total:t }); else if(t<=profile.lowStockThreshold) alerts.push({ bloodGroup:inv.bloodGroup, level:'low', total:t }); });
        if (alerts.length) await sync.thresholdAlert(profile, alerts);
      }
    }
    return successResponse(res,{ issued:units.length },'Units issued successfully.');
  } catch(err){ return errorResponse(res,err.message); }
};
