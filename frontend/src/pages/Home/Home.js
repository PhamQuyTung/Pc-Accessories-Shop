import { useEffect, useRef } from 'react';
import classNames from 'classnames/bind';
import styles from './Home.module.scss';

import ContainerFluid from './ContainerFluid/ContainerFluid';
import LTG from './LTG/LTG';
import PC from './PC/PC';
import Chuot from './Chuot/Chuot';
import BanPhim from './BanPhim/BanPhim';
import LT from './LT/LT';
import Screen from './Screen/Screen';
import Promotions from './Promotions/PromotionsWrapper';
import LatestPosts from './LatestPosts/LatestPosts';

const cx = classNames.bind(styles);

function Home() {
    const sectionsRef = useRef([]);

    const sections = [
        <ContainerFluid key="container" />,
        <Promotions key="promo" />,
        <PC key="pc" />,
        <LT key="lt" />,
        <LTG key="ltg" />,
        <Chuot key="chuot" />,
        <BanPhim key="banphim" />,
        <Screen key="screen" />,
        <LatestPosts key="posts" />,
    ];

    // Hiệu ứng khi scroll tới phần tử
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add(styles.visible);
                    }
                });
            },
            { threshold: 0.15 },
        );

        const elements = sectionsRef.current.filter((el) => el instanceof Element);
        elements.forEach((el) => observer.observe(el));

        return () => {
            elements.forEach((el) => observer.unobserve(el));
        };
    }, []);

    return (
        <div className={cx('wrapper')}>
            {sections.map((Section, index) => (
                <div
                    key={index}
                    ref={(el) => (sectionsRef.current[index] = el)}
                    className={cx('section', { first: index === 0 })}
                    style={{ animationDelay: `${index * 0.1}s` }}
                >
                    {Section}
                </div>
            ))}
        </div>
    );
}

export default Home;
