import ContainerFluid from './ContainerFluid/ContainerFluid';
import LTG from './LTG/LTG';
import PC from './PC/PC';
import Chuot from './Chuot/Chuot';

function Home() {
    return (
        <div>
            <ContainerFluid />
            <PC />
            <LTG />
            <Chuot />
        </div>
    );
}

export default Home;
