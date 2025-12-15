// pages/api/auth/user/[id].js
import connectDB from '../../../../lib/connectDB';
import User from '../../../../lib/models/User';

export default async function handler(req, res) {
    await connectDB();

    const { id } = req.query;

    if (req.method === 'GET') {
        try {
            const user = await User.findById(id).select('-password');
            if (!user) {
                return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });
            }

            res.status(200).json(user);
        } catch (error) {
            console.error('User fetch error:', error);
            res.status(500).json({ message: '사용자 조회 오류' });
        }
    } else {
        res.status(405).json({ message: 'Method Not Allowed' });
    }
}
