import React, { useEffect, useState } from 'react';
import axiosClient from '~/utils/axiosClient';
import { useParams, Link } from 'react-router-dom';

export default function PromotionDetail() {
    const { id } = useParams();
    const [promo, setPromo] = useState(null);

    useEffect(() => {
        (async () => {
            const { data } = await axiosClient.get(`/promotions/${id}`);
            setPromo(data);
        })();
    }, [id]);

    if (!promo) return <div>Loading...</div>;

    return (
        <div style={{ background: '#fff', padding: 16, borderRadius: 8 }}>
            <h2>
                {promo.name} ({promo.percent}%)
            </h2>
            <p>
                Trạng thái: <b>{promo.status}</b> {promo.currentlyActive ? '✅' : '—'}
            </p>
            <p>Kiểu: {promo.type === 'once' ? 'Một lần' : 'Hàng ngày'}</p>

            {/* ✅ Hiển thị ảnh chi tiết */}
            {promo.bannerImg && (
                <div style={{ margin: '16px 0' }}>
                    <img
                        src={promo.bannerImg}
                        alt={promo.name}
                        style={{ maxWidth: '100%', borderRadius: 8, boxShadow: '0 2px 6px rgba(0,0,0,0.15)' }}
                    />
                </div>
            )}

            {promo.type === 'once' ? (
                <p>
                    Thời gian: {new Date(promo.once.startAt).toLocaleString()} →{' '}
                    {new Date(promo.once.endAt).toLocaleString()}
                </p>
            ) : (
                <>
                    <p>
                        Khoảng ngày: {promo.daily.startDate && new Date(promo.daily.startDate).toLocaleDateString()} →{' '}
                        {promo.daily.endDate ? new Date(promo.daily.endDate).toLocaleDateString() : 'không giới hạn'}
                    </p>
                    <p>
                        Khung giờ mỗi ngày: {promo.daily.startTime} → {promo.daily.endTime}
                    </p>
                </>
            )}

            <h3>Sản phẩm áp dụng ({promo.assignedProducts.length})</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                    <tr>
                        <th>Tên</th>
                        <th>Giá hiện tại</th>
                        <th>Trạng thái</th>
                    </tr>
                </thead>
                <tbody>
                    {promo.assignedProducts.map((pp) => (
                        <tr key={pp.product?._id || pp.product}>
                            <td>{pp.product?.name || pp.product}</td>
                            <td>
                                {(
                                    (pp.product?.discountPrice > 0 ? pp.product.discountPrice : pp.product?.price) || 0
                                ).toLocaleString('vi-VN')}{' '}
                                đ
                            </td>
                            <td>{pp.product?.status}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <div style={{ marginTop: 12 }}>
                <Link to={`/admin/promotions/${promo._id}/edit`}>Sửa</Link>
            </div>
        </div>
    );
}
