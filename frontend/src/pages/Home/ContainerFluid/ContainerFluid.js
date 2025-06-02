import CFNav from "~/pages/Home/ContainerFluid/CF-Nav/CF-Nav";
import CFSlider from "~/pages/Home/ContainerFluid/CF-Slider/CF-Slider";
import styles from './ContainerFluid.module.scss';
import classNames from 'classnames/bind';

const cx = classNames.bind(styles);

function ContainerFluid() {
    return (
        <div className={cx('container-fluid')}>
            <CFNav></CFNav>    
            <CFSlider></CFSlider>    
        </div> 
    );
}

export default ContainerFluid;
