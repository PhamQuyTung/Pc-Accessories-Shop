import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import reportWebVitals from './reportWebVitals';
import GlobalStyles from './components/GlobalStyles';
// import { AuthProvider } from './contexts/AuthContext';
import ToastMessagerProvider from './components/ToastMessager';

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
    <React.StrictMode>
        <ToastMessagerProvider>
            <GlobalStyles>
                <App />
            </GlobalStyles>
        </ToastMessagerProvider>
    </React.StrictMode>,
);

reportWebVitals();
