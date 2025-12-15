// pages/users/[id].js
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import axios from 'axios';
import Link from 'next/link';

function UserProfile() {
    const router = useRouter();
    const { id } = router.query;
    const [user, setUser] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);
    const [activity, setActivity] = useState({ posts: [], comments: [], votes: [], follows: [] });
    const [activeTab, setActiveTab] = useState('profile');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setCurrentUser(JSON.parse(storedUser));
        }

        if (id) {
            fetchUserData();
        }
    }, [id]);

    const fetchUserData = async () => {
        setLoading(true);
        try {
            // 사용자 정보 가져오기
            const userRes = await axios.get(`/api/auth/user/${id}`);
            setUser(userRes.data);

            // 사용자 활동 가져오기
            const activityRes = await axios.get(`/api/users/${id}/activity`);
            setActivity(activityRes.data);
        } catch (error) {
            console.error('Failed to fetch user data:', error);
        } finally {
            setLoading(false);
        }
    };

    const getTimeAgo = (date) => {
        const now = new Date();
        const postDate = new Date(date);
        const diffInMinutes = Math.floor((now - postDate) / (1000 * 60));

        if (diffInMinutes < 60) return `${diffInMinutes} mins ago`;
        if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} hours ago`;
        return `${Math.floor(diffInMinutes / 1440)} days ago`;
    };

    if (loading) return <div className="p-6">Loading...</div>;
    if (!user) return <div className="p-6">User not found.</div>;

    const isOwnProfile = currentUser && currentUser.id === id;

    return (
        <div className="max-w-5xl">
            {/* User Header */}
            <div className="mb-6">
                <div className="flex items-start gap-4 mb-4">
                    <div className="w-32 h-32 bg-gradient-to-br from-orange-400 to-orange-600 rounded"></div>
                    <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                            <h1 className="text-4xl font-normal">{user.username}</h1>
                            {isOwnProfile && (
                                <Link
                                    href={`/users/${id}/settings`}
                                    className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-100 text-sm no-underline"
                                >
                                    Edit profile
                                </Link>
                            )}
                        </div>
                        <div className="flex gap-4 text-sm text-gray-600">
                            <div>
                                <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Member for {Math.floor((new Date() - new Date(user.createdAt)) / (1000 * 60 * 60 * 24))} days
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-4 gap-4 bg-gray-50 p-4 rounded border border-gray-200">
                    <div className="text-center">
                        <div className="text-2xl font-bold text-gray-700">{user.reputation || 1}</div>
                        <div className="text-sm text-gray-600">reputation</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-gray-700">{activity.posts.length}</div>
                        <div className="text-sm text-gray-600">questions</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-gray-700">{activity.comments.length}</div>
                        <div className="text-sm text-gray-600">answers</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-gray-700">{activity.votes.length}</div>
                        <div className="text-sm text-gray-600">votes cast</div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-300 mb-6">
                <div className="flex gap-4">
                    <button
                        onClick={() => setActiveTab('profile')}
                        className={`px-4 py-3 text-sm border-b-2 ${
                            activeTab === 'profile'
                                ? 'border-orange-500 text-gray-900 font-medium'
                                : 'border-transparent text-gray-600 hover:text-gray-900'
                        }`}
                    >
                        Profile
                    </button>
                    <button
                        onClick={() => setActiveTab('activity')}
                        className={`px-4 py-3 text-sm border-b-2 ${
                            activeTab === 'activity'
                                ? 'border-orange-500 text-gray-900 font-medium'
                                : 'border-transparent text-gray-600 hover:text-gray-900'
                        }`}
                    >
                        Activity
                    </button>
                    <button
                        onClick={() => setActiveTab('questions')}
                        className={`px-4 py-3 text-sm border-b-2 ${
                            activeTab === 'questions'
                                ? 'border-orange-500 text-gray-900 font-medium'
                                : 'border-transparent text-gray-600 hover:text-gray-900'
                        }`}
                    >
                        Questions ({activity.posts.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('answers')}
                        className={`px-4 py-3 text-sm border-b-2 ${
                            activeTab === 'answers'
                                ? 'border-orange-500 text-gray-900 font-medium'
                                : 'border-transparent text-gray-600 hover:text-gray-900'
                        }`}
                    >
                        Answers ({activity.comments.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('votes')}
                        className={`px-4 py-3 text-sm border-b-2 ${
                            activeTab === 'votes'
                                ? 'border-orange-500 text-gray-900 font-medium'
                                : 'border-transparent text-gray-600 hover:text-gray-900'
                        }`}
                    >
                        Votes ({activity.votes.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('following')}
                        className={`px-4 py-3 text-sm border-b-2 ${
                            activeTab === 'following'
                                ? 'border-orange-500 text-gray-900 font-medium'
                                : 'border-transparent text-gray-600 hover:text-gray-900'
                        }`}
                    >
                        Following ({activity.follows.length})
                    </button>
                </div>
            </div>

            {/* Tab Content */}
            <div>
                {activeTab === 'profile' && (
                    <div>
                        <h2 className="text-xl font-normal mb-4">About</h2>
                        <p className="text-gray-600">This user hasn't added an about section yet.</p>
                    </div>
                )}

                {activeTab === 'activity' && (
                    <div className="space-y-4">
                        <h2 className="text-xl font-normal mb-4">Recent Activity</h2>
                        {[...activity.posts, ...activity.comments]
                            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                            .slice(0, 20)
                            .map((item, index) => {
                                const postId = item.title ? item._id : item.post?._id;
                                const title = item.title || item.post?.title;
                                if (!postId || !title) return null;

                                return (
                                    <div key={index} className="border-b border-gray-200 pb-4">
                                        <div className="text-sm text-gray-600 mb-1">
                                            {item.title ? 'Asked' : 'Answered'} {getTimeAgo(item.createdAt)}
                                        </div>
                                        <Link
                                            href={`/posts/${postId}`}
                                            className="text-blue-600 hover:text-blue-700 no-underline"
                                        >
                                            {title}
                                        </Link>
                                    </div>
                                );
                            })}
                    </div>
                )}

                {activeTab === 'questions' && (
                    <div className="space-y-4">
                        <h2 className="text-xl font-normal mb-4">{activity.posts.length} Questions</h2>
                        {activity.posts.map((post) => (
                            <div key={post._id} className="border-b border-gray-200 pb-4">
                                <div className="flex gap-2 text-sm text-gray-600 mb-2">
                                    <span className="font-medium">{post.votes || 0} votes</span>
                                    <span>{post.answers || 0} answers</span>
                                    <span>{post.views || 0} views</span>
                                </div>
                                <Link
                                    href={`/posts/${post._id}`}
                                    className="text-blue-600 hover:text-blue-700 text-lg no-underline"
                                >
                                    {post.title}
                                </Link>
                                <div className="text-sm text-gray-600 mt-1">
                                    asked {getTimeAgo(post.createdAt)}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {activeTab === 'answers' && (
                    <div className="space-y-4">
                        <h2 className="text-xl font-normal mb-4">{activity.comments.length} Answers</h2>
                        {activity.comments.map((comment) => {
                            if (!comment.post?._id) return null;

                            return (
                                <div key={comment._id} className="border-b border-gray-200 pb-4">
                                    <Link
                                        href={`/posts/${comment.post._id}`}
                                        className="text-blue-600 hover:text-blue-700 no-underline"
                                    >
                                        {comment.post?.title || 'Untitled'}
                                    </Link>
                                    <div className="text-sm text-gray-700 mt-2 line-clamp-2">
                                        {comment.content.substring(0, 200)}...
                                    </div>
                                    <div className="text-sm text-gray-600 mt-1">
                                        answered {getTimeAgo(comment.createdAt)}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {activeTab === 'votes' && (
                    <div className="space-y-4">
                        <h2 className="text-xl font-normal mb-4">{activity.votes.length} Votes</h2>
                        {activity.votes.map((vote) => {
                            if (!vote.post?._id) return null;

                            return (
                                <div key={vote._id} className="border-b border-gray-200 pb-4">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className={`text-sm font-medium ${vote.voteType === 'up' ? 'text-orange-500' : 'text-blue-500'}`}>
                                            {vote.voteType === 'up' ? '▲ Upvoted' : '▼ Downvoted'}
                                        </span>
                                        <span className="text-sm text-gray-600">{getTimeAgo(vote.createdAt)}</span>
                                    </div>
                                    <Link
                                        href={`/posts/${vote.post._id}`}
                                        className="text-blue-600 hover:text-blue-700 no-underline"
                                    >
                                        {vote.post?.title || 'Untitled'}
                                    </Link>
                                </div>
                            );
                        })}
                    </div>
                )}

                {activeTab === 'following' && (
                    <div className="space-y-4">
                        <h2 className="text-xl font-normal mb-4">{activity.follows.length} Following</h2>
                        {activity.follows.map((follow) => {
                            if (!follow.post?._id) return null;

                            return (
                                <div key={follow._id} className="border-b border-gray-200 pb-4">
                                    <Link
                                        href={`/posts/${follow.post._id}`}
                                        className="text-blue-600 hover:text-blue-700 no-underline"
                                    >
                                        {follow.post?.title || 'Untitled'}
                                    </Link>
                                    <div className="text-sm text-gray-600 mt-1">
                                        following since {getTimeAgo(follow.createdAt)}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}

export default UserProfile;
