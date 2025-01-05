import { useSelector } from 'react-redux';
import { Navigate, useLocation } from 'react-router-dom';

/**
 * Composant qui protège une route en vérifiant si on a un token
 */
const ProtectedRoute = ({ children }) => {
  const token = useSelector((state) => state.auth.token);
  const location = useLocation();

  // Si on n'a pas de token, on redirige vers /login
  // On transmet dans `state.from` la route d'origine
  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Sinon, on rend le contenu protégé
  return children;
};

export default ProtectedRoute;
