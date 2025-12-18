import React, { useEffect, useLayoutEffect, useState, useRef } from 'react';
import axios from 'axios';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Calendar, MapPin, Users, Quote, ChevronDown } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const Timeline = () => {
  const [events, setEvents] = useState([]);
  const [selectedEra, setSelectedEra] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState(null);

  const timelineRef = useRef(null);
  const animationsRef = useRef([]);

  const eras = [
    'All eras',
    'Pre-Academy',
    'Chunin Exams',
    'Sasuke Retrieval',
    'Shippuden',
    'War Arc',
    'Post-War',
    'Boruto'
  ];

  useEffect(() => {
    fetchEvents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedEra]);

  // useLayoutEffect so we set initial styles before paint (avoids flicker)
  useLayoutEffect(() => {
    if (!timelineRef.current) return;

    // cleanup previous
    animationsRef.current.forEach((a) => a.kill());
    animationsRef.current = [];
    ScrollTrigger.getAll().forEach((t) => t.kill());

    const nodes = Array.from(timelineRef.current.querySelectorAll('.timeline-event'));

    // Set initial hidden state synchronously before paint
    nodes.forEach((el, index) => {
      const initialX = index % 2 === 0 ? -50 : 50;
      gsap.set(el, { opacity: 0, x: initialX });
    });

    // Create ScrollTrigger animations that reveal elements
    nodes.forEach((el, index) => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: el, // html element to trigger animation
          start: 'top 85%',
          end: 'top 40%',
          toggleActions: 'play none none reverse', // prevents re-triggering on every scroll
                        // play when entering viewport, reverse when scrolling back up
                        // do nothing while scrolling through it and while leaving viewport
          markers: false // no debug markers
        }
      });

      tl.to(el, {
        opacity: 1,
        x: 0,
        duration: 0.6,
        ease: 'power2.out'
      }, 0);

      animationsRef.current.push(tl);
    });

    ScrollTrigger.refresh();

    return () => {
      // cleanup on next run / unmount
      animationsRef.current.forEach((a) => a.kill());
      animationsRef.current = [];
      ScrollTrigger.getAll().forEach((t) => t.kill());
      gsap.killTweensOf('*');

      // Ensure elements are visible and clear inline styles (defensive)
      const cleanupNodes = timelineRef.current?.querySelectorAll('.timeline-event') ?? [];
      cleanupNodes.forEach((n) => gsap.set(n, { opacity: 1, x: 0, clearProps: 'all'  })); // clearprops to remove inline styles to return to natural state 
    };
  }, [events]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const params = {};
      if (selectedEra && selectedEra !== 'All eras') {
        params.era = selectedEra;
      }

      const response = await axios.get('/timeline', { params });

      // Sort by order for deterministic layout
      const sorted = Array.isArray(response.data)
        ? response.data.slice().sort((a, b) => (a.order || 0) - (b.order || 0))
        : response.data;

      setEvents(sorted);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching timeline events:', error);
      setLoading(false);
    }
  };

  const getEraColor = (era) => {
    const colors = {
      'Pre-Academy': 'from-gray-500 to-slate-500',
      'Chunin Exams': 'from-orange-500 to-red-500',
      'Sasuke Retrieval': 'from-blue-500 to-cyan-500',
      'Shippuden': 'from-purple-500 to-pink-500',
      'War Arc': 'from-red-500 to-orange-500',
      'Post-War': 'from-green-500 to-teal-500',
      Boruto: 'from-cyan-500 to-blue-500'
    };
    return colors[era] || 'from-emerald-500 to-teal-500';
  };

  const getSignificanceColor = (significance) => {
    const colors = {
      Critical: 'text-red-400',
      Major: 'text-orange-400',
      Moderate: 'text-yellow-400',
      Minor: 'text-gray-400'
    };
    return colors[significance] || 'text-gray-400';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <Calendar className="w-16 h-16 text-emerald-400 animate-pulse mx-auto mb-4" />
          <p className="text-emerald-300 text-xl">Loading Timeline...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="py-12">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
          Character Timeline
        </h1>
        <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-8">
          Journey through Temari's growth from the Chunin Exams to the Boruto era
        </p>

        {/* Era Filter */}
        <div className="flex flex-wrap justify-center gap-3">
          {eras.map((era) => (
            <button
              key={era}
              onClick={() => setSelectedEra(era === 'All eras' ? '' : era)}
              className={`px-6 py-2 rounded-lg transition-all ${
                (era === 'All eras' && !selectedEra) || era === selectedEra
                  ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30'
                  : 'bg-slate-800/50 text-gray-300 hover:bg-slate-700/50'
              }`}
            >
              {era}
            </button>
          ))}
        </div>
      </div>

      {/* Timeline */}
      <div ref={timelineRef} className="relative max-w-5xl mx-auto px-4">
        {/* Center Line */}
        <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-gradient-to-b from-emerald-500 via-teal-500 to-cyan-500 hidden md:block" />

        {/* Events */}
        <div className="space-y-12">
          {events.map((event, index) => (
            <div
              key={event._id || index}
              data-index={index}
              className={`timeline-event timeline-event-${index} relative flex items-center min-h-[120px] ${
                index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
              }`}
            >
              {/* Timeline Dot */}
              <div className="absolute left-1/2 transform -translate-x-1/2 w-6 h-6 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-400 border-4 border-slate-900 z-10 hidden md:block shadow-lg shadow-emerald-500/50" />

              {/* Content */}
              <div className={`w-full md:w-[calc(50%-2rem)] ${index % 2 === 0 ? 'md:pr-8' : 'md:pl-8'}`}>
                <div
                  className="relative z-20 bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm rounded-2xl p-6 border border-emerald-500/20 hover:border-emerald-500/50 transition-all cursor-pointer group hover:shadow-2xl hover:shadow-emerald-500/20"
                  onClick={() => setSelectedEvent(event)}
                >
                  {/* Era Badge */}
                  <div className={`inline-block px-4 py-1 rounded-full bg-gradient-to-r ${getEraColor(event.era)} text-white text-sm font-semibold mb-3 shadow-lg`}>
                    {event.era}
                  </div>

                  {/* Age */}
                  {event.age != null && <div className="text-emerald-300 text-sm mb-2">Age: {event.age}</div>}
                  {/* Title */}
                  <h3 className="text-2xl font-bold text-emerald-300 mb-3 group-hover:text-emerald-200 transition-colors">
                    {event.title}
                  </h3>

                  {/* Description */}
                  <p className="text-gray-400 mb-4 leading-relaxed">{event.description}</p>

                  {/* Meta Information */}
                  <div className="space-y-2">
                    {event.location && (
                      <div className="flex items-center space-x-2 text-gray-500 text-sm">
                        <MapPin className="w-4 h-4" />
                        <span>{event.location}</span>
                      </div>
                    )}

                    {event.relatedCharacters && event.relatedCharacters.length > 0 && (
                      <div className="flex items-center space-x-2 text-gray-500 text-sm">
                        <Users className="w-4 h-4" />
                        <span>{event.relatedCharacters.join(', ')}</span>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-2">
                      <span className={`text-sm font-semibold ${getSignificanceColor(event.significance)}`}>{event.significance}</span>
                      <span className="text-emerald-300 text-sm">{event.category}</span>
                    </div>
                  </div>

                  {/* Quote Preview */}
                  {event.quotes && event.quotes.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-emerald-500/20">
                      <div className="flex items-start space-x-2">
                        <Quote className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-1" />
                        <p className="text-gray-400 italic text-sm line-clamp-2">"{event.quotes[0].text}"</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Event Detail Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSelectedEvent(null)}>
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-emerald-500/30 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="p-8">
              {/* Header */}
              <div className="mb-6">
                <div className={`inline-block px-4 py-1 rounded-full bg-gradient-to-r ${getEraColor(selectedEvent.era)} text-white text-sm font-semibold mb-4 shadow-lg`}>
                  {selectedEvent.era}
                </div>
                <h2 className="text-4xl font-bold text-emerald-300 mb-2">{selectedEvent.title}</h2>
                {selectedEvent.age != null && <p className="text-emerald-400 text-lg">Age: {selectedEvent.age}</p>}              </div>

              {/* Description */}
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-emerald-400 mb-3">What Happened</h3>
                <p className="text-gray-300 leading-relaxed text-lg">{selectedEvent.description}</p>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="p-4 bg-slate-900/50 rounded-lg">
                  <p className="text-gray-400 text-sm mb-1">Category</p>
                  <p className="text-emerald-300 font-semibold">{selectedEvent.category}</p>
                </div>
                <div className="p-4 bg-slate-900/50 rounded-lg">
                  <p className="text-gray-400 text-sm mb-1">Significance</p>
                  <p className={`font-semibold ${getSignificanceColor(selectedEvent.significance)}`}>{selectedEvent.significance}</p>
                </div>
                {selectedEvent.location && (
                  <div className="p-4 bg-slate-900/50 rounded-lg">
                    <p className="text-gray-400 text-sm mb-1">Location</p>
                    <p className="text-emerald-300 font-semibold">{selectedEvent.location}</p>
                  </div>
                )}
                {selectedEvent.date && (
                  <div className="p-4 bg-slate-900/50 rounded-lg">
                    <p className="text-gray-400 text-sm mb-1">Arc</p>
                    <p className="text-emerald-300 font-semibold">{selectedEvent.date.arc}</p>
                  </div>
                )}
              </div>

              {/* Related Characters */}
              {selectedEvent.relatedCharacters && selectedEvent.relatedCharacters.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-xl font-semibold text-emerald-400 mb-3">Related Characters</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedEvent.relatedCharacters.map((character, i) => (
                      <span key={i} className="px-4 py-2 bg-emerald-500/20 rounded-lg text-emerald-300">{character}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Quotes */}
              {selectedEvent.quotes && selectedEvent.quotes.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-xl font-semibold text-emerald-400 mb-3">Quotes</h3>
                  {selectedEvent.quotes.map((quote, idx) => (
                    <div key={idx} className="p-4 bg-slate-900/50 rounded-lg mb-2">
                      <p className="text-gray-300 italic mb-2">"{quote.text}"</p>
                      <p className="text-emerald-400 text-sm">— {quote.speaker}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Stats */}
              {selectedEvent.stats && (
                <div>
                  <h3 className="text-xl font-semibold text-emerald-400 mb-3">Stats at This Point</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {Object.entries(selectedEvent.stats).map(([stat, value]) => (
                      <div key={stat} className="p-4 bg-slate-900/50 rounded-lg">
                        <p className="text-gray-400 text-sm mb-2 capitalize">{stat}</p>
                        <div className="flex items-center space-x-2">
                          <div className="flex-1 bg-gray-700 rounded-full h-2 overflow-hidden">
                            <div className="bg-gradient-to-r from-emerald-400 to-cyan-400 h-full transition-all duration-500" style={{ width: `${value * 10}%` }} />
                          </div>
                          <span className="text-emerald-300 font-semibold">{value}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Timeline;
