export function buildSpecOverrides(uiSpecs = []) {
    const overrides = {};

    uiSpecs.forEach((spec) => {
        if (!spec?.key) return;
        if (!spec.overridden) return;

        overrides[spec.key] = String(spec.value ?? '').trim();
    });

    return overrides;
}
