import axios from 'axios';
export const fetchMenus = () => axios.get('http://localhost:5000/api/menus').then((res) => res.data);
