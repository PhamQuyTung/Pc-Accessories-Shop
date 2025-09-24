// hooks/useUnsavedChangesWarning.js
import { useEffect } from 'react';

export default function useUnsavedChangesWarning(when) {
    useEffect(() => {
        if (!when) return;

        const handleBeforeUnload = (e) => {
            e.preventDefault();
            e.returnValue = '';
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [when]);
}
