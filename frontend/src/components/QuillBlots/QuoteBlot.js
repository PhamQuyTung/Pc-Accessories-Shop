import Quill from 'quill';

const BlockEmbed = Quill.import('blots/block/embed');

class QuoteBlot extends BlockEmbed {
    static blotName = 'quote'; // 👈 Tên riêng, không đụng "blockquote"
    static tagName = 'blockquote';
    static className = 'custom-quote';

    static create(value) {
        let node = super.create();
        node.innerHTML = `
            <p class="quote-text">“${value?.text || ''}”</p>
            <p class="quote-author">— ${value?.cite || ''}</p>
        `;
        return node;
    }

    static value(node) {
        return {
            text: node.querySelector('.quote-text')?.innerText.replace(/[“”]/g, '') || '',
            cite: node.querySelector('.quote-author')?.innerText.replace(/^—\s*/, '') || '',
        };
    }
}

export default QuoteBlot;
