import React, { useEffect, useRef, useState } from 'react';
import Header from '../Header/header';
import Footer from '../Footer/Footer';
import { Outlet } from 'react-router-dom';
import styles from './MainLayout.module.scss';
import classNames from 'classnames/bind';
import UpToTop from '~/components/UpToTop/UpToTop';
import TopBanner from '~/components/TopBanner/TopBanner';
import SubHeader from '~/components/SubHeader/SubHeader';
import useScrollVisibility from '~/hooks/useScrollVisibility';

const cx = classNames.bind(styles);

function MainLayout() {
    const headerRef = useRef(null);
    const [headerHeight, setHeaderHeight] = useState(0);
    const [isBannerHidden, setIsBannerHidden] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false); // 👈 thêm state để mở/đóng menu
    const [menus, setMenus] = useState([]); // 👈 dữ liệu menu cho SubHeader
    const bannerVisible = useScrollVisibility();

    // 🧭 Giả lập dữ liệu menu (sau này có thể fetch từ API)
    useEffect(() => {
        const sampleMenus = [
            { _id: 1, name: 'Trang chủ', link: '/', parent: null },
            { _id: 2, name: 'Laptop', link: '/laptop', parent: null },
            { _id: 3, name: 'PC Gaming', link: '/pc', parent: null },
            { _id: 4, name: 'Màn hình', link: '/monitor', parent: null },
            { _id: 5, name: 'Phụ kiện', link: '/accessories', parent: null },
            { _id: 6, name: 'Tin tức', link: '/news', parent: null },
            // Ví dụ menu con
            { _id: 7, name: 'Chuột', link: '/accessories/mouse', parent: 5 },
            { _id: 8, name: 'Bàn phím', link: '/accessories/keyboard', parent: 5 },
        ];
        setMenus(sampleMenus);
    }, []);

    // 👀 Theo dõi TopBanner có đang ẩn không
    useEffect(() => {
        const observer = new MutationObserver(() => {
            setIsBannerHidden(document.body.classList.contains('banner-hidden'));
        });
        observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
        return () => observer.disconnect();
    }, []);

    // 📏 Tính chiều cao Header để đẩy nội dung xuống
    useEffect(() => {
        const updateHeight = () => {
            const headerEl = headerRef.current;
            const subHeaderEl = document.querySelector(`.${cx('subHeader')}`); // tìm SubHeader trong DOM

            if (headerEl) {
                const headerH = headerEl.offsetHeight || 0;
                const subHeaderH =
                    subHeaderEl && window.getComputedStyle(subHeaderEl).display !== 'none'
                        ? subHeaderEl.offsetHeight
                        : 0;

                setHeaderHeight(headerH + subHeaderH);
            }
        };

        updateHeight();

        const resizeObserver = new ResizeObserver(() => updateHeight());
        if (headerRef.current) resizeObserver.observe(headerRef.current);

        // Theo dõi SubHeader nếu nó thay đổi chiều cao (ẩn/hiện)
        const subHeaderEl = document.querySelector(`.${cx('subHeader')}`);
        if (subHeaderEl) resizeObserver.observe(subHeaderEl);

        window.addEventListener('scroll', updateHeight);
        window.addEventListener('resize', updateHeight);

        return () => {
            resizeObserver.disconnect();
            window.removeEventListener('scroll', updateHeight);
            window.removeEventListener('resize', updateHeight);
        };
    }, []);

    return (
        <div className={cx('main-layout', { 'banner-hidden': !bannerVisible })}>
            {/* 🟦 Banner quảng cáo */}
            <TopBanner />

            {/* 🔴 Header + Thanh menu phụ */}
            <header ref={headerRef} className={cx('header-wrapper', { compact: isBannerHidden })}>
                {/* Header chính */}
                <Header />

                {/* 🔸 Thanh menu phụ */}
                <SubHeader />
            </header>

            {/* 🧱 Nội dung chính */}
            <main style={{ paddingTop: headerHeight + (isBannerHidden ? 0 : 90) }}>
                <Outlet />
            </main>

            {/* 🔻 Footer */}
            <Footer />

            {/* ⬆️ Nút lên đầu trang */}
            <UpToTop scrollThreshold={400} smooth={true} size={26} />
        </div>
    );
}

export default MainLayout;
