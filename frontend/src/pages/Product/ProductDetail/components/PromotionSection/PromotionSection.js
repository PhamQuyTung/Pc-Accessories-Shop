import React from 'react';
import cx from 'classnames';
import styles from './PromotionSection.module.scss';
import { Gift } from 'lucide-react'; // nếu bạn đang dùng icon khác thì sửa lại

const PromotionSection = ({ promotions }) => {
    if (!promotions || promotions.length === 0) return null;

    return (
        <div className={cx(styles.promotionBox)}>
            <div className={cx(styles.promotionHeader)}>
                <Gift size={18} className={styles.promotionIcon} />
                <span>Khuyến mãi</span>
            </div>

            <ul className={cx(styles.promotionList)}>
                {promotions.map((promo, index) => (
                    <li key={index} className={styles.promotionItem}>
                        {promo}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default PromotionSection;
