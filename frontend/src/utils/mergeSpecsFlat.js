// src/utils/mergeSpecsFlat.js
export function mergeSpecsFlat(categorySpecs = [], productSpecs = [], overrides = {}) {
    // product specs: Array → Object
    const productMap = Object.fromEntries((productSpecs || []).map((s) => [s.key, s.value]));

    // overrides: Object (specOverrides từ variation)
    const overrideMap = overrides && typeof overrides === 'object' ? overrides : {};

    return (categorySpecs || []).map((spec) => ({
        key: spec.key,
        label: spec.label,
        icon: spec.icon,
        value: overrideMap[spec.key] ?? productMap[spec.key] ?? '—',
    }));
}
