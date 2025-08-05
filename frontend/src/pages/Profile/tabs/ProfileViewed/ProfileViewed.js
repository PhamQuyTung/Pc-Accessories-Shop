import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axiosClient from '~/utils/axiosClient';
import styles from './ProfileViewed.module.scss';
import classNames from 'classnames/bind';
import SpinnerLoading from '~/components/SpinnerLoading/SpinnerLoading';

const cx = classNames.bind(styles);

export default function ProfileViewed() {
    const [favorites, setFavorites] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFavorites = async () => {
            try {
                const res = await axiosClient.get('/favorites');
                setFavorites(res.data);
                console.log('Giá sản phẩm: ', res.data);
            } catch (error) {
                console.error('Lỗi khi lấy sản phẩm yêu thích:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchFavorites();
    }, []);

    if (loading) return <SpinnerLoading />;

    if (favorites.length === 0) return <div className={cx('empty')}>Bạn chưa thích sản phẩm nào.</div>;

    return (
        <div className={cx('container')}>
            <h2 className={cx('title')}>Sản phẩm đã thích</h2>
            <div className={cx('grid')}>
                {favorites.map((product) => (
                    <div key={product._id} className={cx('card')}>
                        <img src={product.images?.[0]} alt={product.name} className={cx('image')} />
                        <Link to={`/products/${product.slug}`}>{product.name}</Link>
                        {(() => {
                            const price =
                                typeof product.discountPrice === 'number' && product.discountPrice > 0
                                    ? product.discountPrice
                                    : typeof product.price === 'number' && product.price > 0
                                      ? product.price
                                      : null;

                            return <p className={cx('price')}>{price ? `${price.toLocaleString()}₫` : 'Liên hệ'}</p>;
                        })()}
                    </div>
                ))}
            </div>
        </div>
    );
}
