import React from 'react';
import { Outlet } from 'react-router-dom';

const SimpleLayout = () => (
  <div className="simple-layout">
    <div className="content">
      <Outlet />
    </div>
  </div>
);

export default SimpleLayout;
