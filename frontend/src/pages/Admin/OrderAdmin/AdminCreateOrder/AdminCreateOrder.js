import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import classNames from 'classnames/bind';
import styles from './AdminCreateOrder.module.scss';
import axiosClient from '~/utils/axiosClient';

const cx = classNames.bind(styles);

const AdminCreateOrder = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        address: '',
        note: '',
        paymentMethod: 'COD',
        status: 'new',
        items: [],
        subtotal: 0,
        tax: 0,
        serviceFee: 0,
        shippingFee: 0,
        discount: 0,
        finalAmount: 0,
    });

    const [newItem, setNewItem] = useState({
        productName: '',
        price: '',
        quantity: 1,
    });

    const [products, setProducts] = useState([]);
    const [selectedProduct, setSelectedProduct] = useState('');
    const [quantity, setQuantity] = useState(1);

    // Fetch danh sách sản phẩm khi load trang
    useEffect(() => {
        axiosClient
            .get('/products')
            .then((res) => {
                // Nếu API trả về { products: [...] } thì lấy res.data.products
                // Nếu trả về mảng trực tiếp thì vẫn dùng được
                const data = Array.isArray(res.data) ? res.data : res.data.products || [];
                setProducts(data);
            })
            .catch((err) => console.error('Lỗi khi lấy sản phẩm:', err));
    }, []);

    // Tính toán lại subtotal & finalAmount khi items/fees thay đổi
    useEffect(() => {
        const subtotal = formData.items.reduce((sum, i) => sum + i.total, 0);
        const finalAmount = subtotal + formData.tax + formData.serviceFee + formData.shippingFee - formData.discount;
        setFormData((prev) => ({ ...prev, subtotal, finalAmount }));
    }, [formData.items, formData.tax, formData.serviceFee, formData.shippingFee, formData.discount]);

    // Thêm sản phẩm vào đơn
    const handleAddItem = () => {
        if (!newItem.productName || !newItem.price) return;

        const price = parseFloat(newItem.price);
        const quantity = parseInt(newItem.quantity, 10);
        const itemTotal = price * quantity;

        const updatedItems = [...formData.items, { ...newItem, price, quantity, total: itemTotal }];

        const subtotal = updatedItems.reduce((sum, i) => sum + i.total, 0);
        const finalAmount = subtotal + formData.tax + formData.serviceFee + formData.shippingFee - formData.discount;

        setFormData({
            ...formData,
            items: updatedItems,
            subtotal,
            finalAmount,
        });

        setNewItem({ productName: '', price: '', quantity: 1 });
    };

    // Submit đơn hàng
    const handleSubmit = async () => {
        try {
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

            alert('Tạo đơn hàng thành công!');
            navigate('/admin/orders');
        } catch (err) {
            console.error('Lỗi tạo đơn hàng:', err);
            alert('Tạo đơn hàng thất bại!');
        }
    };

    // Xóa sản phẩm items
    const handleRemoveItem = (index) => {
        const updatedItems = formData.items.filter((_, i) => i !== index);
        const subtotal = updatedItems.reduce((sum, i) => sum + i.total, 0);
        const finalAmount = subtotal + formData.tax + formData.serviceFee + formData.shippingFee - formData.discount;
        setFormData({ ...formData, items: updatedItems, subtotal, finalAmount });
    };

    // Thêm sản phẩm từ dropdow
    const handleAddProduct = (productId, qty = 1) => {
        const product = products.find((p) => p._id === productId);
        if (product) {
            const price = parseFloat(product.price);
            const quantity = parseInt(qty, 10);
            const itemTotal = price * quantity;

            setFormData((prev) => ({
                ...prev,
                items: [
                    ...prev.items,
                    {
                        product_id: product._id,
                        productName: product.name,
                        price,
                        quantity,
                        total: itemTotal,
                    },
                ],
            }));

            // reset select
            setSelectedProduct('');
            setQuantity(1);
        }
    };

    // Tính tổng tiền của newItem
    const calculateNewItemTotal = () => {
        const price = parseFloat(newItem.price || 0);
        const quantity = parseInt(newItem.quantity || 0, 10);
        return price > 0 && quantity > 0 ? price * quantity : 0;
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
                            <option value="COD">COD</option>
                            <option value="Bank">Chuyển khoản</option>
                            <option value="Momo">Momo</option>
                        </select>
                    </p>
                </div>
            </div>

            {/* Sản phẩm */}
            <div className={cx('products')}>
                <h3>Thêm sản phẩm</h3>
                <table>
                    <thead>
                        <tr>
                            <th>Sản phẩm</th>
                            <th className={cx('text-center')}>Số lượng</th>
                            <th className={cx('text-right')}>Đơn giá</th>
                            <th className={cx('text-right')}>Thành tiền</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {/* Chọn sản phẩm từ dropdown */}
                        <tr>
                            <td>
                                <select value={selectedProduct} onChange={(e) => setSelectedProduct(e.target.value)}>
                                    <option value="">-- Chọn sản phẩm --</option>
                                    {products.map((p) => (
                                        <option key={p._id} value={p._id}>
                                            {p.name} - {p.price.toLocaleString('vi-VN')} ₫
                                        </option>
                                    ))}
                                </select>
                            </td>

                            <td className={cx('text-center')}>
                                <input
                                    type="number"
                                    min="1"
                                    value={quantity}
                                    onChange={(e) => setQuantity(e.target.value)}
                                />
                            </td>

                            <td className={cx('text-right')}>
                                {selectedProduct
                                    ? products.find((p) => p._id === selectedProduct)?.price.toLocaleString('vi-VN') +
                                      ' ₫'
                                    : '—'}
                            </td>

                            <td className={cx('text-right')}>
                                {selectedProduct
                                    ? (
                                          products.find((p) => p._id === selectedProduct)?.price * quantity
                                      ).toLocaleString('vi-VN') + ' ₫'
                                    : '—'}
                            </td>

                            <td>
                                <button
                                    className={cx('btn', 'icon')}
                                    onClick={() => handleAddProduct(selectedProduct, quantity)}
                                >
                                    ➕
                                </button>
                            </td>
                        </tr>

                        {/* Các sản phẩm đã thêm */}
                        {formData.items.map((item, index) => (
                            <tr key={index}>
                                <td>{item.productName}</td>
                                <td className={cx('text-center')}>{item.quantity}</td>
                                <td className={cx('text-right')}>{item.price.toLocaleString('vi-VN')} ₫</td>
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
                    </tbody>
                </table>
            </div>

            {/* Tổng cộng */}
            <div className={cx('totals')}>
                <p>
                    <span>Tạm tính:</span> <strong>{formData.subtotal.toLocaleString('vi-VN')} ₫</strong>
                </p>
                <p>
                    <span>Thuế (VAT):</span>{' '}
                    <input
                        type="number"
                        value={formData.tax}
                        onChange={(e) => setFormData({ ...formData, tax: parseInt(e.target.value || 0, 10) })}
                    />
                </p>
                <p>
                    <span>Phí dịch vụ:</span>{' '}
                    <input
                        type="number"
                        value={formData.serviceFee}
                        onChange={(e) => setFormData({ ...formData, serviceFee: parseInt(e.target.value || 0, 10) })}
                    />
                </p>
                <p>
                    <span>Phí vận chuyển:</span>{' '}
                    <input
                        type="number"
                        value={formData.shippingFee}
                        onChange={(e) => setFormData({ ...formData, shippingFee: parseInt(e.target.value || 0, 10) })}
                    />
                </p>
                <p>
                    <span>Giảm giá:</span>{' '}
                    <input
                        type="number"
                        value={formData.discount}
                        onChange={(e) => setFormData({ ...formData, discount: parseInt(e.target.value || 0, 10) })}
                    />
                </p>
                <p className={cx('grand-total')}>
                    <span>Tổng cộng:</span> <strong>{formData.finalAmount.toLocaleString('vi-VN')} ₫</strong>
                </p>
            </div>

            {/* Actions */}
            <div className={cx('actions')}>
                <button className={cx('btn', 'update')} onClick={handleSubmit}>
                    ✅ Tạo đơn hàng
                </button>
                <Link to="/admin/orders" className={cx('btn', 'back')}>
                    ← Quay lại
                </Link>
            </div>
        </div>
    );
};

export default AdminCreateOrder;
