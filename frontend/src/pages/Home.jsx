// src/pages/Home.jsx

import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { gsap } from 'gsap';
import {
  Wind,
  Sword,
  BookOpen,
  Image,
  MessageSquare,
  ArrowRight,
} from 'lucide-react';
import { useWeather } from '../contexts/WeatherContext';

const Home = () => {
  const pageRef = useRef(null);
  const { weather } = useWeather();

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.hero-title', {
        y: -40,
        opacity: 0,
        duration: 1,
        ease: 'power3.out',
      });

      gsap.from('.hero-subtitle', {
        y: 30,
        opacity: 0,
        duration: 1,
        delay: 0.2,
        ease: 'power3.out',
      });

      gsap.from('.hero-buttons', {
        y: 30,
        opacity: 0,
        duration: 1,
        delay: 0.4,
        ease: 'power3.out',
      });

      gsap.from('.section-buttons', {
        y: 40,
        opacity: 0,
        duration: 0.8,
        delay: 0.6,
        stagger: 0.15,
        ease: 'power3.out',
      });
    }, pageRef);

    return () => ctx.revert();
  }, []);

  return (
    // keep background empty so your wind effects (global canvas) remain visible
    <div ref={pageRef} className="min-h-screen">
      {/* ================= HERO ================= */}
      <section className="pt-24 pb-28 px-4 text-center">
        <div className="max-w-5xl mx-auto">
          <div className="hero-title mb-6">
            <h1 className="text-6xl md:text-8xl font-bold mb-4 bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
              Temari
            </h1>
            <div className="flex items-center justify-center gap-3 text-emerald-300">
              <Wind className="w-7 h-7 animate-pulse" />
              <span className="text-2xl md:text-3xl font-semibold">
                Wind Release Master
              </span>
              <Wind className="w-7 h-7 animate-pulse" />
            </div>
          </div>

          <p className="hero-subtitle text-xl md:text-2xl text-gray-300 mb-10 max-w-3xl mx-auto leading-relaxed">
            Explore the legacy of Sunagakure's finest strategist. From battlefield
            dominance to diplomatic mastery, discover what makes Temari legendary.
          </p>

          {weather && (
            <div className="hero-subtitle mb-10 inline-flex items-center gap-2 px-6 py-3 bg-emerald-500/10 border border-emerald-500/30 rounded-full backdrop-blur-sm">
              <Wind className="w-5 h-5 text-emerald-400" />
              <span className="text-emerald-300">
                Wind: {weather.windSpeed.toFixed(1)} m/s • {weather.description}
              </span>
            </div>
          )}

        </div>
      </section>

      {/* ================= DISCOVER MORE ================= */}
      <section className="pt-24 pb-16 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-14 text-emerald-300">
            Discover More
          </h2>

          <div className="space-y-8">
            {/* Jutsu Showcase */}
            <div className="section-buttons text-center">
              <Link
                to="/jutsus"
                className="group inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg font-semibold text-white shadow-xl shadow-cyan-500/30 hover:shadow-cyan-500/50 transition-all hover:scale-105"
              >
                <Sword className="w-5 h-5" />
                <span>Explore Jutsus</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <p className="mt-3 text-gray-300 max-w-2xl mx-auto">
                Explore Temari's powerful Wind Release techniques with detailed breakdowns and animations.
              </p>
            </div>

            {/* Timeline */}
            <div className="section-buttons text-center">
              <Link
                to="/timeline"
                className="group inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg font-semibold text-white shadow-xl shadow-emerald-500/30 hover:shadow-emerald-500/50 transition-all hover:scale-105"
              >
                <BookOpen className="w-5 h-5" />
                <span>View Timeline</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <p className="mt-3 text-gray-300 max-w-2xl mx-auto">
                Follow Temari's journey from the Chunin Exams to her role as Sunagakure's strategist.
              </p>
            </div>

            {/* Gallery */}
            <div className="section-buttons text-center">
              <Link
                to="/gallery"
                className="group inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg font-semibold text-white shadow-xl shadow-purple-500/30 hover:shadow-purple-500/50 transition-all hover:scale-105"
              >
                <Image className="w-5 h-5" />
                <span>Fan Art Gallery</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <p className="mt-3 text-gray-300 max-w-2xl mx-auto">
                Discover and share fan art, illustrations, and cosplays celebrating Temari.
              </p>
            </div>

            {/* Strategist's Corner */}
            <div className="section-buttons text-center">
              <Link
                to="/strategist"
                className="group inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg font-semibold text-white shadow-xl shadow-orange-500/30 hover:shadow-orange-500/50 transition-all hover:scale-105"
              >
                <MessageSquare className="w-5 h-5" />
                <span>Strategist's Corner</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <p className="mt-3 text-gray-300 max-w-2xl mx-auto">
                Discuss tactics, team compositions, and battle analysis with fellow fans.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ================= STATS ================= */}
      <section className="pt-12 pb-24 px-4 bg-gradient-to-r from-emerald-900/20 to-teal-900/20 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            ['10', 'Intelligence'],
            ['9', 'Ninjutsu'],
            ['8', 'Chakra'],
            ['7', 'Speed'],
          ].map(([value, label]) => (
            <div key={label}>
              <div className="text-5xl font-bold text-emerald-400 mb-2">
                {value}
              </div>
              <div className="text-gray-400">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ================= QUOTE ================= */}
      <section className="pt-24 pb-32 px-4 text-center">
        <div className="max-w-4xl mx-auto">
          <blockquote className="text-2xl md:text-3xl text-emerald-300 font-medium italic mb-4">
            "I'll show you the difference between our levels."
          </blockquote>
          <p className="text-gray-400">— Temari, Chunin Exams</p>
        </div>
      </section>
    </div>
  );
};

export default Home;