import CFNav from '~/pages/Home/ContainerFluid/CF-Nav/CF-Nav';
import CFSlider from '~/pages/Home/ContainerFluid/CF-Slider/CF-Slider';
import styles from './ContainerFluid.module.scss';
import classNames from 'classnames/bind';
import { Container, Row, Col } from 'react-bootstrap';

const cx = classNames.bind(styles);
function ContainerFluid() {
    return (
        <Container fluid className={cx('customContainerFluid')}>
            <Row>
                <Col lg={3} md={12} xs={12}>
                    <CFNav />
                </Col>
                <Col lg={9} md={12} xs={12}>
                    <CFSlider />
                </Col>
            </Row>
        </Container>
    );
}

export default ContainerFluid;
