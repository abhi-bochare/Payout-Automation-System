import React, { useState, useEffect } from "react";
import { doc, setDoc } from "firebase/firestore";
import {
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  Timestamp,
} from "firebase/firestore";
import { db } from "../../firebase";

export default function PayoutCalculator() {
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().setDate(new Date().getDate() - 30)),
    end: new Date(),
  });
  const [statusFilter, setStatusFilter] = useState("completed");
  const [mentorList, setMentorList] = useState([]);
  const [selectedMentor, setSelectedMentor] = useState("");
  const [platformFeePercent, setPlatformFeePercent] = useState(10);
  const [taxPercent, setTaxPercent] = useState(18);
  const [payouts, setPayouts] = useState([]);
  const [isCalculating, setIsCalculating] = useState(false);

  useEffect(() => {
    const fetchMentors = async () => {
      const snapshot = await getDocs(
        query(collection(db, "users"), where("role", "==", "mentor"))
      );
      setMentorList(
        snapshot.docs.map((doc) => ({
          id: doc.id,
          name: doc.data().name || "Unnamed Mentor",
        }))
      );
    };
    fetchMentors();
  }, []);

  const calculatePayouts = async () => {
    setIsCalculating(true);
    try {
      const sessionsQuery = query(
        collection(db, "sessions"),
        where("date", ">=", Timestamp.fromDate(dateRange.start)),
        where("date", "<=", Timestamp.fromDate(dateRange.end)),
        where("status", "==", statusFilter)
      );

      const snapshot = await getDocs(sessionsQuery);
      const sessions = snapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data(), ref: doc.ref }))
        .filter(
          (session) => !selectedMentor || session.mentorId === selectedMentor
        );

      const mentorMap = {};
      mentorList.forEach((m) => {
        mentorMap[m.id] = m.name;
      });

      const grouped = sessions.reduce((acc, session) => {
        const { mentorId, duration, rate } = session;
        const hours = duration; // directly in hours
        const baseAmount = hours * rate;
        const platformFee = (baseAmount * platformFeePercent) / 100;
        const tax = ((baseAmount - platformFee) * taxPercent) / 100;
        const totalPayout = baseAmount - platformFee - tax;

        if (!acc[mentorId]) {
          acc[mentorId] = {
            mentorId,
            mentorName: mentorMap[mentorId] || "Unknown",
            totalHours: 0,
            baseAmount: 0,
            platformFee: 0,
            tax: 0,
            totalPayout: 0,
            sessions: [],
          };
        }

        acc[mentorId].totalHours += hours;
        acc[mentorId].baseAmount += baseAmount;
        acc[mentorId].platformFee += platformFee;
        acc[mentorId].tax += tax;
        acc[mentorId].totalPayout += totalPayout;
        acc[mentorId].sessions.push({
          ...session,
          payoutMeta: {
            hours,
            rate,
            baseAmount,
            platformFee,
            tax,
            totalPayout,
          },
        });

        return acc;
      }, {});

      const payoutArray = Object.values(grouped);
      setPayouts(payoutArray);

      // Save calculated payouts to Firestore (status: unpaid)
      for (const payout of payoutArray) {
        const docRef = doc(db, "payoutMeta", payout.mentorId);
        await setDoc(docRef, {
          ...payout,
          status: "unpaid",
          createdAt: new Date(),
        });

        // 🟢 Write `payoutMeta` to each individual session
        for (const session of payout.sessions) {
          await updateDoc(session.ref, {
            payoutMeta: {
              ...session.payoutMeta,
              paid: false, // explicitly set status
            },
          });
        }
      }
    } catch (error) {
      console.error("Error calculating payouts:", error);
    } finally {
      setIsCalculating(false);
    }
  };

  const markSessionsAsPaid = async (payout) => {
    const mentorId = payout.mentorId;

    if (
      !window.confirm(
        "Are you sure you want to mark all sessions for this mentor as paid?"
      )
    )
      return;

    try {
      // Use Firestore Timestamp for date filtering
      const sessionsQuery = query(
        collection(db, "sessions"),
        where("mentorId", "==", mentorId),
        where("date", ">=", Timestamp.fromDate(dateRange.start)),
        where("date", "<=", Timestamp.fromDate(dateRange.end)),
        where("status", "==", "completed") // Should match sessions that are ready to pay
      );

      const snapshot = await getDocs(sessionsQuery);

      if (snapshot.empty) {
        alert(
          "No sessions found to mark as paid for this mentor in the selected date range."
        );
        return;
      }

      // Update all matching sessions to status = "paid" and payoutMeta.paid = true
      const updatePromises = snapshot.docs.map(async (docSnap) => {
        const sessionData = docSnap.data();
        return updateDoc(docSnap.ref, {
          status: "paid",
          payoutMeta: {
            ...sessionData.payoutMeta,
            paid: true,
          },
        });
      });

      await Promise.all(updatePromises);

      alert("Sessions marked as paid successfully!");

      // Refresh payouts
      await calculatePayouts();
    } catch (error) {
      console.error("Error marking sessions as paid:", error);
      alert("Failed to mark sessions as paid.");
    }
  };

  return (
    <div className="p-6 bg-white rounded-xl shadow-md">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        Admin Payout Calculator
      </h2>

      {/* Filter Inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Start Date
          </label>
          <input
            type="date"
            value={dateRange.start.toISOString().split("T")[0]}
            onChange={(e) =>
              setDateRange({ ...dateRange, start: new Date(e.target.value) })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            End Date
          </label>
          <input
            type="date"
            value={dateRange.end.toISOString().split("T")[0]}
            onChange={(e) =>
              setDateRange({ ...dateRange, end: new Date(e.target.value) })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Mentor
          </label>
          <select
            value={selectedMentor}
            onChange={(e) => setSelectedMentor(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All Mentors</option>
            {mentorList.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Status
          </label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="completed">Completed</option>
            <option value="paid">Paid</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Platform Fee (%)
          </label>
          <input
            type="number"
            value={platformFeePercent}
            onChange={(e) => setPlatformFeePercent(Number(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tax (%)
          </label>
          <input
            type="number"
            value={taxPercent}
            onChange={(e) => setTaxPercent(Number(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Calculate Button */}
      <button
        onClick={calculatePayouts}
        disabled={isCalculating}
        className="mb-6 inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-2 rounded-lg transition duration-200"
      >
        {isCalculating ? "Calculating..." : "Calculate Payouts"}
      </button>

      {/* Payout Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {payouts.map((p) => (
          <div
            key={p.mentorId}
            className="bg-gray-50 border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition duration-200"
          >
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              {p.mentorName}
            </h3>
            <p className="text-sm text-gray-600">
              Mentor ID: <span className="font-medium">{p.mentorId}</span>
            </p>
            <p className="text-sm text-gray-600">
              Total Hours: {p.totalHours.toFixed(2)}
            </p>
            <p className="text-sm text-gray-600">
              Base Amount: ₹{p.baseAmount.toFixed(2)}
            </p>
            <p className="text-sm text-gray-600">
              Platform Fee: ₹{p.platformFee.toFixed(2)}
            </p>
            <p className="text-sm text-gray-600">Tax: ₹{p.tax.toFixed(2)}</p>
            <p className="text-sm text-green-700 font-semibold mt-2">
              Total Payout: ₹{p.totalPayout.toFixed(2)}
            </p>

            <button
              onClick={() => markSessionsAsPaid(p)}
              className="mt-3 text-sm bg-green-600 hover:bg-green-700 text-white font-medium px-4 py-1 rounded transition duration-150"
            >
              Mark as Paid
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
