import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import axios from 'axios';
import styles from './SearchResultPage.module.scss';
import classNames from 'classnames/bind';
import { formatCurrency } from '~/utils/formatCurrency';

const cx = classNames.bind(styles);

function SearchResultPage() {
    const [searchParams] = useSearchParams();
    const query = searchParams.get('query');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!query) return;

        const fetchData = async () => {
            try {
                setLoading(true);
                const res = await axios.get(`/api/products/search?query=${encodeURIComponent(query)}`);
                setResults(res.data);
            } catch (error) {
                console.error('Lỗi khi tìm kiếm sản phẩm:', error);
                setResults([]);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [query]);

    return (
        <div className={cx('wrapper')}>
            <h2>Kết quả tìm kiếm cho: “{query}”</h2>
            {loading ? (
                <p>Đang tải...</p>
            ) : results.length === 0 ? (
                <p>Không tìm thấy sản phẩm nào.</p>
            ) : (
                <div className={cx('product-list')}>
                    {results.map((item) => (
                        <Link to={`/products/${item.slug}`} key={item._id} className={cx('product-item')}>
                            <img src={item.images?.[0]} alt={item.name} />
                            <div className={cx('info')}>
                                <h4>{item.name}</h4>
                                <div className={cx('price')}>
                                    {item.discountPrice ? (
                                        <>
                                            <span className={cx('discount')}>
                                                {formatCurrency(item.discountPrice)}
                                            </span>
                                            <span className={cx('original')}>
                                                {formatCurrency(item.price)}
                                            </span>
                                        </>
                                    ) : (
                                        <span>{formatCurrency(item.price)}</span>
                                    )}
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}

export default SearchResultPage;
