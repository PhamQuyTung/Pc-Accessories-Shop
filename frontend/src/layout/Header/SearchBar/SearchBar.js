import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMagnifyingGlass, faXmark } from '@fortawesome/free-solid-svg-icons';
import classNames from 'classnames/bind';
import axios from 'axios';
import { debounce } from 'lodash';
import styles from './SearchBar.module.scss';
import { formatCurrency } from '~/utils/formatCurrency';

const cx = classNames.bind(styles);

// Helper: Lấy tên hiển thị kèm biến thể mặc định
const getDisplayName = (product) => {
    const defaultVariant = product.defaultVariant || product.variations?.[0] || null;
    if (!defaultVariant) return product.name;

    const variantAttributes = defaultVariant.attributes || [];
    if (variantAttributes.length === 0) return product.name;

    const termsNames = variantAttributes
        .map((attr) => attr.term?.name || attr.terms?.map((t) => t.name).join(',') || '')
        .filter(Boolean);

    return termsNames.length > 0 ? `${product.name} - ${termsNames.join(' | ')}` : product.name;
};

// Helper: Lấy defaultVariant, thumbnail, price
const getDisplayData = (product) => {
    const defaultVariant = product.defaultVariant || product.variations?.[0] || null;
    const display = defaultVariant || product;
    const thumbnail = display.images?.[0] || product.images?.[0] || '/placeholder.png';
    const price = display.price ?? product.price ?? 0;
    const discountPrice = display.discountPrice ?? product.discountPrice ?? null;
    return { display, thumbnail, price, discountPrice };
};

