# 🩸 BloodLink — Smart Blood Management Platform

Full-stack AI-powered blood management with **real-time synchronisation** between 6 roles.

## 📁 Structure
```
bloodlink/
├── frontend/    React + Vite + Tailwind CSS + Socket.IO client
└── backend/     Node.js + Express + MongoDB + Socket.IO server
```

## ⚡ Real-Time Sync Matrix

| Action | Who Triggers | Who Gets Notified |
|--------|-------------|-------------------|
| Blood bank registers | Blood Bank | Admin (pending verification panel) |
| Admin approves bank | Admin | Blood Bank (instant toast + DB notification) |
| Camp published | Blood Bank | All Donors (push + email + live feed) |
| Donor registers for camp | Donor | Blood Bank (live count update) |
| Blood unit recorded | Blood Bank | Admin, inventory watchers |
| TTI approved → inventory++ | Blood Bank | Hospitals (live inventory update) |
| Hospital requests blood | Hospital/Patient | Blood Banks, Admin (new request alert) |
| Critical request | Hospital | Top ranked donors (SMS + Email + Push) |
| Blood bank issues units → inventory-- | Blood Bank | Hospital, Admin, threshold alerts |
| Below threshold | Blood Bank | Admin (critical alert banner) |
| Delivery created | Blood Bank | Ambulance driver, Hospital |
| Driver updates GPS | Ambulance | Hospital (live coordinates) |
| Delivery completed | Ambulance | Hospital, Patient (fulfilled notification) |

## 🚀 Quick Start

### Backend
```bash
cd backend
npm install
cp .env.example .env        # fill MongoDB URI, JWT secret, etc.
npm run seed                 # seed demo data
npm run dev                  # → http://localhost:5000
```

### Frontend
```bash
cd frontend
npm install
cp .env.example .env        # fill VITE_API_URL, VITE_GOOGLE_CLIENT_ID
npm run dev                  # → http://localhost:5173
```

## 🔑 Demo Credentials (after seed)

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@bloodlink.in | Admin@123 |
| Blood Bank | statebloodbank@odisha.gov.in | Bank@123 |
| Hospital | aiims@bhubaneswar.in | Hospital@123 |
| Donor | arjun@example.com | Donor@123 |

## 🛠 Tech Stack

**Frontend:** React 18, Vite, Tailwind CSS, React Router v6, Axios, Socket.IO client, Recharts, React Hot Toast, @react-oauth/google

**Backend:** Node.js, Express, MongoDB Atlas, Mongoose, Socket.IO, JWT, bcryptjs

**Services:** Nodemailer (email+OTP), Twilio (SMS), Firebase FCM (push), Cloudinary (storage), Google OAuth 2.0

**Deployment:** Vercel (frontend) + Render/Railway (backend)

## 🌐 Key API Endpoints

```
POST /api/auth/register          Register (all roles)
POST /api/auth/login             Login
POST /api/auth/google            Google OAuth
POST /api/auth/verify-otp        OTP verification

GET  /api/bloodbank/dashboard    Blood bank stats + alerts
POST /api/bloodbank/units        Record donation
PUT  /api/bloodbank/units/:id/tti TTI screening → inventory update
POST /api/bloodbank/issue        Issue units → inventory-- → hospital notified

POST /api/requests               Create request → blood banks notified
GET  /api/requests               List requests (role-filtered)
PUT  /api/requests/:id/status    Update status → requester notified

POST /api/camps                  Create camp → donors notified
POST /api/camps/:id/register     Register → blood bank notified

POST /api/deliveries             Create → ambulance + hospital notified
PUT  /api/deliveries/:id/status  Update → hospital notified
PUT  /api/deliveries/:id/location GPS update → hospital live tracking

GET  /api/admin/dashboard        National stats + threshold alerts
POST /api/admin/verify           Approve/reject → entity notified
```

## 📡 Socket.IO Events

**Server → Client:**
- `inventory_updated` → hospitals, admin
- `threshold_alert` → admin, blood bank
- `new_request` → blood banks, admin
- `emergency_request` → blood banks, admin
- `new_camp` → all donors
- `camp_registration` → blood bank
- `donation_recorded` → donor
- `tti_completed` → blood bank + hospitals
- `new_delivery` → ambulance, hospital
- `delivery_status` → hospital
- `delivery_location` → hospital (live GPS)
- `verification_result` → hospital/blood bank
- `emergency_alert` → eligible donors
- `request_fulfilled` → patient/hospital
- `online_counts` → everyone

**Client → Server:**
- `join` → join user + role rooms
- `join_bank/hospital/delivery` → join entity rooms
- `driver_gps` → share live location
