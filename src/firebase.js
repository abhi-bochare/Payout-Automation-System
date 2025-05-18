import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyC8Pg0VGrQ2bzmR5lUUJsd0ezaZV5hmq5s",
  authDomain: "payout-automation-system.firebaseapp.com",
  projectId: "payout-automation-system",
  storageBucket: "payout-automation-system.firebasestorage.app",
  messagingSenderId: "565757132189",
  appId: "1:565757132189:web:1e999099059891b194c374",
  measurementId: "G-9PN56X5SH9",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
