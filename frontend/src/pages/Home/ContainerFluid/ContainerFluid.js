import CFNav from '~/pages/Home/ContainerFluid/CF-Nav/CF-Nav';
import CFSlider from '~/pages/Home/ContainerFluid/CF-Slider/CF-Slider';
import styles from './ContainerFluid.module.scss';
import classNames from 'classnames/bind';

const cx = classNames.bind(styles);

function ContainerFluid() {
    return (
        <div className={cx('container-fluid')}>
            <div className={cx('div1')}>
                <CFNav></CFNav>
            </div>
            <div className={cx('div3')}>
                {/* Slider */}
                <CFSlider></CFSlider>

                {/* MegaMenu */}
                {/* <div className={cx('megaMenu-pos')}>
                    <div className={cx('megaMenu')}>
                        <div className={cx('megaMenu__div1')}>
                            <strong>Thương hiệu</strong>
                            <ul>
                                <li>item 1</li>
                                <li>item 1</li>
                                <li>item 1</li>
                                <li>item 1</li>
                                <li>item 1</li>
                            </ul>
                        </div>
                        <div className={cx('megaMenu__div2')}>
                            <strong>Giá bán</strong>
                            <ul>
                                <li>item 1</li>
                                <li>item 1</li>
                                <li>item 1</li>
                                <li>item 1</li>
                                <li>item 1</li>
                            </ul>
                        </div>
                        <div className={cx('megaMenu__div3')}>
                            <strong>Nhu cầu sử dụng</strong>
                            <ul>
                                <li>item 1</li>
                                <li>item 1</li>
                                <li>item 1</li>
                                <li>item 1</li>
                                <li>item 1</li>
                            </ul>
                        </div>
                        <div className={cx('megaMenu__div4')}>
                            <strong>Phụ kiện laptop</strong>
                            <ul>
                                <li>item 1</li>
                                <li>item 1</li>
                                <li>item 1</li>
                                <li>item 1</li>
                                <li>item 1</li>
                            </ul>
                        </div>
                        <div className={cx('megaMenu__div5')}>
                            <strong>CPU Intel-AMD</strong>
                            <ul>
                                <li>item 1</li>
                                <li>item 1</li>
                                <li>item 1</li>
                                <li>item 1</li>
                                <li>item 1</li>
                            </ul>
                        </div>
                    </div>
                </div> */}
            </div>
        </div>
    );
}

export default ContainerFluid;
