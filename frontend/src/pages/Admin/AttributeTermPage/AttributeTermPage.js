import React, { useEffect, useState } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import AttributeTermsForm from './AttributeTermForm/AttributeTermForm';
import AttributeTermsTable from './AttributeTermTable/AttributeTermTable';
import EditTermPopup from './EditTermPopup/EditTermPopup';
import axiosClient from '~/utils/axiosClient';
import { useToast } from '~/components/ToastMessager/ToastMessager';
import styles from './AttributeTermPage.module.scss';
import classNames from 'classnames/bind';

const cx = classNames.bind(styles);


export default function AttributeTermsPage() {
    const { attributeId } = useParams();
    const toast = useToast();
    const [terms, setTerms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editTerm, setEditTerm] = useState(null); // term được chỉnh sửa
    const [resetTrigger, setResetTrigger] = useState(0);
    const [attribute, setAttribute] = useState(null);

    // useEffect lấy attribute từ API (nếu đang ở trang tạo mới)
    useEffect(() => {
        axiosClient.get(`/attributes/${attributeId}`).then((res) => {
            setAttribute(res.data);
        });
    }, []);

    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);
    const name = searchParams.get('name');

    // Lấy danh sách chủng loại
    const fetchTerms = async () => {
        try {
            setLoading(true);
            const res = await axiosClient.get(`/attribute-terms/${attributeId}`);
            setTerms(res.data);
        } catch (err) {
            toast('Lỗi khi tải danh sách chủng loại', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTerms();
    }, [attributeId]);

    // Tạo mới
    const handleCreate = async (value) => {
        try {
            const payload = {
                name: value.name,
                slug: value.slug,
            };

            if (attribute?.type === 'color') {
                payload.color = value.color;
            }

            if (attribute?.type === 'image') {
                payload.image = value.image;
            }

            const res = await axiosClient.post(`/attribute-terms/${attributeId}`, payload);
            setTerms((prev) => [res.data, ...prev]);
            toast('Đã thêm chủng loại thành công', 'success');
            setResetTrigger((prev) => prev + 1);
        } catch (err) {
            toast('Lỗi khi thêm chủng loại', 'error');
        }
    };

    // Xoá
    const handleDelete = async (id) => {
        try {
            await axiosClient.delete(`/attribute-terms/${id}`);
            setTerms((prev) => prev.filter((t) => t._id !== id));
            toast('Đã xóa thành công', 'success');
        } catch {
            toast('Lỗi khi xóa', 'error');
        }
    };

    // Cập nhật
    const handleUpdate = async (updatedTerm) => {
        const { _id: id, name, slug, color, image } = updatedTerm;
        console.log('Term gửi lên để cập nhật:', updatedTerm);

        try {
            const payload = {
                name: name.trim(),
                slug: slug.trim().toLowerCase().replace(/\s+/g, '-'),
            };

            if (attribute?.type === 'color') {
                payload.color = color;
            }

            if (attribute?.type === 'image') {
                payload.image = image;
            }

            const res = await axiosClient.put(`/attribute-terms/${id}`, payload);
            setTerms((prev) => prev.map((t) => (t._id === id ? res.data : t)));
            toast('Đã cập nhật thành công', 'success');
        } catch (err) {
            toast('Lỗi khi cập nhật chủng loại', 'error');
        }
    };

    return (
        <div className={cx("container")}>
            <div className={cx("header")}>
                <h2>
                    Chủng loại của thuộc tính: <strong>{name}</strong>
                </h2>

                <Link to='/admin/attributes'>Trở lại</Link>
            </div>

            <div className={cx("wrapper-content")}>
                <AttributeTermsForm
                    onSubmit={handleCreate}
                    loading={loading}
                    resetTrigger={resetTrigger}
                    attributeType={attribute?.type}
                />
    
                <AttributeTermsTable
                    terms={terms}
                    onDelete={handleDelete}
                    onEdit={(term) => setEditTerm(term)}
                    loading={loading}
                    attribute={attribute}
                />
            </div>

            {editTerm && (
                <EditTermPopup
                    term={editTerm}
                    onClose={() => setEditTerm(null)}
                    onSave={async (updatedTerm) => {
                        await handleUpdate(updatedTerm);
                        setEditTerm(null); // 👉 Đóng modal tại đây
                    }}
                    attributeType={attribute?.type}
                />
            )}
        </div>
    );
}
