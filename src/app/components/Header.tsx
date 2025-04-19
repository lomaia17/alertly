'use client';

import Link from 'next/link';
import { useAuth } from '../context/AuthContext'; 
import { signOut } from 'firebase/auth';
import { auth } from '../lib/fireBaseConfig';

export default function Header() {
  const { user, loading } = useAuth();
  const handleLogout = async () => {
    await signOut(auth);
  };

  return (
    <header className="w-full flex items-center justify-between px-8 py-4 bg-white dark:bg-gray-950 text-black dark:text-white shadow-md">
      <Link
        href="/"
        className="text-xl sm:text6xl font-extrabold bg-gradient-to-r from-purple-500 via-pink-500 to-yellow-500 text-transparent bg-clip-text"
      >
        Alertly
      </Link>

      <div className="flex space-x-4">
        {!loading && user ? (
          <button
            onClick={handleLogout}
            className="px-4 py-2 text-black dark:text-white relative overflow-hidden font-medium group"
          >
            Logout
            <span className="absolute bottom-0 left-0 w-full h-0.5 bg-red-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></span>
          </button>
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
