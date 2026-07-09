const User             = require('../models/User');
const DonorProfile     = require('../models/DonorProfile');
const HospitalProfile  = require('../models/HospitalProfile');
const BloodBankProfile = require('../models/BloodBankProfile');
const BloodRequest     = require('../models/BloodRequest');
const BloodUnit        = require('../models/BloodUnit');
const Delivery         = require('../models/Delivery');
const { successResponse, errorResponse, paginatedResponse } = require('../utils/response');

exports.getDashboardStats = async (req, res) => {
  try {
    const [totalDonors, totalHospitals, totalBanks, totalRequests, criticalRequests, activeDeliveries, totalUnits, pendingVerifications] = await Promise.all([
      User.countDocuments({ role:'donor', isActive:true }),
      HospitalProfile.countDocuments(),
      BloodBankProfile.countDocuments(),
      BloodRequest.countDocuments(),
      BloodRequest.countDocuments({ urgency:'Critical', status:{ $nin:['Fulfilled','Cancelled'] } }),
      Delivery.countDocuments({ status:'In Transit' }),
      BloodUnit.countDocuments({ status:'Approved' }),
      User.countDocuments({ isAdminVerified:false, role:{ $in:['hospital','bloodbank'] } }),
    ]);
    const banks = await BloodBankProfile.find({},'inventory bankName city');
    const inventorySummary = {};
    ['A+','A-','B+','B-','AB+','AB-','O+','O-'].forEach(g=>{ inventorySummary[g]={ rbc:0,plasma:0,platelets:0,wholeBlood:0 }; });
    banks.forEach(b=>b.inventory.forEach(inv=>{ if(inventorySummary[inv.bloodGroup]){ inventorySummary[inv.bloodGroup].rbc+=inv.rbc; inventorySummary[inv.bloodGroup].plasma+=inv.plasma; inventorySummary[inv.bloodGroup].platelets+=inv.platelets; inventorySummary[inv.bloodGroup].wholeBlood+=inv.wholeBlood; } }));
    const today = new Date(); today.setHours(0,0,0,0);
    const [donationsToday, requestsToday, fulfilledToday] = await Promise.all([
      BloodUnit.countDocuments({ createdAt:{ $gte:today } }),
      BloodRequest.countDocuments({ createdAt:{ $gte:today } }),
      BloodRequest.countDocuments({ fulfilledAt:{ $gte:today } }),
    ]);
    // Threshold alerts across all banks
    const globalAlerts = [];
    banks.forEach(b=>{ b.inventory.forEach(inv=>{ const t=inv.rbc+inv.plasma+inv.platelets+inv.wholeBlood; if(t<5) globalAlerts.push({ bankName:b.bankName, city:b.city, bloodGroup:inv.bloodGroup, level:'critical', total:t }); else if(t<10) globalAlerts.push({ bankName:b.bankName, city:b.city, bloodGroup:inv.bloodGroup, level:'low', total:t }); }); });
    return successResponse(res,{ totalDonors, totalHospitals, totalBanks, totalRequests, criticalRequests, activeDeliveries, totalUnits, pendingVerifications, inventorySummary, donationsToday, requestsToday, fulfilledToday, globalAlerts });
  } catch(err){ return errorResponse(res,err.message); }
};

exports.verifyEntity = async (req, res) => {
  try {
    const { userId, entityType, action } = req.body;
    const user = await User.findById(userId);
    if (!user) return errorResponse(res,'User not found.',404);
    user.isAdminVerified = action==='approve';
    await user.save({ validateBeforeSave:false });
    if (entityType==='hospital') await HospitalProfile.findOneAndUpdate({ user:userId },{ isVerified:action==='approve', verifiedAt:new Date() });
    else if (entityType==='bloodbank') await BloodBankProfile.findOneAndUpdate({ user:userId },{ isVerified:action==='approve' });

    // Real-time notify the entity
    const sync = req.app.get('sync');
    if (sync) await sync.entityVerified(userId, entityType, action==='approve');

    return successResponse(res,{},`Entity ${action}d.`);
  } catch(err){ return errorResponse(res,err.message); }
};

exports.getPendingVerifications = async (req, res) => {
  try {
    const users = await User.find({ role:{ $in:['hospital','bloodbank'] }, isAdminVerified:false }).sort('-createdAt');
    const enriched = await Promise.all(users.map(async u=>{
      let profile = null;
      if (u.role==='hospital') profile = await HospitalProfile.findOne({ user:u._id });
      if (u.role==='bloodbank') profile = await BloodBankProfile.findOne({ user:u._id });
      return { user:u, profile };
    }));
    return successResponse(res,{ pending:enriched });
  } catch(err){ return errorResponse(res,err.message); }
};

exports.listUsers = async (req, res) => {
  try {
    const { page=1, limit=20, role, search } = req.query;
    const filter = {};
    if (role) filter.role = role;
    if (search) filter.$or = [{ name:new RegExp(search,'i') },{ email:new RegExp(search,'i') }];
    const total = await User.countDocuments(filter);
    const users = await User.find(filter).sort('-createdAt').skip((page-1)*limit).limit(+limit);
    return paginatedResponse(res,users,total,page,limit);
  } catch(err){ return errorResponse(res,err.message); }
};

exports.toggleUserStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return errorResponse(res,'User not found.',404);
    user.isActive = !user.isActive;
    await user.save({ validateBeforeSave:false });
    return successResponse(res,{ isActive:user.isActive },`User ${user.isActive?'activated':'deactivated'}.`);
  } catch(err){ return errorResponse(res,err.message); }
};

exports.getAnalytics = async (req, res) => {
  try {
    const sixMonthsAgo = new Date(); sixMonthsAgo.setMonth(sixMonthsAgo.getMonth()-6);
    const [monthlyDonations, monthlyRequests, bloodGroupDistribution, fulfilmentRate] = await Promise.all([
      BloodUnit.aggregate([{ $match:{ createdAt:{ $gte:sixMonthsAgo } } },{ $group:{ _id:{ year:{ $year:'$createdAt' }, month:{ $month:'$createdAt' } }, count:{ $sum:1 } } },{ $sort:{ '_id.year':1,'_id.month':1 } }]),
      BloodRequest.aggregate([{ $match:{ createdAt:{ $gte:sixMonthsAgo } } },{ $group:{ _id:{ year:{ $year:'$createdAt' }, month:{ $month:'$createdAt' } }, count:{ $sum:1 } } },{ $sort:{ '_id.year':1,'_id.month':1 } }]),
      BloodUnit.aggregate([{ $match:{ status:'Approved' } },{ $group:{ _id:'$bloodGroup', count:{ $sum:1 } } },{ $sort:{ count:-1 } }]),
      BloodRequest.aggregate([{ $group:{ _id:'$status', count:{ $sum:1 } } }]),
    ]);
    return successResponse(res,{ monthlyDonations, monthlyRequests, bloodGroupDistribution, fulfilmentRate });
  } catch(err){ return errorResponse(res,err.message); }
};
