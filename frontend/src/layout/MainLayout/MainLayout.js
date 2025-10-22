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
    const [isBannerHidden, setIsBannerHidden] = useState(false);

useEffect(() => {
    const observer = new MutationObserver(() => {
        setIsBannerHidden(document.body.classList.contains('banner-hidden'));
    });
    observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
}, []);


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
            <TopBanner />
        
            <header ref={headerRef} className={cx('header-wrapper', { compact: isBannerHidden })}>
                <Header />
            </header>

            <main style={{ paddingTop: headerHeight + 47 }}>
                <Outlet />
            </main>

            <Footer />

            {/* ✅ Nút cuộn lên đầu + thanh tiến trình */}
            <UpToTop scrollThreshold={400} smooth={true} size={26} />
        </div>
    );
}

export default MainLayout;
