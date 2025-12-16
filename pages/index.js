// pages/index.js
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import axios from 'axios';

function PostList() {
    const router = useRouter();
    const { page = 1, tab = 'newest', perPage = 15 } = router.query;
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const limit = parseInt(perPage);

    useEffect(() => {
        async function fetchPosts() {
            setLoading(true);
            setError(null);
            try {
                const res = await axios.get(`/api/posts?page=${page}&limit=${limit}&sort=${tab}`);
                setData(res.data);
            } catch (err) {
                setError('Failed to load questions.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        }
        fetchPosts();
    }, [page, tab, limit]);

    const getTimeAgo = (date) => {
        const now = new Date();
        const postDate = new Date(date);
        const diffInMinutes = Math.floor((now - postDate) / (1000 * 60));

        if (diffInMinutes < 60) return `asked ${diffInMinutes} mins ago`;
        if (diffInMinutes < 1440) return `asked ${Math.floor(diffInMinutes / 60)} hours ago`;
        return `asked ${Math.floor(diffInMinutes / 1440)} days ago`;
    };

    if (loading) return <div className="p-6">Loading...</div>;
    if (error) return <div className="p-6 text-red-600">{error}</div>;

    const { posts, totalPages, currentPage, totalPosts } = data;

    return (
        <div className="max-w-5xl">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-3xl font-normal">Newest Questions</h1>
                <Link
                    href="/posts/new"
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors text-sm font-medium no-underline"
                >
                    Ask Question
                </Link>
            </div>

            {/* Stats and Tabs */}
            <div className="flex items-center justify-between border-b border-gray-300 pb-3 mb-4">
                <div className="text-lg">
                    <span className="font-normal">{totalPosts?.toLocaleString() || '0'} questions</span>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => router.push('/?tab=newest')}
                        className={`px-3 py-1.5 text-sm rounded ${tab === 'newest' ? 'bg-blue-100 text-blue-700 font-medium' : 'bg-white text-gray-700 hover:bg-gray-100'} border border-gray-300`}
                    >
                        Newest
                    </button>
                    <button
                        onClick={() => router.push('/?tab=active')}
                        className={`px-3 py-1.5 text-sm rounded ${tab === 'active' ? 'bg-blue-100 text-blue-700 font-medium' : 'bg-white text-gray-700 hover:bg-gray-100'} border border-gray-300`}
                    >
                        Active
                    </button>
                    <div className="relative">
                        <button className="px-3 py-1.5 text-sm rounded bg-white text-gray-700 hover:bg-gray-100 border border-gray-300 flex items-center gap-1">
                            More
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>
                    </div>
                    <button className="px-3 py-1.5 text-sm rounded bg-white text-gray-700 hover:bg-gray-100 border border-gray-300 flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                        </svg>
                        Filter
                    </button>
                </div>
            </div>

            {/* Questions List */}
            <div className="space-y-0">
                {posts && posts.length > 0 ? posts.map((post, index) => (
                    <div key={post._id} className="border-b border-gray-200 py-4 flex gap-4">
                        {/* Stats Column */}
                        <div className="flex flex-col gap-2 text-sm text-gray-600 w-24 flex-shrink-0">
                            <div className="flex items-center justify-end gap-1">
                                <span className="font-normal">{post.votes || 0}</span>
                                <span className="text-xs">votes</span>
                            </div>
                            <div className={`flex items-center justify-end gap-1 px-2 py-1 rounded ${post.answers > 0 ? 'border-2 border-green-600 bg-green-50' : ''}`}>
                                <span className={`font-normal ${post.answers > 0 ? 'text-green-700 font-semibold' : ''}`}>{post.answers || 0}</span>
                                <span className={`text-xs ${post.answers > 0 ? 'text-green-700' : ''}`}>answers</span>
                            </div>
                            <div className="flex items-center justify-end gap-1">
                                <span className="font-normal">{post.views || 0}</span>
                                <span className="text-xs">views</span>
                            </div>
                        </div>

                        {/* Content Column */}
                        <div className="flex-1 min-w-0">
                            {/* Badge if exists */}

                            {/* Title */}
                            <h3 className="text-blue-600 hover:text-blue-700 mb-2">
                                <Link href={`/posts/${post._id}`} className="no-underline text-blue-600 hover:text-blue-700 font-normal text-xl">
                                    {post.title}
                                </Link>
                            </h3>

                            {/* Excerpt */}
                            <p className="text-sm text-gray-700 mb-2 line-clamp-2">
                                {post.content ? post.content.substring(0, 150) : 'No description available'}...
                            </p>

                            {/* Tags and Author */}
                            <div className="flex items-center justify-between flex-wrap gap-2">
                                <div className="flex flex-wrap gap-1">
                                    {post.tags && post.tags.length > 0 ? post.tags.map((tag, i) => (
                                        <Link
                                            key={i}
                                            href={`/questions/tagged/${tag}`}
                                            className="bg-blue-50 text-blue-800 text-xs px-2 py-1 rounded hover:bg-blue-100 cursor-pointer no-underline"
                                        >
                                            {tag}
                                        </Link>
                                    )) : (
                                        <>
                                            {/* <Link
                                                href="/questions/tagged/javascript"
                                                className="bg-blue-50 text-blue-800 text-xs px-2 py-1 rounded hover:bg-blue-100 cursor-pointer no-underline"
                                            >
                                                javascript
                                            </Link>
                                            <Link
                                                href="/questions/tagged/rest"
                                                className="bg-blue-50 text-blue-800 text-xs px-2 py-1 rounded hover:bg-blue-100 cursor-pointer no-underline"
                                            >
                                                rest
                                            </Link>
                                            <Link
                                                href="/questions/tagged/integration"
                                                className="bg-blue-50 text-blue-800 text-xs px-2 py-1 rounded hover:bg-blue-100 cursor-pointer no-underline"
                                            >
                                                integration
                                            </Link> */}
                                        </>
                                    )}
                                </div>
                                <div className="flex items-center gap-1 text-xs text-gray-600">
                                    <div className="flex items-center gap-1">
                                        <div className="w-4 h-4 bg-gradient-to-br from-orange-400 to-orange-600 rounded"></div>
                                        <Link
                                            href={`/users/${post.author?._id}`}
                                            className="text-blue-600 hover:text-blue-700 cursor-pointer no-underline"
                                        >
                                            {post.author?.username || 'Unknown'}
                                        </Link>
                                    </div>
                                    <span className="font-semibold">{post.author?.reputation || '1'}</span>
                                    <span>{getTimeAgo(post.createdAt)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )) : (
                    <div className="text-center py-8 text-gray-600">No questions found.</div>
                )}
            </div>

            {/* Per Page and Pagination */}
            <div className="mt-6 space-y-4">
                {/* Per Page Selector */}
                <div className="flex justify-end items-center gap-2">
                    <div className="flex gap-1">
                        {[15, 30, 50].map((size) => (
                            <button
                                key={size}
                                onClick={() => router.push(`/?page=1&tab=${tab}&perPage=${size}`)}
                                className={`px-3 py-1.5 text-sm border border-gray-300 rounded ${limit === size
                                    ? 'bg-orange-500 text-white font-medium'
                                    : 'bg-white text-gray-700 hover:bg-gray-100'
                                    }`}
                            >
                                {size}
                            </button>
                        ))}
                    </div>
                    <span className="text-sm text-gray-600">per page</span>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex justify-center gap-1">
                        {currentPage >= 1 && (
                            <button
                                onClick={() => router.push(`/?page=${currentPage - 1}&tab=${tab}&perPage=${limit}`)}
                                className={`px-4 py-2 rounded text-sm border border-gray-300 ${currentPage === 1
                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                    : 'bg-white text-gray-700 hover:bg-gray-100'
                                    }`}
                            >
                                Prev
                            </button>
                        )}

                        {(currentPage !== 1) && (
                        <button
                            onClick={() => router.push(`/?page=1&tab=${tab}&perPage=${limit}`)}
                                className="px-3 py-2 rounded text-sm border border-gray-300 bg-white text-gray-700 hover:bg-gray-100"
                        >
                            1
                        </button>
                        )}
                        {currentPage === 1 && (
                                <button
                                className="px-3 py-2 rounded text-sm border border-gray-300 bg-orange-500 text-white font-medium"
                                >
                                1
                                </button>
                        )}

                        {currentPage > 4 && totalPages > 6 && (
                                <span className="px-2 py-2 rounded text-gray-600">...</span>
                        )}

                        {[...Array(totalPages)].map((_, i) => {
                            const pageNum = i + 1;

                            if (pageNum === 1 || pageNum === totalPages) return null;

                            if (pageNum >= Math.max(2, currentPage - 2) && pageNum <= Math.min(totalPages - 1, currentPage + 2)) {
                            return (
                                <button
                                    key={pageNum}
                                    onClick={() => router.push(`/?page=${pageNum}&tab=${tab}&perPage=${limit}`)}
                                    className={`px-3 py-2 text-sm border border-gray-300 ${currentPage === pageNum
                                        ? 'bg-orange-500 text-white font-medium'
                                        : 'bg-white text-gray-700 hover:bg-gray-100'
                                        }`}
                                >
                                    {pageNum}
                                </button>
                            );
                            }
                            return null;
                        })}

                        {currentPage < totalPages - 3 && totalPages > 6 && (
                            <span className="px-2 py-2 rounded text-gray-600">...</span>
                        )}

                        {(totalPages > 1 && currentPage !== totalPages) && (
                            <button
                                onClick={() => router.push(`/?page=${totalPages}&tab=${tab}&perPage=${limit}`)}
                                className="px-3 py-2 rounded text-sm border border-gray-300 bg-white text-gray-700 hover:bg-gray-100"
                            >
                                {totalPages}
                            </button>
                        )}
                        {currentPage === totalPages && totalPages > 1 && (
                            <button
                                className="px-3 py-2 rounded text-sm border border-gray-300 bg-orange-500 text-white font-medium"
                            >
                                {totalPages}
                            </button>
                        )}

                        <button
                            onClick={() => router.push(`/?page=${Math.min(totalPages, currentPage + 1)}&tab=${tab}&perPage=${limit}`)}
                            disabled={currentPage === totalPages}
                            className={`px-4 py-2 rounded text-sm border border-gray-300 ${currentPage === totalPages
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                : 'bg-white text-gray-700 hover:bg-gray-100'
                                }`}
                        >
                            Next
                        </button>
                    </div>
                )}

            </div>
        </div>
    );
}

export default PostList;