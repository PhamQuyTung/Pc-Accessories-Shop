import React, { useEffect, useState } from 'react';
import axiosClient from '~/utils/axiosClient';
import { useParams, Link } from 'react-router-dom';
import classNames from 'classnames/bind';
import styles from './PromotionDetail.module.scss';

const cx = classNames.bind(styles);

export default function PromotionDetail() {
    const { id } = useParams();
    const [promo, setPromo] = useState(null);

    useEffect(() => {
        (async () => {
            const { data } = await axiosClient.get(`/promotions/${id}`);
            setPromo(data);
        })();
    }, [id]);

    if (!promo) return <div className={cx('loading')}>Loading...</div>;

    return (
        <div className={cx('wrapper')}>
            <h2 className={cx('title')}>
                {promo.name} <span className={cx('percent')}>({promo.percent}%)</span>
            </h2>

            <p className={cx('status')}>
                Trạng thái: <b>{promo.status}</b>{' '}
                {promo.currentlyActive ? <span className={cx('active')}>Đang chạy</span> : <span>—</span>}
            </p>
            <p className={cx('type')}>Kiểu: {promo.type === 'once' ? 'Một lần' : 'Hàng ngày'}</p>

            {promo.bannerImg && (
                <>
                    <h4>Ảnh tiêu đề CTKM</h4>
                    <div className={cx('banner')}>
                        <img src={promo.bannerImg} alt={promo.name} />
                    </div>
                </>
            )}

            {promo.promotionCardImg && (
                <div className={cx('cardImg')}>
                    <h4>Ảnh card sản phẩm</h4>
                    <img src={promo.promotionCardImg} alt={`${promo.name} card`} />
                </div>
            )}

            {promo.type === 'once' ? (
                <p className={cx('time')}>
                    Thời gian: {new Date(promo.once.startAt).toLocaleString()} →{' '}
                    {new Date(promo.once.endAt).toLocaleString()}
                </p>
            ) : (
                <>
                    <p className={cx('time')}>
                        Khoảng ngày: {promo.daily.startDate && new Date(promo.daily.startDate).toLocaleDateString()} →{' '}
                        {promo.daily.endDate ? new Date(promo.daily.endDate).toLocaleDateString() : 'không giới hạn'}
                    </p>
                    <p className={cx('time')}>
                        Khung giờ mỗi ngày: {promo.daily.startTime} → {promo.daily.endTime}
                    </p>
                </>
            )}

            <h3 className={cx('subtitle')}>
                Sản phẩm áp dụng <span>({promo.assignedProducts.length})</span>
            </h3>
            <div className={cx('tableWrapper')}>
                <table className={cx('productTable')}>
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
                                        (pp.product?.discountPrice > 0
                                            ? pp.product.discountPrice
                                            : pp.product?.price) || 0
                                    ).toLocaleString('vi-VN')}{' '}
                                    đ
                                </td>
                                <td>{pp.product?.status}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className={cx('actions')}>
                <Link to={`/admin/promotions/${promo._id}/edit`} className={cx('editBtn')}>
                    ✏️ Sửa
                </Link>
            </div>
        </div>
    );
}
