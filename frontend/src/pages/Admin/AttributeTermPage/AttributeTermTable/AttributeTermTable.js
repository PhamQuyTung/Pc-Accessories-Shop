import React from 'react';
import styles from './AttributeTermTable.module.scss';
import classNames from 'classnames/bind';

const cx = classNames.bind(styles);

export default function AttributeTermTable({ terms, onEdit, onDelete, attribute }) {
    console.log('Rendering term:', terms);

    return (
        <div className={cx('table-wrapper')}>
            <table className={cx('table')}>
                <thead>
                    <tr>
                        <th>Tên</th>
                        <th>Slug</th>
                        <th>Hành động</th>
                    </tr>
                </thead>
                <tbody>
                    {terms.map((term) => (
                        <tr key={term._id}>
                            <td>
                                {attribute?.type === 'color' ? (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <div
                                            style={{
                                                width: '20px',
                                                height: '20px',
                                                backgroundColor: term.color || '#000',
                                                border: '1px solid #ccc',
                                                borderRadius: '4px',
                                            }}
                                            title={term.color}
                                        />
                                        <span>{term.name}</span>
                                        {console.log('🎨 Màu đang render:', term.color)}
                                    </div>
                                ) : (
                                    term.name
                                )}
                            </td>

                            <td>{term.slug}</td>

                            {/* {attribute?.type === 'color' && (
                                <td>
                                    <div
                                        style={{
                                            width: '24px',
                                            height: '24px',
                                            backgroundColor: term.color || '#000',
                                            border: '1px solid #ccc',
                                            borderRadius: '4px',
                                            display: 'inline-block',
                                        }}
                                        title={term.color}
                                    ></div>
                                </td>
                            )} */}

                            {/* {attribute?.type === 'image' && (
                                <td>
                                    {term.image ? (
                                        <img src={term.image} alt="thumbnail" style={{ width: 40, height: 40 }} />
                                    ) : (
                                        '—'
                                    )}
                                </td>
                            )} */}

                            <td>
                                <button onClick={() => onEdit(term)}>✏️</button>
                                <button onClick={() => onDelete(term._id)}>🗑️</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
