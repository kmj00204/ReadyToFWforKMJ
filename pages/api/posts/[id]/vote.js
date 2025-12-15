// pages/api/posts/[id]/vote.js
import connectDB from '../../../../lib/connectDB';
import Post from '../../../../lib/models/Post';
import Vote from '../../../../lib/models/Vote';
import User from '../../../../lib/models/User';
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
            const { voteType } = req.body; // 'up' or 'down'

            if (!['up', 'down'].includes(voteType)) {
                return res.status(400).json({ message: '잘못된 투표 타입입니다.' });
            }

            // 기존 투표 확인
            const existingVote = await Vote.findOne({ user: user.id, post: id });

            // 게시물 정보 가져오기 (작성자 확인용)
            const post = await Post.findById(id);
            if (!post) {
                return res.status(404).json({ message: '게시물을 찾을 수 없습니다.' });
            }

            if (existingVote) {
                // 같은 타입의 투표를 다시 누르면 투표 취소
                if (existingVote.voteType === voteType) {
                    await Vote.deleteOne({ _id: existingVote._id });

                    // Post의 votes 업데이트
                    const postUpdateValue = voteType === 'up' ? -1 : 1;
                    await Post.findByIdAndUpdate(id, { $inc: { votes: postUpdateValue } });

                    // 작성자의 reputation 업데이트 (upvote 취소: -5, downvote 취소: +2)
                    const reputationChange = voteType === 'up' ? -5 : 2;
                    await User.findByIdAndUpdate(post.author, { $inc: { reputation: reputationChange } });

                    const updatedPost = await Post.findById(id);
                    return res.status(200).json({
                        message: '투표가 취소되었습니다.',
                        votes: updatedPost.votes,
                        userVote: null
                    });
                } else {
                    // 다른 타입의 투표로 변경
                    existingVote.voteType = voteType;
                    await existingVote.save();

                    // Post의 votes 업데이트 (기존 투표 취소 + 새 투표)
                    const postUpdateValue = voteType === 'up' ? 2 : -2;
                    await Post.findByIdAndUpdate(id, { $inc: { votes: postUpdateValue } });

                    // 작성자의 reputation 업데이트 (up->down: -7, down->up: +7)
                    const reputationChange = voteType === 'up' ? 7 : -7;
                    await User.findByIdAndUpdate(post.author, { $inc: { reputation: reputationChange } });

                    const updatedPost = await Post.findById(id);
                    return res.status(200).json({
                        message: '투표가 변경되었습니다.',
                        votes: updatedPost.votes,
                        userVote: voteType
                    });
                }
            } else {
                // 새로운 투표
                await Vote.create({
                    user: user.id,
                    post: id,
                    voteType,
                });

                // Post의 votes 업데이트
                const postUpdateValue = voteType === 'up' ? 1 : -1;
                await Post.findByIdAndUpdate(id, { $inc: { votes: postUpdateValue } });

                // 작성자의 reputation 업데이트 (upvote: +5, downvote: -2)
                const reputationChange = voteType === 'up' ? 5 : -2;
                await User.findByIdAndUpdate(post.author, { $inc: { reputation: reputationChange } });

                const updatedPost = await Post.findById(id);
                return res.status(200).json({
                    message: '투표가 등록되었습니다.',
                    votes: updatedPost.votes,
                    userVote: voteType
                });
            }
        } catch (error) {
            console.error('Vote error:', error);
            return res.status(500).json({ message: '투표 처리 중 오류가 발생했습니다.' });
        }
    } else if (req.method === 'GET') {
        // 사용자의 투표 상태 조회
        const user = await authenticate(req, res);
        if (!user) {
            return res.status(200).json({ userVote: null });
        }

        try {
            const vote = await Vote.findOne({ user: user.id, post: id });
            return res.status(200).json({ userVote: vote ? vote.voteType : null });
        } catch (error) {
            console.error('Get vote error:', error);
            return res.status(500).json({ message: '투표 조회 중 오류가 발생했습니다.' });
        }
    } else {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }
}
