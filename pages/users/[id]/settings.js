// pages/users/[id]/settings.js
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import axios from 'axios';

function UserSettings() {
    const router = useRouter();
    const { id } = router.query;
    const [user, setUser] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            const parsed = JSON.parse(storedUser);
            setCurrentUser(parsed);

            // 본인 확인
            if (id && parsed.id !== id) {
                alert('Access denied');
                router.push('/');
                return;
            }
        } else {
            router.push('/login');
            return;
        }

        if (id) {
            fetchUserData();
        }
    }, [id]);

    const fetchUserData = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`/api/auth/user/${id}`);
            setUser(res.data);
            setFormData({
                username: res.data.username,
                email: res.data.email,
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            });
        } catch (error) {
            console.error('Failed to fetch user data:', error);
            alert('Failed to load user data');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage({ type: '', text: '' });

        // 비밀번호 변경 시 확인
        if (formData.newPassword) {
            if (formData.newPassword !== formData.confirmPassword) {
                setMessage({ type: 'error', text: 'New passwords do not match.' });
                return;
            }
            if (formData.newPassword.length < 6) {
                setMessage({ type: 'error', text: 'Password must be at least 6 characters.' });
                return;
            }
        }

        setSaving(true);
        try {
            const updateData = {
                username: formData.username,
                email: formData.email
            };

            if (formData.newPassword) {
                updateData.currentPassword = formData.currentPassword;
                updateData.newPassword = formData.newPassword;
            }

            const res = await axios.put(`/api/users/${id}/update`, updateData);

            // localStorage 업데이트
            const updatedUser = {
                ...currentUser,
                username: res.data.user.username,
                email: res.data.user.email
            };
            localStorage.setItem('user', JSON.stringify(updatedUser));
            setCurrentUser(updatedUser);

            setMessage({ type: 'success', text: 'Profile updated successfully!' });

            // 비밀번호 필드 초기화
            setFormData({
                ...formData,
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            });
        } catch (error) {
            setMessage({
                type: 'error',
                text: error.response?.data?.message || 'Failed to update profile.'
            });
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-6">Loading...</div>;
    if (!user) return <div className="p-6">User not found.</div>;

    return (
        <div className="max-w-3xl mx-auto">
            <div className="mb-6">
                <h1 className="text-3xl font-normal mb-2">Edit Profile</h1>
                <p className="text-gray-600">Update your account information</p>
            </div>

            {message.text && (
                <div className={`mb-6 p-4 rounded ${
                    message.type === 'success'
                        ? 'bg-green-50 text-green-700 border border-green-200'
                        : 'bg-red-50 text-red-700 border border-red-200'
                }`}>
                    {message.text}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Public Information */}
                <div className="bg-white border border-gray-200 rounded p-6">
                    <h2 className="text-xl font-medium mb-4">Public Information</h2>

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Username
                        </label>
                        <input
                            type="text"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Email
                        </label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <p className="text-sm text-gray-500 mt-1">
                            Your email will not be shared publicly.
                        </p>
                    </div>
                </div>

                {/* Change Password */}
                <div className="bg-white border border-gray-200 rounded p-6">
                    <h2 className="text-xl font-medium mb-4">Change Password</h2>
                    <p className="text-sm text-gray-600 mb-4">
                        Leave blank if you don't want to change your password.
                    </p>

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Current Password
                        </label>
                        <input
                            type="password"
                            name="currentPassword"
                            value={formData.currentPassword}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            New Password
                        </label>
                        <input
                            type="password"
                            name="newPassword"
                            value={formData.newPassword}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Confirm New Password
                        </label>
                        <input
                            type="password"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </div>

                {/* Buttons */}
                <div className="flex gap-3">
                    <button
                        type="submit"
                        disabled={saving}
                        className="bg-blue-600 text-white px-6 py-2.5 rounded hover:bg-blue-700 transition-colors font-medium disabled:bg-gray-400"
                    >
                        {saving ? 'Saving...' : 'Save Profile'}
                    </button>
                    <button
                        type="button"
                        onClick={() => router.push(`/users/${id}`)}
                        className="bg-white border border-gray-300 text-gray-700 px-6 py-2.5 rounded hover:bg-gray-100 transition-colors font-medium"
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
}

export default UserSettings;
