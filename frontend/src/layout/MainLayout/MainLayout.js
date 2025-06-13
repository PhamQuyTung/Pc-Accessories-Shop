import React from 'react';
import Header from '../../components/Header/header'; // Import Header component
import styles from './MainLayout.module.scss'; // Import file CSS Modules
import classNames from 'classnames/bind';

const cx = classNames.bind(styles);

function MainLayout({ children }) {
    return (
        <div className={cx('main')}>
            <header className={cx('header-wrapper')}>
                <Header />
            </header>
            <main style={{marginTop: '155px'}}>
                {children}
            </main>
            <footer>Main Footer</footer>
        </div>
    );
}

export default MainLayout;
