// file này dùng để hiển thị tên có biến thể cho product card + product (thẻ)
export function getDefaultDisplayName(product) {
    if (!product) return '';

    let defaultVariation = null;

    if (product.defaultVariantId && Array.isArray(product.variations)) {
        defaultVariation = product.variations.find((v) => v._id?.toString() === product.defaultVariantId?.toString());
    }

    if (!defaultVariation) {
        defaultVariation = product.variations?.[0] || null;
    }

    if (!defaultVariation) return product.name;

    const attrs = (defaultVariation.attributes || [])
        .map((a) => a?.terms?.[0]?.name)
        .filter(Boolean)
        .join(' | ');

    return attrs ? `${product.name} - ${attrs}` : product.name;
}
