// src/utils/getExcerpt.js
export default function getExcerpt(html, maxLength = 100) {
    if (!html) return '';

    // 🧹 Bỏ hết thẻ HTML
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    const text = tmp.textContent || tmp.innerText || '';

    // ✂️ Cắt nội dung plain text
    if (text.length > maxLength) {
        return text.substring(0, maxLength) + '...';
    }

    return text;
}
