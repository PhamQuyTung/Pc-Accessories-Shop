import React, { useEffect, useRef, useState } from 'react';
import Header from '../Header/header';
import Footer from '../Footer/Footer';
import { Outlet } from 'react-router-dom';
import styles from './MainLayout.module.scss';
import classNames from 'classnames/bind';

const cx = classNames.bind(styles);

function MainLayout() {
    const headerRef = useRef(null);
    const [headerHeight, setHeaderHeight] = useState(0);

    useEffect(() => {
        const updateHeight = () => {
            if (headerRef.current) {
                setHeaderHeight(headerRef.current.offsetHeight);
            }
        };

        updateHeight();
        window.addEventListener('resize', updateHeight);

        return () => window.removeEventListener('resize', updateHeight);
    }, []);

    return (
        <div className={cx('main')}>
            <header ref={headerRef} className={cx('header-wrapper')}>
                <Header />
            </header>
            <main style={{ paddingTop: headerHeight }}>
                <Outlet />
            </main>
            <Footer />
        </div>
    );
}

export default MainLayout;
