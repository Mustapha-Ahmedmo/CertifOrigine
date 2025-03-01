// App.jsx
import React, { useEffect, useState } from 'react';
import {
  Routes,
  Route,
  Navigate,
  useLocation,
  useNavigate
} from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { restoreAuthState } from '../slices/authSlice';

// Pages & layouts
import Login from '../pages/Login';
import ContactUs from '../pages/ContactUs';
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
import Maintenance from '../pages/Maintenance';
import HeaderLayout from '../components/HeaderLayout';

// Pages du dashboard
import Home from '../pages/Home'; // Gestion des commandes
import DashboardClient from '../pages/DashboardClient';
import HomeOperateur from '../pages/HomeOperateur';
import OpOrderDetails from '../pages/OpOrderDetails';
import ToComplete from '../components/orders/ToComplete';
import ToValidateOP from '../components/orders/ToValidateOP';
import ToPay from '../components/orders/ToPay';
import ReturnedOrders from '../components/orders/ReturnedOrders';
import CompletedOrdersThisYear from '../components/orders/CompletedOrdersThisYear';
import CreateOrder from '../components/orders/Create/CreateOrder';
import OperateurLayout from './OperateurLayout';
import ContactsList from '../pages/ContactsList';
import RegisterContact from '../pages/RegisterContact';
import ListTypePage from '../pages/DonneeDeBase/unitTypePage';
import DashboardOperateur from '../pages/DashboardOperateur';

// Gestion de l'inactivité
import InactivityHandler from './InactivityHandler';
import Step2 from './orders/Create/steps/Step2';
import OrderDetailsPage from '../pages/OrderDetails/OrderPageDetails';
import NotificationPage from '../pages/Notifications/NotificationPage';
import SearchOrders from '../pages/SearchOrders/SearchOrders';

const App = () => {
  const dispatch = useDispatch();
  const { isAuthenticated, user, loading } = useSelector((state) => state.auth);
  const location = useLocation();
  const navigate = useNavigate();

  // Détermine si l'utilisateur est opérateur (on suppose que user.isopuser est true pour les opérateurs)
  const isOperator = user?.isopuser;

  return (
    <>
      {/* On monte InactivityHandler seulement si l'utilisateur est authentifié */}
      {isAuthenticated && <InactivityHandler timeout={600000} />}

      <Routes>
        {/* Route racine : redirige vers /dashboard si connecté, sinon Login */}
        <Route
          path="/"
          element={
            isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />
          }
        />

        {/* Dashboard protégé */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardWrapper />
            </ProtectedRoute>
          }
        >
          {/* Route index conditionnelle :
              - Si opérateur, on affiche HomeOperateur.
              - Sinon (client), on affiche DashboardClient. */}
          <Route
            index
            element={isOperator ? <HomeOperateur /> : <DashboardClient />}
          />

          {/* Lien pour "Gestion des commandes" qui pointe vers Home (page de gestion de commande) */}
          <Route path="home" element={<Home />} />

          {/* Autres routes client */}
          <Route path="dashboardclient" element={<DashboardClient />} />
          <Route path="to-complete" element={<ToComplete />} />
          <Route path="to-pay" element={<ToPay />} />
          <Route path="returned-orders" element={<ReturnedOrders />} />
          <Route path="contactslist" element={<ContactsList />} />
          <Route path="destinatairelist" element={<Maintenance />} />
          <Route
            path="completed-orders-this-year"
            element={<CompletedOrdersThisYear />}
          />
          <Route path="create-order" element={<CreateOrder />} />
          <Route path="order-details" element={<OrderDetailsPage />} />
          <Route path="notifications" element={<NotificationPage />} />

          {/* Routes réservées aux opérateurs */}
          <Route path="operator" element={<OperateurLayout />}>
            <Route index element={<HomeOperateur />} />
            <Route path="to-validateOP" element={<ToValidateOP />} />
            <Route path="inscriptions" element={<Inscriptions />} />
            <Route path="clientvalides" element={<ClientsValides />} />
            <Route path="operatorslist" element={<OperatorsList />} />
            <Route path="oporderdetails" element={<OpOrderDetails />} />
            <Route path="list-type" element={<ListTypePage />} />
            <Route path="dashboardoperateur" element={<DashboardOperateur />} />

            <Route path="search-orders" element={<SearchOrders />} />
          </Route>
        </Route>

        {/* Layout simple pour /login */}
        <Route
          path="/login"
          element={
            isAuthenticated ? <Navigate to="/dashboard" replace /> : <HeaderLayout />
          }
        >
          <Route index element={<Login />} />
        </Route>

        {/* Autres routes "simples" */}
        <Route path="/register" element={<Register />}>
          <Route index element={<Login />} />
        </Route>
        <Route path="/contact-us" element={<ContactUs />}>
          <Route index element={<ContactUs />} />
        </Route>
        <Route path="/registercontact/:id?" element={<RegisterContact />} />
        <Route path="/registerop/:id?" element={<RegisterOP />}>
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

        <Route path="/create-order/step2" element={<Step2 />} />

        {/* Fallback si aucune route ne matche */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
};

export default App;
