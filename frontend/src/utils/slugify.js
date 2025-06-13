import slugify from 'slugify';

export const makeSlug = (text) =>
    slugify(text, {
        lower: true,
        strict: true, // bỏ ký tự đặc biệt
    });
