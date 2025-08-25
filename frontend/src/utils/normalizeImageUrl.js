// src/utils/normalizeImageUrl.js
import { API_URL } from '~/config/api';

export function normalizeImageUrl(url) {
    if (!url) return '/default-banner.jpg';
    return url.startsWith('/') ? `${API_URL}${url}` : url;
}
