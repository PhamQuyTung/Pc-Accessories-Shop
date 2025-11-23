import React, { useEffect, useState } from 'react';
import styles from './FavoriteButton.module.scss';
import classNames from 'classnames/bind';
import axiosClient from '~/utils/axiosClient';
import { FaHeart, FaRegHeart } from 'react-icons/fa';
import { useToast } from '~/components/ToastMessager';

const cx = classNames.bind(styles);

const FavoriteButton = ({ productId, onToggle }) => {
    const [isFavorite, setIsFavorite] = useState(false);
    const showToast = useToast();

    // Load trạng thái đã thích chưa
    useEffect(() => {
        const fetchStatus = async () => {
            try {
                const res = await axiosClient.get(`/favorites/${productId}`);
                setIsFavorite(res.data?.isFavorite || false);
            } catch (err) {
                console.error('Favorite check error:', err);
            }
        };

        fetchStatus();
    }, [productId]);

    const toggleFavorite = async () => {
        try {
            const res = await axiosClient.post(`/favorites/toggle/${productId}`);
            const newState = res.data?.isFavorite;

            setIsFavorite(newState);

            showToast(newState ? 'Đã thêm vào danh sách yêu thích ❤️' : 'Đã bỏ thích sản phẩm', 'success');

            if (onToggle) onToggle(newState);
        } catch (err) {
            console.error('Toggle favorite error:', err);
            showToast('Có lỗi xảy ra', 'error');
        }
    };

    return (
        <button className={cx('favorite-btn', { active: isFavorite })} onClick={toggleFavorite}>
            {isFavorite ? <FaHeart className={cx('icon')} /> : <FaRegHeart className={cx('icon')} />}
        </button>
    );
};

export default FavoriteButton;
