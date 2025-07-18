import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import styles from './NotFoundPage.module.scss';
import classNames from 'classnames/bind';
import { SearchNoResults } from '~/components/Icons';

const cx = classNames.bind(styles);

function NotFoundPage() {
    const location = useLocation();
    const query = new URLSearchParams(location.search).get('query');

    return (
        <div className={cx('container')}>
            <h1 className={cx('title')}>TÌM KIẾM</h1>
            <div className={cx('content')}>
                <SearchNoResults />
                <p className={cx('text')}>
                    Rất tiếc, chúng tôi không tìm thấy kết quả cho từ khóa của bạn
                </p>
                {query && <p className={cx('keyword')}>"{query}"</p>}
                <p className={cx('note')}>
                    Vui lòng kiểm tra chính tả, sử dụng các từ tổng quát hơn và thử lại!
                </p>
                <Link to="/" className={cx('home-link')}>
                    Quay về trang chủ
                </Link>
            </div>
        </div>
    );
}

export default NotFoundPage;
