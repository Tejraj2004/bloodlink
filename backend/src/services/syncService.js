/**
 * BloodLink Real-Time Sync Service
 * Every action emits targeted events to the right roles via Socket.IO rooms.
 *
 * Room naming convention:
 *   role:<roleName>         → all connected users of that role
 *   user:<userId>           → specific user
 *   bank:<bankId>           → specific blood bank watchers
 *   hospital:<hospitalId>   → specific hospital watchers
 *   request:<requestId>     → watchers of a specific request
 *   delivery:<deliveryId>   → watchers of a specific delivery
 */

const Notification = require('../models/Notification');

class SyncService {
  constructor(io) {
    this.io = io;
  }

  // ── Inventory updated (blood bank) → admins, hospitals, donors see it ──────
  async inventoryUpdated(bankProfile) {
    const payload = {
      bankId: bankProfile._id,
      bankName: bankProfile.bankName,
      city: bankProfile.city,
      inventory: bankProfile.inventory,
      timestamp: new Date(),
    };
    this.io.to('role:admin').emit('inventory_updated', payload);
    this.io.to('role:hospital').emit('inventory_updated', payload);
    this.io.to(`bank:${bankProfile._id}`).emit('inventory_updated', payload);
    console.log(`📦 Inventory sync → admins + hospitals for ${bankProfile.bankName}`);
  }

  // ── Threshold alert → admins + blood bank staff ───────────────────────────
  async thresholdAlert(bankProfile, alerts) {
    const payload = { bankId: bankProfile._id, bankName: bankProfile.bankName, alerts, timestamp: new Date() };
    this.io.to('role:admin').emit('threshold_alert', payload);
    this.io.to(`bank:${bankProfile._id}`).emit('threshold_alert', payload);

    // Save DB notifications for admin users
    try {
      const User = require('../models/User');
      const admins = await User.find({ role: 'admin', isActive: true }).select('_id');
      for (const admin of admins) {
        await Notification.create({
          recipient: admin._id,
          type: 'shortage',
          title: `⚠️ Low Stock at ${bankProfile.bankName}`,
          message: alerts.map(a => `${a.bloodGroup}: ${a.total} units (${a.level})`).join(', '),
          data: payload,
        });
      }
    } catch {}
  }

  // ── New blood request → blood banks, admins ───────────────────────────────
  async newRequest(request) {
    const payload = { request, timestamp: new Date() };
    this.io.to('role:bloodbank').emit('new_request', payload);
    this.io.to('role:admin').emit('new_request', payload);
    if (request.urgency === 'Critical' || request.urgency === 'Urgent') {
      this.io.to('role:bloodbank').emit('emergency_request', payload);
      this.io.to('role:admin').emit('emergency_request', payload);
    }
    console.log(`🩸 New ${request.urgency} request → blood banks`);
  }

  // ── Request status changed → requester + blood bank ──────────────────────
  async requestStatusChanged(request, changedBy) {
    const payload = { requestId: request._id, requestId_str: request.requestId, status: request.status, changedBy, timestamp: new Date() };
    this.io.to(`user:${request.requestedBy}`).emit('request_status_changed', payload);
    this.io.to(`request:${request._id}`).emit('request_status_changed', payload);
    this.io.to('role:admin').emit('request_status_changed', payload);
    if (request.hospital) this.io.to(`hospital:${request.hospital}`).emit('request_status_changed', payload);
  }

  // ── New camp published → all donors ──────────────────────────────────────
  async campPublished(camp, bankName) {
    const payload = { camp, bankName, timestamp: new Date() };
    this.io.to('role:donor').emit('new_camp', payload);
    this.io.to('role:admin').emit('new_camp', payload);
    console.log(`📍 Camp "${camp.name}" → all donors`);

    // DB notification for donors
    try {
      const User = require('../models/User');
      const donors = await User.find({ role: 'donor', isActive: true }).select('_id').limit(500);
      const notifs = donors.map(d => ({
        recipient: d._id,
        type: 'campaign',
        title: `📍 New Donation Camp: ${camp.name}`,
        message: `${bankName} is organising a donation camp at ${camp.venue}, ${camp.city} on ${new Date(camp.date).toDateString()}.`,
        data: { campId: camp._id },
      }));
      if (notifs.length) await Notification.insertMany(notifs);
    } catch {}
  }

  // ── Donor registered for camp → blood bank ────────────────────────────────
  async donorRegisteredCamp(camp, user) {
    const payload = { campId: camp._id, campName: camp.name, donor: { id: user._id, name: user.name }, registered: camp.registeredDonors.length, target: camp.targetDonors, timestamp: new Date() };
    this.io.to(`bank:${camp.bloodBank}`).emit('camp_registration', payload);
    this.io.to('role:admin').emit('camp_registration', payload);
  }

