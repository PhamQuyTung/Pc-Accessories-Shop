import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axiosClient from '~/utils/axiosClient';
import styles from './PostPreviewPage.module.scss';
import classNames from 'classnames/bind';
import { faCalendar, faUser } from '@fortawesome/free-regular-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import LoadingSpinner from '~/components/SpinnerLoading/SpinnerLoading';
import ProductInline from '~/components/ProductInline/ProductInline';

const cx = classNames.bind(styles);

const PostPreviewPage = () => {
    const { id } = useParams();
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDraftPost = async () => {
            setLoading(true);
            try {
                const res = await axiosClient.get(`/posts/${id}`);
                setPost(res.data);
            } catch (err) {
                console.error('❌ Lỗi tải bản nháp:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchDraftPost();
    }, [id]);

    const renderContent = () => {
        const regex = /\[product id="(.*?)"\]/g;
        const parts = post.content.split(regex);

        let rendered = [];
        for (let i = 0; i < parts.length; i++) {
            if (i % 2 === 0) {
                // text HTML
                rendered.push(<div key={`html-${i}`} dangerouslySetInnerHTML={{ __html: parts[i] }} />);
            } else {
                // productId
                const productId = parts[i];
                const product = post.embeddedProducts?.find((p) => p._id === productId);
                rendered.push(<ProductInline key={`prod-${productId}`} product={product} />);
            }
        }

        return rendered;
    };

    if (loading) return <LoadingSpinner />;
    if (!post) return <p>Không tìm thấy bài viết</p>;

    return (
        <div className={cx('post-preview')}>
            <article>
                <Link to="/admin/posts/drafts" className={cx('back-link')}>
                    ← Quay lại danh sách bản nháp
                </Link>

                <h1 className={cx('post-title')}>{post.title}</h1>

                <div className={cx('post-meta')}>
                    <span>
                        <FontAwesomeIcon icon={faUser} /> {post.author?.name}
                    </span>
                    <span>
                        <FontAwesomeIcon icon={faCalendar} /> {new Date(post.createdAt).toLocaleDateString('vi-VN')}
                    </span>
                    <span className={cx('status')}>📝 {post.status}</span>
                </div>

                {post.image && (
                    <div className={cx('post-thumbnail')}>
                        <img src={post.image} alt={post.title} />
                    </div>
                )}

                {/* Nội dung với blot */}
                <div className={cx('post-body')}>{renderContent()}</div>
            </article>
        </div>
    );
};

export default PostPreviewPage;
