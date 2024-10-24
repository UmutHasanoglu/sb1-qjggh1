import React from 'react';

export const GoogleSignInButton: React.FC = () => {
  const handleSignIn = () => {
    window.location.href = 'http://localhost:3001/api/auth/google';
  };

  return (
    <button
      onClick={handleSignIn}
      className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
    >
      <img
        src="https://www.google.com/favicon.ico"
        alt="Google logo"
        className="w-4 h-4"
      />
      Sign in with Google
    </button>
  );
};
