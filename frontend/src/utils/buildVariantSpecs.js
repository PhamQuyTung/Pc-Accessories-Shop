export function buildVariantSpecs(categorySpecs, productSpecs, specOverrides = {}) {
    const productMap = new Map(productSpecs.map((s) => [s.key, s.value]));

    return categorySpecs.map((spec) => {
        const baseValue = productMap.get(spec.key) ?? '';
        const overrideValue = specOverrides?.[spec.key];

        return {
            key: spec.key,
            label: spec.label,
            type: spec.type || 'text',
            value: overrideValue ?? baseValue,
            overridden: overrideValue !== undefined && overrideValue !== baseValue,
            baseValue,
        };
    });
}
