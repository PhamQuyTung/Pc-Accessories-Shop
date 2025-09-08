import React from 'react';
import Header from '../Header/header';
import Footer from '../Footer/Footer';
import { Outlet } from 'react-router-dom';
import styles from './MainLayout.module.scss';
import classNames from 'classnames/bind';

const cx = classNames.bind(styles);

function MainLayout() {
    return (
        <div className={cx('main')}>
            <header className={cx('header-wrapper')}>
                <Header />
            </header>
            <main style={{ marginTop: '155px' }}>
                <Outlet /> {/* render child route */}
            </main>
            <Footer />
        </div>
    );
}

export default MainLayout;
