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
  const location = useLocation(); // <-- Import & use React Router "location"

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  useEffect(() => {
    // On ne redirige que si on est EXACTEMENT sur "/dashboard"
    // et si c'est un admin/opérateur
    if (user.isadmin_login && location.pathname === '/dashboard') {
      navigate('/dashboard/operator', { replace: true });
    }
  }, [user.isadmin_login, location.pathname, navigate]);

  if (user.isadmin_login) {
    return (
      <OperateurLayout>
        <Outlet />
      </OperateurLayout>
    );
  }

  return (
    <MainLayout>
      <Outlet />
    </MainLayout>
  );
};

export default DashboardWrapper;
