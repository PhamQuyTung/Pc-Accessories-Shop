import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import classNames from 'classnames/bind';
import styles from './AdminCreateOrder.module.scss';
import Swal from 'sweetalert2';

import axiosClient from '~/utils/axiosClient';
import ProductSelectModal from '~/components/ProductSelectModal/ProductSelectModal';

import useUnsavedChangesWarning from '~/hooks/useUnsavedChangesWarning';
import ConfirmNavigate from '~/components/ConfirmNavigate/ConfirmNavigate';

const cx = classNames.bind(styles);

const AdminCreateOrder = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        address: '',
        note: '',
        paymentMethod: 'cod',
        status: 'new',
        items: [],
        subtotal: 0,
        tax: 0,
        serviceFee: 0,
        shippingFee: 0,
        discount: 0,
        finalAmount: 0,
    });

    const [products, setProducts] = useState([]);
    const [taxPercent, setTaxPercent] = useState(0);
    const [discountPercent, setDiscountPercent] = useState(0);
    const [showProductModal, setShowProductModal] = useState(false);

    // ✅ Xác định khi nào cần cảnh báo
    const hasUnsavedChanges =
        formData.name || formData.phone || formData.address || formData.note || formData.items.length > 0;

    // ✅ Hook chặn điều hướng & reload
    useUnsavedChangesWarning(hasUnsavedChanges);

    // Tính toán lại tiền
    useEffect(() => {
        const subtotal = formData.items.reduce((sum, i) => sum + i.total, 0);
        const taxAmount = Math.round((subtotal * taxPercent) / 100);
        const discountAmount = Math.round((subtotal * discountPercent) / 100);
        const finalAmount = subtotal + taxAmount + formData.serviceFee + formData.shippingFee - discountAmount;

        setFormData((prev) => ({
            ...prev,
            subtotal,
            tax: taxAmount,
            discount: discountAmount,
            finalAmount,
        }));
    }, [formData.items, taxPercent, discountPercent, formData.serviceFee, formData.shippingFee]);

    // Fetch sản phẩm
    useEffect(() => {
        axiosClient
            .get('/products')
            .then((res) => {
                const data = Array.isArray(res.data) ? res.data : res.data.products || [];
                setProducts(data);
            })
            .catch((err) => console.error('Lỗi khi lấy sản phẩm:', err));
    }, []);

    // Thêm sản phẩm
    const handleAddToOrder = ({ product, quantity }) => {
        if (!product || quantity <= 0) return;

        const { _id, name, price, discountPrice, quantity: stockQty } = product;
        const finalPrice = discountPrice > 0 ? discountPrice : price;

        // 🔥 Kiểm tra tồn kho
        const existingItem = formData.items.find((i) => i.product_id === _id);
        const newQuantity = (existingItem?.quantity || 0) + quantity;

        if (newQuantity > (stockQty ?? 0)) {
            Swal.fire({
                icon: 'error',
                title: 'Không đủ hàng',
                text: `Sản phẩm "${name}" chỉ còn ${stockQty} cái trong kho.`,
            });
            return;
        }

        if (existingItem) {
            // ✅ Cộng dồn nếu đã có
            setFormData((prev) => ({
                ...prev,
                items: prev.items.map((i) =>
                    i.product_id === _id
                        ? {
                              ...i,
                              quantity: newQuantity,
                              total: finalPrice * newQuantity,
                          }
                        : i,
                ),
            }));
        } else {
            // ✅ Thêm mới
            setFormData((prev) => ({
                ...prev,
                items: [
                    ...prev.items,
                    {
                        product_id: _id,
                        productName: name,
                        price,
                        discountPrice,
                        finalPrice,
                        quantity,
                        total: finalPrice * quantity,
                    },
                ],
            }));
        }
    };

    // Xóa sản phẩm
    const handleRemoveItem = (index) => {
        const updatedItems = formData.items.filter((_, i) => i !== index);
        setFormData((prev) => ({ ...prev, items: updatedItems }));
    };

    // Submit
    const handleSubmit = async () => {
        try {
            // ✅ Check tồn kho trước khi submit
            for (const item of formData.items) {
                const productInStore = products.find((p) => p._id === item.product_id);
                if (productInStore && item.quantity > (productInStore.quantity ?? 0)) {
                    Swal.fire({
                        icon: 'error',
                        title: 'Không đủ hàng',
                        text: `Sản phẩm "${item.productName}" chỉ còn ${productInStore.quantity} cái trong kho.`,
                    });
                    return; // ❌ Dừng submit
                }
            }

            await axiosClient.post(
                '/orders/admin/create',
                {
                    shippingInfo: {
                        name: formData.name,
                        phone: formData.phone,
                        address: formData.address,
                    },
                    note: formData.note,
                    paymentMethod: formData.paymentMethod,
                    status: formData.status,
                    items: formData.items,
                    subtotal: formData.subtotal,
                    tax: formData.tax,
                    serviceFee: formData.serviceFee,
                    shippingFee: formData.shippingFee,
                    discount: formData.discount,
                    finalAmount: formData.finalAmount,
                },
                { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } },
            );

            Swal.fire({
                icon: 'success',
                title: 'Thành công',
                text: 'Tạo đơn hàng thành công!',
            });

            navigate('/admin/orders');
        } catch (err) {
            console.error('Lỗi tạo đơn hàng:', err);
            Swal.fire({
                icon: 'error',
                title: 'Thất bại',
                text: 'Tạo đơn hàng thất bại!',
            });
        }
    };

    return (
        <div className={cx('order-detail')}>
            <div className={cx('header')}>
                <h1>Tạo đơn hàng mới</h1>
                <span className={cx('status', formData.status)}>Mới</span>
            </div>

            {/* Form thông tin khách */}
            <div className={cx('info-section')}>
                <div className={cx('box')}>
                    <h3>Thông tin khách hàng</h3>
                    <p>
                        <strong>Họ tên:</strong>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                    </p>
                    <p>
                        <strong>SĐT:</strong>
                        <input
                            type="text"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        />
                    </p>
                    <p>
                        <strong>Địa chỉ:</strong>
                        <input
                            type="text"
                            value={formData.address}
                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        />
                    </p>
                    <p>
                        <strong>Ghi chú:</strong>
                        <textarea
                            value={formData.note}
                            onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                        />
                    </p>
                    <p>
                        <strong>Thanh toán:</strong>
                        <select
                            value={formData.paymentMethod}
                            onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                        >
                            <option value="cod">COD</option>
                            <option value="bank">Chuyển khoản</option>
                            <option value="momo">Momo</option>
                        </select>
                    </p>
                </div>
            </div>

            {/* Danh sách sản phẩm */}
            <div className={cx('products')}>
                <h3>Danh sách sản phẩm</h3>
                <table>
                    <thead>
                        <tr>
                            <th>Sản phẩm</th>
                            <th className={cx('text-center')}>Số lượng</th>
                            <th className={cx('text-right')}>Giá gốc</th>
                            <th className={cx('text-right')}>Giá KM</th>
                            <th className={cx('text-right')}>Giá cuối</th>
                            <th className={cx('text-right')}>Thành tiền</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {formData.items.map((item, index) => (
                            <tr key={index}>
                                <td>{item.productName}</td>
                                <td className={cx('text-center')}>{item.quantity}</td>
                                <td className={cx('text-right')}>{item.price.toLocaleString('vi-VN')} ₫</td>
                                <td className={cx('text-right')}>
                                    {item.discountPrice > 0 ? item.discountPrice.toLocaleString('vi-VN') + ' ₫' : '—'}
                                </td>
                                <td className={cx('text-right')}>{item.finalPrice.toLocaleString('vi-VN')} ₫</td>
                                <td className={cx('text-right')}>{item.total.toLocaleString('vi-VN')} ₫</td>
                                <td>
                                    <button
                                        className={cx('btn', 'icon', 'danger')}
                                        onClick={() => handleRemoveItem(index)}
                                    >
                                        ❌
                                    </button>
                                </td>
                            </tr>
                        ))}

                        <tr>
                            <td colSpan={7} className={cx('text-center')}>
                                <button className={cx('btn')} onClick={() => setShowProductModal(true)}>
                                    ➕ Thêm sản phẩm
                                </button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            {/* Tổng cộng */}
            <div className={cx('totals')}>
                <div className={cx('row')}>
                    <span>Tạm tính:</span>
                    <span></span>
                    <strong>{formData.subtotal.toLocaleString('vi-VN')} ₫</strong>
                </div>

                <div className={cx('row')}>
                    <span>Thuế (VAT):</span>
                    <input
                        type="number"
                        min="0"
                        max="100"
                        value={taxPercent}
                        onChange={(e) => setTaxPercent(parseFloat(e.target.value) || 0)}
                    />
                    <em>({formData.tax.toLocaleString('vi-VN')} ₫)</em>
                </div>

                <div className={cx('row')}>
                    <span>Phí dịch vụ:</span>
                    <input
                        type="number"
                        min="0"
                        value={formData.serviceFee}
                        onChange={(e) =>
                            setFormData({
                                ...formData,
                                serviceFee: parseInt(e.target.value || 0, 10),
                            })
                        }
                    />
                    <em>({formData.serviceFee.toLocaleString('vi-VN')} ₫)</em>
                </div>

                <div className={cx('row')}>
                    <span>Phí vận chuyển:</span>
                    <input
                        type="number"
                        min="0"
                        value={formData.shippingFee}
                        onChange={(e) =>
                            setFormData({
                                ...formData,
                                shippingFee: parseInt(e.target.value || 0, 10),
                            })
                        }
                    />
                    <em>({formData.shippingFee.toLocaleString('vi-VN')} ₫)</em>
                </div>

                <div className={cx('row')}>
                    <span>Giảm giá:</span>
                    <input
                        type="number"
                        min="0"
                        max="100"
                        value={discountPercent}
                        onChange={(e) => setDiscountPercent(parseFloat(e.target.value) || 0)}
                    />
                    <em>({formData.discount.toLocaleString('vi-VN')} ₫)</em>
                </div>

                <p className={cx('grand-total')}>
                    <span>Tổng cộng:</span>
                    <strong>{formData.finalAmount.toLocaleString('vi-VN')} ₫</strong>
                </p>
            </div>

            {/* Actions */}
            <div className={cx('actions')}>
                <button className={cx('btn', 'update')} onClick={handleSubmit}>
                    ✅ Tạo đơn hàng
                </button>
                <ConfirmNavigate to="/admin/orders" when={hasUnsavedChanges} className={cx('btn', 'back')}>
                    ← Quay lại
                </ConfirmNavigate>
            </div>

            {/* Modal chọn sản phẩm */}
            {showProductModal && (
                <ProductSelectModal
                    products={products}
                    currentOrderItems={formData.items}
                    onAdd={handleAddToOrder}
                    onClose={() => setShowProductModal(false)}
                />
            )}
        </div>
    );
};

export default AdminCreateOrder;
