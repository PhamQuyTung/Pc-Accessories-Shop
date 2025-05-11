import React from 'react';

function AuthLayout({ children }) {
    return (
        <div>
            <main>{children}</main>
        </div>
    );
}

export default AuthLayout;