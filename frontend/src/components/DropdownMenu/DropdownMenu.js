import React, { forwardRef } from 'react';
import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css'; // Import CSS của Tippy.js
import styles from './DropdownMenu.module.scss'; // Import file CSS Modules
import classNames from 'classnames/bind';

const cx = classNames.bind(styles);

const DropdownMenu = forwardRef(({ title, items }, ref) => {
    return (
        <div>
            <Tippy
                content={
                    <div className={cx('dropdown-menu')}>
                        {items.map((item, index) => (
                            <a key={index} href={item.href} className={cx('dropdown-menu__item')}>
                                {item.label}
                            </a>
                        ))}
                    </div>
                }
                interactive={true}
                placement="bottom-start"
            >
                <span ref={ref} className={cx('dropdown-menu__title')}>{title}</span>
            </Tippy>
        </div>
    );
});

export default DropdownMenu;