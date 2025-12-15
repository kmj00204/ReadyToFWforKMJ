// pages/posts/[id]/edit.js
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';

function EditPost() {
    const router = useRouter();
    const { id } = router.query;
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [tags, setTags] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [user, setUser] = useState(null);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (!storedUser) {
            alert('Please log in to edit a question.');
            router.push('/login');
            return;
        }
        setUser(JSON.parse(storedUser));

        if (id) {
            fetchPost();
        }
    }, [id, router]);

    const fetchPost = async () => {
        try {
            const res = await axios.get(`/api/posts/${id}`);
            const post = res.data.post;

            setTitle(post.title);
            setContent(post.content);
            setTags(post.tags ? post.tags.join(' ') : '');
            setLoading(false);
        } catch (error) {
            alert('Failed to load post.');
            router.push('/');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!title || !content) {
            alert('Please fill in all required fields.');
            return;
        }
        setSaving(true);

        try {
            const tagArray = tags.split(' ').filter(tag => tag.trim() !== '');
            await axios.put(`/api/posts/${id}`, {
                title,
                content,
                tags: tagArray
            });
            alert('Your question has been updated successfully!');
            router.push(`/posts/${id}`);
        } catch (error) {
            alert(`Error: ${error.response?.data?.message || 'Please check your permission.'}`);
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-6">Loading...</div>;

    return (
        <div className="max-w-5xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-normal mb-2">Edit your question</h1>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="bg-white border border-gray-300 rounded p-6">
                    <label className="block mb-2">
                        <span className="text-sm font-semibold text-gray-900">Title</span>
                    </label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                </div>

                <div className="bg-white border border-gray-300 rounded p-6">
                    <label className="block mb-2">
                        <span className="text-sm font-semibold text-gray-900">Body</span>
                    </label>
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        required
                        rows="15"
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical font-mono text-sm"
                    />
                </div>

                <div className="bg-white border border-gray-300 rounded p-6">
                    <label className="block mb-2">
                        <span className="text-sm font-semibold text-gray-900">Tags</span>
                    </label>
                    <input
                        type="text"
                        value={tags}
                        onChange={(e) => setTags(e.target.value)}
                        placeholder="e.g. javascript react node"
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <p className="text-xs text-gray-500 mt-2">
                        Separate tags with spaces
                    </p>
                </div>

                <div className="flex gap-3">
                    <button
                        type="submit"
                        disabled={saving}
                        className="bg-blue-600 text-white px-4 py-2.5 rounded hover:bg-blue-700 transition-colors font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                        {saving ? 'Saving...' : 'Save edits'}
                    </button>
                    <button
                        type="button"
                        onClick={() => router.push(`/posts/${id}`)}
                        className="bg-white text-gray-700 px-4 py-2.5 rounded border border-gray-300 hover:bg-gray-50 transition-colors"
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
}

export default EditPost;
