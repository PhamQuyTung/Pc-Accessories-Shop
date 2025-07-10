const mongoose = require('mongoose');
const Category = require('./src/app/models/category'); // chỉnh đường dẫn nếu sai

async function createSubcategories() {
    await mongoose.connect('mongodb://127.0.0.1:27017/PhamTung_PCAccessories_Dev'); // chỉnh tên DB nếu khác

    const parent = await Category.findOne({ slug: 'laptop' });

    if (!parent) {
        console.log('Không tìm thấy danh mục cha có slug "laptop"');
        return process.exit();
    }

    const subs = [
        { name: 'Laptop Văn Phòng', slug: 'laptop-van-phong', parent: parent._id },
        { name: 'Laptop Sinh Viên', slug: 'laptop-sinh-vien', parent: parent._id },
        { name: 'Laptop Đồ Họa', slug: 'laptop-do-hoa', parent: parent._id },
    ];

    for (const sub of subs) {
        await Category.create(sub);
    }

    console.log('Tạo danh mục con thành công!');
    process.exit();
}

createSubcategories();
