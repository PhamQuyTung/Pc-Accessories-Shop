import React from 'react';
import styles from './NewsSection.module.scss';
import cx from 'classnames';

const NewsSection = ({ news }) => {
    if (!news || news.length === 0) return null;

    return (
        <div className={styles.newsSection}>
            <h2 className={styles.title}>Bài viết mới nhất</h2>

            <div className={styles.newsList}>
                {news.map((item) => (
                    <a 
                        key={item._id}
                        href={`/blog/category/${item.category?.slug}/${item.slug}`}
                        className={styles.newsItem}
                    >
                        <div className={styles.thumbWrapper}>
                            <img src={item.thumbnail} alt={item.title} />
                        </div>

                        <div className={styles.info}>
                            <h3 className={styles.newsTitle}>{item.title}</h3>
                            <p className={styles.date}>
                                {new Date(item.createdAt).toLocaleDateString('vi-VN')}
                            </p>
                        </div>
                    </a>
                ))}
            </div>
        </div>
    );
};

export default NewsSection;
