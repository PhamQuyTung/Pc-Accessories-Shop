import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import routes from './routes/routes';

function App() {
    return (
            <Router>
                <div className="App">
                    <Routes>
                        {routes.map((route, index) => {
                            const Layout = route.layout || React.Fragment; // Sử dụng layout hoặc Fragment nếu không có layout
                            return (
                                <Route
                                    key={index}
                                    path={route.path}
                                    element={
                                        <Layout>
                                            {route.element}
                                        </Layout>
                                    }
                                />
                            );
                        })}
                    </Routes>
                </div>
            </Router>
    );
}

export default App;
