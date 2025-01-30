const sequelize = require('../config/db'); // Import the Sequelize instance
const { QueryTypes } = require('sequelize'); // Ensure QueryTypes is imported

const executeAddOrder = async (req, res) => {
    try {
      const { idCustAccount, orderTitle, idloginInsert } = req.body;
  
      // Validate input parameters
      if (!idCustAccount || !orderTitle || !idloginInsert) {
        return res.status(400).json({
          message: 'Les champs idCustAccount, orderTitle et idloginInsert sont requis.',
        });
      }

      const result = await sequelize.query(
        `SELECT add_order_wrapper(:p_id_cust_account, :p_order_title, :p_idlogin_insert) AS new_order_id`,
        {
          replacements: {
            p_id_cust_account: idCustAccount,
            p_order_title: orderTitle,
            p_idlogin_insert: idloginInsert,
          },
          type: sequelize.QueryTypes.SELECT,
        }
      );
      
      const newOrderId = result[0]?.new_order_id;
      
      if (!newOrderId) {
        return res.status(500).json({
          message: 'Erreur lors de la création de la commande. Aucune ID de commande retournée.',
        });
      }
  
      // Since Sequelize doesn't directly handle `INOUT`, fetch the value manually
      // If `result` is empty, the value is likely not being captured correctly
      console.log('Procedure result:', result);
  
      if (result && result.length > 0 && result[0].p_new_order_id) {
        newOrderId = result[0].p_new_order_id;
      }
  
      // Ensure the newOrderId was captured correctly
      if (!newOrderId) {
        return res.status(500).json({
          message: 'Erreur lors de la création de la commande. Aucune ID de commande retournée.',
        });
      }
  
      res.status(201).json({
        message: 'Commande créée avec succès.',
        newOrderId,
      });
    } catch (error) {
      console.error('Erreur lors de l\'exécution de add_order:', error);
  
      res.status(500).json({
        message: 'Erreur lors de la création de la commande.',
        error: error.message || 'Erreur inconnue.',
        details: error.original || error,
      });
    }
  };

  // Function to fetch transport mode info
