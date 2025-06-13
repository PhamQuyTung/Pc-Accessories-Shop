import React from 'react';
import styles from './DuoBanner.module.scss';
import classNames from 'classnames/bind';
import { Col, Row } from 'react-bootstrap';

const cx = classNames.bind(styles);

const DuoBanner = () => {
    return (
        <div className={cx('duoBanner-container')}>
            <div class="div10">10</div>
            <div class="div11">11</div>
        </div>
    );
};

export default DuoBanner;
