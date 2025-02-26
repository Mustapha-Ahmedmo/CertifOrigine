const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const sequelize = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const countriesRoutes = require('./routes/countriesRoutes');
const sectorsRoutes = require('./routes/sectorsRoutes');
const customerRoutes = require('./routes/customerRoutes'); 
const operatorRoutes = require('./routes/operatorRoutes');
const mailerRoutes = require('./routes/mailerRoutes');
const orderRoutes = require('./routes/orderRoutes');
const path = require('path');

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
app.use('/api/operators', operatorRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/mailers', mailerRoutes);

const fs = require('fs');

app.get('/api/files/:type/:year/:file', (req, res) => {
  const { type, year, file } = req.params;

  // Construct the file path
  const filePath = path.join(__dirname, 'data', type, year, file);

  console.log('Serving file from:', filePath);

  // Check if the file exists
  if (!fs.existsSync(filePath)) {
    return res.status(404).send('File not found');
  }

  // Send the file
  res.sendFile(filePath);
});

// Synchroniser Sequelize avec la base de données
sequelize.sync()
    .then(() => console.log('Database synced successfully'))
    .catch(err => console.error('Error syncing database:', err));

// Port et démarrage du serveur
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});