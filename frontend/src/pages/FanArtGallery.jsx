// src/pages/FanArtGallery.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Image, Heart, Eye, Upload, X, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const LOCAL_LIKED_KEY = 'fanart_liked_by_user_v1';

const isValidHttpUrl = (string) => {
  try {
    const url = new URL(string);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch (_) {
    return false;
  }
};

const FanArtGallery = () => {
  const [fanArt, setFanArt] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ style: '', era: '' });
  const [selectedArt, setSelectedArt] = useState(null);

  // Independent image error states for gallery grid vs modal window
  const [imageErrors, setImageErrors] = useState({});
  const [modalImageError, setModalImageError] = useState(false);

  // Form Upload Submission States
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [uploadForm, setUploadForm] = useState({
    title: '',
    artistName: '',
    imageUrl: '',
    description: '',
    style: 'Digital',
    era: 'Part 1',
    tags: '',
    twitter: '',
    instagram: ''
  });

  // Track which posts the current user has liked (client-side map). Value true = liked.
  const [likedByUser, setLikedByUser] = useState({});

  // Prevent double requests per-art
  const [inFlightLikes, setInFlightLikes] = useState({});
  const [inFlightViews, setInFlightViews] = useState({}); // guard for view increments

  const { isAuthenticated } = useAuth();

  // FIXED: Handle all image types correctly
  const getCachedImageUrl = (art) => {
    if (!art) return '';
    const imageUrl = art.thumbnailUrl || art.imageUrl;
    if (!imageUrl) return '';

    let finalUrl = imageUrl;
    
    // Local uploaded images
    if (imageUrl.startsWith('/')) {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
      finalUrl = `${backendUrl}${imageUrl}`;
    } 
    // External URLs (Instagram, Twitter, etc.) - use CORS proxy
    else if (imageUrl.startsWith('http')) {
      // Check if it's Instagram/Meta CDN
      if (imageUrl.includes('instagram') || 
          imageUrl.includes('cdninstagram') || 
          imageUrl.includes('scontent') ||
          imageUrl.includes('fbcdn')) {
        // Use allorigins.win proxy for Instagram/Meta
        finalUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(imageUrl)}`;
      } else {
        // Use weserv.nl for other external URLs (Twitter, etc.)
        finalUrl = `https://images.weserv.nl/?url=${encodeURIComponent(imageUrl)}&w=1200&h=900&fit=cover`;
      }
    }
    return finalUrl;
  };

  useEffect(() => {
    fetchFanArt();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  // LocalStorage helpers for fallback persistence
  const loadLikedFromLocal = () => {
    try {
      const raw = localStorage.getItem(LOCAL_LIKED_KEY);
      if (!raw) return {};
      const parsed = JSON.parse(raw);
      return parsed && typeof parsed === 'object' ? parsed : {};
    } catch (e) {
      return {};
    }
  };

  const saveLikedToLocal = (map) => {
    try {
      localStorage.setItem(LOCAL_LIKED_KEY, JSON.stringify(map));
    } catch (e) {
      // ignore
    }
  };

  const fetchFanArt = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/fanart', { params: filter });
      const artData = response.data.fanArt || response.data;

      // Build initial likedByUser map:
      const serverMap = {};
      artData.forEach((a) => {
        serverMap[a._id] = !!(a.liked || a.likedByUser || a.userLiked || a.likedByCurrentUser || a.hasLiked);
      });

      const localMap = loadLikedFromLocal();

      const merged = {};
      artData.forEach((a) => {
        if (serverMap[a._id]) merged[a._id] = true;
        else if (localMap[a._id]) merged[a._id] = true;
      });

      setFanArt(artData);
      setLikedByUser(merged);
      setImageErrors({});
      setLoading(false);
      saveLikedToLocal(merged);
    } catch (error) {
      console.error('Error fetching fan art:', error);
      setLoading(false);
    }
  };

  const handleImageError = (artId) => {
    setImageErrors((prev) => ({
      ...prev,
      [artId]: true
    }));
  };

  // Toggle like using your POST /fanart/:id/like endpoint which returns { likes, hasLiked }
  const handleLike = async (artId, e) => {
    if (e && e.stopPropagation) e.stopPropagation();
    if (inFlightLikes[artId]) return;

    const currentlyLiked = !!likedByUser[artId];

    setInFlightLikes((prev) => ({ ...prev, [artId]: true }));
    setLikedByUser((prev) => {
      const copy = { ...prev };
      if (currentlyLiked) delete copy[artId];
      else copy[artId] = true;
      return copy;
    });

    setFanArt((prev) =>
      prev.map((art) =>
        art._id === artId
          ? { ...art, likes: currentlyLiked ? Math.max((art.likes || 1) - 1, 0) : (art.likes || 0) + 1 }
          : art
      )
    );

    try {
      const res = await axios.post(`/fanart/${artId}/like`);

      if (res && res.data) {
        if (typeof res.data.likes === 'number') {
          setFanArt((prev) => prev.map((art) => (art._id === artId ? { ...art, likes: res.data.likes } : art)));
        }
        if (typeof res.data.hasLiked === 'boolean') {
          setLikedByUser((prev) => {
            const copy = { ...prev };
            if (res.data.hasLiked) copy[artId] = true;
            else delete copy[artId];
            saveLikedToLocal(copy);
            return copy;
          });
        } else {
          const persisted = { ...likedByUser };
          if (currentlyLiked) delete persisted[artId];
          else persisted[artId] = true;
          saveLikedToLocal(persisted);
        }
      } else {
        const persisted = { ...likedByUser };
        if (currentlyLiked) delete persisted[artId];
        else persisted[artId] = true;
        saveLikedToLocal(persisted);
      }
    } catch (err) {
      console.error('Like toggle failed:', err);
      setLikedByUser((prev) => {
        const copy = { ...prev };
        if (currentlyLiked) copy[artId] = true;
        else delete copy[artId];
        saveLikedToLocal(copy);
        return copy;
      });

      setFanArt((prev) =>
        prev.map((art) =>
          art._id === artId
            ? { ...art, likes: currentlyLiked ? (art.likes || 0) + 1 : Math.max((art.likes || 1) - 1, 0) }
            : art
        )
      );
    } finally {
      setInFlightLikes((prev) => {
        const copy = { ...prev };
        delete copy[artId];
        return copy;
      });
    }
  };

  const isLiked = (id) => !!likedByUser[id];

  // OPEN ART: open modal and increment views by calling GET /fanart/:id (server increments)
  const openArt = async (art) => {
    if (!art) return;
    const artId = art._id;

    // Reset layout configuration state maps for separate container views
    setModalImageError(false);
    setSelectedArt(art);

    if (inFlightViews[artId]) return;

    setFanArt((prev) => prev.map((a) => (a._id === artId ? { ...a, views: (a.views || 0) + 1 } : a)));
    setInFlightViews((prev) => ({ ...prev, [artId]: true }));
    
    try {
      const res = await axios.get(`/fanart/${artId}`);
      if (res && res.data) {
        const updated = res.data;
        setFanArt((prev) => prev.map((a) => (a._id === artId ? updated : a)));
        setSelectedArt(updated);

        if (typeof updated.hasLiked === 'boolean') {
          setLikedByUser((prev) => {
            const copy = { ...prev };
            if (updated.hasLiked) copy[artId] = true;
            else delete copy[artId];
            saveLikedToLocal(copy);
            return copy;
          });
        }
      }
    } catch (err) {
      console.error('Fetching art failed:', err);
      setFanArt((prev) =>
        prev.map((a) => (a._id === artId ? { ...a, views: Math.max((a.views || 1) - 1, 0) } : a))
      );
    } finally {
      setInFlightViews((prev) => {
        const copy = { ...prev };
        delete copy[artId];
        return copy;
      });
    }
  };

  // ✅ FIXED: Submit Handler for sending new entries to backend endpoint (POST /fanart)
  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    setUploadError('');

    // Validation
    if (!uploadForm.title.trim()) {
      setUploadError('Title is required.');
      return;
    }
    if (!uploadForm.artistName.trim()) {
      setUploadError('Artist Name is required.');
      return;
    }
    if (!uploadForm.imageUrl.trim() || !isValidHttpUrl(uploadForm.imageUrl)) {
      setUploadError('Please provide a valid image HTTP/HTTPS source URL.');
      return;
    }

    try {
      setUploadLoading(true);
      console.log('Submitting fan art:', uploadForm); // Debug log

      const payload = {
        title: uploadForm.title.trim(),
        artist: {
          name: uploadForm.artistName.trim(),
          socialLinks: {
            twitter: uploadForm.twitter.trim() || undefined,
            instagram: uploadForm.instagram.trim() || undefined
          }
        },
        style: uploadForm.style,
        era: uploadForm.era,
        imageUrl: uploadForm.imageUrl.trim(),
        description: uploadForm.description.trim() || undefined,
        tags: uploadForm.tags
          ? uploadForm.tags.split(',').map((t) => t.trim()).filter(Boolean)
          : []
      };

      console.log('Payload being sent:', payload); // Debug log

      const response = await axios.post('/fanart', payload);
      console.log('Response from server:', response.data); // Debug log

      // Clean form inputs on success and refresh page context 
      setUploadForm({
        title: '',
        artistName: '',
        imageUrl: '',
        description: '',
        style: 'Digital',
        era: 'Part 1',
        tags: '',
        twitter: '',
        instagram: ''
      });
      setIsUploadOpen(false);
      
      // Refresh the gallery
      await fetchFanArt();
      
      console.log('Fan art submitted successfully!');
    } catch (err) {
      console.error('Failed to submit artwork profile:', err);
      const errorMessage = err.response?.data?.message || err.response?.data?.error || 'Server rejected artwork submission entry.';
      setUploadError(errorMessage);
    } finally {
      setUploadLoading(false);
    }
  };

  // Helper to render social links safely
  const renderSafeLink = (url, label) => {
    if (!url) return null;
    if (isValidHttpUrl(url)) {
      return (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-emerald-400 hover:text-emerald-300 transition-colors"
        >
          {label}
        </a>
      );
    }
    return <span className="text-gray-500">{label}</span>;
  };

  return (
    <div className="py-12 px-4">
      <div className="text-center mb-12">
        <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
          Fan Art Gallery
        </h1>
        <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-8">
          Celebrate Temari through community art and cosplay
        </p>

        {isAuthenticated && (
          <button 
            onClick={() => {
              setUploadError('');
              setIsUploadOpen(true);
            }}
            className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg font-semibold text-white shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 transition-all flex items-center space-x-2 mx-auto"          >
            <Upload className="w-5 h-5" />
            <span>Submit Your Art</span>
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="mb-8 flex flex-wrap gap-4 justify-center max-w-5xl mx-auto">
        <select
          value={filter.style}
          onChange={(e) => setFilter({ ...filter, style: e.target.value })}
          className="px-6 py-2 rounded-lg bg-slate-800/50 text-gray-300 border border-emerald-500/30 focus:border-emerald-500 focus:outline-none"
        >
          <option value="">All Styles</option>
          <option value="Digital">Digital</option>
          <option value="Traditional">Traditional</option>
          <option value="Cosplay">Cosplay</option>
          <option value="3D Model">3D Model</option>
          <option value="Pixel Art">Pixel Art</option>
          <option value="Sketch">Sketch</option>
          <option value="Painting">Painting</option>
          <option value="Mixed Media">Mixed Media</option>
        </select>

        <select
          value={filter.era}
          onChange={(e) => setFilter({ ...filter, era: e.target.value })}
          className="px-6 py-2 rounded-lg bg-slate-800/50 text-gray-300 border border-emerald-500/30 focus:border-emerald-500 focus:outline-none"
        >
          <option value="">All Eras</option>
          <option value="Part 1">Part 1</option>
          <option value="Shippuden">Shippuden</option>
          <option value="Boruto">Boruto</option>
          <option value="The Last">The Last</option>
          <option value="Original Design">Original Design</option>
        </select>
      </div>

      {/* Gallery Grid */}
      <div className="max-w-7xl mx-auto">
        {fanArt.length === 0 ? (
          <div className="col-span-full text-center py-20">
            <Image className="w-20 h-20 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">No fan art available yet</p>
            <p className="text-gray-500 text-sm mt-2">Be the first to submit!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {fanArt.map((art) => (
              <div
                key={art._id}
                onClick={() => openArt(art)}
                className="group relative bg-slate-800/50 rounded-lg overflow-hidden border border-emerald-500/20 hover:border-emerald-500/50 transition-all cursor-pointer hover:shadow-lg hover:shadow-emerald-500/20"
              >
                {/* Image Container */}
                <div className="aspect-square bg-slate-900 flex items-center justify-center overflow-hidden relative">
                  {imageErrors[art._id] ? (
                    <div className="flex flex-col items-center justify-center w-full h-full">
                      <Image className="w-12 h-12 text-gray-600 mb-2" />
                      <span className="text-gray-500 text-sm">Image unavailable</span>
                    </div>
                  ) : (
                    <img
                      src={getCachedImageUrl(art)}
                      alt={art.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      onError={() => handleImageError(art._id)}
                      loading="lazy"
                      crossOrigin="anonymous"
                    />
                  )}

                  {/* Overlay on hover */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <p className="text-white font-semibold text-center px-4">View Details</p>
                  </div>
                </div>

                {/* Info Section */}
                <div className="p-4">
                  <h3 className="text-emerald-300 font-semibold mb-2 line-clamp-2">{art.title}</h3>
                  <p className="text-gray-400 text-sm mb-3">by {art.artist?.name || 'Unknown Artist'}</p>

                  {/* Style and Era Tags */}
                  <div className="flex flex-wrap gap-2 mb-3">
                    <span className="text-xs px-2 py-1 bg-emerald-500/20 text-emerald-300 rounded">
                      {art.style}
                    </span>
                    <span className="text-xs px-2 py-1 bg-cyan-500/20 text-cyan-300 rounded">
                      {art.era}
                    </span>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center justify-between text-sm text-gray-500 border-t border-emerald-500/10 pt-3">
                    <button
                      onClick={(e) => handleLike(art._id, e)}
                      aria-pressed={isLiked(art._id)}
                      disabled={!!inFlightLikes[art._id]}
                      className={`flex items-center space-x-1 transition-colors focus:outline-none ${
                        isLiked(art._id) ? 'text-red-400' : 'hover:text-red-400 text-gray-500'
                      }`}
                    >
                      <Heart className="w-4 h-4" />
                      <span>{art.likes}</span>
                    </button>
                    <div className="flex items-center space-x-1 text-gray-500">
                      <Eye className="w-4 h-4" />
                      <span>{art.views}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Creation Submission Portal Modal */}
      {isUploadOpen && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => !uploadLoading && setIsUploadOpen(false)}
        >
          <div 
            className="bg-gradient-to-br from-slate-900 to-slate-950 rounded-2xl max-w-xl w-full border border-emerald-500/30 shadow-2xl relative p-6 md:p-8 my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setIsUploadOpen(false)}
              disabled={uploadLoading}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white rounded-lg transition-all"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent mb-1">
              Share Your Artwork
            </h2>
            <p className="text-gray-400 text-sm mb-6">Contribute your creative entry directly to the public showcase timeline.</p>

            {uploadError && (
              <div className="p-3 mb-4 bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg text-sm">
                {uploadError}
              </div>
            )}

            <form onSubmit={handleUploadSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">Art Title *</label>
                  <input
                    type="text"
                    required
                    value={uploadForm.title}
                    onChange={(e) => setUploadForm({ ...uploadForm, title: e.target.value })}
                    placeholder="e.g. Desert Sandstorm"
                    className="w-full px-4 py-2 rounded-lg bg-slate-800/60 border border-slate-700 text-white focus:border-emerald-500 focus:outline-none text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">Artist Name *</label>
                  <input
                    type="text"
                    required
                    value={uploadForm.artistName}
                    onChange={(e) => setUploadForm({ ...uploadForm, artistName: e.target.value })}
                    placeholder="e.g. HanabiArts"
                    className="w-full px-4 py-2 rounded-lg bg-slate-800/60 border border-slate-700 text-white focus:border-emerald-500 focus:outline-none text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">Image Source URL *</label>
                <input
                  type="url"
                  required
                  value={uploadForm.imageUrl}
                  onChange={(e) => setUploadForm({ ...uploadForm, imageUrl: e.target.value })}
                  placeholder="https://scontent-iad3-1.cdninstagram.com/...jpg"
                  className="w-full px-4 py-2 rounded-lg bg-slate-800/60 border border-slate-700 text-white focus:border-emerald-500 focus:outline-none text-sm"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">Art Style</label>
                  <select
                    value={uploadForm.style}
                    onChange={(e) => setUploadForm({ ...uploadForm, style: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 text-gray-300 focus:border-emerald-500 focus:outline-none text-sm"
                  >
                    <option value="Digital">Digital</option>
                    <option value="Traditional">Traditional</option>
                    <option value="Cosplay">Cosplay</option>
                    <option value="3D Model">3D Model</option>
                    <option value="Pixel Art">Pixel Art</option>
                    <option value="Sketch">Sketch</option>
                    <option value="Painting">Painting</option>
                    <option value="Mixed Media">Mixed Media</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">Timeline Era</label>
                  <select
                    value={uploadForm.era}
                    onChange={(e) => setUploadForm({ ...uploadForm, era: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 text-gray-300 focus:border-emerald-500 focus:outline-none text-sm"
                  >
                    <option value="Part 1">Part 1</option>
                    <option value="Shippuden">Shippuden</option>
                    <option value="Boruto">Boruto</option>
                    <option value="The Last">The Last</option>
                    <option value="Original Design">Original Design</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">Description</label>
                <textarea
                  value={uploadForm.description}
                  onChange={(e) => setUploadForm({ ...uploadForm, description: e.target.value })}
                  placeholder="Optional context detailing style benchmarks, references, software used..."
                  rows="2"
                  className="w-full px-4 py-2 rounded-lg bg-slate-800/60 border border-slate-700 text-white focus:border-emerald-500 focus:outline-none text-sm resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">Tags (Comma-separated)</label>
                <input
                  type="text"
                  value={uploadForm.tags}
                  onChange={(e) => setUploadForm({ ...uploadForm, tags: e.target.value })}
                  placeholder="wind, giantfan, sandvillage"
                  className="w-full px-4 py-2 rounded-lg bg-slate-800/60 border border-slate-700 text-white focus:border-emerald-500 focus:outline-none text-sm"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">Twitter Handle Link</label>
                  <input
                    type="url"
                    value={uploadForm.twitter}
                    onChange={(e) => setUploadForm({ ...uploadForm, twitter: e.target.value })}
                    placeholder="https://twitter.com/handle"
                    className="w-full px-4 py-2 rounded-lg bg-slate-800/60 border border-slate-700 text-white focus:border-emerald-500 focus:outline-none text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">Instagram Handle Link</label>
                  <input
                    type="url"
                    value={uploadForm.instagram}
                    onChange={(e) => setUploadForm({ ...uploadForm, instagram: e.target.value })}
                    placeholder="https://instagram.com/handle"
                    className="w-full px-4 py-2 rounded-lg bg-slate-800/60 border border-slate-700 text-white focus:border-emerald-500 focus:outline-none text-sm"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  disabled={uploadLoading}
                  onClick={() => setIsUploadOpen(false)}
                  className="px-5 py-2 rounded-lg text-sm font-medium text-gray-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploadLoading}
                  className="px-5 py-2 rounded-lg text-sm font-semibold text-white bg-gradient-to-r from-emerald-500 to-teal-500 shadow-md hover:from-emerald-600 hover:to-teal-600 transition-all flex items-center space-x-2"
                >
                  {uploadLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Uploading...</span>
                    </>
                  ) : (
                    <span>Publish Art</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Details Lightbox Modal Window View */}
      {selectedArt && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedArt(null)}
        >
          <div
            className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto border border-emerald-500/30 shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setSelectedArt(null)}
              className="absolute top-4 right-4 p-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg text-red-300 transition-all z-10"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Image Wrapper */}
            <div className="w-full bg-slate-900 flex items-center justify-center max-h-96 overflow-hidden relative group">
              {modalImageError ? (
                <div className="w-full h-96 flex items-center justify-center bg-slate-900">
                  <div className="text-center">
                    <Image className="w-20 h-20 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400">Image unavailable</p>
                  </div>
                </div>
              ) : (
                <>
                  <img
                    src={getCachedImageUrl(selectedArt)}
                    alt={selectedArt.title}
                    className="w-full h-full object-contain cursor-pointer"
                    onError={() => setModalImageError(true)}
                    crossOrigin="anonymous"
                    onClick={() => {
                      if (isValidHttpUrl(selectedArt.imageUrl)) {
                        window.open(selectedArt.imageUrl, '_blank', 'noopener');
                      } else {
                        console.warn('Blocked opening invalid image URL:', selectedArt.imageUrl);
                      }
                    }}
                  />
                  {/* Hover hint */}
                  <div className="absolute top-4 right-4 bg-black/60 px-3 py-2 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                    <p className="text-white text-sm">Click to open original content link</p>
                  </div>
                </>
              )}
            </div>

            {/* Content Context Metadata Fields */}
            <div className="p-8">
              <h2 className="text-4xl font-bold text-emerald-300 mb-2">{selectedArt.title}</h2>
              <p className="text-gray-400 mb-6">by {selectedArt.artist?.name || 'Unknown Artist'}</p>

              {/* Description */}
              {selectedArt.description && (
                <div className="mb-6">
                  <h3 className="text-xl font-semibold text-emerald-400 mb-2">Description</h3>
                  <p className="text-gray-300 leading-relaxed">{selectedArt.description}</p>
                </div>
              )}

              {/* Details Grid */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="p-4 bg-slate-900/50 rounded-lg">
                  <p className="text-gray-400 text-sm mb-1">Style</p>
                  <p className="text-emerald-300 font-semibold">{selectedArt.style}</p>
                </div>
                <div className="p-4 bg-slate-900/50 rounded-lg">
                  <p className="text-gray-400 text-sm mb-1">Era</p>
                  <p className="text-emerald-300 font-semibold">{selectedArt.era}</p>
                </div>
              </div>

              {/* Tags */}
              {selectedArt.tags && selectedArt.tags.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-xl font-semibold text-emerald-400 mb-3">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedArt.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-3 py-1 bg-emerald-500/20 text-emerald-300 rounded-full text-sm"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Stats and Social Actions Layout */}
              <div className="flex items-center justify-between pt-6 border-t border-emerald-500/20">
                <div className="flex space-x-6">
                  <button
                    onClick={() => handleLike(selectedArt._id)}
                    disabled={!!inFlightLikes[selectedArt._id]}
                    className={`flex items-center space-x-2 ${
                      isLiked(selectedArt._id) ? 'text-red-400' : 'text-gray-400 hover:text-red-400'
                    }`}
                  >
                    <Heart className="w-5 h-5" />
                    <span>{selectedArt.likes} likes</span>
                  </button>
                  <div className="flex items-center space-x-2 text-gray-400">
                    <Eye className="w-5 h-5" />
                    <span>{selectedArt.views} views</span>
                  </div>
                </div>

                {/* Social Handle Links */}
                {selectedArt.artist?.socialLinks && (
                  <div className="flex space-x-4">
                    {selectedArt.artist.socialLinks.twitter &&
                      renderSafeLink(selectedArt.artist.socialLinks.twitter, 'Twitter')}
                    {selectedArt.artist.socialLinks.instagram &&
                      renderSafeLink(selectedArt.artist.socialLinks.instagram, 'Instagram')}
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

export default FanArtGallery;