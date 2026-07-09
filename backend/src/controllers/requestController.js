const BloodRequest     = require('../models/BloodRequest');
const BloodBankProfile = require('../models/BloodBankProfile');
const DonorProfile     = require('../models/DonorProfile');
const { generateRequestId } = require('../utils/helpers');
const { activateDonors }    = require('../services/notificationService');
const { successResponse, errorResponse, paginatedResponse } = require('../utils/response');

exports.createRequest = async (req, res) => {
  try {
    const { patientName, patientAge, patientGender, diagnosis, hospitalId, hospitalName, bloodGroup, component, units, urgency, requiredBy, notes, coordinates } = req.body;
    const request = await BloodRequest.create({
      requestId: generateRequestId(),
      requestedBy: req.user._id,
      requesterRole: req.user.role,
      patientName, patientAge, patientGender, diagnosis,
      hospital: hospitalId||null,
      hospitalName: hospitalName||'',
      bloodGroup, component, units:+units,
      urgency: urgency||'Normal',
      requiredBy: requiredBy||null,
      notes,
      location: coordinates ? { type:'Point', coordinates } : undefined,
    });

    // Sync to blood banks + admin
    const sync = req.app.get('sync');
    if (sync) await sync.newRequest(request.toObject());

    // Emergency activation
    if (urgency==='Critical'||urgency==='Urgent') {
      try {
        const eligible = await DonorProfile.find({ bloodGroup, isEligible:true }).populate('user','name email phone fcmToken _id').sort('-donorScore').limit(20);
        if (eligible.length) {
          await activateDonors(eligible, bloodGroup, hospitalName||'Hospital');
          if (sync) await sync.emergencyActivation(eligible.map(d=>d.user._id), bloodGroup, hospitalName||'Hospital');
        }
      } catch {}
    }

    await request.populate('requestedBy','name email');
    return successResponse(res,{ request },'Blood request created.',201);
  } catch(err){ return errorResponse(res,err.message); }
};

exports.listRequests = async (req, res) => {
  try {
    const { page=1, limit=20, status, urgency, bloodGroup } = req.query;
    const filter = {};
    if (req.user.role==='patient') filter.requestedBy = req.user._id;
    else if (req.user.role==='hospital') {
      const HospitalProfile = require('../models/HospitalProfile');
      const h = await HospitalProfile.findOne({ user:req.user._id });
      if (h) filter.hospital = h._id;
    }
    if (status)     filter.status     = status;
    if (urgency)    filter.urgency    = urgency;
    if (bloodGroup) filter.bloodGroup = bloodGroup;
    const total = await BloodRequest.countDocuments(filter);
    const requests = await BloodRequest.find(filter)
      .populate('requestedBy','name email')
      .populate('hospital','hospitalName city')
      .populate('assignedBank','bankName city')
      .sort({ urgency:-1, createdAt:-1 })
      .skip((page-1)*limit).limit(+limit);
    return paginatedResponse(res,requests,total,page,limit);
  } catch(err){ return errorResponse(res,err.message); }
};

exports.getRequest = async (req, res) => {
  try {
    const request = await BloodRequest.findById(req.params.id)
      .populate('requestedBy','name email phone')
      .populate('hospital','hospitalName city address emergencyContact')
      .populate('assignedBank','bankName city contactPhone')
      .populate('assignedUnits');
    if (!request) return errorResponse(res,'Request not found.',404);
    return successResponse(res,{ request });
  } catch(err){ return errorResponse(res,err.message); }
};

exports.updateStatus = async (req, res) => {
  try {
    const { status, bankId, unitIds, reason } = req.body;
    const request = await BloodRequest.findById(req.params.id);
    if (!request) return errorResponse(res,'Request not found.',404);
    request.status = status;
    if (bankId)   request.assignedBank  = bankId;
    if (unitIds?.length) request.assignedUnits = unitIds;
    if (status==='Fulfilled') { request.fulfilledAt = new Date(); }
    if (status==='Cancelled') { request.cancelledAt = new Date(); request.cancelReason = reason||''; }
    await request.save();

    const sync = req.app.get('sync');
    if (sync) {
      await sync.requestStatusChanged(request.toObject(), req.user.role);
      if (status==='Fulfilled') await sync.requestFulfilled(request.toObject());
    }
    return successResponse(res,{ request },'Request updated.');
  } catch(err){ return errorResponse(res,err.message); }
};

exports.cancelRequest = async (req, res) => {
  try {
    const request = await BloodRequest.findOne({ _id:req.params.id, requestedBy:req.user._id });
    if (!request) return errorResponse(res,'Request not found.',404);
    if (['Fulfilled','In Transit'].includes(request.status)) return errorResponse(res,'Cannot cancel.',400);
    request.status='Cancelled'; request.cancelledAt=new Date(); request.cancelReason=req.body.reason||'Cancelled by user';
    await request.save();
    return successResponse(res,{},'Request cancelled.');
  } catch(err){ return errorResponse(res,err.message); }
};

exports.searchInventory = async (req, res) => {
  try {
    const { bloodGroup, component, lat, lng, radius=100 } = req.query;
    if (!bloodGroup) return errorResponse(res,'bloodGroup required.',400);
    const geoFilter = (lat&&lng) ? { location:{ $near:{ $geometry:{ type:'Point', coordinates:[+lng,+lat] }, $maxDistance:+radius*1000 } } } : {};
    const banks = await BloodBankProfile.find({ ...geoFilter, isVerified:true }).populate('user','name phone');
    const comp  = (component||'rbc').toLowerCase().replace(' ','');
    const compKey = comp==='wholeblood'?'wholeBlood':comp==='rbc'?'rbc':comp==='plasma'?'plasma':'platelets';
    const results = banks.map(bank=>{ const inv=bank.inventory.find(i=>i.bloodGroup===bloodGroup); const available=inv?inv[compKey]||0:0; return { bank, available }; }).filter(r=>r.available>0).sort((a,b)=>b.available-a.available);
    return successResponse(res,{ results, total:results.length });
  } catch(err){ return errorResponse(res,err.message); }
};
