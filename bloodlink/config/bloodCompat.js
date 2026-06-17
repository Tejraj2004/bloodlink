// compatibleDonors[patientBloodGroup] = [donor blood groups that can donate]
const compatibleDonors = {
  'A+':  ['A+', 'A-', 'O+', 'O-'],
  'A-':  ['A-', 'O-'],
  'B+':  ['B+', 'B-', 'O+', 'O-'],
  'B-':  ['B-', 'O-'],
  'O+':  ['O+', 'O-'],
  'O-':  ['O-'],
  'AB+': ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'],
  'AB-': ['A-', 'B-', 'O-', 'AB-']
};

const incompatibilityReason = (donorBG, patientBG) => {
  const compatible = compatibleDonors[patientBG] || [];
  if (compatible.includes(donorBG)) return null;
  return `${donorBG} blood cannot be safely transfused to a ${patientBG} patient due to ABO/Rh antigen incompatibility — this can trigger a severe immune reaction.`;
};

const isCompatible = (donorBG, patientBG) => {
  return (compatibleDonors[patientBG] || []).includes(donorBG);
};

// Distance in km between two lat/lng points
const haversineDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180) * Math.cos(lat2*Math.PI/180) * Math.sin(dLon/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
};

module.exports = { compatibleDonors, isCompatible, incompatibilityReason, haversineDistance };
