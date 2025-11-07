import Quill from 'quill';
import QuillResizeModule from 'quill-resize-module';
import QuoteBlot from '~/components/QuillBlots/QuoteBlot';
import ProductBlot from '~/components/QuillBlots/ProductBlot';

// Đăng ký custom modules/blots
export function registerQuillModules() {
    if (!Quill.imports['modules/resize']) {
        Quill.register('modules/resize', QuillResizeModule);
    }
    if (!Quill.imports['formats/quote']) {
        Quill.register(QuoteBlot);
    }
    if (!Quill.imports['formats/product']) {
        Quill.register(ProductBlot);
    }
}

export const quillModules = {
    toolbar: {
        container: '#toolbar', // 👈 tham chiếu tới CustomToolbar
        handlers: {
            insertQuote: function () {
                const text = prompt('Nhập nội dung quote');
                const cite = prompt('Nhập tác giả');
                const range = this.quill.getSelection();

                if (range) {
                    this.quill.insertEmbed(range.index, 'quote', { text, cite }, Quill.sources.USER);
                }
            },
            insertProduct: function () {
                const name = prompt('Tên sản phẩm');
                const image = prompt('URL ảnh');
                const price = prompt('Giá sản phẩm');
                const link = prompt('Link sản phẩm (tùy chọn)');
                const range = this.quill.getSelection();

                if (range) {
                    this.quill.insertEmbed(range.index, 'product', { name, image, price, link }, Quill.sources.USER);
                }
            },
        },
    },
    resize: {
        locale: {
            altTip: 'Giữ ALT để giữ tỉ lệ',
        },
    },
};

// Formats khớp với Quill v2
export const quillFormats = [
    'header',
    'bold',
    'italic',
    'underline',
    'strike',
    'list', // chỉ cần 'list' (không có 'bullet' hay 'ordered')
    'blockquote',
    'code-block',
    'link',
    'image',
    'align',
    'color',
    'video',
    'background',
    // 'clean',
    'quote', // custom blot
    'product', // custom blot
];
