// pages/api/posts/index.js
import connectDB from '../../../lib/connectDB';
import Post from '../../../lib/models/Post';
import User from '../../../lib/models/User';
import { authenticate } from '../../../lib/auth';

export default async function handler(req, res) {
    await connectDB();

    switch (req.method) {
        case 'GET':
            // 게시물 목록 조회 (페이징 및 필터링 포함)
            try {
                const page = parseInt(req.query.page) || 1;
                const limit = parseInt(req.query.limit) || 10;
                const skip = (page - 1) * limit;
                const tag = req.query.tag;
                const sortBy = req.query.sort || 'newest';
                const tab = req.query.tab || 'newest'; // 탭 파라미터 추가

                // 필터 옵션
                const noAnswers = req.query.noAnswers === 'true';
                const noUpvotedAnswers = req.query.noUpvotedAnswers === 'true';
                const hasBounty = req.query.hasBounty === 'true';
                const daysOld = parseInt(req.query.daysOld) || 0;
                const tagSearch = req.query.tagSearch || '';

                // 필터링 조건 구성
                const filter = {};

                // 탭에 따른 기본 필터 적용
                if (tab === 'unanswered') {
                    filter.answers = 0;
                } else if (tab === 'bountied') {
                    filter.bounty = { $exists: true, $gt: 0 };
                } else if (tab === 'week') {
                    // 지난 7일간의 게시물
                    const weekAgo = new Date();
                    weekAgo.setDate(weekAgo.getDate() - 7);
                    filter.createdAt = { $gte: weekAgo };
                } else if (tab === 'month') {
                    // 지난 30일간의 게시물
                    const monthAgo = new Date();
                    monthAgo.setDate(monthAgo.getDate() - 30);
                    filter.createdAt = { $gte: monthAgo };
                }

                // 태그 필터
                if (tag) {
                    filter.tags = tag;
                }

                // 태그 검색 (여러 태그 OR 검색)
                if (tagSearch) {
                    const searchTags = tagSearch.split(/\s+or\s+|\s+/).filter(t => t.trim());
                    if (searchTags.length > 0) {
                        filter.tags = { $in: searchTags };
                    }
                }

                // No answers 필터
                if (noAnswers) {
                    filter.answers = 0;
                }

                // No upvoted or accepted answers 필터
                if (noUpvotedAnswers) {
                    filter.$or = [
                        { answers: 0 },
                        { votes: { $lte: 0 } }
                    ];
                }

                // Has bounty 필터 (bounty 필드가 있다고 가정)
                if (hasBounty) {
                    filter.bounty = { $exists: true, $gt: 0 };
                }

                // Days old 필터
                if (daysOld > 0) {
                    const dateLimit = new Date();
                    dateLimit.setDate(dateLimit.getDate() - daysOld);
                    filter.createdAt = { $gte: dateLimit };
                }

                // 정렬 옵션
                let sortOption = {};
                // 탭에 따른 기본 정렬 설정
                if (tab === 'active') {
                    sortOption = { updatedAt: -1 };
                } else if (tab === 'frequent') {
                    sortOption = { views: -1 };
                } else if (tab === 'score') {
                    sortOption = { votes: -1 };
                } else if (tab === 'trending') {
                    sortOption = { views: -1, createdAt: -1 };
                } else if (tab === 'week' || tab === 'month') {
                    sortOption = { createdAt: -1 };
                } else {
                    switch (sortBy) {
                        case 'newest':
                            sortOption = { createdAt: -1 };
                            break;
                        case 'recent':
                        case 'activity':
                            sortOption = { updatedAt: -1 };
                            break;
                        case 'highest':
                            sortOption = { votes: -1 };
                            break;
                        case 'frequent':
                            sortOption = { views: -1 };
                            break;
                        case 'trending':
                            // 최근 일주일 내 조회수가 많은 순
                            sortOption = { views: -1, createdAt: -1 };
                            break;
                        default:
                            sortOption = { createdAt: -1 };
                    }
                }

                const totalPosts = await Post.countDocuments(filter);

                const posts = await Post.find(filter)
                    .sort(sortOption)
                    .skip(skip)
                    .limit(limit)
                    .populate('author', 'username reputation');

                res.status(200).json({
                    posts,
                    currentPage: page,
                    totalPages: Math.ceil(totalPosts / limit),
                    totalPosts,
                });
            } catch (error) {
                console.error("api error: ", error);
                res.status(500).json({ message: '게시물 목록 조회 오류' });
            }
            break;

        case 'POST':
            // 게시물 작성
            const user = await authenticate(req, res);
            if (!user) {
                return res.status(401).json({ message: '로그인이 필요합니다.' });
            }

            try {
                const { title, content, tags } = req.body;
                if (!title || !content) {
                    return res.status(400).json({ message: '제목과 내용을 입력하세요.' });
                }

                const newPost = await Post.create({
                    title,
                    content,
                    tags: tags || [],
                    author: user.id,
                });

                res.status(201).json({ message: '게시물 작성 성공', post: newPost });
            } catch (error) {
                console.error('Post creation error:', error);
                res.status(500).json({ message: '게시물 작성 오류' });
            }
            break;

        default:
            res.status(405).json({ message: 'Method Not Allowed' });
            break;
    }
}