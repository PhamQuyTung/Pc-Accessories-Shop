import React from 'react';
import Sidebar from '~/pages/Admin/AdminSidebar/AdminSidebar'; // sidebar cho admin
import AdminHeader from '~/pages/Admin/AdminHeader/AdminHeader';
import styles from './AdminLayout.module.scss';
import classNames from 'classnames/bind';
import { Row, Col } from 'react-bootstrap';

const cx = classNames.bind(styles);

const AdminLayout = ({ children }) => {
    return (
        <div className={cx('wrapper')}>
            <Row>
                <Col xs={12} className={cx('header')}>
                    <AdminHeader />
                </Col>

                <Col lg={2} md={3} xs={12} className={cx('sidebar')}>
                    <Sidebar />
                </Col>

                <Col lg={10} md={3} xs={12} className={cx('content')}>
                    <main className={cx('admin-content')}>{children}</main>
                </Col>
            </Row>
        </div>
    );
};

export default AdminLayout;
