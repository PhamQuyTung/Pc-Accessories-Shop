export function getDisplayName(product, variation, selectedAttributes = {}) {
    if (!product) return "";

    // ===== Trường hợp có variation đang active =====
    if (variation) {
        const attrs = (variation.attributes || [])
            .map(a => {
                const term = Array.isArray(a.terms) ? a.terms[0] : a.terms;
                return term?.name;
            })
            .filter(Boolean)
            .join(" | ");

        return attrs ? `${product.name} - ${attrs}` : product.name;
    }

    // ===== Fallback nếu không có variation =====
    const safeAttrs = Object.values(selectedAttributes || {});
    if (safeAttrs.length > 0) {
        return `${product.name} - ${safeAttrs.join(" | ")}`;
    }

    return product.name;
}
