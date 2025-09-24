import React from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

export default function ConfirmLink({ to, when, children, ...props }) {
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

    return (
        <a href={to} onClick={handleClick} {...props}>
            {children}
        </a>
    );
}
