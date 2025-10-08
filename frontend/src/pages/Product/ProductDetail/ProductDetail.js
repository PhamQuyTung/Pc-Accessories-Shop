// --- Imports giữ nguyên ---
import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import axiosClient from '~/utils/axiosClient';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import { Row, Col } from 'react-bootstrap';
import styles from './ProductDetail.module.scss';
import classNames from 'classnames/bind';
import Breadcrumb from '~/components/Breadcrumb/Breadcrumb';
import ProductGallery from './ProductGallery';
// import BasicRating from '~/components/Rating/Rating';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAngleLeft, faAngleRight, faShoppingCart } from '@fortawesome/free-solid-svg-icons';
import { faHeart } from '@fortawesome/free-regular-svg-icons';
import { faHeart as solidHeart } from '@fortawesome/free-solid-svg-icons';
import ProductCard from '~/components/Product/ProductCard';
import SpinnerLoading from '~/components/SpinnerLoading/SpinnerLoading';
import { useToast } from '~/components/ToastMessager';
import cartEvent from '~/utils/cartEvent';
import ReviewList from '~/components/ReviewList/ReviewList';
import ExpandableContent from '~/components/ExpandableContent/ExpandableContent';
import GiftList from '~/components/GiftList/GiftList';

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

    const [isAddingToCart, setIsAddingToCart] = useState(false);

    const reviewSectionRef = useRef(null);

    const role = localStorage.getItem('role'); // hoặc lấy từ Redux: state.auth.user.role

    const navigate = useNavigate();

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
                    // ✅ Fix lỗi .map bằng cách đảm bảo status là mảng
                    res.data.status = Array.isArray(res.data.status)
                        ? res.data.status
                        : res.data.status
                          ? [res.data.status]
                          : [];

                    setProduct(res.data);
                    setLoading(false);
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
                .get(`http://localhost:5000/api/reviews/product/${product._id}`)
                .then((res) => {
                    setReviews(res.data);

                    const totalStars = res.data.reduce((sum, r) => sum + r.rating, 0);
                    const avg = res.data.length > 0 ? totalStars / res.data.length : 0;
                    setAverageRating(avg);
                })
                .catch((err) => console.error('Lỗi khi lấy đánh giá:', err));
        }
    }, [product]);

    // Kiểm tra trạng thái yêu thích của sản phẩm
    useEffect(() => {
        const checkFavorite = async () => {
            const token = localStorage.getItem('token');
            if (token && product?._id) {
                try {
                    const res = await axiosClient.get(`/favorites/${product._id}`, {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    });
                    setIsFavorite(res.data.isFavorite);
                } catch (error) {
                    console.error('Không thể kiểm tra trạng thái yêu thích:', error);
                }
            }
        };

        checkFavorite();
    }, [product]);

    useEffect(() => {
        if (product) {
            console.log('✅ product loaded:', product);
        }
    }, [product]);

    if (error) return <div>{error}</div>;
    if (loading) return <SpinnerLoading />;

    // Hàm xử lý thêm sản phẩm vào giỏ hàng
    const handleAddToCart = async () => {
        const token = localStorage.getItem('token');
        console.log('Token:', token);

        if (!token) {
            toast('Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng', 'warning');
            return;
        }

        setIsAddingToCart(true);

        try {
            const response = await axiosClient.post(
                '/carts/add',
                {
                    product_id: product._id,
                    quantity: quantity,
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                },
            );

            // Giữ trạng thái loading ít nhất 700ms để người dùng thấy rõ
            setTimeout(() => {
                toast(response.data.message || 'Đã thêm vào giỏ hàng', 'success');
                cartEvent.emit('update-cart-count'); // ✅ Gọi để Header cập nhật cartCount ngay
                setIsAddingToCart(false);
            }, 700);
        } catch (error) {
            console.error('Lỗi khi thêm sản phẩm vào giỏ hàng:', error);
            toast('Không thể thêm sản phẩm vào giỏ hàng', 'error');
            setIsAddingToCart(false); // vẫn phải tắt loading ngay nếu lỗi
        }
    };

    // Hàm xử lý gửi bình luận
    const handleSubmitReview = async () => {
        const token = localStorage.getItem('token');

        if (!token) {
            toast('Vui lòng đăng nhập để gửi đánh giá', 'warning');
            return;
        }

        if (selectedStar === 0 || reviewText.trim() === '') {
            toast('Vui lòng điền đánh giá', 'warning');
            return;
        }

        try {
            await axios.post(
                `http://localhost:5000/api/reviews/product/${product._id}`,
                {
                    productId: product._id,
                    rating: selectedStar,
                    comment: reviewText,
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                },
            );

            toast('Gửi đánh giá thành công!', 'success');

            // Reset form
            setReviewText('');
            setSelectedStar(0);
            setHoverStar(0);

            // Reload lại đánh giá
            const res = await axios.get(`http://localhost:5000/api/reviews/product/${product._id}`);
            setReviews(res.data);

            const totalStars = res.data.reduce((sum, r) => sum + r.rating, 0);
            const avg = res.data.length > 0 ? totalStars / res.data.length : 0;
            setAverageRating(avg);
        } catch (error) {
            console.error('Chi tiết lỗi:', error?.response?.data || error.message);
            toast('Không thể gửi đánh giá', 'error');
        }
    };

    // Hàm toggle yêu thích
    const toggleFavorite = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            toast('Vui lòng đăng nhập để sử dụng tính năng yêu thích', 'warning');
            return;
        }

        try {
            if (isFavorite) {
                // ✅ Bỏ thích
                await axiosClient.delete(`/favorites/${product._id}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                setIsFavorite(false);
                toast('Đã xóa khỏi mục yêu thích', 'info');
            } else {
                // ✅ Thêm vào yêu thích
                await axiosClient.post(
                    `/favorites`,
                    { product_id: product._id },
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    },
                );
                setIsFavorite(true);
                toast('Đã thêm vào mục yêu thích', 'success');
            }
        } catch (error) {
            console.error('Lỗi khi cập nhật yêu thích:', error);
            toast('Đã xảy ra lỗi, vui lòng thử lại sau', 'error');
        }
    };

    let specsData = {};

    if (Array.isArray(product.specs)) {
        product.specs.forEach((item) => {
            if (item.key && item.value) {
                specsData[item.key] = item.value;
            }
        });
    } else if (typeof product.specs === 'object' && product.specs !== null) {
        specsData = product.specs;
    }

    // Hàm hiển thị Tabcontent
    const renderTabContent = () => {
        switch (activeTab) {
            case 'description':
                return <ExpandableContent html={product.longDescription || '<p>Không có mô tả chi tiết</p>'} />;

            case 'additional':
                return (
                    <>
                        <table className={cx('specs-table')}>
                            <tbody>
                                {Object.entries(specsData).map(([key, value]) => (
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
                        <ReviewList reviews={reviews} />

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

    console.log('🔑 Role in localStorage:', role);

    return (
        <div className={cx('product-detail')}>
            <div className={cx('breadcrumb-wrap')}>
                {/* Breadcrumb */}
                <Breadcrumb />
                {/* ✅ Nút chỉ admin mới thấy */}
                {role === 'admin' && (
                    <div className={cx('admin-actions')}>
                        <Link to={`/products/edit/${product._id}`} className={cx('btn-admin__link')}>
                            ✏️ Chỉnh sửa
                        </Link>
                        <Link to="/admin/products/create" className={cx('btn-admin__link')}>
                            ➕ Thêm sản phẩm
                        </Link>
                    </div>
                )}
            </div>

            {/* Product-detail Main */}
            <div className={cx('product-detail__wraps')}>
                <Row>
                    <Col lg={6} md={12} xs={12}>
                        <div className={cx('product-slider')}>
                            <ProductGallery images={product.images} />
                        </div>
                    </Col>

                    <Col lg={6} md={12} xs={12}>
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

                                    <button className={cx('favorite-btn')} onClick={toggleFavorite}>
                                        <FontAwesomeIcon
                                            icon={isFavorite ? solidHeart : faHeart}
                                            className={cx({ 'favorite-icon--active': isFavorite })}
                                        />
                                    </button>
                                </div>

                                <div className={cx('product-info__cost')}>
                                    {product.discountPrice && product.discountPrice < product.price ? (
                                        <>
                                            <p className={cx('product-info__discountPrice')}>
                                                {product.discountPrice.toLocaleString()}₫
                                            </p>
                                            <p className={cx('product-info__price')}>
                                                {product.price.toLocaleString()}₫
                                            </p>
                                            <span className={cx('product-info__discount-percent')}>
                                                -{Math.round((1 - product.discountPrice / product.price) * 100)}%
                                            </span>
                                        </>
                                    ) : (
                                        <p className={cx('product-info__discountPrice')}>
                                            {product.price.toLocaleString()}₫
                                        </p>
                                    )}
                                </div>

                                <div className={cx('product-info__status')}>
                                    {product.status && product.status.length > 0 ? (
                                        product.status.map((st, idx) => (
                                            <span
                                                key={idx}
                                                className={cx('product-info__status--badge', {
                                                    'badge-new': st === 'sản phẩm mới',
                                                    'badge-many': st === 'nhiều hàng',
                                                    'badge-instock': st === 'còn hàng',
                                                    'badge-low': st === 'sắp hết hàng',
                                                    'badge-out': st === 'hết hàng',
                                                    'badge-importing': st === 'đang nhập hàng',
                                                })}
                                            >
                                                {st}
                                            </span>
                                        ))
                                    ) : (
                                        <span className={cx('product-info__status--badge', 'badge-default')}>
                                            Không có
                                        </span>
                                    )}
                                </div>

                                {/* ✅ Hiển thị quà tặng khuyến mãi */}
                                <GiftList gifts={product.gifts} />

                                <div className={cx('product-info__actions')}>
                                    {/* <div className={cx('quantity-control')}>
                                        <button onClick={() => setQuantity((prev) => Math.max(prev - 1, 1))}>−</button>
                                        <span>{quantity}</span>
                                        <button onClick={() => setQuantity((prev) => prev + 1)}>+</button>
                                    </div> */}

                                    <button
                                        className={cx('add-to-cart')}
                                        onClick={handleAddToCart}
                                        disabled={
                                            isAddingToCart ||
                                            product.status.includes('hết hàng') ||
                                            product.status.includes('đang nhập hàng')
                                        }
                                    >
                                        {/* <FontAwesomeIcon icon={faShoppingCart} />
                                        {isAddingToCart
                                            ? ' Đang thêm...'
                                            : product.status.includes('hết hàng')
                                              ? ' Hết hàng'
                                              : product.status.includes('đang nhập hàng')
                                                ? ' Đang nhập hàng'
                                                : ' Thêm vào giỏ'} */}
                                        <span className={cx('main-text')}>MUA NGAY</span>
                                        <span className={cx('sub-text')}>Giao tận nơi/Nhận tại cửa hàng</span>
                                    </button>

                                    <button
                                        className={cx('chat-now')}
                                        // onClick={handleAddToCart}
                                        // disabled={
                                        //     isAddingToCart ||
                                        //     product.status.includes('hết hàng') ||
                                        //     product.status.includes('đang nhập hàng')
                                        // }
                                    >
                                        {/* <FontAwesomeIcon icon={faShoppingCart} />
                                        {isAddingToCart
                                            ? ' Đang thêm...'
                                            : product.status.includes('hết hàng')
                                              ? ' Hết hàng'
                                              : product.status.includes('đang nhập hàng')
                                                ? ' Đang nhập hàng'
                                                : ' Thêm vào giỏ'} */}
                                        <span className={cx('main-text')}>TƯ VẤN NGAY</span>
                                        <span className={cx('sub-text')}>Đưa ra đánh giá nhanh, chính xác</span>
                                    </button>
                                </div>

                                <div
                                    className={cx('product-info__short-desc')}
                                    dangerouslySetInnerHTML={{ __html: product.shortDescription }}
                                ></div>
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
                <br />
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
