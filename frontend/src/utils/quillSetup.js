import Quill from 'quill';
import { ImageResize } from 'quill-image-resize-module-ts'; // ✅ bản chuẩn
import QuoteBlot from '~/components/QuillBlots/QuoteBlot';
import ProductBlot from '~/components/QuillBlots/ProductBlot';

export function registerQuillModules() {
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
