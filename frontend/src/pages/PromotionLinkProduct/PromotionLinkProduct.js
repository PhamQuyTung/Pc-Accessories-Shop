// src/pages/PromotionLinkProduct/PromotionLinkProduct.js
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axiosClient from '~/utils/axiosClient';
import styles from './PromotionLinkProduct.module.scss';
import classNames from 'classnames/bind';

const cx = classNames.bind(styles);

function PromotionLinkProduct() {
    const [promotions, setPromotions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPromotions = async () => {
            try {
                const res = await axiosClient.get('/promotion-gifts');
                setPromotions(res.data || []);
            } catch (err) {
                console.error('Lỗi khi tải khuyến mãi:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchPromotions();
    }, []);

    if (loading) return <p className={cx('loading')}>Đang tải khuyến mãi...</p>;

    return (
        <div className={cx('wrapper')}>
            <h1 className={cx('title')}>🎁 Khuyến mãi sản phẩm</h1>
            <p className={cx('subtitle')}>Danh sách các chương trình khuyến mãi do admin tạo.</p>

            {promotions.length === 0 ? (
                <p className={cx('empty')}>Hiện chưa có khuyến mãi nào.</p>
            ) : (
                <div className={cx('grid')}>
                    {promotions.map((promo) => (
                        <div key={promo._id} className={cx('card')}>
                            <h2 className={cx('cardTitle')}>{promo.title}</h2>
                            <p className={cx('desc')}>{promo.description}</p>

                            {promo.conditionProduct && (
                                <div className={cx('mainProduct')}>
                                    <p className={cx('label')}>Sản phẩm chính:</p>
                                    <div className={cx('mainProductInfo')}>
                                        <img
                                            src={promo.conditionProduct.images?.[0]}
                                            alt={promo.conditionProduct.name}
                                            className={cx('thumb')}
                                        />
                                        <span>{promo.conditionProduct.name}</span>
                                    </div>
                                </div>
                            )}

                            <Link to={`/promotion/${promo._id}`} className={cx('button')}>
                                Xem chi tiết
                            </Link>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default PromotionLinkProduct;
