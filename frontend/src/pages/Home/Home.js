import ContainerFluid from './ContainerFluid/ContainerFluid';
import LTG from './LTG/LTG';
import PC from './PC/PC';
import Chuot from './Chuot/Chuot';
import BanPhim from './BanPhim/BanPhim';

function Home() {
    return (
        <div>
            <ContainerFluid />
            <PC />
            <LTG />
            <Chuot />
            <BanPhim />
        </div>
    );
}

export default Home;
