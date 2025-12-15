// pages/api/posts/search.js
import connectDB from '../../../lib/connectDB';
import Post from '../../../lib/models/Post';

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        await connectDB();

        const { q } = req.query;

        if (!q || q.trim() === '') {
            return res.status(400).json({ message: '검색어를 입력해주세요.' });
        }

        // 제목 또는 내용에서 검색 (대소문자 구분 없이)
        const searchResults = await Post.find({
            $or: [
                { title: { $regex: q, $options: 'i' } },
                { content: { $regex: q, $options: 'i' } }
            ]
        })
            .populate('author', 'username') // 작성자 정보 포함
            .sort({ createdAt: -1 }) // 최신순 정렬
            .limit(50); // 최대 50개 결과

        // 결과 포맷팅
        const formattedResults = searchResults.map(post => ({
            id: post._id,
            title: post.title,
            content: post.content.substring(0, 200), // 미리보기용 200자
            author: post.author?.username || '알 수 없음',
            createdAt: post.createdAt,
            views: post.views || 0
        }));

        res.status(200).json(formattedResults);
    } catch (error) {
        console.error('검색 오류:', error);
        res.status(500).json({ message: '검색 중 오류가 발생했습니다.' });
    }
}