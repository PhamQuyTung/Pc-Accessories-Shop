// src/utils/quillSetup.js
import Quill from 'quill';
import ImageResize from 'quill-image-resize-module-react';
import QuoteBlot from '~/components/QuillBlots/QuoteBlot';
import ProductBlot from '~/components/QuillBlots/ProductBlot';

export function registerQuillModules() {
    // chỉ gọi khi app start, không cần flag nữa
    if (!Quill.imports['modules/imageResize']) {
        Quill.register('modules/imageResize', ImageResize);
    }
    if (!Quill.imports['formats/quote']) {
        Quill.register(QuoteBlot);
    }
    if (!Quill.imports['formats/product']) {
        Quill.register(ProductBlot);
    }
}
