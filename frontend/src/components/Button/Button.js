import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import styles from './Button.module.scss';
import { Link } from 'react-router-dom';
import { forwardRef } from 'react';

const cx = classNames.bind(styles);

const Button = forwardRef(
    (
        {
            to,
            href,
            primary = false,
            primary2 = false,
            primary3 = false,
            outline = false,
            disabled = false,
            Small = false,
            Medium = false,
            Large = false,
            ExtraLarge = false,
            text = false,
            rounded = false,
            leftIcon,
            rightIcon,
            children,
            className,
            onClick,
            ...passProps
        },
        ref, // Nhận prop ref từ forwardRef
    ) => {
        let Comp = 'button';

        const classes = cx('wrapper', {
            [className]: className,
            primary,
            primary2,
            primary3,
            outline,
            disabled,
            Small,
            Medium,
            Large,
            ExtraLarge,
            text,
            rounded,
        });

        const props = {
            onClick,
            ref, // Truyền ref vào component
            ...passProps,
        };

        if (to) {
            props.to = to;
            Comp = Link;
        } else if (href) {
            props.href = href;
            Comp = 'a';
        }

        if (disabled) {
            Object.keys(props).forEach((key) => {
                if (key.startsWith('on') && typeof props[key] === 'function') {
                    props[key] = undefined;
                }
            });
        }

        return (
            <Comp className={classes} {...props}>
                {leftIcon && <span className={cx('icon')}>{leftIcon}</span>}
                <span className={cx('title')}>{children}</span>
                {rightIcon && <span className={cx('icon')}>{rightIcon}</span>}
            </Comp>
        );
    },
);

Button.propTypes = {
    to: PropTypes.string,
    href: PropTypes.string,
    primary: PropTypes.bool,
    primary2: PropTypes.bool,
    primary3: PropTypes.bool,
    outline: PropTypes.bool,
    disabled: PropTypes.bool,
    Small: PropTypes.bool,
    Medium: PropTypes.bool,
    Large: PropTypes.bool,
    ExtraLarge: PropTypes.bool,
    text: PropTypes.bool,
    rounded: PropTypes.bool,
    leftIcon: PropTypes.node,
    rightIcon: PropTypes.node,
    children: PropTypes.node.isRequired,
    className: PropTypes.string,
    onClick: PropTypes.func,
};

export default Button;
