import React from 'react';
import { Link } from 'react-router-dom';
import { CarIcon } from '~/components/Icons';
import styles from './SectionHeading.module.scss';
import classNames from 'classnames/bind';

const cx = classNames.bind(styles);

function SectionHeading({ title = title, shTitle = shTitle, link = link }) {
    return (
        <div className={cx('PC-heading')}>
            <div className={cx('PC-heading__top')}>
                <h2>
                    <Link to={link}>{title}</Link>
                </h2>
                <div className={cx('PC-heading__top--shTitle')}>
                    <CarIcon className={cx('icon-car')} />
                    <h3>{shTitle}</h3>
                </div>
            </div>
            <div className={cx('PC-heading__watchAll')}>
                <Link to={link}>Xem tất cả</Link>
            </div>
        </div>
    );
}

export default SectionHeading;
