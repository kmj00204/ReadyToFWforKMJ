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
    const [showFilterModal, setShowFilterModal] = useState(false);
    const [showMoreDropdown, setShowMoreDropdown] = useState(false);

    // Filter states
    const [filterOptions, setFilterOptions] = useState({
        noAnswers: false,
        noUpvotedAnswers: false,
        hasBounty: false,
        daysOld: '',
        sortBy: 'newest',
        tagSearch: ''
    });

    // 임시 필터 옵션 (Apply 버튼을 누르기 전까지 사용)
    const [tempFilterOptions, setTempFilterOptions] = useState({
        noAnswers: false,
        noUpvotedAnswers: false,
        hasBounty: false,
        daysOld: '',
        sortBy: 'newest',
        tagSearch: ''
    });

    const limit = parseInt(perPage);

    // 루트(/) 또는 탭 변경 시 필터 초기화
    useEffect(() => {
        const defaultFilter = {
            noAnswers: false,
            noUpvotedAnswers: false,
            hasBounty: false,
            daysOld: '',
            sortBy: 'newest',
            tagSearch: ''
        };

        setFilterOptions(defaultFilter);
        setTempFilterOptions(defaultFilter);
    }, [tab, page]);

    useEffect(() => {
        async function fetchPosts() {
            setLoading(true);
            setError(null);
            try {
                // 필터 파라미터 구성
                const params = new URLSearchParams({
                    page: page.toString(),
                    limit: limit.toString(),
                    sort: filterOptions.sortBy || 'newest',
                    tab: tab || 'newest' // 탭 정보 추가
                });

                // 필터 옵션 추가
                if (filterOptions.noAnswers) params.append('noAnswers', 'true');
                if (filterOptions.noUpvotedAnswers) params.append('noUpvotedAnswers', 'true');
                if (filterOptions.hasBounty) params.append('hasBounty', 'true');
                if (filterOptions.daysOld) params.append('daysOld', filterOptions.daysOld);
                if (filterOptions.tagSearch) params.append('tagSearch', filterOptions.tagSearch);

                const res = await axios.get(`/api/posts?${params.toString()}`);
                setData(res.data);
            } catch (err) {
                setError('Failed to load questions.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        }
        fetchPosts();
    }, [page, tab, limit, filterOptions]);

    const getTimeAgo = (date) => {
        const now = new Date();
        const postDate = new Date(date);
        const diffInMinutes = Math.floor((now - postDate) / (1000 * 60));

        if (diffInMinutes < 60) return `asked ${diffInMinutes} mins ago`;
        if (diffInMinutes < 1440) return `asked ${Math.floor(diffInMinutes / 60)} hours ago`;
        return `asked ${Math.floor(diffInMinutes / 1440)} days ago`;
    };

    const handleFilterChange = (field, value) => {
        setTempFilterOptions(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const applyFilter = () => {
        // 임시 필터를 실제 필터에 적용
        setFilterOptions(tempFilterOptions);
        setShowFilterModal(false);
    };

    const cancelFilter = () => {
        // 임시 필터를 현재 적용된 필터로 되돌림
        setTempFilterOptions(filterOptions);
        setShowFilterModal(false);
    };

    const toggleFilterModal = () => {
        if (showFilterModal) {
            // 패널이 열려있으면 닫기 (취소)
            cancelFilter();
        } else {
            // 패널이 닫혀있으면 열기
            setShowFilterModal(true);
        }
    };

    if (loading) return <div className="p-6">Loading...</div>;
    if (error) return <div className="p-6 text-red-600">{error}</div>;

    const { posts, totalPages, currentPage, totalPosts } = data;

    // 탭에 따른 제목 결정
    const getTitle = () => {
        switch (tab) {
            case 'active':
                return 'Active Questions';
            case 'bountied':
                return 'Bountied Questions';
            case 'unanswered':
                return 'Unanswered Questions';
            case 'frequent':
                return 'Frequent Questions';
            case 'score':
                return 'Highest Scored Questions';
            case 'trending':
                return 'Trending Questions';
            case 'week':
                return 'This Week\'s Questions';
            case 'month':
                return 'This Month\'s Questions';
            case 'newest':
            default:
                return 'Newest Questions';
        }
    };

    return (
        <div className="max-w-5xl">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-3xl font-normal">{getTitle()}</h1>
                <Link
                    href="/posts/new"
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors text-sm font-medium no-underline"
                >
                    Ask Question
                </Link>
            </div>

            {/* Stats and Tabs */}
            <div className="flex items-center justify-between mb-4">
                <div className="text-lg">
                    <span className="font-normal">{totalPosts?.toLocaleString() || '0'} questions</span>
                </div>

                <div className="flex gap-2">
                    {/* Tab Bar - 절반 크기 */}
                    <div className="border border-gray-300 rounded">
                        <div className="flex">
                            <button
                                onClick={() => router.push('/?tab=newest')}
                                className={`flex-1 px-2 py-1.5 text-sm ${tab === 'newest' || !tab ? 'bg-gray-100 font-medium' : 'bg-white text-gray-700 hover:bg-gray-50'} border-r border-gray-300`}
                            >
                                Newest
                            </button>
                            <button
                                onClick={() => router.push('/?tab=active')}
                                className={`flex-1 px-2 py-1.5 text-sm ${tab === 'active' ? 'bg-gray-100 font-medium' : 'bg-white text-gray-700 hover:bg-gray-50'} border-r border-gray-300`}
                            >
                                Active
                            </button>
                            <button
                                onClick={() => router.push('/?tab=bountied')}
                                className={`flex-1 px-2 py-1.5 text-sm ${tab === 'bountied' ? 'bg-gray-100 font-medium' : 'bg-white text-gray-700 hover:bg-gray-50'} border-r border-gray-300 flex items-center justify-center gap-1`}
                            >
                                <span>Bountied</span>
                                <span className="bg-blue-600 text-white text-xs px-1.5 py-0.5 rounded font-semibold">0</span>
                            </button>
                            <button
                                onClick={() => router.push('/?tab=unanswered')}
                                className={`flex-1 px-2 py-1.5 text-sm ${tab === 'unanswered' ? 'bg-gray-100 font-medium' : 'bg-white text-gray-700 hover:bg-gray-50'} border-r border-gray-300`}
                            >
                                Unanswered
                            </button>

                            {/* More 드롭다운 */}
                            <div className="flex-1 relative">
                                <button
                                    onClick={() => setShowMoreDropdown(!showMoreDropdown)}
                                    className={`w-full px-2 py-1.5 text-sm ${['frequent', 'score', 'trending', 'week', 'month'].includes(tab) ? 'bg-gray-100 font-medium' : 'bg-white text-gray-700 hover:bg-gray-50'} flex items-center justify-center gap-1`}
                                >
                                    More
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>

                                {/* More 드롭다운 메뉴 */}
                                {showMoreDropdown && (
                                    <div className="absolute top-full right-0 mt-1 bg-white border border-gray-300 rounded shadow-lg z-10 min-w-[160px]">
                                        <button
                                            onClick={() => {
                                                router.push('/?tab=frequent');
                                                setShowMoreDropdown(false);
                                            }}
                                            className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${tab === 'frequent' ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700'}`}
                                        >
                                            Frequent
                                        </button>
                                        <button
                                            onClick={() => {
                                                router.push('/?tab=score');
                                                setShowMoreDropdown(false);
                                            }}
                                            className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${tab === 'score' ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700'}`}
                                        >
                                            Score
                                        </button>
                                        <button
                                            onClick={() => {
                                                router.push('/?tab=trending');
                                                setShowMoreDropdown(false);
                                            }}
                                            className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${tab === 'trending' ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700'}`}
                                        >
                                            Trending
                                        </button>
                                        <button
                                            onClick={() => {
                                                router.push('/?tab=week');
                                                setShowMoreDropdown(false);
                                            }}
                                            className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${tab === 'week' ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700'}`}
                                        >
                                            Week
                                        </button>
                                        <button
                                            onClick={() => {
                                                router.push('/?tab=month');
                                                setShowMoreDropdown(false);
                                            }}
                                            className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${tab === 'month' ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700'}`}
                                        >
                                            Month
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Filter 버튼 */}
                    <button
                        onClick={toggleFilterModal}
                        className={`px-3 py-1.5 text-sm rounded text-gray-700 border border-gray-300 flex items-center gap-1 ${showFilterModal ? 'bg-blue-500 text-white' : 'bg-white hover:bg-gray-100'}`}
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                        </svg>
                        Filter
                    </button>
                </div>
            </div>

            {/* Filter Panel */}
            {showFilterModal && (
                <div className="bg-gray-50 border border-gray-300 rounded mb-4 overflow-hidden transition-all duration-300">
                    <div className="bg-white px-6 py-4 border-b border-gray-200">
                        <h2 className="text-lg font-semibold">Filter by</h2>
                    </div>

                    <div className="px-6 py-6 bg-gray-50">
                        <div className="grid grid-cols-3 gap-8">
                            {/* Filter by Column */}
                            <div className="bg-white p-4 rounded border border-gray-200">
                                <h3 className="font-semibold text-sm mb-3 text-gray-700">Filter by</h3>
                                <div className="space-y-2">
                                    <label className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                                        <input
                                            type="checkbox"
                                            checked={tempFilterOptions.noAnswers}
                                            onChange={(e) => handleFilterChange('noAnswers', e.target.checked)}
                                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                        />
                                        <span className="text-sm">No answers</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                                        <input
                                            type="checkbox"
                                            checked={tempFilterOptions.noUpvotedAnswers}
                                            onChange={(e) => handleFilterChange('noUpvotedAnswers', e.target.checked)}
                                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                        />
                                        <span className="text-sm">No upvoted or accepted answers</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                                        <input
                                            type="checkbox"
                                            checked={tempFilterOptions.hasBounty}
                                            onChange={(e) => handleFilterChange('hasBounty', e.target.checked)}
                                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                        />
                                        <span className="text-sm">Has bounty</span>
                                    </label>
                                    <div className="flex items-center gap-2 p-1">
                                        <input
                                            type="number"
                                            placeholder=""
                                            value={tempFilterOptions.daysOld}
                                            onChange={(e) => handleFilterChange('daysOld', e.target.value)}
                                            className="w-16 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                        <span className="text-sm">Days old</span>
                                    </div>
                                </div>
                            </div>

                            {/* Sorted by Column */}
                            <div className="bg-white p-4 rounded border border-gray-200">
                                <h3 className="font-semibold text-sm mb-3 text-gray-700">Sorted by</h3>
                                <div className="space-y-2">
                                    <label className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                                        <input
                                            type="radio"
                                            name="sortBy"
                                            value="newest"
                                            checked={tempFilterOptions.sortBy === 'newest'}
                                            onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                                            className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                                        />
                                        <span className="text-sm">Newest</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                                        <input
                                            type="radio"
                                            name="sortBy"
                                            value="recent"
                                            checked={tempFilterOptions.sortBy === 'recent'}
                                            onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                                            className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                                        />
                                        <span className="text-sm">Recent activity</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                                        <input
                                            type="radio"
                                            name="sortBy"
                                            value="highest"
                                            checked={tempFilterOptions.sortBy === 'highest'}
                                            onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                                            className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                                        />
                                        <span className="text-sm">Highest score</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                                        <input
                                            type="radio"
                                            name="sortBy"
                                            value="frequent"
                                            checked={tempFilterOptions.sortBy === 'frequent'}
                                            onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                                            className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                                        />
                                        <span className="text-sm">Most frequent</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                                        <input
                                            type="radio"
                                            name="sortBy"
                                            value="bounty"
                                            checked={tempFilterOptions.sortBy === 'bounty'}
                                            onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                                            className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                                        />
                                        <span className="text-sm">Bounty ending soon</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                                        <input
                                            type="radio"
                                            name="sortBy"
                                            value="trending"
                                            checked={tempFilterOptions.sortBy === 'trending'}
                                            onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                                            className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                                        />
                                        <span className="text-sm">Trending</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                                        <input
                                            type="radio"
                                            name="sortBy"
                                            value="activity"
                                            checked={tempFilterOptions.sortBy === 'activity'}
                                            onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                                            className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                                        />
                                        <span className="text-sm">Most activity</span>
                                    </label>
                                </div>
                            </div>

                            {/* Tagged with Column */}
                            <div className="bg-white p-4 rounded border border-gray-200">
                                <h3 className="font-semibold text-sm mb-3 text-gray-700">Tagged with</h3>
                                <div className="space-y-2">
                                    <label className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                                        <input
                                            type="radio"
                                            name="tagOption"
                                            value="watched"
                                            className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                                        />
                                        <span className="text-sm">My watched tags</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                                        <input
                                            type="radio"
                                            name="tagOption"
                                            value="following"
                                            defaultChecked
                                            className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                                        />
                                        <span className="text-sm">The following tags:</span>
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="e.g. javascript or python"
                                        value={tempFilterOptions.tagSearch}
                                        onChange={(e) => handleFilterChange('tagSearch', e.target.value)}
                                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer Buttons */}
                    <div className="px-6 py-2 border-t border-gray-200 flex items-center justify-between">
                        <button
                            onClick={applyFilter}
                            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors text-sm font-medium"
                        >
                            Apply filter
                        </button>
                        <button
                            onClick={cancelFilter}
                            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}
            <hr></hr>
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