const getTransmodeInfo = async (req, res) => {
    try {
      const { idList, isActive } = req.query;
  
      const result = await sequelize.query(
        `SELECT * FROM get_transmode_info(:p_id_list, :p_isactive)`,
        {
          replacements: {
            p_id_list: idList || null,
            p_isactive: isActive === 'true', // Convert string to boolean
          },
          type: sequelize.QueryTypes.SELECT,
        }
      );
  
      res.status(200).json({
        message: 'Informations sur les modes de transport récupérées avec succès.',
        data: result,
      });
    } catch (error) {
      console.error('Erreur lors de la récupération des informations de mode de transport:', error);
      res.status(500).json({
        message: 'Erreur lors de la récupération des informations de mode de transport.',
        error: error.message || 'Erreur inconnue.',
        details: error.original || error,
      });
    }
  };
  
  // Function to fetch unit weight info
  const getUnitWeightInfo = async (req, res) => {
    try {
      const { idList, isActive } = req.query;
  
      const result = await sequelize.query(
        `SELECT * FROM get_unitweight_info(:p_id_list, :p_isactive)`,
        {
          replacements: {
            p_id_list: idList || null,
            p_isactive: isActive === 'true', // Convert string to boolean
          },
          type: sequelize.QueryTypes.SELECT,
        }
      );
  
      res.status(200).json({
        message: 'Informations sur les unités de poids récupérées avec succès.',
        data: result,
      });
    } catch (error) {
      console.error('Erreur lors de la récupération des informations d\'unité de poids:', error);
      res.status(500).json({
        message: 'Erreur lors de la récupération des informations d\'unité de poids.',
        error: error.message || 'Erreur inconnue.',
        details: error.original || error,
      });
    }
  };
  const getRecipientInfo = async (req, res) => {
    try {
      const { idListR, idListCA, isActiveR, isActiveCA, statutFlagR, statutFlagCA } = req.query;
  
      const result = await sequelize.query(
        `SELECT * FROM get_recipient_info(
          :p_id_list_r,
          :p_id_list_ca,
          :p_isactive_r,
          :p_isactive_ca,
          :p_statut_flag_r,
          :p_statut_flag_ca
        )`,
        {
          replacements: {
            p_id_list_r: idListR || null,
            p_id_list_ca: idListCA ? idListCA.toString() : null,
            p_isactive_r: isActiveR !== undefined ? isActiveR === 'true' : null, // Properly handle null
            p_isactive_ca: isActiveCA !== undefined ? isActiveCA === 'true' : null, // Properly handle null
            p_statut_flag_r: statutFlagR || null,
            p_statut_flag_ca: statutFlagCA || null,
          },
          type: sequelize.QueryTypes.SELECT,
        }
      );
  
      res.status(200).json({
        message: 'Informations sur les destinataires récupérées avec succès.',
        data: result,
      });
    } catch (error) {
      console.error('Erreur lors de la récupération des informations de destinataires:', error);
      res.status(500).json({
        message: 'Erreur lors de la récupération des informations de destinataires.',
        error: error.message || 'Erreur inconnue.',
        details: error.original || error,
      });
    }
  };
  const setRecipientAccount = async (req, res) => {
    try {
      const {
        idRecipientAccount,
        idCustAccount,
        recipientName,
        address1,
        address2,
        address3,
        idCity,
        statutFlag,
        activationDate,
        deactivationDate,
        idLoginInsert,
        idLoginModify,
      } = req.body;
  
      // Call the PostgreSQL function and capture the returned ID
      const result = await sequelize.query(
        `SELECT add_or_update_recipient(
            :p_id_recipient_account,
            :p_id_cust_account,
            :p_recipient_name,
            :p_address_1,
            :p_address_2,
            :p_address_3,
            :p_id_city,
            :p_statut_flag,
            :p_activation_date,
            :p_deactivation_date,
            :p_idlogin_insert,
            :p_idlogin_modify
        ) AS new_recipient_id`,
        {
          replacements: {
            p_id_recipient_account: idRecipientAccount || null, // Pass NULL explicitly if needed
            p_id_cust_account: idCustAccount,
            p_recipient_name: recipientName,
            p_address_1: address1,
            p_address_2: address2,
            p_address_3: address3,
            p_id_city: idCity,
            p_statut_flag: statutFlag,
            p_activation_date: activationDate || null,
            p_deactivation_date: deactivationDate || null,
            p_idlogin_insert: idLoginInsert,
            p_idlogin_modify: idLoginModify || null,
          },
          type: QueryTypes.SELECT,
        }
      );
  
      const newRecipientId = result[0]?.new_recipient_id;
  
      if (!newRecipientId) {
        throw new Error('Failed to retrieve the new recipient ID.');
      }
  
      res.status(200).json({
        message: 'Destinataire ajouté ou mis à jour avec succès.',
        newRecipientId, // Return the new recipient ID
      });
    } catch (error) {
      console.error('Erreur lors de l\'ajout ou de la mise à jour du destinataire:', error);
      res.status(500).json({
        message: 'Erreur lors de l\'ajout ou de la mise à jour du destinataire.',
        error: error.message || 'Erreur inconnue.',
        details: error.original || error,
      });
    }
  };

  const addOrUpdateCertifGood = async (req, res) => {
    try {
        const { idOrdCertifGoods, idOrdCertifOri, goodDescription, goodReferences, docReferences, weightQty, idUnitWeight } = req.body;

        // Validate required fields
        if (!idOrdCertifOri || !goodDescription || !goodReferences || !idUnitWeight) {
            return res.status(400).json({
                message: "Les champs idOrdCertifOri, goodDescription, goodReferences et idUnitWeight sont requis.",
            });
        }

        await sequelize.query(
            `CALL set_ordcertif_goods(
                :p_id_ord_certif_goods,
                :p_id_ord_certif_ori,
                :p_good_description,
                :p_good_references,
                :p_doc_references,
                :p_weight_qty,
                :p_id_unit_weight
            )`,
            {
                replacements: {
                    p_id_ord_certif_goods: idOrdCertifGoods || null,
                    p_id_ord_certif_ori: idOrdCertifOri,
                    p_good_description: goodDescription,
                    p_good_references: goodReferences,
                    p_doc_references: docReferences || null,
                    p_weight_qty: weightQty || 0,
                    p_id_unit_weight: idUnitWeight,
                },
            }
        );

        res.status(201).json({
            message: "Marchandise ajoutée ou mise à jour avec succès.",
        });
    } catch (error) {
        console.error("Erreur lors de l'ajout ou la mise à jour de la marchandise:", error);
        res.status(500).json({
            message: "Erreur lors de l'ajout ou la mise à jour de la marchandise.",
            error: error.message || "Erreur inconnue.",
            details: error.original || error,
        });
    }
};

const getCertifGoodsInfo = async (req, res) => {
    try {
        const { idOrdCertifOri } = req.query;

        // Ensure a valid certificate ID is provided
        if (!idOrdCertifOri) {
            return res.status(400).json({
                message: "L'identifiant du certificat d'origine (idOrdCertifOri) est requis.",
            });
        }

        const result = await sequelize.query(
            `SELECT * FROM get_certifgoods_info(:p_id_ord_certif_ori)`,
            {
                replacements: { p_id_ord_certif_ori: idOrdCertifOri },
                type: sequelize.QueryTypes.SELECT,
            }
        );

        res.status(200).json({
            message: "Informations sur les marchandises récupérées avec succès.",
            data: result,
        });
    } catch (error) {
        console.error("Erreur lors de la récupération des marchandises:", error);
        res.status(500).json({
            message: "Erreur lors de la récupération des marchandises.",
            error: error.message || "Erreur inconnue.",
            details: error.original || error,
        });
    }
};

