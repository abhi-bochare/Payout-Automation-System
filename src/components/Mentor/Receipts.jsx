import React, { useEffect, useState, useRef } from "react";
import {
  collection,
  query,
  where,
  getDocs,
  getDoc,
  doc,
} from "firebase/firestore";
import { db } from "../../firebase";
import useAuth from "../../hooks/useAuth";
import { format } from "date-fns";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import Layout from "../Layout";

export default function Receipts() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [groupedReceipts, setGroupedReceipts] = useState({});
  const [mentorName, setMentorName] = useState("Unknown");
  const receiptRef = useRef();

  // Fetch mentor's full name from Firestore
  useEffect(() => {
    const fetchMentorName = async () => {
      if (user?.uid) {
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          const data = userSnap.data();
          setMentorName(data.name || "Unknown");
        }
      }
    };

    fetchMentorName();
  }, [user]);

  useEffect(() => {
    const fetchPaidSessions = async () => {
      if (!user?.uid) return;

      const q = query(
        collection(db, "sessions"),
        where("mentorId", "==", user.uid),
        where("status", "==", "paid")
      );
      const snapshot = await getDocs(q);
      const sessionsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      const grouped = sessionsData.reduce((acc, session) => {
        const date = session.date?.toDate();
        if (!date) return acc;
        const key = format(date, "MMMM-yyyy");
        if (!acc[key]) acc[key] = [];
        acc[key].push(session);
        return acc;
      }, {});
      setGroupedReceipts(grouped);
      setSessions(sessionsData);
    };

    fetchPaidSessions();
  }, [user]);

  const downloadPDF = async (monthKey) => {
    const input = document.getElementById(`receipt-${monthKey}`);
    const canvas = await html2canvas(input);
    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF("p", "mm", "a4");
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save(`receipt-${monthKey}.pdf`);
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">🧾 Monthly Payment Receipts</h2>

      {Object.keys(groupedReceipts).length === 0 ? (
        <p>No paid sessions found.</p>
      ) : (
        Object.entries(groupedReceipts).map(
          ([monthKey, monthSessions], index) => {
            const total = monthSessions.reduce(
              (acc, s) => acc + (s.payoutMeta?.totalPayout || 0),
              0
            );

            return (
              <div
                key={monthKey}
                id={`receipt-${monthKey}`}
                ref={receiptRef}
                className="mb-8 border border-gray-300 rounded-lg p-6 bg-white shadow"
              >
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-semibold">{monthKey} Invoice</h3>
                  <p className="text-sm text-gray-500">
                    Invoice #: INV-{monthKey.replace("-", "").toUpperCase()}-
                    {index + 1}
                  </p>
                </div>

                <div className="mb-4">
                  <p className="text-lg font-semibold">Mentor: {mentorName}</p>
                  <p className="text-sm text-gray-600">Email: {user?.email}</p>
                </div>

                <table className="min-w-full text-sm border">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="p-2 border">Date</th>
                      <th className="p-2 border">Session Type</th>
                      <th className="p-2 border">Hours</th>
                      <th className="p-2 border">Rate</th>
                      <th className="p-2 border">Base</th>
                      <th className="p-2 border">Fee</th>
                      <th className="p-2 border">Tax</th>
                      <th className="p-2 border font-semibold">Payout</th>
                    </tr>
                  </thead>
                  <tbody>
                    {monthSessions.map((s, i) => (
                      <tr key={i}>
                        <td className="p-2 border">
                          {s.date?.toDate().toLocaleDateString()}
                        </td>
                        <td className="p-2 border">{s.sessionType || "N/A"}</td>
                        <td className="p-2 border">{s.payoutMeta?.hours}</td>
                        <td className="p-2 border">₹{s.payoutMeta?.rate}</td>
                        <td className="p-2 border">
                          ₹{s.payoutMeta?.baseAmount?.toFixed(2)}
                        </td>
                        <td className="p-2 border">
                          ₹{s.payoutMeta?.platformFee?.toFixed(2)}
                        </td>
                        <td className="p-2 border">
                          ₹{s.payoutMeta?.tax?.toFixed(2)}
                        </td>
                        <td className="p-2 border font-bold text-green-700">
                          ₹{s.payoutMeta?.totalPayout?.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div className="flex justify-end mt-4">
                  <p className="text-lg font-bold">
                    Total: ₹{total.toFixed(2)}
                  </p>
                </div>

                <button
                  onClick={() => downloadPDF(monthKey)}
                  className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition"
                >
                  Download PDF
                </button>
              </div>
            );
          }
        )
      )}
    </div>
  );
}
