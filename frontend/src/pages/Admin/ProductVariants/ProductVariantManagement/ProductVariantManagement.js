import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import classNames from 'classnames/bind';
import styles from './ProductVariantManagement.module.scss';
import Swal from 'sweetalert2';
import { updateProductAttributes } from '~/services/productService';
import { useToast } from '~/components/ToastMessager';

import { getVariantsByProduct, deleteVariant } from '~/services/variantService';

const cx = classNames.bind(styles);

const ProductVariantManagement = () => {
    const { productId } = useParams();

    const [variants, setVariants] = useState([]);
    const [productName, setProductName] = useState('');
    const [loading, setLoading] = useState(true);

    const toast = useToast();

    // ======================
    // Load biến thể sản phẩm
    // ======================
    const fetchVariants = async () => {
        try {
            const res = await getVariantsByProduct(productId);

            const newVariants = res.data.variants || [];
            setVariants(newVariants);

            setProductName(res.data.product?.name || '');

            // 🟢 Tự động cập nhật product.attributes
            const newAttributes = buildProductAttributes(newVariants);
            await updateProductAttributes(productId, newAttributes);
        } catch (err) {
            console.error('Lỗi khi tải biến thể:', err);
            toast('Không thể tải biến thể sản phẩm!', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchVariants();
    }, [productId]);

    // ======================
    // Xóa biến thể
    // ======================
    const handleDelete = async (id) => {
        const result = await Swal.fire({
            title: 'Xóa biến thể này?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Có',
            cancelButtonText: 'Không',
        });

        if (!result.isConfirmed) return;

        try {
            await deleteVariant(id);
            toast('Đã xóa biến thể!', 'success');
            fetchVariants();
        } catch (err) {
            toast('Lỗi khi xóa biến thể!', 'error');
        }
    };

    const buildProductAttributes = (variants) => {
        const map = new Map();

        variants.forEach((v) => {
            v.attributes.forEach((attr) => {
                if (!map.has(attr.attrId._id)) {
                    map.set(attr.attrId._id, new Set());
                }

                attr.terms.forEach((t) => {
                    map.get(attr.attrId._id).add(t._id);
                });
            });
        });

        // convert Set → Array
        return Array.from(map.entries()).map(([attrId, termsSet]) => ({
            attrId,
            terms: Array.from(termsSet),
        }));
    };

    if (loading)
        return (
            <div className={cx('loading')}>
                <p>Đang tải dữ liệu...</p>
            </div>
        );

    return (
        <div className={cx('variant-page')}>
            <div className={cx('header')}>
                <h2>
                    Biến thể sản phẩm: <span className={cx('name')}>{productName}</span>
                </h2>

                <Link to={`/admin/products/${productId}/variants/create`} className={cx('btn-add')}>
                    + Thêm biến thể
                </Link>
            </div>

            <table className={cx('table')}>
                <thead>
                    <tr>
                        <th>Ảnh</th>
                        <th>Màu</th>
                        <th>Size</th>
                        <th>SKU</th>
                        <th>Giá</th>
                        <th>Số lượng</th>
                        <th>Hành động</th>
                    </tr>
                </thead>

                <tbody>
                    {variants.length === 0 && (
                        <tr>
                            <td colSpan="7" style={{ textAlign: 'center' }}>
                                Chưa có biến thể nào.
                            </td>
                        </tr>
                    )}

                    {variants.map((v) => (
                        <tr key={v._id}>
                            <td>
                                <img src={v.images?.[0] || '/placeholder.jpg'} alt="variant" className={cx('thumb')} />
                            </td>

                            {/* 
                                Nếu backend trả về dạng:
                                attributes: [{ attrId: {...}, terms: {...} }]
                                thì ở đây bạn đổi theo format mới
                            */}
                            <td>{v.attributes?.find((a) => a.attrId?.key === 'mau-sac')?.terms?.[0]?.name || '—'}</td>

                            <td>{v.attributes?.find((a) => a.attrId?.key === 'size-ao')?.terms?.[0]?.name || '—'}</td>

                            <td>{v.sku || '—'}</td>
                            <td>{v.price?.toLocaleString('vi-VN')}đ</td>
                            <td>{v.quantity}</td>

                            <td>
                                <div className={cx('actions')}>
                                    <Link to={`/admin/variants/${v._id}/edit`}>
                                        <button className={cx('btn-edit')}>✏️</button>
                                    </Link>

                                    <button className={cx('btn-delete')} onClick={() => handleDelete(v._id)}>
                                        🗑️
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default ProductVariantManagement;
