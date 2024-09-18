import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { login } from '../slices/authSlice';
import './Accueil.css'; // Import du CSS
import logo from '../assets/logo2.jpg'; // Import du logo

const Accueil = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // Logique de connexion
    if (username === 'admin' && password === 'password') {
      const user = { username }; // Vous pouvez ajouter plus de détails utilisateur ici
      dispatch(login(user));
      // Rediriger vers la page d'accueil ou une autre page après la connexion
      navigate('/');
    } else {
      alert('Nom d\'utilisateur ou mot de passe incorrect');
    }
  };

  return (
    <div className="accueil-container">
      <header>
        <div className="header-content">
          <img src={logo} alt="logo" className="logo" />
          <nav>
            <a href="#">Produits</a>
            <a href="#">Aide</a>
            <a href="#">Contact</a>
          </nav>
        </div>
      </header>

      <main>
        <h1>GESTION ELECTRONIQUE DES FORMALITÉS INTERNATIONALES</h1>
        <p>Le réseau des Chambres de Commerce et d'Industrie facilite vos formalités internationales !</p>

        <div className="services">
          <div className="service visas">
            <h2>VISAS POUR EXPORTATION DÉFINITIVE</h2>
            <ul>
              <li>Certificat d'origine (CO)</li>
              <li>Légalisation de document</li>
            </ul>
            <button>Commander</button>
          </div>

          <div className="connexion">
            <h2>CONNEXION</h2>
            <form onSubmit={handleSubmit}>
              <input
                type="text"
                placeholder="Nom d'utilisateur"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
              <input
                type="password"
                placeholder="Mot de passe"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <a href="/forgot-password">Mot de passe oublié ?</a>
              <button type="submit">Se connecter</button>
              <p>OU</p>
              <button className="create-account">Créer un compte</button>
            </form>
          </div>
        </div>
      </main>

      <footer>
        <p>© 2024 - Chambre de commerce de Djibouti</p>
      </footer>
    </div>
  );
};

export default Accueil;