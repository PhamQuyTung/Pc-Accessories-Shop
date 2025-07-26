import React, { useState, useEffect, useCallback } from 'react';
import styles from '../Profile.module.scss';
import classNames from 'classnames/bind';
import AddressModal from '../AddressModal/AddressModal';
import axiosClient from '~/utils/axiosClient';
import Swal from 'sweetalert2';
import LoadingSpinner from '~/components/SpinnerLoading/SpinnerLoading';
import { AnimatePresence } from 'framer-motion';

const cx = classNames.bind(styles);

const EMPTY_FORM = {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    postalCode: '',
    city: '',
    cityCode: '',
    district: '',
    districtCode: '',
    ward: '',
    wardCode: '',
    detail: '',
    type: 'home',
    isDefault: false,
};

export default function ProfileAddress() {
    const [showAddressModal, setShowAddressModal] = useState(false);
    const [addresses, setAddresses] = useState([]);
    const [addressForm, setAddressForm] = useState(EMPTY_FORM);

    const [editMode, setEditMode] = useState(false);
    const [editId, setEditId] = useState(null);

    const [loading, setLoading] = useState(true); // 👈 trạng thái loading

    const applyDefaultState = (list, defaultId) => list.map((a) => ({ ...a, isDefault: a._id === defaultId }));

    const defaultCount = addresses.filter((a) => a.isDefault).length;

    const fetchAddresses = useCallback(async () => {
        try {
            setLoading(true);
            await new Promise((res) => setTimeout(res, 1000)); // 👈 mô phỏng chậm 1s
            const res = await axiosClient.get('/addresses');
            setAddresses(res.data);
        } catch (error) {
            console.error('Lỗi khi lấy danh sách địa chỉ', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAddresses();
    }, [fetchAddresses]);

    const handleChange = (e) => {
        const { name, type, value, checked } = e.target;
        setAddressForm((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value, // ✅ checkbox -> boolean
        }));
    };

    const buildPayload = (form) => ({
        ...form,
        type: (form.type || 'home').trim(), // ✅ chắc chắn là 'home' | 'company' | 'other'
        isDefault: Boolean(form.isDefault), // ✅ boolean thật
    });

    // ========= Thêm =========
    const openAdd = () => {
        setEditMode(false);
        setEditId(null);
        setAddressForm(EMPTY_FORM);
        setShowAddressModal(true);
    };

    // ========= Sửa =========
    const openEdit = (addr) => {
        setEditMode(true);
        setEditId(addr._id);
        setAddressForm({
            firstName: addr.firstName || '',
            lastName: addr.lastName || '',
            email: addr.email || '',
            phone: addr.phone || '',
            postalCode: addr.postalCode || '',
            city: addr.city || '',
            cityCode: addr.cityCode || '',
            district: addr.district || '',
            districtCode: addr.districtCode || '',
            ward: addr.ward || '',
            wardCode: addr.wardCode || '',
            detail: addr.detail || '',
            type: addr.type || 'home',
            isDefault: !!addr.isDefault,
        });
        setShowAddressModal(true);
    };

    // ========= Xoá (WITH SweetAlert2) =========
    const handleDelete = async (id) => {
        const result = await Swal.fire({
            title: 'Xoá địa chỉ?',
            text: 'Bạn sẽ không thể khôi phục lại địa chỉ này!',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Xoá',
            cancelButtonText: 'Huỷ',
            confirmButtonColor: '#d33',
        });

        if (!result.isConfirmed) return;

        try {
            await axiosClient.delete(`/addresses/${id}`);
            setAddresses((prev) => prev.filter((a) => a._id !== id));
            Swal.fire({ icon: 'success', title: 'Đã xoá!', timer: 1200, showConfirmButton: false });
        } catch (error) {
            console.error('Lỗi khi xoá địa chỉ', error);
            Swal.fire({ icon: 'error', title: 'Xoá thất bại', text: 'Vui lòng thử lại sau.' });
        }
    };

    // ========= Bỏ mặc định =========
    const handleUnsetDefault = async (id) => {
        const defaultCount = addresses.filter((a) => a.isDefault).length;
        if (defaultCount <= 1) {
            Swal.fire({
                icon: 'info',
                title: 'Bạn cần ít nhất một địa chỉ mặc định!',
                timer: 2000,
                showConfirmButton: false,
            });
            return;
        }

        try {
            await axiosClient.patch(`/addresses/${id}/default`, { isDefault: false });
            setAddresses((prev) => prev.map((item) => (item._id === id ? { ...item, isDefault: false } : item)));
            Swal.fire({ icon: 'success', title: 'Đã bỏ mặc định', timer: 1200, showConfirmButton: false });
        } catch (err) {
            console.error('Lỗi khi bỏ mặc định', err);
            Swal.fire({ icon: 'error', title: 'Thao tác thất bại', text: 'Vui lòng thử lại sau.' });
        }
    };

    // ========= Đặt mặc định =========
    const handleSetDefault = async (id) => {
        try {
            await axiosClient.patch(`/addresses/${id}/default`, { isDefault: true });
            setAddresses((prev) => prev.map((item) => ({ ...item, isDefault: item._id === id })));
            Swal.fire({ icon: 'success', title: 'Đã đặt mặc định', timer: 1200, showConfirmButton: false });
        } catch (err) {
            console.error('Lỗi khi đặt mặc định', err);
            Swal.fire({ icon: 'error', title: 'Thao tác thất bại', text: 'Vui lòng thử lại sau.' });
        }
    };

    // ========= Submit (add / edit) =========
    const handleSubmitAddress = async (e) => {
        e.preventDefault();
        const payload = buildPayload(addressForm);

        try {
            if (editMode) {
                const res = await axiosClient.put(`/addresses/${editId}`, payload);

                if (payload.isDefault) {
                    // địa chỉ này là mặc định -> mọi cái khác bỏ mặc định
                    setAddresses((prev) => {
                        const replaced = prev.map((a) => (a._id === editId ? res.data : a));
                        return applyDefaultState(replaced, res.data._id);
                    });
                } else {
                    // không đổi mặc định
                    setAddresses((prev) => prev.map((a) => (a._id === editId ? res.data : a)));
                }

                Swal.fire({
                    icon: 'success',
                    title: 'Cập nhật địa chỉ thành công',
                    timer: 1500,
                    showConfirmButton: false,
                });
            } else {
                const res = await axiosClient.post('/addresses', payload);

                if (payload.isDefault) {
                    // địa chỉ mới là mặc định -> mọi cái khác bỏ mặc định
                    setAddresses((prev) => applyDefaultState([res.data, ...prev], res.data._id));
                } else {
                    setAddresses((prev) => [res.data, ...prev]);
                }

                Swal.fire({
                    icon: 'success',
                    title: 'Thêm địa chỉ mới thành công',
                    timer: 1500,
                    showConfirmButton: false,
                });
            }

            // reset UI
            setShowAddressModal(false);
            setAddressForm(EMPTY_FORM);
            setEditMode(false);
            setEditId(null);
        } catch (error) {
            const message = error.response?.data?.message || error.response?.data?.error || error.message;
            console.error('Lỗi khi lưu địa chỉ', message, error.response?.data);
            Swal.fire({
                icon: 'error',
                title: 'Lưu địa chỉ thất bại',
                text: message || 'Vui lòng thử lại sau.',
            });
        }
    };

    return (
        <>
            <div className={cx('address-header')}>
                <h2>Sổ địa chỉ</h2>
                <button className={cx('submit-btn')} onClick={openAdd}>
                    Thêm địa chỉ mới
                </button>
            </div>
            {/* Render ra danh sách địa chỉ đã lưu */}
            <div className={cx('address-list')}>
                {loading ? (
                    <LoadingSpinner />
                ) : addresses.length === 0 ? (
                    <p>Chưa có địa chỉ nào.</p>
                ) : (
                    addresses.map((addr) => (
                        <div key={addr._id} className={cx('address-item')}>
                            <div className={cx('address-info')}>
                                <strong>
                                    {addr.type === 'home'
                                        ? 'Nhà riêng'
                                        : addr.type === 'company'
                                          ? 'Văn phòng'
                                          : 'Khác'}
                                </strong>
                                {addr.isDefault && <span className={cx('default-badge')}>Mặc định</span>}
                                <br />
                                <span>
                                    {addr.lastName} {addr.firstName} – {addr.phone}
                                </span>
                                {addr.email && (
                                    <>
                                        <br />
                                        <span className={cx('email')}>{addr.email}</span>
                                    </>
                                )}
                                <br />
                                <span>
                                    {addr.detail}, {addr.ward}, {addr.district}, {addr.city}.
                                </span>
                                {addr.postalCode && (
                                    <>
                                        <br />
                                        <span className={cx('postal')}>Mã bưu điện: {addr.postalCode}</span>
                                    </>
                                )}
                            </div>

                            <div className={cx('address-actions')}>
                                <button className={cx('link-btn')} onClick={() => openEdit(addr)}>
                                    ✏ Sửa
                                </button>
                                <button className={cx('link-btn', 'danger')} onClick={() => handleDelete(addr._id)}>
                                    🗑 Xóa
                                </button>

                                {addr.isDefault ? (
                                    // Chỉ hiển thị nút "Bỏ mặc định" nếu có nhiều hơn 1 địa chỉ mặc định
                                    defaultCount > 1 && (
                                        <button
                                            className={cx('link-btn', 'warning')}
                                            onClick={() => handleUnsetDefault(addr._id)}
                                        >
                                            ✕ Bỏ mặc định
                                        </button>
                                    )
                                ) : (
                                    <button className={cx('link-btn')} onClick={() => handleSetDefault(addr._id)}>
                                        ★ Đặt mặc định
                                    </button>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Hiện modal thêm/sửa khi người dùng bấm nút thêm hoặc sửa địa chỉ */}
            <AnimatePresence mode="wait">
                {showAddressModal && (
                    <AddressModal
                        key="address-modal"
                        show // không cần cũng được, vì đã condition ở parent
                        onClose={() => {
                            setShowAddressModal(false);
                            setEditMode(false);
                            setEditId(null);
                            setAddressForm(EMPTY_FORM);
                        }}
                        onSubmit={handleSubmitAddress}
                        addressForm={addressForm}
                        handleChange={handleChange}
                        mode={editMode ? 'edit' : 'add'}
                    />
                )}
            </AnimatePresence>
        </>
    );
}
