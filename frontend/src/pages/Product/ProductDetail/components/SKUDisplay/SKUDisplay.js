import React from 'react';
import cx from 'classnames';
import styles from './SKUDisplay.module.scss';

const SKUDisplay = ({ activeVariation }) => {
    if (!activeVariation || !activeVariation.sku) return null;

    return (
        <p className={cx(styles.skuTag)}>
            Mã biến thể: <strong>{activeVariation.sku}</strong>
        </p>
    );
};

export default SKUDisplay;
