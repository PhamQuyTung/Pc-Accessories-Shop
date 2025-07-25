// App.js
import React from 'react';
import { BrowserRouter as Router, useRoutes } from 'react-router-dom';
import routes from './routes/routes';
import ScrollToTop from './components/ScrollToTop/ScrollToTop';

function AppRoutes() {
    return useRoutes(routes);
}

function App() {
    return (
        <Router>
            <ScrollToTop />
            <AppRoutes />
        </Router>
    );
}

export default App;
