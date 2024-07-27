import React from 'react';
import { Outlet } from 'react-router-dom';

const SimpleLayout = () => (
  <div className="simple-layout">
      <Outlet />
  </div>
);

export default SimpleLayout;
