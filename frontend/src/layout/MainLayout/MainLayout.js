import React from 'react';
import Header from '../Header/header'; // Import Header component
import styles from './MainLayout.module.scss'; // Import file CSS Modules
import classNames from 'classnames/bind';
import Footer from '../Footer/Footer';

const cx = classNames.bind(styles);

function MainLayout({ children }) {
    return (
        <div className={cx('main')}>
            <header className={cx('header-wrapper')}>
                <Header />
            </header>
            <main style={{ marginTop: '155px' }}>{children}</main>
            <Footer />
        </div>
    );
}

export default MainLayout;
