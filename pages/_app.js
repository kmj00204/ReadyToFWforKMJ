// pages/_app.js
// import '../styles/globals.css'; // 필요하다면 스타일 추가
import '../styles/globals.css'
import Layout from '../components/Layout';

function MyApp({ Component, pageProps }) {
    return (
        <Layout>
            <Component {...pageProps} />
        </Layout>
    );
}

export default MyApp;