import React, { useEffect, useState } from 'react';
import axiosClient from '~/utils/axiosClient';
import styles from './PromotionList.module.scss';
import classNames from 'classnames/bind';
import { Link, useNavigate } from 'react-router-dom';

const cx = classNames.bind(styles);

export default function PromotionList() {
    const [promos, setPromos] = useState([]);
    const [tab, setTab] = useState('active'); // active | scheduled | ended
    const [showEnded, setShowEnded] = useState(false);
    const [q, setQ] = useState('');
    const navigate = useNavigate();

    const load = async () => {
        const params = {};
        if (q) params.q = q;

        const { data } = await axiosClient.get('/promotions', { params });

        let filtered = data;

        if (tab === 'active') {
            filtered = data.filter((p) => p.status === 'active');
        } else if (tab === 'scheduled') {
            filtered = data.filter((p) => p.status === 'scheduled');
        } else if (tab === 'ended') {
            filtered = data.filter((p) => p.status === 'ended');
        }

        // Nếu có checkbox "hiện CTKM đã kết thúc"
        if (!showEnded && tab !== 'ended') {
            filtered = filtered.filter((p) => p.status !== 'ended');
        }

        setPromos(filtered);
    };

    useEffect(() => {
        load();
        // eslint-disable-next-line
    }, [tab, showEnded]);

    return (
        <div className={cx('wrap')}>
            <div className={cx('header')}>
                <h2>Chương trình khuyến mãi</h2>
                <div className={cx('actions')}>
                    <input placeholder="Tìm theo tên..." value={q} onChange={(e) => setQ(e.target.value)} />
                    <button onClick={load}>Tìm</button>
                    <button className={cx('primary')} onClick={() => navigate('/admin/promotions/new')}>
                        + Thêm CTKM
                    </button>
                </div>
            </div>

            <div className={cx('tabs')}>
                {['active', 'scheduled', 'ended'].map((t) => (
                    <button key={t} className={cx({ active: tab === t })} onClick={() => setTab(t)}>
                        {t === 'active' ? 'Đang chạy' : t === 'scheduled' ? 'Đã lên lịch' : 'Đã kết thúc'}
                    </button>
                ))}
                <label className={cx('endedToggle')}>
                    <input type="checkbox" checked={showEnded} onChange={(e) => setShowEnded(e.target.checked)} />
                    Hiện CTKM đã kết thúc
                </label>
            </div>

            <table className={cx('table')}>
                <thead>
                    <tr>
                        <th>Tên</th>
                        <th>%</th>
                        <th>Kiểu</th>
                        <th>Trạng thái</th>
                        <th>Đang chạy</th>
                        <th>Số SP</th>
                        <th>Hành động</th>
                    </tr>
                </thead>
                <tbody>
                    {promos.map((p) => (
                        <tr key={p._id}>
                            <td>{p.name}</td>
                            <td>{p.percent}%</td>
                            <td>{p.type === 'once' ? 'Một lần' : 'Hàng ngày'}</td>
                            <td>{p.status}</td>
                            <td>{p.currentlyActive ? '✅' : '—'}</td>
                            <td>{p.assignedProducts?.length || 0}</td>
                            <td className={cx('actions')}>
                                <Link to={`/admin/promotions/${p._id}`}>Xem</Link>
                                <Link to={`/admin/promotions/${p._id}/edit`}>Sửa</Link>
                            </td>
                        </tr>
                    ))}
                    {promos.length === 0 && (
                        <tr>
                            <td colSpan={7} className={cx('empty')}>
                                Không có CTKM
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}
