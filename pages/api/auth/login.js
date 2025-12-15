// pages/api/auth/login.js
import connectDB from '../../../lib/connectDB';
import User from '../../../lib/models/User';
import { createJWT, setCookie } from '../../../lib/auth';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    await connectDB();

    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: '이메일 또는 비밀번호가 올바르지 않습니다.' });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: '이메일 또는 비밀번호가 올바르지 않습니다.' });
        }

        // 1. JWT 토큰 생성
        const token = createJWT(user);

        // 2. HTTP-only 쿠키에 토큰 설정
        setCookie(res, token);

        res.status(200).json({ message: '로그인 성공', user: { id: user._id, username: user.username, email: user.email } });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: '서버 오류가 발생했습니다.' });
    }
}