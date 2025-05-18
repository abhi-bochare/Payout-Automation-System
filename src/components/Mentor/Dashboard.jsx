import React, { useEffect, useState } from "react";
import {
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  doc,
} from "firebase/firestore";
import { db } from "../../firebase";
import useAuth from "../../hooks/useAuth";
import SessionHistory from "./SessionHistory";
import Receipts from "./Receipts";
import { useNavigate } from "react-router-dom";

export default function MentorDashboard() {
  const navigate = useNavigate();
  const { user, role } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showHistory, setShowHistory] = useState(false);
  const [showReceipts, setShowReceipts] = useState(false);

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const q = query(
          collection(db, "sessions"),
          where("mentorId", "==", user.uid),
          where("status", "==", "pending")
        );

        const snapshot = await getDocs(q);
        const now = new Date();

        const sessionList = snapshot.docs.map((doc) => {
          const data = doc.data();
          const sessionDate = data.date?.seconds
            ? new Date(data.date.seconds * 1000)
            : null;

          return {
            id: doc.id,
            ...data,
            dateObj: sessionDate,
            isPast: sessionDate && sessionDate < now,
          };
        });

        setSessions(sessionList);
      } catch (error) {
        console.error("Error fetching sessions:", error);
      } finally {
        setLoading(false);
      }
    };

    if (user?.uid && role === "mentor") fetchSessions();
  }, [user, role]);

  const handleStatusChange = async (id, newStatus) => {
    const confirm = window.confirm(
      `Are you sure you want to mark this session as "${newStatus}"?`
    );
    if (!confirm) return;

    try {
      await updateDoc(doc(db, "sessions", id), { status: newStatus });
      setSessions((prev) =>
        prev.map((s) => (s.id === id ? { ...s, status: newStatus } : s))
      );
    } catch (error) {
      console.error("Error updating session status:", error);
    }
  };

  const visibleSessions = sessions.filter(
    (s) => !(s.status === "completed" || s.status === "not completed")
  );

  if (loading) return <div className="p-4">Loading your dashboard...</div>;

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">
        Mentor Dashboard
      </h1>

      {/* Buttons */}
      <div className="flex flex-wrap gap-4 mb-6 transition-all duration-300">
        <button
          onClick={() => setShowHistory((prev) => !prev)}
          className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transform hover:scale-105 transition"
        >
          {showHistory ? "Hide" : "Show"} Session History
        </button>

        <button
          onClick={() => navigate("/mentor/payout-breakdown")}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transform hover:scale-105 transition"
        >
          Payout Breakdown
        </button>

        <button
          onClick={() => navigate("/mentor/receipts")}
          className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transform hover:scale-105 transition"
        >
          Payment Receipt
        </button>
      </div>

      {/* Sessions Table */}
      {visibleSessions.length === 0 ? (
        <p className="text-gray-700">No upcoming or unmarked sessions.</p>
      ) : (
        <div className="overflow-x-auto mb-6">
          <table className="min-w-full bg-white border border-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="text-left p-3 border-b">Date</th>
                <th className="text-left p-3 border-b">Duration</th>
                <th className="text-left p-3 border-b">Rate</th>
                <th className="text-left p-3 border-b">Type</th>
                <th className="text-left p-3 border-b">Status</th>
              </tr>
            </thead>
            <tbody>
              {visibleSessions.map((session) => {
                const formattedDate = session.dateObj
                  ? session.dateObj.toLocaleDateString()
                  : "N/A";

                let statusDisplay;
                if (!session.isPast) {
                  statusDisplay = (
                    <span className="text-yellow-600 font-semibold">
                      Pending
                    </span>
                  );
                } else {
                  statusDisplay = (
                    <div className="flex gap-2">
                      <button
                        onClick={() =>
                          handleStatusChange(session.id, "completed")
                        }
                        className="px-2 py-1 text-sm bg-blue-600 text-white rounded"
                      >
                        Mark Completed
                      </button>
                      <button
                        onClick={() =>
                          handleStatusChange(session.id, "not completed")
                        }
                        className="px-2 py-1 text-sm bg-red-600 text-white rounded"
                      >
                        Not Completed
                      </button>
                    </div>
                  );
                }

                return (
                  <tr key={session.id}>
                    <td className="p-3 border-b">{formattedDate}</td>
                    <td className="p-3 border-b">{session.duration} hrs</td>
                    <td className="p-3 border-b">₹{session.rate}</td>
                    <td className="p-3 border-b">
                      {session.sessionType || "—"}
                    </td>
                    <td className="p-3 border-b">{statusDisplay}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {showHistory && <SessionHistory sessions={sessions} />}
      {showReceipts && <Receipts />}
    </div>
  );
}
