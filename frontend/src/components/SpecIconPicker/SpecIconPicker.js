import classNames from 'classnames/bind';
import styles from './SpecIconPicker.module.scss';
import { SPEC_ICONS } from '~/constants/specIcons';

const cx = classNames.bind(styles);

export default function SpecIconPicker({ value, onChange }) {
    return (
        <div className={cx('grid')}>
            {SPEC_ICONS.map(({ key, label, Icon }) => (
                <button
                    key={key}
                    type="button"
                    className={cx('item', { active: value === key })}
                    onClick={() => onChange(key)}
                    title={label}
                >
                    <div className={cx('icon')}>
                        <Icon width={22} height={22} />
                    </div>
                    <div className={cx('label')}>{label}</div>
                </button>
            ))}
        </div>
    );
}
