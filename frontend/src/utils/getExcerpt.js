// utils/getExcerpt.js
export default function getExcerpt(content, length = 100) {
    if (!content) return '';

    // Loại bỏ toàn bộ thẻ HTML
    const text = content.replace(/<[^>]+>/g, '');

    // Cắt theo độ dài mong muốn
    return text.length > length ? text.slice(0, length) + '...' : text;
}
