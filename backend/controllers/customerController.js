const sequelize = require('../config/db'); // Correctly import sequelize
const nodemailer = require('nodemailer');
const crypto = require('crypto');
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

    console.log('get_custaccount_info result:', accounts);

    if (accounts.length === 0) {
      return res.status(200).json({
        message: 'No customer accounts found.',
        data: [],
      });
    }

    // Extract unique sector IDs
    const sectorIds = Array.from(new Set(accounts.map(account => account.id_sector).filter(Boolean))).join(',');

    console.log('Sector IDs to retrieve:', sectorIds);

    // Retrieve sector information
    const sectors = await sequelize.query(
      `SELECT * FROM get_sector_info(:p_id_list)`,
      {
        replacements: { p_id_list: sectorIds },
        type: sequelize.QueryTypes.SELECT,
      }
    );

    console.log('Sector info retrieved:', sectors);

    // Create a mapping of sector ID to sector details
    const sectorMap = {};
    sectors.forEach(sector => {
      sectorMap[sector.id_sector] = {
        symbol_fr: sector.symbol_fr,
        symbol_eng: sector.symbol_eng,
      };
    });

    console.log('Sector map:', sectorMap);

    // Extract the list of customer account IDs
    const accountIds = accounts.map(account => account.id_cust_account).join(',');

    console.log('Extracted account IDs for main contacts and files:', accountIds);

    // Retrieve main contacts
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

    console.log('get_custuser_info result (main contacts):', mainContacts);

    // Retrieve files
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

    // Enrich each account with sector name, main contact, and files
    const enrichedAccounts = accounts.map(account => ({
      ...account,
      sectorName: sectorMap[account.id_sector] || null, // Add sector info
      main_contact: contactMap[account.id_cust_account] || null, // Add null if no main contact found
      files: fileMap[account.id_cust_account] || [], // Add empty array if no files found
    }));

    console.log('Enriched Accounts:', enrichedAccounts);

    // Send the enriched data in the response
    res.status(200).json({
      message: 'Customer account information with main contacts, sectors, and files retrieved successfully',
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
    const { idlogin } = req.body; // The operator ID (or admin ID) performing the validation

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

    const accountDetails = account[0];

    // --► NEW: Call the procedure instead of direct UPDATE ◄--
    await sequelize.query(
      `CALL upd_cust_account_statut(:p_id_cust_account, :p_statut_flag, :p_idlogin)`,
      {
        replacements: {
          p_id_cust_account: id,
          p_statut_flag: 2, // 2 => inscription validée
          p_idlogin: idlogin || 1, // Fallback if not provided
        },
        type: sequelize.QueryTypes.RAW,
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
      const { email, full_name, username } = mainContact[0];
      const formattedDate = new Date().toLocaleString('fr-FR', {
        timeZone: 'Africa/Djibouti',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });

      // Envoi de l'email pour informer de la validation
      await sendEmail(
        email,
        'Votre inscription a été validée',
        `Bonjour ${full_name},

Votre demande d’inscription du ${formattedDate} a été validée avec succès.

Vous pouvez désormais vous connecter à votre compte en cliquant sur le lien suivant :
[Portail Chambre de Commerce de Djibouti](https://portal.ccd.dj)

Identifiants de connexion :
- **Nom d'utilisateur** : ${email}
- **Mot de passe** : celui que vous avez défini lors de votre inscription.

⚠️ Si vous n'êtes pas à l'origine de cette demande, nous vous invitons à nous signaler immédiatement cet e-mail à l'adresse : abuse@ccd.dj.

Nous restons à votre disposition pour toute question.

Bien cordialement,
**L'équipe du portail de la Chambre de Commerce de Djibouti**`
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

    // --► NEW: Call the procedure with p_statut_flag = 4 ◄--
    await sequelize.query(
      `CALL upd_cust_account_statut(:p_id_cust_account, :p_statut_flag, :p_idlogin)`,
      {
        replacements: {
          p_id_cust_account: id,
          p_statut_flag: 4, // 4 => inscription rejetée
          p_idlogin: idlogin || 1, // Fallback if not provided
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
        `Bonjour ${full_name},

Votre compte a été rejeté par un opérateur.

Raison du rejet : ${reason}

Cordialement,
L'équipe.`
      );
    }

    res.status(200).json({
      message: `Compte client avec ID ${id} a été rejeté (statut_flag = 4).`,
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

    // Create a map of required fields and their current values
    const requiredFields = {
      uploadType,
      legal_form,
      cust_name,
      trade_registration_num,
      in_free_zone,
      identification_number,
      register_number,
      full_address,
      id_sector,
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
    };

    // Find missing fields
    const missingFields = Object.entries(requiredFields)
      .filter(([key, value]) => value === undefined || value === null || value === '')
      .map(([key]) => key);

    if (missingFields.length > 0) {
      return res.status(400).json({
        message: 'The following fields are missing:',
        missingFields,
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

        if (uploadType === 'inscriptions') {
          if (in_free_zone === 'true' || in_free_zone === true) {
            // Process licenseFile
            if (files.licenseFile && files.licenseFile.length > 0) {
              console.log('Processing licenseFile:', files.licenseFile);
              fileMappings.push({
                type: 'inscriptions', // For folder structure
                idfiles_repo_typeof: 1, // Licence zone franche
                file: files.licenseFile[0],
              });
            } else {
              console.warn('No licenseFile found for inscriptions in free zone.');
            }
          } else {
            // Process patenteFile and rchFile
            if (files.patenteFile && files.patenteFile.length > 0) {
              console.log('Processing patenteFile:', files.patenteFile);
              fileMappings.push({
                type: 'inscriptions', // Or another appropriate type
                idfiles_repo_typeof: 50, // Numéro Identification Fiscale (NIF)
                file: files.patenteFile[0],
              });
            } else {
              console.warn('No patenteFile found for inscriptions not in free zone.');
            }

            if (files.rchFile && files.rchFile.length > 0) {
              console.log('Processing rchFile:', files.rchFile);
              fileMappings.push({
                type: 'inscriptions', // Or another appropriate type
                idfiles_repo_typeof: 51, // Numéro Immatriculation RCS
                file: files.rchFile[0],
              });
            } else {
              console.warn('No rchFile found for inscriptions not in free zone.');
            }
          }
        }


        console.log('File mappings to process:', fileMappings);

        // Iterate over the file mappings and call the stored procedure for each file
        for (const mapping of fileMappings) {
          const { idfiles_repo_typeof, file } = mapping;

          if (!idfiles_repo_typeof || !file) {
            console.warn('Skipping file due to missing type or file:', mapping);
            continue; // Skip if type or file is missing
          }

          console.log(`Uploading file: ${file.originalname}, Type: ${idfiles_repo_typeof}`);


          // Call set_cust_account_files stored procedure
          try {
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
            console.log(`File ${file.originalname} uploaded successfully.`);
          } catch (fileUploadError) {
            console.error(`Error uploading file ${file.originalname}:`, fileUploadError);
            throw new Error(`Failed to upload file ${file.originalname}.`);
          }
        }
      } else {
        console.log('No files to process.');
      }

      // Commit the transaction
      await transaction.commit();
      console.log('Transaction committed successfully.');

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

const requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;

    // Validate input
    if (!email) {
      return res.status(400).json({
        message: 'Email est requis pour réinitialiser le mot de passe.',
      });
    }

    // Generate a token and calculate expiration date
    const token = crypto.randomUUID();
    const activationDate = new Date();
    const deactivationDate = new Date();
    deactivationDate.setHours(deactivationDate.getHours() + 24); // Token valid for 24 hours

    // Save the token and email in the database using the stored procedure
    const result = await sequelize.query(
      `CALL add_TokenResetPwd_Settings(
        :p_token,
        :p_login,
        :p_email,
        :p_activation_date,
        :p_deactivation,
        :p_id
      )`,
      {
        replacements: {
          p_token: token,
          p_login: email,
          p_email: email,
          p_activation_date: activationDate,
          p_deactivation: deactivationDate,
          p_id: null,
        },
        type: sequelize.QueryTypes.RAW,
      }
    );

    // Send reset email
    const resetLink = `http://51.195.203.178/forgot-password?token=${token}`;
    await sendEmail(
      email,
      'Réinitialisation de mot de passe',
      `Bonjour,

Vous avez demandé à réinitialiser votre mot de passe. Veuillez cliquer sur le lien suivant pour définir un nouveau mot de passe :
${resetLink}

⚠️ Ce lien expirera dans 24 heures.

Si vous n'avez pas demandé cette réinitialisation, veuillez ignorer cet e-mail ou nous contacter à abuse@ccd.dj.

Cordialement,
L'équipe du portail Chambre de Commerce de Djibouti`
    );

    res.status(200).json({
      message: 'Lien de réinitialisation envoyé avec succès.',
    });
  } catch (error) {
    console.error('Erreur lors de la demande de réinitialisation de mot de passe:', error);
    res.status(500).json({
      message: 'Erreur lors de la demande de réinitialisation de mot de passe.',
      error: error.message || 'Erreur inconnue.',
    });
  }
};

const executeResetPassword = async (req, res) => {
  try {
    const { token, hPassword } = req.body;

    // 1. Validate Inputs
    if (!token || !hPassword) {
      return res.status(400).json({
        message: 'Le token et le nouveau mot de passe sont requis.',
      });
    }


    // 4. Retrieve User Information Based on Token
    // Since tokens are stored in GLOBAL_SETTINGS with CODE = 1052 and FREE_TXT1 = hashedToken
    const tokenRecord = await sequelize.query(
      `SELECT ID_GLOBAL_SETTINGS, IDLOGIN, DEACTIVATION_DATE, ID_CUST_ACCOUNT 
       FROM GLOBAL_SETTINGS 
       WHERE CODE = 1052 AND FREE_TXT1 = :token`,
      {
        replacements: { token },
        type: sequelize.QueryTypes.SELECT,
      }
    );

    if (tokenRecord.length === 0) {
      // Token not found
      return res.status(400).json({
        message: 'Token invalide ou inexistant.',
      });
    }
    const { idlogin: loginId, DEACTIVATION_DATE: deactivationDate, ID_CUST_ACCOUNT: idCustAccount } = tokenRecord[0];

    console.log("Token Record loginId => ", loginId)
    // 5. Retrieve User Email Based on loginId
    const user = await sequelize.query(
      `SELECT email FROM view_login WHERE id_login_user = :loginId AND isavailable_user = 1 AND isavailable_login = 1`,
      {
        replacements: { loginId },
        type: sequelize.QueryTypes.SELECT,
      }
    );

    if (user.length === 0) {
      return res.status(400).json({
        message: 'Utilisateur non trouvé ou indisponible.',
      });
    }

    const userEmail = user[0].email;

    console.log(userEmail);

    // 6. Call the Stored Procedure to Update the Password and Invalidate the Token
    try {
      await sequelize.query(
        `CALL set_ResetPwd_Settings(:p_token, :p_login, :p_pwd)`,
        {
          replacements: {
            p_token: token, // Ensure hashedToken is defined
            p_login: loginId, // Integer ID
            p_pwd: hPassword, // Assuming hPassword is already hashed
          },
          type: sequelize.QueryTypes.RAW,
        }
      );
    } catch (procError) {
      // Handle specific stored procedure errors if necessary
      console.error('Erreur lors de l\'appel de set_ResetPwd_Settings:', procError);
      return res.status(400).json({
        message: 'Erreur lors de la réinitialisation du mot de passe.',
        error: procError.message || 'Erreur inconnue.',
      });
    }

    // 7. Send Confirmation Email (Optional)
    await sendEmail(
      userEmail,
      'Confirmation de la réinitialisation de votre mot de passe',
      `Bonjour,

Votre mot de passe a été réinitialisé avec succès.

Si vous n'avez pas effectué cette action, veuillez contacter notre support immédiatement à abuse@ccd.dj.

Cordialement,
L'équipe de la Chambre de Commerce de Djibouti`
    );

    // 8. Respond to the Client
    res.status(200).json({
      message: 'Votre mot de passe a été réinitialisé avec succès.',
    });
  } catch (error) {
    console.error('Erreur lors de la réinitialisation du mot de passe:', error);
    res.status(500).json({
      message: 'Erreur lors de la réinitialisation du mot de passe.',
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
  requestPasswordReset,
  executeResetPassword
};