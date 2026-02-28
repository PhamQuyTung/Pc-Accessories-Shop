import React from 'react';
import { Link } from 'react-router-dom'; // ← thêm
import cx from 'classnames';
import styles from './PromotionSection.module.scss';
import { Gift } from 'lucide-react';

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
                        <span className={styles.promotionText}>
                            {typeof promo === 'string' ? promo : promo.title}

                            {/* nếu có object và có _id thì hiển thị link */}
                            {promo && promo._id && (
                                <Link to={`/promotion/${promo._id}`} className={styles.promotionLink}>
                                    xem thêm
                                </Link>
                            )}
                        </span>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default PromotionSection;
