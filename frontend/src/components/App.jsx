import React from 'react';
import { Routes, Route } from 'react-router-dom';
import MainLayout from '../components/MainLayout';
import SimpleLayout from '../components/SimpleLayout';
import OperateurLayout from '../components/OperateurLayout'; // Importer le nouveau layout
import Home from '../pages/Home';
import HomeOperateur from '../pages/HomeOperateur'; // Import de la nouvelle page
import Login from '../pages/Login';
import ForgotPassword from '../pages/ForgotPassword';
import ResetPassword from '../pages/ResetPassword';
import ProtectedRoute from './ProtectedRoute';
import './App.css';
import ToComplete from './orders/ToComplete';
import ToValidateOP from './orders/ToValidateOP';
import ToPay from './orders/ToPay';
import ReturnedOrders from './orders/ReturnedOrders';
import CompletedOrdersThisYear from './orders/CompletedOrdersThisYear';
import Register from '../pages/Register';
import RegisterOP from '../pages/RegisterOP';
import CreateOrder from './orders/Create/CreateOrder';


const App = () => (
  <Routes>
    <Route path="/" index element={<Login />} />
    {/* Routes avec MainLayout */}
    <Route path="/dashboard" element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
      <Route index element={<Home />} />
      <Route path="to-complete" element={<ToComplete />} />
      <Route path="to-pay" element={<ToPay />} />
      <Route path="returned-orders" element={<ReturnedOrders />} />
      <Route path="completed-orders-this-year" element={<CompletedOrdersThisYear />} />
      <Route path="create-order" element={<CreateOrder />} />
    </Route>

    {/* Routes pour l'opérateur avec OperateurLayout */}
    <Route path="/home-operateur" element={<OperateurLayout />}>
      <Route index element={<HomeOperateur />} />
      <Route path="to-validateOP" element={<ToValidateOP />} />
      
    </Route>

    {/* Routes avec SimpleLayout */}
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
  </Routes>
);

export default App;
