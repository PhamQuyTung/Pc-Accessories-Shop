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
import 'tippy.js/dist/tippy.css';
import 'tippy.js/animations/scale.css';
import namer from 'color-namer';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAngleLeft, faAngleRight, faShoppingCart } from '@fortawesome/free-solid-svg-icons';
import { faHeart } from '@fortawesome/free-regular-svg-icons';
import { faHeart as solidHeart } from '@fortawesome/free-solid-svg-icons';
import { useLocation } from 'react-router-dom';

import ProductGallery from './ProductGallery';
import Breadcrumb from '~/components/Breadcrumb/Breadcrumb';
import ProductCard from '~/components/Product/ProductCard';
import SpinnerLoading from '~/components/SpinnerLoading/SpinnerLoading';
import { useToast } from '~/components/ToastMessager';
import cartEvent from '~/utils/cartEvent';
import ReviewList from '~/components/ReviewList/ReviewList';
import ExpandableContent from '~/components/ExpandableContent/ExpandableContent';
import GiftList from '~/components/GiftList/GiftList';

const cx = classNames.bind(styles);

const COLOR_MAP = {
    Đen: '#000000',
    Trắng: '#FFFFFF',
    Hồng: '#FF69B4',
    Đỏ: '#FF0000',
    Xanh: '#1E90FF',
};

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

    const [promotionGifts, setPromotionGifts] = useState([]);

    const [selectedAttributes, setSelectedAttributes] = useState({});
    const [activeVariation, setActiveVariation] = useState(null);

    const [variations, setVariations] = useState([]);

    // map chứa các term bị disable theo attrId: { [attrId]: Set(termId, ...) }
    const [disabledOptions, setDisabledOptions] = useState({});

    const role = localStorage.getItem('role'); // hoặc lấy từ Redux: state.auth.user.role

    const [posts, setPosts] = useState([]);
    const location = useLocation();

    useEffect(() => {
        axiosClient
            .get('/posts?limit=4')
            .then((res) => {
                const data = res.data;
                setPosts(Array.isArray(data) ? data : data.posts || []);
            })
            .catch((err) => {
                console.error('Fetch posts error:', err);
                setPosts([]);
            });
    }, []);

    const navigate = useNavigate();

    const toast = useToast();

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN'); // ví dụ: 25/06/2025
    };

    const getColorHex = (name) => {
        // namer() trả về nhiều nhóm kết quả: basic, html, x11...
        // Mình dùng nhóm 'html' cho ổn định
        try {
            const result = namer(name);
            return result.html[0]?.hex || null;
        } catch (e) {
            return null;
        }
    };

    // ================= THÊM: Hàm handle bấm vào variation =================
    const handleSelectVariation = (variation) => {
        if (!variation.attributes || variation.attributes.length === 0) return;

        const attrs = {};
        variation.attributes.forEach((a) => {
            const attrId = typeof a.attrId === 'object' ? a.attrId._id : a.attrId;
            const termId = Array.isArray(a.terms) ? a.terms[0]._id : a.terms?._id;
            attrs[attrId] = termId;
        });

        setSelectedAttributes(attrs);
    };

    // Hàm chọn thuộc tính
    const handleSelectAttribute = (attrId, termId) => {
        setSelectedAttributes((prev) => {
            // nếu bấm lại cùng term => bỏ chọn (toggle)
            const already = prev[attrId] === termId;
            const next = { ...prev };
            if (already) {
                delete next[attrId];
            } else {
                next[attrId] = termId;
            }
            return next;
        });
    };

    useEffect(() => {
        if (product?._id) {
            axiosClient
                .get(`/promotion-gifts/by-product/${product._id}`)
                .then((res) => setPromotionGifts(res.data || []))
                .catch((err) => console.error('Lỗi khi lấy khuyến mãi:', err));
        }
    }, [product]);

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

    // Cập nhật biến thể đang hoạt động khi người dùng chọn thuộc tính
    useEffect(() => {
        if (!product?.variations || !Array.isArray(product.variations)) {
            setActiveVariation(null);
            return;
        }

        // Không yêu cầu chọn đủ tất cả attributes
        // Chỉ cần tìm variation match tất cả selectedAttributes hiện tại
        const selectedKeys = Object.keys(selectedAttributes);

        if (selectedKeys.length === 0) {
            setActiveVariation(null);
            return;
        }

        // Tìm variation mà:
        // - tất cả selectedAttributes đều khớp
        // - không cần chọn tất cả attributes của product
        const match = product.variations.find((variation) => {
            const attrs = {};
            (variation.attributes || []).forEach((a) => {
                const id = typeof a.attrId === 'object' ? a.attrId._id : a.attrId;
                const t = Array.isArray(a.terms) ? a.terms[0] : a.terms;
                const termId = typeof t === 'object' && t?._id ? t._id : t;
                attrs[id] = termId;
            });

            // Kiểm tra mọi selectedAttributes khớp
            return Object.entries(selectedAttributes).every(([k, v]) => attrs[k] === v);
        });

        setActiveVariation(match || null);
    }, [product, selectedAttributes]);

    useEffect(() => {
        console.log('🟡 Selected:', selectedAttributes);
        console.log('🟢 product.variations:', product?.variations);
        console.log('🟣 Active variation:', activeVariation);
    }, [selectedAttributes, activeVariation]);

    useEffect(() => {
        if (product) {
            console.log('✅ product loaded:', product);
        }
    }, [product]);

    // Thêm vào ProductDetail.js (debug)
    useEffect(() => {
        console.log('📊 Total product.attributes:', product?.attributes?.length);
        console.log('📊 Selected count:', Object.keys(selectedAttributes).length);

        // Log structure của variations
        product?.variations?.forEach((v, i) => {
            console.log(`Variation ${i}:`, {
                sku: v.sku,
                attributeCount: v.attributes?.length,
                attributes: v.attributes?.map((a) => ({
                    attrId: typeof a.attrId === 'object' ? a.attrId._id : a.attrId,
                    termId: Array.isArray(a.terms) ? a.terms[0] : a.terms,
                })),
            });
        });
    }, [product, selectedAttributes]);

    if (error) return <div>{error}</div>;
    if (loading) return <SpinnerLoading />;

    // Hàm xử lý thêm sản phẩm vào giỏ hàng
    const handleAddToCart = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            toast('Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng', 'warning');
            return;
        }

        if (!activeVariation) {
            toast('Vui lòng chọn đầy đủ biến thể trước khi mua', 'warning');
            return;
        }

        setIsAddingToCart(true);

        try {
            const response = await axiosClient.post(
                '/carts/add',
                {
                    product_id: product._id,
                    variation_id: activeVariation._id,
                    quantity: quantity,
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                },
            );
            toast(response.data.message || 'Đã thêm vào giỏ hàng', 'success');
        } catch (error) {
            toast('Không thể thêm sản phẩm vào giỏ hàng', 'error');
        } finally {
            setIsAddingToCart(false);
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

    // Hàm lấy tên hiển thị sản phẩm với biến thể
    const getProductDisplayName = () => {
        if (!activeVariation) return product.name;

        let variantText = [];

        // duyệt tất cả attributes của product
        product.attributes.forEach((attr) => {
            const attrId = attr.attrId._id;
            const termId = selectedAttributes[attrId];

            if (termId) {
                const termObj = attr.terms.find((t) => t._id === termId);
                if (termObj) {
                    variantText.push(`${attr.attrId.name}: ${termObj.name}`);
                }
            }
        });

        return `${product.name} ${variantText.join(' - ')}`;
    };

    console.log('🔑 Role in localStorage:', role);

    return (
        <div className={cx('product-detail')}>
            <div className={cx('breadcrumb-wrap')}>
                {/* Breadcrumb */}
                {product.category && (
                    <Breadcrumb
                        customData={[
                            { path: '/', label: 'Trang chủ' },
                            { path: `/categories/${product.category.slug}`, label: product.category.name },
                            { path: location.pathname, label: getProductDisplayName() },
                        ]}
                    />
                )}

                {/* ✅ Nút chỉ admin mới thấy */}
                {/* {role === 'admin' && (
                    <div className={cx('admin-actions')}>
                        <Link to={`/products/edit/${product._id}`} className={cx('btn-admin__link')}>
                            ✏️
                        </Link>
                        <Link to="/admin/products/create" className={cx('btn-admin__link')}>
                            ➕
                        </Link>
                    </div>
                )} */}
            </div>

            {/* Product-detail Main */}
            <div className={cx('product-detail__wraps')}>
                <Row>
                    <Col lg={6} md={12} xs={12}>
                        <div className={cx('product-slider')}>
                            <ProductGallery
                                images={activeVariation?.images?.length ? activeVariation.images : product.images}
                            />
                        </div>
                    </Col>

                    <Col lg={6} md={12} xs={12}>
                        <div className={cx('product-info')}>
                            <div className={cx('product-info__name')}>
                                <h1>{getProductDisplayName()}</h1>
                            </div>

                            <div className={cx('product-info__fsz16')}>
                                {/* Đánh giá sản phẩm */}
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

                                {product.variations && product.variations.length > 0 ? (
                                    <div className={cx('product-variations-grouped')}>
                                        <p className={cx('variations-label')}>Chọn biến thể:</p>
                                        <div className={cx('variations-grid')}>
                                            {getSortedVariations(product.variations).map((variation) => {
                                                const isActive = isVariationMatching(variation, selectedAttributes);
                                                const label = getVariationLabel(variation);

                                                return (
                                                    <button
                                                        key={variation._id}
                                                        onClick={() => handleSelectVariation(variation)}
                                                        className={cx('variation-btn', {
                                                            active: isActive,
                                                        })}
                                                        title={label}
                                                    >
                                                        <span className={cx('variation-text')}>{label}</span>
                                                        {variation.price && (
                                                            <span className={cx('variation-price')}>
                                                                {variation.discountPrice
                                                                    ? variation.discountPrice.toLocaleString()
                                                                    : variation.price.toLocaleString()}
                                                                ₫
                                                            </span>
                                                        )}
                                                    </button>
                                                );
                                            })}
                                        </div>

                                        {/* ✅ Hiển thị quà tặng khuyến mãi */}
                                        <GiftList gifts={product.gifts} />
                                    </div>
                                ) : product.attributes && product.attributes.length > 0 ? (
                                    // Fallback: nếu không có variations nhưng có attributes, render attributes cũ
                                    <div className={cx('product-attributes')}>
                                        {getSortedAttributes(product.attributes).map((attr) => {
                                            const attrId = attr.attrId._id;
                                            const isColorAttr =
                                                attr.attrId.name.toLowerCase().includes('màu') ||
                                                attr.attrId.name.toLowerCase().includes('color');

                                            return (
                                                <div key={attrId} className={cx('product-attribute')}>
                                                    <p className={cx('attr-label')}>{attr.attrId.name}:</p>

                                                    <div className={cx('attr-options')}>
                                                        {attr.terms?.map((term) => {
                                                            const termId = term._id;
                                                            const isActive = selectedAttributes[attrId] === termId;

                                                            let colorCode =
                                                                term.colorCode || COLOR_MAP[term.name] || null;

                                                            if (isColorAttr) {
                                                                return (
                                                                    <div
                                                                        key={termId}
                                                                        className={cx('attr-option', 'color-option', {
                                                                            active: isActive,
                                                                        })}
                                                                        onClick={() =>
                                                                            handleSelectAttribute(attrId, termId)
                                                                        }
                                                                    >
                                                                        <button
                                                                            className={cx(
                                                                                'attr-option',
                                                                                'attr-option__color',
                                                                                'color-option',
                                                                                {
                                                                                    active: isActive,
                                                                                },
                                                                            )}
                                                                            style={{
                                                                                backgroundColor: colorCode || '#ccc',
                                                                            }}
                                                                        ></button>
                                                                        <span className={cx('color-name')}>
                                                                            {term.name}
                                                                        </span>
                                                                    </div>
                                                                );
                                                            }

                                                            return (
                                                                <button
                                                                    key={termId}
                                                                    onClick={() =>
                                                                        handleSelectAttribute(attrId, termId)
                                                                    }
                                                                    className={cx('attr-option', {
                                                                        active: isActive,
                                                                    })}
                                                                >
                                                                    {term.name}
                                                                </button>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            );
                                        })}

                                        <GiftList gifts={product.gifts} />
                                    </div>
                                ) : null}

                                {/* Giá sản phẩm */}
                                <div className={cx('product-info__cost')}>
                                    {activeVariation ? (
                                        <>
                                            {activeVariation.discountPrice ? (
                                                <>
                                                    <p className={cx('product-info__discountPrice')}>
                                                        {activeVariation.discountPrice.toLocaleString()}₫
                                                    </p>
                                                    <p className={cx('product-info__price')}>
                                                        {activeVariation.price.toLocaleString()}₫
                                                    </p>
                                                </>
                                            ) : (
                                                <p className={cx('product-info__discountPrice')}>
                                                    {activeVariation.price.toLocaleString()}₫
                                                </p>
                                            )}
                                        </>
                                    ) : (
                                        <>
                                            {product.discountPrice ? (
                                                <>
                                                    <p className={cx('product-info__discountPrice')}>
                                                        {product.discountPrice.toLocaleString()}₫
                                                    </p>
                                                    <p className={cx('product-info__price')}>
                                                        {product.price.toLocaleString()}₫
                                                    </p>
                                                </>
                                            ) : (
                                                <p className={cx('product-info__discountPrice')}>
                                                    {product.price.toLocaleString()}₫
                                                </p>
                                            )}
                                        </>
                                    )}
                                </div>

                                {activeVariation && (
                                    <p className={cx('sku-tag')}>
                                        Mã biến thể: <strong>{activeVariation.sku}</strong>
                                    </p>
                                )}

                                {/* Trạng thái sản phẩm */}
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

                                {/* Nút mua sản phẩm & nút chat ngay */}
                                <div className={cx('product-info__actions')}>
                                    <button
                                        className={cx('add-to-cart')}
                                        onClick={handleAddToCart}
                                        disabled={
                                            isAddingToCart ||
                                            product.status.includes('hết hàng') ||
                                            product.status.includes('đang nhập hàng')
                                        }
                                    >
                                        <span className={cx('main-text')}>MUA NGAY</span>
                                        <span className={cx('sub-text')}>Giao tận nơi/Nhận tại cửa hàng</span>
                                    </button>

                                    <button className={cx('chat-now')}>
                                        <span className={cx('main-text')}>TƯ VẤN NGAY</span>
                                        <span className={cx('sub-text')}>Đưa ra đánh giá nhanh, chính xác</span>
                                    </button>
                                </div>

                                {/* Mô tả ngắn */}
                                <div
                                    className={cx('product-info__short-desc')}
                                    dangerouslySetInnerHTML={{ __html: product.shortDescription }}
                                ></div>

                                {/* ✅ Khuyến mãi kèm theo */}
                                {promotionGifts.length > 0 && (
                                    <div className={cx('promotion-section')}>
                                        <h4>Khuyến mãi</h4>
                                        <ul className={cx('promotion-list')}>
                                            {promotionGifts.map((promo) => (
                                                <li key={promo._id}>
                                                    <span className={cx('icon')}>✅</span>
                                                    <span>
                                                        {promo.title}.{' '}
                                                        {promo.link && (
                                                            <Link to={promo.link} rel="noopener noreferrer">
                                                                (Xem thêm)
                                                            </Link>
                                                        )}
                                                    </span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        </div>
                    </Col>
                </Row>
            </div>

            {/* Tabs + Tin tức section */}
            <Row className={cx('tab-news-section')}>
                {/* --- Cột trái: Tabs (8 cột) --- */}
                <Col lg={8} md={12}>
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
                                    setActiveTab('newreviews');
                                    setTimeout(() => {
                                        reviewSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
                                    }, 0);
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
                </Col>

                {/* --- Cột phải: Bài viết mới nhất (4 cột) --- */}
                <Col lg={4} md={12}>
                    <div className={cx('news-section')}>
                        <h3 className={cx('news-title')}>Bài viết mới nhất</h3>

                        {posts.length === 0 ? (
                            <p>Không có bài viết nào.</p>
                        ) : (
                            <ul className={cx('news-list')}>
                                {posts.map((post) => (
                                    <li key={post._id} className={cx('news-item')}>
                                        <Link
                                            to={`/blog/category/${post.category?.slug}/${post.slug}`}
                                            className={cx('news-link')}
                                        >
                                            <div className={cx('news-thumb')}>
                                                {post.image ? (
                                                    <img src={post.image} alt={post.title} />
                                                ) : (
                                                    <div className={cx('no-thumb')}>Không có ảnh</div>
                                                )}
                                            </div>
                                            <div className={cx('news-info')}>
                                                <h5 className={cx('news-item-title')}>{post.title}</h5>
                                                <p className={cx('news-date')}>{formatDate(post.createdAt)}</p>
                                            </div>
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </Col>
            </Row>

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

// Hàm định nghĩa thứ tự ưu tiên của các attribute
const getAttributePriority = (attrName) => {
    const lowerName = attrName.toLowerCase();
    if (lowerName.includes('màu') || lowerName.includes('color')) return 0;
    if (lowerName.includes('size') || lowerName.includes('kích')) return 1;
    if (lowerName.includes('chất') || lowerName.includes('material')) return 2;
    return 999; // các attribute khác cuối cùng
};

// Hàm sort attributes theo thứ tự ưu tiên
const getSortedAttributes = (attrs) => {
    if (!Array.isArray(attrs)) return attrs;
    return [...attrs].sort((a, b) => {
        const aPriority = getAttributePriority(a.attrId.name);
        const bPriority = getAttributePriority(b.attrId.name);
        return aPriority - bPriority;
    });
};

// ================= THAY THẾ: Từ render individual attributes → render grouped variations =================
// Thêm hàm helper để tạo label variation
const getVariationLabel = (variation) => {
    if (!variation.attributes || variation.attributes.length === 0) {
        return 'Chưa xác định';
    }

    return variation.attributes
        .map((attr) => {
            const attrName = attr.attrId?.name || 'Attr';
            const termName = attr.terms
                ? Array.isArray(attr.terms)
                    ? attr.terms[0]?.name
                    : attr.terms?.name
                : attr.termId;
            return `${attrName}: ${termName}`;
        })
        .join(' - ');
};

// Thêm hàm để xác định xem variation này có match selectedAttributes không
const isVariationMatching = (variation, selectedAttributes) => {
    if (!variation.attributes || variation.attributes.length === 0) {
        return false;
    }

    const attrs = {};
    (variation.attributes || []).forEach((a) => {
        const attrId = typeof a.attrId === 'object' ? a.attrId._id : a.attrId;
        const termId = Array.isArray(a.terms) ? a.terms[0]._id : a.terms?._id;
        attrs[attrId] = termId;
    });

    return Object.entries(selectedAttributes).every(([k, v]) => attrs[k] === v);
};

// Thêm hàm để sort variations (optional - sắp xếp theo attributes order)
const getSortedVariations = (variations) => {
    if (!Array.isArray(variations)) return variations;
    return [...variations].sort((a, b) => {
        const labelA = getVariationLabel(a);
        const labelB = getVariationLabel(b);
        return labelA.localeCompare(labelB);
    });
};
