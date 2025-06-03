// utils/formatLabelToPath.js
export function formatLabelToPath(label) {
    return label
        .toLowerCase()
        .normalize('NFD') // bỏ dấu tiếng Việt
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/\s+/g, '-') // thay khoảng trắng bằng dấu -
        .replace(/[^a-z0-9\-]/g, '') // bỏ ký tự đặc biệt
        .replace(/\-+/g, '-'); // bỏ nhiều dấu - liên tiếp
}
