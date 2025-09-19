// src/utils/getExcerpt.js
export default function getExcerpt(html, maxLength = 100) {
    if (!html) return '';

    // 🧹 Bỏ hết thẻ HTML
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    let text = tmp.textContent || tmp.innerText || '';

    // ❌ Loại bỏ shortcode dạng [product id="..."]
    text = text.replace(/\[product.*?\]/g, '');

    // ✂️ Cắt nội dung plain text
    if (text.length > maxLength) {
        return text.substring(0, maxLength) + '...';
    }

    return text;
}
