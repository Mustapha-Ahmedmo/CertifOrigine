import React from 'react';
import { Routes, Route } from 'react-router-dom';
import MainLayout from '../components/MainLayout';
import SimpleLayout from '../components/SimpleLayout';
import Home from '../pages/Home';
import Login from '../pages/Login';
import ForgotPassword from '../pages/ForgotPassword';
import ResetPassword from '../pages/ResetPassword';
import ProtectedRoute from './ProtectedRoute';
import './App.css';
import ToComplete from './orders/ToComplete';
import ToPay from './orders/ToPay';
import ReturnedOrders from './orders/ReturnedOrders';
import CompletedOrdersThisYear from './orders/CompletedOrdersThisYear';
import Register from '../pages/Register';
import CreateOrder from './orders/Create/CreateOrder';

const App = () => (
  <Routes>
    <Route path="/" index element={<Login />} />
    {/* Routes avec MainLayout */}
    <Route path="/dashboard" element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
      <Route index element={<Home />} />
      <Route path="to-complete" element={<ToComplete />} />  {/* Enlever le '/' */}
      <Route path="to-pay" element={<ToPay />} />            {/* Enlever le '/' */}
      <Route path="returned-orders" element={<ReturnedOrders />} />
      <Route path="completed-orders-this-year" element={<CompletedOrdersThisYear />} />
      <Route path="create-order" element={<CreateOrder />} />
    </Route>

    {/* Routes avec SimpleLayout */}
    <Route path="/login" element={<SimpleLayout />}>
      <Route index element={<Login />} />
    </Route>
    <Route path="/register" element={<Register />}>
      <Route index element={<Login />} />
    </Route>
    <Route path="/forgot-password" element={<SimpleLayout />}>
      <Route index element={<ForgotPassword />} />
    </Route>
    <Route path="/reset-password" element={<SimpleLayout />}>
      <Route index element={<ResetPassword />} />
    </Route>
  </Routes>
);

export default App;
