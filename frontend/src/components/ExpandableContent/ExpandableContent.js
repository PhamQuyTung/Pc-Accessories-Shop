import React, { useState, useRef, useEffect } from 'react';
import classNames from 'classnames/bind';
import styles from './ExpandableContent.module.scss';

const cx = classNames.bind(styles);

function ExpandableContent({ html, previewHeight = 400 }) {
    const [expanded, setExpanded] = useState(false);
    const [isOverflowing, setIsOverflowing] = useState(false);
    const contentRef = useRef(null);

    useEffect(() => {
        if (contentRef.current) {
            setIsOverflowing(contentRef.current.scrollHeight > previewHeight);
        }
    }, [html, previewHeight]);

    return (
        <div className={cx('expandable-wrapper')}>
            <div
                ref={contentRef}
                className={cx('expandable-content', { expanded })}
                style={{ maxHeight: expanded ? 'none' : previewHeight }}
                dangerouslySetInnerHTML={{ __html: html }}
            />

            {isOverflowing && !expanded && <div className={cx('overlay')} />}

            {isOverflowing && (
                <button className={cx('toggle-btn')} onClick={() => setExpanded(!expanded)}>
                    {expanded ? 'Thu gọn' : 'Đọc tiếp bài viết'}
                </button>
            )}
        </div>
    );
}

export default ExpandableContent;
