import React from 'react';
import Header from '../components/Header/header'; // Import Header component

function MainLayout({ children }) {
    return (
        <div>
            <header>
                <Header />
            </header>
            <main style={{marginTop: '162px'}}>
                {children}
            </main>
            <footer>Main Footer</footer>
        </div>
    );
}

export default MainLayout;
