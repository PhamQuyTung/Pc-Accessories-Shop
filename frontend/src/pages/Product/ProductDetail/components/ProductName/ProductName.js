import React, { useMemo } from 'react';
import styles from './ProductName.module.scss';
import classNames from 'classnames/bind';

const cx = classNames.bind(styles);

function ProductName({ product, activeVariation, selectedAttributes }) {
    const attributeText = useMemo(() => {
        if (!product) return [];

        const attrs = [];

        // Nếu đã chọn variation → lấy từ variation
        if (activeVariation?.attributes) {
            activeVariation.attributes.forEach((item) => {
                const attrName = item.attrId?.name;
                const termName = Array.isArray(item.terms) ? item.terms[0]?.name : item.terms?.name;

                if (attrName && termName) {
                    attrs.push(`${attrName}: ${termName}`);
                }
            });
            return attrs;
        }

        // Nếu chọn attributes thủ công → lấy từ selectedAttributes
        if (selectedAttributes && product.attributes) {
            product.attributes.forEach((attr) => {
                const attrId = attr.attrId._id;
                const termId = selectedAttributes[attrId];

                if (termId) {
                    const termObj = attr.terms.find((t) => t._id === termId);
                    if (termObj) {
                        attrs.push(`${attr.attrId.name}: ${termObj.name}`);
                    }
                }
            });
        }

        return attrs;
    }, [product, activeVariation, selectedAttributes]);

    if (!product) return null;

    const finalName = attributeText.length > 0 ? `${product.name} - ${attributeText.join(' - ')}` : product.name;

    return <h1 className={cx('product-name')}>{finalName}</h1>;
}

export default ProductName;
