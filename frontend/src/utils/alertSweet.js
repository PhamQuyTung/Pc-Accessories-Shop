// src/utils/alertSweet.js
import Swal from 'sweetalert2';

export const confirmAlert = (title = 'Bạn chắc chắn chứ?', text = 'Hành động này không thể hoàn tác!') => {
    return Swal.fire({
        title,
        text,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Xác nhận',
        cancelButtonText: 'Hủy',
    });
};

export const successAlert = (message = 'Thành công!') => {
    return Swal.fire({
        icon: 'success',
        title: message,
        timer: 2000,
        showConfirmButton: false,
        toast: true,
        position: 'top-end',
    });
};

export const errorAlert = (message = 'Có lỗi xảy ra!') => {
    return Swal.fire({
        icon: 'error',
        title: message,
        timer: 2500,
        showConfirmButton: false,
        toast: true,
        position: 'top-end',
    });
};
