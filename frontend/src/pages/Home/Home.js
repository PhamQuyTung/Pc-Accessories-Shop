import ContainerFluid from './ContainerFluid/ContainerFluid';
import LTG from './LTG/LTG';
import PC from './PC/PC';
import Chuot from './Chuot/Chuot';
import BanPhim from './BanPhim/BanPhim';
import LT from './LT/LT';
import Screen from './Screen/Screen';

function Home() {
    return (
        <div>
            <ContainerFluid />
            <PC />
            <LT />
            <LTG />
            <Chuot />
            <BanPhim />
            <Screen />
        </div>
    );
}

export default Home;
