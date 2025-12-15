// components/Pagination.js
import Link from 'next/link';
import { useRouter } from 'next/router';

function Pagination({ totalPages, currentPage }) {
    const router = useRouter();
    const pages = [];
    const startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, currentPage + 2);

    // 페이지 배열 생성
    for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
    }

    // 기본 URL 경로
    const basePath = router.pathname;

    return (
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
            {/* 이전 페이지 버튼 */}
            {currentPage > 1 && (
                <Link href={{ pathname: basePath, query: { page: currentPage - 1 } }} style={{ margin: '0 5px', padding: '5px 10px', border: '1px solid #ccc' }}>
                    &lt;
                </Link>
            )}

            {/* 페이지 번호 */}
            {pages.map(page => (
                <Link
                    key={page}
                    href={{ pathname: basePath, query: { page } }}
                    style={{
                        margin: '0 5px',
                        padding: '5px 10px',
                        border: '1px solid #ccc',
                        backgroundColor: page === currentPage ? '#0070f3' : 'white',
                        color: page === currentPage ? 'white' : 'black',
                        fontWeight: page === currentPage ? 'bold' : 'normal',
                    }}
                >
                    {page}
                </Link>
            ))}

            {/* 다음 페이지 버튼 */}
            {currentPage < totalPages && (
                <Link href={{ pathname: basePath, query: { page: currentPage + 1 } }} style={{ margin: '0 5px', padding: '5px 10px', border: '1px solid #ccc' }}>
                    &gt;
                </Link>
            )}
        </div>
    );
}

export default Pagination;