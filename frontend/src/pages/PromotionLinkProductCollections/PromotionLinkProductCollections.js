// src/pages/PromotionLinkProductCollections/PromotionLinkProductCollections.js
import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axiosClient from '~/utils/axiosClient';
import styles from './PromotionLinkProductCollections.module.scss';
import classNames from 'classnames/bind';

const cx = classNames.bind(styles);

function PromotionLinkProductCollections() {
    const { id } = useParams();
    const [promotion, setPromotion] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPromotion = async () => {
            try {
                const res = await axiosClient.get(`/promotion-gifts`);
                const found = res.data.find((p) => p._id === id);
                setPromotion(found);
            } catch (err) {
                console.error('Lỗi khi tải chi tiết khuyến mãi:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchPromotion();
    }, [id]);

    if (loading) return <p className={cx('loading')}>Đang tải chi tiết khuyến mãi...</p>;
    if (!promotion) return <p className={cx('empty')}>Không tìm thấy khuyến mãi này.</p>;

    return (
        <div className={cx('wrapper')}>
            <h1 className={cx('title')}>🎁 {promotion.title}</h1>
            <p className={cx('desc')}>{promotion.description}</p>

            <div className={cx('mainProduct')}>
                <h2 className={cx('sectionTitle')}>Sản phẩm chính:</h2>
                <div className={cx('mainProductInfo')}>
                    <img
                        src={promotion.conditionProduct?.images?.[0]}
                        alt={promotion.conditionProduct?.name}
                        className={cx('thumb')}
                    />
                    <span>{promotion.conditionProduct?.name}</span>
                </div>
            </div>

            <h3 className={cx('sectionTitle')}>Danh sách sản phẩm mua kèm:</h3>
            <div className={cx('grid')}>
                {promotion.relatedProducts?.map((item) => (
                    <div key={item._id} className={cx('card')}>
                        <img src={item.images?.[0]} alt={item.name} className={cx('productImg')} />
                        <p className={cx('productName')}>{item.name}</p>
                        <p className={cx('price')}>Giá: {item.price?.toLocaleString('vi-VN')}₫</p>

                        {promotion.discountType === 'amount' ? (
                            <p className={cx('discount')}>Giảm {promotion.discountValue.toLocaleString('vi-VN')}₫</p>
                        ) : (
                            <p className={cx('discount')}>
                                Giảm {promotion.discountValue}% khi mua cùng sản phẩm chính
                            </p>
                        )}
                    </div>
                ))}
            </div>

            <Link to="/promotion" className={cx('backLink')}>
                ← Quay lại danh sách khuyến mãi
            </Link>
        </div>
    );
}

export default PromotionLinkProductCollections;
