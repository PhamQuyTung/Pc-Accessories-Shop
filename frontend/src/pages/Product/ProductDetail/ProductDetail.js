// ProductDetail.js
import React, { useEffect, useRef, useMemo, useState } from 'react';
import { useParams, useLocation, useSearchParams } from 'react-router-dom';
import classNames from 'classnames/bind';
import { Row, Col } from 'react-bootstrap';
import axiosClient from '~/utils/axiosClient';

import SpinnerLoading from '~/components/SpinnerLoading/SpinnerLoading';
import Breadcrumb from '~/components/Breadcrumb/Breadcrumb';
import ProductGallery from './components/ProductGallery/ProductGallery';
import ProductRating from './components/ProductRating/ProductRating';
import FavoriteButton from './components/FavoriteButton/FavoriteButton';
import VariationSelector from './components/VariationSelector/VariationSelector';
import PriceDisplay from './components/PriceDisplay/PriceDisplay';
import SKUDisplay from './components/SKUDisplay/SKUDisplay';
import ProductStockStatus from './components/ProductStockStatus/ProductStockStatus';
import ProductActions from './components/ProductActions/ProductActions';
import ProductShortDescription from './components/ProductShortDescription/ProductShortDescription';
import PromotionSection from './components/PromotionSection/PromotionSection';
import ProductTabs from './components/ProductTabs/ProductTabs';
import NewsSection from './components/NewsSection/NewsSection';
import RelatedProductsSlider from './components/RelatedProductsSlider/RelatedProductsSlider';
import ProductName from './components/ProductName/ProductName';
import ReviewList from '~/components/ReviewList/ReviewList';
import ExpandableContent from '~/components/ExpandableContent/ExpandableContent';
import { useToast } from '~/components/ToastMessager';

import useProductDetail from './hooks/useProductDetail';
import useProductVariations from './hooks/useProductVariations';
import useProductReviews from './hooks/useProductReviews';
import useCart from './hooks/useCart';
import useFavorite from './hooks/useFavorite';

import styles from './ProductDetail.module.scss';
const cx = classNames.bind(styles);

// COLOR_MAP để map tên màu sang mã HEX
const COLOR_MAP = {
    Đen: '#000000',
    Trắng: '#FFFFFF',
    Hồng: '#FF69B4',
    Đỏ: '#FF0000',
    Xanh: '#1E90FF',
};

// Trạng thái sản phẩm dựa trên quantity
const getVariationStatus = (variation) => {
    if (!variation) return 'không có';
    const qty = Number(variation.quantity) || 0;
    if (qty === 0) return 'hết hàng';
    if (qty < 5) return 'sắp hết hàng';
    if (qty < 10) return 'còn hàng';
    if (qty < 15) return 'nhiều hàng';
    return 'sản phẩm mới';
};

// =========================
// ProductDetail Container
// =========================
export default function ProductDetail() {
    const { slug } = useParams();
    const location = useLocation();
    const toast = useToast();
    const [searchParams] = useSearchParams();
    const vid = searchParams.get('vid');

    // Data hooks
    const { product, posts, relatedProducts, promotionGifts, loading, error } = useProductDetail(slug);
    const { selectedAttributes, activeVariation, handleSelectAttribute, handleSelectVariation } = useProductVariations(
        product,
        vid,
    );
    const { reviews, averageRating, submitReview } = useProductReviews(product?._id, toast);

    const userId = useMemo(() => {
        try {
            const user = JSON.parse(localStorage.getItem('user') || 'null');
            return user?._id || null;
        } catch {
            return null;
        }
    }, []);
    const cart = useCart(userId);
    const fav = useFavorite(userId);

    const [quantity, setQuantity] = useState(1);
    const [isAddingToCart, setIsAddingToCart] = useState(false);
    const [activeTab, setActiveTab] = useState('description');
    const reviewSectionRef = useRef(null);

    const displayImages = activeVariation?.images?.length ? activeVariation.images : product?.images || [];

    useEffect(() => window.scrollTo(0, 0), [product?._id]);

    if (error) return <div>{error}</div>;
    if (loading || !product) return <SpinnerLoading />;

    return (
        <ProductDetailView
            product={product}
            posts={posts}
            relatedProducts={relatedProducts}
            promotionGifts={promotionGifts}
            displayImages={displayImages}
            activeVariation={activeVariation}
            selectedAttributes={selectedAttributes}
            handleSelectAttribute={handleSelectAttribute}
            handleSelectVariation={handleSelectVariation}
            reviews={{ reviews, averageRating, submitReview }}
            cart={cart}
            fav={fav}
            quantityState={{ quantity, setQuantity }}
            isAddingToCartState={{ isAddingToCart, setIsAddingToCart }}
            activeTabState={{ activeTab, setActiveTab }}
            reviewSectionRef={reviewSectionRef}
            toast={toast}
            location={location}
        />
    );
}

