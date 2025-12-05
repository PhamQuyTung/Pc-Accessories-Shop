import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axiosClient from '~/utils/axiosClient';
import styles from './ProfileViewed.module.scss';
import classNames from 'classnames/bind';
import SpinnerLoading from '~/components/SpinnerLoading/SpinnerLoading';
import { getDefaultDisplayName } from '~/utils/getDefaultDisplayName';

const cx = classNames.bind(styles);

export default function ProfileViewed() {
    const [favorites, setFavorites] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFavorites = async () => {
            try {
                const res = await axiosClient.get('/favorites');
                setFavorites(res.data);
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
                {favorites.map((product) => {
                    // ================================
                    // 1) Lấy biến thể mặc định
                    // ================================
                    const defaultVariant =
                        product?.variations?.find(
                            (v) => v._id?.toString() === product.defaultVariantId?.toString()
                        ) || product?.variations?.[0] || null;

                    const display = defaultVariant || product;

                    // ================================
                    // 2) Ảnh hiển thị
                    // ================================
                    const thumbnail =
                        display?.images?.[0] ||
                        display?.thumbnail ||
                        product?.images?.[0] ||
                        "/placeholder.png";

                    // ================================
                    // 3) Giá hiển thị
                    // ================================
                    const price = display?.price ?? product.price ?? null;
                    const discountPrice = display?.discountPrice ?? product.discountPrice ?? null;

                    const finalPrice = discountPrice && discountPrice > 0 ? discountPrice : price;

                    return (
                        <div key={product._id} className={cx('card')}>
                            <Link to={`/products/${product.slug}?vid=${display._id}`} className={cx('image-wrapper')}>
                                <img src={thumbnail} alt={product.name} className={cx('image')} />
                            </Link>

                            <Link to={`/products/${product.slug}?vid=${display._id}`} className={cx('name')}>
                                {getDefaultDisplayName(product)}
                            </Link>

                            <p className={cx('price')}>
                                {finalPrice ? `${finalPrice.toLocaleString()}₫` : "Liên hệ"}
                            </p>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
