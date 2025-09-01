import React from 'react';
import classNames from 'classnames/bind';
import styles from './SkeletonTable.module.scss';

const cx = classNames.bind(styles);

export default function SkeletonTable({ columns = 7, rows = 5, hasImageColumn = true, imageColumnIndex = 3 }) {
    return (
        <tbody>
            {Array.from({ length: rows }).map((_, rowIdx) => (
                <tr key={rowIdx}>
                    {Array.from({ length: columns }).map((_, colIdx) => (
                        <td key={colIdx}>
                            {hasImageColumn && colIdx === imageColumnIndex ? (
                                <div className={cx('skeleton-img')} />
                            ) : (
                                <div className={cx('skeleton-cell')} />
                            )}
                        </td>
                    ))}
                </tr>
            ))}
        </tbody>
    );
}
