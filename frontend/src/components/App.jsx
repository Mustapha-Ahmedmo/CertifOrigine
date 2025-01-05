import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
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
import ClientsValides from '../pages/ClientsValides';
import OperatorsList from '../pages/OperatorsList';

import { startTransition } from 'react';

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
  const { isAuthenticated, user, loading } = useSelector((state) => state.auth);
  const location = useLocation();
  const navigate = useNavigate();

  // Restore authentication state on app load
  useEffect(() => {
    const storedIsAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
    const storedUser = JSON.parse(localStorage.getItem('user'));
    const storedToken = localStorage.getItem('token');


    if (storedIsAuthenticated && storedUser && storedToken) {
      dispatch(restoreAuthState({ isAuthenticated: storedIsAuthenticated, user: storedUser, token: storedToken }));
    } else {
      dispatch(restoreAuthState({ isAuthenticated: false, user: null, token: null }));
    }
  }, [dispatch]);


    // Save current route to localStorage
    useEffect(() => {
      if (isAuthenticated) {
        localStorage.setItem('currentRoute', location.pathname);
      }
    }, [location, isAuthenticated]);


    useEffect(() => {
      const savedRoute = localStorage.getItem('currentRoute');
      if (isAuthenticated && savedRoute) {
        console.log(savedRoute)
          navigate(savedRoute, { replace: true });
      }
    }, [isAuthenticated]);

  if (loading) {
    // You can render a loader here
    return <div>Loading...</div>;
  }
  return (
    <>
      {/* Gestion de l'inactivité (5 minutes par défaut) */}
      <InactivityHandler timeout={600000} />

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
            <Route path="clientvalides" element={<ClientsValides />} />
            <Route path="operatorslist" element={<OperatorsList />} />
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
        <Route path=":token" element={<ForgotPassword />} />
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
