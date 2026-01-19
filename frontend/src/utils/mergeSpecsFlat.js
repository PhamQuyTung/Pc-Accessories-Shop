// utils/mergeSpecsFlat.js
export function mergeSpecsFlat(categorySpecs = [], productSpecs = [], variantOverrides = {}) {
    const productMap = {};
    productSpecs.forEach((s) => {
        if (s?.key) productMap[s.key] = s.value;
    });

    return categorySpecs
        .map((catSpec) => {
            const key = catSpec.key;
            const baseValue = productMap[key] ?? '';
            const overrideValue = variantOverrides?.[key];

            const finalValue = overrideValue !== undefined && overrideValue !== '' ? overrideValue : baseValue;

            if (!finalValue || String(finalValue).trim() === '') return null;

            return {
                key,
                label: catSpec.label,
                icon: catSpec.icon,
                value: finalValue,
                isOverridden: overrideValue !== undefined,
            };
        })
        .filter(Boolean);
}
