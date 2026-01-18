import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function useProductVariations(product, vid) {
    const [selectedAttributes, setSelectedAttributes] = useState({});
    const [activeVariation, setActiveVariation] = useState(null);

    const navigate = useNavigate();
    const location = useLocation();

    const getSafeAttrs = (variation) => {
        if (!variation?.attributes || !Array.isArray(variation.attributes)) return {};

        const attrs = {};
        variation.attributes.forEach((a) => {
            const attrId = a?.attrId?._id || a?.attrId;
            if (!attrId) return;

            let term = null;

            if (Array.isArray(a?.terms)) {
                term = a.terms[0];
            } else {
                term = a?.terms;
            }

            const termId = term?._id || term;
            if (termId) attrs[attrId] = termId;
        });

        return attrs;
    };

    // Khi product hoặc vid thay đổi, set lại activeVariation
    useEffect(() => {
        if (!Array.isArray(product?.variations) || product.variations.length === 0) return;

        let variation = null;

        // 1. Query param vid
        if (vid) {
            variation = product.variations.find((v) => String(v._id) === String(vid));
        }

        // 2. Default variant
        if (!variation && product.defaultVariantId) {
            variation = product.variations.find((v) => v._id === product.defaultVariantId);
        }

        // 3. Fallback: biến thể đầu tiên
        if (!variation) {
            variation = product.variations[0];
        }

        if (!variation) return; // tránh crash

        const attrs = getSafeAttrs(variation);

        setSelectedAttributes(attrs);
        setActiveVariation(variation);
    }, [product, vid]);

    // Khi chọn attribute → tìm biến thể phù hợp
    useEffect(() => {
        if (!Array.isArray(product?.variations)) return;
        if (!selectedAttributes || Object.keys(selectedAttributes).length === 0) return;

        const match = product.variations.find(
            (v) =>
                Array.isArray(v.attributes) &&
                v.attributes.every((a) => {
                    const id = a?.attrId?._id || a?.attrId;
                    if (!id) return false;

                    const term = Array.isArray(a?.terms) ? a.terms[0] : a?.terms;
                    const termId = term?._id || term;

                    return selectedAttributes[id] === termId;
                }),
        );

        // 🛑 CHỈ SET KHI KHÁC VARIANT HIỆN TẠI
        if (match && (!activeVariation || String(match._id) !== String(activeVariation._id))) {
            setActiveVariation(match);
        }
    }, [selectedAttributes, product]);

    const handleSelectAttribute = (attrId, termId) => {
        setSelectedAttributes((prev) => {
            const next = { ...prev };

            if (next[attrId] === termId) {
                delete next[attrId]; // ❗ xoá key
            } else {
                next[attrId] = termId;
            }

            return next;
        });
    };

    const handleSelectVariation = (variation) => {
        if (!variation) return;

        const attrs = getSafeAttrs(variation);

        setSelectedAttributes(attrs);
        setActiveVariation(variation);

        // update URL ?vid=xxxx
        const params = new URLSearchParams(location.search);
        params.set('vid', variation._id);

        navigate(`${location.pathname}?${params.toString()}`, { replace: true });
    };

    return {
        selectedAttributes,
        activeVariation,
        handleSelectAttribute,
        handleSelectVariation,
    };
}
