
import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import {
  Navigate,
  useNavigate,
  Outlet,
  useLocation,
} from 'react-router-dom';
import MainLayout from '../components/MainLayout';
import OperateurLayout from '../components/OperateurLayout';

const DashboardWrapper = () => {
  const user = useSelector((state) => state.auth.user);
  const navigate = useNavigate();
  const location = useLocation();

  // Si pas d'utilisateur, on redirige vers login (sécurité complémentaire)
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  /**
   * Si l'utilisateur est admin et qu'il tape EXACTEMENT "/dashboard",
   * on le redirige vers "/dashboard/operator".
   */
  useEffect(() => {
    if (user.isopuser && location.pathname === '/dashboard') {
      navigate('/dashboard/operator', { replace: true });
    }
  }, [user.isopuser, location.pathname, navigate]);

  /**
   * Si c'est un admin, on rend le layout opérateur
   */
  if (user.isopuser) {
    return (
      <OperateurLayout>
        <Outlet />
      </OperateurLayout>
    );
  }

  /**
   * Sinon, on rend le layout "client"
   */
  return (
    <MainLayout>
      <Outlet />
    </MainLayout>
  );
};

export default DashboardWrapper;
