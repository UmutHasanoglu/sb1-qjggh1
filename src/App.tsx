import React, { useEffect } from 'react';
import { FileType } from 'lucide-react';
import ConversionTool from './components/ConversionTool';
import { GoogleSignInButton } from './components/GoogleSignInButton';
import { useAuthStore } from './stores/authStore';

function App() {
  const { user, isLoading, checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, []);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center space-x-2">
              <FileType className="w-8 h-8 text-blue-500" />
              <span className="text-xl font-bold text-gray-900">FileForge</span>
            </div>
            <div className="flex items-center space-x-4">
              <button className="text-gray-600 hover:text-gray-900">Sign In</button>
              <button className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600">
                Get Started
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="py-12">
        {user ? (
          <ConversionTool />
        ) : (
          <GoogleSignInButton />
        )}
      </main>

      <footer className="bg-white mt-12">
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="text-center text-gray-500 text-sm">
            © 2024 FileForge. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
