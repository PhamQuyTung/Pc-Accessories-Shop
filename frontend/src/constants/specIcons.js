import {
    SpecCPUIcon,
    SpecBatteryIcon,
    SpecConnectIcon,
    SpecGraphicCardIcon,
    SpecHzIcon,
    SpecLightIcon,
    SpecRAMIcon,
    SpecScreenPCIcon,
    SpecScreenPanelIcon,
    SpecScreenSizeLaptopIcon,
    SpecStorageIcon,
} from '~/components/Icons';

export const SPEC_ICONS = [
    {
        key: 'cpu',
        label: 'CPU',
        Icon: SpecCPUIcon,
    },
    {
        key: 'graphic-card',
        label: 'VGA',
        Icon: SpecGraphicCardIcon,
    },
    {
        key: 'panel',
        label: 'Tấm nền',
        Icon: SpecScreenPanelIcon,
    },
    {
        key: 'screen-size',
        label: 'Kích thước màn hình',
        Icon: SpecScreenPCIcon,
    },
    {
        key: 'screen-size',
        label: 'Màn hình',
        Icon: SpecScreenSizeLaptopIcon,
    },
    {
        key: 'ram',
        label: 'RAM',
        Icon: SpecRAMIcon,
    },
    {
        key: 'ssd',
        label: 'SSD',
        Icon: SpecStorageIcon,
    },
    {
        key: 'Hz',
        label: 'Tần số quét',
        Icon: SpecHzIcon,
    },
    {
        key: 'pin',
        label: 'Pin',
        Icon: SpecBatteryIcon,
    },
    {
        key: 'connect',
        label: 'Kết nối',
        Icon: SpecConnectIcon,
    },
    {
        key: 'Led',
        label: 'Led',
        Icon: SpecLightIcon,
    },
];
