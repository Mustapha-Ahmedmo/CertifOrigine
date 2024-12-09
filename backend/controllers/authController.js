const sequelize = require('../config/db');
const jwt = require('jsonwebtoken');
const { QueryTypes } = require('sequelize');

const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Directly assign the result to rows; no destructuring needed
    const rows = await sequelize.query(
      `SELECT * FROM spSel_Credentials(:email, :password, :loginStat)`,
      {
        replacements: { email, password, loginStat: true },
        type: QueryTypes.SELECT,
      }
    );

    console.log("Rows =>", rows);

    // Destructure the first element from the rows array
    const [user] = rows;

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    console.log("User =>", user);

    // Create a payload for the JWT from the user claims
    const payload = {
      id: user.id_login_user,
      username: user.username,
      role: user.role_user,
      custAccountId: user.id_cust_account,
    };

    // Sign the JWT with your secret
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

    return res.status(500).json({
      message: 'An error occurred during login',
      error: error.message,
    });
  }
};

module.exports = {
  login,
};