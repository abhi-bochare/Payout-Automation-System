# 💸 Payout Automation System

A full-stack React + Firebase application to automate and manage payouts for EdTech mentors.
### Note:
After entering correct login details just click on login button again to login.

## 🚀 Features

### 🧑‍💻 For Mentors:
- Login/Signup with Firebase Authentication
- View assigned sessions and history
- See payout breakdown and monthly receipts

### 🛠 For Admin:
- Assign sessions to mentors
- Calculate and mark payouts as paid
- View comprehensive payout breakdown by mentor

## 🗂 Project Structure

Payout-Automation-System/
├── public/
│   └── index.html
├── src/
├── components/
│   ├── Admin/
│   │   ├── Dashboard.jsx
│   │   ├── SessionManager.jsx
│   │   ├── PayoutCalculator.jsx
│   │   ├── ReceiptGenerator.jsx
│   │   └── 
│   ├── Mentor/
│   │   ├── Dashboard.jsx
│   │   ├── SessionHistory.jsx
│   │   └── Receipts.jsx
│   ├── Auth/
│   │   ├── Login.jsx
│   │   └── SignUp.jsx
│   └── Layout.jsx
├── pages/
│   └──LandingPage.jsx
│    
├── firebase.js
├── App.jsx
└── main.jsx
├── .gitignore
├── package.json
├── README.md
└── vite.config.js or webpack.config.js (depending on setup)

## 🧪 Tech Stack

- *Frontend*: React, TailwindCSS
- *Auth*: Firebase Authentication
- *Database*: Firebase Firestore
- *Routing*: React Router v6

## 📦 Installation & Setup

```bash
# Clone the repo
git clone https://github.com/yourusername/payout-automation-system.git
cd payout-automation-system

# Install dependencies
npm install

# Start development server
npm run dev

🔑 Firebase Setup

1. Create a Firebase project at Firebase Console.


2. Enable:

Authentication (Email/Password)

Firestore Database



3. Replace config in firebase.js with your Firebase credentials.



// src/firebase.js
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  ...
};

✅ User Roles

User documents in Firestore (users collection) must contain a role field:

"admin" for admin access

"mentor" for mentor dashboard


{
  "name": "John Doe",
  "email": "john@example.com",
  "role": "mentor"
}

📁 Routing Overview

Path	Role	Description

/login	Public	Login page
/signup	Public	Signup page
/admin/dashboard	Admin	Admin dashboard
/admin/session-manager	Admin	Assign sessions to mentors
/admin/payouts	Admin	Calculate and manage payouts
/admin/breakdown	Admin	View mentor-wise payout breakdown
/mentor/dashboard	Mentor	Mentor dashboard
/mentor/sessions	Mentor	Session history
/mentor/payouts	Mentor	Payout breakdown
/mentor/receipts	Mentor	Monthly receipts


🛡 Protected Routes

Admin and Mentor routes are protected using ProtectedLayout.jsx.

Auto-redirects based on login status and role.

