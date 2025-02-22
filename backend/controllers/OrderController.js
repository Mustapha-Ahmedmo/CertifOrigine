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
      console.log("Request body for addOrUpdateCertifGood:", req.body);
  
      const { idOrdCertifGoods, idOrdCertifOri, goodDescription, goodReferences, docReferences, weight_qty, idUnitWeight } = req.body;
  
      // Validate required fields
      if (!idOrdCertifOri || !goodDescription || !goodReferences || !idUnitWeight) {
        console.error("Missing required fields:", { idOrdCertifOri, goodDescription, goodReferences, idUnitWeight });
        return res.status(400).json({
          message: "Les champs idOrdCertifOri, goodDescription, goodReferences et idUnitWeight sont requis.",
        });
      }
  
      const replacements = {
        p_id_ord_certif_goods: idOrdCertifGoods || null,
        p_id_ord_certif_ori: idOrdCertifOri,
        p_good_description: goodDescription,
        p_good_references: goodReferences,
        p_doc_references: docReferences || null,
        p_weight_qty: weight_qty,  // now correctly passes 123
        p_id_unit_weight: idUnitWeight,
      };
  
      console.log("Replacements for set_ordcertif_goods:", replacements);
  
      const result = await sequelize.query(
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
          replacements,
          type: QueryTypes.SELECT,
        }
      );
  
      console.log("Result from set_ordcertif_goods call:", result);
  
      res.status(201).json({
        message: "Marchandise ajoutée ou mise à jour avec succès.",
        result, // Optionally include the result
      });
    } catch (error) {
      console.error("Erreur lors de l'ajout ou de la mise à jour de la marchandise:", error);
      res.status(500).json({
        message: "Erreur lors de l'ajout ou de la mise à jour de la marchandise.",
        error: error.message || "Erreur inconnue.",
        details: error.original || error,
      });
    }
  };


