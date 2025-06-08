import { Navigation, Pagination, Autoplay, EffectFade } from 'swiper/modules'; // Swiper 9.x+
// Import CSS cần thiết
import 'swiper/css';
import 'swiper/css/effect-fade';
import 'swiper/css/pagination';

export const mainSliderConfig = {
    modules: [Navigation, Pagination, Autoplay, EffectFade],  // Chỉ giữ các module cần thiết
    effect: 'fade',    // Sử dụng hiệu ứng trượt
    autoplay: { delay: 5000, disableOnInteraction: false }, // Thời gian chuyển đổi (5 giây) & Không dừng autoplay khi tương tác
    spaceBetween: 15,   // Khoảng cách giữa các slide
    slidesPerView: 1,   // Hiển thị 1 slide
    pagination: { clickable: true }, // Hiển thị phân trang
    loop: true, // Lặp lại slider,
    speed: 1000,    // Tốc độ chuyển đổi (1 giây)
};