import React, { useEffect, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../../firebase";

export default function AdminPayoutBreakdown() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllSessions = async () => {
      try {
        const q = query(
          collection(db, "sessions"),
          where("status", "in", ["completed", "paid"])
        );
        const snapshot = await getDocs(q);
        const data = snapshot.docs
          .map((doc) => ({ id: doc.id, ...doc.data() }))
          .filter((s) => s.payoutMeta);

        setSessions(data);
      } catch (err) {
        console.error("Error fetching sessions for admin:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAllSessions();
  }, []);

  const groupedByMentor = sessions.reduce((acc, session) => {
    const { mentorId, mentorName, payoutMeta } = session;
    if (!acc[mentorId]) {
      acc[mentorId] = {
        mentorName: mentorName || "Unknown",
        sessions: [],
        totalPaid: 0,
        totalUnpaid: 0,
      };
    }

    acc[mentorId].sessions.push(session);
    if (payoutMeta.paid) {
      acc[mentorId].totalPaid += payoutMeta.totalPayout;
    } else {
      acc[mentorId].totalUnpaid += payoutMeta.totalPayout;
    }

    return acc;
  }, {});

  if (loading) return <p className="p-4">Loading payout data...</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">
        👩‍💼 Admin: Mentor Payout Breakdown
      </h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Object.entries(groupedByMentor).map(([mentorId, data]) => (
          <div key={mentorId} className="border rounded shadow p-4 bg-white">
            <h2 className="text-lg font-semibold mb-2">{data.mentorName}</h2>
            <p className="text-green-700 font-bold">
              ✅ Total Paid: ₹{data.totalPaid.toFixed(2)}
            </p>
            <p className="text-red-600 font-bold mb-2">
              ❌ Total Unpaid: ₹{data.totalUnpaid.toFixed(2)}
            </p>
            <div className="max-h-64 overflow-y-auto border-t mt-2 pt-2">
              {data.sessions.map((s) => (
                <div key={s.id} className="mb-2 text-sm border-b pb-1">
                  <p>
                    <strong>Date:</strong>{" "}
                    {s.date?.toDate().toLocaleDateString() || "N/A"}
                  </p>
                  <p>
                    <strong>Hours:</strong> {s.payoutMeta.hours}
                  </p>
                  <p>
                    <strong>Payout:</strong> ₹
                    {s.payoutMeta.totalPayout.toFixed(2)}
                  </p>
                  <p>
                    <strong>Status:</strong>{" "}
                    {s.payoutMeta.paid ? "✅ Paid" : "❌ Unpaid"}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
