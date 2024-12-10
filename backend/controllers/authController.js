const sequelize = require('../config/db');
const jwt = require('jsonwebtoken');
const { QueryTypes } = require('sequelize');

const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Utilisez les noms de paramètres qui correspondent à ceux de la fonction PostgreSQL
    const rows = await sequelize.query(
      `SELECT * FROM spSel_Credentials(:p_username, :p_pwd, :p_login_stat_FLAG)`,
      {
        replacements: { 
          p_username: email, 
          p_pwd: password, 
          p_login_stat_FLAG: true 
        },
        type: QueryTypes.SELECT,
      }
    );

    console.log("Rows =>", rows);

    // Destructure le premier élément du tableau rows
    const [user] = rows;

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    console.log("User =>", user);

    // Créez une charge utile pour le JWT à partir des informations de l'utilisateur
    const payload = {
      id: user.id_login_user,
      username: user.username,
      role: user.role_user,
      custAccountId: user.id_cust_account,
    };

    // Signez le JWT avec votre secret
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });

    return res.status(200).json({
      message: 'Login successful',
      token,
      user,
    });
  } catch (error) {
    console.error('Error during login:', error);

    if (error.message && error.message.includes('LOGIN NOT IDENTIFIED')) {
      return res.status(404).json({
        message: 'LOGIN NOT IDENTIFIED',
        error: error.message,
      });
    }

    if (error.message && error.message.includes('Account waiting for validation')) {
      return res.status(403).json({
        message: 'Account waiting for validation',
        error: error.message,
      });
    }

    return res.status(500).json({
      message: 'An error occurred during login',
      error: error.message,
    });
  }
};

module.exports = {
  login,
};