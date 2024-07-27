import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from './Header';
import Menu from './Menu';
import Footer from './Footer';
import Home from '../pages/Home';
import Login from '../pages/Login';
import MainLayout from '../components/MainLayout';
import SimpleLayout from '../components/SimpleLayout';
import './App.css';

/*const App = () => {
  return (
    <div className="app-container">
      <Header />
      <div className="main-container">
        <Menu />
        <div className="content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
          </Routes>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default App;*/


const App = () => (
  <Routes>
    {/* Routes avec MainLayout */}
    <Route path="/" element={<MainLayout />}>
      <Route index element={<Home />} />
    </Route>
    {/* Routes avec SimpleLayout */}
    <Route path="/login" element={<SimpleLayout />}>
      <Route index element={<Login />} />
    </Route>
  </Routes>
);

export default App;