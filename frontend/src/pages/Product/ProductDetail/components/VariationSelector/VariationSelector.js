import React from 'react';
import { useSearchParams } from 'react-router-dom';
import classNames from 'classnames/bind';
import styles from './VariationSelector.module.scss';
import GiftList from '~/components/GiftList/GiftList';
import {
    getSortedVariations,
    getVariationLabel,
    isVariationMatching,
    getSortedAttributes,
} from '~/pages/Product/ProductDetail/utils/variationUtils';

const cx = classNames.bind(styles);

const VariationSelector = ({
    product,
    selectedAttributes,
    activeVariation,
    onSelectVariation,
    onSelectAttribute,
    COLOR_MAP,
}) => {
    const [searchParams, setSearchParams] = useSearchParams();

    const hasVariations = product.variations && product.variations.length > 0;
    const hasAttributes = product.attributes && product.attributes.length > 0;

    console.log('product.attributes = ', product.attributes);

    const handleSelectVariation = (variation) => {
        onSelectVariation(variation);
        if (variation?._id) {
            searchParams.set('vid', variation._id);
            setSearchParams(searchParams);
        }
    };

    const handleSelectAttribute = (attrId, termId) => {
        onSelectAttribute(attrId, termId);

        // Kiểm tra sau khi chọn attribute, có một variation duy nhất match tất cả attribute không
        const allSelected = { ...selectedAttributes, [attrId]: termId };
        const matchedVariation = product.variations?.find((v) =>
            v.attributes.every((a) => {
                const id = a.attrId._id || a.attrId;
                const t = Array.isArray(a.terms) ? a.terms[0] : a.terms;
                const termIdCheck = t._id || t;
                return allSelected[id] === termIdCheck;
            }),
        );

        if (matchedVariation?._id) {
            searchParams.set('vid', matchedVariation._id);
            setSearchParams(searchParams);
        }
    };

    return (
        <>
            {hasVariations ? (
                <div className={cx('product-variations-grouped')}>
                    <p className={cx('variations-label')}>Chọn biến thể:</p>
                    <div className={cx('variations-grid')}>
                        {getSortedVariations(product.variations).map((variation, index) => {
                            const isActive = isVariationMatching(variation, selectedAttributes);
                            const label = getVariationLabel(variation, product.attributes || []);

                            return (
                                <button
                                    key={variation._id || index}
                                    onClick={() => handleSelectVariation(variation)}
                                    className={cx('variation-btn', { active: isActive })}
                                    title={label}
                                >
                                    <span className={cx('variation-text')}>{label}</span>
                                    {variation.price && (
                                        <span className={cx('variation-price')}>
                                            {variation.discountPrice
                                                ? variation.discountPrice.toLocaleString()
                                                : variation.price.toLocaleString()}
                                            ₫
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                    <GiftList gifts={product.gifts} />
                </div>
            ) : hasAttributes ? (
                <div className={cx('product-attributes')}>
                    {getSortedAttributes(product.attributes).map((attr) => {
                        const attrId = attr.attrId._id;
                        const isColorAttr =
                            attr.attrId.name.toLowerCase().includes('màu') ||
                            attr.attrId.name.toLowerCase().includes('color');

                        return (
                            <div key={attrId} className={cx('product-attribute')}>
                                <p className={cx('attr-label')}>{attr.attrId.name}:</p>
                                <div className={cx('attr-options')}>
                                    {attr.terms?.map((term) => {
                                        const termId = term._id;
                                        const isActive = selectedAttributes[attrId] === termId;
                                        const colorCode = term.colorCode || COLOR_MAP?.[term.name] || null;

                                        if (isColorAttr) {
                                            return (
                                                <div
                                                    key={termId}
                                                    className={cx('attr-option', 'color-option', { active: isActive })}
                                                    onClick={() => handleSelectAttribute(attrId, termId)}
                                                >
                                                    <button
                                                        className={cx('attr-option__color', { active: isActive })}
                                                        style={{ backgroundColor: colorCode || '#ccc' }}
                                                    />
                                                    <span className={cx('color-name')}>{term.name}</span>
                                                </div>
                                            );
                                        }

                                        return (
                                            <button
                                                key={termId}
                                                onClick={() => handleSelectAttribute(attrId, termId)}
                                                className={cx('attr-option', { active: isActive })}
                                            >
                                                {term.name}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                    <GiftList gifts={product.gifts} />
                </div>
            ) : null}
        </>
    );
};

export default VariationSelector;
