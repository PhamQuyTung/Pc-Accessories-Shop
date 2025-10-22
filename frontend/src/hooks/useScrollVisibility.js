// hooks/useScrollVisibility.js
import { useState, useEffect } from 'react';

function useScrollVisibility() {
    const [visible, setVisible] = useState(true);

    useEffect(() => {
        const handleScroll = () => {
            const currentY = window.scrollY;

            // 👉 Chỉ hiện khi scroll = 0
            if (currentY === 0) {
                setVisible(true);
            } else {
                setVisible(false);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return visible;
}

export default useScrollVisibility;
