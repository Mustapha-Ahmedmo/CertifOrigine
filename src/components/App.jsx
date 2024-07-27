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

const App = () => (
  <Routes>
    {/* Routes avec MainLayout */}
    <Route path="/" element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
      <Route index element={<Home />} />
    </Route>
    {/* Routes avec SimpleLayout */}
    <Route path="/login" element={<SimpleLayout />}>
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
