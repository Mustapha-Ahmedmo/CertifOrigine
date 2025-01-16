const sequelize = require('../config/db');

// Controller to retrieve operators using the `get_op_user` function
const getOperators = async (req, res) => {
  try {
    // Extract query parameters
    const { id_list, role_list, isActive } = req.query;
    
    // Call the stored function with parameters
    const operators = await sequelize.query(
      `SELECT * FROM public.get_op_user(
        :p_id_list,
        :p_role_list,
        :p_isactive
      )`,
      {
        replacements: {
          p_id_list: id_list || null, // Pass null if idList is not provided
          p_role_list: role_list || null, // Pass null if roleList is not provided
          p_isactive: isActive === undefined ? null : isActive === 'true', // Convert isActive to boolean or null
        },
        type: sequelize.QueryTypes.SELECT, // Fetch data as SELECT results
      }
    );

    // Respond with the result
    res.status(200).json({
      message: 'Liste des opérateurs récupérée avec succès.',
      data: operators,
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des opérateurs:', error);
    res.status(500).json({
      message: 'Erreur lors de la récupération des opérateurs.',
      error: error.message || 'Erreur inconnue.',
    });
  }
};

// Create a new operator
const createOperator = async (req, res) => {
    try {
      const {
        id_op_user,
        gender,
        fullName,
        roles,
        isAdmin,
        email,
        password,
        phoneNumber,
        mobileNumber,
        idLoginInsert,
      } = req.body;
  
      // Call the stored procedure `set_op_user`
      await sequelize.query(
        `CALL set_op_user(
          :p_id_op_user,
          :p_gender,
          :p_full_name,
          :p_roles,
          :p_isadmin,
          :p_email,
          :p_password,
          :p_phone_number,
          :p_mobile_number,
          :p_idlogin
        )`,
        {
          replacements: {
            p_id_op_user: id_op_user || 0, // For creating a new operator
            p_gender: gender,
            p_full_name: fullName,
            p_roles: roles,
            p_isadmin: isAdmin,
            p_email: email,
            p_password: password,
            p_phone_number: phoneNumber || null,
            p_mobile_number: mobileNumber || null,
            p_idlogin: idLoginInsert || 0,
          },
          type: sequelize.QueryTypes.RAW,
        }
      );
  
      res.status(201).json({
        message: 'Opérateur créé avec succès.',
      });
    } catch (error) {
      console.error('Erreur lors de la création de l’opérateur:', error);
      res.status(500).json({
        message: 'Erreur lors de la création de l’opérateur.',
        error: error.message || 'Erreur inconnue.',
      });
    }
  };
  
  // Disable an operator
  const disableOperator = async (req, res) => {
    try {
      const { id } = req.params;
  
      // Update the `DEACTIVATION_DATE` to the current date
      await sequelize.query(
        `UPDATE op_user
         SET deactivation_date = CURRENT_TIMESTAMP
         WHERE id_op_user = :id`,
        {
          replacements: { id },
          type: sequelize.QueryTypes.UPDATE,
        }
      );
  
      res.status(200).json({
        message: `Opérateur avec l'ID ${id} désactivé avec succès.`,
      });
    } catch (error) {
      console.error('Erreur lors de la désactivation de l’opérateur:', error);
      res.status(500).json({
        message: 'Erreur lors de la désactivation de l’opérateur.',
        error: error.message || 'Erreur inconnue.',
      });
    }
  };

module.exports = {
  getOperators,
  disableOperator,
  createOperator
};