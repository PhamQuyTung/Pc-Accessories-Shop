import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import styles from './SearchResultPage.module.scss';
import classNames from 'classnames/bind';

import ProductCard from '~/components/Product/ProductCard';
import { SearchNoResults } from '../Icons';
import LoadingSpinner from '../SpinnerLoading/SpinnerLoading';

const cx = classNames.bind(styles);

function SearchResultPage() {
    const [searchParams] = useSearchParams();
    const query = searchParams.get('query');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        if (!query) return;

        const fetchData = async () => {
            try {
                setLoading(true);
                const startTime = Date.now();

                const res = await axios.get(`/api/products/search?query=${encodeURIComponent(query)}`);
                setResults(res.data);
                console.log("SEARCH RESULT ITEM:", res.data);

                const elapsed = Date.now() - startTime;
                const minLoadingTime = 500; // 0.5 giây
                if (elapsed < minLoadingTime) {
                    setTimeout(() => setLoading(false), minLoadingTime - elapsed);
                } else {
                    setLoading(false);
                }
            } catch (error) {
                console.error('Lỗi khi tìm kiếm sản phẩm:', error);
                navigate('/404');
            }
        };

        fetchData();
    }, [query, navigate]);

    return (
        <div className={cx('main')}>
            <div className={cx('wrapper')}>
                <h1>Tìm kiếm</h1>

                <p>
                    Kết quả tìm kiếm cho: “<strong>{query}</strong>”
                </p>

                {loading ? (
                    <LoadingSpinner />
                ) : results.length === 0 ? (
                    <div className={cx('not-found')}>
                        <SearchNoResults />
                        <h2>TÌM KIẾM</h2>
                        <p>Rất tiếc, chúng tôi không tìm thấy kết quả cho từ khóa của bạn</p>
                        <p>Vui lòng kiểm tra chính tả, sử dụng các từ tổng quát hơn và thử lại!</p>
                    </div>
                ) : (
                    <div className={cx('product-list')}>
                        {results.map((product) => (
                            <ProductCard key={product._id} product={product} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default SearchResultPage;
