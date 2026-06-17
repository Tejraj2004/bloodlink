# 🩸 BloodLink — Blood Donation Platform

A full-stack blood donation platform built with Node.js, Express, MongoDB, EJS, and Tailwind CSS.

---

## 🚀 Quick Setup

### Prerequisites
- Node.js v18+ installed
- MongoDB installed locally OR a MongoDB Atlas account
- (Optional) Google OAuth credentials for Google Sign-In
- (Optional) Twilio account for SMS notifications

---

### 1. Install Dependencies

```bash
cd bloodlink
npm install
```

---

### 2. Configure Environment Variables

Edit the `.env` file in the project root:

```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/bloodlink

SESSION_SECRET=bloodlink_super_secret_key_2024

# Google OAuth (get from https://console.cloud.google.com/)
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
GOOGLE_CALLBACK_URL=http://localhost:3000/auth/google/callback

# Twilio SMS (get from https://www.twilio.com/)
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=+1234567890

NODE_ENV=development
```

**Note:** The app works without Google OAuth and Twilio — those features will just be disabled. Core registration/login with email still works.

---

### 3. Set Up Google OAuth (for Google Sign-In)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project → Enable "Google+ API"
3. Go to **APIs & Services → Credentials → Create OAuth 2.0 Client**
4. Set Authorized redirect URI: `http://localhost:3000/auth/google/callback`
5. Copy Client ID and Secret into `.env`

---

### 4. Start MongoDB

```bash
# If installed locally:
mongod

# Or use MongoDB Atlas — paste your connection string in MONGODB_URI
```

---

### 5. Run the App

```bash
# Development (auto-restart on changes)
npm run dev

# Production
npm start
```

Visit: **http://localhost:3000**

---

### 6. Create Admin User

1. Register a normal account at `/auth/register`
2. Open MongoDB shell or MongoDB Compass
3. Run:
```js
db.users.updateOne({ email: "your@email.com" }, { $set: { role: "admin" } })
```
4. Now login — you'll see the Admin panel in the navbar.

---

## 📁 Project Structure

```
bloodlink/
├── config/
│   ├── db.js              # MongoDB connection
│   ├── passport.js        # Auth strategies (Local + Google)
│   └── bloodCompat.js     # Blood compatibility logic
├── middleware/
│   └── auth.js            # ensureAuth, ensureAdmin, ensureGuest
├── models/
│   ├── User.js            # User accounts
│   ├── DonorProfile.js    # Donor details & history
│   └── BloodRequest.js    # Blood requests & matches
├── routes/
│   ├── index.js           # Home page
│   ├── auth.js            # Login, Register, Google OAuth
│   ├── dashboard.js       # Dashboard, donor setup, accept/recover
│   ├── requests.js        # Post & browse requests
│   └── admin.js           # Admin panel
├── views/
│   ├── partials/
│   │   ├── header.ejs     # Navbar + head
│   │   └── footer.ejs     # Footer + scripts
│   ├── index.ejs          # Home page
│   ├── 404.ejs
│   ├── auth/
│   │   ├── login.ejs
│   │   └── register.ejs
│   ├── dashboard/
│   │   ├── index.ejs      # Main dashboard
│   │   └── donor-setup.ejs
│   ├── requests/
│   │   ├── new.ejs        # Post blood request
│   │   └── find.ejs       # Browse requests
│   └── admin/
│       ├── index.ejs
│       ├── users.ejs
│       └── requests.ejs
├── public/                # Static assets
├── server.js              # App entry point
├── package.json
└── .env                   # Config (edit this!)
```

---

## 🔑 Key Features

| Feature | Details |
|---|---|
| Auth | Email/password + Google OAuth via Passport.js |
| Donor Registration | Multi-step form with GPS location detection |
| Blood Requests | Full form with GPS, blood compatibility grid, urgency levels |
| AI Matching | Blood compatibility matrix + 50km geo-proximity matching |
| SMS Alerts | Twilio SMS to contact person when donor accepts |
| Lives Saved | Auto-updates when patient marked as recovered |
| Admin Panel | Full user/request management with stats |
| Dual Role | Same user can be donor and seeker simultaneously |

---

## 🩸 Blood Compatibility Matrix

| Patient | Compatible Donors |
|---|---|
| A+ | A+, A-, O+, O- |
| A- | A-, O- |
| B+ | B+, B-, O+, O- |
| B- | B-, O- |
| O+ | O+, O- |
| O- | O- only |
| AB+ | All blood types |
| AB- | A-, B-, O-, AB- |

---

## 🛠 Tech Stack

- **Backend:** Node.js, Express.js
- **Database:** MongoDB + Mongoose
- **Auth:** Passport.js (Local + Google OAuth 2.0)
- **Views:** EJS templating
- **Styling:** Tailwind CSS (CDN)
- **SMS:** Twilio
- **Session:** express-session + connect-mongo
- **GPS:** Browser Geolocation API + Nominatim reverse geocoding

---

Built with ❤️ to save lives. Every drop counts.
