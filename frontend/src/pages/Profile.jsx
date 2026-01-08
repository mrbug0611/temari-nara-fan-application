//src/pages/Profile.jsx
import {useAuth} from '../contexts/AuthContext';
import { AlertCircle, Loader } from 'lucide-react';

export const Profile = () => {
    const { user, loading, error, clearError } = useAuth();

    if (loading) {
        return (
            <div className="py-12">
                <div className="max-w-4xl mx-auto">
                    <div className="bg-slate-800/50 rounded-2xl p-8 border border-emerald-500/20 flex flex-col items-center justify-center min-h-96">
                        <Loader className="w-12 h-12 text-emerald-400 animate-spin mb-4" />
                        <p className="text-emerald-300 text-lg">Loading your profile...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="py-12">
                <div className="max-w-4xl mx-auto">
                    <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-8">
                        <div className="flex items-start space-x-4">
                            <AlertCircle className="w-6 h-6 text-red-400 flex-shrink-0 mt-1" />
                            <div>
                                <h2 className="text-xl font-semibold text-red-300 mb-2">Error Loading Profile</h2>
                                <p className="text-red-200 mb-4">{error}</p>
                                <button
                                    onClick={clearError}
                                    className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg transition-colors"
                                >
                                    Dismiss
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="py-12">
                <div className="max-w-4xl mx-auto">
                    <div className="bg-slate-800/50 rounded-2xl p-8 border border-emerald-500/20">
                        <p className="text-gray-300 text-lg">Please log in to view your profile</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="py-12">
            <div className="max-w-4xl mx-auto">
                <div className="bg-slate-800/50 rounded-2xl p-8 border border-emerald-500/20">
                    <h1 className="text-4xl font-bold text-emerald-300 mb-6">Profile</h1>
                    <div className="space-y-4">
                        <div>
                            <label className="text-gray-400 text-sm">Username</label>
                            <p className="text-white text-xl font-semibold">{user.username}</p>
                        </div>
                        <div>
                            <label className="text-gray-400 text-sm">Email</label>
                            <p className="text-white">{user.email}</p>
                        </div>
                        <div>
                            <label className="text-gray-400 text-sm">Rank</label>
                            <p className="text-emerald-400 font-semibold">{user.profile?.rank || 'Genin'}</p>
                        </div>
                        {user.profile?.bio && (
                            <div>
                                <label className="text-gray-400 text-sm">Bio</label>
                                <p className="text-gray-300">{user.profile.bio}</p>
                            </div>
                        )}
                        {user.profile?.village && (
                            <div>
                                <label className="text-gray-400 text-sm">Village</label>
                                <p className="text-gray-300">{user.profile.village}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;