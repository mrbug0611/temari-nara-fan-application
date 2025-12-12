import React, { useState } from 'react';
import Navigation from './components/layout/Navigation';
import { AuthProvider } from './contexts/AuthContext';
import { WeatherProvider } from './contexts/WeatherContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { BrowserRouter } from 'react-router-dom';

function TestNavigation() {
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  // Track window resize for mobile menu testing
  React.useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <WeatherProvider>
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-black">
              {/* Navigation Component */}
              <Navigation />
              
              {/* Test Content */}
              <div className="container mx-auto px-4 py-12">
                {/* Header */}
                <div className="text-center mb-12">
                  <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                    Navigation Component Test
                  </h1>
                  <p className="text-xl text-gray-400">
                    Testing the navigation bar functionality
                  </p>
                </div>

                {/* Test Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  {/* Responsive Test */}
                  <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-emerald-500/20">
                    <h2 className="text-2xl font-bold text-emerald-300 mb-4">
                      📱 Responsive Test
                    </h2>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Current Width:</span>
                        <span className="text-emerald-300 font-mono">{windowWidth}px</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Mode:</span>
                        <span className="text-emerald-300 font-semibold">
                          {windowWidth < 768 ? 'Mobile 📱' : 'Desktop 💻'}
                        </span>
                      </div>
                      <div className="mt-4 p-3 bg-blue-900/20 border border-blue-500 rounded">
                        <p className="text-blue-300 text-sm">
                          {windowWidth < 768 
                            ? '✅ Mobile menu (hamburger) should be visible'
                            : '✅ Desktop menu should be visible'
                          }
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Navigation Links Test */}
                  <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-emerald-500/20">
                    <h2 className="text-2xl font-bold text-emerald-300 mb-4">
                      🔗 Navigation Links
                    </h2>
                    <ul className="space-y-2 text-gray-300">
                      <li className="flex items-center space-x-2">
                        <span className="text-emerald-400">✓</span>
                        <span>Home</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <span className="text-emerald-400">✓</span>
                        <span>Jutsus</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <span className="text-emerald-400">✓</span>
                        <span>Timeline</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <span className="text-emerald-400">✓</span>
                        <span>Gallery</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <span className="text-emerald-400">✓</span>
                        <span>Strategist's Corner</span>
                      </li>
                    </ul>
                  </div>

                  {/* Authentication Status */}
                  <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-emerald-500/20">
                    <h2 className="text-2xl font-bold text-emerald-300 mb-4">
                      🔐 Authentication
                    </h2>
                    <p className="text-gray-400 mb-4">
                      Check if login/register buttons appear when not logged in,
                      or username/logout when logged in.
                    </p>
                    <div className="p-3 bg-yellow-900/20 border border-yellow-500 rounded">
                      <p className="text-yellow-300 text-sm">
                        💡 Try logging in to see user menu
                      </p>
                    </div>
                  </div>

                  {/* Features Test */}
                  <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-emerald-500/20">
                    <h2 className="text-2xl font-bold text-emerald-300 mb-4">
                      ✨ Features
                    </h2>
                    <ul className="space-y-2 text-sm text-gray-300">
                      <li>• Logo with wind icon animation</li>
                      <li>• Active link highlighting</li>
                      <li>• Smooth hover effects</li>
                      <li>• Sticky positioning</li>
                      <li>• Backdrop blur effect</li>
                      <li>• Mobile hamburger menu</li>
                    </ul>
                  </div>
                </div>

                {/* Test Instructions */}
                <div className="bg-gradient-to-r from-emerald-900/20 to-teal-900/20 backdrop-blur-sm rounded-2xl p-8 border border-emerald-500/30">
                  <h2 className="text-3xl font-bold text-emerald-300 mb-6">
                    🧪 Testing Checklist
                  </h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h3 className="font-bold text-emerald-400 mb-3">Desktop Tests:</h3>
                      <ul className="space-y-2 text-gray-300">
                        <li className="flex items-start space-x-2">
                          <span className="text-emerald-400 mt-1">☐</span>
                          <span>All nav links visible</span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <span className="text-emerald-400 mt-1">☐</span>
                          <span>Hover effects work</span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <span className="text-emerald-400 mt-1">☐</span>
                          <span>Active link highlighted</span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <span className="text-emerald-400 mt-1">☐</span>
                          <span>Logo animation on hover</span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <span className="text-emerald-400 mt-1">☐</span>
                          <span>Auth buttons visible</span>
                        </li>
                      </ul>
                    </div>

                    <div>
                      <h3 className="font-bold text-emerald-400 mb-3">Mobile Tests:</h3>
                      <ul className="space-y-2 text-gray-300">
                        <li className="flex items-start space-x-2">
                          <span className="text-emerald-400 mt-1">☐</span>
                          <span>Hamburger menu appears</span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <span className="text-emerald-400 mt-1">☐</span>
                          <span>Menu opens/closes smoothly</span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <span className="text-emerald-400 mt-1">☐</span>
                          <span>Links work in mobile menu</span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <span className="text-emerald-400 mt-1">☐</span>
                          <span>Menu closes after link click</span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <span className="text-emerald-400 mt-1">☐</span>
                          <span>Responsive at all sizes</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Resize Instructions */}
                <div className="mt-8 p-6 bg-purple-900/20 border border-purple-500 rounded-2xl">
                  <h3 className="text-xl font-bold text-purple-300 mb-3">
                    📐 Resize Window to Test Responsiveness
                  </h3>
                  <p className="text-purple-200">
                    Drag your browser window smaller to see mobile menu (hamburger icon) appear.
                    Test at these breakpoints:
                  </p>
                  <ul className="mt-3 space-y-1 text-purple-200 text-sm">
                    <li>• Mobile: &lt; 768px</li>
                    <li>• Tablet: 768px - 1024px</li>
                    <li>• Desktop: &gt; 1024px</li>
                  </ul>
                </div>
              </div>
            </div>
          </WeatherProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default TestNavigation;