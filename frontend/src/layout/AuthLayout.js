import React from 'react';
import { Outlet } from 'react-router-dom';

function AuthLayout() {
    return (
        <div>
            <main>
                <Outlet /> {/* render child route */}
            </main>
        </div>
    );
}

export default AuthLayout;
