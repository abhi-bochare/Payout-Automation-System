import React, { useEffect, useState } from "react";
import { Bell, LogOut, Menu } from "lucide-react";
import { auth, db } from "../firebase";
import { signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

export default function Layout({ user, children }) {
  const navigate = useNavigate();
  const [userName, setUserName] = useState("");

  useEffect(() => {
    const fetchUserData = async () => {
      if (user?.uid) {
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          setUserName(userSnap.data().name);
        }
      }
    };
    fetchUserData();
  }, [user]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/landingpage");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <Menu className="h-8 w-8 text-indigo-600" />
                <span className="ml-2 text-xl font-bold text-gray-900">
                  PayoutPro
                </span>
              </div>
            </div>
            <div className="flex items-center">
              <button className="p-2 rounded-full hover:bg-gray-100">
                <Bell className="h-6 w-6 text-gray-500" />
              </button>
              <div className="ml-3 relative flex items-center">
                <img
                  className="h-8 w-8 rounded-full"
                  src={`https://api.dicebear.com/7.x/initials/svg?seed=${
                    userName || "User"
                  }`}
                  alt={userName || "User"}
                />
                <span className="ml-2 text-sm font-medium text-gray-700">
                  {userName || "Loading..."}
                </span>
                <button
                  onClick={handleLogout}
                  className="ml-4 p-2 rounded-full hover:bg-gray-100"
                >
                  <LogOut className="h-5 w-5 text-gray-500" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">{children}</main>
    </div>
  );
}