const executeAddCertifOrder = async (req, res) => {
    try {
        const {
            idOrder,
            idRecipientAccount,
            idCountryOrigin,
            idCountryDestination,
            notes,
            copyCount,
            idLoginInsert,
            transportRemarks
        } = req.body;

        // Validate required fields
        if (!idOrder || !idRecipientAccount || !idCountryOrigin || !idCountryDestination || !idLoginInsert) {
            return res.status(400).json({
                message: "Les champs idOrder, idRecipientAccount, idCountryOrigin, idCountryDestination et idLoginInsert sont requis."
            });
        }

        const result = await sequelize.query(
            `SELECT add_certif_wrapper(
                :p_id_order,
                :p_id_recipient_account,
                :p_id_country_origin,
                :p_id_country_destination,
                :p_notes,
                :p_copy_count,
                :p_idlogin_insert,
                :p_transport_remarks
            ) AS new_certif_id`,
            {
                replacements: {
                    p_id_order: idOrder,
                    p_id_recipient_account: idRecipientAccount,
                    p_id_country_origin: idCountryOrigin,
                    p_id_country_destination: idCountryDestination,
                    p_notes: notes || '',
                    p_copy_count: copyCount || 1,
                    p_idlogin_insert: idLoginInsert,
                    p_transport_remarks: transportRemarks || ''
                },
                type: sequelize.QueryTypes.SELECT
            }
        );

        const newCertifId = result[0]?.new_certif_id;

        if (!newCertifId) {
            return res.status(500).json({
                message: "Erreur lors de la création du certificat d'origine. Aucune ID de certificat retournée."
            });
        }

        res.status(201).json({
            message: "Certificat d'origine créé avec succès.",
            newCertifId
        });
    } catch (error) {
        console.error("Erreur lors de la création du certificat d'origine:", error);
        res.status(500).json({
            message: "Erreur lors de la création du certificat d'origine.",
            error: error.message || "Erreur inconnue.",
            details: error.original || error
        });
    }
};

const setOrdCertifGoods = async (req, res) => {
    try {
      const {
        id_ord_certif_goods, // Can be null or 0 for insert
        id_ord_certif_ori,
        good_description,
        good_references,
        doc_references,
        weight_qty,
        id_unit_weight,
      } = req.body;
  
      // Validate required fields
      if (!id_ord_certif_ori || !good_description || !good_references || !weight_qty || !id_unit_weight) {
        return res.status(400).json({ message: 'Missing required fields.' });
      }
  
      // Call the PostgreSQL function and capture the returned ID
      const result = await sequelize.query(
        `SELECT add_or_update_ordcertif_goods(
            :p_id_ord_certif_goods,
            :p_id_ord_certif_ori,
            :p_good_description,
            :p_good_references,
            :p_doc_references,
            :p_weight_qty,
            :p_id_unit_weight
        ) AS new_ord_certif_goods_id`,
        {
          replacements: {
            p_id_ord_certif_goods: id_ord_certif_goods || null, // Pass NULL explicitly if needed
            p_id_ord_certif_ori,
            p_good_description,
            p_good_references,
            p_doc_references: doc_references || null, // Optional
            p_weight_qty,
            p_id_unit_weight,
          },
          type: QueryTypes.SELECT, // Specify the query type
        }
      );
  
      const newOrdCertifGoodsId = result[0]?.new_ord_certif_goods_id;
  
      if (!newOrdCertifGoodsId) {
        throw new Error('Failed to retrieve the new ord_certif_goods ID.');
      }
  
      res.status(200).json({
        message: 'Goods added or updated successfully.',
        newOrdCertifGoodsId, // Return the new ID
      });
    } catch (error) {
      console.error('Error adding or updating goods:', error);
      res.status(500).json({
        message: 'Error adding or updating goods.',
        error: error.message || 'Unknown error.',
        details: error.original || error,
      });
    }
  };

  const getOrdersForCustomer = async (req, res) => {
    try {
        const { idOrderList, idCustAccountList, idOrderStatusList, idLogin } = req.query;

        // Validate input parameters
        if (!idLogin) {
            return res.status(400).json({
                message: 'Le champ idLogin est requis.',
            });
        }

        // Query the database using the stored function
        const result = await sequelize.query(
            `SELECT * FROM get_order_cust_info(
                :p_id_order_list,
                :p_id_cust_account_list,
                :p_id_order_status_list,
                :p_idlogin
            )`,
            {
                replacements: {
                    p_id_order_list: idOrderList || null,
                    p_id_cust_account_list: idCustAccountList || null,
                    p_id_order_status_list: idOrderStatusList || null,
                    p_idlogin: idLogin,
                },
                type: sequelize.QueryTypes.SELECT,
            }
        );

        res.status(200).json({
            message: 'Liste des commandes récupérée avec succès.',
            data: result,
        });
    } catch (error) {
        console.error('Erreur lors de la récupération des commandes:', error);
        res.status(500).json({
            message: 'Erreur lors de la récupération des commandes.',
            error: error.message || 'Erreur inconnue.',
            details: error.original || error,
        });
    }
};
  
module.exports = {
  executeAddOrder,
  getTransmodeInfo,
  getUnitWeightInfo,
  getRecipientInfo,
  setRecipientAccount,
  addOrUpdateCertifGood,
  getCertifGoodsInfo,
  executeAddCertifOrder,
  setOrdCertifGoods,
  getOrdersForCustomer
};