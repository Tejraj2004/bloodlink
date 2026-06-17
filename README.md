# 🩸 BloodLink – Smart Blood Donation & Emergency Blood Management System

BloodLink is a full-stack web application designed to bridge the gap between blood donors, patients, hospitals, and blood banks. The platform enables real-time blood requests, intelligent donor matching, location-based donor discovery, emergency notifications, and seamless coordination for blood donation and delivery.

## 🚀 Features

### 👤 User Authentication
- Secure JWT-based authentication
- OTP verification for user registration
- Role-based access (Donor, Patient, Hospital, Admin)

### 🩸 Donor Management
- Donor registration with blood group and health details
- Availability status management
- Donation history tracking
- Location-based donor discovery

### 🏥 Patient & Blood Request System
- Emergency blood request creation
- Required blood group and quantity specification
- Request tracking and status updates
- Real-time notifications

### 🤖 AI-Powered Blood Matching
- Intelligent donor recommendation system
- Compatibility-based donor selection
- Priority ranking based on distance and availability

### 📍 GPS & Location Services
- Live donor location tracking
- Nearby donor identification
- Distance-based filtering
- Google Maps integration

### 💬 AI Chatbot Assistant
- Blood donation guidance
- Eligibility checking assistance
- FAQs and emergency support

### 📊 Admin Dashboard
- Manage users and blood requests
- Monitor donation statistics
- Verify donor profiles
- Track platform activity

### 🔔 Real-Time Notifications
- Emergency donor alerts
- Blood request updates
- Donation reminders
- Status notifications using Socket.io

---

## 🛠 Tech Stack

### Frontend
- React.js
- Tailwind CSS
- Axios
- React Router DOM

### Backend
- Node.js
- Express.js
- JWT Authentication
- Socket.io

### Database
- MongoDB
- Mongoose

### Cloud & APIs
- Cloudinary (Image Uploads)
- Google Maps API
- Nodemailer
- OTP Verification Service

### AI & Analytics
- Blood Matching Algorithm
- Recommendation System
- AI Chatbot Integration

---

## 📂 Project Structure

```
BloodLink/
│
├── client/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── context/
│   │   ├── services/
│   │   └── assets/
│
├── server/
│   ├── controllers/
│   ├── routes/
│   ├── models/
│   ├── middleware/
│   ├── config/
│   ├── utils/
│   └── sockets/
│
├── README.md
└── package.json
```

---

## ⚙️ Installation

### Clone Repository

```bash
git clone https://github.com/yourusername/bloodlink.git
cd bloodlink
```

### Install Dependencies

Frontend

```bash
cd client
npm install
```

Backend

```bash
cd server
npm install
```

---

## 🔑 Environment Variables

Create a `.env` file inside the server directory.

```env
PORT=4000

MONGO_URI=your_mongodb_connection_string

JWT_SECRET=your_jwt_secret

EMAIL_USER=your_email
EMAIL_PASS=your_email_password

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

GOOGLE_MAPS_API_KEY=your_google_maps_key
```

---

## ▶️ Running the Application

Backend

```bash
cd server
npm run dev
```

Frontend

```bash
cd client
npm run dev
```

Application URLs:

```text
Frontend: http://localhost:5173
Backend : http://localhost:4000
```

---

## 🔄 Blood Request Workflow

1. Patient registers and submits a blood request.
2. BloodLink identifies compatible donors.
3. Nearby donors receive instant notifications.
4. Interested donors accept the request.
5. Patient tracks donor response status.
6. Donation is completed and recorded.
7. Admin dashboard updates statistics automatically.

---

## 📈 Future Enhancements

- Mobile Application
- Hospital Integration Portal
- Blood Bank Management Module
- Predictive Blood Demand Analytics
- Ambulance Tracking System
- AI-Based Emergency Prioritization

---

