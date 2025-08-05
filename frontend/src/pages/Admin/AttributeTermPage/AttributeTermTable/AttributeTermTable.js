import React from 'react';
import styles from './AttributeTermTable.module.scss';
import classNames from 'classnames/bind';
import { FaEdit, FaTrashAlt } from 'react-icons/fa';

const cx = classNames.bind(styles);

export default function AttributeTermTable({ terms, onEdit, onDelete }) {
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
                    {terms.length > 0 ? (
                        terms.map((term) => (
                            <tr key={term._id}>
                                <td>{term.name}</td>
                                <td>{term.slug}</td>
                                <td>
                                    <button onClick={() => onEdit(term)} className={cx('edit-btn')}>
                                        <FaEdit />
                                    </button>
                                    <button onClick={() => onDelete(term._id)} className={cx('delete-btn')}>
                                        <FaTrashAlt />
                                    </button>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="3" className={cx('no-data')}>
                                Chưa có chủng loại nào
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}
