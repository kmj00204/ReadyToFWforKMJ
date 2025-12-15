// pages/signup.js
import { useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';

function SignUp() {
    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            await axios.post('/api/auth/signup', { email, username, password });
            alert('회원가입이 성공적으로 완료되었습니다. 로그인해 주세요.');
            router.push('/login');
        } catch (error) {
            alert(`회원가입 실패: ${error.response?.data?.message || '서버 오류'}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '5px' }}>
            <h2>회원가입</h2>
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
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="사용자 이름"
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
                <button type="submit" disabled={loading} style={{ padding: '10px', fontSize: '18px', backgroundColor: '#4CAF50', color: 'white', border: 'none', cursor: 'pointer' }}>
                    {loading ? '가입 중...' : '회원가입'}
                </button>
            </form>
        </div>
    );
}

export default SignUp;