import React from 'react';
import styles from './Footer.module.scss';
import classNames from 'classnames/bind';
import { FaFacebookF, FaTiktok, FaYoutube, FaUsers } from 'react-icons/fa';
import { SiZalo } from 'react-icons/si';

const cx = classNames.bind(styles);

const Footer = () => {
    return (
        <footer className={cx('footer')}>
            <div className={cx('footer-container')}>
                <div className={cx('footer-top')}>
                    <div className={cx('column')}>
                        <h4>VỀ GEARVN</h4>
                        <ul>
                            <li>Giới thiệu</li>
                            <li>Tuyển dụng</li>
                            <li>Liên hệ</li>
                        </ul>
                    </div>
                    <div className={cx('column')}>
                        <h4>CHÍNH SÁCH</h4>
                        <ul>
                            <li>Chính sách bảo hành</li>
                            <li>Chính sách giao hàng</li>
                            <li>Chính sách bảo mật</li>
                        </ul>
                    </div>
                    <div className={cx('column')}>
                        <h4>THÔNG TIN</h4>
                        <ul>
                            <li>Hệ thống cửa hàng</li>
                            <li>Hướng dẫn mua hàng</li>
                            <li>Hướng dẫn thanh toán</li>
                            <li>Hướng dẫn trả góp</li>
                            <li>Tra cứu địa chỉ bảo hành</li>
                            <li>Build PC</li>
                        </ul>
                    </div>
                    <div className={cx('column')}>
                        <h4>
                            TỔNG ĐÀI HỖ TRỢ <span>(8:00 - 21:00)</span>
                        </h4>
                        <ul>
                            <li>
                                Mua hàng: <a href="tel:19005301">1900.5301</a>
                            </li>
                            <li>
                                Bảo hành: <a href="tel:19005325">1900.5325</a>
                            </li>
                            <li>
                                Khiếu nại: <a href="tel:18006173">1800.6173</a>
                            </li>
                            <li>
                                Email: <a href="mailto:cskh@gearvn.com">cskh@gearvn.com</a>
                            </li>
                        </ul>
                    </div>
                    <div className={cx('column')}>
                        <h4>ĐƠN VỊ VẬN CHUYỂN</h4>
                        {/* <div className={cx('shipping-logos')}>
                            <img src="/shipping/ghn.png" alt="GHN" />
                            <img src="/shipping/ems.png" alt="EMS" />
                            <img src="/shipping/gvn.png" alt="GVN" />
                            <img src="/shipping/vnpost.png" alt="VNPost" />
                        </div>
                        <h4 className={cx('mt')}>CÁCH THỨC THANH TOÁN</h4>
                        <div className={cx('payment-logos')}>
                            <img src="/payment/internet-banking.png" alt="Internet Banking" />
                            <img src="/payment/jcb.png" alt="JCB" />
                            <img src="/payment/mastercard.png" alt="MasterCard" />
                            <img src="/payment/zalopay.png" alt="ZaloPay" />
                            <img src="/payment/visa.png" alt="Visa" />
                            <img src="/payment/momo.png" alt="MoMo" />
                        </div> */}
                    </div>
                </div>
    
                <div className={cx('footer-bottom')}>
                    <div className={cx('social')}>
                        <span>KẾT NỐI VỚI CHÚNG TÔI</span>
                        <div className={cx('icons')}>
                            <FaFacebookF />
                            <FaTiktok />
                            <FaYoutube />
                            <SiZalo />
                            <FaUsers />
                        </div>
                    </div>
                    <div className={cx('verified')}>
                        {/* <img src="/bocongthuong.png" alt="Bộ Công Thương" /> */}
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
