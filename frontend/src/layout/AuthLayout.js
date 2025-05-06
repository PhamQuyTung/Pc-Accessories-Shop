import React from 'react';

function AuthLayout({ children }) {
    return (
        <div>
            <header>Auth Header</header>
            <main>{children}</main>
        </div>
    );
}

export default AuthLayout;