# 💸 Payout Automation System

A **full-stack React + Firebase** application to automate and manage payouts for EdTech mentors.

> ⚠️ **Note:** After entering correct login details, click the login button again to proceed.

---

### 🚀 [Live Demo](https://payout-automation-system.netlify.app/)

---

## 🚀 Features

### 🧑‍💻 For Mentors
- 🔐 Login/Signup with Firebase Authentication  
- 📅 View assigned sessions and session history  
- 💰 See payout breakdown and download monthly receipts

### 🛠️ For Admin
- 📋 Assign sessions to mentors  
- 🧾 Calculate payouts & mark them as paid  
- 📊 View detailed payout breakdown by mentor

---

## 📁 Project Structure

```
Payout-Automation-System/
├── public/
│   └── index.html
├── src/
│   ├── components/
│   │   ├── Admin/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── SessionManager.jsx
│   │   │   ├── PayoutCalculator.jsx
│   │   │   └── ReceiptGenerator.jsx
│   │   ├── Mentor/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── SessionHistory.jsx
│   │   │   └── Receipts.jsx
│   │   ├── Auth/
│   │   │   ├── Login.jsx
│   │   │   └── SignUp.jsx
│   │   └── Layout.jsx
│   ├── pages/
│   │   └── LandingPage.jsx
│   ├── firebase.js
│   ├── App.jsx
│   └── main.jsx
├── .gitignore
├── package.json
├── README.md
└── vite.config.js / webpack.config.js
```

---

## 🧪 Tech Stack

| Layer       | Tech Used                 |
|-------------|---------------------------|
| 🖥 Frontend | React, Tailwind CSS        |
| 🔐 Auth     | Firebase Authentication    |
| 🗃 Database | Firebase Firestore         |
| 🔀 Routing  | React Router v6            |

---

## 📦 Installation & Setup

```bash
# 1️⃣ Clone the repo
git clone https://github.com/yourusername/payout-automation-system.git
cd payout-automation-system

# 2️⃣ Install dependencies
npm install

# 3️⃣ Run the development server
npm run dev
```

---

## 🔑 Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/) and create a new project  
2. Enable the following services:  
   - **Authentication** → Email/Password  
   - **Cloud Firestore**  
3. Replace your Firebase config inside `src/firebase.js`:

```js
// src/firebase.js
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID",
};
```

---

## 👥 User Roles (in Firestore)

In the `users` collection, documents must include a `role` field:

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "role": "mentor" // or "admin"
}
```

---

## 🌐 Routing Overview

| Path                         | Role    | Description                             |
|------------------------------|---------|-----------------------------------------|
| `/login`                     | Public  | Login Page                              |
| `/signup`                    | Public  | Signup Page                             |
| `/admin/dashboard`           | Admin   | Admin Dashboard                         |
| `/admin/session-manager`     | Admin   | Assign sessions to mentors              |
| `/admin/payouts`             | Admin   | Calculate and mark payouts              |
| `/admin/breakdown`           | Admin   | View mentor-wise payout breakdown       |
| `/mentor/dashboard`          | Mentor  | Mentor Dashboard                        |
| `/mentor/sessions`          | Mentor  | View session history                    |
| `/mentor/payouts`           | Mentor  | Payout breakdown                        |
| `/mentor/receipts`          | Mentor  | Download/view monthly receipts          |

---

## 🛡 Protected Routes

- 🔒 Routes are protected using `ProtectedLayout.jsx`
- 🚦 Auto-redirect based on login status and user role (`mentor` or `admin`)

---
## 🧑‍🎓 Author

Abhishek Bochare
📧 abhishekbochare2003@gmail.com

---
## 🙌 Support & Contribution

Contributions, issues and feature requests are welcome!
If you like this project, please give it a ⭐️ and share it with fellow developers.

---

> ✅ Built with ❤️ using React, Tailwind CSS & Firebase
