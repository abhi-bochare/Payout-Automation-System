import React from "react";
import { Link } from "react-router-dom";
import { Wallet, Users, Shield } from "lucide-react";
import { motion } from "framer-motion";

export default function LandingPage({ user }) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white">
      {/* Navigation */}
      <nav className="bg-white shadow-sm fixed top-0 left-0 right-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <Wallet className="h-8 w-8 text-indigo-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">
                PayoutPro
              </span>
            </div>
            <div className="flex items-center space-x-4">
              {user ? (
                <Link
                  to="/dashboard"
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-500 transition duration-300"
                >
                  Go to Dashboard
                </Link>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="px-4 py-2 text-sm font-medium text-indigo-600 hover:text-indigo-500 transition duration-300"
                  >
                    Log in
                  </Link>
                  <Link
                    to="/signup"
                    className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-500 transition duration-300"
                  >
                    Sign up
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
              <span className="block">Streamline Your</span>
              <span className="block text-indigo-600">Mentor Payouts</span>
            </h1>
            <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
              Automate payments, track sessions, and manage your EdTech
              platform's mentor compensation effortlessly.
            </p>

            {!user && (
              <div className="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">
                <Link
                  to="/signup"
                  className="w-full flex items-center justify-center px-8 py-3 text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 transition duration-300 transform hover:scale-105"
                >
                  Get started
                </Link>
              </div>
            )}
          </motion.div>

          {/* Features */}
          <motion.div
            className="mt-24 grid grid-cols-1 gap-10 md:grid-cols-3"
            initial="hidden"
            animate="visible"
            variants={{
              visible: {
                transition: {
                  staggerChildren: 0.2,
                },
              },
            }}
          >
            {[
              {
                Icon: Wallet,
                title: "Automated Payouts",
                description:
                  "Calculate and process mentor payments automatically based on sessions and rates.",
              },
              {
                Icon: Users,
                title: "Mentor Management",
                description:
                  "Track mentor sessions, performance, and payment history in one place.",
              },
              {
                Icon: Shield,
                title: "Secure & Transparent",
                description:
                  "Keep payment data secure and maintain complete transparency with mentors.",
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                className="flex flex-col items-center text-center bg-white p-6 rounded-xl shadow hover:shadow-lg transition duration-300 transform hover:scale-105"
                variants={{
                  hidden: { opacity: 0, y: 30 },
                  visible: { opacity: 1, y: 0 },
                }}
              >
                <div className="flex items-center justify-center h-16 w-16 rounded-md bg-indigo-500 text-white mb-4">
                  <feature.Icon className="h-8 w-8" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {feature.title}
                </h2>
                <p className="mt-2 text-gray-500">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </main>
    </div>
  );
}
