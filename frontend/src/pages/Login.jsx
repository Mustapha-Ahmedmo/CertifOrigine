import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { login } from '../slices/authSlice';
import './Login.css';
import logo from '../assets/logo.jpg';
import { loginUser } from '../services/apiServices';

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const data = await loginUser(username, password); // Call centralized API
      localStorage.setItem('token', data.token);
      const user = { username }; // You can add more user details here if needed
      dispatch(login(user));
      navigate('/dashboard');
    } catch (error) {
      setError(error.message); // Set error message
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <img src={logo} alt="Chambre de Commerce de Djibouti" className="logo" />
        <h2>CONNEXION</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">Nom d'utilisateur</label>
            <input
              type="text"
              id="username"
              name="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Mot de passe</label>
            <input
              type="password"
              id="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && <p className="error">{error}</p>}
          <div className="form-group">
            <a href="/forgot-password" className="forgot-password">Mot de passe oublié?</a>
          </div>
          <button type="submit" className="btn-login">Se connecter</button>
          <div className="register-link">
            <p>Vous n'avez pas de compte? <a href="/register">Inscription</a></p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;