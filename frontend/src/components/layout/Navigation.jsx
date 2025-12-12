// src/components/layout/Navigation.jsx

import React, {useState} from "react";
import {Link, useLocation} from "react-router-dom"
import { useAuth } from '../../contexts/AuthContext';
import {Wind, Menu, X, User, LogOut, Image, BookOpen, Sword, MessageSquare} from "lucide-react"

const Navigation = () => {
    const [isOpen, setIsOpen] = useState(false);
    const { user, logout, isAuthenticated } = useAuth();
    const location = useLocation(); 

    const navLinks = [
        {path: '/', label: 'Home', icon: Wind}, 
        { path: '/jutsus', label: 'Jutsus', icon: Sword },
        { path: '/timeline', label: 'Timeline', icon: BookOpen },
        { path: '/gallery', label: 'Gallery', icon: Image },
        { path: '/strategist', label: "Strategist's Corner", icon: MessageSquare },
    ]; 

    const isActive = (path) => location.pathname === path;

     return (
    <nav className="bg-gradient-to-r from-emerald-900/90 via-slate-900/90 to-black/90 backdrop-blur-md border-b border-emerald-700/50 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group">
            <Wind className="w-8 h-8 text-emerald-400 group-hover:animate-spin transition-all" />
            <span className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">
              Temari
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                    isActive(link.path)
                      ? 'bg-emerald-500/20 text-emerald-300 shadow-lg shadow-emerald-500/20'
                      : 'text-gray-300 hover:bg-emerald-500/10 hover:text-emerald-400'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="font-medium">{link.label}</span>
                </Link>
              );
            })}
          </div>

          {/* User Menu */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <Link
                  to="/profile"
                  className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 transition-all"
                >
                  <User className="w-4 h-4" />
                  <span>{user?.username}</span>
                </Link>
                <button
                  onClick={logout}
                  className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-300 transition-all"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-lg text-emerald-300 hover:bg-emerald-500/10 transition-all"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-semibold transition-all shadow-lg shadow-emerald-500/30"
                >
                  Register
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-emerald-500/10 transition-all"
          >
            {isOpen ? (
              <X className="w-6 h-6 text-emerald-400" />
            ) : (
              <Menu className="w-6 h-6 text-emerald-400" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden py-4 border-t border-emerald-700/50">
            <div className="flex flex-col space-y-2">
              {navLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center space-x-2 px-4 py-3 rounded-lg transition-all ${
                      isActive(link.path)
                        ? 'bg-emerald-500/20 text-emerald-300'
                        : 'text-gray-300 hover:bg-emerald-500/10'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{link.label}</span>
                  </Link>
                );
              })}
              
              <div className="pt-4 border-t border-emerald-700/50 space-y-2">
                {isAuthenticated ? (
                  <>
                    <Link
                      to="/profile"
                      onClick={() => setIsOpen(false)}
                      className="flex items-center space-x-2 px-4 py-3 rounded-lg bg-emerald-500/10 text-emerald-300"
                    >
                      <User className="w-5 h-5" />
                      <span>{user?.username}</span>
                    </Link>
                    <button
                      onClick={() => {
                        logout();
                        setIsOpen(false);
                      }}
                      className="w-full flex items-center space-x-2 px-4 py-3 rounded-lg bg-red-500/10 text-red-300"
                    >
                      <LogOut className="w-5 h-5" />
                      <span>Logout</span>
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      to="/login"
                      onClick={() => setIsOpen(false)}
                      className="block px-4 py-3 rounded-lg text-emerald-300 hover:bg-emerald-500/10"
                    >
                      Login
                    </Link>
                    <Link
                      to="/register"
                      onClick={() => setIsOpen(false)}
                      className="block px-4 py-3 rounded-lg bg-emerald-500 text-white text-center font-semibold"
                    >
                      Register
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};


export default Navigation; 