import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from './CreateProduct.module.scss';
import classNames from 'classnames/bind';
import { useToast } from '~/components/ToastMessager';
import { useNavigate } from 'react-router-dom';

const cx = classNames.bind(styles);

function CreateProduct() {
    // Sử dụng useState để quản lý dữ liệu của form
    // Mỗi trường trong form sẽ là một thuộc tính trong đối tượng formData
    const [formData, setFormData] = useState({
        name: '',
        images: [''],
        price: '',
        discountPrice: '',
        status: '',
        category: '',
        specs: {
            cpu: '',
            vga: '',
            mainboard: '',
            ram: '',
            ssd: '',
        },
        description: '',
        rating: '',
        quantity: '', // Thêm trường số lượng
        importing: false, // Thêm trường importing
    });

    // Danh sách categories sẽ được lấy từ backend
    // và hiển thị trong dropdown hoặc input
    const [categories, setCategories] = useState([]);

    // Sử dụng useNavigate để điều hướng sau khi tạo sản phẩm
    const navigate = useNavigate();

    // Sử dụng useToast để hiển thị thông báo
    const toast = useToast();

    // Lấy danh sách categories từ backend khi component mount
    // Chỉ cần gọi API một lần khi component được mount
    useEffect(() => {
        // Lấy danh sách category từ backend
        axios
            .get('http://localhost:5000/api/categories')
            .then((res) => setCategories(res.data))
            .catch(() => setCategories([]));
    }, []);

    // Hàm xử lý thay đổi dữ liệu trong form
    // Cần xử lý các trường hợp đặc biệt như specs.* và images[i]
    const handleChange = (e) => {
        const { name, value } = e.target;

        // specs.* handling
        if (name.startsWith('specs.')) {
            const key = name.split('.')[1];
            setFormData((prev) => ({
                ...prev,
                specs: {
                    ...prev.specs,
                    [key]: value,
                },
            }));
        }
        // images[i] handling
        else if (name.startsWith('image-')) {
            const index = parseInt(name.split('-')[1], 10);
            const newImages = [...formData.images];
            newImages[index] = value;
            setFormData((prev) => ({
                ...prev,
                images: newImages,
            }));
        }
        // default fields
        else {
            setFormData((prev) => ({
                ...prev,
                [name]: value,
            }));
        }
    };

    // Hàm thêm trường nhập ảnh mới
    // Mỗi lần gọi sẽ thêm một trường nhập ảnh mới vào mảng images
    const handleAddImageField = () => {
        setFormData((prev) => ({
            ...prev,
            images: [...prev.images, ''],
        }));
    };

    // Hàm xử lý gửi form để tạo sản phẩm mới
    // Chuyển đổi dữ liệu từ form thành định dạng phù hợp với backend
    const handleSubmit = async (e) => {
        e.preventDefault();

        // Nếu đang nhập hàng mà số lượng khác 0 thì cảnh báo và không submit
        if (formData.importing && Number(formData.quantity) !== 0) {
            toast('Khi đã nhấn xác nhận đang nhập hàng vui lòng nhập hàng tồn về 0', 'error');
            return;
        }

        // Sinh status như cũ
        let statusArr = [];
        const qty = Number(formData.quantity);

        if (formData.importing) {
            statusArr.push('đang nhập hàng');
        } else if (qty === 0) {
            statusArr.push('hết hàng');
        } else if (qty > 0 && qty < 15) {
            statusArr.push('sắp hết hàng');
        } else if (qty >= 15 && qty < 50) {
            statusArr.push('còn hàng');
        } else if (qty >= 50 && qty < 100) {
            statusArr.push('nhiều hàng');
        } else if (qty >= 100) {
            statusArr.push('sản phẩm mới');
        }

        try {
            const payload = {
                ...formData,
                quantity: formData.importing ? 0 : Number(formData.quantity),
                status: statusArr,
                price: Number(formData.price),
                discountPrice: Number(formData.discountPrice),
            };

            const res = await axios.post('http://localhost:5000/api/products', payload);
            toast('Thêm sản phẩm thành công!', 'success');
            navigate('/admin/products');
        } catch (err) {
            console.error('Lỗi khi tạo sản phẩm:', err);
            toast('Lỗi khi tạo sản phẩm!', 'error');
        }
    };

    // Hàm xóa trường nhập ảnh
    // Nhận vào index của trường ảnh cần xóa và cập nhật lại mảng images
    const handleRemoveImageField = (index) => {
        setFormData((prev) => ({
            ...prev,
            images: prev.images.filter((_, i) => i !== index),
        }));
    };

    // Render form để tạo sản phẩm mới
    // Hiển thị các trường nhập liệu cho tên, ảnh, giá, mô tả
    return (
        <div className={cx('wrapper')}>
            <h2>Tạo sản phẩm mới</h2>
            <form onSubmit={handleSubmit} className={cx('form')}>
                <input
                    type="text"
                    name="name"
                    placeholder="Tên sản phẩm"
                    value={formData.name}
                    onChange={handleChange}
                    required
                />

                {/* Multiple Image Inputs */}
                {formData.images.map((img, index) => (
                    <div key={index} className={cx('image-input')}>
                        <input
                            type="text"
                            name={`image-${index}`}
                            placeholder={`URL hình ảnh ${index + 1}`}
                            value={img}
                            onChange={handleChange}
                            required
                        />
                        <button
                            type="button"
                            onClick={() => handleRemoveImageField(index)}
                            className={cx('remove-btn')}
                        >
                            X
                        </button>
                    </div>
                ))}

                <button type="button" onClick={handleAddImageField}>
                    + Thêm ảnh
                </button>

                <input
                    type="number"
                    name="price"
                    placeholder="Giá gốc"
                    value={formData.price}
                    onChange={handleChange}
                    required
                />
                <input
                    type="number"
                    name="discountPrice"
                    placeholder="Giá khuyến mãi"
                    value={formData.discountPrice}
                    onChange={handleChange}
                />
                <input
                    type="text"
                    name="specs.cpu"
                    placeholder="CPU"
                    value={formData.specs.cpu}
                    onChange={handleChange}
                />
                <input
                    type="text"
                    name="specs.vga"
                    placeholder="VGA"
                    value={formData.specs.vga}
                    onChange={handleChange}
                />
                <input
                    type="text"
                    name="specs.mainboard"
                    placeholder="Mainboard"
                    value={formData.specs.mainboard}
                    onChange={handleChange}
                />
                <input
                    type="text"
                    name="specs.ram"
                    placeholder="RAM"
                    value={formData.specs.ram}
                    onChange={handleChange}
                />
                <input
                    type="text"
                    name="specs.ssd"
                    placeholder="SSD"
                    value={formData.specs.ssd}
                    onChange={handleChange}
                />
                <textarea
                    name="description"
                    placeholder="Mô tả sản phẩm"
                    value={formData.description}
                    onChange={handleChange}
                    rows={5}
                />
                <select name="category" value={formData.category} onChange={handleChange} required>
                    <option value="">-- Chọn danh mục --</option>
                    {categories.map((cat) => (
                        <option key={cat._id} value={cat._id}>
                            {cat.name}
                        </option>
                    ))}
                </select>
                <input
                    type="number"
                    name="quantity"
                    placeholder="Số lượng sản phẩm"
                    value={formData.quantity}
                    onChange={handleChange}
                    min={0}
                    required
                />
                <label
                    style={{
                        gap: '5px',
                        display: 'flex',
                        flexDirection: 'row',
                        alignItems: 'baseline',
                        fontSize: '14px',
                    }}
                >
                    <input
                        type="checkbox"
                        name="importing"
                        checked={formData.importing}
                        onChange={(e) => {
                            const checked = e.target.checked;
                            setFormData((prev) => ({
                                ...prev,
                                importing: checked,
                                quantity: checked ? 0 : prev.quantity, // Nếu đang nhập hàng thì quantity = 0
                            }));
                        }}
                    />
                    Đang nhập hàng (Nếu chọn thì số lượng phải được đặt về 0)
                </label>
                <button type="submit">Tạo sản phẩm</button>
            </form>
        </div>
    );
}

export default CreateProduct;
