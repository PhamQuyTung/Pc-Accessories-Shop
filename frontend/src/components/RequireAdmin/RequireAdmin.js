// src/components/RequireAdmin.jsx
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);

const RequireAdmin = ({ children }) => {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user'));

    useEffect(() => {
        if (!user || user.role !== 'admin') {
            MySwal.fire({
                icon: 'warning',
                title: 'Truy cập bị từ chối',
                text: 'Chỉ có admin mới được phép sử dụng chức năng này.',
                confirmButtonText: 'Quay lại trang chủ',
            }).then(() => {
                navigate('/');
            });
        }
    }, [navigate, user]);

    if (!user || user.role !== 'admin') return null;

    return children;
};

export default RequireAdmin;
