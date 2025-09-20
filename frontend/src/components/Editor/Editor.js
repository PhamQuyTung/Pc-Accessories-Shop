import React, { useRef } from 'react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import "./Editor.scss"; // override style
import CustomToolbar from './CustomToolbar';

function Editor() {
    const quillRef = useRef(null);

    const modules = {
        toolbar: {
            container: '#toolbar',
            handlers: {
                insertQuote: function () {
                    const range = this.quill.getSelection(true);

                    // 👉 Giả sử bạn lấy dữ liệu quote động từ chỗ khác
                    const quoteData = {
                        text: prompt('Nhập nội dung quote:'),
                        cite: prompt('Nhập tên tác giả:'),
                    };

                    if (!quoteData.text) return;

                    this.quill.insertEmbed(range.index, 'quote', quoteData);
                    this.quill.insertText(range.index + 1, '\n');
                    this.quill.setSelection(range.index + 2, 0);
                },

                insertProduct: function () {
                    const range = this.quill.getSelection(true);

                    // 👉 Giả sử bạn lấy dữ liệu product động từ API hoặc form
                    const productData = {
                        image: 'https://via.placeholder.com/120',
                        name: 'Tai nghe gaming XYZ',
                        price: '1.200.000',
                        link: 'https://example.com/product/xyz',
                    };

                    this.quill.insertEmbed(range.index, 'product', productData);
                    this.quill.insertText(range.index + 1, '\n');
                    this.quill.setSelection(range.index + 2, 0);
                },
            },
        },
    };

    return (
        <div>
            <CustomToolbar />
            <ReactQuill ref={quillRef} theme="snow" modules={modules} />
        </div>
    );
}

export default Editor;
