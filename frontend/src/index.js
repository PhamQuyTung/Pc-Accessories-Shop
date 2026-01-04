import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import reportWebVitals from './reportWebVitals';
import GlobalStyles from './components/GlobalStyles';
// import { AuthProvider } from './contexts/AuthContext';
import ToastMessagerProvider from './components/ToastMessager';
import 'bootstrap/dist/css/bootstrap.min.css';
import { registerQuillModules } from './utils/quillSetup';
import 'tippy.js/dist/tippy.css';
import 'tippy.js/animations/scale.css';

registerQuillModules(); // ✅ gọi duy nhất 1 lần

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
    <ToastMessagerProvider>
        <GlobalStyles>
            <App />
        </GlobalStyles>
    </ToastMessagerProvider>,
);

reportWebVitals();
