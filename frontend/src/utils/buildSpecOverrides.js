export function buildSpecOverrides(productSpecs = [], uiSpecs = []) {
    const overrides = {};
    const normalize = (v) =>
        String(v ?? '')
            .replace(/\s+/g, ' ')
            .trim();

    uiSpecs.forEach((uiGroup) => {
        if (!uiGroup?.group || !Array.isArray(uiGroup.fields)) return;

        const baseGroup = productSpecs.find((g) => g.group === uiGroup.group);

        uiGroup.fields.forEach((uiField) => {
            if (!uiField?.label) return;

            const baseField = baseGroup?.fields?.find((f) => f.label === uiField.label);

            const uiValue = normalize(uiField.value);
            if (uiValue === '') return;

            const baseValue = normalize(baseField?.value);

            if (!baseField || uiValue !== baseValue) {
                overrides[uiGroup.group] ??= {};
                overrides[uiGroup.group][uiField.label] = uiValue;
            }
        });
    });

    return overrides;
}
