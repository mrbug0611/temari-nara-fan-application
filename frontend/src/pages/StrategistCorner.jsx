import React, { useEffect, useState } from 'react';
import { MessageSquare, TrendingUp, Pin, Heart } from 'lucide-react';

const StrategistCorner = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [likedPosts, setLikedPosts] = useState({});
    const [inFlightLikes, setInFlightLikes] = useState({});
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        fetchPosts();
    }, []);

    const fetchPosts = async () => {
        try {
            // Get current user first
            let currentUserId = null;
            let isAuth = false;
            try {
                const userResponse = await fetch('/api/user/me', {
                    credentials: 'include'
                });
                if (userResponse.ok) {
                    const userData = await userResponse.json();
                    currentUserId = userData._id;
                    isAuth = true;
                }
            } catch (err) {
                console.error('Failed to get current user:', err);
            }

            // Set authentication state
            setIsAuthenticated(isAuth);

            // Fetch posts
            const response = await fetch('/api/strategist', {
                credentials: 'include'
            });
            const data = await response.json();
            const postsData = data.posts || data;
            setPosts(postsData);

            // Initialize liked posts map based on likedBy array
            const initialLikedMap = {};
            postsData.forEach(post => {
                if (currentUserId && post.likedBy && Array.isArray(post.likedBy)) {
                    // Check if current user's ID is in the likedBy array
                    const hasLiked = post.likedBy.some(id => {
                        const idString = typeof id === 'string' ? id : id?._id?.toString?.();
                        return idString === currentUserId.toString();
                    });
                    initialLikedMap[post._id] = hasLiked;
                }
            });
            setLikedPosts(initialLikedMap);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching posts:", error);
            setLoading(false);
        }
    };

    const handleLike = async (postId, e) => {
        e.stopPropagation();

        if (!isAuthenticated) {
            window.location.href = '/login';
            return;
        }

        if (inFlightLikes[postId]) return;

        const currentlyLiked = !!likedPosts[postId];
        
        // Optimistic update - just toggle the liked state and update count
        setInFlightLikes(prev => ({ ...prev, [postId]: true }));
        setLikedPosts(prev => ({
            ...prev,
            [postId]: !currentlyLiked
        }));

        setPosts(prev =>
            prev.map(post =>
                post._id === postId
                    ? { ...post, likes: currentlyLiked ? post.likes - 1 : post.likes + 1 }
                    : post
            )
        );

        try {
            const response = await fetch(`/api/strategist/${postId}/like`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();
            
            if (response.ok && data) {
                // Sync with server response
                setPosts(prev =>
                    prev.map(post =>
                        post._id === postId ? { ...post, likes: data.likes } : post
                    )
                );

                setLikedPosts(prev => ({
                    ...prev,
                    [postId]: data.hasLiked
                }));
            }
        } catch (err) {
            console.error('Like toggle failed:', err);
            
            // Rollback on error
            setLikedPosts(prev => ({
                ...prev,
                [postId]: currentlyLiked
            }));

            setPosts(prev =>
                prev.map(post =>
                    post._id === postId
                        ? { ...post, likes: currentlyLiked ? post.likes + 1 : post.likes - 1 }
                        : post
                )
            );
        } finally {
            setInFlightLikes(prev => {
                const updated = { ...prev };
                delete updated[postId];
                return updated;
            });
        }
    };

    const isLiked = (postId) => !!likedPosts[postId];

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <p className="text-emerald-300 text-xl">Loading Forum...</p>
            </div>
        );
    }

    return (
        <div className="py-12 px-4">
            <div className="text-center mb-12">
                <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                    Strategist's Corner
                </h1>
                <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                    Discuss battle strategies, team compositions, and character analysis
                </p>
            </div>

            <div className="max-w-4xl mx-auto space-y-4">
                {posts.length === 0 ? (
                    <div className="text-center py-20">
                        <MessageSquare className="w-20 h-20 text-gray-600 mx-auto mb-4" />
                        <p className="text-gray-400 text-lg">No discussions yet</p>
                    </div>
                ) : (
                    posts.map((post) => (
                        <div
                            key={post._id}
                            className="bg-slate-800/50 rounded-lg p-6 border border-emerald-500/20 hover:border-emerald-500/50 transition-all hover:shadow-lg hover:shadow-emerald-500/20 group"
                        >
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex-1">
                                    <h3 className="text-xl font-semibold text-emerald-300 group-hover:text-emerald-200 transition-colors">
                                        {post.title}
                                    </h3>
                                    {post.category && (
                                        <p className="text-sm text-emerald-400/70 mt-1">{post.category}</p>
                                    )}
                                </div>
                                {post.pinned && (
                                    <Pin className="w-5 h-5 text-yellow-400 flex-shrink-0 ml-2" />
                                )}
                            </div>

                            <p className="text-gray-400 mb-4 line-clamp-3">{post.content.substring(0, 200)}...</p>

                            <div className="flex items-center justify-between text-sm text-gray-500 border-t border-emerald-500/20 pt-3">
                                <div className="flex items-center space-x-4">
                                    <span className="text-gray-300">{post.author?.username || 'Anonymous'}</span>
                                    <span>{post.views || 0} views</span>
                                </div>
                                <div className="flex items-center space-x-4">
                                    <span className="flex items-center space-x-1">
                                        <MessageSquare className="w-4 h-4" />
                                        <span>{post.replies?.length || 0} replies</span>
                                    </span>

                                    <button
                                        onClick={(e) => handleLike(post._id, e)}
                                        disabled={!isAuthenticated || inFlightLikes[post._id]}
                                        className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg transition-all font-medium ${
                                            isLiked(post._id)
                                                ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30'
                                                : 'text-gray-500 hover:bg-emerald-500/10 hover:text-emerald-400 border border-transparent'
                                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                                        title={!isAuthenticated ? 'Login to like posts' : 'Like this post'}
                                    >
                                        <Heart
                                            className={`w-4 h-4 transition-all ${
                                                isLiked(post._id) ? 'fill-red-400' : ''
                                            }`}
                                        />
                                        <span>{post.likes || 0}</span>
                                    </button>
                                </div>
                            </div>

                            {/* Featured Badge */}
                            {post.featured && (
                                <div className="mt-3 flex items-center space-x-2">
                                    <TrendingUp className="w-4 h-4 text-cyan-400" />
                                    <span className="text-xs text-cyan-400 font-semibold">Featured Discussion</span>
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>

            {!isAuthenticated && (
                <div className="mt-8 max-w-4xl mx-auto p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-center">
                    <p className="text-emerald-300">
                        <a href="/login" className="font-semibold hover:text-emerald-200 underline transition-colors">
                            Sign in
                        </a>
                        {' '}to like and participate in discussions
                    </p>
                </div>
            )}
        </div>
    );
};

export default StrategistCorner;