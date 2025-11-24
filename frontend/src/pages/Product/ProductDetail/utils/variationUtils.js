// =========================
//   SORTING HELPERS
// =========================

// Ưu tiên: color → size → others
export const getAttributePriority = (name) => {
    const lower = name.toLowerCase();
    if (lower.includes('màu') || lower.includes('color')) return 0;
    if (lower.includes('size') || lower.includes('kích thước')) return 1;
    return 2;
};

// Sắp xếp attributes theo priority
export const getSortedAttributes = (attributes) => {
    if (!Array.isArray(attributes)) return [];
    return [...attributes].sort((a, b) => getAttributePriority(a.attrId.name) - getAttributePriority(b.attrId.name));
};

// =========================
//   LABEL FOR VARIATION
// =========================

// Trả về: "Màu: Đen - RAM: 8GB - SSD: 256GB"
export const getVariationLabel = (variation) => {
    if (!variation?.attributes) return '';

    return variation.attributes
        .map((a) => {
            const term = Array.isArray(a.terms) ? a.terms[0] : a.terms;
            return `${a.attrId.name}: ${term?.name}`;
        })
        .join(' - ');
};

// =========================
//   MATCHING LOGIC
// =========================

// Kiểm tra variation có match selectedAttributes không
export const isVariationMatching = (variation, selectedAttributes) => {
    if (!variation?.attributes) return false;

    const varMap = {};

    variation.attributes.forEach((a) => {
        const attrId = typeof a.attrId === 'object' ? a.attrId._id : a.attrId;
        const term = Array.isArray(a.terms) ? a.terms[0] : a.terms;
        const termId = typeof term === 'object' && term?._id ? term._id : term;
        varMap[attrId] = termId;
    });

    return Object.entries(selectedAttributes).every(([key, val]) => varMap[key] === val);
};

// =========================
//   SORTING VARIATIONS
// =========================

// Mục đích: sắp variation theo thứ tự dễ đọc
// Màu → Size → thông số khác
export const getSortedVariations = (variations) => {
    if (!Array.isArray(variations)) return [];

    return [...variations].sort((a, b) => {
        const aLabel = getVariationLabel(a).toLowerCase();
        const bLabel = getVariationLabel(b).toLowerCase();
        return aLabel.localeCompare(bLabel, 'vi');
    });
};
