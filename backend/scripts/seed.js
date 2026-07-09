require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../src/models/User');
const DonorProfile = require('../src/models/DonorProfile');
const HospitalProfile = require('../src/models/HospitalProfile');
const BloodBankProfile = require('../src/models/BloodBankProfile');
const DonationCamp = require('../src/models/DonationCamp');

const seed = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');

  // Clear existing data
  await Promise.all([
    User.deleteMany({}), DonorProfile.deleteMany({}),
    HospitalProfile.deleteMany({}), BloodBankProfile.deleteMany({}),
    DonationCamp.deleteMany({}),
  ]);
  console.log('Cleared existing data');

  // Admin
  const admin = await User.create({
    name: 'BloodLink Admin', email: 'admin@bloodlink.in',
    password: await bcrypt.hash('Admin@123', 12),
    role: 'admin', isEmailVerified: true, isAdminVerified: true, isActive: true,
  });

  // Blood Banks
  const bbUser1 = await User.create({
    name: 'State Blood Bank', email: 'statebloodbank@odisha.gov.in',
    password: await bcrypt.hash('Bank@123', 12),
    role: 'bloodbank', isEmailVerified: true, isAdminVerified: true, isActive: true,
  });
  const bb1 = await BloodBankProfile.create({
    user: bbUser1._id, bankName: 'State Blood Bank',
    licenseNo: 'SBBHBW001', nbtcAccredited: true,
    address: 'Unit-4, Bhubaneswar', city: 'Bhubaneswar', state: 'Odisha', pincode: '751001',
    location: { type: 'Point', coordinates: [85.8245, 20.2961] },
    contactPhone: '0674-2390001', isVerified: true,
    inventory: [
      { bloodGroup: 'A+',  rbc: 42, plasma: 28, platelets: 15, wholeBlood: 8 },
      { bloodGroup: 'A-',  rbc: 12, plasma: 8,  platelets: 5,  wholeBlood: 2 },
      { bloodGroup: 'B+',  rbc: 35, plasma: 22, platelets: 18, wholeBlood: 6 },
      { bloodGroup: 'B-',  rbc: 8,  plasma: 5,  platelets: 3,  wholeBlood: 1 },
      { bloodGroup: 'AB+', rbc: 18, plasma: 14, platelets: 9,  wholeBlood: 4 },
      { bloodGroup: 'AB-', rbc: 4,  plasma: 3,  platelets: 2,  wholeBlood: 0 },
      { bloodGroup: 'O+',  rbc: 55, plasma: 40, platelets: 25, wholeBlood: 12 },
      { bloodGroup: 'O-',  rbc: 6,  plasma: 4,  platelets: 3,  wholeBlood: 1 },
    ],
  });

  // Hospital
  const hospUser = await User.create({
    name: 'AIIMS Bhubaneswar', email: 'aiims@bhubaneswar.in',
    password: await bcrypt.hash('Hospital@123', 12),
    role: 'hospital', isEmailVerified: true, isAdminVerified: true, isActive: true,
  });
  await HospitalProfile.create({
    user: hospUser._id, hospitalName: 'AIIMS Bhubaneswar',
    registrationNo: 'AIIMS-BBW-001', type: 'Government', beds: 960,
    address: 'Sijua, Patrapada', city: 'Bhubaneswar', state: 'Odisha', pincode: '751019',
    location: { type: 'Point', coordinates: [85.8396, 20.3061] },
    emergencyContact: '0674-2476789', isVerified: true,
  });

  // Donors
  const donorData = [
    { name: 'Arjun Sharma',   email: 'arjun@example.com',   bloodGroup: 'O+', city: 'Bhubaneswar', dob: '1996-05-15', gender: 'Male' },
    { name: 'Priya Patel',    email: 'priya@example.com',   bloodGroup: 'A+', city: 'Cuttack',      dob: '2000-03-22', gender: 'Female' },
    { name: 'Rohit Mishra',   email: 'rohit@example.com',   bloodGroup: 'B-', city: 'Bhubaneswar', dob: '1992-11-08', gender: 'Male' },
    { name: 'Sneha Nair',     email: 'sneha@example.com',   bloodGroup: 'AB-',city: 'Puri',         dob: '1997-07-30', gender: 'Female' },
    { name: 'Karthik Reddy',  email: 'karthik@example.com', bloodGroup: 'O-', city: 'Bhubaneswar', dob: '1988-02-14', gender: 'Male' },
  ];

  for (const d of donorData) {
    const u = await User.create({
      name: d.name, email: d.email,
      password: await bcrypt.hash('Donor@123', 12),
      role: 'donor', isEmailVerified: true, isActive: true,
    });
    await DonorProfile.create({
      user: u._id, bloodGroup: d.bloodGroup,
      dateOfBirth: new Date(d.dob), gender: d.gender,
      city: d.city, state: 'Odisha',
      isEligible: true, totalDonations: Math.floor(Math.random() * 15),
      donorScore: 70 + Math.floor(Math.random() * 30),
    });
  }

  // Camps
  await DonationCamp.create([
    {
      organizer: admin._id,
      name: 'ITER College Blood Drive',
      venue: 'ITER Campus', address: 'Khandagiri, Bhubaneswar', city: 'Bhubaneswar',
      date: new Date(Date.now() + 2 * 86400000),
      targetDonors: 100,
      location: { type: 'Point', coordinates: [85.7832, 20.2530] },
    },
    {
      organizer: admin._id,
      name: 'Corporate Drive — Infosys',
      venue: 'Infosys SEZ', address: 'Patia, Bhubaneswar', city: 'Bhubaneswar',
      date: new Date(Date.now() + 5 * 86400000),
      targetDonors: 150,
      location: { type: 'Point', coordinates: [85.8196, 20.3520] },
    },
  ]);

  console.log('\n✅ Seed complete!\n');
  console.log('Credentials:');
  console.log('  Admin:    admin@bloodlink.in / Admin@123');
  console.log('  BloodBank: statebloodbank@odisha.gov.in / Bank@123');
  console.log('  Hospital: aiims@bhubaneswar.in / Hospital@123');
  console.log('  Donor:    arjun@example.com / Donor@123');
  process.exit(0);
};

seed().catch(err => { console.error(err); process.exit(1); });
