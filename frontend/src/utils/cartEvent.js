// src/utils/cartEvent.js
import { EventEmitter } from 'events';

const cartEvent = new EventEmitter();

// (Tuỳ chọn) Giới hạn số lượng listener để tránh warning khi app lớn
cartEvent.setMaxListeners(20);

export default cartEvent;
