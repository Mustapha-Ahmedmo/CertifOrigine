import React from 'react';
import Header from './HeaderOp';
import Menu from './MenuOp';
import Footer from './Footer';
import { Outlet } from 'react-router-dom';

const MainLayout = () => (
  <>
    <Header />
    <Menu />
    <div className="main-container">
      <div className="content">
        <Outlet />
      </div>
    </div>
    <Footer />
  </>
);

export default MainLayout;
