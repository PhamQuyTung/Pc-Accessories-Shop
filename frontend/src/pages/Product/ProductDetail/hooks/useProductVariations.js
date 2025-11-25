import { useState, useEffect } from 'react';

export default function useProductVariations(product, vid) {
    const [selectedAttributes, setSelectedAttributes] = useState({});
    const [activeVariation, setActiveVariation] = useState(null);

    // Khi product hoặc vid thay đổi, set lại activeVariation
    useEffect(() => {
        if (!product?.variations?.length) return;

        let variation = null;

        if (vid) {
            // Ưu tiên query param
            variation = product.variations.find((v) => v._id === vid);
        }

        // Nếu không có vid hoặc không match → lấy defaultVariantId
        if (!variation && product.defaultVariantId) {
            variation = product.variations.find((v) => v._id === product.defaultVariantId);
        }

        // Nếu vẫn không có → fallback biến thể đầu tiên
        if (!variation) {
            variation = product.variations[0];
        }

        if (!variation) variation = product.variations[0];

        const attrs = {};
        variation.attributes.forEach((a) => {
            const attrId = a.attrId._id || a.attrId;
            const termId = Array.isArray(a.terms) ? a.terms[0]._id : a.terms._id;
            attrs[attrId] = termId;
        });

        setSelectedAttributes(attrs);
        setActiveVariation(variation);
    }, [product, vid]);

    // Khi chọn attribute → tìm biến thể phù hợp
    useEffect(() => {
        if (!product?.variations?.length) return;

        const match = product.variations.find((v) =>
            v.attributes.every((a) => {
                const id = a.attrId._id || a.attrId;
                const t = Array.isArray(a.terms) ? a.terms[0] : a.terms;
                const termId = t._id || t;
                return selectedAttributes[id] === termId;
            }),
        );

        if (match) setActiveVariation(match);
    }, [selectedAttributes, product]);

    const handleSelectAttribute = (attrId, termId) => {
        setSelectedAttributes((prev) => ({
            ...prev,
            [attrId]: prev[attrId] === termId ? undefined : termId,
        }));
    };

    const handleSelectVariation = (variation) => {
        const attrs = {};
        variation.attributes.forEach((a) => {
            const attrId = a.attrId._id || a.attrId;
            const term = Array.isArray(a.terms) ? a.terms[0] : a.terms;
            attrs[attrId] = term._id || term;
        });

        setSelectedAttributes(attrs);
        setActiveVariation(variation);
    };

    return {
        selectedAttributes,
        activeVariation,
        handleSelectAttribute,
        handleSelectVariation,
    };
}
