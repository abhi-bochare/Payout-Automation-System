import React from "react";
import { Link } from "react-router-dom";

export default function AdminDashboard() {
  return (
    <div className="bg-white rounded-lg shadow p-6 max-w-5xl mx-auto my-8 transition-all duration-500 ease-in-out">
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">
        Admin Dashboard
      </h1>

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {[
          {
            title: "Pending Payouts",
            amount: "₹45,000",
            bg: "bg-indigo-50",
            text: "text-indigo-900",
            amountText: "text-indigo-600",
          },
          {
            title: "Paid This Month",
            amount: "₹1,20,000",
            bg: "bg-green-50",
            text: "text-green-900",
            amountText: "text-green-600",
          },
          {
            title: "Active Sessions",
            amount: "24",
            bg: "bg-purple-50",
            text: "text-purple-900",
            amountText: "text-purple-600",
          },
        ].map(({ title, amount, bg, text, amountText }) => (
          <div
            key={title}
            className={`${bg} p-6 rounded-lg shadow transform transition-transform duration-300 hover:scale-105 hover:shadow-lg`}
          >
            <h2 className={`text-lg font-medium ${text}`}>{title}</h2>
            <p className={`mt-2 text-3xl font-bold ${amountText}`}>{amount}</p>
          </div>
        ))}
      </div>

      {/* Admin Tools Navigation */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">
          Admin Tools
        </h3>
        <div className="flex flex-wrap gap-3">
          <Link
            to="/admin/sessions"
            className="inline-block bg-blue-600 text-white px-5 py-2 rounded shadow-md
                       transform transition duration-300 ease-in-out
                       hover:bg-blue-700 hover:scale-105 hover:shadow-xl
                       focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
          >
            Manage Sessions
          </Link>
          <Link
            to="/admin/payouts"
            className="inline-block bg-indigo-600 text-white px-5 py-2 rounded shadow-md
                       transform transition duration-300 ease-in-out
                       hover:bg-indigo-700 hover:scale-105 hover:shadow-xl
                       focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2"
          >
            Calculate Payouts
          </Link>
          <Link
            to="/admin/payout-breakdown"
            className="inline-block bg-blue-600 text-white px-5 py-2 rounded shadow-md
                       transform transition duration-300 ease-in-out
                       hover:bg-blue-700 hover:scale-105 hover:shadow-xl
                       focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
          >
            💸 View Mentor Payouts
          </Link>
        </div>
      </div>
    </div>
  );
}
