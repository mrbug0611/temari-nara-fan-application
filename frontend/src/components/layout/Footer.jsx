// src/components/layout/Footer.jsx

import React from 'react';
import { Link } from 'react-router-dom';
import { Wind, Heart, Github } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="relative -mt-24 bg-gradient-to-r from-slate-900 via-gray-900 to-black backdrop-blur-md z-50">


      {/* Seamless wind fade */}
    <div className="absolute top-0 left-0 w-full h-32 pointer-events-none z-10">
    <   div className="w-full h-full bg-gradient-to-b from-emerald-500/30 via-emerald-500/15 to-transparent" />
    </div>


      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">

          {/* Brand */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <Wind className="w-8 h-8 text-emerald-400" />
              <span className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">
                Temari
              </span>
            </div>
            <p className="text-emerald-400 text-sm">
              Celebrating the Wind Master of the Sand Village.
            </p>
          </div>

          {/* Explore */}
          <div>
            <h3 className="text-emerald-300 font-semibold mb-4">Explore</h3>
            <ul className="space-y-2">
              {[
                ['Jutsu Showcase', '/jutsus'],
                ['Timeline', '/timeline'],
                ['Gallery', '/gallery'],
                ["Strategist's Corner", '/strategist'],
              ].map(([label, path]) => (
                <li key={label}>
                  <Link
                    to={path}
                    className="text-emerald-400 hover:text-emerald-300 transition-colors text-sm"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Community */}
          <div>
            <h3 className="text-emerald-300 font-semibold mb-4">Community</h3>
            <ul className="space-y-2">
              {['Guidelines', 'Submit Fan Art', 'Report Issue', 'Contact Us'].map(item => (
                <li key={item}>
                  <a
                    href="#"
                    className="text-emerald-400 hover:text-emerald-300 transition-colors text-sm"
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Connect */}
          <div>
            <h3 className="text-emerald-300 font-semibold mb-4">Connect</h3>
            <div className="flex space-x-4">
              <a
                href="https://github.com/mrbug0611"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 transition-all"
              >
                <Github className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom — softened divider */}
        <div className="pt-8 border-t border-emerald-500/30 flex flex-col md:flex-row justify-between items-center">
          <p className="text-emerald-400 text-sm mb-4 md:mb-0 flex items-center">
            Made with <Heart className="w-4 h-4 mx-1 text-red-400 fill-red-400" /> by Naruto fans
          </p>
          <p className="text-emerald-400 text-sm">
            © 2025 Temari Fan App. Not affiliated with Masashi Kishimoto or Shueisha.          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
