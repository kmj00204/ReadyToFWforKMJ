// pages/posts/[id].js
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import axios from 'axios';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/github.css';

function PostDetail() {
    const router = useRouter();
    const { id } = router.query;
    const [post, setPost] = useState(null);
    const [comments, setComments] = useState([]);
    const [answer, setAnswer] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [user, setUser] = useState(null);
    const [userVote, setUserVote] = useState(null);
    const [votes, setVotes] = useState(0);
    const [isFollowing, setIsFollowing] = useState(false);
    const [copySuccess, setCopySuccess] = useState(false);
    const [commentVotes, setCommentVotes] = useState({}); // { commentId: { votes, userVote } }

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }

        if (id) {
            fetchPostAndComments();
        }
    }, [id]);

    const fetchPostAndComments = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`/api/posts/${id}`);
            setPost(res.data.post);
            setComments(res.data.comments);
            setVotes(res.data.post.votes || 0);

            // 사용자의 투표 상태 가져오기
            try {
                const voteRes = await axios.get(`/api/posts/${id}/vote`);
                setUserVote(voteRes.data.userVote);
            } catch (err) {
                // 로그인하지 않은 경우 무시
            }

            // 사용자의 팔로우 상태 가져오기
            try {
                const followRes = await axios.get(`/api/posts/${id}/follow`);
                setIsFollowing(followRes.data.isFollowing);
            } catch (err) {
                // 로그인하지 않은 경우 무시
            }

            // 댓글 투표 상태 가져오기
            const commentVotesData = {};
            for (const comment of res.data.comments) {
                commentVotesData[comment._id] = {
                    votes: comment.votes || 0,
                    userVote: null
                };

                try {
                    const commentVoteRes = await axios.get(`/api/comments/${comment._id}/vote`);
                    commentVotesData[comment._id].userVote = commentVoteRes.data.userVote;
                } catch (err) {
                    // 로그인하지 않은 경우 무시
                }
            }
            setCommentVotes(commentVotesData);
        } catch (err) {
            setError('Failed to load question.');
        } finally {
            setLoading(false);
        }
    };

    const handleVote = async (type) => {
        if (!user) {
            alert('Please log in to vote.');
            return;
        }

        try {
            const res = await axios.post(`/api/posts/${id}/vote`, { voteType: type });
            setVotes(res.data.votes);
            setUserVote(res.data.userVote);
        } catch (error) {
            alert(`Failed to vote: ${error.response?.data?.message || 'Please try again.'}`);
        }
    };

    const handleFollow = async () => {
        if (!user) {
            alert('Please log in to follow.');
            return;
        }

        try {
            const res = await axios.post(`/api/posts/${id}/follow`);
            setIsFollowing(res.data.isFollowing);
        } catch (error) {
            alert(`Failed to follow: ${error.response?.data?.message || 'Please try again.'}`);
        }
    };

    const handleShare = async () => {
        const url = window.location.href;
        try {
            await navigator.clipboard.writeText(url);
            setCopySuccess(true);
            setTimeout(() => setCopySuccess(false), 2000);
        } catch (err) {
            alert('Failed to copy link to clipboard.');
        }
    };

    const handleEdit = () => {
        router.push(`/posts/${id}/edit`);
    };

    const handleCommentVote = async (commentId, type) => {
        if (!user) {
            alert('Please log in to vote.');
            return;
        }

        try {
            const res = await axios.post(`/api/comments/${commentId}/vote`, { voteType: type });
            setCommentVotes({
                ...commentVotes,
                [commentId]: {
                    votes: res.data.votes,
                    userVote: res.data.userVote
                }
            });
        } catch (error) {
            alert(`Failed to vote: ${error.response?.data?.message || 'Please try again.'}`);
        }
    };

    const handleAnswerSubmit = async (e) => {
        e.preventDefault();
        if (!answer.trim()) return;
        if (!user) {
            alert('Please log in to post an answer.');
            return;
        }

        try {
            const res = await axios.post(`/api/posts/${id}/comments`, { content: answer });
            setComments([...comments, res.data.comment]);
            setAnswer('');
        } catch (error) {
            alert(`Failed to post answer: ${error.response?.data?.message || 'Please check your login status.'}`);
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
    if (error) return <div className="p-6 text-red-600">{error}</div>;
    if (!post) return <div className="p-6">Question not found.</div>;

    return (
        <div className="max-w-5xl">
            {/* Question Header */}
            <div className="mb-4">
                <h1 className="text-3xl font-normal mb-2">{post.title}</h1>
                <div className="flex gap-4 text-sm text-gray-600 pb-3 border-b border-gray-300">
                    <div>Asked <span className="font-normal">{getTimeAgo(post.createdAt)}</span></div>
                    <div>Modified <span className="font-normal">{getTimeAgo(post.updatedAt)}</span></div>
                    <div>Viewed <span className="font-normal">{post.views} times</span></div>
                </div>
            </div>

            <div className="flex gap-4">
                {/* Left: Vote Column */}
                <div className="flex flex-col items-center gap-2 w-16 flex-shrink-0">
                    <button
                        onClick={() => handleVote('up')}
                        className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-colors ${
                            userVote === 'up'
                                ? 'border-orange-500 bg-orange-50'
                                : 'border-gray-400 hover:bg-orange-50'
                        }`}
                    >
                        <svg className={`w-6 h-6 ${userVote === 'up' ? 'text-orange-500' : 'text-gray-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                        </svg>
                    </button>
                    <div className={`text-2xl font-normal ${votes > 0 ? 'text-orange-500' : votes < 0 ? 'text-blue-500' : 'text-gray-700'}`}>
                        {votes}
                    </div>
                    <button
                        onClick={() => handleVote('down')}
                        className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-colors ${
                            userVote === 'down'
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-gray-400 hover:bg-blue-50'
                        }`}
                    >
                        <svg className={`w-6 h-6 ${userVote === 'down' ? 'text-blue-500' : 'text-gray-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>
                    <button className="w-10 h-10 hover:bg-gray-50 flex items-center justify-center">
                        <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                        </svg>
                    </button>
                </div>

                {/* Right: Content */}
                <div className="flex-1">
                    {/* Question Body */}
                    <div className="mb-6">
                        <div className="prose max-w-none text-base leading-relaxed mb-4" style={{ whiteSpace: 'pre-wrap' }}>
                            <ReactMarkdown
                                remarkPlugins={[remarkGfm, remarkBreaks]}
                                rehypePlugins={[rehypeHighlight]}
                                components={{
                                    code({ node, inline, className, children, ...props }) {
                                        return inline ? (
                                            <code className="bg-gray-100 px-1 py-0.5 rounded text-sm" {...props}>
                                                {children}
                                            </code>
                                        ) : (
                                            <code className={className} {...props}>
                                                {children}
                                            </code>
                                        );
                                    },
                                    pre({ children }) {
                                        return (
                                            <pre className="bg-gray-50 p-4 rounded overflow-x-auto border border-gray-200">
                                                {children}
                                            </pre>
                                        );
                                    },
                                    h1({ children }) {
                                        return <h1 className="text-2xl font-bold mt-6 mb-4">{children}</h1>;
                                    },
                                    h2({ children }) {
                                        return <h2 className="text-xl font-bold mt-5 mb-3">{children}</h2>;
                                    },
                                    h3({ children }) {
                                        return <h3 className="text-lg font-bold mt-4 mb-2">{children}</h3>;
                                    },
                                    ul({ children }) {
                                        return <ul className="list-disc list-inside my-2 space-y-1">{children}</ul>;
                                    },
                                    ol({ children }) {
                                        return <ol className="list-decimal list-inside my-2 space-y-1">{children}</ol>;
                                    },
                                    blockquote({ children }) {
                                        return <blockquote className="border-l-4 border-gray-300 pl-4 py-2 my-2 text-gray-700 italic">{children}</blockquote>;
                                    },
                                    a({ href, children }) {
                                        return <a href={href} className="text-blue-600 hover:text-blue-700 underline">{children}</a>;
                                    },
                                    table({ children }) {
                                        return <table className="border-collapse border border-gray-300 my-4">{children}</table>;
                                    },
                                    th({ children }) {
                                        return <th className="border border-gray-300 px-4 py-2 bg-gray-100 font-semibold">{children}</th>;
                                    },
                                    td({ children }) {
                                        return <td className="border border-gray-300 px-4 py-2">{children}</td>;
                                    },
                                }}
                            >
                                {post.content}
                            </ReactMarkdown>
                        </div>

                        {/* Tags */}
                        <div className="flex flex-wrap gap-1 mb-4">
                            {post.tags && post.tags.length > 0 && post.tags.map((tag, i) => (
                                <Link
                                    key={i}
                                    href={`/questions/tagged/${tag}`}
                                    className="bg-blue-50 text-blue-800 text-xs px-2 py-1 rounded hover:bg-blue-100 cursor-pointer no-underline"
                                >
                                    {tag}
                                </Link>
                            ))}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-3 mb-4 items-center">
                            <button
                                onClick={handleShare}
                                className="text-sm text-gray-600 hover:text-blue-600"
                            >
                                {copySuccess ? 'Link copied!' : 'Share'}
                            </button>
                            {user && post.author && user.id === post.author._id && (
                                <button
                                    onClick={handleEdit}
                                    className="text-sm text-gray-600 hover:text-blue-600"
                                >
                                    Edit
                                </button>
                            )}
                            <button
                                onClick={handleFollow}
                                className={`text-sm ${isFollowing ? 'text-blue-600 font-medium' : 'text-gray-600 hover:text-blue-600'}`}
                            >
                                {isFollowing ? 'Following' : 'Follow'}
                            </button>
                        </div>

                        {/* Author Card */}
                        <div className="flex justify-end">
                            <div className="bg-blue-50 rounded p-3 w-52">
                                <div className="text-xs text-gray-600 mb-2">asked {getTimeAgo(post.createdAt)}</div>
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-orange-600 rounded"></div>
                                    <div>
                                        <Link
                                            href={`/users/${post.author?._id}`}
                                            className="text-sm text-blue-600 hover:text-blue-700 cursor-pointer no-underline"
                                        >
                                            {post.author?.username || 'Anonymous'}
                                        </Link>
                                        <div className="text-xs text-gray-600">
                                            <span className="font-semibold">{post.author?.reputation || '1'}</span> reputation
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Answers Section */}
                    <div className="border-t border-gray-300 pt-4">
                        <h2 className="text-xl font-normal mb-4">
                            {comments.length} {comments.length === 1 ? 'Answer' : 'Answers'}
                        </h2>

                        {/* Answer List */}
                        {comments.map((comment, index) => {
                            const commentVoteData = commentVotes[comment._id] || { votes: 0, userVote: null };

                            return (
                                <div key={comment._id} className={`flex gap-4 ${index !== comments.length - 1 ? 'border-b border-gray-200 pb-6 mb-6' : ''}`}>
                                    {/* Vote Column for Answer */}
                                    <div className="flex flex-col items-center gap-2 w-16 flex-shrink-0">
                                        <button
                                            onClick={() => handleCommentVote(comment._id, 'up')}
                                            className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-colors ${
                                                commentVoteData.userVote === 'up'
                                                    ? 'border-orange-500 bg-orange-50'
                                                    : 'border-gray-400 hover:bg-orange-50'
                                            }`}
                                        >
                                            <svg className={`w-6 h-6 ${commentVoteData.userVote === 'up' ? 'text-orange-500' : 'text-gray-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                                            </svg>
                                        </button>
                                        <div className={`text-2xl font-normal ${commentVoteData.votes > 0 ? 'text-orange-500' : commentVoteData.votes < 0 ? 'text-blue-500' : 'text-gray-700'}`}>
                                            {commentVoteData.votes}
                                        </div>
                                        <button
                                            onClick={() => handleCommentVote(comment._id, 'down')}
                                            className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-colors ${
                                                commentVoteData.userVote === 'down'
                                                    ? 'border-blue-500 bg-blue-50'
                                                    : 'border-gray-400 hover:bg-blue-50'
                                            }`}
                                        >
                                            <svg className={`w-6 h-6 ${commentVoteData.userVote === 'down' ? 'text-blue-500' : 'text-gray-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </button>
                                    </div>

                                {/* Answer Content */}
                                <div className="flex-1">
                                    <div className="prose max-w-none text-base leading-relaxed mb-4" style={{ whiteSpace: 'pre-wrap' }}>
                                        <ReactMarkdown
                                            remarkPlugins={[remarkGfm, remarkBreaks]}
                                            rehypePlugins={[rehypeHighlight]}
                                            components={{
                                                code({ node, inline, className, children, ...props }) {
                                                    return inline ? (
                                                        <code className="bg-gray-100 px-1 py-0.5 rounded text-sm" {...props}>
                                                            {children}
                                                        </code>
                                                    ) : (
                                                        <code className={className} {...props}>
                                                            {children}
                                                        </code>
                                                    );
                                                },
                                                pre({ children }) {
                                                    return (
                                                        <pre className="bg-gray-50 p-4 rounded overflow-x-auto border border-gray-200">
                                                            {children}
                                                        </pre>
                                                    );
                                                },
                                                h1({ children }) {
                                                    return <h1 className="text-2xl font-bold mt-6 mb-4">{children}</h1>;
                                                },
                                                h2({ children }) {
                                                    return <h2 className="text-xl font-bold mt-5 mb-3">{children}</h2>;
                                                },
                                                h3({ children }) {
                                                    return <h3 className="text-lg font-bold mt-4 mb-2">{children}</h3>;
                                                },
                                                ul({ children }) {
                                                    return <ul className="list-disc list-inside my-2 space-y-1">{children}</ul>;
                                                },
                                                ol({ children }) {
                                                    return <ol className="list-decimal list-inside my-2 space-y-1">{children}</ol>;
                                                },
                                                blockquote({ children }) {
                                                    return <blockquote className="border-l-4 border-gray-300 pl-4 py-2 my-2 text-gray-700 italic">{children}</blockquote>;
                                                },
                                                a({ href, children }) {
                                                    return <a href={href} className="text-blue-600 hover:text-blue-700 underline">{children}</a>;
                                                },
                                                table({ children }) {
                                                    return <table className="border-collapse border border-gray-300 my-4">{children}</table>;
                                                },
                                                th({ children }) {
                                                    return <th className="border border-gray-300 px-4 py-2 bg-gray-100 font-semibold">{children}</th>;
                                                },
                                                td({ children }) {
                                                    return <td className="border border-gray-300 px-4 py-2">{children}</td>;
                                                },
                                            }}
                                        >
                                            {comment.content}
                                        </ReactMarkdown>
                                    </div>

                                    <div className="flex gap-3 mb-4">
                                        <button
                                            onClick={handleShare}
                                            className="text-sm text-gray-600 hover:text-blue-600"
                                        >
                                            Share
                                        </button>
                                        {user && comment.author && user.id === comment.author._id && (
                                            <button className="text-sm text-gray-600 hover:text-blue-600">
                                                Edit
                                            </button>
                                        )}
                                    </div>

                                    <div className="flex justify-end">
                                        <div className="bg-blue-50 rounded p-3 w-52">
                                            <div className="text-xs text-gray-600 mb-2">answered {getTimeAgo(comment.createdAt)}</div>
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-600 rounded"></div>
                                                <div>
                                                    <Link
                                                        href={`/users/${comment.author?._id}`}
                                                        className="text-sm text-blue-600 hover:text-blue-700 cursor-pointer no-underline"
                                                    >
                                                        {comment.author?.username || 'Anonymous'}
                                                    </Link>
                                                    <div className="text-xs text-gray-600">
                                                        <span className="font-semibold">{comment.author?.reputation || '1'}</span> reputation
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            );
                        })}
                    </div>

                    {/* Your Answer Section */}
                    <div className="mt-8 border-t border-gray-300 pt-6">
                        <h2 className="text-xl font-normal mb-4">Your Answer</h2>

                        <form onSubmit={handleAnswerSubmit}>
                            <textarea
                                value={answer}
                                onChange={(e) => setAnswer(e.target.value)}
                                placeholder={user ? "Write your answer here..." : "Please log in to post an answer"}
                                disabled={!user}
                                rows="12"
                                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical font-mono text-sm mb-4"
                            />

                            <button
                                type="submit"
                                disabled={!user || !answer.trim()}
                                className="bg-blue-600 text-white px-4 py-2.5 rounded hover:bg-blue-700 transition-colors font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
                            >
                                Post Your Answer
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default PostDetail;
