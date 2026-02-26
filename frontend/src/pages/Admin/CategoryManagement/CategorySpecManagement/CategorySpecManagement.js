import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import styles from './CategorySpecManagement.module.scss';
import classNames from 'classnames/bind';
import Swal from 'sweetalert2';
import { useToast } from '~/components/ToastMessager';
import CategorySpecForm from '~/pages/Admin/CategoryManagement/CategorySpecManagement/CategorySpecForm/CategorySpecForm';
import SpecList from './SpecList/SpecList';

const cx = classNames.bind(styles);

function CategorySpecManagement() {
    const { categoryId } = useParams();
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [specs, setSpecs] = useState([]);
    const [loading, setLoading] = useState(false);

    const [draftSpecs, setDraftSpecs] = useState([]);
    const [savedSpecs, setSavedSpecs] = useState([]);

    const [editingIndex, setEditingIndex] = useState(null);

    const toast = useToast();

    const navigate = useNavigate();

    const normalizeSpecs = (specs) =>
        specs.map((s) => ({
            label: s.label,
            key: s.key,
            type: s.type,
            icon: s.icon || 'default',
            showOnCard: !!s.showOnCard,
            // keep existing true unless explicitly false
            showOnTable: s.showOnTable !== false,
        }));

    useEffect(() => {
        if (!categoryId) return;

        axios.get(`http://localhost:5000/api/categories/${categoryId}`).then((res) => {
            setSelectedCategory(res.data);
            setSavedSpecs(res.data.specs || []);
            setDraftSpecs([]); // form trống
        });
    }, [categoryId]);

    const handleSaveSpecs = async () => {
        if (!categoryId || !draftSpecs.length) return;

        setLoading(true);
        try {
            let updatedSpecs;

            if (editingIndex !== null) {
                // ✅ EDIT
                updatedSpecs = savedSpecs.map((spec, i) => (i === editingIndex ? draftSpecs[0] : spec));
            } else {
                // ✅ ADD
                updatedSpecs = [...savedSpecs, ...draftSpecs];
            }

            const finalSpecs = normalizeSpecs(updatedSpecs);

            const res = await axios.put(`http://localhost:5000/api/categories/${categoryId}`, {
                specs: finalSpecs,
            });

            setSavedSpecs(res.data.specs);
            setDraftSpecs([]);
            setEditingIndex(null);

            toast('Lưu thông số kỹ thuật thành công', 'success');
        } catch (err) {
            console.error(err);
            toast('Lưu thông số thất bại', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleEditSpec = (index) => {
        const spec = savedSpecs[index];

        setEditingIndex(index);
        setDraftSpecs([
            {
                ...spec,
                icon: spec.icon || 'default', // ✅ fallback
            },
        ]);
    };

    const handleDeleteSpec = async (index) => {
        const spec = savedSpecs[index];

        const result = await Swal.fire({
            title: 'Xóa thông số?',
            html: `
            <div style="text-align:left">
                <b>${spec.label}</b><br/>
                <small>${spec.key} · ${spec.type}</small>
            </div>
        `,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Xóa',
            cancelButtonText: 'Hủy',
            reverseButtons: true,
            focusCancel: true,
        });

        if (!result.isConfirmed) return;

        try {
            setLoading(true);

            const updatedSpecs = savedSpecs.filter((_, i) => i !== index);

            await axios.put(`http://localhost:5000/api/categories/${categoryId}`, {
                specs: updatedSpecs,
            });

            setSavedSpecs(updatedSpecs);

            Swal.fire({
                title: 'Đã xóa!',
                text: 'Thông số kỹ thuật đã được xóa.',
                icon: 'success',
                timer: 1500,
                showConfirmButton: false,
            });
        } catch (err) {
            console.error(err);

            Swal.fire({
                title: 'Lỗi',
                text: 'Xóa thông số thất bại',
                icon: 'error',
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={cx('wrapper')}>
            <div className={cx('section')}>
                <h2>Quản lý thông số kỹ thuật</h2>

                {selectedCategory && (
                    <>
                        <div className={cx('categoryInfo')}>
                            <button className={cx('backBtn')} onClick={() => navigate('/admin/categories')}>
                                ← Quay lại danh sách danh mục
                            </button>

                            <div className={cx('categoryHeader')}>
                                <div className={cx('titleRow')}>
                                    <h2>{selectedCategory.name}</h2>

                                    <span className={cx('specBadge', savedSpecs.length === 0 ? 'empty' : 'filled')}>
                                        {savedSpecs.length === 0 ? 'Chưa có thông số' : `${savedSpecs.length} thông số`}
                                    </span>
                                </div>

                                {selectedCategory.description && (
                                    <p className={cx('desc')}>{selectedCategory.description}</p>
                                )}
                            </div>
                        </div>

                        <div className={cx('stack')}>
                            {/* FORM */}
                            <div className={cx('block')}>
                                <CategorySpecForm value={draftSpecs} onChange={setDraftSpecs} />

                                <button className={cx('save')} disabled={!draftSpecs.length} onClick={handleSaveSpecs}>
                                    💾 Lưu spec
                                </button>
                            </div>

                            {/* LIST */}
                            <div className={cx('block')}>
                                <SpecList specs={savedSpecs} onEdit={handleEditSpec} onDelete={handleDeleteSpec} />
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

export default CategorySpecManagement;
