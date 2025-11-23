import React from 'react';
import cx from 'classnames';
import styles from './ProductTabs.module.scss';

const ProductTabs = ({ activeTab, onChangeTab, renderTabContent }) => {
    return (
        <div className={styles.tabsWrapper}>
            {/* Tabs Header */}
            <div className={styles.tabsHeader}>
                <button
                    className={cx(styles.tabBtn, {
                        [styles.active]: activeTab === 'description',
                    })}
                    onClick={() => onChangeTab('description')}
                >
                    Mô tả
                </button>

                <button
                    className={cx(styles.tabBtn, {
                        [styles.active]: activeTab === 'specs',
                    })}
                    onClick={() => onChangeTab('specs')}
                >
                    Thông số kỹ thuật
                </button>

                <button
                    className={cx(styles.tabBtn, {
                        [styles.active]: activeTab === 'reviews',
                    })}
                    onClick={() => onChangeTab('reviews')}
                >
                    Đánh giá
                </button>
            </div>

            {/* Tabs Content */}
            <div className={styles.tabContent}>
                {renderTabContent(activeTab)}
            </div>
        </div>
    );
};

export default ProductTabs;
