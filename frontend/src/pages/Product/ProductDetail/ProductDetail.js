// --- Imports giữ nguyên ---
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Row, Col } from 'react-bootstrap';
import styles from './ProductDetail.module.scss';
import classNames from 'classnames/bind';
import Breadcrumb from '~/components/Breadcrumb/Breadcrumb';
import ProductGallery from './ProductGallery';
import BasicRating from '~/components/Rating/Rating';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShoppingCart } from '@fortawesome/free-solid-svg-icons';
import { faHeart } from '@fortawesome/free-regular-svg-icons';
import { faHeart as solidHeart } from '@fortawesome/free-solid-svg-icons';

const cx = classNames.bind(styles);

function ProductDetail() {
    const { slug } = useParams();
    const [product, setProduct] = useState(null);
    const [error, setError] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [isFavorite, setIsFavorite] = useState(false);
    const [activeTab, setActiveTab] = useState('description');

    useEffect(() => {
        axios
            .get(`http://localhost:5000/api/products/${slug}`)
            .then((res) => {
                setProduct(res.data);
            })
            .catch((err) => {
                console.error('Lỗi khi lấy sản phẩm:', err);
                setError('Không tìm thấy sản phẩm');
            });
    }, [slug]);

    if (error) return <div>{error}</div>;
    if (!product) return <div>Đang tải...</div>;

    const toggleFavorite = () => setIsFavorite((prev) => !prev);

    const renderTabContent = () => {
        switch (activeTab) {
            case 'description':
                return <p>{product.description || 'Không có dòng mô tả'}</p>;
            case 'additional':
                return (
                    <table className={cx('specs-table')}>
                        <tbody>
                            {product.specs &&
                                Object.entries(product.specs).map(([key, value]) => (
                                    <tr key={key}>
                                        <td>
                                            <strong>{key.toUpperCase()}</strong>
                                        </td>
                                        <td>{value}</td>
                                    </tr>
                                ))}
                        </tbody>
                    </table>
                );
            case 'reviews':
                return <p>Chức năng đánh giá đang được phát triển.</p>;
            default:
                return null;
        }
    };

    return (
        <div className={cx('product-detail')}>
            {/* Breadcrumb */}
            <Breadcrumb />

            {/* Product-detail Main */}
            <div className={cx('product-detail__wraps')}>
                <Row>
                    <Col lg={5} md={12} xs={12}>
                        <div className={cx('product-slider')}>
                            <ProductGallery images={product.images} />
                        </div>
                    </Col>

                    <Col lg={7} md={12} xs={12}>
                        <div className={cx('product-info')}>
                            <div className={cx('product-info__name')}>
                                <h1>{product.name}</h1>
                            </div>

                            <div className={cx('product-info__fsz16')}>
                                <div className={cx('product-info__rating')}>
                                    <BasicRating className={cx('custom-rating')} />
                                    <span>5 đánh giá</span>
                                </div>

                                <div className={cx('product-info__cost')}>
                                    <p className={cx('product-info__discountPrice')}>
                                        {product.discountPrice?.toLocaleString()}₫
                                    </p>
                                    <p className={cx('product-info__price')}>{product.price?.toLocaleString()}₫</p>
                                </div>

                                <div className={cx('product-info__status')}>
                                    <span
                                        className={cx(
                                            'product-info__status--badge',
                                            'product-info__status--badge__success',
                                        )}
                                    >
                                        {product.status?.join(', ') || 'Không có'}
                                    </span>
                                </div>

                                <div className={cx('product-info__des')}>
                                    <p>{product.description}</p>
                                </div>

                                <div className={cx('product-info__actions')}>
                                    <div className={cx('quantity-control')}>
                                        <button onClick={() => setQuantity((prev) => Math.max(prev - 1, 1))}>−</button>
                                        <span>{quantity}</span>
                                        <button onClick={() => setQuantity((prev) => prev + 1)}>+</button>
                                    </div>

                                    <button className={cx('add-to-cart')}>
                                        <FontAwesomeIcon icon={faShoppingCart} /> Thêm vào giỏ
                                    </button>

                                    <button className={cx('favorite-btn')} onClick={toggleFavorite}>
                                        <FontAwesomeIcon
                                            icon={isFavorite ? solidHeart : faHeart}
                                            className={cx({ 'favorite-icon--active': isFavorite })}
                                        />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </Col>
                </Row>
            </div>

            {/* Tabs section */}
            <div className={cx('tab-container')}>
                <div className={cx('tab-buttons')}>
                    <button
                        onClick={() => setActiveTab('description')}
                        className={cx('tab-btn', { active: activeTab === 'description' })}
                    >
                        Description
                    </button>
                    <button
                        onClick={() => setActiveTab('additional')}
                        className={cx('tab-btn', { active: activeTab === 'additional' })}
                    >
                        Additional Info
                    </button>
                    <button
                        onClick={() => setActiveTab('reviews')}
                        className={cx('tab-btn', { active: activeTab === 'reviews' })}
                    >
                        Reviews
                    </button>
                </div>
                <div className={cx('tab-content')}>{renderTabContent()}</div>
            </div>
        </div>
    );
}

export default ProductDetail;
