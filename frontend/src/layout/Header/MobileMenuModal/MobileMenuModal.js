import React, { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import classNames from 'classnames/bind';
import styles from './MobileMenuModal.module.scss';
import axiosClient from '~/utils/axiosClient';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faPhone,
    faTags,
    faBolt,
    faNewspaper,
    faTools,
    faRecycle,
    faShieldAlt,
    faXmark,
    faChevronDown,
} from '@fortawesome/free-solid-svg-icons';
import {
    LapTopIcon,
    LapTopGamingIcon,
    KeyBoardIcon,
    BoxIcon,
    CharIcon,
    ConsoleIcon,
    MouseIcon,
    HeadPhoneIcon,
    LoaIcon,
    PCGVNIcon,
    PrintIcon,
    RAMIcon,
    ScreenIcon,
    MousePadIcon,
} from '~/components/Icons';

const cx = classNames.bind(styles);

function MobileMenuModal({ isOpen, onClose, menus = [] }) {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [openMap, setOpenMap] = useState({}); // track expanded nodes
    const navigate = useNavigate();

    useEffect(() => {
        if (!isOpen) return;
        let mounted = true;
        setLoading(true);
        setOpenMap({});
        axiosClient
            .get('/categories/nested')
            .then((res) => mounted && setCategories(res.data || []))
            .catch(() => axiosClient.get('/categories').then((res) => mounted && setCategories(res.data || [])))
            .finally(() => mounted && setLoading(false));
        return () => {
            mounted = false;
        };
    }, [isOpen]);

    const toggle = useCallback((id) => {
        setOpenMap((prev) => ({ ...prev, [id]: !prev[id] }));
    }, []);

    const handleNavigate = (href) => {
        onClose?.();
        if (href && href.startsWith('/')) {
            navigate(href);
        } else {
            // external or anchor
            window.location.href = href;
        }
    };

    // add helper to choose icon by slug (same logic as CF-Nav)
    function getCategoryIcon(slug) {
        switch (slug) {
            case 'laptop':
                return <LapTopIcon />;
            case 'laptop-gaming':
                return <LapTopGamingIcon />;
            case 'pc-gvn':
            case 'main-cpu-vga':
            case 'case-nguon-tan':
                return <PCGVNIcon />;
            case 'ban-phim':
                return <KeyBoardIcon />;
            case 'chuot-may-tinh':
                return <MouseIcon />;
            case 'lot-chuot':
                return <MousePadIcon />;
            case 'man-hinh':
                return <ScreenIcon />;
            case 'tai-nghe':
                return <HeadPhoneIcon />;
            case 'ghe-ban':
                return <CharIcon />;
            case 'may-choi-game':
            case 'handheld-console':
                return <ConsoleIcon />;
            case 'phan-mem-mang':
                return <PrintIcon />;
            case 'ocung-ram-the':
                return <RAMIcon />;
            case 'loa-mic-webcam':
                return <LoaIcon />;
            case 'phu-kien':
                return <BoxIcon />;
            default:
                return <BoxIcon />;
        }
    }

    const renderTree = useCallback(
        (list, level = 0) => {
            if (!Array.isArray(list) || list.length === 0) return null;
            return (
                <ul className={cx('mobile-menu-tree', `level-${level}`)}>
                    {list.map((c) => {
                        const id = c._id || c.slug || c.name;
                        const hasChildren = Array.isArray(c.children) && c.children.length > 0;
                        const open = !!openMap[id];

                        return (
                            <li key={id} className={cx('mobile-menu-item', { 'has-children': hasChildren })}>
                                <div className={cx('mobile-menu-row')}>
                                    <Link
                                        to={c.link || `/categories/${c.slug || c._id}`}
                                        className={cx('mobile-menu-link')}
                                        onClick={() => {
                                            // always navigate on name click, just close modal
                                            onClose?.();
                                        }}
                                    >
                                        {/* ONLY show icon for top-level categories */}
                                        {level === 0 ? (
                                            <span className={cx('mobile-menu-icon')}>{getCategoryIcon(c.slug)}</span>
                                        ) : (
                                            <span className={cx('mobile-menu-icon', 'spacer')} aria-hidden="true" />
                                        )}

                                        <span className={cx('mobile-menu-name')}>{c.name || c.title || c.slug}</span>
                                    </Link>

                                    {hasChildren && (
                                        <button
                                            aria-expanded={open}
                                            className={cx('mobile-menu-toggle')}
                                            onClick={(e) => {
                                                // prevent any parent handlers and only toggle when arrow clicked
                                                e.stopPropagation();
                                                toggle(id);
                                            }}
                                            title={open ? 'Thu gọn' : 'Mở rộng'}
                                        >
                                            <FontAwesomeIcon icon={faChevronDown} className={cx('chev', { open })} />
                                        </button>
                                    )}
                                </div>

                                {hasChildren && (
                                    <div className={cx('mobile-subwrap', { open })}>
                                        {renderTree(c.children, level + 1)}
                                    </div>
                                )}
                            </li>
                        );
                    })}
                </ul>
            );
        },
        [openMap, toggle, onClose],
    );

    const infoItems = [
        { icon: faPhone, title: 'Hotline', subtitle: '1900.5301', link: '#' },
        { icon: faTags, title: 'Mua PC tặng màn', subtitle: '', link: '#' },
        { icon: faBolt, title: 'Hot Deal | Laptop', subtitle: '', link: '#' },
        { icon: faNewspaper, title: 'Tin tức', subtitle: '', link: '#' },
        { icon: faTools, title: 'Dịch vụ kỹ thuật', subtitle: '', link: '#' },
        { icon: faRecycle, title: 'Thu cũ đổi mới', subtitle: '', link: '#' },
        { icon: faShieldAlt, title: 'Tra cứu bảo hành', subtitle: '', link: '#' },
    ];

    return (
        <>
            <div className={cx('mobile-modal-overlay', { open: isOpen })} onClick={onClose} aria-hidden={!isOpen} />
            <aside className={cx('mobile-modal-panel', { open: isOpen })} role="dialog" aria-modal="true">
                <div className={cx('mobile-modal-header')}>
                    <button className={cx('mobile-modal-close')} onClick={onClose} aria-label="Đóng menu">
                        <FontAwesomeIcon icon={faXmark} />
                    </button>
                    <div className={cx('mobile-modal-logo')}>
                        <img src="/logo192.png" alt="logo" style={{ height: 28 }} />
                    </div>
                </div>

                <div className={cx('mobile-modal-body')}>
                    <section className={cx('mobile-section')}>
                        <h4 className={cx('mobile-section-title')}>Danh mục</h4>
                        {loading ? <div className={cx('mobile-loading')}>Đang tải...</div> : renderTree(categories)}
                    </section>

                    <section className={cx('mobile-section')}>
                        <h4 className={cx('mobile-section-title')}>Thông tin</h4>
                        <ul className={cx('mobile-info-list')}>
                            {infoItems.map((it) => (
                                <li key={it.title}>
                                    <a
                                        href={it.link}
                                        onClick={(e) => {
                                            e.preventDefault();
                                            onClose?.();
                                            if (it.link && it.link.startsWith('/')) navigate(it.link);
                                        }}
                                    >
                                        <FontAwesomeIcon icon={it.icon} className={cx('mobile-info-icon')} />
                                        <div className={cx('mobile-info-text')}>
                                            <div className={cx('mobile-info-title')}>{it.title}</div>
                                            {it.subtitle && <div className={cx('mobile-info-sub')}>{it.subtitle}</div>}
                                        </div>
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </section>

                    {Array.isArray(menus) && menus.length > 0 && (
                        <section className={cx('mobile-section')}>
                            <h4 className={cx('mobile-section-title')}>Menu</h4>
                            {/* simple flat menu rendering (can be improved) */}
                            <ul className={cx('mobile-menu-tree')}>
                                {menus.map((m) => (
                                    <li key={m._id}>
                                        <a href={m.link} onClick={() => onClose?.()}>
                                            {m.name}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </section>
                    )}
                </div>
            </aside>
        </>
    );
}

export default MobileMenuModal;
