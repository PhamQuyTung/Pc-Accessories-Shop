import React from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar, faStarHalfAlt } from '@fortawesome/free-solid-svg-icons';
import classNames from 'classnames/bind';
import styles from './Rating.module.scss';

const cx = classNames.bind(styles);

function BasicRating({ value = 0 }) {
    return (
        <span className={cx('rating-stars')}>
            {Array.from({ length: 5 }).map((_, i) => {
                const full = i + 1 <= Math.floor(value);
                const half = !full && i + 0.5 <= value;

                return (
                    <span key={i}>
                        {full ? (
                            <FontAwesomeIcon icon={faStar} style={{ color: '#ffcc00' }} />
                        ) : half ? (
                            <FontAwesomeIcon icon={faStarHalfAlt} style={{ color: '#ffcc00' }} />
                        ) : (
                            <FontAwesomeIcon icon={faStar} style={{ color: '#ccc' }} />
                        )}
                    </span>
                );
            })}
        </span>
    );
}

BasicRating.propTypes = {
    value: PropTypes.number,
};

export default BasicRating;
