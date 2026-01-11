import { SPEC_ICONS } from '~/constants/specIcons';
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
                    const iconKey = spec.icon || 'default';
                    const Icon = SPEC_ICONS.find((i) => i.key === iconKey)?.Icon;

                    return (
                        <li key={index} className={cx('item')}>
                            <div className={cx('icon')}>{Icon && <Icon width={20} height={20} />}</div>

                            <div className={cx('info')}>
                                <strong>{spec.label}</strong>
                                <span>
                                    {spec.key} · {spec.type}
                                </span>
                            </div>

                            <div className={cx('actions')}>
                                <button onClick={() => onEdit(index)}>✏</button>
                                <button onClick={() => onDelete(index)}>
                                    🗑
                                </button>
                            </div>
                        </li>
                    );
                })}
            </ul>
        </>
    );
}
