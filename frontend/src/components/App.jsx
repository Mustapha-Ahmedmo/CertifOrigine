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

// Pages du dashboard
import Home from '../pages/Home';
import HomeOperateur from '../pages/HomeOperateur';
import ToComplete from '../components/orders/ToComplete';
import ToValidateOP from '../components/orders/ToValidateOP';
import ToPay from '../components/orders/ToPay';
import ReturnedOrders from '../components/orders/ReturnedOrders';
import CompletedOrdersThisYear from '../components/orders/CompletedOrdersThisYear';
import CreateOrder from '../components/orders/Create/CreateOrder';
import OperateurLayout from './OperateurLayout';

// Gestion de l'inactivité
import InactivityHandler from './InactivityHandler';

const App = () => {
  const dispatch = useDispatch();
  const { isAuthenticated, user, loading } = useSelector((state) => state.auth);

  const [authRestored, setAuthRestored] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  /**
   * 1. On restaure l'état d'auth depuis le localStorage dès le premier rendu
   *    pour savoir si on a déjà un token, user, etc.
   */
  useEffect(() => {
    const storedIsAuthenticated =
      localStorage.getItem('isAuthenticated') === 'true';
    const storedUser = JSON.parse(localStorage.getItem('user'));
    const storedToken = localStorage.getItem('token');

    if (storedIsAuthenticated && storedUser && storedToken) {
      dispatch(
        restoreAuthState({
          isAuthenticated: true,
          user: storedUser,
          token: storedToken,
        })
      );
    } else {
      dispatch(
        restoreAuthState({ isAuthenticated: false, user: null, token: null })
      );
    }

    // Après avoir dispatché, on peut signaler que la restauration est terminée
    // (Dans la vraie vie, on écouterait peut-être un "fulfilled" dans Redux,
    //  mais ici on simplifie)
    setTimeout(() => {
      setAuthRestored(true);
    }, 100);
  }, [dispatch]);

  /**
   * 2. On sauvegarde la route courante dans le localStorage
   *    seulement si on est authentifié et qu'on n'est pas sur "/login".
   */
  useEffect(() => {
    if (isAuthenticated && location.pathname !== '/login') {
      localStorage.setItem('currentRoute', location.pathname);
    }
  }, [location, isAuthenticated]);

  /**
   * 3. Une fois qu'on est authentifié, on récupère la route sauvegardée.
   *    Si on est sur "/" ou "/login", on redirige vers la route sauvegardée.
   */
  useEffect(() => {
    if (isAuthenticated) {
      const savedRoute = localStorage.getItem('currentRoute');
      if (
        savedRoute &&
        (location.pathname === '/' || location.pathname === '/login')
      ) {
        navigate(savedRoute, { replace: true });
      }
    }
  }, [isAuthenticated, location.pathname, navigate]);

  /**
   * Tant que la restauration (authRestored) n’est pas terminée
   * ou qu’on est en "loading" Redux, on affiche un loader
   * => évite le flash de la page login si on est déjà logué
   */
  if (!authRestored || loading) {
    return <div>Chargement...</div>;
  }

  return (
    <>
      {/* Gestion de l'inactivité (ex. 10 min = 600000 ms) */}
      <InactivityHandler timeout={600000} />

      <Routes>
        {/* 1) Route racine : si on est connecté, go /dashboard, sinon /login */}
        <Route
          path="/"
          element={
            isAuthenticated ? <Navigate to="/dashboard" /> : <Login />
          }
        />

        {/* 2) Dashboard protégé par ProtectedRoute */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardWrapper />
            </ProtectedRoute>
          }
        >
          {/* Routes "client" */}
          <Route index element={<Home />} />
          <Route path="to-complete" element={<ToComplete />} />
          <Route path="to-pay" element={<ToPay />} />
          <Route path="returned-orders" element={<ReturnedOrders />} />
          <Route
            path="completed-orders-this-year"
            element={<CompletedOrdersThisYear />}
          />
          <Route path="create-order" element={<CreateOrder />} />

          {/* Routes "opérateur" */}
          <Route path="operator" element={<OperateurLayout />}>
            <Route index element={<HomeOperateur />} />
            <Route path="to-validateOP" element={<ToValidateOP />} />
            <Route path="inscriptions" element={<Inscriptions />} />
            <Route path="clientvalides" element={<ClientsValides />} />
            <Route path="operatorslist" element={<OperatorsList />} />
          </Route>
        </Route>

        {/* 3) Layout simple pour /login */}
        <Route
          path="/login"
          element={
            isAuthenticated ? <Navigate to="/dashboard" /> : <SimpleLayout />
          }
        >
          <Route index element={<Login />} />
        </Route>

        {/* 4) Autres routes "simples" */}
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

        {/* 5) Fallback si aucune route ne matche (page blanche -> rediriger) */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
};

export default App;
