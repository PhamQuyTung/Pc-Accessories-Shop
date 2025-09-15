import Quill from 'quill';
const BlockEmbed = Quill.import('blots/block/embed');

class ProductBlot extends BlockEmbed {
    static blotName = 'product';
    static tagName = 'div';
    static className = 'product-block';

    static create(value) {
        let node = super.create();
        node.innerHTML = `
            <div class="product-block__inner">
                <div class="product-block__image">
                    <img src="${value.image}" alt="${value.name}" />
                </div>
                <div class="product-block__info">
                    <h3 class="product-block__title">${value.name}</h3>
                    <p class="product-block__price">${value.price} VND</p>
                    ${value.link ? `<a href="${value.link}" target="_blank" class="product-block__btn">Xem chi tiết</a>` : ''}
                </div>
            </div>
        `;
        return node;
    }

    static value(node) {
        return {
            image: node.querySelector('img')?.src,
            name: node.querySelector('.product-block__title')?.innerText,
            price: node.querySelector('.product-block__price')?.innerText,
            link: node.querySelector('.product-block__btn')?.href || '',
        };
    }
}

Quill.register(ProductBlot);
export default ProductBlot;
