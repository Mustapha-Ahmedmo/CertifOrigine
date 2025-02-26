const { QueryTypes } = require('sequelize');
const sequelize = require('../config/db'); // Your Sequelize instance

const setMemo = async (req, res) => {
  try {
    const {
      p_id_order,
      p_id_cust_account,
      p_typeof,
      p_idlogin_insert,
      p_memo_date,
      p_memo_subject,
      p_memo_body,
      p_mail_to,
      p_mail_bcc,
      p_mail_acc,
      p_mail_notifications,
    } = req.body;

    // Validate required fields (adjust validation as needed)
    if (
      !p_id_order ||
      !p_id_cust_account ||
      !p_typeof ||
      !p_idlogin_insert ||
      !p_memo_date ||
      !p_memo_subject ||
      !p_memo_body
    ) {
      return res.status(400).json({
        message:
          'Les champs p_id_order, p_id_cust_account, p_typeof, p_idlogin_insert, p_memo_date, p_memo_subject et p_memo_body sont requis.',
      });
    }

    // Initialize the INOUT parameter p_id to 0
    const initialMemoId = 0;

    // Call the stored procedure using CALL syntax.
    const result = await sequelize.query(
      `CALL set_memo(
        :p_id_order,
        :p_id_cust_account,
        :p_typeof,
        :p_idlogin_insert,
        :p_memo_date,
        :p_memo_subject,
        :p_memo_body,
        :p_mail_to,
        :p_mail_bcc,
        :p_mail_acc,
        :p_mail_notifications,
        :p_id
      )`,
      {
        replacements: {
          p_id_order,
          p_id_cust_account,
          p_typeof,
          p_idlogin_insert,
          p_memo_date,
          p_memo_subject,
          p_memo_body,
          p_mail_to: p_mail_to || null,
          p_mail_bcc: p_mail_bcc || null,
          p_mail_acc: p_mail_acc || null,
          p_mail_notifications: p_mail_notifications || null,
          p_id: initialMemoId,
        },
        // Using RAW type because CALL may return an empty array.
        type: QueryTypes.RAW,
      }
    );

    // Depending on your driver, the procedure output may be found in result[0] or via another property.
    // Here, we assume the returned value is available as result[0].p_id.
    const newMemoId = result && result[0] && result[0].p_id ? result[0].p_id : null;

    if (!newMemoId) {
      return res.status(500).json({
        message: 'Erreur lors de la création du memo. Aucune ID de memo retournée.',
      });
    }

    res.status(201).json({
      message: 'Memo créé avec succès.',
      newMemoId,
    });
  } catch (error) {
    console.error("Erreur lors de l'exécution de set_memo:", error);
    res.status(500).json({
      message: 'Erreur lors de la création du memo.',
      error: error.message || 'Erreur inconnue.',
      details: error.original || error,
    });
  }
};

const getMemo = async (req, res) => {
    try {
        
      const { 
        p_id_memo_list,
        p_id_order_list,
        p_typeof_list,
        p_id_cust_account,
        p_memo_date_start,
        p_memo_date_end,
        p_isAck,
        p_idlogin,
        p_isopuser
      } = req.query;
      
      // Call the stored function using a SELECT statement
      const result = await sequelize.query(
        `SELECT * FROM get_memo(
           :p_id_memo_list,
           :p_id_order_list,
           :p_typeof_list,
           :p_id_cust_account,
           :p_memo_date_start,
           :p_memo_date_end,
           :p_isAck,
           :p_idlogin,
           :p_isopuser
        )`,
        {
          replacements: {
            p_id_memo_list: p_id_memo_list || null,
            p_id_order_list: p_id_order_list || null,
            p_typeof_list: p_typeof_list || null,
            p_id_cust_account: p_id_cust_account || null,
            p_memo_date_start: p_memo_date_start || null,
            p_memo_date_end: p_memo_date_end || null,
            // Convert string booleans to actual booleans
            p_isAck: (p_isAck === 'true' ? true : p_isAck === 'false' ? false : null),
            p_idlogin: p_idlogin || null,
            p_isopuser: (p_isopuser === 'true' ? true : p_isopuser === 'false' ? false : null),
          },
          type: QueryTypes.SELECT,
        }
      );
      
      res.status(200).json({
        message: 'Memos retrieved successfully.',
        data: result,
      });
    } catch (error) {
      console.error('Error retrieving memos:', error);
      res.status(500).json({
        message: 'Error retrieving memos.',
        error: error.message || 'Unknown error.',
        details: error.original || error,
      });
    }
  };

module.exports = {
  setMemo,
  getMemo
};