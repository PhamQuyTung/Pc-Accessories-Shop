import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Rating } from '@mui/material';
import classNames from 'classnames/bind';
import styles from './Rating.module.scss';

const cx = classNames.bind(styles);

function BasicRating({ className, ratingNum, dpNone = false }) {
    // Đảm bảo giá trị luôn là số (mặc định là 0 nếu không hợp lệ)
    const [value, setValue] = useState(Number(ratingNum) || 0); // Giá trị mặc định

    return (
        <div
            className={className}
            style={{ textAlign: 'center', paddingBottom: '15px', display: 'flex', alignItems: 'center' }}
        >
            <Rating
                // name="simple-controlled"
                // value={value}
                // name="half-rating"
                // defaultValue={2.5}
                precision={0.5} // Hỗ trợ đánh giá theo nửa sao
                // onChange={(event, newValue) => {
                //     setValue(newValue);
                //     console.log('Rating:', newValue);
                // }}
                name="read-only"
                value={value}
                readOnly
            />
            <p className={cx({ dpNone: 'dpNone' })} style={{ margin: 0 }}>
                ({value})
            </p>
        </div>
    );
}

BasicRating.propTypes = {
    className: PropTypes.string,
    ratingNum: PropTypes.number,
    dpNone: PropTypes.bool, // Cho phép hiển thị hoặc không
};

export default BasicRating;
