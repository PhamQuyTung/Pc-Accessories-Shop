import React, { useEffect, useState } from 'react';
import styles from './FavoriteButton.module.scss';
import classNames from 'classnames/bind';
import axiosClient from '~/utils/axiosClient';
import { FaHeart, FaRegHeart } from 'react-icons/fa';
import { useToast } from '~/components/ToastMessager';

const cx = classNames.bind(styles);

const FavoriteButton = ({ productId, isFavorite: isFavoriteProp, onToggle }) => {
    const [isFavorite, setIsFavorite] = useState(false);
    const [loading, setLoading] = useState(false);
    const showToast = useToast();

    // Load trạng thái đã thích chưa
    useEffect(() => {
        if (typeof isFavoriteProp === 'boolean') {
            setIsFavorite(isFavoriteProp);
        } else {
            const checkStatus = async () => {
                try {
                    const res = await axiosClient.get(`/favorites/${productId}`);
                    setIsFavorite(res.data?.isFavorite || false);
                } catch (err) {
                    console.error('Favorite check error:', err);
                    setIsFavorite(false);
                }
            };

            checkStatus();
        }
    }, [productId, isFavoriteProp]);

    const toggleFavorite = async () => {
        try {
            setLoading(true);
            const res = await axiosClient.post(`/favorites/toggle/${productId}`);
            const newState = res.data?.isFavorite;

            setIsFavorite(newState);
            showToast(
                newState ? 'Đã thêm vào danh sách yêu thích ❤️' : 'Đã bỏ thích sản phẩm',
                'success'
            );

            if (onToggle) onToggle(newState);
        } catch (err) {
            console.error('Toggle favorite error:', err);
            showToast('Có lỗi xảy ra', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            className={cx('favorite-btn', { active: isFavorite })}
            onClick={toggleFavorite}
            disabled={loading}
        >
            {isFavorite ? <FaHeart className={cx('icon')} /> : <FaRegHeart className={cx('icon')} />}
        </button>
    );
};

export default FavoriteButton;
