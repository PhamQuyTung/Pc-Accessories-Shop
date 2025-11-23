import React from 'react';
import cx from 'classnames';
import styles from './ProductShortDescription.module.scss';

const ProductShortDescription = ({ shortDescription }) => {
    if (!shortDescription) return null;

    return (
        <div
            className={cx(styles.shortDesc)}
            dangerouslySetInnerHTML={{ __html: shortDescription }}
        ></div>
    );
};

export default ProductShortDescription;
