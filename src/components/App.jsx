import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from './Header';
import Menu from './Menu';
import Footer from './Footer';
import Home from '../pages/Home';
import './App.css';

const App = () => {
  return (
    <div className="app-container">
      <Header />
      <div className="main-container">
        <Menu />
        <div className="content">
          <Routes>
            <Route path="/" element={<Home />} />
          </Routes>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default App;
