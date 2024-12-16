import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Navigate, useNavigate, Outlet } from 'react-router-dom';
import MainLayout from '../components/MainLayout';
import OperateurLayout from '../components/OperateurLayout';

const DashboardWrapper = () => {
  const user = useSelector((state) => state.auth.user);
  const navigate = useNavigate();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Si l'utilisateur est un opérateur, on le redirige vers /dashboard/operator
  useEffect(() => {
    if (user.isadmin_login && location.pathname === '/dashboard') {
      navigate('/dashboard/operator', { replace: true });
    }
  }, [user, location.pathname, navigate]);
  if (user.isadmin_login) {
    // Layout opérateur avec Outlet
    return (
      <OperateurLayout>
        <Outlet />
      </OperateurLayout>
    );
  }

  // Layout client avec Outlet
  return (
    <MainLayout>
      <Outlet />
    </MainLayout>
  );
};

export default DashboardWrapper;
