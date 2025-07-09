import React from 'react';
import classNames from 'classnames/bind';
import styles from './Pagination.module.scss';

const cx = classNames.bind(styles);

function Pagination({ currentPage, totalPages, onPageChange }) {
    const generatePagination = () => {
        const pages = [];
        const totalShown = 5;

        if (totalPages <= totalShown) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
        } else {
            if (currentPage <= 3) {
                pages.push(1, 2, 3, 4, '...', totalPages);
            } else if (currentPage >= totalPages - 2) {
                pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
            } else {
                pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
            }
        }

        return pages;
    };

    return (
        <div className={cx('pagination')}>
            <button onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1}>
                Prev
            </button>

            {generatePagination().map((page, index) =>
                page === '...' ? (
                    <span key={index} className={cx('dots')}>
                        ...
                    </span>
                ) : (
                    <button
                        key={page}
                        className={cx({ active: currentPage === page })}
                        onClick={() => onPageChange(page)}
                    >
                        {page}
                    </button>
                ),
            )}

            <button onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages}>
                Next
            </button>
        </div>
    );
}

export default Pagination;
