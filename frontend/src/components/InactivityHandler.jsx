import React, { useEffect, useState, useRef } from "react";
import { useDispatch } from "react-redux";
import { logout } from "../slices/authSlice";
import './InactivityHandler.css';


const InactivityHandler = ({ timeout = 300000 }) => {
  const [showPopup, setShowPopup] = useState(false);
  const timeoutRef = useRef(null);
  const popupTimeoutRef = useRef(null);
  const dispatch = useDispatch();

  // Réinitialiser le timer d'inactivité
  const resetInactivityTimer = () => {
    clearTimeout(timeoutRef.current); // Clear le timer principal
    clearTimeout(popupTimeoutRef.current); // Clear le timer popup

    // Repartir à zéro
    timeoutRef.current = setTimeout(() => {
      setShowPopup(true);

      // Si l'utilisateur ne répond pas dans 30 secondes après le popup
      popupTimeoutRef.current = setTimeout(() => {
        handleLogout(); // Déconnexion
      }, 30000); // 30 secondes
    }, timeout); // Par défaut 5 minutes (300000 ms)
  };

  // Déconnexion de l'utilisateur
  const handleLogout = () => {
    setShowPopup(false);
    dispatch(logout());
  };

  // Réponse utilisateur au popup
  const handleUserResponse = () => {
    setShowPopup(false);
    resetInactivityTimer();
  };

  // Gestion des événements utilisateur
  useEffect(() => {
    resetInactivityTimer(); // Démarrer le timer initial

    // Ajouter les listeners pour détecter l'activité
    const events = ["mousemove", "keydown", "mousedown", "scroll", "touchstart"];
    events.forEach((event) =>
      window.addEventListener(event, resetInactivityTimer)
    );

    // Cleanup : retirer les listeners et clear les timers
    return () => {
      events.forEach((event) =>
        window.removeEventListener(event, resetInactivityTimer)
      );
      clearTimeout(timeoutRef.current);
      clearTimeout(popupTimeoutRef.current);
    };
  }, []);

  return (
    <>
      {showPopup && (
        <div className="inactivity-popup">
          {console.log("Popup affiché")} {/* Debug */}  
          <div className="popup-content">
            <p>Vous êtes toujours là ?</p>
            <button onClick={handleUserResponse}>Oui</button>
          </div>
        </div>
      )}
    </>
  );
};

export default InactivityHandler;
