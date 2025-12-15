// pages/api/auth/signup.js
import connectDB from '../../../lib/connectDB';
import User from '../../../lib/models/User';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    await connectDB();

    try {
        const { email, username, password } = req.body;

        if (!email || !username || !password) {
            return res.status(400).json({ message: '모든 필드를 입력해야 합니다.' });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ message: '이미 존재하는 이메일입니다.' });
        }

        const newUser = await User.create({ email, username, password });

        res.status(201).json({ message: '회원가입이 완료되었습니다.', user: newUser });
    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({ message: '서버 오류가 발생했습니다.' });
    }
}