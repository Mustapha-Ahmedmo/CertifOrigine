const sequelize = require('../config/db'); // Correctly import sequelize
const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransport({
  host: 'mail.gandi.net',
  port: 587,
  secure: false, // TLS requires secure to be false
  auth: {
    user: 'myfolioreport@maesys.fr', // SMTP username
    pass: 'MyFolioReport@123', // SMTP password
  },
  tls: {
    rejectUnauthorized: false, // Avoid issues with self-signed certificates
  },
});

const sendEmail = async (to, subject, text) => {
  try {
    await transporter.sendMail({
      from: '"Chambre de commerce de Djibouti" <myfolioreport@maesys.fr>', // L'expéditeur
      to, // Le destinataire
      subject, // Sujet
      text, // Corps du message
    });
    console.log(`Email envoyé à ${to}`);
  } catch (error) {
    console.error(`Erreur lors de l'envoi de l'email à ${to}:`, error);
  }
};

// Controller to handle set_cust_account
const executeSetCustAccount = async (req, res) => {
  try {
    const {
      legal_form,
      cust_name,
      trade_registration_num,
      in_free_zone,
      identification_number,
      register_number,
      full_address,
      id_sector,
      other_sector,
      id_country,
      statut_flag,
      idlogin,
      billed_cust_name,
      bill_full_address,
      id_cust_account,
    } = req.body;

    // Debugging: Log the incoming data
    console.log('Received set_cust_account data:', req.body);

    // Execute the stored procedure
    const result = await sequelize.query(
      `CALL set_cust_account(
        :legal_form, 
        :cust_name, 
        :trade_registration_num, 
        :in_free_zone, 
        :identification_number, 
        :register_number, 
        :full_address, 
        :id_sector, 
        :other_sector, 
        :id_country, 
        :statut_flag, 
        :idlogin, 
        :billed_cust_name, 
        :bill_full_address, 
        :id_cust_account
      )`,
      {
        replacements: {
          legal_form,
          cust_name,
          trade_registration_num,
          in_free_zone,
          identification_number,
          register_number,
          full_address,
          id_sector,
          other_sector,
          id_country,
          statut_flag,
          idlogin,
          billed_cust_name,
          bill_full_address,
          id_cust_account,
        },
        type: sequelize.QueryTypes.RAW, // Specify the query type
      }
    );

    // Debugging: Log the result
    console.log('set_cust_account result:', result);

    res.status(200).json({
      message: 'Customer account processed successfully',
      result,
    });
  } catch (error) {
    console.error('Error executing set_cust_account:', error);
    res.status(500).json({
      message: 'Error executing set_cust_account',
      error: error.message || 'Unknown error occurred',
      details: error.original || error, // Log the original Sequelize error
    });
  }
};

const executeSetCustUser = async (req, res) => {
  try {
    const {
      id_cust_user,
      id_cust_account,
      gender,
      full_name,
      ismain_user,
      email,
      password,
      phone_number,
      mobile_number,
      idlogin,
      position,
    } = req.body;

    // Debugging: Log the incoming data
    console.log('Received set_cust_user data:', req.body);

    // Execute the stored procedure
    const result = await sequelize.query(
      `CALL set_cust_user(
        :id_cust_user, 
        :id_cust_account, 
        :gender, 
        :full_name, 
        :ismain_user, 
        :email, 
        :password, 
        :phone_number, 
        :mobile_number, 
        :idlogin, 
        :position
      )`,
      {
        replacements: {
          id_cust_user,
          id_cust_account,
          gender,
          full_name,
          ismain_user,
          email,
          password,
          phone_number,
          mobile_number,
          idlogin,
          position,
        },
        type: sequelize.QueryTypes.RAW, // Specify the query type
      }
    );

    // Debugging: Log the result
    console.log('set_cust_user result:', result);

    await sendEmail(
      email,
      'Votre compte est en attente de validation',
      `Bonjour ${full_name},\n\nVotre compte est en attente de validation par un opérateur.\n\nCordialement,\nL'équipe.`
    );

    res.status(200).json({
      message: 'Customer user processed successfully',
      result,
    });
  } catch (error) {
    console.error('Error executing set_cust_user:', error);
    res.status(500).json({
      message: 'Error executing set_cust_user',
      error: error.message || 'Unknown error occurred',
      details: error.original || error, // Log the original Sequelize error
    });
  }
};

