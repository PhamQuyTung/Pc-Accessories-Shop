// src/utils/normalizeImageUrl.js
export function normalizeImageUrl(url) {
    if (!url) return '/default-banner.jpg';
    // Nếu là url tương đối => thêm host backend
    if (url.startsWith('/')) {
        return `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${url}`;
    }
    return url; // đã là absolute url thì giữ nguyên
}
