/**
 * buildSpecOverrides
 * ------------------------------------
 * So sánh specs của variant (UI) với specs gốc của product
 * => chỉ trả về những field khác hoặc field mới
 *
 * @param {Array} productSpecs - specs gốc của product
 * @param {Array} uiSpecs - specs đang chỉnh trong UI (đã merge hoặc clone)
 *
 * @returns {Object} specOverrides
 *
 * Format trả về:
 * {
 *   "Thông số chung": {
 *      "CPU": "Intel i7",
 *      "RAM": "32GB"
 *   },
 *   "Khác": {
 *      "Pin": "5000mAh"
 *   }
 * }
 */
export function buildSpecOverrides(productSpecs = [], uiSpecs = []) {
    const overrides = {};

    if (!Array.isArray(productSpecs) || !Array.isArray(uiSpecs)) {
        return overrides;
    }

    uiSpecs.forEach((uiGroup) => {
        if (!uiGroup?.group || !Array.isArray(uiGroup.fields)) return;

        const baseGroup = productSpecs.find((g) => g.group === uiGroup.group);

        uiGroup.fields.forEach((uiField) => {
            if (!uiField?.label) return;

            const baseField = baseGroup?.fields?.find((f) => f.label === uiField.label);

            const baseValue = baseField?.value ?? '';
            const uiValue = uiField.value ?? '';

            // 👉 Chỉ lưu override nếu:
            // - field mới
            // - hoặc giá trị khác product gốc
            if (!baseField || uiValue !== baseValue) {
                if (!overrides[uiGroup.group]) {
                    overrides[uiGroup.group] = {};
                }

                overrides[uiGroup.group][uiField.label] = uiValue;
            }
        });
    });

    return overrides;
}
