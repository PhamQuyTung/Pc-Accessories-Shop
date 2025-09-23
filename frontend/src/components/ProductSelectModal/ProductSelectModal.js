import React, { useState, useEffect } from 'react';
import classNames from 'classnames/bind';
import styles from './ProductSelectModal.module.scss';

import LoadingSpinner from '../SpinnerLoading/SpinnerLoading';
import Pagination from '../Pagination/Pagination'; // 👈 import component pagination

const cx = classNames.bind(styles);

const ProductSelectModal = ({ onAdd, onClose }) => {
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [products, setProducts] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [opening, setOpening] = useState(false);
    const [closing, setClosing] = useState(false);
    const [loading, setLoading] = useState(false);

    // 👇 state phân trang
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 5;

    useEffect(() => {
        fetch('/api/categories')
            .then((res) => res.json())
            .then((data) => setCategories(data));
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => setOpening(true), 10);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        const delayDebounce = setTimeout(() => {
            setLoading(true);
            const url =
                searchTerm.trim() !== ''
                    ? `/api/products?search=${encodeURIComponent(searchTerm)}${
                          selectedCategory ? `&categoryId=${selectedCategory}` : ''
                      }&limit=9999`
                    : selectedCategory
                      ? `/api/products?categoryId=${selectedCategory}&limit=9999`
                      : `/api/products?limit=9999`;

            fetch(url)
                .then((res) => res.json())
                .then((data) => {
                    setTimeout(() => {
                        setProducts(data.products || []);
                        setLoading(false);
                        setCurrentPage(1); // reset về trang 1 khi search/filter
                    }, 500);
                });
        }, 400);

        return () => clearTimeout(delayDebounce);
    }, [searchTerm, selectedCategory]);

    const filteredProducts = (products || []).filter((p) => p.name.toLowerCase().includes(searchTerm.toLowerCase()));

    const totalPages = Math.ceil(filteredProducts.length / pageSize);
    const paginatedProducts = filteredProducts.slice((currentPage - 1) * pageSize, currentPage * pageSize);

    const handleAdd = () => {
        if (!selectedProduct || quantity <= 0) return;

        const finalPrice = selectedProduct.discountPrice > 0 ? selectedProduct.discountPrice : selectedProduct.price;

        onAdd({
            productId: selectedProduct._id,
            productName: selectedProduct.name,
            price: selectedProduct.price, // giá gốc
            discountPrice: selectedProduct.discountPrice || 0, // giá khuyến mãi (0 nếu không có)
            finalPrice, // giá thực tế áp dụng
            quantity: parseInt(quantity, 10),
        });

        setQuantity(1);
        setSelectedProduct(null);
        handleClose();
    };

    const handleClose = () => {
        setClosing(true);
        setOpening(false);
        setTimeout(() => {
            onClose();
        }, 300);
    };

    return (
        <div className={cx('overlay', { closing, opening })}>
            <div className={cx('modal', { closing, opening })}>
                <button className={cx('close-btn')} onClick={handleClose}>
                    ✖
                </button>

                <h3>Chọn sản phẩm</h3>

                <div className={cx('filters')}>
                    <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
                        <option value="">-- Chọn danh mục --</option>
                        {categories.map((c) => (
                            <option key={c._id} value={c._id}>
                                {c.name}
                            </option>
                        ))}
                    </select>

                    <input
                        type="text"
                        placeholder="Tìm sản phẩm..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <table>
                    <thead>
                        <tr>
                            <th>Tên</th>
                            <th className={cx('th-txtEnd')}>Giá gốc</th>
                            <th className={cx('th-txtEnd')}>Giá KM</th>
                            <th className={cx('th-txtEnd')}>Giá cuối</th>
                            <th className={cx('th-w80px')}>Tồn kho</th>
                            <th className={cx('th-w80px')}></th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan={6} className={cx('text-center')}>
                                    <LoadingSpinner />
                                </td>
                            </tr>
                        ) : paginatedProducts.length > 0 ? (
                            paginatedProducts.map((p) => {
                                const finalPrice = p.discountPrice > 0 ? p.discountPrice : p.price;
                                return (
                                    <tr key={p._id}>
                                        <td className={cx('name')}>{p.name}</td>
                                        <td className={cx('cost')}>{p.price.toLocaleString('vi-VN')} ₫</td>
                                        <td className={cx('discount')}>
                                            {p.discountPrice > 0 ? `${p.discountPrice.toLocaleString('vi-VN')} ₫` : '—'}
                                        </td>
                                        <td className={cx('final-price')}>{finalPrice.toLocaleString('vi-VN')} ₫</td>
                                        <td className={cx('quantity')}>{p.quantity ?? '—'}</td>
                                        <td>
                                            <button className={cx('btn')} onClick={() => setSelectedProduct(p)}>
                                                Chọn
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })
                        ) : (
                            <tr>
                                <td colSpan={6} className={cx('text-center')}>
                                    Không có sản phẩm
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>

                {/* 👇 Thêm pagination */}
                {totalPages > 1 && (
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={(page) => setCurrentPage(page)}
                    />
                )}

                {/* chọn sản phẩm ở footer */}
                {selectedProduct && (
                    <div className={cx('footer')}>
                        <div className={cx('footer-title')}>
                            <h3>Chọn số lượng</h3>
                        </div>

                        <div className={cx('footer-body')}>
                            <span>
                                {selectedProduct.name} -{' '}
                                {(selectedProduct.discountPrice > 0
                                    ? selectedProduct.discountPrice
                                    : selectedProduct.price
                                ).toLocaleString('vi-VN')}{' '}
                                ₫
                            </span>
                            <input
                                type="number"
                                min="1"
                                value={quantity}
                                onChange={(e) => setQuantity(e.target.value)}
                            />
                            <div className={cx('btn-wrapp')}>
                                <button className={cx('btn', 'success')} onClick={handleAdd}>
                                    ✅ Thêm
                                </button>
                                <button className={cx('btn', 'danger')} onClick={handleClose}>
                                    ❌ Hủy
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProductSelectModal;
