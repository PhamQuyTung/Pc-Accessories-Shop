import React, { useEffect, useState, useRef } from 'react';
import styles from './Counter.module.scss';
import classNames from 'classnames/bind';

const cx = classNames.bind(styles);

function Counter({ value, duration = 1000 }) {
    const [count, setCount] = useState(0);
    const [done, setDone] = useState(false);
    const frame = useRef();

    useEffect(() => {
        let start = 0;
        const end = typeof value === 'number' ? value : 0;
        if (start === end) {
            setCount(end);
            setDone(true);
            return;
        }

        const startTime = performance.now();

        const animate = (time) => {
            const elapsed = time - startTime;
            const progress = Math.min(elapsed / duration, 1); // từ 0 → 1
            const current = Math.floor(progress * end);

            setCount(current);

            if (progress < 1) {
                frame.current = requestAnimationFrame(animate);
            } else {
                setDone(true); // kết thúc → bật hiệu ứng bounce
            }
        };

        frame.current = requestAnimationFrame(animate);

        return () => cancelAnimationFrame(frame.current);
    }, [value, duration]);

    return <span className={cx({ bounce: done })}>{count.toLocaleString()}</span>;
}

export default Counter;
