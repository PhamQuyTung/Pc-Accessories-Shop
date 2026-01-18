// =========================
//   SORTING HELPERS
// =========================

// Ưu tiên: color → size → others
export const getAttributePriority = (name = '') => {
    const lower = name.toLowerCase();
    if (lower.includes('màu') || lower.includes('color')) return 0;
    if (lower.includes('size') || lower.includes('kích thước')) return 1;
    return 2;
};

// Sắp xếp attributes theo priority
export const getSortedAttributes = (attributes = []) => {
    if (!Array.isArray(attributes)) return [];

    return [...attributes].sort((a, b) => {
        const aName = a?.attrId?.name || '';
        const bName = b?.attrId?.name || '';
        return getAttributePriority(aName) - getAttributePriority(bName);
    });
};

// =========================
//   LABEL FOR VARIATION
// =========================

// Trả về: "Màu: Đen - RAM: 8GB - SSD: 256GB"
export const getVariationLabel = (variation) => {
    if (!variation?.attributes?.length) return 'Biến thể';

    return variation.attributes
        .map((a) => {
            // attr name
            const attrName = typeof a.attrId === 'object' && a.attrId?.name ? a.attrId.name : 'Thuộc tính';

            // term
            const term = Array.isArray(a.terms) ? a.terms[0] : a.terms;
            const termName = typeof term === 'object' && term?.name ? term.name : 'Giá trị';

            return `${attrName}: ${termName}`;
        })
        .join(' - ');
};

// =========================
//   MATCHING LOGIC
// =========================

// Kiểm tra variation có match selectedAttributes không
export const isVariationMatching = (variation, selectedAttributes = {}) => {
    if (!variation?.attributes?.length) return false;

    const varMap = {};

    variation.attributes.forEach((a) => {
        const attrId = typeof a.attrId === 'object' ? a.attrId._id : a.attrId;

        const term = Array.isArray(a.terms) ? a.terms[0] : a.terms;
        const termId = typeof term === 'object' ? term?._id : term;

        if (attrId && termId) {
            varMap[attrId.toString()] = termId.toString();
        }
    });

    return Object.entries(selectedAttributes).every(([key, val]) => varMap[key.toString()] === val.toString());
};

// =========================
//   SORTING VARIATIONS
// =========================

// Mục đích: sắp variation theo thứ tự dễ đọc
// Màu → Size → thông số khác
export const getSortedVariations = (variations = []) => {
    if (!Array.isArray(variations)) return [];

    return [...variations].sort((a, b) => {
        const aLabel = getVariationLabel(a).toLowerCase();
        const bLabel = getVariationLabel(b).toLowerCase();
        return aLabel.localeCompare(bLabel, 'vi');
    });
};
