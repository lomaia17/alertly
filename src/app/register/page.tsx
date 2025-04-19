'use client'; // Ensure this is a client-side component

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation'; // Corrected import for client-side navigation
import axios from 'axios';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isRegistered, setIsRegistered] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const router = useRouter(); // Using useRouter from next/navigation for client-side routing

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    try {
      // Sending the registration request to your API route
      const response = await axios.post('/api/auth/register', { email, password });

      if (response.data.message === 'User created successfully') {
        // Display success message
        setSuccessMessage('Registration successful! You will be redirected to the login page.');
        setIsRegistered(true);
      }
    } catch (error) {
      setError(error.response?.data?.error || 'Something went wrong');
    }
  };

  useEffect(() => {
    if (isRegistered) {
      // Delay redirect for 3 seconds to show success message
      const timer = setTimeout(() => {
        router.push('/login'); // Redirect to login page
      }, 3000); // Delay for 3 seconds to show the success message

      // Clear timer if component is unmounted
      return () => clearTimeout(timer);
    }
  }, [isRegistered, router]);

  return (
    <div className="min-h-screen flex justify-center items-center bg-gradient-to-r from-indigo-500 to-purple-600">
      <div className="bg-white dark:bg-gray-900 p-8 rounded-lg shadow-lg w-full max-w-lg">
        <h2 className="text-2xl font-semibold text-center text-gray-800 dark:text-white mb-6">Create Your Account</h2>
        
        {/* Display error if any */}
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}

        {/* Display success message if registration is successful */}
        {successMessage && <p className="text-green-500 text-center mb-4">{successMessage}</p>}

        <form onSubmit={handleSubmit}>
          {/* Name Field */}
          <div className="mb-4">
            <label htmlFor="name" className="block text-gray-700 dark:text-gray-300 mb-2">Name</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-600"
              required
            />
          </div>

          {/* Email Field */}
          <div className="mb-4">
            <label htmlFor="email" className="block text-gray-700 dark:text-gray-300 mb-2">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-600"
              required
            />
          </div>

          {/* Password Field */}
          <div className="mb-4">
            <label htmlFor="password" className="block text-gray-700 dark:text-gray-300 mb-2">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-600"
              required
            />
          </div>

          {/* Confirm Password Field */}
          <div className="mb-6">
            <label htmlFor="confirmPassword" className="block text-gray-700 dark:text-gray-300 mb-2">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-600"
              required
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-3 px-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-600"
          >
            Register
          </button>
        </form>
      </div>
    </div>
  );
};

export default Register;
