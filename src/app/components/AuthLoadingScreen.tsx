'use client';

import { useEffect , useState} from 'react';
import { motion } from 'framer-motion';

const AuthLoadingScreen = () => {
  // Optional: Add a small delay to prevent flash of loading screen
  const [showLoader, setShowLoader] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => setShowLoader(true), 300);
    return () => clearTimeout(timer);
  }, []);

  if (!showLoader) return null;

  return (
    <div className="fixed inset-0 bg-white dark:bg-gray-900 z-50 flex flex-col items-center justify-center">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col items-center justify-center space-y-4"
      >
        {/* Animated logo or icon */}
        <motion.div
          animate={{
            rotate: 360,
            transition: {
              duration: 1.5,
              repeat: Infinity,
              ease: "linear"
            }
          }}
          className="w-16 h-16 rounded-full border-4 border-indigo-500 border-t-transparent"
        />
        
        {/* Loading text with animation */}
        <motion.div
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-center space-y-2"
        >
          <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
            Securing your dashboard
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            Just a moment while we verify your session...
          </p>
        </motion.div>

        {/* Progress bar */}
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: "80%" }}
          transition={{ duration: 2, repeat: Infinity }}
          className="h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden max-w-xs"
        >
          <div className="h-full bg-indigo-600 w-full origin-left" />
        </motion.div>
      </motion.div>
    </div>
  );
};

export default AuthLoadingScreen;