  // ── Blood unit recorded → inventory watchers ──────────────────────────────
  async unitRecorded(unit, bankProfile) {
    const payload = { unit, bankId: bankProfile._id, timestamp: new Date() };
    this.io.to(`bank:${bankProfile._id}`).emit('unit_recorded', payload);
    this.io.to('role:admin').emit('unit_recorded', payload);
    // Notify the donor
    if (unit.donor) {
      this.io.to(`user:${unit.donor}`).emit('donation_recorded', { unit, bankName: bankProfile.bankName });
    }
  }

  // ── TTI result → inventory update visible to hospitals ───────────────────
  async ttiCompleted(unit, bankProfile) {
    const payload = { unit, bankId: bankProfile._id, bloodGroup: unit.bloodGroup, status: unit.status, timestamp: new Date() };
    this.io.to(`bank:${bankProfile._id}`).emit('tti_completed', payload);
    this.io.to('role:hospital').emit('inventory_updated', { bankId: bankProfile._id, inventory: bankProfile.inventory });
    this.io.to('role:admin').emit('tti_completed', payload);
  }

  // ── Delivery created → ambulance drivers, hospital ────────────────────────
  async deliveryCreated(delivery) {
    const payload = { delivery, timestamp: new Date() };
    this.io.to('role:ambulance').emit('new_delivery', payload);
    this.io.to(`hospital:${delivery.toHospital}`).emit('delivery_created', payload);
    if (delivery.driver) this.io.to(`user:${delivery.driver}`).emit('new_delivery', payload);
    console.log(`🚚 Delivery ${delivery.deliveryId} → ambulance + hospital`);
  }

  // ── Delivery status update → hospital + requester ─────────────────────────
  async deliveryStatusUpdated(delivery) {
    const payload = { deliveryId: delivery.deliveryId, status: delivery.status, currentLocation: delivery.currentLocation, estimatedArrival: delivery.estimatedArrival, timestamp: new Date() };
    this.io.to(`hospital:${delivery.toHospital}`).emit('delivery_status', payload);
    this.io.to(`delivery:${delivery._id}`).emit('delivery_status', payload);
    this.io.to('role:admin').emit('delivery_status', payload);
  }

  // ── Live GPS location → hospital + request watchers ──────────────────────
  deliveryLocation(delivery, coordinates) {
    const payload = { deliveryId: delivery.deliveryId, coordinates, timestamp: new Date() };
    this.io.to(`hospital:${delivery.toHospital}`).emit('delivery_location', payload);
    this.io.to(`delivery:${delivery._id}`).emit('delivery_location', payload);
  }

  // ── Admin verified entity → that entity ──────────────────────────────────
  async entityVerified(userId, entityType, approved) {
    const payload = { approved, entityType, message: approved ? `Your ${entityType} account has been approved! You can now access all features.` : `Your ${entityType} registration was not approved. Please contact support.` };
    this.io.to(`user:${userId}`).emit('verification_result', payload);
    // DB notification
    try {
      await Notification.create({
        recipient: userId,
        type: 'system',
        title: approved ? '✅ Account Approved!' : '❌ Account Not Approved',
        message: payload.message,
      });
    } catch {}
  }

  // ── Emergency donor activation ────────────────────────────────────────────
  async emergencyActivation(donorUserIds, bloodGroup, hospitalName) {
    const payload = { bloodGroup, hospitalName, message: `🚨 Emergency: ${bloodGroup} blood urgently needed at ${hospitalName}`, timestamp: new Date() };
    for (const uid of donorUserIds) {
      this.io.to(`user:${uid}`).emit('emergency_alert', payload);
    }
    this.io.to('role:admin').emit('emergency_alert', { ...payload, donorCount: donorUserIds.length });
    console.log(`🚨 Emergency sent to ${donorUserIds.length} donors`);
  }

  // ── Patient request fulfilled → patient ──────────────────────────────────
  async requestFulfilled(request) {
    const payload = { requestId: request._id, patientName: request.patientName, bloodGroup: request.bloodGroup, message: `Your blood request for ${request.bloodGroup} has been fulfilled.` };
    this.io.to(`user:${request.requestedBy}`).emit('request_fulfilled', payload);
    try {
      await Notification.create({ recipient: request.requestedBy, type: 'system', title: '✅ Blood Request Fulfilled', message: payload.message, data: { requestId: request._id } });
    } catch {}
  }
}

module.exports = SyncService;
