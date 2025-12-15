// lib/auth.js
import jwt from 'jsonwebtoken';
import { serialize } from 'cookie';

const JWT_SECRET = process.env.JWT_SECRET;

// JWT 생성 (로그인 시 사용)
export function createJWT(user) {
    const token = jwt.sign(
        { id: user._id, email: user.email, username: user.username },
        JWT_SECRET,
        { expiresIn: '1d' } // 유효기간 1일
    );
    return token;
}

// JWT 쿠키 설정 (응답 헤더에 추가)
export function setCookie(res, token) {
    const cookie = serialize('auth_token', token, {
        httpOnly: true, // 클라이언트 측 JavaScript 접근 방지
        secure: process.env.NODE_ENV !== 'development', // HTTPS에서만 전송
        sameSite: 'strict',
        maxAge: 60 * 60 * 24 * 7, // 7일
        path: '/',
    });

    res.setHeader('Set-Cookie', cookie);
}

// JWT 검증 (API 요청 시 인증 미들웨어로 사용)
export async function authenticate(req, res) {
    const token = req.cookies.auth_token;

    if (!token) {
        return null;
    }

    try {
        const user = jwt.verify(token, JWT_SECRET);
        return user; // 검증된 사용자 정보 반환
    } catch (error) {
        console.error('JWT verification error:', error);
        return null;
    }
}