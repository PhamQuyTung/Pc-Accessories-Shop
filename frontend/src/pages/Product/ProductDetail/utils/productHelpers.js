export const getDisplayName = (product) => {
    if (!product) return '';

    // Lấy default variant
    const defaultVariant =
        product.variations?.find(v => v._id === product.defaultVariantId?.toString()) ||
        product.variations?.[0] ||
        null;

    if (!defaultVariant) return product.name;

    // Nếu variant có name riêng
    if (defaultVariant.name) return `${product.name} - ${defaultVariant.name}`;

    // Lấy tên từ attributes.terms
    const termsNames = (defaultVariant.attributes || [])
        .flatMap(attr =>
            Array.isArray(attr.terms)
                ? attr.terms.map(t => t.name).filter(Boolean)
                : attr.term?.name ? [attr.term.name] : []
        );

    return termsNames.length > 0
        ? `${product.name} - ${termsNames.join(' | ')}`
        : product.name;
};