const executeGetCustAccountInfo = async (req, res) => {
  try {
    const { id_list, statutflag, isactive } = req.query;

    // Debugging: Log the incoming parameters
    console.log('Received get_custaccount_info parameters:', { id_list, statutflag, isactive });

    // Execute the get_custaccount_info function to retrieve customer accounts
    const accounts = await sequelize.query(
      `SELECT * FROM get_custaccount_info(:id_list, :statutflag, :isactive)`,
      {
        replacements: {
          id_list: id_list || null,
          statutflag: statutflag !== undefined ? parseInt(statutflag, 10) : null,
          isactive: isactive !== undefined ? (isactive === 'true' || isactive === '1') : null,
        },
        type: sequelize.QueryTypes.SELECT,
      }
    );

    // Debugging: Log the accounts retrieved
    console.log('get_custaccount_info result:', accounts);

    if (accounts.length === 0) {
      return res.status(200).json({
        message: 'No customer accounts found.',
        data: [],
      });
    }

    // Extract the list of customer account IDs
    const accountIds = accounts.map(account => account.id_cust_account).join(',');

    console.log('Extracted account IDs for main contacts and files:', accountIds);

    // Execute the get_custuser_info function to retrieve main contacts for the accounts
    const mainContacts = await sequelize.query(
      `SELECT * FROM get_custuser_info(
        :id_listCA, 
        :statutflag, 
        :isactiveCA, 
        :isactiveCU, 
        :id_listCU, 
        :ismain_user
      )`,
      {
        replacements: {
          id_listCA: accountIds || null,
          statutflag: statutflag !== undefined ? parseInt(statutflag, 10) : null,
          isactiveCA: true,
          isactiveCU: true,
          id_listCU: null,
          ismain_user: true,
        },
        type: sequelize.QueryTypes.SELECT,
      }
    );

    // Debugging: Log the main contacts retrieved
    console.log('get_custuser_info result (main contacts):', mainContacts);

    // Execute the get_cust_account_files function to retrieve files for the accounts
    const files = await sequelize.query(
      `SELECT * FROM get_cust_account_files(
        NULL,
        :id_listCA,
        NULL,
        NULL,
        1,
        449,
        :isactive
      )`,
      {
        replacements: {
          id_listCA: accountIds || null,
          isactive: isactive !== undefined ? (isactive === 'true' || isactive === '1') : null,
        },
        type: sequelize.QueryTypes.SELECT,
      }
    );

    // Debugging: Log the files retrieved
    console.log('get_cust_account_files result:', files);

    // Create mappings for main contacts and files
    const contactMap = {};
    mainContacts.forEach(contact => {
      contactMap[contact.id_cust_account] = contact;
    });

    const fileMap = {};
    files.forEach(file => {
      if (!fileMap[file.id_cust_account]) {
        fileMap[file.id_cust_account] = [];
      }
      fileMap[file.id_cust_account].push(file);
    });

    console.log('Contact Map:', contactMap);
    console.log('File Map:', fileMap);

    // Enrich each account with its main contact and files
    const enrichedAccounts = accounts.map(account => ({
      ...account,
      main_contact: contactMap[account.id_cust_account] || null, // Add null if no main contact found
      files: fileMap[account.id_cust_account] || [], // Add empty array if no files found
    }));

    console.log('Enriched Accounts:', enrichedAccounts);

    // Send the enriched data in the response
    res.status(200).json({
      message: 'Customer account information with main contacts and files retrieved successfully',
      data: enrichedAccounts,
    });
  } catch (error) {
    console.error('Error executing get_custaccount_info:', error);
    res.status(500).json({
      message: 'Error executing get_custaccount_info',
      error: error.message || 'Unknown error occurred',
      details: error.original || error,
    });
  }
};

