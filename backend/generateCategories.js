// generateCategories.js
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const Category = require('./src/app/models/category'); // đường dẫn tới model category của bạn

const MONGO_URI = 'mongodb://localhost:27017/PhamTung_PCAccessories_Dev';

mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

mongoose.connection.once('open', async () => {
    try {
        const categories = await Category.find().lean();

        const data = categories.map((cat) => ({
            key: cat.slug.replace(/-/g, ''),
            name: cat.name,
            slug: cat.slug,
        }));

        const fileContent = `export const CATEGORY_LIST = ${JSON.stringify(data, null, 2)};\n`;

        const outputPath = 'D:/Workspace2/MyProjects/pc_accessories/frontend/src/constants/categories.js';
        fs.writeFileSync(outputPath, fileContent);

        console.log('✅ categories.js đã được tạo tại:', outputPath);
        process.exit();
    } catch (err) {
        console.error('❌ Lỗi:', err);
        process.exit(1);
    }
});
