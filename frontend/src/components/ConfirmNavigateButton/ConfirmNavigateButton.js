import React from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

export default function ConfirmNavigateButton({ to, when, children, className = '', ...props }) {
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
        <button onClick={handleClick} className={className} {...props}>
            {children}
        </button>
    );
}
