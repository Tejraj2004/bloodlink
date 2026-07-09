const generateUnitId = () => {
  const date = new Date();
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  const rand = Math.random().toString(36).substring(2, 7).toUpperCase();
  return `BU-${y}${m}${d}-${rand}`;
};

const generateRequestId = () => {
  const rand = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `REQ-${rand}`;
};

const generateDeliveryId = () => {
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `DL-${rand}`;
};

// Blood expiry days by component
const expiryDays = {
  'Whole Blood': 35,
  'RBC': 42,
  'Plasma': 365,
  'Platelets': 5,
  'Cryoprecipitate': 365,
};

const getExpiryDate = (component) => {
  const d = new Date();
  d.setDate(d.getDate() + (expiryDays[component] || 35));
  return d;
};

// Donor eligibility interval (days)
const DONATION_INTERVAL_DAYS = 90;

const getNextEligibleDate = (lastDonationDate) => {
  const d = new Date(lastDonationDate);
  d.setDate(d.getDate() + DONATION_INTERVAL_DAYS);
  return d;
};

// Donor AI score calculation
const calculateDonorScore = (donor) => {
  let score = 0;
  const rareGroups = ['O-', 'AB-', 'B-', 'A-'];

  if (rareGroups.includes(donor.bloodGroup)) score += 30;
  else if (donor.bloodGroup === 'O+') score += 20;
  else score += 10;

  score += Math.min(donor.totalDonations * 5, 30);
  score += Math.min(donor.responseRate * 0.2, 20);
  if (donor.isEligible) score += 20;

  return Math.min(Math.round(score), 100);
};

module.exports = { generateUnitId, generateRequestId, generateDeliveryId, getExpiryDate, getNextEligibleDate, calculateDonorScore };
