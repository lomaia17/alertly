import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCredits } from '../hooks/useCredits';
import { signOut } from 'firebase/auth';
import { auth } from '../lib/fireBaseConfig';
import Link from 'next/link';
import { FaCoins } from 'react-icons/fa';
import { addUserCredits } from '../lib/updateCredits';

export default function Header() {
  const { user, loading } = useAuth();
  const credits = useCredits(user ? user.uid : null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCredits, setSelectedCredits] = useState(0);

  const handleLogout = async () => {
    await signOut(auth);
  };

  const handleBuyCredits = async () => {
    if (user && selectedCredits > 0) {
      try {
        await addUserCredits(user.uid, selectedCredits);
        console.log(`Successfully added ${selectedCredits} credits.`);
      } catch (error) {
        console.error("Failed to add credits:", error);
      } finally {
        setIsModalOpen(false);
        setSelectedCredits(0);
      }
    }
  };

  return (
    <header className="w-full flex items-center justify-between px-8 py-4 bg-white dark:bg-gray-950 text-black dark:text-white shadow-md">
      <Link
        href="/"
        className="text-xl sm:text-4xl font-extrabold bg-gradient-to-r from-purple-500 via-pink-500 to-yellow-500 text-transparent bg-clip-text"
      >
        Alertly
      </Link>

      <div className="flex items-center space-x-6">
        {!loading && user ? (
          <>
            <div className="flex items-center space-x-3">
            <div
                className="flex items-center space-x-2 cursor-pointer px-4 py-2 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 transition-all hover:scale-105"
                onClick={() => setIsModalOpen(true)}
              >
                <FaCoins className="text-yellow-400 text-2xl animate-pulse drop-shadow-md" />
                <span className="font-semibold text-sm sm:text-base text-white bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-500 bg-clip-text text-transparent">
                  Credits: {credits !== null ? credits : 'Loading...'}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-black dark:text-white relative overflow-hidden font-medium group"
              >
                Logout
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-red-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></span>
              </button>
            </div>

            {/* Modal */}
            {isModalOpen && (
             <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-gradient-to-br from-[#00000080] via-[#1a1a1a80] to-[#00000080] animate-fade-in">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-xl w-96">
                  <h2 className="text-xl font-bold text-center mb-4">Buy Credits</h2>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="font-semibold">10 Credits</span>
                      <button
                        className={`px-4 py-2 rounded-lg transition-all duration-200 cursor-pointer ${
                          selectedCredits === 10
                            ? 'bg-blue-700 text-white scale-105 shadow-md'
                            : 'bg-blue-500 text-white hover:bg-blue-600'
                        }`}
                        onClick={() => setSelectedCredits(10)}
                      >
                        Select
                      </button>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-semibold">50 Credits</span>
                      <button
                        className={`px-4 py-2 rounded-lg cursor-pointer transition-all duration-200 ${
                          selectedCredits === 50
                            ? 'bg-blue-700 text-white scale-105 shadow-md'
                            : 'bg-blue-500 text-white hover:bg-blue-600'
                        }`}
                        onClick={() => setSelectedCredits(50)}
                      >
                        Select
                      </button>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-semibold">100 Credits</span>
                      <button
                        className={`px-4 py-2 rounded-lg cursor-pointer transition-all duration-200 ${
                          selectedCredits === 100
                            ? 'bg-blue-700 text-white scale-105 shadow-md'
                            : 'bg-blue-500 text-white hover:bg-blue-600'
                        }`}
                        onClick={() => setSelectedCredits(100)}
                      >
                        Select
                      </button>
                    </div>
                  </div>

                  {selectedCredits > 0 && (
                    <p className="mt-4 text-center text-green-500 font-semibold">
                      Selected: {selectedCredits} Credits
                    </p>
                  )}

                  <div className="flex justify-between mt-6">
                    <button
                      onClick={handleBuyCredits}
                      className="px-6 py-2 bg-green-500 text-white rounded-lg"
                    >
                      Buy Credits
                    </button>
                    <button
                      onClick={() => setIsModalOpen(false)}
                      className="px-6 py-2 bg-gray-400 text-white rounded-lg cursor-pointer"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          <>
            <Link
              href="/login"
              className="px-4 py-2 text-black dark:text-white relative overflow-hidden font-medium group"
            >
              Login
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></span>
            </Link>
            <Link
              href="/register"
              className="px-4 py-2 text-black dark:text-white relative overflow-hidden font-medium group"
            >
              Register
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></span>
            </Link>
          </>
        )}
      </div>
    </header>
  );
}
