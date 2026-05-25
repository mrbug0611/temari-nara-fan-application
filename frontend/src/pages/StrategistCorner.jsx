// src/pages/StrategistCorner.jsx
import React, { useEffect, useState } from 'react';
import { MessageSquare, TrendingUp, Pin, Heart, Plus, X, Send, CornerDownRight, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const StrategistCorner = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [likedPosts, setLikedPosts] = useState({});
    const [inFlightLikes, setInFlightLikes] = useState({});
    const [inFlightReplyLikes, setInFlightReplyLikes] = useState({});
    const [currentUserId, setCurrentUserId] = useState(null);

    // New Post Creation State
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [submitLoading, setSubmitLoading] = useState(false);
    const [createForm, setCreateForm] = useState({ title: '', content: '', category: 'General' });

    // Expandable Thread / Reply State
    const [expandedPostId, setExpandedPostId] = useState(null);
    // FIX: Converted string state into a per-post key-value map object to isolate user drafts
    const [replyContent, setReplyContent] = useState({});
    const [replyLoading, setReplyLoading] = useState(false);

    const { isAuthenticated } = useAuth();

    useEffect(() => {
        fetchPosts();
    }, [isAuthenticated]);

    const fetchPosts = async () => {
        try {
            let userId = null;
            try {
                const userResponse = await fetch('/api/user/me', { credentials: 'include' });
                if (userResponse.ok) {
                    const userData = await userResponse.json();
                    userId = userData._id;
                }
            } catch (err) {
                console.debug('Session check bypassed.');
            }

            setCurrentUserId(userId);

            const response = await fetch('/api/strategist', { credentials: 'include' });
            if (!response.ok) {
                throw new Error(`Failed to fetch posts: ${response.status}`);
            }

            const data = await response.json();
            const postsData = Array.isArray(data) ? data : (data.posts || []);

            if (!Array.isArray(postsData)) {
                console.error('Posts data is not an array:', postsData);
                setPosts([]);
                setLoading(false);
                return;
            }

            setPosts(postsData);

            const initialLikedMap = {};
            postsData.forEach(post => {
                let hasLiked = false;
                if (post.hasLiked !== undefined) {
                    hasLiked = !!post.hasLiked;
                } else if (userId && post.likedBy && Array.isArray(post.likedBy)) {
                    hasLiked = post.likedBy.some(id => {
                        const idString = typeof id === 'string' ? id : id?._id?.toString?.();
                        return idString === userId.toString();
                    });
                }
                initialLikedMap[post._id] = hasLiked;
            });

            setLikedPosts(initialLikedMap);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching posts:", error);
            setPosts([]);
            setLikedPosts({});
            setLoading(false);
        }
    };

    const handleExpandPost = async (postId) => {
        const isCurrentlyExpanded = expandedPostId === postId;
        
        if (isCurrentlyExpanded) {
            setExpandedPostId(null);
            return;
        }

        setExpandedPostId(postId);

        setPosts(prev => prev.map(post => 
            post._id === postId ? { ...post, views: (post.views || 0) + 1 } : post
        ));

        try {
            await fetch(`/api/strategist/${postId}/view`, {
                method: 'POST',
                credentials: 'include'
            });
        } catch (err) {
            console.debug('Background view recording completed.');
        }
    };

    const handleCreatePost = async (e) => {
        e.preventDefault();
        if (!createForm.title.trim() || !createForm.content.trim()) return;

        try {
            setSubmitLoading(true);
            const response = await fetch('/api/strategist', {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: createForm.title.trim(),
                    content: createForm.content.trim(),
                    category: createForm.category
                })
            });

            if (!response.ok) throw new Error('Failed to create new discussion post.');

            setCreateForm({ title: '', content: '', category: 'General' });
            setIsCreateOpen(false);
            await fetchPosts();
        } catch (err) {
            console.error('Error creating discussion thread:', err);
        } finally {
            setSubmitLoading(false);
        }
    };

    const handleSubmitReply = async (postId, e) => {
        e.preventDefault();
        const activeText = (replyContent[postId] || '').trim();
        if (!activeText) return;

        try {
            setReplyLoading(true);
            const response = await fetch(`/api/strategist/${postId}/reply`, {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content: activeText })
            });

            if (!response.ok) throw new Error('Failed to save content reply entry.');

            // FIX: Safely clear only this specific thread input text upon successful entry submission
            setReplyContent(prev => ({ ...prev, [postId]: '' }));
            await fetchPosts(); 
        } catch (err) {
            console.error('Reply submission rejected:', err);
        } finally {
            setReplyLoading(false);
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

        setInFlightLikes(prev => ({ ...prev, [postId]: true }));
        const newLikedState = !currentlyLiked;
        setLikedPosts(prev => ({ ...prev, [postId]: newLikedState }));

        setPosts(prev =>
            prev.map(post =>
                post._id === postId
                    ? {
                        ...post,
                        likes: currentlyLiked ? Math.max(0, post.likes - 1) : post.likes + 1,
                        hasLiked: newLikedState
                      }
                    : post
            )
        );

        try {
            const response = await fetch(`/api/strategist/${postId}/like`, {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' }
            });

            if (!response.ok) throw new Error('Failed to like post');

            const data = await response.json();
            if (data) {
                setPosts(prev =>
                    prev.map(post =>
                        post._id === postId
                            ? { ...post, likes: data.likes, hasLiked: data.hasLiked }
                            : post
                    )
                );
                setLikedPosts(prev => ({ ...prev, [postId]: data.hasLiked }));
            }
        } catch (err) {
            console.error('Like toggle failed:', err);
            setLikedPosts(prev => ({ ...prev, [postId]: currentlyLiked }));
            setPosts(prev =>
                prev.map(post =>
                    post._id === postId
                        ? { ...post, likes: currentlyLiked ? post.likes + 1 : Math.max(0, post.likes - 1), hasLiked: currentlyLiked }
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

    const handleReplyLike = async (postId, replyId, e) => {
        if (e && e.stopPropagation) e.stopPropagation();
        if (!isAuthenticated) {
            window.location.href = '/login';
            return;
        }

        const operationKey = `${postId}-${replyId}`;
        if (inFlightReplyLikes[operationKey]) return;

        const targetPost = posts.find(p => p._id === postId);
        const targetReply = targetPost?.replies?.find(r => r._id === replyId);
        if (!targetReply) return;

        const userHasLikedReply = targetReply.hasLiked || (currentUserId && targetReply.likedBy?.some(id => {
            const parsedId = typeof id === 'string' ? id : id?._id?.toString?.();
            return parsedId === currentUserId.toString();
        }));

        setInFlightReplyLikes(prev => ({ ...prev, [operationKey]: true }));

        setPosts(prev => prev.map(post => {
            if (post._id !== postId) return post;
            return {
                ...post,
                replies: post.replies.map(reply => {
                    if (reply._id !== replyId) return reply;
                    return {
                        ...reply,
                        likes: userHasLikedReply ? Math.max(0, (reply.likes || 1) - 1) : (reply.likes || 0) + 1,
                        hasLiked: !userHasLikedReply
                    };
                })
            };
        }));

        try {
            const response = await fetch(`/api/strategist/${postId}/reply/${replyId}/like`, {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' }
            });

            if (!response.ok) throw new Error('Failed to change server reply asset like value.');
            const data = await response.json();

            if (data) {
                setPosts(prev => prev.map(post => {
                    if (post._id !== postId) return post;
                    return {
                        ...post,
                        replies: post.replies.map(reply => 
                            reply._id === replyId ? { ...reply, likes: data.likes, hasLiked: data.hasLiked, likedBy: data.likedBy } : reply
                        )
                    };
                }));
            }
        } catch (err) {
            console.error('Error changing response preference state:', err);
            setPosts(prev => prev.map(post => {
                if (post._id !== postId) return post;
                return {
                    ...post,
                    replies: post.replies.map(reply => {
                        if (reply._id !== replyId) return reply;
                        return {
                            ...reply,
                            likes: userHasLikedReply ? (reply.likes || 0) + 1 : Math.max(0, (reply.likes || 1) - 1),
                            hasLiked: userHasLikedReply
                        };
                    })
                };
            }));
        } finally {
            setInFlightReplyLikes(prev => {
                const copy = { ...prev };
                delete copy[operationKey];
                return copy;
            });
        }
    };

    const isLiked = (postId) => {
        if (likedPosts[postId] !== undefined) return likedPosts[postId];
        const post = posts.find(p => p._id === postId);
        return post?.hasLiked || false;
    };

    const isReplyLiked = (post, reply) => {
        if (reply.hasLiked !== undefined) return !!reply.hasLiked;
        if (!currentUserId || !reply.likedBy) return false;
        return reply.likedBy.some(id => {
            const parsedId = typeof id === 'string' ? id : id?._id?.toString?.();
            return parsedId === currentUserId.toString();
        });
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <p className="text-emerald-300 text-xl animate-pulse">Loading Forum Context...</p>
            </div>
        );
    }

    return (
        <div className="py-12 px-4 max-w-5xl mx-auto">
            <div className="text-center mb-12 relative">
                <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                    Strategist's Corner
                </h1>
                <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-6">
                    Discuss battle strategies, team compositions, and tactical character analysis.
                </p>

                {isAuthenticated && (
                    <button
                        onClick={() => setIsCreateOpen(!isCreateOpen)}
                        className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg font-semibold text-white shadow-md hover:shadow-emerald-500/20 transition-all flex items-center space-x-2 mx-auto"
                    >
                        {isCreateOpen ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                        <span>{isCreateOpen ? 'Cancel Discussion' : 'New Discussion'}</span>
                    </button>
                )}
            </div>

            {/* Create Discussion Entry Box Form Panel Layout */}
            {isCreateOpen && isAuthenticated && (
                <div className="mb-8 p-6 bg-slate-900/80 border border-emerald-500/30 rounded-xl max-w-4xl mx-auto shadow-xl animate-fade-in">
                    <h2 className="text-xl font-bold text-emerald-400 mb-4 flex items-center space-x-2">
                        <span>Start a New Thread</span>
                    </h2>
                    <form onSubmit={handleCreatePost} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="md:col-span-2">
                                <label className="block text-xs uppercase tracking-wider text-gray-400 mb-1 font-semibold">Title Framework</label>
                                <input
                                    type="text"
                                    required
                                    value={createForm.title}
                                    onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })}
                                    placeholder="e.g. Managing Wind Scythe setups effectively"
                                    className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:border-emerald-500 focus:outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-xs uppercase tracking-wider text-gray-400 mb-1 font-semibold">Category Type</label>
                                <select
                                    value={createForm.category}
                                    onChange={(e) => setCreateForm({ ...createForm, category: e.target.value })}
                                    className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-gray-300 text-sm focus:border-emerald-500 focus:outline-none"
                                >
                                    <option value="General">General</option>
                                    <option value="Team Strategy">Team Strategy</option>
                                    <option value="Battle Analysis">Battle Analysis</option>
                                    <option value="Character Analysis">Character Analysis</option>
                                    <option value="Jutsu Combos">Jutsu Combos</option>
                                    <option value="Historical Discussion">Historical Discussion</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs uppercase tracking-wider text-gray-400 mb-1 font-semibold">Core Strategy Breakdown Context</label>
                            <textarea
                                required
                                rows="5"
                                value={createForm.content}
                                onChange={(e) => setCreateForm({ ...createForm, content: e.target.value })}
                                placeholder="Detail text reference points or guide setups..."
                                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:border-emerald-500 focus:outline-none resize-none"
                            />
                        </div>

                        <div className="flex justify-end pt-2">
                            <button
                                type="submit"
                                disabled={submitLoading}
                                className="px-5 py-2 bg-emerald-500 hover:bg-emerald-600 font-semibold text-white text-sm rounded-lg transition-colors flex items-center space-x-2"
                            >
                                {submitLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                                <span>Publish Thread</span>
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Forums List */}
            <div className="max-w-4xl mx-auto space-y-4">
                {posts.length === 0 ? (
                    <div className="text-center py-20">
                        <MessageSquare className="w-20 h-20 text-gray-600 mx-auto mb-4" />
                        <p className="text-gray-400 text-lg">No discussions started yet</p>
                    </div>
                ) : (
                    posts.map((post) => {
                        const isExpanded = expandedPostId === post._id;
                        return (
                            <div
                                key={post._id}
                                onClick={() => handleExpandPost(post._id)}
                                className={`bg-slate-800/50 rounded-lg p-6 border transition-all hover:shadow-lg group cursor-pointer ${
                                    isExpanded ? 'border-emerald-500/60 bg-slate-800/80' : 'border-emerald-500/20 hover:border-emerald-500/50'
                                }`}
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

                                <p className={`text-gray-300 mb-4 leading-relaxed whitespace-pre-wrap ${!isExpanded && 'line-clamp-3 text-gray-400'}`}>
                                    {isExpanded ? post.content : `${post.content.substring(0, 200)}${post.content.length > 200 ? '...' : ''}`}
                                </p>

                                <div className="flex items-center justify-between text-sm text-gray-500 border-t border-emerald-500/10 pt-3">
                                    <div className="flex items-center space-x-4">
                                        <span className="text-gray-300 font-medium">{post.author?.username || 'Anonymous'}</span>
                                        <span>{post.views || 0} views</span>
                                    </div>
                                    <div className="flex items-center space-x-4">
                                        <span className="flex items-center space-x-1 text-emerald-400/80">
                                            <MessageSquare className="w-4 h-4" />
                                            <span>{post.replies?.length || 0} replies</span>
                                        </span>

                                        <button
                                            onClick={(e) => handleLike(post._id, e)}
                                            disabled={inFlightLikes[post._id]}
                                            className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg transition-all font-medium ${
                                                isLiked(post._id)
                                                    ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30'
                                                    : 'text-gray-500 hover:bg-emerald-500/10 hover:text-emerald-400 border border-transparent'
                                            }`}
                                        >
                                            <Heart className={`w-4 h-4 ${isLiked(post._id) ? 'fill-red-400 text-red-400' : ''}`} />
                                            <span>{post.likes || 0}</span>
                                        </button>
                                    </div>
                                </div>

                                {/* Replies nested implementation feed segment rendering */}
                                {isExpanded && (
                                    <div className="mt-6 pt-6 border-t border-slate-700 space-y-4" onClick={(e) => e.stopPropagation()}>
                                        <h4 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-2">Discussion Responses</h4>
                                        
                                        {post.replies && post.replies.length > 0 ? (
                                            <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
                                                {post.replies.map((reply, index) => {
                                                    const hasLikedReply = isReplyLiked(post, reply);
                                                    const rKey = `${post._id}-${reply._id || index}`;
                                                    return (
                                                        <div key={reply._id || index} className="flex items-start space-x-2 bg-slate-900/40 p-3 rounded-lg border border-slate-800 group/reply">
                                                            <CornerDownRight className="w-4 h-4 text-emerald-500/50 mt-0.5 flex-shrink-0" />
                                                            <div className="flex-1 min-w-0">
                                                                <div className="flex items-center justify-between mb-1">
                                                                    <span className="text-xs font-semibold text-emerald-400">{reply.author?.username || 'Anonymous'}</span>
                                                                    
                                                                    <button
                                                                        onClick={(e) => handleReplyLike(post._id, reply._id, e)}
                                                                        disabled={inFlightReplyLikes[rKey]}
                                                                        className={`flex items-center space-x-1 px-2 py-0.5 rounded text-xs transition-colors ${
                                                                            hasLikedReply 
                                                                                ? 'bg-red-500/10 text-red-400 border border-red-500/20' 
                                                                                : 'text-gray-500 hover:bg-emerald-500/10 hover:text-emerald-400'
                                                                        }`}
                                                                    >
                                                                        <Heart className={`w-3 h-3 ${hasLikedReply ? 'fill-red-400 text-red-400' : ''}`} />
                                                                        <span>{reply.likes || 0}</span>
                                                                    </button>
                                                                </div>
                                                                <p className="text-sm text-gray-300 whitespace-pre-wrap break-words">{reply.content}</p>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        ) : (
                                            <p className="text-xs text-gray-500 italic py-2">No responses filed yet. Be the first to add an analytical reference!</p>
                                        )}

                                        {/* Reply Box area input submission field form */}
                                        {isAuthenticated ? (
                                            <form onSubmit={(e) => handleSubmitReply(post._id, e)} className="mt-4 flex items-center space-x-2">
                                                {/* FIX: Bounded value and handler strictly to individual post ID map parameters */}
                                                <input
                                                    type="text"
                                                    value={replyContent[post._id] || ''}
                                                    onChange={(e) => setReplyContent(prev => ({ ...prev, [post._id]: e.target.value }))}
                                                    placeholder="Type your response tactic context here..."
                                                    className="flex-1 px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm focus:border-emerald-500 focus:outline-none"
                                                />
                                                <button
                                                    type="submit"
                                                    disabled={replyLoading || !(replyContent[post._id] || '').trim()}
                                                    className="p-2 bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-700 text-white rounded-lg transition-colors flex items-center justify-center flex-shrink-0"
                                                >
                                                    <Send className="w-4 h-4" />
                                                </button>
                                            </form>
                                        ) : (
                                            <div className="p-3 bg-slate-900/50 border border-slate-800 rounded-lg text-center text-xs text-gray-500">
                                                Please <a href="/login" className="text-emerald-400 hover:underline">Sign In</a> to file responses.
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Featured Badge */}
                                {post.featured && (
                                    <div className="mt-3 flex items-center space-x-2">
                                        <TrendingUp className="w-4 h-4 text-cyan-400" />
                                        <span className="text-xs text-cyan-400 font-semibold">Featured Discussion</span>
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}
            </div>

            {!isAuthenticated && (
                <div className="mt-8 max-w-4xl mx-auto p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-center">
                    <p className="text-emerald-300">
                        <a href="/login" className="font-semibold hover:text-emerald-200 underline transition-colors">
                            Sign in
                        </a>
                        {' '}to start new threads and participate in active strategy discussions.
                    </p>
                </div>
            )}
        </div>
    );
};

export default StrategistCorner;