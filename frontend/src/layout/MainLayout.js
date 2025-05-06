import React from 'react';

function MainLayout({ children }) {
    return (
        <div>
            <header>Main Header</header>
            <main>{children}</main>
            <footer>Main Footer</footer>
        </div>
    );
}

export default MainLayout;