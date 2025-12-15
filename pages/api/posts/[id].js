// pages/api/posts/[id].js
import connectDB from '../../../lib/connectDB';
import Post from '../../../lib/models/Post';
import Comment from '../../../lib/models/Comment';
import { authenticate } from '../../../lib/auth';

export default async function handler(req, res) {
    await connectDB();
    const { id } = req.query;

    if (req.method === 'GET') {
        try {
            // 1. 게시물 조회 및 조회수 증가
            const post = await Post.findByIdAndUpdate(
                id,
                { $inc: { views: 1 } },
                { new: true } // 업데이트된 문서를 반환
            ).populate('author', 'username reputation');

            if (!post) {
                return res.status(404).json({ message: '게시물을 찾을 수 없습니다.' });
            }

            // 2. 댓글 목록 조회
            const comments = await Comment.find({ post: id })
                .populate('author', 'username reputation')
                .sort({ createdAt: 1 });

            res.status(200).json({ post, comments });
        } catch (error) {
            res.status(500).json({ message: '게시물 조회 오류' });
        }
    } else if (req.method === 'PUT') {
        // 게시물 수정
        const user = await authenticate(req, res);
        if (!user) {
            return res.status(401).json({ message: '로그인이 필요합니다.' });
        }

        try {
            const post = await Post.findById(id);
            if (!post) {
                return res.status(404).json({ message: '게시물을 찾을 수 없습니다.' });
            }

            // 작성자 확인
            if (post.author.toString() !== user.id) {
                return res.status(403).json({ message: '수정 권한이 없습니다.' });
            }

            const { title, content, tags } = req.body;
            post.title = title;
            post.content = content;
            post.tags = tags || [];
            post.updatedAt = Date.now();

            await post.save();

            res.status(200).json({ message: '게시물이 수정되었습니다.', post });
        } catch (error) {
            console.error('Post update error:', error);
            res.status(500).json({ message: '게시물 수정 오류' });
        }
    } else if (req.method === 'DELETE') {
        // 게시물 삭제
        const user = await authenticate(req, res);
        if (!user) {
            return res.status(401).json({ message: '로그인이 필요합니다.' });
        }

        try {
            const post = await Post.findById(id);
            if (!post) {
                return res.status(404).json({ message: '게시물을 찾을 수 없습니다.' });
            }

            // 작성자 확인
            if (post.author.toString() !== user.id) {
                return res.status(403).json({ message: '삭제 권한이 없습니다.' });
            }

            await Post.findByIdAndDelete(id);
            await Comment.deleteMany({ post: id });

            res.status(200).json({ message: '게시물이 삭제되었습니다.' });
        } catch (error) {
            console.error('Post delete error:', error);
            res.status(500).json({ message: '게시물 삭제 오류' });
        }
    } else {
        res.status(405).json({ message: 'Method Not Allowed' });
    }
}