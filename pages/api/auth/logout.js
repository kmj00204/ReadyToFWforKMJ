// pages/api/auth/logout.js
import { serialize } from 'cookie';

export default function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    // 1. 만료된/빈 쿠키 설정
    const cookie = serialize('auth_token', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV !== 'development',
        sameSite: 'strict',
        maxAge: -1, // 즉시 만료
        path: '/',
    });

    // 2. 응답 헤더에 설정
    res.setHeader('Set-Cookie', cookie);

    res.status(200).json({ message: '로그아웃 성공' });
}