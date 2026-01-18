export function buildSpecOverrides(uiSpecs = []) {
    const overrides = {};

    const normalize = (v) =>
        String(v ?? '')
            .replace(/\s+/g, ' ')
            .trim();

    uiSpecs.forEach((spec) => {
        if (!spec?.key) return;

        const uiValue = normalize(spec.value);
        const baseValue = normalize(spec.baseValue);

        if (uiValue === '') return;

        if (uiValue !== baseValue) {
            overrides[spec.key] = uiValue;
        }
    });

    return overrides;
}
