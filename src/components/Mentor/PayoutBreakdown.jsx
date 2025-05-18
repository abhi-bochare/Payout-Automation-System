import React, { useEffect, useState } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../firebase";
import useAuth from "../../hooks/useAuth";

export default function PayoutBreakdown() {
  const { user, loading } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [filterStatus, setFilterStatus] = useState("all"); // all | paid | unpaid

  useEffect(() => {
    const fetchPayouts = async () => {
      if (!user || !user.uid) return;

      try {
        const q = query(
          collection(db, "sessions"),
          where("mentorId", "==", user.uid),
          where("status", "in", ["completed", "paid"])
        );

        const snapshot = await getDocs(q);
        const data = snapshot.docs
          .map((doc) => doc.data())
          .filter((session) => session.payoutMeta);

        setSessions(data);
      } catch (error) {
        console.error("❌ Error fetching payout data:", error);
      } finally {
        setLoadingData(false);
      }
    };

    if (!loading) {
      fetchPayouts();
    }
  }, [user, loading]);

  const filteredSessions =
    filterStatus === "all"
      ? sessions
      : sessions.filter(
          (s) => !!s.payoutMeta?.paid === (filterStatus === "paid")
        );

  const totalPaid = sessions
    .filter((s) => s.payoutMeta?.paid)
    .reduce((sum, s) => sum + s.payoutMeta.totalPayout, 0);

  const totalUnpaid = sessions
    .filter((s) => !s.payoutMeta?.paid)
    .reduce((sum, s) => sum + s.payoutMeta.totalPayout, 0);

  if (loading || loadingData) {
    return <p className="p-4 text-gray-600">🔄 Loading payout details...</p>;
  }

  return (
    <div className="p-4">
      <h2 className="text-2xl font-semibold mb-4">💸 Your Payout Breakdown</h2>

      <div className="flex flex-wrap gap-4 mb-6">
        <div className="bg-green-100 text-green-800 p-4 rounded shadow w-full sm:w-auto">
          <h3 className="font-bold">Total Paid</h3>
          <p className="text-xl font-semibold">₹{totalPaid.toFixed(2)}</p>
        </div>
        <div className="bg-red-100 text-red-800 p-4 rounded shadow w-full sm:w-auto">
          <h3 className="font-bold">Total Unpaid</h3>
          <p className="text-xl font-semibold">₹{totalUnpaid.toFixed(2)}</p>
        </div>
        <div className="flex items-center gap-2">
          <label className="font-semibold text-sm">Filter:</label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="border border-gray-300 rounded px-2 py-1 text-sm"
          >
            <option value="all">All</option>
            <option value="paid">Paid</option>
            <option value="unpaid">Unpaid</option>
          </select>
        </div>
      </div>

      {filteredSessions.length === 0 ? (
        <p>No payouts available for selected filter.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredSessions.map((s, idx) => (
            <div
              key={idx}
              className={`border rounded-lg p-4 shadow-sm ${
                s.payoutMeta.paid ? "bg-green-50" : "bg-red-50"
              }`}
            >
              <p className="text-sm text-gray-500">
                {s.date?.toDate().toLocaleString() || "—"}
              </p>
              <p className="font-bold text-lg text-gray-800">
                ₹{s.payoutMeta.totalPayout.toFixed(2)}
              </p>
              <p className="text-sm">Hours: {s.payoutMeta.hours}</p>
              <p className="text-sm">Rate: ₹{s.payoutMeta.rate}</p>
              <p className="text-sm">
                Platform Fee: ₹{s.payoutMeta.platformFee.toFixed(2)}
              </p>
              <p className="text-sm">Tax: ₹{s.payoutMeta.tax.toFixed(2)}</p>
              <p className="text-sm font-semibold mt-2">
                Status:{" "}
                <span
                  className={
                    s.payoutMeta.paid ? "text-green-700" : "text-red-700"
                  }
                >
                  {s.payoutMeta.paid ? "✅ Paid" : "❌ Unpaid"}
                </span>
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
