// file này dùng để hiển thị tên có biến thể cho product card + product (thẻ)
export function getDefaultDisplayName(product) {
    if (!product) return "";

    let defaultVariation = null;

    if (product.defaultVariantId && Array.isArray(product.variations)) {
        defaultVariation = product.variations.find(
            v => v._id === product.defaultVariantId
        );
    }

    if (!defaultVariation) {
        defaultVariation = product.variations?.[0] || null;
    }

    if (!defaultVariation) return product.name;

    // Lấy tên từ attribute
    const attrs = (defaultVariation.attributes || [])
        .map(a => {
            const term = Array.isArray(a.terms) ? a.terms[0] : a.terms;
            return term?.name;
        })
        .filter(Boolean)
        .join(" | ");

    return attrs ? `${product.name} - ${attrs}` : product.name;
}
