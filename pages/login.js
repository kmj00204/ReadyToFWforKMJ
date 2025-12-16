// pages/login.js
import { useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await axios.post('/api/auth/login', { email, password });

            // 사용자 정보를 로컬 스토리지에 저장 (프론트엔드 상태 관리를 위함)
            localStorage.setItem('user', JSON.stringify(res.data.user));
            router.back();

        } catch (error) {
            alert(`로그인 실패: ${error.response?.data?.message || '서버 오류'}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '5px' }}>
            <h2>로그인</h2>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="이메일"
                    required
                    style={{ padding: '10px', fontSize: '16px' }}
                />
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="비밀번호"
                    required
                    style={{ padding: '10px', fontSize: '16px' }}
                />
                <button type="submit" disabled={loading} style={{ padding: '10px', fontSize: '18px', backgroundColor: '#007BFF', color: 'white', border: 'none', cursor: 'pointer' }}>
                    {loading ? '로그인 중...' : '로그인'}
                </button>
            </form>
        </div>
    );
}

export default Login;