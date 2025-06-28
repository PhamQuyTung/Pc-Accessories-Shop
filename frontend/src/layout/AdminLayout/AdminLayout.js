import React from 'react';
import Sidebar from '~/pages/Admin/AdminSidebar/AdminSidebar'; // sidebar cho admin
import styles from './AdminLayout.module.scss';
import classNames from 'classnames/bind';
import { Row, Col } from 'react-bootstrap';

const cx = classNames.bind(styles);

const AdminLayout = ({ children }) => {
    return (
        <div className={cx('wrapper')}>
            <Row>
                <Col xs={12} className={cx('header')}>
                    <h1>Admin Dashboard</h1>
                </Col>

                <Col lg={2} md={3} xs={12} className={cx('sidebar')}>
                    <Sidebar />
                </Col>

                <Col lg={10} md={3} xs={12} className={cx('content')}>
                    <main className={cx('main')}>{children}</main>
                </Col>
            </Row>
        </div>
    );
};

export default AdminLayout;
