// src/constants/specIcons.js
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

/**
 * ===== SOURCE OF TRUTH =====
 * Dùng cho: Admin, Select icon, Preview
 */
export const SPEC_ICON_LIST = [
    { key: 'cpu', label: 'CPU', Icon: SpecCPUIcon },
    { key: 'graphic-card', label: 'VGA', Icon: SpecGraphicCardIcon },
    { key: 'panel', label: 'Tấm nền', Icon: SpecScreenPanelIcon },
    { key: 'screen-size', label: 'Kích thước màn hình', Icon: SpecScreenPCIcon },
    { key: 'screen', label: 'Màn hình', Icon: SpecScreenSizeLaptopIcon },
    { key: 'ram', label: 'RAM', Icon: SpecRAMIcon },
    { key: 'ssd', label: 'SSD', Icon: SpecStorageIcon },
    { key: 'hz', label: 'Tần số quét', Icon: SpecHzIcon },
    { key: 'pin', label: 'Pin', Icon: SpecBatteryIcon },
    { key: 'connect', label: 'Kết nối', Icon: SpecConnectIcon },
    { key: 'led', label: 'Led', Icon: SpecLightIcon },
];

/**
 * ===== FAST LOOKUP MAP =====
 * Dùng cho: ProductCard, ProductDetail
 */
export const SPEC_ICON_MAP = SPEC_ICON_LIST.reduce((acc, { key, Icon }) => {
    acc[key] = Icon;
    return acc;
}, {});
