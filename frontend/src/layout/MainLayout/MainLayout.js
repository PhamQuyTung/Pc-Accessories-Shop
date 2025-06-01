import React from 'react';
import Header from '../../components/Header/header'; // Import Header component
import styles from './MainLayout.module.scss'; // Import file CSS Modules
import classNames from 'classnames/bind';

const cx = classNames.bind(styles);

function MainLayout({ children }) {
    return (
        <div className={cx('main')}>
            <header>
                <Header />
            </header>
            <main style={{marginTop: '162px'}}>
                {children}
            </main>
            <footer>Main Footer</footer>
        </div>
    );
}

export default MainLayout;
