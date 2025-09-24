import React from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

/**
 * ConfirmNavigate: Tái sử dụng cho cả <a> và <button>
 *
 * Props:
 * - to: string (đường dẫn điều hướng)
 * - when: boolean (có cảnh báo hay không)
 * - as: "button" | "link" (mặc định là "button")
 * - children: nội dung hiển thị
 * - ...props: các props khác (className, style, v.v.)
 */
export default function ConfirmNavigate({ to, when, as = 'button', children, ...props }) {
    const navigate = useNavigate();

    const handleClick = async (e) => {
        e.preventDefault();

        if (when) {
            const result = await Swal.fire({
                title: 'Bạn có chắc muốn thoát?',
                text: 'Thay đổi của bạn chưa được lưu!',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Thoát',
                cancelButtonText: 'Ở lại',
            });

            if (result.isConfirmed) {
                navigate(to);
            }
        } else {
            navigate(to);
        }
    };

    if (as === 'link') {
        return (
            <a href={to} onClick={handleClick} {...props}>
                {children}
            </a>
        );
    }

    // default: button
    return (
        <button onClick={handleClick} {...props}>
            {children}
        </button>
    );
}
