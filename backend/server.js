const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const sequelize = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const countriesRoutes = require('./routes/countriesRoutes');
const sectorsRoutes = require('./routes/sectorsRoutes');
const customerRoutes = require('./routes/customerRoutes'); 

// Charger les variables d'environnement
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/countries', countriesRoutes);
app.use('/api/sectors', sectorsRoutes);
app.use('/api/customer', customerRoutes);

// Synchroniser Sequelize avec la base de données
sequelize.sync()
    .then(() => console.log('Database synced successfully'))
    .catch(err => console.error('Error syncing database:', err));

// Port et démarrage du serveur
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});