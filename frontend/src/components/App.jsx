import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
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
import OperateurLayout from './OperateurLayout';

// Import du gestionnaire d'inactivité
import InactivityHandler from './InactivityHandler';
import { useDispatch, useSelector } from 'react-redux';
import { restoreAuthState } from '../slices/authSlice';

const App = () => {

  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  // Restore authentication state on app load
  useEffect(() => {
    const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
    const user = JSON.parse(localStorage.getItem('user'));
    const token = localStorage.getItem('token');

    if (isAuthenticated && user && token) {
      dispatch(restoreAuthState({ isAuthenticated, user, token }));
    }
  }, [dispatch]);

  console.log("Is Authicated ->", isAuthenticated);

  console.log("Is user ->", user);
  return (
    <>
      {/* Gestion de l'inactivité (5 minutes par défaut) */}
      <InactivityHandler timeout={300000} />

      <Routes>
        <Route path="/" element={isAuthenticated ? <Navigate to="/dashboard" /> : <Login />} />

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
          <Route path="operator" element={<OperateurLayout />}>
            <Route index element={<HomeOperateur />} />
            <Route path="to-validateOP" element={<ToValidateOP />} />
            <Route path="inscriptions" element={<Inscriptions />} />
          </Route>
        </Route>

        {/* Routes simples avec SimpleLayout */}

        <Route
          path="/login"
          element={isAuthenticated ? <Navigate to="/dashboard" /> : <SimpleLayout />}
        >
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
      </Routes>
    </>
  );
};

export default App;
