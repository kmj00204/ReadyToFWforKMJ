// pages/api/posts/[id]/follow.js
import connectDB from '../../../../lib/connectDB';
import Post from '../../../../lib/models/Post';
import Follow from '../../../../lib/models/Follow';
import { authenticate } from '../../../../lib/auth';

export default async function handler(req, res) {
    await connectDB();

    const { id } = req.query;

    if (req.method === 'POST') {
        const user = await authenticate(req, res);
        if (!user) {
            return res.status(401).json({ message: '로그인이 필요합니다.' });
        }

        try {
            // 기존 팔로우 확인
            const existingFollow = await Follow.findOne({ user: user.id, post: id });

            if (existingFollow) {
                // 이미 팔로우 중이면 언팔로우
                await Follow.deleteOne({ _id: existingFollow._id });
                return res.status(200).json({
                    message: '팔로우가 취소되었습니다.',
                    isFollowing: false
                });
            } else {
                // 새로운 팔로우
                await Follow.create({
                    user: user.id,
                    post: id,
                });
                return res.status(200).json({
                    message: '팔로우되었습니다.',
                    isFollowing: true
                });
            }
        } catch (error) {
            console.error('Follow error:', error);
            return res.status(500).json({ message: '팔로우 처리 중 오류가 발생했습니다.' });
        }
    } else if (req.method === 'GET') {
        // 사용자의 팔로우 상태 조회
        const user = await authenticate(req, res);
        if (!user) {
            return res.status(200).json({ isFollowing: false });
        }

        try {
            const follow = await Follow.findOne({ user: user.id, post: id });
            return res.status(200).json({ isFollowing: !!follow });
        } catch (error) {
            console.error('Get follow error:', error);
            return res.status(500).json({ message: '팔로우 조회 중 오류가 발생했습니다.' });
        }
    } else {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }
}