// =========================
// ProductDetail View (Presentational)
// =========================
function ProductDetailView({
    product,
    posts,
    relatedProducts,
    promotionGifts,
    displayImages,
    activeVariation,
    selectedAttributes,
    handleSelectAttribute,
    handleSelectVariation,
    reviews,
    cart,
    fav,
    quantityState,
    isAddingToCartState,
    activeTabState,
    reviewSectionRef,
    toast,
    location,
}) {
    const { quantity, setQuantity } = quantityState;
    const { isAddingToCart, setIsAddingToCart } = isAddingToCartState;
    const { activeTab, setActiveTab } = activeTabState;

    // Thêm vào giỏ
    const handleAddToCart = async () => {
        const token = localStorage.getItem('token');
        if (!token) return toast('Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng', 'warning');
        if (!activeVariation) return toast('Vui lòng chọn biến thể', 'warning');

        setIsAddingToCart(true);
        try {
            if (cart?.addToCart) {
                await cart.addToCart(product._id, activeVariation._id, quantity);
            } else {
                await axiosClient.post('/carts/add', {
                    product_id: product._id,
                    variation_id: activeVariation._id,
                    quantity,
                });
            }
            toast('Đã thêm vào giỏ hàng', 'success');
        } catch (err) {
            console.error(err);
            toast('Không thể thêm sản phẩm vào giỏ hàng', 'error');
        } finally {
            setIsAddingToCart(false);
        }
    };

    // Toggle favorite
    const handleToggleFavorite = async () => {
        const token = localStorage.getItem('token');
        if (!token) return toast('Vui lòng đăng nhập để sử dụng tính năng yêu thích', 'warning');

        try {
            if (fav.isFavorite(product._id)) await fav.removeFavorite(product._id);
            else await fav.addFavorite(product._id);
        } catch (err) {
            console.error(err);
            toast('Không thể cập nhật yêu thích', 'error');
        }
    };

    const handleClickRating = () => {
        setActiveTab('reviews');
        setTimeout(() => reviewSectionRef.current?.scrollIntoView({ behavior: 'smooth' }), 0);
    };

    // Render nội dung tab
    const renderTabContent = () => {
        switch (activeTab) {
            case 'description':
                return <ExpandableContent html={product.longDescription || '<p>Không có mô tả chi tiết</p>'} />;
            case 'additional':
                return <SpecsTable specs={product.specs} />;
            case 'reviews':
                return (
                    <div ref={reviewSectionRef}>
                        <h3>Đánh giá của khách hàng</h3>
                        <ReviewList reviews={reviews.reviews} />
                        <AddReviewForm productId={product._id} submitReview={reviews.submitReview} toast={toast} />
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className={cx('product-detail')}>
            <BreadcrumbSection product={product} location={location} />
            <div className={cx('product-detail__wraps')}>
                <Row>
                    <Col lg={6} md={12}>
                        <ProductGallery images={displayImages} />
                    </Col>
                    <Col lg={6} md={12}>
                        <div className={cx('product-info')}>
                            <ProductName
                                product={product}
                                activeVariation={activeVariation}
                                selectedAttributes={selectedAttributes}
                            />
                            <div className={cx('product-info__fsz16')}>
                                <div className={cx('product-info__rating')}>
                                    <ProductRating
                                        averageRating={reviews.averageRating}
                                        reviewCount={reviews.reviews.length}
                                        onClickRatings={handleClickRating}
                                    />
                                    <FavoriteButton
                                        productId={product._id}
                                        isFavorite={fav.isFavorite(product._id)}
                                        onClick={handleToggleFavorite}
                                    />
                                </div>

                                <VariationSelector
                                    product={product}
                                    selectedAttributes={selectedAttributes}
                                    activeVariation={activeVariation}
                                    onSelectVariation={handleSelectVariation}
                                    onSelectAttribute={handleSelectAttribute}
                                    COLOR_MAP={COLOR_MAP}
                                />
                                <PriceDisplay activeVariation={activeVariation} product={product} />
                                <SKUDisplay activeVariation={activeVariation} />
                                <ProductStockStatus
                                    activeVariation={activeVariation}
                                    product={product}
                                    getVariationStatus={getVariationStatus}
                                />
                                <ProductActions
                                    isAddingToCart={isAddingToCart}
                                    product={product}
                                    activeVariation={activeVariation}
                                    onAddToCart={handleAddToCart}
                                    quantity={quantity}
                                    setQuantity={setQuantity}
                                />
                                <ProductShortDescription shortDescription={product.shortDescription} />
                                <PromotionSection promotions={promotionGifts || product.promotions} />
                            </div>
                        </div>
                    </Col>
                </Row>
            </div>

            <Row className={cx('tab-news-section')}>
                <Col lg={8} md={12}>
                    <ProductTabs activeTab={activeTab} onChangeTab={setActiveTab} renderTabContent={renderTabContent} />
                </Col>
                <Col lg={4} md={12}>
                    <NewsSection news={posts} />
                </Col>
            </Row>

            <RelatedProductsSlider relatedProducts={relatedProducts} />
        </div>
    );
}

// =========================
// Helper Components
// =========================
function BreadcrumbSection({ product, location }) {
    if (!product.category) return null;
    return (
        <div className={cx('breadcrumb-wrap')}>
            <Breadcrumb
                customData={[
                    { path: '/', label: 'Trang chủ' },
                    { path: `/categories/${product.category.slug}`, label: product.category.name },
                    { path: location.pathname, label: product.name },
                ]}
            />
        </div>
    );
}

function SpecsTable({ specs }) {
    const built = buildSpecs(specs);
    return (
        <table className={cx('specs-table')}>
            <tbody>
                {Object.entries(built).map(([k, v]) => (
                    <tr key={k}>
                        <td className={cx('specs-key')}>{k}</td>
                        <td className={cx('specs-value')}>{v}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
}

function AddReviewForm({ productId, submitReview, toast }) {
    const [hoverStar, setHoverStar] = useState(0);
    const [selectedStar, setSelectedStar] = useState(0);
    const [reviewText, setReviewText] = useState('');

    const onSubmit = async () => {
        if (!selectedStar || !reviewText.trim()) return toast('Vui lòng điền đánh giá', 'warning');
        await submitReview(selectedStar, reviewText);
        setSelectedStar(0);
        setHoverStar(0);
        setReviewText('');
    };

    return (
        <div className={cx('add-review')}>
            <h4>Thêm đánh giá của bạn</h4>
            <textarea
                className={cx('review-textarea')}
                rows={5}
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
            />
            <div className={cx('rating-stars')}>
                {[1, 2, 3, 4, 5].map((star) => (
                    <span
                        key={star}
                        className={cx('star', { active: (hoverStar || selectedStar) >= star })}
                        onMouseEnter={() => setHoverStar(star)}
                        onMouseLeave={() => setHoverStar(0)}
                        onClick={() => setSelectedStar(star)}
                    >
                        &#9733;
                    </span>
                ))}
            </div>
            <button className={cx('submit-review-btn')} onClick={onSubmit}>
                Gửi đánh giá
            </button>
        </div>
    );
}

function buildSpecs(specs) {
    if (!specs) return {};
    if (Array.isArray(specs))
        return specs.reduce((acc, cur) => {
            if (cur?.key && cur?.value) acc[cur.key] = cur.value;
            return acc;
        }, {});
    if (typeof specs === 'object') return specs;
    return {};
}
