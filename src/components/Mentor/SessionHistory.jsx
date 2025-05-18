import React, { useEffect, useState } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../firebase";
import useAuth from "../../hooks/useAuth";

export default function SessionHistory() {
  const { user, role, loading } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user || role !== "mentor") return;

    const fetchHistory = async () => {
      try {
        const q = query(
          collection(db, "sessions"),
          where("mentorId", "==", user.uid),
          where("status", "in", ["completed", "not completed"])
        );

        const snapshot = await getDocs(q);
        const allSessions = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        const pastSessions = allSessions.filter((s) => {
          const sessionDate = s.date?.seconds
            ? new Date(s.date.seconds * 1000)
            : null;
          return (
            sessionDate &&
            sessionDate < new Date() &&
            (s.status === "completed" || s.status === "not completed")
          );
        });

        setSessions(pastSessions);
      } catch (error) {
        console.error("Error fetching session history:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistory();
  }, [user, role]);

  if (loading || isLoading) {
    return <div className="p-4">Loading session history...</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4">Session History</h2>

      {sessions.length === 0 ? (
        <p className="text-gray-600">No completed or marked sessions found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="text-left p-3 border-b">Date</th>
                <th className="text-left p-3 border-b">Duration</th>
                <th className="text-left p-3 border-b">Rate</th>
                <th className="text-left p-3 border-b">Status</th>
              </tr>
            </thead>
            <tbody>
              {sessions.map((session) => {
                const formattedDate = session.date?.seconds
                  ? new Date(session.date.seconds * 1000).toLocaleDateString()
                  : "N/A";

                return (
                  <tr key={session.id}>
                    <td className="p-3 border-b">{formattedDate}</td>
                    <td className="p-3 border-b">{session.duration} hrs</td>
                    <td className="p-3 border-b">₹{session.rate}</td>
                    <td className="p-3 border-b">
                      {session.status === "completed" ? (
                        <span className="text-green-600 font-medium">
                          Completed
                        </span>
                      ) : (
                        <span className="text-red-600 font-medium">
                          Not Completed
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
