import Quill from 'quill';
import QuillResizeModule from 'quill-resize-module';
import QuoteBlot from '~/components/QuillBlots/QuoteBlot';
import ProductBlot from '~/components/QuillBlots/ProductBlot';

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
