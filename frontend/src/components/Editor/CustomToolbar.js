import React from 'react';
import { FaQuoteRight, FaBox } from 'react-icons/fa';

export default function CustomToolbar() {
    return (
        <div id="toolbar">
            {/* Heading */}
            <span className="ql-formats">
                <select className="ql-header" defaultValue="">
                    <option value="1">H1</option>
                    <option value="2">H2</option>
                    <option value="3">H3</option>
                    <option value="">Normal</option>
                </select>
            </span>

            {/* Font styles */}
            <span className="ql-formats">
                <button className="ql-bold"></button>
                <button className="ql-italic"></button>
                <button className="ql-underline"></button>
                <button className="ql-strike"></button>
            </span>

            {/* Lists */}
            <span className="ql-formats">
                <button className="ql-list" value="ordered"></button>
                <button className="ql-list" value="bullet"></button>
            </span>

            {/* Quote & Code */}
            <span className="ql-formats">
                {/* <button className="ql-blockquote"></button> */}
                <button className="ql-code-block"></button>
            </span>

            {/* Link & Image */}
            <span className="ql-formats">
                <button className="ql-link"></button>
                <button className="ql-image"></button>
            </span>

            {/* Clean */}
            <span className="ql-formats">
                <button className="ql-clean"></button>
            </span>

            {/* Custom buttons */}
            <span className="ql-formats">
                <button className="ql-insertQuote" title="Chèn Quote">
                    <FaQuoteRight size={14} />
                </button>
                <button className="ql-insertProduct" title="Chèn Product">
                    <FaBox size={14} />
                </button>
            </span>
        </div>
    );
}
