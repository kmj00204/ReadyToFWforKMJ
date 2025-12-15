// pages/search.js
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import axios from 'axios';

export default function Search() {
    const router = useRouter();
    const { q } = router.query; // URL 쿼리에서 검색어 가져오기
    const [searchResults, setSearchResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        if (q) {
            setSearchQuery(q);
            performSearch(q);
        }
    }, [q]);

    const performSearch = async (query) => {
        if (!query.trim()) return;

        setLoading(true);
        setError(null);

        try {
            // API 엔드포인트를 실제 검색 API로 변경하세요
            const response = await axios.get(`/api/posts/search?q=${encodeURIComponent(query)}`);
            setSearchResults(response.data);
        } catch (err) {
            console.error('검색 오류:', err);
            setError('검색 중 오류가 발생했습니다.');
            setSearchResults([]);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
        }
    };

    const highlightText = (text, query) => {
        if (!query) return text;
        const parts = text.split(new RegExp(`(${query})`, 'gi'));
        return parts.map((part, index) =>
            part.toLowerCase() === query.toLowerCase() ? (
                <mark key={index} className="bg-yellow-200 px-1 rounded">
                    {part}
                </mark>
            ) : (
                part
            )
        );
    };

    return (
        <div className="max-w-4xl mx-auto">
            {/* 검색 입력 영역 */}
            <div className="mb-8">
                <form onSubmit={handleSearch} className="flex gap-2">
                    <input
                        type="text"
                        placeholder="검색어를 입력하세요..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
                    />
                    <button
                        type="submit"
                        className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
                    >
                        검색
                    </button>
                </form>
            </div>

            {/* 검색 결과 헤더 */}
            {q && (
                <div className="mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">
                        "{q}" 검색 결과
                    </h2>
                    {!loading && (
                        <p className="text-gray-600 mt-2">
                            총 {searchResults.length}개의 결과를 찾았습니다.
                        </p>
                    )}
                </div>
            )}

            {/* 로딩 상태 */}
            {loading && (
                <div className="text-center py-12">
                    <div className="inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="mt-4 text-gray-600">검색 중...</p>
                </div>
            )}

            {/* 에러 상태 */}
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                    <p className="text-red-700">{error}</p>
                </div>
            )}

            {/* 검색 결과 없음 */}
            {!loading && !error && q && searchResults.length === 0 && (
                <div className="text-center py-12">
                    <svg
                        className="mx-auto h-12 w-12 text-gray-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                    </svg>
                    <h3 className="mt-4 text-lg font-medium text-gray-900">
                        검색 결과가 없습니다
                    </h3>
                    <p className="mt-2 text-gray-600">
                        다른 검색어로 다시 시도해보세요.
                    </p>
                </div>
            )}

            {/* 검색 결과 목록 */}
            {!loading && !error && searchResults.length > 0 && (
                <div className="space-y-4">
                    {searchResults.map((post) => (
                        <Link
                            key={post.id}
                            href={`/posts/${post.id}`}
                            className="block bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md hover:border-blue-300 transition-all"
                        >
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                {highlightText(post.title, q)}
                            </h3>
                            <p className="text-gray-600 mb-3 line-clamp-2">
                                {highlightText(post.content, q)}
                            </p>
                            <div className="flex items-center text-sm text-gray-500 space-x-4">
                                <span className="flex items-center">
                                    <svg
                                        className="w-4 h-4 mr-1"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                        />
                                    </svg>
                                    {post.author}
                                </span>
                                <span className="flex items-center">
                                    <svg
                                        className="w-4 h-4 mr-1"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                        />
                                    </svg>
                                    {new Date(post.createdAt).toLocaleDateString('ko-KR')}
                                </span>
                                {post.views && (
                                    <span className="flex items-center">
                                        <svg
                                            className="w-4 h-4 mr-1"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                            />
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                            />
                                        </svg>
                                        {post.views}
                                    </span>
                                )}
                            </div>
                        </Link>
                    ))}
                </div>
            )}

            {/* 검색 전 상태 */}
            {!q && !loading && (
                <div className="text-center py-12">
                    <svg
                        className="mx-auto h-12 w-12 text-gray-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                    </svg>
                    <h3 className="mt-4 text-lg font-medium text-gray-900">
                        검색어를 입력하세요
                    </h3>
                    <p className="mt-2 text-gray-600">
                        게시글 제목과 내용에서 검색합니다.
                    </p>
                </div>
            )}
        </div>
    );
}