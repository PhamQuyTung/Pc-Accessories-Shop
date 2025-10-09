import React, { useState, useEffect } from 'react';
import classNames from 'classnames/bind';
import styles from './ProductSelectModal.module.scss';
import Swal from 'sweetalert2';
import axiosClient from '~/utils/axiosClient';

import LoadingSpinner from '../SpinnerLoading/SpinnerLoading';
import Pagination from '../Pagination/Pagination';

const cx = classNames.bind(styles);

const ProductSelectModal = ({ onAdd, onClose, currentOrderItems = [] }) => {
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [products, setProducts] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [opening, setOpening] = useState(false);
    const [closing, setClosing] = useState(false);
    const [loading, setLoading] = useState(false);

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 5;

    // 🔹 Lấy danh mục
    useEffect(() => {
        axiosClient
            .get('/categories')
            .then((res) => setCategories(res.data || []))
            .catch((err) => console.error('Lỗi tải danh mục:', err));
    }, []);

    // 🔹 Animation mở modal
    useEffect(() => {
        const timer = setTimeout(() => setOpening(true), 10);
        return () => clearTimeout(timer);
    }, []);

    // 🔹 Lấy danh sách sản phẩm (khi search / chọn danh mục)
    useEffect(() => {
        const delayDebounce = setTimeout(() => {
            const fetchProducts = async () => {
                try {
                    setLoading(true);

                    const params = {
                        limit: 9999,
                        ...(searchTerm.trim() && { search: searchTerm.trim() }),
                        ...(selectedCategory && { categoryId: selectedCategory }),
                    };

                    const res = await axiosClient.get('/products', { params });
                    setProducts(res.data.products || []);
                    setCurrentPage(1);
                } catch (err) {
                    console.error('Lỗi tải sản phẩm:', err);
                } finally {
                    setTimeout(() => setLoading(false), 300);
                }
            };

            fetchProducts();
        }, 400);

        return () => clearTimeout(delayDebounce);
    }, [searchTerm, selectedCategory]);

    // 🔹 Lọc sản phẩm theo tên
    const filteredProducts = products.filter((p) => p.name.toLowerCase().includes(searchTerm.toLowerCase()));

    // 🔹 Tính phân trang
    const totalPages = Math.ceil(filteredProducts.length / pageSize);
    const paginatedProducts = filteredProducts.slice((currentPage - 1) * pageSize, currentPage * pageSize);

    // 🔹 Thêm sản phẩm vào đơn hàng
    const handleAdd = () => {
        if (!selectedProduct || quantity <= 0) return;

        const existing = currentOrderItems.find((i) => i.product_id === selectedProduct._id);
        const newQuantity = (existing?.quantity || 0) + parseInt(quantity, 10);

        if (newQuantity > (selectedProduct.quantity ?? 0)) {
            Swal.fire({
                icon: 'error',
                title: 'Không đủ hàng',
                text: `Sản phẩm "${selectedProduct.name}" chỉ còn ${selectedProduct.quantity} cái trong kho.`,
            });
            return;
        }

        const finalPrice = selectedProduct.discountPrice > 0 ? selectedProduct.discountPrice : selectedProduct.price;

        onAdd({
            // productId: selectedProduct._id,
            // productName: selectedProduct.name,
            // price: selectedProduct.price,
            // discountPrice: selectedProduct.discountPrice || 0,
            // finalPrice,
            product: selectedProduct, // gửi luôn object sản phẩm
            quantity: parseInt(quantity, 10),
        });

        setQuantity(1);
        setSelectedProduct(null);
        handleClose();
    };

    // 🔹 Đóng modal
    const handleClose = () => {
        setClosing(true);
        setOpening(false);
        setTimeout(() => onClose(), 300);
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

                {totalPages > 1 && (
                    <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
                )}

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
