// menuLinks.js
const laptopLinks = {
    brands: {
        asus: '/laptop/asus',
        acer: '/laptop/acer',
        msi: '/laptop/msi',
        lenovo: '/laptop/lenovo',
        dell: '/laptop/dell',
        hp: '/laptop/hp',
        lg: '/laptop/lg',
    },
    price: {
        under15: '/laptop/gia-duoi-15-trieu',
        from15to20: '/laptop/gia-tu-15-den-20-trieu',
        over20: '/laptop/gia-tren-20-trieu',
    },
    cpu: {
        i3: '/laptop/cpu-intel-core-i3',
        i5: '/laptop/cpu-intel-core-i5',
        i7: '/laptop/cpu-intel-core-i7',
        amd: '/laptop/cpu-amd-ryzen',
    },
    usage: {
        design: '/laptop/do-hoa-studio',
        student: '/laptop/hoc-sinh-sinh-vien',
        premium: '/laptop/mong-nhe-cao-cap',
    },
    accessories: {
        ram: '/phu-kien/ram-laptop',
        ssd: '/phu-kien/ssd-laptop',
        hdd: '/phu-kien/o-cung-di-dong',
    },
    // Thêm các nhóm khác nếu cần
};

export default laptopLinks;
