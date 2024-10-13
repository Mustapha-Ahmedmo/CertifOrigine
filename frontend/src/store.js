import { configureStore } from '@reduxjs/toolkit';
import authReducer, { restoreAuthState } from './slices/authSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
  },
});

// Restaurer l'état d'authentification à partir de localStorage
const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
const user = JSON.parse(localStorage.getItem('user'));

if (isAuthenticated) {
  store.dispatch(restoreAuthState({ isAuthenticated, user }));
}

export default store;
