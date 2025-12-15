// pages/api/users/[id]/activity.js
import connectDB from '../../../../lib/connectDB';
import Post from '../../../../lib/models/Post';
import Comment from '../../../../lib/models/Comment';
import Vote from '../../../../lib/models/Vote';
import Follow from '../../../../lib/models/Follow';

export default async function handler(req, res) {
    await connectDB();

    const { id } = req.query;

    if (req.method === 'GET') {
        try {
            // 사용자의 게시물
            const posts = await Post.find({ author: id })
                .sort({ createdAt: -1 })
                .limit(100)
                .populate('author', 'username');

            // 사용자의 댓글
            const comments = await Comment.find({ author: id })
                .sort({ createdAt: -1 })
                .limit(100)
                .populate('author', 'username')
                .populate('post', 'title');

            // 사용자의 투표
            const votes = await Vote.find({ user: id })
                .sort({ createdAt: -1 })
                .limit(100)
                .populate('post', 'title');

            // 사용자가 팔로우한 게시물
            const follows = await Follow.find({ user: id })
                .sort({ createdAt: -1 })
                .limit(100)
                .populate('post', 'title');

            res.status(200).json({
                posts,
                comments,
                votes,
                follows
            });
        } catch (error) {
            console.error('Activity fetch error:', error);
            res.status(500).json({ message: '활동 조회 오류' });
        }
    } else {
        res.status(405).json({ message: 'Method Not Allowed' });
    }
}