function SearchBar() {
    const [placeholderText] = useState('Bạn cần tìm gì?...');
    const [displayText, setDisplayText] = useState('');
    const [placeholderIndex, setPlaceholderIndex] = useState(0);
    const [reverse, setReverse] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    const MAX_RESULTS = 6;

    const fetchSearchResults = useMemo(
        () =>
            debounce(async (query) => {
                if (query.trim().length < 2) {
                    setSearchResults([]);
                    setLoading(false);
                    return;
                }

                try {
                    setLoading(true);
                    const res = await axios.get(`/api/products/search?query=${encodeURIComponent(query)}`);
                    setSearchResults(res.data);
                } catch (error) {
                    console.error('Lỗi tìm kiếm:', error);
                    setSearchResults([]);
                } finally {
                    setLoading(false);
                }
            }, 300),
        [],
    );

    useEffect(() => {
        fetchSearchResults(searchTerm);
        return () => fetchSearchResults.cancel();
    }, [searchTerm, fetchSearchResults]);

    // Placeholder động
    useEffect(() => {
        const typingSpeed = 150;
        const pauseDuration = 1000;
        let timeout;

        if (!reverse && placeholderIndex < placeholderText.length) {
            timeout = setTimeout(() => {
                setDisplayText(placeholderText.slice(0, placeholderIndex + 1));
                setPlaceholderIndex((prev) => prev + 1);
            }, typingSpeed);
        } else if (!reverse && placeholderIndex === placeholderText.length) {
            timeout = setTimeout(() => setReverse(true), pauseDuration);
        } else if (reverse && placeholderIndex > 0) {
            timeout = setTimeout(() => {
                setDisplayText(placeholderText.slice(0, placeholderIndex - 1));
                setPlaceholderIndex((prev) => prev - 1);
            }, typingSpeed);
        } else if (reverse && placeholderIndex === 0) {
            timeout = setTimeout(() => setReverse(false), pauseDuration);
        }

        return () => clearTimeout(timeout);
    }, [placeholderIndex, reverse, placeholderText]);

    const handleNavigate = (target) => {
        navigate(target);
        setSearchTerm('');
        setSearchResults([]);
        setIsMobileSearchOpen(false);
    };

    const handleSearchSubmit = () => {
        if (searchTerm.trim()) handleNavigate(`/search?query=${encodeURIComponent(searchTerm.trim())}`);
    };

    const highlightText = (text, keyword) => {
        if (!keyword) return text;

        const regex = new RegExp(`(${keyword})`, 'gi');
        const parts = text.split(regex);

        return parts.map((part, index) => (regex.test(part) ? <mark key={index}>{part}</mark> : part));
    };

    return (
        <>
            {/* Desktop Search */}
            <div className={cx('search-wrapper', 'desktop')}>
                <input
                    className={cx('custom-input')}
                    type="text"
                    placeholder={displayText || ' '}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearchSubmit()}
                />
                <FontAwesomeIcon icon={faMagnifyingGlass} className={cx('search-icon')} onClick={handleSearchSubmit} />

                {(loading || searchResults.length > 0 || searchTerm.trim().length >= 2) && (
                    <div className={cx('search-dropdown')}>
                        {/* Loading */}
                        {loading && <div className={cx('search-loading')}>Đang tìm kiếm...</div>}

                        {/* Không có kết quả */}
                        {!loading && searchTerm.trim().length >= 2 && searchResults.length === 0 && (
                            <div className={cx('search-no-result')}>❌ Không tìm thấy sản phẩm phù hợp</div>
                        )}

                        {/* Có kết quả */}
                        {!loading && searchResults.length > 0 && (
                            <>
                                <ul className={cx('search-product-list')}>
                                    {searchResults.slice(0, MAX_RESULTS).map((item) => {
                                        const { thumbnail, price, discountPrice } = getDisplayData(item);
                                        const displayName = getDisplayName(item);

                                        return (
                                            <li key={item._id} onClick={() => handleNavigate(`/products/${item.slug}`)}>
                                                <img src={thumbnail} alt={displayName} />
                                                <div className={cx('info')}>
                                                    <span className={cx('link-product')}>
                                                        {highlightText(displayName, searchTerm)}
                                                    </span>
                                                    <span className={cx('price')}>
                                                        {discountPrice && discountPrice < price ? (
                                                            <>
                                                                <span className={cx('discount')}>
                                                                    {formatCurrency(discountPrice)}
                                                                </span>
                                                                <span className={cx('original')}>
                                                                    {formatCurrency(price)}
                                                                </span>
                                                            </>
                                                        ) : (
                                                            <span className={cx('price-normal')}>
                                                                {formatCurrency(price)}
                                                            </span>
                                                        )}
                                                    </span>
                                                </div>
                                            </li>
                                        );
                                    })}
                                </ul>

                                <div
                                    className={cx('search-see-more')}
                                    onClick={() => handleNavigate(`/search?query=${encodeURIComponent(searchTerm)}`)}
                                >
                                    🔍 Xem thêm kết quả cho “{searchTerm}”
                                </div>
                            </>
                        )}
                    </div>
                )}
            </div>

            {/* Mobile Search */}
            <div className={cx('mobile-icon')} onClick={() => setIsMobileSearchOpen(true)}>
                <FontAwesomeIcon icon={faMagnifyingGlass} />
            </div>

            {isMobileSearchOpen && (
                <div className={cx('mobile-search-overlay')}>
                    <div className={cx('mobile-search-bar')}>
                        <FontAwesomeIcon
                            icon={faXmark}
                            className={cx('close-btn')}
                            onClick={() => setIsMobileSearchOpen(false)}
                        />
                        <input
                            className={cx('mobile-input')}
                            type="text"
                            placeholder="Tìm kiếm sản phẩm..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearchSubmit()}
                            autoFocus
                        />
                        <FontAwesomeIcon icon={faMagnifyingGlass} onClick={handleSearchSubmit} />
                    </div>

                    {searchResults.length > 0 && (
                        <div className={cx('mobile-results')}>
                            {searchResults.map((item) => {
                                const { display, thumbnail, price, discountPrice } = getDisplayData(item);
                                const displayName = getDisplayName(item);
                                return (
                                    <div
                                        key={item._id}
                                        className={cx('mobile-item')}
                                        onClick={() => handleNavigate(`/products/${item.slug}`)}
                                    >
                                        <img src={thumbnail} alt={displayName} />
                                        <div>
                                            <p>{displayName}</p>
                                            <span>
                                                {discountPrice && discountPrice < price ? (
                                                    <>
                                                        <span className={cx('discount')}>
                                                            {formatCurrency(discountPrice)}
                                                        </span>
                                                        <span className={cx('original')}>{formatCurrency(price)}</span>
                                                    </>
                                                ) : (
                                                    <span>{formatCurrency(price)}</span>
                                                )}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}
        </>
    );
}

export default SearchBar;
