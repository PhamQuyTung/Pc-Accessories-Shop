import ContainerFluid from './ContainerFluid/ContainerFluid';
import LTG from './LTG/LTG';
import PC from './PC/PC';
import Chuot from './Chuot/Chuot';
import BanPhim from './BanPhim/BanPhim';
import LT from './LT/LT';
import Screen from './Screen/Screen';
import Promotions from './Promotions/PromotionsWrapper';
import LatestPosts from './LatestPosts/LatestPosts';

function Home() {
    return (
        <div>
            <ContainerFluid />
            <Promotions />
            <PC />
            <LT />
            <LTG />
            <Chuot />
            <BanPhim />
            <Screen />
            <LatestPosts />
        </div>
    );
}

export default Home;
