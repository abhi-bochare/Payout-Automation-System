import React, { useState, useEffect } from "react";
import { collection, addDoc, getDocs } from "firebase/firestore";
import { db } from "../../firebase";
import Papa from "papaparse";
import { query, orderBy, onSnapshot } from "firebase/firestore";

export default function SessionManager() {
  const [sessions, setSessions] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [mentors, setMentors] = useState([]);
  const [selectedMentorId, setSelectedMentorId] = useState("");
  const [formData, setFormData] = useState({
    date: "",
    duration: "",
    sessionType: "live",
    rate: 4000,
  });

  // Fetch all mentors on mount
  useEffect(() => {
    const fetchMentors = async () => {
      const querySnapshot = await getDocs(collection(db, "users"));
      const mentorList = [];
      querySnapshot.forEach((doc) => {
        if (doc.data().role === "mentor") {
          mentorList.push({
            id: doc.id,
            name: doc.data().name || "Unnamed Mentor",
          });
        }
      });
      setMentors(mentorList);
    };

    fetchMentors();
  }, []);

  // Fetch all sessions in real-time for admin
  useEffect(() => {
    const q = query(collection(db, "sessions"), orderBy("date", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const allSessions = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setSessions(allSessions);
    });

    return () => unsubscribe();
  }, []);

  // Handle form-based session addition
  const handleAddSession = async (e) => {
    e.preventDefault();
    if (!selectedMentorId) {
      alert("Please select a mentor.");
      return;
    }

    const newSession = {
      mentorId: selectedMentorId,
      date: new Date(formData.date),
      duration: parseFloat(formData.duration),
      sessionType: formData.sessionType,
      rate: parseFloat(formData.rate),
      status: "pending",
    };

    try {
      const sessionRef = await addDoc(collection(db, "sessions"), newSession);
      setSessions([...sessions, { id: sessionRef.id, ...newSession }]);
      alert("Session added!");
    } catch (err) {
      console.error("Error adding session:", err);
    }
  };

  // Handle CSV Upload
  const handleCSVUpload = (e) => {
    const file = e.target.files[0];
    setIsUploading(true);

    Papa.parse(file, {
      header: true,
      complete: async (results) => {
        const batch = [];
        results.data.forEach((session) => {
          if (session.mentorId && session.duration) {
            batch.push({
              mentorId: session.mentorId,
              date: new Date(session.date),
              duration: parseFloat(session.duration),
              sessionType: session.sessionType || "live",
              rate: parseFloat(session.rate) || 4000,
              status: "pending",
            });
          }
        });

        try {
          const sessionCollection = collection(db, "sessions");
          await Promise.all(
            batch.map((session) => addDoc(sessionCollection, session))
          );
          setSessions([...sessions, ...batch]);
        } catch (error) {
          console.error("Error uploading sessions:", error);
        } finally {
          setIsUploading(false);
        }
      },
    });
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 md:p-10 max-w-5xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-indigo-700">
        Session Management
      </h2>

      {/* CSV Upload */}
      <div className="mb-8">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Upload CSV File
        </label>
        <input
          type="file"
          accept=".csv"
          onChange={handleCSVUpload}
          disabled={isUploading}
          className="block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 transition"
        />
      </div>

      {/* Manual Form Entry */}
      <form
        onSubmit={handleAddSession}
        className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10"
      >
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Select Mentor
          </label>
          <select
            value={selectedMentorId}
            onChange={(e) => setSelectedMentorId(e.target.value)}
            className="block w-full p-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="">-- Select Mentor --</option>
            {mentors.map((mentor) => (
              <option key={mentor.id} value={mentor.id}>
                {mentor.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Date
          </label>
          <input
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            className="block w-full p-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Duration (hours)
          </label>
          <input
            type="number"
            value={formData.duration}
            onChange={(e) =>
              setFormData({ ...formData, duration: e.target.value })
            }
            className="block w-full p-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Session Type
          </label>
          <select
            value={formData.sessionType}
            onChange={(e) =>
              setFormData({ ...formData, sessionType: e.target.value })
            }
            className="block w-full p-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="live">Live</option>
            <option value="evaluation">Evaluation</option>
            <option value="alh">ALH</option>
            <option value="recorded">Recorded Review</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Rate (₹/hour)
          </label>
          <input
            type="number"
            value={formData.rate}
            onChange={(e) => setFormData({ ...formData, rate: e.target.value })}
            className="block w-full p-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <div className="md:col-span-2">
          <button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 rounded-lg transition"
          >
            Add Session
          </button>
        </div>
      </form>

      {/* Sessions Table */}
      <h3 className="text-xl font-semibold mb-4 text-gray-800">All Sessions</h3>
      <div className="overflow-auto border border-gray-200 rounded-lg">
        <table className="min-w-full divide-y divide-gray-200 text-sm text-left">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Mentor ID</th>
              <th className="px-4 py-3">Session Type</th>
              <th className="px-4 py-3">Duration (hrs)</th>
              <th className="px-4 py-3">Rate (₹)</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {sessions.map((session) => (
              <tr key={session.id} className="hover:bg-gray-50 transition">
                <td className="px-4 py-2">
                  {session.date?.toDate
                    ? session.date.toDate().toLocaleDateString()
                    : new Date(session.date).toLocaleDateString()}
                </td>
                <td className="px-4 py-2">{session.mentorId}</td>
                <td className="px-4 py-2 capitalize">{session.sessionType}</td>
                <td className="px-4 py-2">{session.duration}</td>
                <td className="px-4 py-2">₹{session.rate}</td>
                <td className="px-4 py-2 capitalize">{session.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
