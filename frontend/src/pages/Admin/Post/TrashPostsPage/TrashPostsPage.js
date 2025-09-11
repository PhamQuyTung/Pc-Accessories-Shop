import React, { useEffect, useState } from 'react';
import axiosClient from '~/utils/axiosClient';
import styles from './TrashPostsPage.module.scss';
import classNames from 'classnames/bind';
import { confirmAlert } from '~/utils/alertSweet'; // 👈 dùng sweetalert2 confirm
import { useToast } from '~/components/ToastMessager/ToastMessager'; // 👈 toast thông báo

const cx = classNames.bind(styles);

const TrashPostsPage = () => {
    const [posts, setPosts] = useState([]);
    const showToast = useToast();

    useEffect(() => {
        fetchTrash();
    }, []);

    const fetchTrash = async () => {
        try {
            const res = await axiosClient.get('/posts/trash');
            setPosts(res.data);
        } catch (err) {
            console.error('❌ Lỗi tải thùng rác:', err);
        }
    };

    const handleRestore = async (id) => {
        try {
            await axiosClient.put(`/posts/${id}`, { status: 'draft' });
            setPosts(posts.filter((p) => p._id !== id));
            showToast('Khôi phục thành công!', 'success');
        } catch (err) {
            console.error('❌ Lỗi khôi phục:', err);
            showToast('Khôi phục thất bại!', 'error');
        }
    };

    const handleDeleteForever = async (id) => {
        const result = await confirmAlert(
            'Bạn chắc chắn?',
            'Bài viết sẽ bị xóa vĩnh viễn và không thể khôi phục!',
            'warning',
        );
        if (!result.isConfirmed) return;

        try {
            await axiosClient.delete(`/posts/${id}`);
            setPosts(posts.filter((p) => p._id !== id));
            showToast('Đã xóa vĩnh viễn!', 'success');
        } catch (err) {
            console.error('❌ Lỗi xóa vĩnh viễn:', err);
            showToast('Xóa thất bại!', 'error');
        }
    };

    return (
        <div className={cx('trash-page')}>
            <h1 className={cx('title')}>Quản lý thùng rác</h1>

            {posts.length === 0 ? (
                <p className={cx('empty')}>Thùng rác trống.</p>
            ) : (
                <table className={cx('table')}>
                    <thead>
                        <tr>
                            <th>Tiêu đề</th>
                            <th>Tác giả</th>
                            <th>Chuyên mục</th>
                            <th>Ngày xóa</th>
                            <th>Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {posts.map((post) => (
                            <tr key={post._id}>
                                <td>{post.title}</td>
                                <td>{post.author?.name}</td>
                                <td>{post.category?.name}</td>
                                <td>{new Date(post.updatedAt).toLocaleDateString('vi-VN')}</td>
                                <td>
                                    <button onClick={() => handleRestore(post._id)} className={cx('btn-restore')}>
                                        Khôi phục
                                    </button>
                                    <button onClick={() => handleDeleteForever(post._id)} className={cx('btn-delete')}>
                                        Xóa vĩnh viễn
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default TrashPostsPage;
