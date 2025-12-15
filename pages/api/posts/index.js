// pages/api/posts/index.js
import connectDB from '../../../lib/connectDB';
import Post from '../../../lib/models/Post';
import User from '../../../lib/models/User';
import { authenticate } from '../../../lib/auth';

export default async function handler(req, res) {
    await connectDB();

    switch (req.method) {
        case 'GET':
            // 게시물 목록 조회 (페이징 포함)
            try {
                const page = parseInt(req.query.page) || 1;
                const limit = parseInt(req.query.limit) || 10;
                const skip = (page - 1) * limit;
                const tag = req.query.tag;

                // 태그 필터링 조건
                const filter = tag ? { tags: tag } : {};

                const totalPosts = await Post.countDocuments(filter);

                const posts = await Post.find(filter)
                    .sort({ createdAt: -1 })
                    .skip(skip)
                    .limit(limit)
                    .populate('author', 'username reputation'); // 작성자 이름과 평판 가져오기

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