const getCertifGoodsInfo = async (req, res) => {
    try {
        const {
            idOrdCertifOri, // Certificate ID
            idOrdCertifGoods = null, // Goods ID (optional)
            isActiveOG = "true", // Active status of goods (optional)
            isActiveUW = null, // Active status of unit weight (optional)
            idOrder = null, // Order ID (optional)
            idCustAccount = null, // Customer Account ID (optional)
            idOrderStatus = null // Order Status ID (optional)
        } = req.query;

        // Ensure a valid certificate ID is provided
        if (!idOrdCertifOri) {
            return res.status(400).json({
                message: "L'identifiant du certificat d'origine (idOrdCertifOri) est requis.",
            });
        }

        // Call the stored function with all required parameters
        const result = await sequelize.query(
            `SELECT * FROM get_certifgoods_info(
                :p_id_listCG,
                :p_id_listCO,
                :p_isactiveOG,
                :p_isactiveUW,
                :p_id_list_order,
                :p_id_custaccount,
                :p_id_list_orderstatus
            )`,
            {
                replacements: {
                    p_id_listCG: idOrdCertifGoods || null, // List of goods IDs (or NULL)
                    p_id_listCO: idOrdCertifOri, // List of certif IDs (mandatory)
                    p_isactiveOG: isActiveOG === "true" ? true : isActiveOG === "false" ? false : null,
                    p_isactiveUW: isActiveUW === "true" ? true : isActiveUW === "false" ? false : null,
                    p_id_list_order: idOrder || null, // Order ID (or NULL)
                    p_id_custaccount: idCustAccount || null, // Customer Account ID (or NULL)
                    p_id_list_orderstatus: idOrderStatus || null // Order Status ID (or NULL)
                },
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
      transportRemarks,
      idCountryPortLoading,     // New: Port loading country ID
      idCountryPortDischarge    // New: Port discharge country ID
    } = req.body;

    // Validate required fields including the new ports
    if (
      !idOrder ||
      !idRecipientAccount ||
      !idCountryOrigin ||
      !idCountryDestination ||
      !idLoginInsert ||
      !idCountryPortLoading ||
      !idCountryPortDischarge
    ) {
      return res.status(400).json({
        message:
          "Les champs idOrder, idRecipientAccount, idCountryOrigin, idCountryDestination, idLoginInsert, idCountryPortLoading et idCountryPortDischarge sont requis."
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
                :p_transport_remarks,
                :p_id_country_port_loading,
                :p_id_country_port_discharge
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
          p_transport_remarks: transportRemarks || '',
          p_id_country_port_loading: idCountryPortLoading,
          p_id_country_port_discharge: idCountryPortDischarge,
        },
        type: sequelize.QueryTypes.SELECT,
      }
    );

    const newCertifId = result[0]?.new_certif_id;

    if (!newCertifId) {
      return res.status(500).json({
        message:
          "Erreur lors de la création du certificat d'origine. Aucune ID de certificat retournée."
      });
    }

    res.status(201).json({
      message: "Certificat d'origine créé avec succès.",
      newCertifId,
    });
  } catch (error) {
    console.error("Erreur lors de la création du certificat d'origine:", error);
    res.status(500).json({
      message: "Erreur lors de la création du certificat d'origine.",
      error: error.message || "Erreur inconnue.",
      details: error.original || error,
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
            p_id_ord_certif_goods: id_ord_certif_goods || null, // null for insertion
            p_id_ord_certif_ori: id_ord_certif_ori,              // certificate ID
            p_good_description: good_description,
            p_good_references: good_references,
            p_doc_references: doc_references || null,
            p_weight_qty: parseFloat(weight_qty), // Make sure it's a number
            p_id_unit_weight: id_unit_weight,
          },
          type: sequelize.QueryTypes.SELECT,
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
  
const getCertifTranspMode = async (req, res) => {
    try {
      // Destructure query parameters
      let {
        idListCT,
        idListCO,
        isActiveOT,
        isActiveTM,
        idListOrder,
        idCustAccount,
        idListOrderStatus
      } = req.query;
  
      // Convert parameters: if a parameter is missing or equals the string "null", set it to null.
      idListCT = (idListCT === "null" || !idListCT) ? null : idListCT;
      idListCO = (idListCO === "null" || !idListCO) ? null : idListCO;
      idListOrder = (idListOrder === "null" || !idListOrder) ? null : idListOrder;
      idListOrderStatus = (idListOrderStatus === "null" || !idListOrderStatus) ? null : idListOrderStatus;
      idCustAccount = idCustAccount ? parseInt(idCustAccount, 10) : null;
  
      // Convert boolean strings to actual booleans
      const activeOT = (isActiveOT === 'true' ? true : isActiveOT === 'false' ? false : null);
      const activeTM = (isActiveTM === 'true' ? true : isActiveTM === 'false' ? false : null);
  
      // Execute the stored function
      const result = await sequelize.query(
        `SELECT * FROM get_certiftransp_mode(
            :p_id_listCT,
            :p_id_listCO,
            :p_isactiveOT,
            :p_isactiveTM,
            :p_id_list_order,
            :p_id_custaccount,
            :p_id_list_orderstatus
        )`,
        {
          replacements: {
            p_id_listCT: idListCT,
            p_id_listCO: idListCO,
            p_isactiveOT: activeOT,
            p_isactiveTM: activeTM,
            p_id_list_order: idListOrder,
            p_id_custaccount: idCustAccount,
            p_id_list_orderstatus: idListOrderStatus,
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
  
  const setOrdCertifTranspMode = async (req, res) => {
    try {
      const { id_ord_certif_transp_mode, id_ord_certif_ori, id_transport_mode } = req.body;
  
      // Validate required fields
      if (!id_ord_certif_ori || !id_transport_mode) {
        return res.status(400).json({
          message: "Les champs id_ord_certif_ori et id_transport_mode sont requis.",
        });
      }
  
      // Call the stored procedure using CALL.
      // Note: The procedure uses an INOUT parameter for p_id_ord_certif_transp_mode.
      // Sequelize does not automatically return the updated INOUT value,
      // so we log the result and return a success message.
      const result = await sequelize.query(
        `CALL add_ordcertif_transpmode(
           :p_id_ord_certif_transp_mode,
           :p_id_ord_certif_ori,
           :p_id_transport_mode
         )`,
        {
          replacements: {
            p_id_ord_certif_transp_mode: id_ord_certif_transp_mode || null, // Pass null if not provided
            p_id_ord_certif_ori: id_ord_certif_ori,
            p_id_transport_mode: id_transport_mode,
          },
          type: QueryTypes.RAW,
        }
      );
  
      console.log('Procedure result:', result);
  
      // Return success. In a production system, you might want to query the row
      // (or use a wrapper function) to fetch the updated INOUT parameter.
      return res.status(200).json({
        message: 'Ordre certif transport mode ajouté ou mis à jour avec succès.',
        // Optionally, include additional details if needed.
      });
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'ordre certif transport mode:', error);
      return res.status(500).json({
        message: 'Erreur lors de la mise à jour de l\'ordre certif transport mode.',
        error: error.message || 'Erreur inconnue.',
        details: error.original || error,
      });
    }
  };

  const cancelOrder = async (req, res) => {
    try {
      const { p_id_order, p_idlogin_modify } = req.body;
      if (!p_id_order || !p_idlogin_modify) {
        return res.status(400).json({
          message: 'Les champs p_id_order et p_idlogin_modify sont requis.',
        });
      }
      await sequelize.query(
        `CALL cancel_order(:p_id_order, :p_idlogin_modify)`,
        {
          replacements: {
            p_id_order,
            p_idlogin_modify,
          },
          type: QueryTypes.RAW,
        }
      );
      res.status(200).json({ message: 'La commande a été annulée avec succès.' });
    } catch (error) {
      console.error('Erreur lors de l\'annulation de la commande:', error);
      res.status(500).json({
        message: 'Erreur lors de l\'annulation de la commande.',
        error: error.message || 'Erreur inconnue.',
        details: error.original || error,
      });
    }
  };

  const renameOrder = async (req, res) => {
    try {
      const { p_id_order, p_order_title, p_idlogin_modify } = req.body;
      
      // Validate input parameters
      if (!p_id_order || !p_order_title || !p_idlogin_modify) {
        return res.status(400).json({
          message: 'Les champs p_id_order, p_order_title et p_idlogin_modify sont requis.',
        });
      }
  
      // Log the input values
      console.log("Renaming order with:", { p_id_order, p_order_title, p_idlogin_modify });
  
      // Execute the stored procedure
      const result = await sequelize.query(
        `CALL rename_order(:p_id_order, :p_order_title, :p_idlogin_modify)`,
        {
          replacements: { p_id_order, p_order_title, p_idlogin_modify },
          type: QueryTypes.RAW,
        }
      );
  
      // Log the procedure result (Sequelize may return an empty array for CALL statements)
      console.log("Procedure rename_order result:", result);
  
      res.status(200).json({
        message: 'Commande renommée avec succès.',
      });
    } catch (error) {
      console.error('Erreur lors du renommage de la commande:', error);
      res.status(500).json({
        message: 'Erreur lors du renommage de la commande.',
        error: error.message || 'Erreur inconnue.',
        details: error.original || error,
      });
    }
  };const updateCertif = async (req, res) => {
    try {
      console.log("Received request body:", req.body); // Debug: Log the entire body
  
      const {
        p_id_ord_certif_ori,
        p_id_recipient_account,
        p_id_country_origin,
        p_id_country_destination,
        p_id_country_port_loading,
        p_id_country_port_discharge,
        p_notes,
        p_copy_count,
        p_idlogin_modify,
        p_transport_remains,
      } = req.body;
  
      // Validate required fields (adjust the validation as needed)
      if (
        !p_id_ord_certif_ori ||
        !p_id_recipient_account ||
        !p_id_country_origin ||
        !p_id_country_destination ||
        !p_id_country_port_loading ||
        !p_id_country_port_discharge ||
        !p_idlogin_modify
      ) {
        return res.status(400).json({
          message: 'Certains champs requis sont manquants pour la mise à jour du certificat.',
        });
      }
  
      // Optionally, convert values to integers if needed:
      const certifIdInt = parseInt(p_id_ord_certif_ori, 10);
      const recipientIdInt = parseInt(p_id_recipient_account, 10);
      const originIdInt = parseInt(p_id_country_origin, 10);
      const destinationIdInt = parseInt(p_id_country_destination, 10);
      const portLoadingInt = parseInt(p_id_country_port_loading, 10);
      const portDischargeInt = parseInt(p_id_country_port_discharge, 10);
      const copyCountInt = parseInt(p_copy_count, 10) || 1;
  
      // Call the stored procedure
      await sequelize.query(
        `CALL upd_certif(
            :p_id_ord_certif_ori,
            :p_id_recipient_account,
            :p_id_country_origin,
            :p_id_country_destination,
            :p_id_country_port_loading,
            :p_id_country_port_discharge,
            :p_notes,
            :p_copy_count,
            :p_idlogin_modify,
            :p_transport_remains
        )`,
        {
          replacements: {
            p_id_ord_certif_ori: certifIdInt,
            p_id_recipient_account: recipientIdInt,
            p_id_country_origin: originIdInt,
            p_id_country_destination: destinationIdInt,
            p_id_country_port_loading: portLoadingInt,
            p_id_country_port_discharge: portDischargeInt,
            p_notes: p_notes || '',
            p_copy_count: copyCountInt,
            p_idlogin_modify,
            p_transport_remains: p_transport_remains || '',
          },
          type: QueryTypes.RAW,
        }
      );
  
      res.status(200).json({
        message: 'Certificat mis à jour avec succès.',
      });
    } catch (error) {
      console.error('Erreur lors de la mise à jour du certificat:', error);
      res.status(500).json({
        message: 'Erreur lors de la mise à jour du certificat.',
        error: error.message || 'Erreur inconnue.',
        details: error.original || error,
      });
    }
  };

  const getFilesRepoTypeofInfo = async (req, res) => {
    try {
      const {
        p_id_files_repo_typeof_list,
        p_id_files_repo_typeof_first,
        p_id_files_repo_typeof_last,
        p_ismandatory
      } = req.query;
  
      // Convert string "null" to actual null:
      const repoTypeList = (p_id_files_repo_typeof_list && p_id_files_repo_typeof_list.toLowerCase() !== "null")
        ? p_id_files_repo_typeof_list
        : null;
      const repoTypeFirst = (p_id_files_repo_typeof_first && p_id_files_repo_typeof_first.toLowerCase() !== "null")
        ? parseInt(p_id_files_repo_typeof_first, 10)
        : null;
      const repoTypeLast = (p_id_files_repo_typeof_last && p_id_files_repo_typeof_last.toLowerCase() !== "null")
        ? parseInt(p_id_files_repo_typeof_last, 10)
        : null;
      // p_ismandatory should be a boolean, so check similarly:
      const isMandatory = (p_ismandatory && p_ismandatory.toLowerCase() !== "null")
        ? (p_ismandatory === "true")
        : null;
  
      const result = await sequelize.query(
        `SELECT * FROM get_files_repo_typeof_info(
              :p_id_files_repo_typeof_list,
              :p_id_files_repo_typeof_first,
              :p_id_files_repo_typeof_last,
              :p_ismandatory
          )`,
        {
          replacements: {
            p_id_files_repo_typeof_list: repoTypeList,
            p_id_files_repo_typeof_first: repoTypeFirst,
            p_id_files_repo_typeof_last: repoTypeLast,
            p_ismandatory: isMandatory,
          },
          type: QueryTypes.SELECT,
        }
      );
  
      res.status(200).json({
        message: 'File repository types retrieved successfully.',
        data: result,
      });
    } catch (error) {
      console.error('Error retrieving file repo types:', error);
      res.status(500).json({
        message: 'Error retrieving file repository types.',
        error: error.message || 'Unknown error.',
        details: error.original || error,
      });
    }
  };
  const setOrderFiles = async (req, res) => {
    try {
      // Debug: log the request body so we can see if p_id_order and others are present.
      console.log("Request body in setOrderFiles:", req.body);
  
      const {
        p_id_order,
        p_idfiles_repo_typeof,
        p_file_origin_name,
        p_typeof_order,
        p_idlogin_insert
      } = req.body;
  
      // Extract file details from req.file (populated by multer)
      const p_file_guid = req.file ? req.file.filename : null;
      const p_file_path = req.file ? req.file.path : null;
      // Validate that p_id_order exists.
      if (!p_id_order) {
        return res.status(400).json({ message: "Le champ p_id_order est requis." });
      }
  
      // Call the stored procedure.
      await sequelize.query(
        `CALL set_order_files(
          :p_id_order,
          :p_idfiles_repo_typeof,
          :p_file_origin_name,
          :p_file_guid,
          :p_file_path,
          :p_typeof_order,
          :p_idlogin_insert,
          null
        )`,
        {
          replacements: {
            p_id_order: p_id_order, // Ensure this key is set
            p_idfiles_repo_typeof,  // shorthand for p_idfiles_repo_typeof: p_idfiles_repo_typeof
            p_file_origin_name,     // same here
            p_file_guid,
            p_file_path,
            p_typeof_order,
            p_idlogin_insert
          },
          type: QueryTypes.RAW,
        }
      );
  
      res.status(200).json({ message: 'Fichier ajouté/mis à jour avec succès.' });
    } catch (error) {
      console.error("Erreur dans setOrderFiles:", error);
      res.status(500).json({
        message: "Erreur lors de l'ajout/mise à jour du fichier de commande.",
        error: error.message || "Erreur inconnue.",
        details: error.original || error,
      });
    }
  };
  

  const delOrderFiles = async (req, res) => {
    try {
      const { p_id_order_files } = req.body;
      if (!p_id_order_files) {
        return res.status(400).json({
          message: "L'ID du fichier de commande est requis pour la suppression."
        });
      }
  
      await sequelize.query(
        `CALL del_order_files(:p_id_order_files)`,
        {
          replacements: { p_id_order_files },
          type: QueryTypes.RAW,
        }
      );
  
      res.status(200).json({
        message: "Fichier de commande supprimé avec succès."
      });
    } catch (error) {
      console.error("Erreur lors de la suppression du fichier de commande:", error);
      res.status(500).json({
        message: "Erreur lors de la suppression du fichier de commande.",
        error: error.message || "Erreur inconnue.",
        details: error.original || error,
      });
    }
  };

  const getOrderFilesInfoController = async (req, res) => {
    try {
      // Extract parameters from query string (or adjust to where you get them)
      const {
        p_id_order_files_list,
        p_id_order_list,
        p_id_files_repo_list,
        p_id_files_repo_typeof_list,
        p_isactive,
        p_id_custaccount,
        p_id_list_orderstatus,
      } = req.query;
  
      // Prepare replacements for the SQL query.
      // For Boolean and numeric parameters, we convert the values as needed.
      const replacements = {
        p_id_order_files_list: p_id_order_files_list || null,
        p_id_order_list: p_id_order_list || null,
        p_id_files_repo_list: p_id_files_repo_list || null,
        p_id_files_repo_typeof_list: p_id_files_repo_typeof_list || null,
        p_isactive: typeof p_isactive !== 'undefined' ? (p_isactive.toLowerCase() === 'true') : null,
        p_id_custaccount: p_id_custaccount ? parseInt(p_id_custaccount, 10) : null,
        p_id_list_orderstatus: p_id_list_orderstatus || null,
      };
  
      // Execute the SQL query that calls your stored function
      const filesInfo = await sequelize.query(
        `SELECT * FROM get_order_files_info(
            :p_id_order_files_list,
            :p_id_order_list,
            :p_id_files_repo_list,
            :p_id_files_repo_typeof_list,
            :p_isactive,
            :p_id_custaccount,
            :p_id_list_orderstatus
        )`,
        {
          replacements,
          type: QueryTypes.SELECT,
        }
      );
  
      // Return the result as JSON
      res.status(200).json(filesInfo);
    } catch (error) {
      console.error('Error retrieving order files info:', error);
      res.status(500).json({
        message: 'Failed to retrieve order files info',
        error: error.message,
      });
    }
  };
  


  const getOrderOpInfoController = async (req, res) => {
    try {
      // Extract parameters from query
      let { p_id_order_list, p_id_custaccount_list, p_id_orderstatus_list, p_idlogin } = req.query;
  
      // Convert p_idlogin to an integer if provided; otherwise, return an error.
      if (!p_idlogin) {
        return res.status(400).json({
          message: "Le paramètre p_idlogin est requis."
        });
      }
      p_idlogin = parseInt(p_idlogin, 10);
  
      // If the parameters are provided as the string "null" or are missing, set them to null.
      p_id_order_list = (!p_id_order_list || p_id_order_list === 'null') ? null : p_id_order_list;
      p_id_custaccount_list = (!p_id_custaccount_list || p_id_custaccount_list === 'null') ? null : p_id_custaccount_list;
      p_id_orderstatus_list = (!p_id_orderstatus_list || p_id_orderstatus_list === 'null') ? null : p_id_orderstatus_list;
  
      // Execute the stored function via a SELECT query.
      const orders = await sequelize.query(
        `SELECT * FROM get_order_op_info(
            :p_id_order_list,
            :p_id_custaccount_list,
            :p_id_orderstatus_list,
            :p_idlogin
        )`,
        {
          replacements: {
            p_id_order_list,
            p_id_custaccount_list,
            p_id_orderstatus_list,
            p_idlogin,
          },
          type: QueryTypes.SELECT,
        }
      );
  
      res.status(200).json({
        message: 'Orders retrieved successfully.',
        data: orders,
      });
    } catch (error) {
      console.error('Error retrieving operator orders:', error);
      res.status(500).json({
        message: 'Error retrieving orders for operator.',
        error: error.message || 'Unknown error.',
        details: error.original || error,
      });
    }
  };

  const setUnitWeight = async (req, res) => {
    try {
      const { id_unit_weight, symbol_fr, symbol_eng } = req.body;
  
      // If id_unit_weight is not provided or zero, the procedure will insert a new record.
      await sequelize.query(
        `CALL set_unitweight(:p_id_unit_weight, :p_symbol_fr, :p_symbol_eng)`,
        {
          replacements: {
            p_id_unit_weight: id_unit_weight || 0, // 0 triggers an insert in your procedure
            p_symbol_fr: symbol_fr,
            p_symbol_eng: symbol_eng,
          },
          type: QueryTypes.RAW,
        }
      );
  
      res.status(200).json({
        message: "Unité de poids ajoutée/maj avec succès."
      });
    } catch (error) {
      console.error('Erreur dans setUnitWeight:', error);
      res.status(500).json({
        message: "Erreur lors de l'ajout ou de la mise à jour de l'unité de poids.",
        error: error.message || "Erreur inconnue."
      });
    }
  };

  const deleteUnitWeight = async (req, res) => {
    try {
      const { id_unit_weight } = req.body;
      if (!id_unit_weight) {
        return res.status(400).json({
          message: "L'id de l'unité de poids est requis pour la suppression."
        });
      }
  
      await sequelize.query(
        `CALL del_unitweight(:p_id_unit_weight)`,
        {
          replacements: {
            p_id_unit_weight: id_unit_weight,
          },
          type: QueryTypes.RAW,
        }
      );
  
      res.status(200).json({
        message: "Unité de poids désactivée (supprimée) avec succès."
      });
    } catch (error) {
      console.error('Erreur dans deleteUnitWeight:', error);
      res.status(500).json({
        message: "Erreur lors de la suppression de l'unité de poids.",
        error: error.message || "Erreur inconnue."
      });
    }
  };
  
  const submitOrder = async (req, res) => {
    try {
      const { p_id_order, p_idlogin_modify } = req.body;
  
      // Validate input parameters
      if (!p_id_order || !p_idlogin_modify) {
        return res.status(400).json({
          message: 'Les champs p_id_order et p_idlogin_modify sont requis.',
        });
      }
  
      // Call the stored procedure submit_order
      await sequelize.query(
        `CALL submit_order(:p_id_order, :p_idlogin_modify)`,
        {
          replacements: { p_id_order, p_idlogin_modify },
          type: QueryTypes.RAW,
        }
      );
  
      res.status(200).json({
        message: 'Commande soumise avec succès.',
      });
    } catch (error) {
      console.error('Erreur lors de la soumission de la commande:', error);
      res.status(500).json({
        message: 'Erreur lors de la soumission de la commande.',
        error: error.message || 'Erreur inconnue.',
        details: error.original || error,
      });
    }
  };

  const remOrdCertifGoods = async (req, res) => {
    try {
      const { p_id_ord_certif_goods, p_idlogin_modify, p_mode } = req.body;
      if (!p_id_ord_certif_goods || !p_idlogin_modify) {
        return res.status(400).json({
          message: 'Les champs p_id_ord_certif_goods et p_idlogin_modify sont requis.',
        });
      }
      await sequelize.query(
        `CALL rem_ordcertif_goods(:p_id_ord_certif_goods, :p_idlogin_modify, :p_mode)`,
        {
          replacements: {
            p_id_ord_certif_goods,
            p_idlogin_modify,
            p_mode: p_mode || 0,
          },
          type: QueryTypes.RAW,
        }
      );
      res.status(200).json({ message: 'Merchandise supprimée avec succès.' });
    } catch (error) {
      console.error('Erreur lors de la suppression de ord_certif_goods:', error);
      res.status(500).json({
        message: 'Erreur lors de la suppression de la marchandise.',
        error: error.message || 'Erreur inconnue.',
        details: error.original || error,
      });
    }
  };

  const remOrdCertifTranspMode = async (req, res) => {
    try {
      const { p_id_ord_certif_ori, p_idlogin_modify } = req.body;
      if (!p_id_ord_certif_ori || !p_idlogin_modify) {
        return res.status(400).json({
          message: 'Les champs p_id_ord_certif_ori et p_idlogin_modify sont requis.',
        });
      }
  
      await sequelize.query(
        `CALL rem_ordcertif_transpmode(:p_id_ord_certif_ori, :p_idlogin_modify)`,
        {
          replacements: { p_id_ord_certif_ori, p_idlogin_modify },
          type: QueryTypes.RAW,
        }
      );
  
      res.status(200).json({ message: 'Mode de transport supprimé avec succès.' });
    } catch (error) {
      console.error('Erreur lors de la suppression du mode de transport:', error);
      res.status(500).json({
        message: 'Erreur lors de la suppression du mode de transport.',
        error: error.message || 'Erreur inconnue.',
        details: error.original || error,
      });
    }
  };

  const remSingleOrdCertifTranspMode = async (req, res) => {
    try {
      const { p_id_ord_certif_ori, p_id_transport_mode, p_idlogin_modify } = req.body;
      if (!p_id_ord_certif_ori || !p_id_transport_mode || !p_idlogin_modify) {
        return res.status(400).json({
          message: 'Les champs p_id_ord_certif_ori, p_id_transport_mode et p_idlogin_modify sont requis.',
        });
      }
      
      await sequelize.query(
        `CALL rem_single_ordcertif_transpmode(:p_id_ord_certif_ori, :p_id_transport_mode, :p_idlogin_modify)`,
        {
          replacements: { 
            p_id_ord_certif_ori, 
            p_id_transport_mode, 
            p_idlogin_modify 
          },
          type: QueryTypes.RAW,
        }
      );
  
      res.status(200).json({
        message: 'Le mode de transport a été supprimé avec succès.',
      });
    } catch (error) {
      console.error('Erreur lors de la suppression du mode de transport:', error);
      res.status(500).json({
        message: 'Erreur lors de la suppression du mode de transport.',
        error: error.message || 'Erreur inconnue.',
        details: error.original || error,
      });
    }
  };

  const delFilesRepo = async (req, res) => {
    try {
      const { p_id_files_repo, p_mode } = req.body;
      if (!p_id_files_repo) {
        return res.status(400).json({ message: "L'ID du fichier est requis." });
      }
      await sequelize.query(
        `CALL del_files_repo(:p_id_files_repo, :p_mode)`,
        {
          replacements: { 
            p_id_files_repo, 
            p_mode: p_mode || 0  // default to 0 if not provided
          },
          type: QueryTypes.RAW,
        }
      );
      res.status(200).json({ message: "Fichier supprimé avec succès." });
    } catch (error) {
      console.error("Erreur lors de la suppression du fichier:", error);
      res.status(500).json({
        message: "Erreur lors de la suppression du fichier.",
        error: error.message || "Erreur inconnue.",
        details: error.original || error,
      });
    }
  };
  
  const approveOrder = async (req, res) => {
    try {
      const { p_id_order, p_idlogin_modify } = req.body;
  
      // Validate input parameters
      if (!p_id_order || !p_idlogin_modify) {
        return res.status(400).json({
          message: 'Les champs p_id_order et p_idlogin_modify sont requis.'
        });
      }
  
      // Call the stored procedure "approve_order"
      await sequelize.query(
        `CALL approve_order(:p_id_order, :p_idlogin_modify)`,
        {
          replacements: { p_id_order, p_idlogin_modify },
          type: QueryTypes.RAW,
        }
      );
  
      res.status(200).json({ message: 'Commande approuvée avec succès.' });
    } catch (error) {
      console.error('Erreur lors de l\'approbation de la commande:', error);
      res.status(500).json({
        message: 'Erreur lors de l\'approbation de la commande.',
        error: error.message || 'Erreur inconnue.',
        details: error.original || error,
      });
    }
  };

  const sendbackOrder = async (req, res) => {
    try {
      const { p_id_order, p_idlogin_modify } = req.body;
      
      // Validate input parameters
      if (!p_id_order || !p_idlogin_modify) {
        return res.status(400).json({
          message: 'Les champs p_id_order et p_idlogin_modify sont requis.'
        });
      }
      
      // Call the stored procedure "sendback_order"
      await sequelize.query(
        `CALL sendback_order(:p_id_order, :p_idlogin_modify)`,
        {
          replacements: { p_id_order, p_idlogin_modify },
          type: QueryTypes.RAW,
        }
      );
      
      res.status(200).json({ message: 'Commande retournée avec succès.' });
    } catch (error) {
      console.error("Erreur lors du retour de la commande:", error);
      res.status(500).json({
        message: "Erreur lors du retour de la commande.",
        error: error.message || "Erreur inconnue.",
        details: error.original || error,
      });
    }
  };
  
  const rejectOrder = async (req, res) => {
    try {
      const { p_id_order, p_idlogin_modify } = req.body;
      if (!p_id_order || !p_idlogin_modify) {
        return res.status(400).json({
          message: 'Les champs p_id_order et p_idlogin_modify sont requis.'
        });
      }
  
      // Call the stored procedure "reject_order"
      await sequelize.query(
        `CALL reject_order(:p_id_order, :p_idlogin_modify)`,
        {
          replacements: { p_id_order, p_idlogin_modify },
          type: QueryTypes.RAW,
        }
      );
  
      res.status(200).json({ message: 'Commande rejetée avec succès.' });
    } catch (error) {
      console.error('Erreur lors du rejet de la commande:', error);
      res.status(500).json({
        message: 'Erreur lors du rejet de la commande.',
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
  getOrdersForCustomer,
  getCertifTranspMode,
  setOrdCertifTranspMode,
  cancelOrder,
  renameOrder,
  updateCertif,
  getFilesRepoTypeofInfo,
  setOrderFiles,  // NEW export
  delOrderFiles ,
  getOrderFilesInfoController,
  getOrderOpInfoController,
  setUnitWeight,
  deleteUnitWeight,
  submitOrder,
  remOrdCertifGoods,
  remOrdCertifTranspMode,
  remSingleOrdCertifTranspMode,
  delFilesRepo,
  approveOrder,
  sendbackOrder,
  rejectOrder
};