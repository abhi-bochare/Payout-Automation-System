import { Routes, Route, Navigate } from "react-router-dom";
import { auth, db } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useState, useEffect } from "react";

import Layout from "./components/Layout";
import LandingPage from "./pages/LandingPage";
import Login from "./components/Auth/Login";
import SignUp from "./components/Auth/SignUp";
import AdminDashboard from "./components/Admin/Dashboard";
import MentorDashboard from "./components/Mentor/Dashboard";
import SessionManager from "./components/Admin/SessionManager";
import PayoutCalculator from "./components/Admin/PayoutCalculator";
import PayoutBreakdown from "./components/Mentor/PayoutBreakdown";
import AdminPayoutBreakdown from "./components/Admin/AdminPayoutBreakdown";
import Receipts from "./components/Mentor/Receipts";

function App() {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        const docRef = doc(db, "users", currentUser.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setUser(currentUser);
          setRole(docSnap.data().role);
        }
      } else {
        setUser(null);
        setRole(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        Loading...
      </div>
    );
  }

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<LandingPage />} />
      <Route
        path="/login"
        element={user ? <Navigate to="/dashboard" /> : <Login />}
      />
      <Route
        path="/signup"
        element={user ? <Navigate to="/dashboard" /> : <SignUp />}
      />

      <Route
        path="/dashboard"
        element={
          user ? (
            <Layout user={user}>
              {role === "admin" ? <AdminDashboard /> : <MentorDashboard />}
            </Layout>
          ) : (
            <Navigate to="/login" />
          )
        }
      />

      <Route
        path="/admin/sessions"
        element={
          user && role === "admin" ? (
            <Layout user={user}>
              <SessionManager />
            </Layout>
          ) : (
            <Navigate to="/login" />
          )
        }
      />

      <Route
        path="/admin/payouts"
        element={
          user && role === "admin" ? (
            <Layout user={user}>
              <PayoutCalculator />
            </Layout>
          ) : (
            <Navigate to="/login" />
          )
        }
      />

      <Route
        path="/mentor/payout-breakdown"
        element={
          user ? (
            <Layout user={user}>
              <PayoutBreakdown />
            </Layout>
          ) : (
            <Navigate to="/login" />
          )
        }
      />
      <Route
        path="/admin/payout-breakdown"
        element={
          user ? (
            <Layout user={user}>
              <AdminPayoutBreakdown />
            </Layout>
          ) : (
            <Navigate to="/login" />
          )
        }
      />

      <Route
        path="/mentor/receipts"
        element={
          user ? (
            <Layout user={user}>
              <Receipts />
            </Layout>
          ) : (
            <Navigate to="/login" />
          )
        }
      />

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default App;
