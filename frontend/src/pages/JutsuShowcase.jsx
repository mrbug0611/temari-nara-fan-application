// src/pages/JutsuShowcase.jsx
import React, {useState, useEffect, useRef} from 'react';
import axios from 'axios';
import gsap from 'gsap';
import {Wind, Zap, Star, X} from 'lucide-react';

const JutsuShowcase = () => {
    const [jutsus, setJutsus] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedJutsu, setSelectedJutsu] = useState(null);
    const [filters, setFilters] = useState({
        type: '', 
        rank: '',
        isSignature: false 
    })

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchJutsus();
        }, 500);
        
        return () => clearTimeout(timer);
    }, [filters]);

    const fetchJutsus = async () => {
        try {
            const params = {};
            if (filters.type) params.type = filters.type;
            if (filters.rank) params.rank = filters.rank;
            if (filters.isSignature) params.isSignature = true;
            const response = await axios.get('/jutsu', { params });
            setJutsus(response.data.jutsus || response.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching jutsus:', error);
            setLoading(false);
        }
    };

    const getRankColor = (rank) => {
        const colors = {
            'S': 'from-red-500 to-orange-500',
            'A': 'from-purple-500 to-pink-500',
            'B': 'from-blue-500 to-cyan-500',
            'C': 'from-green-500 to-teal-500',
            'D': 'from-yellow-500 to-green-500',
            'E': 'from-gray-500 to-slate-500'
        }; 
        return colors[rank] || 'from-gray-500 to-slate-500';
    }; 

    const triggerWindEffect = (jutsu, cardElement) => {
        // create wind particles 
        const particles = [];
        const rect = cardElement.getBoundingClientRect();
        for (let i = 0; i < 30; i++) {
            const particle = document.createElement('div');
            particle.className = 'absolute w-2 h-2 bg-emerald-400 rounded-full pointer-events-none';
            particle.style.left = `${rect.left + rect.width / 2}px`;
            particle.style.top = `${rect.top + rect.height / 2}px`;
            document.body.appendChild(particle);
            particles.push(particle);

            gsap.to(particle, {
                x: (Math.random() - 0.5) * 300,
                y: (Math.random() - 0.5) * 300,
                opacity: 0,
                duration: 1.5,
                ease: 'power2.out',
                onComplete: () => particle.remove() 
            }); 
        }

        // pulse the card 
        gsap.to(cardElement, {
            scale: 1.05,
            duration: 0.2,
            yoyo: true,
            repeat: 1,
            ease: 'power2.inOut'
        });
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="text-center">
                <Wind className="w-16 h-16 text-emerald-400 animate-spin mx-auto mb-4" />
                <p className="text-emerald-300 text-xl">Loading Jutsus...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="py-12">
            {/* Header */}
            <div className="text-center mb-12">
                <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                    Jutsu Showcase
                </h1>
                <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                    Discover Temari's arsenal of devastating wind release techniques
                </p>
            </div>

            {/* Filters */}
            <div className="mb-8 flex flex-wrap gap-4 justify-center">
                <button
                    onClick={() => setFilters({ ...filters, isSignature: !filters.isSignature })}
                    className={`px-6 py-2 rounded-lg flex items-center space-x-2 transition-all ${
                        filters.isSignature
                            ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30'
                            : 'bg-slate-800/50 text-gray-300 hover:bg-slate-700/50'
                    }`}
                >
                    <Star className="w-4 h-4" />
                    <span>Signature Only</span>
                </button>

                <select
                    value={filters.rank}
                    onChange={(e) => setFilters({ ...filters, rank: e.target.value })}
                    className="px-6 py-2 rounded-lg bg-slate-800/50 text-gray-300 border border-emerald-500/30 focus:border-emerald-500 focus:outline-none"
                >
                    <option value="">All Ranks</option>
                    <option value="S">S Rank</option>
                    <option value="A">A Rank</option>
                    <option value="B">B Rank</option>
                    <option value="C">C Rank</option>
                    <option value="D">D Rank</option>
                    <option value="E">E Rank</option>
                </select>

                <select
                    value={filters.type}
                    onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                    className="px-6 py-2 rounded-lg bg-slate-800/50 text-gray-300 border border-emerald-500/30 focus:border-emerald-500 focus:outline-none"
                >
                    <option value="">All Types</option>
                    <option value="Ninjutsu">Ninjutsu</option>
                    <option value="Collaboration">Collaboration</option>
                </select>

                {(filters.rank || filters.type || filters.isSignature) && (
                    <button
                        onClick={() => setFilters({ type: '', rank: '', isSignature: false })}
                        className="px-6 py-2 rounded-lg bg-red-500/20 text-red-300 hover:bg-red-500/30 flex items-center space-x-2 transition-all"
                    >
                        <X className="w-4 h-4" />
                        <span>Clear Filters</span>
                    </button>
                )}
            </div>

            {/* Jutsus Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {jutsus.map((jutsu, index) => (
                    <div
                        key={jutsu._id}
                        style={{ '--animation-delay': `${index * 0.1}s` }}
                        className="jutsu-card group relative bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm rounded-2xl overflow-hidden border border-emerald-500/20 hover:border-emerald-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-emerald-500/20 cursor-pointer"
                        onClick={() => setSelectedJutsu(jutsu)}
                        onMouseEnter={(e) => triggerWindEffect(jutsu, e.currentTarget)}
                    >
                        {/* Rank Badge */}
                        <div className={`absolute top-4 right-4 px-3 py-1 rounded-full bg-gradient-to-r ${getRankColor(jutsu.rank)} text-white font-bold text-sm shadow-lg z-10`}>
                            {jutsu.rank} Rank
                        </div>

                        {/* Signature Badge */}
                        {jutsu.isSignature && (
                            <div className="absolute top-4 left-4 z-10">
                                <Star className="w-6 h-6 text-yellow-400 fill-yellow-400 animate-pulse" />
                            </div>
                        )}

                        {/* Content */}
                        <div className="p-6">
                            <h3 className="text-2xl font-bold text-emerald-300 mb-2 group-hover:text-emerald-200 transition-colors">
                                {jutsu.name}
                            </h3>
                            
                            {jutsu.japaneseName && (
                                <p className="text-gray-400 text-sm mb-4 italic">{jutsu.japaneseName}</p>
                            )}

                            <div className="flex flex-wrap gap-2 mb-4">
                                <span className="px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 text-xs font-semibold">
                                    {jutsu.type}
                                </span>
                                <span className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-semibold">
                                    {jutsu.classification}
                                </span>
                                {jutsu.nature?.map((nature) => (
                                    <span key={nature} className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold flex items-center space-x-1">
                                        <Wind className="w-3 h-3" />
                                        <span>{nature}</span>
                                    </span>
                                ))}
                            </div>

                            <p className="text-gray-400 line-clamp-3 mb-4">
                                {jutsu.description}
                            </p>

                            {/* Power Level */}
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                    <Zap className="w-5 h-5 text-yellow-400" />
                                    <span className="text-gray-400 text-sm">Power</span>
                                </div>
                                <div className="flex space-x-1">
                                    {[...Array(10)].map((_, i) => (
                                        <div
                                            key={i}
                                            className={`w-2 h-4 rounded ${
                                                i < jutsu.powerLevel ? 'bg-emerald-400' : 'bg-gray-700'
                                            }`}
                                        />
                                    ))}
                                </div>
                            </div>

                            {/* Chakra Cost */}
                            <div className="mt-3 pt-3 border-t border-emerald-500/20">
                                <span className="text-gray-400 text-sm">Chakra Cost: </span>
                                <span className="text-emerald-300 font-semibold">{jutsu.chakraCost}</span>
                            </div>
                        </div>

                        {/* Hover Effect */}
                        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/0 to-cyan-500/0 group-hover:from-emerald-500/10 group-hover:to-cyan-500/10 transition-all duration-300 pointer-events-none"></div>
                    </div>
                ))}
            </div>

            {/* Jutsu Detail Modal */}
            {selectedJutsu && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSelectedJutsu(null)}>
                    <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto border border-emerald-500/30 shadow-2xl" onClick={(e) => e.stopPropagation()}>
                        <div className="p-8">
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <h2 className="text-4xl font-bold text-emerald-300 mb-2">
                                        {selectedJutsu.name}
                                    </h2>
                                    {selectedJutsu.japaneseName && (
                                        <p className="text-gray-400 text-lg italic">{selectedJutsu.japaneseName}</p>
                                    )}
                                </div>
                                <button
                                    onClick={() => setSelectedJutsu(null)}
                                    className="p-2 rounded-lg hover:bg-red-500/20 text-red-300 transition-all"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-xl font-semibold text-emerald-400 mb-3">Description</h3>
                                    <p className="text-gray-300 leading-relaxed">{selectedJutsu.description}</p>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-4 bg-slate-900/50 rounded-lg">
                                        <p className="text-gray-400 text-sm mb-1">Type</p>
                                        <p className="text-emerald-300 font-semibold">{selectedJutsu.type}</p>
                                    </div>
                                    <div className="p-4 bg-slate-900/50 rounded-lg">
                                        <p className="text-gray-400 text-sm mb-1">Rank</p>
                                        <p className="text-emerald-300 font-semibold">{selectedJutsu.rank}</p>
                                    </div>
                                    <div className="p-4 bg-slate-900/50 rounded-lg">
                                        <p className="text-gray-400 text-sm mb-1">Classification</p>
                                        <p className="text-emerald-300 font-semibold">{selectedJutsu.classification}</p>
                                    </div>
                                    <div className="p-4 bg-slate-900/50 rounded-lg">
                                        <p className="text-gray-400 text-sm mb-1">Chakra Cost</p>
                                        <p className="text-emerald-300 font-semibold">{selectedJutsu.chakraCost}</p>
                                    </div>
                                </div>

                                {selectedJutsu.handSeals && selectedJutsu.handSeals.length > 0 && (
                                    <div>
                                        <h3 className="text-xl font-semibold text-emerald-400 mb-3">Hand Seals</h3>
                                        <div className="flex flex-wrap gap-2">
                                            {selectedJutsu.handSeals.map((seal, index) => (
                                                <span key={index} className="px-4 py-2 bg-emerald-500/20 rounded-lg text-emerald-300">
                                                    {seal}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {selectedJutsu.firstAppearance && (
                                    <div>
                                        <h3 className="text-xl font-semibold text-emerald-400 mb-3">First Appearance</h3>
                                        <div className="flex gap-4">
                                            {selectedJutsu.firstAppearance.manga && (
                                                <p className="text-gray-300">Manga: {selectedJutsu.firstAppearance.manga}</p>
                                            )}
                                            {selectedJutsu.firstAppearance.anime && (
                                                <p className="text-gray-300">Anime: {selectedJutsu.firstAppearance.anime}</p>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default JutsuShowcase;