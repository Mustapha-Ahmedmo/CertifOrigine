import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Login from '../pages/Login';
import ForgotPassword from '../pages/ForgotPassword';
import ResetPassword from '../pages/ResetPassword';
import Register from '../pages/Register';
import RegisterOP from '../pages/RegisterOP';
import SimpleLayout from '../components/SimpleLayout';
import ProtectedRoute from './ProtectedRoute';
import DashboardWrapper from '../pages/DashboardWrapper';
import AccountCreated from '../pages/AccountCreated';
import Inscriptions from '../pages/Inscriptions';

// Import de vos pages du dashboard
import Home from '../pages/Home';
import HomeOperateur from '../pages/HomeOperateur';
import ToComplete from '../components/orders/ToComplete';
import ToValidateOP from '../components/orders/ToValidateOP';
import ToPay from '../components/orders/ToPay';
import ReturnedOrders from '../components/orders/ReturnedOrders';
import CompletedOrdersThisYear from '../components/orders/CompletedOrdersThisYear';
import CreateOrder from '../components/orders/Create/CreateOrder';


const App = () => (
  <Routes>
    {/* Page de login */}
    <Route path="/" index element={<Login />} />

    {/* Dashboard protégé par ProtectedRoute */}
    <Route
      path="/dashboard"
      element={
        <ProtectedRoute>
          <DashboardWrapper />
        </ProtectedRoute>
      }
    >
      {/* Routes pour les clients (index = Home) */}
      <Route index element={<Home />} />
      <Route path="to-complete" element={<ToComplete />} />
      <Route path="to-pay" element={<ToPay />} />
      <Route path="returned-orders" element={<ReturnedOrders />} />
      <Route path="completed-orders-this-year" element={<CompletedOrdersThisYear />} />
      <Route path="create-order" element={<CreateOrder />} />

      {/* Routes pour les opérateurs */}
      <Route path="operator" element={<HomeOperateur />} />
      <Route path="to-validateOP" element={<ToValidateOP />} />
    </Route>

    {/* Routes simples avec SimpleLayout */}
    <Route path="/login" element={<SimpleLayout />}>
      <Route index element={<Login />} />
    </Route>
    <Route path="/register" element={<Register />}>
      <Route index element={<Login />} />
    </Route>
    <Route path="/registerop" element={<RegisterOP />}>
      <Route index element={<Login />} />
    </Route>
    <Route path="/forgot-password" element={<SimpleLayout />}>
      <Route index element={<ForgotPassword />} />
    </Route>
    <Route path="/reset-password" element={<SimpleLayout />}>
      <Route index element={<ResetPassword />} />
    </Route>
    <Route path="/account-created" element={<SimpleLayout />}>
      <Route index element={<AccountCreated />} />
    </Route>
    <Route path="/inscriptions" element={<SimpleLayout />}>
      <Route index element={<Inscriptions />} />
    </Route>
    
  </Routes>
);

export default App;