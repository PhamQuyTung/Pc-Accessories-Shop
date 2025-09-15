import Quill from 'quill';
const BlockEmbed = Quill.import('blots/block/embed');

class ProductBlot extends BlockEmbed {
    static blotName = 'product';
    static tagName = 'div';
    static className = 'product-card';

    static create(value) {
        let node = super.create();
        node.innerHTML = `
      <img src="${value.image}" alt="${value.name}" />
      <h4>${value.name}</h4>
      <p>${value.price} VND</p>
    `;
        return node;
    }

    static value(node) {
        return {
            image: node.querySelector('img')?.src,
            name: node.querySelector('h4')?.innerText,
            price: node.querySelector('p')?.innerText,
        };
    }
}

Quill.register(ProductBlot);
export default ProductBlot;
