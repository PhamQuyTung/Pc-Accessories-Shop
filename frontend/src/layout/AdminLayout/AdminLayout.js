import React, { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import Sidebar from '~/pages/Admin/AdminSidebar/AdminSidebar';
import AdminHeader from '~/pages/Admin/AdminHeader/AdminHeader';
import styles from './AdminLayout.module.scss';
import classNames from 'classnames/bind';
import { Row, Col } from 'react-bootstrap';

const cx = classNames.bind(styles);

const AdminLayout = () => {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    useEffect(() => {
        if (!user || user.role !== 'admin') {
            Swal.fire({
                icon: 'error',
                title: 'Truy cập bị từ chối',
                text: 'Chỉ có admin mới sử dụng chức năng này!',
            }).then(() => {
                navigate('/');
            });
        }
    }, [user, navigate]);

    if (!user || user.role !== 'admin') return null;

    return (
        <div className={cx('wrapper')}>
            <Row>
                <Col xs={12} className={cx('header')}>
                    <AdminHeader />
                </Col>
                <Col lg={2} md={3} xs={12} className={cx('sidebar')}>
                    <Sidebar />
                </Col>
                <Col lg={10} md={9} xs={12} className={cx('content')}>
                    <main className={cx('admin-content')}>
                        <Outlet /> {/* render child route */}
                    </main>
                </Col>
            </Row>
        </div>
    );
};

export default AdminLayout;
