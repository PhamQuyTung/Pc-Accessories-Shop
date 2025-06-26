// --- Imports giữ nguyên ---
import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import { Row, Col } from 'react-bootstrap';
import styles from './ProductDetail.module.scss';
import classNames from 'classnames/bind';
import Breadcrumb from '~/components/Breadcrumb/Breadcrumb';
import ProductGallery from './ProductGallery';
import BasicRating from '~/components/Rating/Rating';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAngleLeft, faAngleRight, faShoppingCart } from '@fortawesome/free-solid-svg-icons';
import { faHeart } from '@fortawesome/free-regular-svg-icons';
import { faHeart as solidHeart } from '@fortawesome/free-solid-svg-icons';
import ProductCard from '~/components/Product/ProductCard';
import SpinnerLoading from '~/components/SpinnerLoading/SpinnerLoading';
import { useToast } from '~/components/ToastMessager';

const cx = classNames.bind(styles);

function ProductDetail() {
    const { slug } = useParams();
    const [product, setProduct] = useState(null);
    const [error, setError] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [isFavorite, setIsFavorite] = useState(false);
    const [activeTab, setActiveTab] = useState('description');
    const [loading, setLoading] = useState(true);

    const [relatedProducts, setRelatedProducts] = useState([]);

    const [hoverStar, setHoverStar] = useState(0);
    const [selectedStar, setSelectedStar] = useState(0);
    const [reviewText, setReviewText] = useState('');

    const [reviews, setReviews] = useState([]);

    const [averageRating, setAverageRating] = useState(0);

    const reviewSectionRef = useRef(null);

    const toast = useToast();

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN'); // ví dụ: 25/06/2025
    };

    // Logic lấy sản phẩm liên quan
    useEffect(() => {
        if (product) {
            axios
                .get(`http://localhost:5000/api/products/related?category=${product.category}&exclude=${product._id}`)
                .then((res) => setRelatedProducts(res.data))
                .catch((err) => console.error('Lỗi khi lấy sản phẩm liên quan:', err));
        }
    }, [product]);

    //
    useEffect(() => {
        window.scrollTo(0, 0);
        setLoading(true); // ✅ Bắt đầu loading
        setProduct(null); // ✅ Reset product để tránh hiển thị cũ

        axios
            .get(`http://localhost:5000/api/products/${slug}`)
            .then((res) => {
                setTimeout(() => {
                    setProduct(res.data);
                    setLoading(false); // ✅ Dừng loading
                }, 1500);
            })
            .catch((err) => {
                console.error('Lỗi khi lấy sản phẩm:', err);
                setError('Không tìm thấy sản phẩm');
                setLoading(false);
            });
    }, [slug]);

    // Sau khi load sản phẩm, gọi luôn đánh giá
    useEffect(() => {
        if (product?._id) {
            axios
                .get(`http://localhost:5000/api/products/${product._id}/reviews`)
                .then((res) => {
                    setReviews(res.data);

                    const totalStars = res.data.reduce((sum, r) => sum + r.rating, 0);
                    const avg = res.data.length > 0 ? totalStars / res.data.length : 0;
                    setAverageRating(avg);
                })
                .catch((err) => console.error('Lỗi khi lấy đánh giá:', err));
        }
    }, [product]);

    if (error) return <div>{error}</div>;
    if (loading) return <SpinnerLoading />;

    const toggleFavorite = () => setIsFavorite((prev) => !prev);

    const renderTabContent = () => {
        switch (activeTab) {
            case 'description':
                return <p>{product.description || 'Không có dòng mô tả'}</p>;
            case 'additional':
                return (
                    <>
                        <table className={cx('specs-table')}>
                            <tbody>
                                {product.specs &&
                                    Object.entries(product.specs).map(([key, value]) => (
                                        <tr key={key}>
                                            <td className={cx('specs-key')}>{key}</td>
                                            <td className={cx('specs-value')}>{value}</td>
                                        </tr>
                                    ))}
                            </tbody>
                        </table>
                    </>
                );

            case 'reviews':
                return (
                    <div className={cx('review-section')}>
                        <h3>Đánh giá của khách hàng</h3>

                        {/* --- ✅ Hiển thị danh sách đánh giá --- */}
                        {reviews.length === 0 ? (
                            <p>Chưa có đánh giá nào</p>
                        ) : (
                            reviews.map((review, index) => (
                                <div key={index} className={cx('review-item')}>
                                    <p>
                                        <strong>{review.name}</strong> ({formatDate(review.createdAt)})
                                    </p>
                                    <p>
                                        {Array.from({ length: review.rating }).map((_, i) => (
                                            <span key={i} style={{ color: '#ffcc00', fontSize: '18px' }}>
                                                ★
                                            </span>
                                        ))}
                                    </p>
                                    <p>{review.comment}</p>
                                </div>
                            ))
                        )}

                        <br />

                        {/* --- ✅ Form thêm đánh giá --- */}
                        <div className={cx('add-review')}>
                            <h4>Thêm đánh giá của bạn</h4>

                            <textarea
                                className={cx('review-textarea')}
                                placeholder="Write a Review"
                                rows={5}
                                value={reviewText}
                                onChange={(e) => setReviewText(e.target.value)}
                            ></textarea>

                            <div className={cx('rating-stars')}>
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <span
                                        key={star}
                                        className={cx('star', {
                                            active: (hoverStar || selectedStar) >= star,
                                        })}
                                        onMouseEnter={() => setHoverStar(star)}
                                        onMouseLeave={() => setHoverStar(0)}
                                        onClick={() => setSelectedStar(star)}
                                    >
                                        &#9733;
                                    </span>
                                ))}
                            </div>

                            <button className={cx('submit-review-btn')} onClick={handleSubmitReview}>
                                Gửi đánh giá
                            </button>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    const handleSubmitReview = async () => {
        const token = localStorage.getItem('token');
        console.log('Token:', token); // check log

        if (!token) {
            toast('Vui lòng đăng nhập để gửi đánh giá', 'warning');
            return;
        }

        // ✅ Kiểm tra người dùng có nhập nội dung và chọn sao không
        if (selectedStar === 0 || reviewText.trim() === '') {
            toast('Vui lòng điền đánh giá', 'warning');
            return;
        }

        try {
            const response = await axios.post(
                `http://localhost:5000/api/products/${product._id}/reviews`,
                {
                    rating: selectedStar,
                    comment: reviewText,
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`, // <-- rất quan trọng
                    },
                },
            );

            toast('Gửi đánh giá thành công!', 'success');

            // Cập nhật lại danh sách đánh giá
            setReviewText('');
            setSelectedStar(0);
            setHoverStar(0);

            // Gọi lại API để load đánh giá mới
            const res = await axios.get(`http://localhost:5000/api/products/${product._id}/reviews`);
            setReviews(res.data);

            // 👉 Cập nhật lại trung bình sao
            const totalStars = res.data.reduce((sum, r) => sum + r.rating, 0);
            const avg = res.data.length > 0 ? totalStars / res.data.length : 0;
            setAverageRating(avg);
        } catch (error) {
            console.error('Lỗi khi gửi đánh giá:', error);
            toast('Không thể gửi đánh giá', 'error');
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
                                    <span
                                        className={cx('rating-count')}
                                        onClick={() => {
                                            setActiveTab('reviews');
                                            setTimeout(() => {
                                                reviewSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
                                            }, 0);
                                        }}
                                        style={{ cursor: 'pointer' }}
                                    >
                                        {reviews.length} đánh giá | ⭐ {averageRating.toFixed(1)} / 5
                                    </span>
                                </div>

                                <div className={cx('product-info__cost')}>
                                    <p className={cx('product-info__discountPrice')}>
                                        {product.discountPrice?.toLocaleString()}₫
                                    </p>
                                    <p className={cx('product-info__price')}>{product.price?.toLocaleString()}₫</p>
                                    <span className={cx('product-info__discount-percent')}>
                                        -{Math.round((1 - product.discountPrice / product.price) * 100)}%
                                    </span>
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
            <div ref={reviewSectionRef} className={cx('tab-container')}>
                <div className={cx('tab-buttons')}>
                    <button
                        onClick={() => setActiveTab('description')}
                        className={cx('tab-btn', { active: activeTab === 'description' })}
                    >
                        Mô tả
                    </button>
                    <button
                        onClick={() => setActiveTab('additional')}
                        className={cx('tab-btn', { active: activeTab === 'additional' })}
                    >
                        Thông số kĩ thuật
                    </button>
                    <button
                        onClick={() => {
                            setActiveTab('reviews');
                            setTimeout(() => {
                                reviewSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
                            }, 0); // đảm bảo render xong tab content
                        }}
                        className={cx('tab-btn', { active: activeTab === 'reviews' })}
                    >
                        Đánh giá ({reviews.length})
                    </button>
                </div>
                <br></br>
                <div ref={reviewSectionRef} className={cx('tab-content')}>
                    {renderTabContent()}
                </div>
            </div>

            {/* Related Products Section */}
            <div className={cx('related-products')}>
                <h2>Sản phẩm liên quan</h2>
                <div className={cx('swiper-wrapper-fix')}>
                    <Swiper
                        modules={[Navigation, Autoplay]}
                        spaceBetween={10}
                        slidesPerView={5}
                        loop={true}
                        autoplay={{ delay: 5000, disableOnInteraction: false }}
                        navigation={{
                            prevEl: `.${cx('prev-btn')}`,
                            nextEl: `.${cx('next-btn')}`,
                        }}
                        onInit={(swiper) => {
                            // Fix: for custom navigation buttons to work
                            swiper.params.navigation.prevEl = `.${cx('prev-btn')}`;
                            swiper.params.navigation.nextEl = `.${cx('next-btn')}`;
                            swiper.navigation.init();
                            swiper.navigation.update();
                        }}
                    >
                        {relatedProducts.map((item) => (
                            <SwiperSlide key={item._id}>
                                <ProductCard product={item} />
                            </SwiperSlide>
                        ))}
                    </Swiper>

                    {/* Button prev next */}
                    <button className={cx('prev-btn')}>
                        <FontAwesomeIcon icon={faAngleLeft} />
                    </button>
                    <button className={cx('next-btn')}>
                        <FontAwesomeIcon icon={faAngleRight} />
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ProductDetail;
