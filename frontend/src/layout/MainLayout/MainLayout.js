import React, { useEffect, useRef, useState } from 'react';
import Header from '../Header/header';
import Footer from '../Footer/Footer';
import { Outlet } from 'react-router-dom';
import styles from './MainLayout.module.scss';
import classNames from 'classnames/bind';
import UpToTop from '~/components/UpToTop/UpToTop';
import TopBanner from '~/components/TopBanner/TopBanner';

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
            {/* Banner Quảng Cáo */}
            {/* <TopBanner /> */}
        
            <header ref={headerRef} className={cx('header-wrapper')}>
                <Header />
            </header>

            <main style={{ paddingTop: headerHeight }}>
                <Outlet />
            </main>

            <Footer />

            {/* ✅ Nút cuộn lên đầu + thanh tiến trình */}
            <UpToTop scrollThreshold={400} smooth={true} size={26} />
        </div>
    );
}

export default MainLayout;
