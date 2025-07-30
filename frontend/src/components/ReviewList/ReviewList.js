// components/ReviewList.js
import React from 'react';
import styles from './ReviewList.module.scss';
import classNames from 'classnames/bind';
import { FaStar } from 'react-icons/fa';
import moment from 'moment';

const cx = classNames.bind(styles);

export default function ReviewList({ reviews = [] }) {
    return (
        <div className={cx('review-list')}>
            {reviews.length === 0 ? (
                <p className={cx('no-review')}>Chưa có đánh giá nào.</p>
            ) : (
                reviews.map((review) => (
                    <div className={cx('review-item')} key={review._id}>
                        <div className={cx('avatar')}>
                            <img src={review.user?.avatar || '/images/default-avatar.png'} alt="avatar" />
                        </div>
                        <div className={cx('content')}>
                            <div className={cx('header')}>
                                <span className={cx('name')}>{review.user?.name || 'Người dùng ẩn danh'}</span>
                                <span className={cx('time')}>{moment(review.createdAt).fromNow()}</span>
                            </div>
                            <div className={cx('stars')}>
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <FaStar key={star} color={star <= review.rating ? '#ffc107' : '#e4e5e9'} />
                                ))}
                            </div>
                            <p className={cx('comment')}>{review.comment}</p>
                        </div>
                    </div>
                ))
            )}
        </div>
    );
}