const updateCustAccountStatus = async (req, res) => {
  try {
    const { id } = req.params; // ID du compte client à mettre à jour

    // Vérifier si l'ID est fourni
    if (!id) {
      return res.status(400).json({
        message: 'ID du compte client requis.',
      });
    }

    // Vérifier si le compte client existe
    const account = await sequelize.query(
      `SELECT * FROM cust_account WHERE id_cust_account = :id`,
      {
        replacements: { id },
        type: sequelize.QueryTypes.SELECT,
      }
    );

    if (account.length === 0) {
      return res.status(404).json({
        message: `Compte client avec ID ${id} non trouvé.`,
      });
    }

    // Mettre à jour le statut_flag à 1
    await sequelize.query(
      `UPDATE cust_account SET statut_flag = 1, lastmodified = NOW() WHERE id_cust_account = :id`,
      {
        replacements: { id },
        type: sequelize.QueryTypes.UPDATE,
      }
    );

    // Obtenir les informations de l'utilisateur principal
    const mainContact = await sequelize.query(
      `SELECT * FROM cust_user WHERE id_cust_account = :id AND ismain_user = TRUE`,
      {
        replacements: { id },
        type: sequelize.QueryTypes.SELECT,
      }
    );

    if (mainContact.length > 0) {
      const { email, full_name } = mainContact[0];

      // Envoi de l'email pour informer de la validation
      await sendEmail(
        email,
        'Votre compte a été validé',
        `Bonjour ${full_name},\n\nVotre compte a été validé par un opérateur.\n\nCordialement,\nL'équipe.`
      );
    }
    res.status(200).json({
      message: `Statut du compte client avec ID ${id} mis à jour à 1.`,
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du statut_flag:', error);
    res.status(500).json({
      message: 'Erreur lors de la mise à jour du statut_flag.',
      error: error.message || 'Erreur inconnue.',
    });
  }
};

const rejectCustAccount = async (req, res) => {
  try {
    const { id } = req.params; // ID of the customer account to reject
    const { reason, idlogin } = req.body; // Rejection reason and operator ID

    // Validate inputs
    if (!id) {
      return res.status(400).json({
        message: 'ID du compte client requis.',
      });
    }

    if (!reason || reason.trim() === '') {
      return res.status(400).json({
        message: 'La raison du rejet est requise.',
      });
    }

    // Fetch the current details of the customer account
    const account = await sequelize.query(
      `SELECT * FROM cust_account WHERE id_cust_account = :id`,
      {
        replacements: { id },
        type: sequelize.QueryTypes.SELECT,
      }
    );

    if (account.length === 0) {
      return res.status(404).json({
        message: `Compte client avec ID ${id} non trouvé.`,
      });
    }

    const accountDetails = account[0];

    // Call the stored procedure to update the account
    await sequelize.query(
      `CALL set_cust_account(
        :legal_form, 
        :cust_name, 
        :trade_registration_num, 
        :in_free_zone, 
        :identification_number, 
        :register_number, 
        :full_address, 
        :id_sector, 
        :other_sector, 
        :id_country, 
        :statut_flag, 
        :idlogin, 
        :billed_cust_name, 
        :bill_full_address, 
        :id_cust_account
      )`,
      {
        replacements: {
          legal_form: accountDetails.legal_form,
          cust_name: accountDetails.cust_name,
          trade_registration_num: accountDetails.trade_registration_num,
          in_free_zone: accountDetails.in_free_zone,
          identification_number: accountDetails.identification_number,
          register_number: accountDetails.register_number,
          full_address: accountDetails.full_address,
          id_sector: accountDetails.id_sector,
          other_sector: accountDetails.other_sector,
          id_country: accountDetails.id_country,
          statut_flag: 4, // Set to rejected
          idlogin, // Operator ID
          billed_cust_name: accountDetails.billed_cust_name,
          bill_full_address: accountDetails.bill_full_address,
          id_cust_account: id,
        },
        type: sequelize.QueryTypes.RAW,
      }
    );

    // Fetch the main contact for the account
    const mainContact = await sequelize.query(
      `SELECT * FROM cust_user WHERE id_cust_account = :id AND ismain_user = TRUE`,
      {
        replacements: { id },
        type: sequelize.QueryTypes.SELECT,
      }
    );

    if (mainContact.length > 0) {
      const { email, full_name } = mainContact[0];

      // Send an email to notify the rejection
      await sendEmail(
        email,
        'Votre compte a été rejeté',
        `Bonjour ${full_name},\n\nVotre compte a été rejeté par un opérateur.\n\nRaison du rejet : ${reason}\n\nCordialement,\nL'équipe.`
      );
    }

    res.status(200).json({
      message: `Compte client avec ID ${id} a été rejeté.`,
    });
  } catch (error) {
    console.error('Erreur lors du rejet du compte client:', error);
    res.status(500).json({
      message: 'Erreur lors du rejet du compte client.',
      error: error.message || 'Erreur inconnue.',
    });
  }
};

const executeAddSubscription = async (req, res) => {
  try {
    const {
      legal_form,
      cust_name,
      trade_registration_num,
      in_free_zone,
      identification_number,
      register_number,
      full_address,
      id_sector,
      other_sector,
      id_country,
      statut_flag,
      idlogin,
      billed_cust_name,
      bill_full_address,
      gender,
      full_name,
      ismain_user,
      email,
      pwd, // Assuming 'pwd' is the password
      phone_number,
      mobile_number,
      position,
    } = req.body;

    // Validate required fields
    if (
      !legal_form ||
      !cust_name ||
      !trade_registration_num ||
      in_free_zone === undefined ||
      !identification_number ||
      !register_number ||
      !full_address ||
      !id_sector ||
      !id_country ||
      statut_flag === undefined ||
      !idlogin ||
      !billed_cust_name ||
      !bill_full_address ||
      gender === undefined ||
      !full_name ||
      ismain_user === undefined ||
      !email ||
      !pwd ||
      !phone_number ||
      !mobile_number ||
      !position
    ) {
      return res.status(400).json({
        message: 'Tous les champs requis doivent être fournis.',
      });
    }

    // Execute the stored procedure
    const result = await sequelize.query(
      `CALL add_Subscription(
        :legal_form, 
        :cust_name, 
        :trade_registration_num, 
        :in_free_zone, 
        :identification_number, 
        :register_number, 
        :full_address, 
        :id_sector, 
        :other_sector, 
        :id_country, 
        :statut_flag, 
        :idlogin, 
        :billed_cust_name, 
        :bill_full_address, 
        :gender, 
        :full_name, 
        :ismain_user, 
        :email, 
        :pwd, 
        :phone_number, 
        :mobile_number, 
        :position, 
        :id_cust_account
      )`,
      {
        replacements: {
          legal_form,
          cust_name,
          trade_registration_num,
          in_free_zone,
          identification_number,
          register_number,
          full_address,
          id_sector,
          other_sector,
          id_country,
          statut_flag,
          idlogin,
          billed_cust_name,
          bill_full_address,
          gender,
          full_name,
          ismain_user,
          email,
          pwd,
          phone_number,
          mobile_number,
          position,
          id_cust_account: null, // INOUT parameter, initially null
        },
        type: sequelize.QueryTypes.RAW,
        raw: true,
      }
    );

    // Assuming the stored procedure returns the new id_cust_account
    const newAccountId = result[0][0].p_id_cust_account;

    // Send confirmation email
    await sendEmail(
      email,
      'Votre compte est en attente de validation',
      `Bonjour ${full_name},\n\nVotre compte est en attente de validation par un opérateur.\n\nCordialement,\nL'équipe.`
    );

    res.status(201).json({
      message: 'Inscription réussie. Votre compte est en attente de validation.',
      id_cust_account: newAccountId,
    });
  } catch (error) {
    console.error('Erreur lors de l\'exécution de add_Subscription:', error);
    res.status(500).json({
      message: 'Erreur lors de l\'inscription.',
      error: error.message || 'Erreur inconnue.',
    });
  }
};

const executeCreateSubscriptionWithFile = async (req, res) => {
  try {
    const {
      uploadType, // 'inscriptions' or 'commandes'
      legal_form,
      cust_name,
      trade_registration_num,
      in_free_zone,
      identification_number,
      register_number,
      full_address,
      id_sector,
      other_sector,
      id_country,
      statut_flag,
      idlogin,
      billed_cust_name,
      bill_full_address,
      gender,
      full_name,
      ismain_user,
      email,
      pwd,
      phone_number,
      mobile_number,
      position,
    } = req.body;

    // Validate required fields for the subscription
    if (
      !uploadType ||
      !legal_form ||
      !cust_name ||
      !trade_registration_num ||
      in_free_zone === undefined ||
      !identification_number ||
      !register_number ||
      !full_address ||
      !id_sector ||
      !id_country ||
      statut_flag === undefined ||
      !idlogin ||
      !billed_cust_name ||
      !bill_full_address ||
      gender === undefined ||
      !full_name ||
      ismain_user === undefined ||
      !email ||
      !pwd ||
      !phone_number ||
      !mobile_number ||
      !position
    ) {
      return res.status(400).json({
        message: 'All required fields must be provided for creating subscription with file.',
      });
    }

    // Start a transaction
    const transaction = await sequelize.transaction();

    try {
      // Call add_Subscription stored procedure
      const subscriptionResult = await sequelize.query(
        `CALL add_Subscription(
          :legal_form, 
          :cust_name, 
          :trade_registration_num, 
          :in_free_zone, 
          :identification_number, 
          :register_number, 
          :full_address, 
          :id_sector, 
          :other_sector, 
          :id_country, 
          :statut_flag, 
          :idlogin, 
          :billed_cust_name, 
          :bill_full_address, 
          :gender, 
          :full_name, 
          :ismain_user, 
          :email, 
          :pwd, 
          :phone_number, 
          :mobile_number, 
          :position, 
          :id_cust_account
        )`,
        {
          replacements: {
            legal_form,
            cust_name,
            trade_registration_num,
            in_free_zone,
            identification_number,
            register_number,
            full_address,
            id_sector,
            other_sector: other_sector || null,
            id_country,
            statut_flag,
            idlogin,
            billed_cust_name,
            bill_full_address,
            gender,
            full_name,
            ismain_user,
            email,
            pwd,
            phone_number,
            mobile_number,
            position,
            id_cust_account: null, // INOUT parameter; initially null
          },
          type: sequelize.QueryTypes.RAW,
          transaction,
        }
      );

      // Assuming the stored procedure returns the new id_cust_account
      const newAccountId =
        subscriptionResult[0][0].p_id_cust_account;

      if (!newAccountId) {
        throw new Error('Failed to retrieve id_cust_account from add_Subscription.');
      }

      // Handle file uploads
      if (req.files) {
        const files = req.files;

        // Determine which files to process based on uploadType and company type
        const fileMappings = [];

        if (uploadType === 'inscriptions' && in_free_zone === 'true') {
          if (files.licenseFile && files.licenseFile.length > 0) {
            fileMappings.push({
              type: 'inscriptions', // For folder structure
              idfiles_repo_typeof: 1, // Licence zone franche
              file: files.licenseFile[0],
            });
          }
        }

        if (uploadType === 'commandes' && in_free_zone !== 'true') {
          if (files.patenteFile && files.patenteFile.length > 0) {
            fileMappings.push({
              type: 'commandes',
              idfiles_repo_typeof: 50, // Numéro Identification Fiscale (NIF)
              file: files.patenteFile[0],
            });
          }
          if (files.rchFile && files.rchFile.length > 0) {
            fileMappings.push({
              type: 'commandes',
              idfiles_repo_typeof: 51, // Numéro Immatriculation RCS
              file: files.rchFile[0],
            });
          }
        }

        // Iterate over the file mappings and call the stored procedure for each file
        for (const mapping of fileMappings) {
          const { idfiles_repo_typeof, file } = mapping;

          if (!idfiles_repo_typeof || !file) {
            continue; // Skip if type or file is missing
          }

          // Call set_cust_account_files stored procedure
          await sequelize.query(
            `CALL set_cust_account_files(
              :p_id_cust_account, 
              :p_idfiles_repo_typeof,
              :p_file_origin_name, 
              :p_file_guid, 
              :p_file_path, 
              :p_idlogin_insert, 
              0
            )`,
            {
              replacements: {
                p_id_cust_account: newAccountId,
                p_idfiles_repo_typeof: idfiles_repo_typeof,
                p_file_origin_name: file.originalname,
                p_file_guid: file.filename,
                p_file_path: file.path,
                p_idlogin_insert: idlogin,
              },
              type: sequelize.QueryTypes.RAW,
              transaction,
            }
          );
        }
      }

      // Commit the transaction
      await transaction.commit();

      // Send confirmation email
      await sendEmail(
        email,
        'Votre compte est en attente de validation',
        `Bonjour ${full_name},\n\nVotre compte est en attente de validation par un opérateur.\n\nCordialement,\nL'équipe.`
      );

      res.status(201).json({
        message: 'Inscription réussie avec fichier. Votre compte est en attente de validation.',
        id_cust_account: newAccountId,
      });
    } catch (err) {
      // Rollback the transaction in case of error
      await transaction.rollback();
      throw err;
    }
  } catch (error) {
    console.error('Error executing create subscription with file:', error);
    res.status(500).json({
      message: 'Erreur lors de la création de l\'inscription avec fichier.',
      error: error.message || 'Erreur inconnue.',
    });
  }
};

const executeGetCustAccountFiles = async (req, res) => {
  try {
    // Extract query parameters
    const {
      idCustAccountFilesList,
      idCustAccountList,
      idFilesRepoList,
      idFilesRepoTypeofList,
      idFilesRepoTypeofFirst = 1,
      idFilesRepoTypeofLast = 449,
      isActive,
    } = req.query;

    // Convert boolean-like strings to actual booleans
    const p_isactive = isActive === 'true' ? true : isActive === 'false' ? false : null;

    // Call the stored procedure
    const [results, metadata] = await sequelize.query(
      `SELECT * FROM get_cust_account_files(
        :p_id_cust_account_files_list,
        :p_id_cust_account_list,
        :p_id_files_repo_list,
        :p_id_files_repo_typeof_list,
        :p_id_files_repo_typeof_first,
        :p_id_files_repo_typeof_last,
        :p_isactive
      );`,
      {
        replacements: {
          p_id_cust_account_files_list: idCustAccountFilesList || null,
          p_id_cust_account_list: idCustAccountList || null,
          p_id_files_repo_list: idFilesRepoList || null,
          p_id_files_repo_typeof_list: idFilesRepoTypeofList || null,
          p_id_files_repo_typeof_first: parseInt(idFilesRepoTypeofFirst, 10),
          p_id_files_repo_typeof_last: parseInt(idFilesRepoTypeofLast, 10),
          p_isactive,
        },
        type: sequelize.QueryTypes.SELECT,
      }
    );

    res.status(200).json({
      message: 'Fichiers récupérés avec succès.',
      data: results,
    });
  } catch (error) {
    console.error('Error fetching customer account files:', error);
    res.status(500).json({
      message: 'Erreur lors de la récupération des fichiers du compte client.',
      error: error.message || 'Erreur inconnue.',
    });
  }
};


// Export the new function along with the existing ones
module.exports = {
  executeSetCustAccount,
  executeSetCustUser,
  executeGetCustAccountInfo,
  updateCustAccountStatus,
  rejectCustAccount,
  executeAddSubscription,
  executeCreateSubscriptionWithFile,
  executeGetCustAccountFiles,
};