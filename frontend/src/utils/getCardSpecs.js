// src/utils/getCardSpecs.js
export function getCardSpecs(product, variation = null, limit = 6) {
    const categorySpecs = product.category?.specs || [];
    const productSpecs = product.specs || [];

    const productMap = Object.fromEntries(productSpecs.map((s) => [s.key, s.value]));

    const variationMap =
        variation?.specOverrides && typeof variation.specOverrides === 'object' ? variation.specOverrides : {};

    return categorySpecs
        .filter((s) => s.showOnCard) // 🔥 QUYẾT ĐỊNH TẠI CATEGORY
        .map((s) => ({
            key: s.key,
            label: s.label,
            icon: s.icon,
            value: variationMap[s.key] ?? productMap[s.key],
        }))
        .filter((s) => s.value) // bỏ spec rỗng
        .slice(0, limit);
}
