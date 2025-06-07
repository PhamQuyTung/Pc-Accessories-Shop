// utils/flattenMenu.js

export function flattenChildren(children = []) {
    return children.flatMap(child => child.children || []);
}
