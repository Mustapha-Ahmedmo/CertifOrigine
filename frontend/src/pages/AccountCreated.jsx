import React from 'react';
import './AccountCreated.css'; // Import du fichier CSS

const AccountCreated = () => {
  return (
    <div className="account-created-container">
      <div className="account-created-box">
        <h1>Votre compte a été créé</h1>
        <p>
          Veuillez attendre la validation d'un opérateur pour pouvoir vous connecter.
        </p>
        <p>
          Si vous n'avez pas reçu de mail de confirmation, veuillez vous rapporcher de la Chambre de Commerce.
        </p>
        <a href="/" className="account-created-button">Retour à l'accueil</a>
      </div>
    </div>
  );
};

export default AccountCreated;
