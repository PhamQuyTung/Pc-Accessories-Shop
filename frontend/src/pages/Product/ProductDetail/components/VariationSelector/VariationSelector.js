import React from 'react';
import classNames from 'classnames/bind';
import styles from './VariationSelector.module.scss';
import GiftList from '~/components/GiftList/GiftList';

const cx = classNames.bind(styles);

const VariationSelector = ({
    product,
    selectedAttributes,
    activeVariation,
    onSelectVariation,
    onSelectAttribute,
    getSortedVariations,
    getVariationLabel,
    isVariationMatching,
    getSortedAttributes,
    COLOR_MAP,
}) => {
    const hasVariations = product.variations && product.variations.length > 0;
    const hasAttributes = product.attributes && product.attributes.length > 0;

    return (
        <>
            {hasVariations ? (
                <div className={cx('product-variations-grouped')}>
                    <p className={cx('variations-label')}>Chọn biến thể:</p>

                    <div className={cx('variations-grid')}>
                        {getSortedVariations(product.variations).map((variation) => {
                            const isActive = isVariationMatching(variation, selectedAttributes);
                            const label = getVariationLabel(variation);

                            return (
                                <button
                                    key={variation._id}
                                    onClick={() => onSelectVariation(variation)}
                                    className={cx('variation-btn', {
                                        active: isActive,
                                    })}
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

                    {/* Quà tặng khuyến mãi */}
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

                                        // Render dạng màu sắc
                                        if (isColorAttr) {
                                            return (
                                                <div
                                                    key={termId}
                                                    className={cx('attr-option', 'color-option', { active: isActive })}
                                                    onClick={() => onSelectAttribute(attrId, termId)}
                                                >
                                                    <button
                                                        className={cx('attr-option__color', {
                                                            active: isActive,
                                                        })}
                                                        style={{
                                                            backgroundColor: colorCode || '#ccc',
                                                        }}
                                                    ></button>

                                                    <span className={cx('color-name')}>{term.name}</span>
                                                </div>
                                            );
                                        }

                                        // Render dạng text
                                        return (
                                            <button
                                                key={termId}
                                                onClick={() => onSelectAttribute(attrId, termId)}
                                                className={cx('attr-option', {
                                                    active: isActive,
                                                })}
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
