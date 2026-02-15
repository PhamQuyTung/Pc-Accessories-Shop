// src/pages/PromotionLinkProductCollections/PromotionLinkProductCollections.js
import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axiosClient from '~/utils/axiosClient';
import classNames from 'classnames/bind';
import styles from './PromotionLinkProductCollections.module.scss';

import Breadcrumb from '~/components/Breadcrumb/Breadcrumb';
import ProductCard from '~/components/Product/ProductCard/ProductCard';
import ExpandableContent from '~/components/ExpandableContent/ExpandableContent';

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

    if (loading) return <div className={cx('loading')}>Đang tải khuyến mãi...</div>;
    if (!promotion) return <div className={cx('empty')}>Không tìm thấy khuyến mãi này.</div>;

    return (
        <div className={cx('promotion-wrapper')}>
            <div className={cx('promotion-breadcrumb')}>
                {/* 🔹 Breadcrumb */}
                <Breadcrumb
                    type="promotion"
                    customData={[
                        { path: '/', label: 'Trang chủ' },
                        { path: '/promotion', label: 'Khuyến mãi' },
                        { path: `/promotion/${promotion._id}`, label: promotion.title },
                    ]}
                />
            </div>

            <div className={cx('promotion-content')}>
                {/* 🔹 Header */}
                <div className={cx('promotion-header')}>
                    <div className={cx('header-content')}>
                        <h1 className={cx('promotion-title')}>{promotion.title}</h1>
                        <ExpandableContent html={promotion.description} previewHeight={800} />
                    </div>
                    {/* {promotion.banner && (
                        <div className={cx('banner')}>
                            <img src={promotion.banner} alt={promotion.title} />
                        </div>
                    )} */}
                </div>

                {/* 🔹 Sản phẩm chính */}
                {/* {promotion.conditionProducts?.length > 0 && (
                    <section className={cx('main-product')}>
                        <h2 className={cx('section-title')}>🎯 Sản phẩm chính</h2>
                        <div className={cx('product-grid')}>
                            {promotion.conditionProducts.map((item) => (
                                <ProductCard key={item._id} product={item} />
                            ))}
                        </div>
                    </section>
                )} */}

                {/* 🔹 Danh sách sản phẩm mua kèm */}
                {promotion.relatedProducts?.length > 0 && (
                    <section className={cx('related-section')}>
                        <h2 className={cx('section-title')}>🛒 Danh sách sản phẩm mua kèm</h2>
                        <div className={cx('product-grid')}>
                            {promotion.relatedProducts.map((item) => (
                                <ProductCard key={item._id} product={item} />
                            ))}
                        </div>
                    </section>
                )}

                {/* 🔹 Quay lại */}
                <div className={cx('back-link')}>
                    <Link to="/promotion">← Quay lại danh sách khuyến mãi</Link>
                </div>
            </div>
        </div>
    );
}

export default PromotionLinkProductCollections;
