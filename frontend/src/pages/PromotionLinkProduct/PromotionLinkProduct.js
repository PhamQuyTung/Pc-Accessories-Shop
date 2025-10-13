import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axiosClient from '~/utils/axiosClient';
import styles from './PromotionLinkProduct.module.scss';
import classNames from 'classnames/bind';
import Breadcrumb from '~/components/Breadcrumb/Breadcrumb';

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
            {/* 🔹 Breadcrumb */}
            <Breadcrumb
                type="promotion"
                customData={[
                    { path: '/', label: 'Trang chủ' },
                    { path: '/promotion', label: 'Khuyến mãi' },
                ]}
            />

            {/* 🔹 Tiêu đề trang */}
            <h1 className={cx('title')}>🎁 Khuyến mãi sản phẩm</h1>
            <p className={cx('subtitle')}>Danh sách các chương trình khuyến mãi được áp dụng cho sản phẩm.</p>

            {/* 🔹 Danh sách khuyến mãi */}
            {promotions.length === 0 ? (
                <p className={cx('empty')}>Hiện chưa có khuyến mãi nào.</p>
            ) : (
                <div className={cx('grid')}>
                    {promotions.map((promo) => (
                        <div key={promo._id} className={cx('card')}>
                            <h2 className={cx('cardTitle')}>{promo.title}</h2>

                            {/* 🔸 Sản phẩm chính */}
                            {promo.conditionProducts?.length > 0 && (
                                <div className={cx('mainProduct')}>
                                    <p className={cx('label')}>Sản phẩm chính:</p>
                                    <div className={cx('mainProductList')}>
                                        {promo.conditionProducts.map((product) => (
                                            <div key={product._id} className={cx('productItem')}>
                                                <img
                                                    src={product.images?.[0]}
                                                    alt={product.name}
                                                    className={cx('thumb')}
                                                />
                                                <div>
                                                    <p className={cx('productName')}>{product.name}</p>
                                                    <p className={cx('productPrice')}>
                                                        {product.price?.toLocaleString('vi-VN')}₫
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
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
