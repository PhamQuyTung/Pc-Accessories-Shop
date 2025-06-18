import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Row, Col } from 'react-bootstrap';
import styles from './ProductDetail.module.scss';
import classNames from 'classnames/bind';
import Breadcrumb from '~/components/Breadcrumb/Breadcrumb';
import ProductGallery from './ProductGallery';

const cx = classNames.bind(styles);

function ProductDetail() {
    const { slug } = useParams(); // lấy slug từ URL
    const [product, setProduct] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        axios
            .get(`http://localhost:5000/api/products/${slug}`)
            .then((res) => {
                console.log('Product received:', res.data); // Log kết quả nhận được
                setProduct(res.data);
            })
            .catch((err) => {
                console.error('Lỗi khi lấy sản phẩm:', err);
                setError('Không tìm thấy sản phẩm');
            });
    }, [slug]);

    console.log('Slug:', slug);

    if (error) return <div>{error}</div>;
    if (!product) return <div>Đang tải...</div>;

    return (
        <div className={cx('product-detail')}>
            <Row>
                <Col lg={6} md={12} xs={12}>
                    {/* Product-slider */}
                    <div className={cx('product-slider')}>
                        {/* <ProductGallery /> */}
                        <Breadcrumb />
                    </div>
                </Col>

                <Col lg={6} md={12} xs={12}>
                    {/* Product-info */}
                    <div className={cx('product-info')}></div>
                </Col>
            </Row>
            <h1 className={cx('title')}>{product.name}</h1>
            <img className={cx('image')} src={product.image} alt={product.name} />

            <div className={cx('info')}>
                <p>
                    <strong>Giá gốc:</strong> {product.price?.toLocaleString()}₫
                </p>
                <p>
                    <strong>Giá khuyến mãi:</strong> {product.discountPrice?.toLocaleString()}₫
                </p>
                <p>
                    <strong>Trạng thái:</strong> {product.status?.join(', ') || 'Không có'}
                </p>

                {product.specs && (
                    <div className={cx('specs')}>
                        <p>
                            <strong>CPU:</strong> {product.specs.cpu}
                        </p>
                        <p>
                            <strong>VGA:</strong> {product.specs.vga}
                        </p>
                        <p>
                            <strong>Mainboard:</strong> {product.specs.mainboard}
                        </p>
                        <p>
                            <strong>SSD:</strong> {product.specs.ssd}
                        </p>
                        <p>
                            <strong>RAM:</strong> {product.specs.ram}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default ProductDetail;
