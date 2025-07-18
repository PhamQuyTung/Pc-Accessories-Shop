import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';
import classNames from 'classnames/bind';
import axios from 'axios';
import { debounce } from 'lodash';
import styles from './SearchBar.module.scss';
import { formatCurrency } from '~/utils/formatCurrency';

const cx = classNames.bind(styles);

function SearchBar() {
    const [placeholderText] = useState('Bạn cần tìm gì?...');
    const [displayText, setDisplayText] = useState('');
    const [placeholderIndex, setPlaceholderIndex] = useState(0);
    const [reverse, setReverse] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const navigate = useNavigate();

    const fetchSearchResults = debounce(async (query) => {
        if (!query) return setSearchResults([]);

        try {
            const res = await axios.get(`http://localhost:5000/api/products/search?query=${query}`);
            setSearchResults(res.data);
        } catch (error) {
            console.error('Lỗi tìm kiếm:', error);
        }
    }, 300);

    useEffect(() => {
        fetchSearchResults(searchTerm);
    }, [searchTerm]);

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
    };

    return (
        <div className={cx('search-wrapper')}>
            <input
                className={cx('custom-input')}
                type="text"
                placeholder={displayText || ' '}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' && searchTerm.trim()) {
                        handleNavigate(`/search?query=${encodeURIComponent(searchTerm.trim())}`);
                    }
                }}
            />

            <FontAwesomeIcon
                icon={faMagnifyingGlass}
                className={cx('search-icon')}
                onClick={() => {
                    if (searchTerm.trim()) {
                        handleNavigate(`/search?query=${encodeURIComponent(searchTerm.trim())}`);
                    }
                }}
            />

            {searchResults.length > 0 && (
                <div className={cx('search-dropdown')}>
                    <ul className={cx('search-product-list')}>
                        {searchResults.map((item) => (
                            <li key={item._id} onClick={() => handleNavigate(`/products/${item.slug}`)}>
                                <img src={item.images?.[0]} alt={item.name} />
                                <div className={cx('info')}>
                                    <span className={cx('link-product')}>{item.name}</span>
                                    <span className={cx('price')}>
                                        {item.discountPrice ? (
                                            <>
                                                <span className={cx('discount')}>
                                                    {formatCurrency(item.discountPrice)}
                                                </span>
                                                <span className={cx('original')}>{formatCurrency(item.price)}</span>
                                            </>
                                        ) : (
                                            <span>{formatCurrency(item.price)}</span>
                                        )}
                                    </span>
                                </div>
                            </li>
                        ))}
                    </ul>

                    <div
                        className={cx('search-see-more')}
                        onClick={() => handleNavigate(`/search?query=${encodeURIComponent(searchTerm)}`)}
                    >
                        🔍 Xem thêm kết quả cho “{searchTerm}”
                    </div>

                    <div className={cx('search-suggestions')}>
                        <p>Gợi ý nhanh:</p>
                        <div className={cx('tags')}>
                            <span>Laptop gaming</span>
                            <span>Chuột Logitech</span>
                            <span>Bàn phím cơ</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default SearchBar;
