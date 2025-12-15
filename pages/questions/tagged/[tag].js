// pages/questions/tagged/[tag].js
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import axios from 'axios';

function TaggedQuestions() {
    const router = useRouter();
    const { tag, page = 1, perPage = 15 } = router.query;
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const limit = parseInt(perPage);

    useEffect(() => {
        if (!tag) return;

        async function fetchPosts() {
            setLoading(true);
            setError(null);
            try {
                const res = await axios.get(`/api/posts?page=${page}&limit=${limit}&tag=${tag}`);
                setData(res.data);
            } catch (err) {
                setError('Failed to load questions.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        }
        fetchPosts();
    }, [page, tag, limit]);

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
            <div className="mb-6">
                <h1 className="text-3xl font-normal mb-4">Questions tagged [{tag}]</h1>
                <div className="flex items-center justify-between">
                    <p className="text-gray-700">
                        A tag is a keyword or label that categorizes your question with other, similar questions.
                    </p>
                    <Link
                        href="/posts/new"
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors text-sm font-medium no-underline whitespace-nowrap"
                    >
                        Ask Question
                    </Link>
                </div>
            </div>

            {/* Stats and Tabs */}
            <div className="flex items-center justify-between border-b border-gray-300 pb-3 mb-4">
                <div className="text-lg">
                    <span className="font-normal">{totalPosts?.toLocaleString() || '0'} questions</span>
                </div>
                <div className="flex gap-2">
                    <button className="px-3 py-1.5 text-sm rounded bg-blue-100 text-blue-700 font-medium border border-gray-300">
                        Newest
                    </button>
                    <button className="px-3 py-1.5 text-sm rounded bg-white text-gray-700 hover:bg-gray-100 border border-gray-300">
                        Active
                    </button>
                    <button className="px-3 py-1.5 text-sm rounded bg-white text-gray-700 hover:bg-gray-100 border border-gray-300">
                        Unanswered
                    </button>
                </div>
            </div>

            {/* Questions List */}
            <div className="space-y-0">
                {posts && posts.length > 0 ? posts.map((post) => (
                    <div key={post._id} className="border-b border-gray-200 py-4 flex gap-4">
                        {/* Stats Column */}
                        <div className="flex flex-col gap-2 text-sm text-gray-600 w-24 flex-shrink-0">
                            <div className="flex items-center justify-end gap-1">
                                <span className="font-normal">{post.votes || 0}</span>
                                <span className="text-xs">votes</span>
                            </div>
                            <div className="flex items-center justify-end gap-1">
                                <span className="font-normal">{post.answers || 0}</span>
                                <span className="text-xs">answers</span>
                            </div>
                            <div className="flex items-center justify-end gap-1">
                                <span className="font-normal">{post.views || 0}</span>
                                <span className="text-xs">views</span>
                            </div>
                        </div>

                        {/* Content Column */}
                        <div className="flex-1 min-w-0">
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
                                    {post.tags && post.tags.length > 0 && post.tags.map((postTag, i) => (
                                        <Link
                                            key={i}
                                            href={`/questions/tagged/${postTag}`}
                                            className="bg-blue-50 text-blue-800 text-xs px-2 py-1 rounded hover:bg-blue-100 cursor-pointer no-underline"
                                        >
                                            {postTag}
                                        </Link>
                                    ))}
                                </div>
                                <div className="flex items-center gap-1 text-xs text-gray-600">
                                    <div className="flex items-center gap-1">
                                        <div className="w-4 h-4 bg-gradient-to-br from-orange-400 to-orange-600 rounded"></div>
                                        <span className="text-blue-600 hover:text-blue-700 cursor-pointer">{post.author?.username || 'Qkidd'}</span>
                                    </div>
                                    <span className="font-semibold">{post.reputation || '1'}</span>
                                    <span>{getTimeAgo(post.createdAt)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )) : (
                    <div className="text-center py-8 text-gray-600">
                        No questions found with tag "{tag}".
                    </div>
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
                                onClick={() => router.push(`/questions/tagged/${tag}?page=1&perPage=${size}`)}
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
                        {/* Prev button */}
                        {currentPage > 1 && (
                            <button
                                onClick={() => router.push(`/questions/tagged/${tag}?page=${currentPage - 1}&perPage=${limit}`)}
                                className="px-4 py-2 rounded text-sm bg-white text-gray-700 border border-gray-300 hover:bg-gray-100"
                            >
                                Prev
                            </button>
                        )}

                        {/* Page 1 */}
                        <button
                            onClick={() => router.push(`/questions/tagged/${tag}?page=1&perPage=${limit}`)}
                            className={`px-3 py-2 rounded text-sm border border-gray-300 ${currentPage === 1
                                ? 'bg-orange-500 text-white font-medium'
                                : 'bg-white text-gray-700 hover:bg-gray-100'
                                }`}
                        >
                            1
                        </button>

                        {/* Show page numbers 2-5 */}
                        {currentPage > 5 && (
                            <>
                                <button
                                    onClick={() => router.push(`/questions/tagged/${tag}?page=2&perPage=${limit}`)}
                                    className="px-3 py-2 rounded text-sm bg-white text-gray-700 border border-gray-300 hover:bg-gray-100"
                                >
                                    2
                                </button>
                                <button
                                    onClick={() => router.push(`/questions/tagged/${tag}?page=3&perPage=${limit}`)}
                                    className="px-3 py-2 rounded text-sm bg-white text-gray-700 border border-gray-300 hover:bg-gray-100"
                                >
                                    3
                                </button>
                                <button
                                    onClick={() => router.push(`/questions/tagged/${tag}?page=4&perPage=${limit}`)}
                                    className="px-3 py-2 rounded text-sm bg-white text-gray-700 border border-gray-300 hover:bg-gray-100"
                                >
                                    4
                                </button>
                                <button
                                    onClick={() => router.push(`/questions/tagged/${tag}?page=5&perPage=${limit}`)}
                                    className="px-3 py-2 rounded text-sm bg-white text-gray-700 border border-gray-300 hover:bg-gray-100"
                                >
                                    5
                                </button>
                                <span className="px-2 py-2 rounded text-gray-600">...</span>
                            </>
                        )}

                        {/* Pages 2-5 when currentPage <= 5 */}
                        {currentPage <= 5 && [...Array(Math.min(4, totalPages - 1))].map((_, i) => {
                            const pageNum = i + 2;
                            if (pageNum >= totalPages) return null;
                            return (
                                <button
                                    key={pageNum}
                                    onClick={() => router.push(`/questions/tagged/${tag}?page=${pageNum}&perPage=${limit}`)}
                                    className={`px-3 py-2 text-sm border border-gray-300 ${currentPage === pageNum
                                        ? 'bg-orange-500 text-white font-medium'
                                        : 'bg-white text-gray-700 hover:bg-gray-100'
                                        }`}
                                >
                                    {pageNum}
                                </button>
                            );
                        })}

                        {/* Show current page if > 5 */}
                        {currentPage > 5 && currentPage < totalPages && (
                            <button
                                className="px-3 py-2 text-sm bg-orange-500 text-white font-medium border border-orange-500"
                            >
                                {currentPage}
                            </button>
                        )}

                        {/* Show dots before last page */}
                        {currentPage < totalPages - 1 && totalPages > 5 && (
                            <span className="px-2 py-2 text-gray-600">...</span>
                        )}

                        {/* Last page */}
                        {totalPages > 1 && (
                            <button
                                onClick={() => router.push(`/questions/tagged/${tag}?page=${totalPages}&perPage=${limit}`)}
                                className={`px-3 py-2 rounded text-sm border border-gray-300 ${currentPage === totalPages
                                    ? 'bg-orange-500 text-white font-medium'
                                    : 'bg-white text-gray-700 hover:bg-gray-100'
                                    }`}
                            >
                                {totalPages}
                            </button>
                        )}

                        {/* Next button */}
                        <button
                            onClick={() => router.push(`/questions/tagged/${tag}?page=${Math.min(totalPages, currentPage + 1)}&perPage=${limit}`)}
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

export default TaggedQuestions;
