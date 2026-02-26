import { SPEC_ICON_MAP } from '~/constants/specIcons';
import styles from './SpecList.module.scss';
import classNames from 'classnames/bind';

const cx = classNames.bind(styles);

export default function SpecList({ specs, onEdit, onDelete }) {
    return (
        <>
            <h3 className={cx('title')}>Spec đã lưu</h3>

            {specs.length === 0 && <div className={cx('empty')}>Chưa có spec nào</div>}

            <ul className={cx('list')}>
                {specs.map((spec, index) => {
                    const iconKey = spec.icon;
                    const Icon = SPEC_ICON_MAP[iconKey] ?? null; // ✅ FIX Ở ĐÂY
                    if (!Icon) console.warn('Missing icon:', iconKey);

                    return (
                        <li key={spec._id || index} className={cx('item', { showOnCard: spec.showOnCard })}>
                            <div className={cx('icon')}>{Icon && <Icon width={20} height={20} />}</div>

                            <div className={cx('info')}>
                                <div className={cx('labelRow')}>
                                    <strong>{spec.label}</strong>

                                    {spec.showOnCard && (
                                        <span className={cx('badge')} title="Spec này hiển thị trên Product Card">
                                            CARD
                                        </span>
                                    )}

                                    {spec.showOnTable && (
                                        <span className={cx('badge')} title="Spec này hiển thị trong bảng thông số">
                                            TABLE
                                        </span>
                                    )}
                                </div>

                                <span className={cx('meta')}>
                                    {spec.key} · {spec.type}
                                </span>
                            </div>

                            <div className={cx('actions')}>
                                <button onClick={() => onEdit(index)}>✏</button>
                                <button onClick={() => onDelete(index)}>🗑</button>
                            </div>
                        </li>
                    );
                })}
            </ul>
        </>
    );
}
