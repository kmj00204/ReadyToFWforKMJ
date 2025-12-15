// pages/posts/new.js
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';

function NewPost() {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [tags, setTags] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    // 로그인 상태 확인
    useEffect(() => {
        if (!localStorage.getItem('user')) {
            alert('Please log in to ask a question.');
            router.push('/login');
        }
    }, [router]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!title || !content) {
            alert('Please fill in all required fields.');
            return;
        }
        setLoading(true);

        try {
            const tagArray = tags.split(' ').filter(tag => tag.trim() !== '');
            const res = await axios.post('/api/posts', {
                title,
                content,
                tags: tagArray
            });
            alert('Your question has been posted successfully!');
            router.push(`/posts/${res.data.post._id}`);
        } catch (error) {
            alert(`Error: ${error.response?.data?.message || 'Please check your login status.'}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-5xl mx-auto">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-normal mb-2">Ask a public question</h1>
                <div className="bg-blue-50 border border-blue-200 rounded p-6">
                    <h2 className="text-lg font-semibold mb-3">Writing a good question</h2>
                    <p className="text-sm text-gray-700 mb-3">
                        You're ready to ask a programming-related question and this form will help guide you through the process.
                    </p>
                    <p className="text-sm text-gray-700 mb-3">
                        Looking to ask a non-programming question? See the topics here to find a relevant site.
                    </p>
                    <div className="text-sm text-gray-700">
                        <p className="font-semibold mb-2">Steps</p>
                        <ul className="list-disc list-inside space-y-1 ml-2">
                            <li>Summarize your problem in a one-line title.</li>
                            <li>Describe your problem in more detail.</li>
                            <li>Describe what you tried and what you expected to happen.</li>
                            <li>Add "tags" which help surface your question to members of the community.</li>
                            <li>Review your question and post it to the site.</li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Title */}
                <div className="bg-white border border-gray-300 rounded p-6">
                    <label className="block mb-2">
                        <span className="text-sm font-semibold text-gray-900">Title</span>
                        <p className="text-xs text-gray-600 mb-2">
                            Be specific and imagine you're asking a question to another person.
                        </p>
                    </label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="e.g. Is there an R function for finding the index of an element in a vector?"
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                </div>

                {/* Body */}
                <div className="bg-white border border-gray-300 rounded p-6">
                    <label className="block mb-2">
                        <span className="text-sm font-semibold text-gray-900">What are the details of your problem?</span>
                        <p className="text-xs text-gray-600 mb-2">
                            Introduce the problem and expand on what you put in the title. Minimum 20 characters.
                        </p>
                    </label>
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="Include all the information someone would need to answer your question"
                        required
                        rows="15"
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical font-mono text-sm"
                    />
                </div>

                {/* Tags */}
                <div className="bg-white border border-gray-300 rounded p-6">
                    <label className="block mb-2">
                        <span className="text-sm font-semibold text-gray-900">Tags</span>
                        <p className="text-xs text-gray-600 mb-2">
                            Add up to 5 tags to describe what your question is about. Start typing to see suggestions.
                        </p>
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

                {/* Submit Buttons */}
                <div className="flex gap-3">
                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-blue-600 text-white px-4 py-2.5 rounded hover:bg-blue-700 transition-colors font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Posting...' : 'Post your question'}
                    </button>
                    <button
                        type="button"
                        onClick={() => router.push('/')}
                        className="bg-white text-gray-700 px-4 py-2.5 rounded border border-gray-300 hover:bg-gray-50 transition-colors"
                    >
                        Cancel
                    </button>
                </div>
            </form>

            {/* Tips Section */}
            <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded p-6">
                <h3 className="text-sm font-bold text-gray-900 mb-3">Step-by-step guide</h3>
                <ul className="space-y-2 text-sm text-gray-700">
                    <li className="flex gap-2">
                        <svg className="w-5 h-5 text-blue-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>Summarize the problem</span>
                    </li>
                    <li className="flex gap-2">
                        <svg className="w-5 h-5 text-blue-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>Provide details and any research</span>
                    </li>
                    <li className="flex gap-2">
                        <svg className="w-5 h-5 text-blue-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>When appropriate, share minimum code to reproduce the problem</span>
                    </li>
                </ul>
            </div>
        </div>
    );
}

export default NewPost;