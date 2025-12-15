// pages/api/posts/[id]/comments.js
import connectDB from '../../../../lib/connectDB';
import Comment from '../../../../lib/models/Comment';
import Post from '../../../../lib/models/Post';
import { authenticate } from '../../../../lib/auth';

export default async function handler(req, res) {
    await connectDB();
    const { id } = req.query; // post ID

    if (req.method === 'POST') {
        const user = await authenticate(req, res);
        if (!user) {
            return res.status(401).json({ message: '로그인이 필요합니다.' });
        }

        try {
            const { content } = req.body;
            if (!content) {
                return res.status(400).json({ message: '댓글 내용을 입력하세요.' });
            }

            const newComment = await Comment.create({
                content,
                author: user.id,
                post: id,
            });

            // Post의 answers 카운트 증가
            await Post.findByIdAndUpdate(id, { $inc: { answers: 1 } });

            // 작성자 이름 정보까지 populate하여 반환
            const populatedComment = await Comment.findById(newComment._id).populate('author', 'username');

            res.status(201).json({ message: '댓글 작성 성공', comment: populatedComment });
        } catch (error) {
            res.status(500).json({ message: '댓글 작성 오류' });
        }
    } else {
        res.status(405).json({ message: 'Method Not Allowed' });
    }
}