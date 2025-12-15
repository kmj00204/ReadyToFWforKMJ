// pages/api/users/[id]/update.js
import connectDB from '../../../../lib/connectDB';
import User from '../../../../lib/models/User';
import { authenticate } from '../../../../lib/auth';
import bcrypt from 'bcryptjs';

export default async function handler(req, res) {
    await connectDB();

    const { id } = req.query;

    if (req.method === 'PUT') {
        const user = await authenticate(req, res);
        if (!user) {
            return res.status(401).json({ message: '로그인이 필요합니다.' });
        }

        // 본인만 수정 가능
        if (user.id !== id) {
            return res.status(403).json({ message: '수정 권한이 없습니다.' });
        }

        try {
            const { username, email, currentPassword, newPassword } = req.body;

            const userDoc = await User.findById(id);
            if (!userDoc) {
                return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });
            }

            // 이름 변경
            if (username && username !== userDoc.username) {
                // 중복 확인
                const existingUser = await User.findOne({ username });
                if (existingUser) {
                    return res.status(400).json({ message: '이미 사용 중인 사용자명입니다.' });
                }
                userDoc.username = username;
            }

            // 이메일 변경
            if (email && email !== userDoc.email) {
                // 중복 확인
                const existingEmail = await User.findOne({ email });
                if (existingEmail) {
                    return res.status(400).json({ message: '이미 사용 중인 이메일입니다.' });
                }
                userDoc.email = email;
            }

            // 비밀번호 변경
            if (newPassword) {
                if (!currentPassword) {
                    return res.status(400).json({ message: '현재 비밀번호를 입력하세요.' });
                }

                // 현재 비밀번호 확인
                const isMatch = await bcrypt.compare(currentPassword, userDoc.password);
                if (!isMatch) {
                    return res.status(400).json({ message: '현재 비밀번호가 일치하지 않습니다.' });
                }

                // 새 비밀번호 해싱
                const salt = await bcrypt.genSalt(10);
                userDoc.password = await bcrypt.hash(newPassword, salt);
            }

            await userDoc.save();

            res.status(200).json({
                message: '회원정보가 수정되었습니다.',
                user: {
                    id: userDoc._id,
                    username: userDoc.username,
                    email: userDoc.email
                }
            });
        } catch (error) {
            console.error('User update error:', error);
            res.status(500).json({ message: '회원정보 수정 오류' });
        }
    } else {
        res.status(405).json({ message: 'Method Not Allowed' });
    }
}
