import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { WeatherProvider } from './contexts/WeatherContext';
import { ThemeProvider } from './contexts/ThemeContext';

// Layout Components
import Navigation from './components/layout/Navigation';
import WindBackground from './components/effects/WindBackground';
import Footer from './components/layout/Footer';

// Pages
import Home from './pages/Home';
import JutsuShowcase from './pages/JutsuShowcase';

// Placeholder pages (create these later)
const Timeline = () => <div className="min-h-screen flex items-center justify-center text-white text-4xl">Timeline - Coming Soon</div>;
const FanArtGallery = () => <div className="min-h-screen flex items-center justify-center text-white text-4xl">Gallery - Coming Soon</div>;
const StrategistCorner = () => <div className="min-h-screen flex items-center justify-center text-white text-4xl">Strategist's Corner - Coming Soon</div>;
const Profile = () => <div className="min-h-screen flex items-center justify-center text-white text-4xl">Profile - Coming Soon</div>;
const Login = () => <div className="min-h-screen flex items-center justify-center text-white text-4xl">Login - Coming Soon</div>;
const Register = () => <div className="min-h-screen flex items-center justify-center text-white text-4xl">Register - Coming Soon</div>;

function App() {
  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <WeatherProvider>
            <div className="min-h-screen bg-gradient-to-br from-emerald-950 via-slate-900 to-black text-white relative overflow-hidden">
              {/* Animated Wind Background */}
              <WindBackground />
              
              {/* Main Content */}
              <div className="relative z-10">
                <Navigation />
                
                <main>
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/jutsus" element={<JutsuShowcase />} />
                    <Route path="/timeline" element={<Timeline />} />
                    <Route path="/gallery" element={<FanArtGallery />} />
                    <Route path="/strategist" element={<StrategistCorner />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                  </Routes>
                </main>
                
                <Footer />
              </div>
            </div>
          </WeatherProvider>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;