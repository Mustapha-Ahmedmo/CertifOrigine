import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import Backend from 'i18next-http-backend'; // To load translations from backend files

i18n
  .use(Backend) // Load translations using HTTP (backend files)
  .use(initReactI18next) // Bind i18next to React
  .init({
    fallbackLng: 'fr', // Fallback language in case detection fails
    interpolation: {
      escapeValue: false // React already escapes by default
    },
    backend: {
      loadPath: '/locales/{{lng}}/translation.json', // Path to your translation files
    }
  });

export default i18n;