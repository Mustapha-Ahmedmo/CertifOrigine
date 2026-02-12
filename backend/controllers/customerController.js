const sequelize = require('../config/db'); // Correctly import sequelize
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const { setMemo } = require('./mailerController');
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: false, // TLS requires secure to be false
  auth: {
    user: 'siee.certificat@ccd.dj', // SMTP username
    pass: 'uojc ihei wumc yvgv', // SMTP password
  },
  tls: {
    rejectUnauthorized: false, // Avoid issues with self-signed certificates
  },
});

const FRONTEND_URL = "http://146.59.239.14"

const sendEmail = async (to, subject, text) => {
  try {
    await transporter.sendMail({
      from: '"Chambre de commerce de Djibouti" <siee.certificat@ccd.dj>', // L'expéditeur
      to, // Le destinataire
      subject, // Sujet
      text, // Corps du message
    });
    console.log(`Email envoyé à ${to}`);
  } catch (error) {
    console.error(`Erreur lors de l'envoi de l'email à ${to}:`, error);
  }
};

const sendHtmlEmail = async (to, subject, htmlContent) => {
  try {
    await transporter.sendMail({
      from: '"Chambre de commerce de Djibouti" <siee.certificat@ccd.dj>',
      to,
      subject,
      html: htmlContent,
    });
    console.log(`Email HTML envoyé à ${to}`);
  } catch (error) {
    console.error(`Erreur lors de l'envoi de l'email HTML à ${to}:`, error);
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

const executeGetCustUsersByAccount = async (req, res) => {
  try {
    // Extract query parameters. They come in as strings.
    let { custAccountId, statutflag, isactiveCA, isactiveCU, ismain_user } = req.query;

    if (!custAccountId) {
      return res.status(400).json({
        message: 'Le paramètre "custAccountId" est requis pour récupérer les utilisateurs du compte client.'
      });
    }

    // Convert string "null" to actual null, and convert booleans as needed.
    statutflag = statutflag !== undefined && statutflag !== 'null' ? parseInt(statutflag, 10) : null;
    isactiveCA = (isactiveCA === 'true' || isactiveCA === '1') ? true
      : (isactiveCA === 'false' || isactiveCA === '0') ? false
        : null;
    isactiveCU = (isactiveCU === 'true' || isactiveCU === '1') ? true
      : (isactiveCU === 'false' || isactiveCU === '0') ? false
        : null;
    // Convert "null" string to null for p_ismain_user
    ismain_user = (ismain_user === 'null' || ismain_user === null)
      ? null
      : ((ismain_user === 'true' || ismain_user === '1') ? true
        : (ismain_user === 'false' || ismain_user === '0') ? false
          : null);

    const replacements = {
      p_id_listCA: custAccountId, // Expecting a string for the CSV list
      p_statutflag: statutflag,
      p_isactiveCA: isactiveCA,
      p_isactiveCU: isactiveCU,
      p_id_listCU: null, // No filtering by individual customer user IDs
      p_ismain_user: ismain_user,
    };

    const custUsers = await sequelize.query(
      `SELECT * FROM get_custuser_info(
        :p_id_listCA,
        :p_statutflag,
        :p_isactiveCA,
        :p_isactiveCU,
        :p_id_listCU,
        :p_ismain_user
      )`,
      {
        replacements,
        type: sequelize.QueryTypes.SELECT,
      }
    );

    console.log('get_custuser_info result:', custUsers);

    res.status(200).json({
      message: 'Les utilisateurs du compte client ont été récupérés avec succès.',
      data: custUsers,
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des utilisateurs du compte client:', error);
    res.status(500).json({
      message: 'Erreur lors de la récupération des utilisateurs du compte client.',
      error: error.message || 'Erreur inconnue.',
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
      password, // received password (may be empty when updating)
      phone_number,
      mobile_number,
      idlogin,
      position,
    } = req.body;

    // Debug: log incoming data
    console.log('Received set_cust_user data:', req.body);

    // Prepare replacements. If updating an existing user (id_cust_user exists) and password is empty, pass null.
    const replacements = {
      id_cust_user,
      id_cust_account,
      gender,
      full_name,
      ismain_user,
      email,
      phone_number,
      mobile_number,
      idlogin,
      position,
      password: (id_cust_user && (!password || password.trim() === '')) ? null : password,
    };

    // Execute the stored procedure. Notice we pass p_password as null in update mode if no new password is provided.
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
        replacements,
        type: sequelize.QueryTypes.RAW, // Specify the query type
      }
    );

    console.log('set_cust_user result:', result);

    // Send a confirmation email after processing (if necessary)
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
      details: error.original || error,
    });
  }
};

const executeSetCustSmallUser = async (req, res) => {
  try {
    const {
      id_cust_user,
      id_cust_account,
      gender,
      full_name,
      ismain_user,
      email,
      password, // may be empty on update
      phone_number,
      mobile_number,
      idlogin,
      position,
    } = req.body;

    console.log('Received set_cust_user data:', req.body);

    const isUpdate = id_cust_user && Number(id_cust_user) !== 0;

    const replacements = {
      id_cust_user,
      id_cust_account,
      gender,
      full_name,
      ismain_user,
      email,
      phone_number,
      mobile_number,
      idlogin,
      position,
      password: isUpdate && (!password || password.trim() === '') ? null : password,
    };

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
        replacements,
        type: sequelize.QueryTypes.RAW,
      }
    );

    console.log('set_cust_user result:', result);

    if (!isUpdate) {
      // Création d'un compte — générer le token et envoyer le lien
      const token = crypto.randomUUID();
      const activationDate = new Date();
      const deactivationDate = new Date();
      deactivationDate.setHours(deactivationDate.getHours() + 24);

      await sequelize.query(
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

      const resetLink = `${FRONTEND_URL}/forgot-password?token=${token}`;

      await sendEmail(
        email,
        'Réinitialisation de votre mot de passe',
        `Bonjour ${full_name},

Votre compte a été créé avec succès. Pour sécuriser votre compte, nous vous invitons à réinitialiser votre mot de passe en cliquant sur le lien ci-dessous :

${resetLink}

⚠️ Ce lien expirera dans 24 heures.

Si vous n'avez pas initié cette demande, veuillez contacter notre support immédiatement.

Cordialement,  
L'équipe`
      );
    } else {
      // Modification d'un compte — notification simple
      await sendEmail(
        email,
        'Modification de votre compte',
        `Bonjour ${full_name},

Votre compte a été modifié avec succès.  
Si vous n'avez pas initié cette demande, veuillez contacter le contact principal de votre société.

Cordialement,  
Chambre de commerce de Djibouti`
      );
    }

    res.status(200).json({
      message: 'Customer user processed successfully',
      result,
    });
  } catch (error) {
    console.error('Error executing set_cust_user:', error);
    res.status(500).json({
      message: 'Error executing set_cust_user',
      error: error.message || 'Unknown error occurred',
      details: error.original || error,
    });
  }
};


const executeGetCustAccountInfo = async (req, res) => {
  try {
    const { id_list, statutflag, isactive } = req.query;

    console.log('Received get_custaccount_info parameters:', { id_list, statutflag, isactive });

    // Execute the get_custaccount_info function to retrieve customer accounts
    const accounts = await sequelize.query(
      `SELECT * FROM get_custaccount_info(:p_id_list, :p_statutflag, :p_isactive)`,
      {
        replacements: {
          p_id_list: id_list || null,
          p_statutflag: statutflag !== undefined ? parseInt(statutflag, 10) : null,
          p_isactive: isactive !== undefined ? (isactive === 'true' || isactive === '1') : null,
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
    // Create mapping of id_cust_account to an array of main contacts
    const contactMap = {};
    mainContacts.forEach(contact => {
      if (!contactMap[contact.id_cust_account]) {
        contactMap[contact.id_cust_account] = [];
      }
      contactMap[contact.id_cust_account].push(contact);
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

⚠️ Si vous n'êtes pas à l'origine de cette demande, nous vous invitons à nous signaler immédiatement cet e-mail à l'adresse : siee.certificat@ccd.dj.

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

      const htmlContent = `
      <p>Bonjour,</p>
      <p>Votre compte a été rejeté par un opérateur.<br />
      Raison du rejet : <strong>${reason}</strong></p>
      <p>Prière de vous réinscrire en cliquant 
      <a href="${FRONTEND_URL}/register" 
         style="display:inline-block;padding:10px 20px;background-color:#DCAF26;color:white;text-decoration:none;border-radius:5px;">
         ici
      </a> 
      et en prêtant attention au(x) point(s) ci-haut.</p>
      <p>Chambre de Commerce de Djibouti</p>
    `;
      // Send an email to notify the rejection
      await sendHtmlEmail(
        email,
        'Votre compte a été rejeté',
        htmlContent
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

const disableCustAccount = async (req, res) => {
  try {
    const { id } = req.params; // ID of the customer account to disable
    const { reason, idlogin } = req.body; // Optional reason and operator ID

    // Validate inputs
    if (!id) {
      return res.status(400).json({
        message: 'ID du compte client requis.',
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

    // Call the procedure with p_statut_flag = 3 => désactivé
    await sequelize.query(
      `CALL upd_cust_account_statut(:p_id_cust_account, :p_statut_flag, :p_idlogin)`,
      {
        replacements: {
          p_id_cust_account: id,
          p_statut_flag: 3, // 3 => désactivé
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

    // Optional: Notify main contact of the disable action
    if (mainContact.length > 0) {
      const { email, full_name } = mainContact[0];

      const htmlContent = `
        <p>Bonjour ${full_name || ''},</p>
        <p>Votre compte a été désactivé ${reason ? `pour la raison suivante : <strong>${reason}</strong>.` : 'sans motif spécifié.'}</p>
        <p>Pour toute réclamation ou réactivation, veuillez contacter notre support.</p>
        <p>Chambre de Commerce de Djibouti</p>
      `;

      await sendHtmlEmail(
        email,
        'Votre compte a été désactivé',
        htmlContent
      );
    }

    const nowISO = new Date().toISOString(); // current date/time in ISO
    const memoData = {
      p_id_order: null,                 // or whichever order ID applies (0 if none)
      p_id_cust_account: id,         // the disabled account
      p_typeof: 1,   // or any label you prefer
      p_idlogin_insert: idlogin || 1,
      p_memo_date: nowISO,           // must be a valid ISO string
      p_memo_subject: 'Désactivation du compte client',
      p_memo_body: reason || 'Aucune raison spécifiée.',
      p_mail_to: mainContact?.[0]?.email || null,
      p_mail_bcc: null,             // or fill in if you want
      p_mail_acc: null,             // or fill in if you want
      p_mail_notifications: null,    // or fill in if you want
    };

    const memoResult = await setMemo(
      { body: memoData },            // pass as if it's the Express req
      { json: () => { }, status: () => ({ json: () => { } }) } // mock res if needed
    );
    // You can log or handle it as needed:
    console.log('Memo created:', memoResult?.newMemoId || memoResult);


    res.status(200).json({
      message: `Compte client avec ID ${id} a été désactivé (statut_flag = 3).`,
    });
  } catch (error) {
    console.error('Erreur lors de la désactivation du compte client:', error);
    res.status(500).json({
      message: 'Erreur lors de la désactivation du compte client.',
      error: error.message || 'Erreur inconnue.',
    });
  }
};

const reactivateCustAccount = async (req, res) => {
  try {
    const { id } = req.params; // ID of the customer account to reactivate
    const { reason, idlogin } = req.body; // Optional reason and operator ID

    // Validate inputs
    if (!id) {
      return res.status(400).json({
        message: 'ID du compte client requis.',
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

    // Call the procedure with p_statut_flag = 2 => réactivé
    await sequelize.query(
      `CALL upd_cust_account_statut(:p_id_cust_account, :p_statut_flag, :p_idlogin)`,
      {
        replacements: {
          p_id_cust_account: id,
          p_statut_flag: 2, // 2 => réactivé (ou “validé”)
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

    // Optional: Notify main contact of the reactivation
    if (mainContact.length > 0) {
      const { email, full_name } = mainContact[0];

      const htmlContent = `
        <p>Bonjour ${full_name || ''},</p>
        <p>Votre compte a été réactivé</p>
        <p>Vous pouvez désormais accéder à nouveau à votre espace client.</p>
        <p>Chambre de Commerce de Djibouti</p>
      `;

      await sendHtmlEmail(
        email,
        'Votre compte a été réactivé',
        htmlContent
      );
    }

    // Create a memo for the reactivation
    const nowISO = new Date().toISOString();
    const memoData = {
      p_id_order: null,                 // or 0 if none
      p_id_cust_account: id,
      p_typeof: 1,                      // distinct from the "disable" type if you prefer
      p_idlogin_insert: idlogin || 1,
      p_memo_date: nowISO,
      p_memo_subject: 'Réactivation du compte client',
      p_memo_body: 'Aucune raison spécifiée.',
      p_mail_to: mainContact?.[0]?.email || null,
      p_mail_bcc: null,
      p_mail_acc: null,
      p_mail_notifications: null,
    };

    const memoResult = await setMemo(
      { body: memoData },
      { json: () => { }, status: () => ({ json: () => { } }) }
    );
    console.log('Memo created:', memoResult);

    res.status(200).json({
      message: `Compte client avec ID ${id} a été réactivé (statut_flag = 2).`,
    });
  } catch (error) {
    console.error('Erreur lors de la réactivation du compte client:', error);
    res.status(500).json({
      message: 'Erreur lors de la réactivation du compte client.',
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
      pwd, // password (already hashed if needed)
      phone_number,
      mobile_number,
      position,
      id_country_headoffice,
      other_legal_form,
      other_business_type,
    } = req.body;

    // Nettoyer les valeurs 'undefined' et 'null' (chaînes) en vraies valeurs null
    const cleanValue = (val) => {
      if (val === undefined || val === 'undefined' || val === 'null' || val === '') {
        return null;
      }
      return val;
    };

    // Nettoyer billed_cust_name et bill_full_address
    const cleanedBilledCustName = cleanValue(billed_cust_name);
    const cleanedBillFullAddress = cleanValue(bill_full_address);

    // Create a map of required fields and check for missing ones
    const requiredFields = {
      uploadType,
      legal_form,
      cust_name,
      trade_registration_num,
      in_free_zone,
      identification_number,
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

    const missingFields = Object.entries(requiredFields)
      .filter(([key, value]) => value === undefined || value === null || value === '')
      .map(([key]) => key);

    if (missingFields.length > 0) {
      return res.status(400).json({
        message: 'The following fields are missing:',
        missingFields,
      });
    }

    // Vérifier/créer un utilisateur système pour les inscriptions (idlogin_insert)
    // Si idlogin est null ou invalide, créer ou utiliser un utilisateur système
    let systemLoginId = null;
    
    // Nettoyer idlogin : convertir les chaînes 'null'/'undefined' en null, sinon convertir en int
    if (idlogin && idlogin !== 'undefined' && idlogin !== 'null' && idlogin !== '') {
      systemLoginId = parseInt(idlogin, 10);
      if (isNaN(systemLoginId)) {
        systemLoginId = null;
      }
    }
    
    if (!systemLoginId) {
      try {
        // Chercher un utilisateur système existant (par exemple avec username 'system' ou 'admin')
        const systemUser = await sequelize.query(
          `SELECT id_login_user FROM login_user WHERE username = 'system' OR isadmin_login = TRUE LIMIT 1`,
          { type: sequelize.QueryTypes.SELECT }
        );
        
        if (systemUser && systemUser.length > 0) {
          systemLoginId = systemUser[0].id_login_user;
          console.log(`✅ Utilisation de l'utilisateur système existant: ${systemLoginId}`);
        } else {
          // Créer un utilisateur système si aucun n'existe
          const createSystemUser = await sequelize.query(
            `INSERT INTO login_user (username, pwd, isadmin_login, deactivation_date) 
             VALUES ('system', '$2a$10$system', TRUE, CURRENT_TIMESTAMP + INTERVAL '100 years')
             RETURNING id_login_user`,
            { type: sequelize.QueryTypes.SELECT }
          );
          
          if (createSystemUser && createSystemUser.length > 0) {
            systemLoginId = createSystemUser[0].id_login_user;
            console.log(`✅ Utilisateur système créé avec ID: ${systemLoginId}`);
          } else {
            throw new Error('Impossible de créer ou trouver un utilisateur système pour les inscriptions');
          }
        }
      } catch (systemUserError) {
        console.error('❌ Erreur lors de la gestion de l\'utilisateur système:', systemUserError);
        // Si on ne peut pas créer/utiliser un utilisateur système, utiliser 1 par défaut
        // (supposant qu'il existe ou sera créé manuellement)
        systemLoginId = 1;
        console.warn(`⚠️ Utilisation de l'ID par défaut: ${systemLoginId}`);
      }
    }
    
    // S'assurer que systemLoginId est un entier valide
    if (!systemLoginId || isNaN(systemLoginId)) {
      throw new Error('Impossible de déterminer un ID utilisateur valide pour l\'inscription');
    }
    
    systemLoginId = parseInt(systemLoginId, 10);
    console.log(`✅ ID utilisateur système final: ${systemLoginId}`);

    // Start a transaction
    const transaction = await sequelize.transaction();

    try {
      // Call the add_Subscription stored procedure.
      // The procedure signature is:
      //   add_Subscription(
      //     p_legal_form, p_cust_name, p_trade_registration_num, p_in_free_zone, p_identification_number,
      //     p_register_number, p_full_address, p_id_sector, p_other_sector, p_id_country, p_statut_flag, p_idlogin,
      //     p_billed_cust_name, p_bill_full_address, p_gender, p_full_name, p_ismain_user, p_email, p_password,
      //     p_phone_number, p_mobile_number, p_position, p_id_country_headoffice, p_other_legal_form, p_other_business_type,
      //     INOUT p_id_cust_account
      //   )
      // We initialize p_id_cust_account with null.

      let in_free_zone_value = null;
      if (req.body.in_free_zone === 'true') {
        in_free_zone_value = true;
      } else if (req.body.in_free_zone === 'false') {
        in_free_zone_value = false;
      }
      const subscriptionResult = await sequelize.query(
        `CALL add_Subscription(
          :p_legal_form, 
          :p_cust_name, 
          :p_trade_registration_num, 
          :p_in_free_zone, 
          :p_identification_number, 
          :p_register_number, 
          :p_full_address, 
          :p_id_sector, 
          :p_other_sector, 
          :p_id_country, 
          :p_statut_flag, 
          :p_idlogin, 
          :p_billed_cust_name, 
          :p_bill_full_address, 
          :p_gender, 
          :p_full_name, 
          :p_ismain_user, 
          :p_email, 
          :p_password, 
          :p_phone_number, 
          :p_mobile_number, 
          :p_position, 
          :p_id_country_headoffice,  -- <== Now properly included
          :p_other_legal_form, 
          :p_other_business_type, 
          :p_id_cust_account
        )`,
        {
          replacements: {
            p_legal_form: legal_form,
            p_cust_name: cust_name,
            p_trade_registration_num: trade_registration_num,
            p_in_free_zone: in_free_zone_value,
            p_identification_number: identification_number,
            p_register_number: register_number,
            p_full_address: full_address,
            p_id_sector: id_sector,
            p_other_sector: other_sector || null,
            p_id_country: id_country,
            p_statut_flag: statut_flag,
            p_idlogin: systemLoginId, // Utiliser l'ID système trouvé ou créé
            p_billed_cust_name: cleanedBilledCustName,
            p_bill_full_address: cleanedBillFullAddress,
            p_gender: gender,
            p_full_name: full_name,
            p_ismain_user: ismain_user,
            p_email: email,
            p_password: pwd,
            p_phone_number: phone_number,
            p_mobile_number: mobile_number,
            p_position: position,
            p_id_country_headoffice: id_country_headoffice || null, // <== Ensure it's present
            p_other_legal_form: other_legal_form || null,
            p_other_business_type: other_business_type || null,
            p_id_cust_account: null, // INOUT parameter, initially null
          },
          type: sequelize.QueryTypes.RAW,
          transaction,
        }
      );

      // Extract the new customer account ID from the procedure result.
      // PostgreSQL CALL returns a row; structure may be [rows] or [[row]] with key p_id_cust_account (or lowercased).
      console.log('🔍 add_Subscription result structure:', JSON.stringify(subscriptionResult, null, 2));
      const rawRow = subscriptionResult?.[0]?.[0];
      console.log('🔍 Raw row extracted:', rawRow);
      
      // Try multiple ways to extract the ID
      let newAccountId = null;
      if (rawRow) {
        // Try different possible key names
        newAccountId = rawRow.p_id_cust_account 
          || rawRow.P_ID_CUST_ACCOUNT 
          || rawRow.p_id_cust_account 
          || (typeof rawRow === 'object' && rawRow !== null ? Object.values(rawRow)[0] : null);
      }
      
      // If still not found, try to get it from the database directly
      if (!newAccountId) {
        console.log('⚠️ Could not extract ID from procedure result, querying database...');
        const lastAccountQuery = await sequelize.query(
          `SELECT id_cust_account FROM cust_account WHERE idlogin_insert = :systemLoginId ORDER BY insertdate DESC LIMIT 1`,
          {
            replacements: { systemLoginId },
            type: sequelize.QueryTypes.SELECT,
            transaction,
          }
        );
        if (lastAccountQuery && lastAccountQuery.length > 0) {
          newAccountId = lastAccountQuery[0].id_cust_account;
          console.log('✅ Found account ID from database query:', newAccountId);
        }
      }
      
      if (!newAccountId) {
        console.error('❌ Failed to retrieve id_cust_account. Full result:', JSON.stringify(subscriptionResult, null, 2));
        throw new Error('Failed to retrieve id_cust_account from add_Subscription. Vérifiez que l\'email n\'est pas déjà utilisé.');
      }
      
      console.log('✅ Successfully extracted account ID:', newAccountId);

      // Process file uploads if provided
      if (req.files) {
        const files = req.files;
        const fileMappings = [];

        if (uploadType === 'inscriptions') {
          if (in_free_zone === 'true' || in_free_zone === true) {
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
            if (files.patenteFile && files.patenteFile.length > 0) {
              console.log('Processing patenteFile:', files.patenteFile);
              fileMappings.push({
                type: 'inscriptions', // Or appropriate type
                idfiles_repo_typeof: 50, // Numéro Identification Fiscale (NIF)
                file: files.patenteFile[0],
              });
            } else {
              console.warn('No patenteFile found for inscriptions not in free zone.');
            }
            if (files.rchFile && files.rchFile.length > 0) {
              console.log('Processing rchFile:', files.rchFile);
              fileMappings.push({
                type: 'inscriptions', // Or appropriate type
                idfiles_repo_typeof: 51, // Numéro Immatriculation RCS
                file: files.rchFile[0],
              });
            } else {
              console.warn('No rchFile found for inscriptions not in free zone.');
            }
          }
        }

        console.log('File mappings to process:', fileMappings);

        for (const mapping of fileMappings) {
          const { idfiles_repo_typeof, file } = mapping;
          if (!idfiles_repo_typeof || !file) {
            console.warn('Skipping file due to missing type or file:', mapping);
            continue;
          }
          console.log(`Uploading file: ${file.originalname}, Type: ${idfiles_repo_typeof}`);
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
                  p_idlogin_insert: systemLoginId, // Utiliser l'ID système calculé plus tôt
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

      const now = new Date();
      const formattedDate = now.toLocaleString('fr-FR', {
        day:   '2-digit',
        month: '2-digit',
        year:  'numeric',
        hour:   '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
      
      // Send confirmation email (ne pas bloquer l'inscription si l'email échoue)
      try {
        await sendEmail(
        email,
        'Confirmation de votre demande d’inscription',
        `Bonjour ${full_name},\n\n` +
        `Nous avons bien reçu votre demande d’inscription du ${formattedDate}.\n` +
        `Vous recevrez un autre email lorsque votre compte sera validé par un de nos opérateurs.\n\n` +
        `En attendant, retrouvez toutes nos informations en cliquant sur le lien ci-dessous :\n` +
        `https://portal.ccd.dj\n\n` +
        `⚠️ Si vous n'êtes pas à l'origine de cette demande, nous vous invitons à nous signaler immédiatement cet e-mail à l'adresse : siee.certificat@ccd.dj.\n\n` +
        `Nous restons à votre disposition pour toute question.\n\n` +
        `Bien cordialement,\n` +
        `L'équipe du portail de la Chambre de Commerce de Djibouti`
        );
      } catch (emailError) {
        // Log l'erreur mais ne bloque pas l'inscription
        console.error(`⚠️ L'inscription a réussi mais l'email de confirmation n'a pas pu être envoyé à ${email}:`, emailError.message);
      }

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
    console.error('❌ Error executing create subscription with file:', error);
    console.error('❌ Error stack:', error.stack);
    console.error('❌ Error original:', error.original);
    
    const errorMessage = error.message || 'Erreur inconnue.';
    const errorDetails = error.original?.message || error.original?.detail || error.details;
    
    // Détecter les erreurs spécifiques et améliorer les messages
    let userFriendlyMessage = 'Erreur lors de la création de l\'inscription avec fichier.';
    let userFriendlyError = errorMessage;
    
    if (errorMessage.includes('does not exist') || errorMessage.includes('database')) {
      console.error('❌ ERREUR DE BASE DE DONNÉES:', errorMessage);
      userFriendlyMessage = 'Erreur de connexion à la base de données.';
      userFriendlyError = 'La base de données n\'est pas accessible. Veuillez contacter l\'administrateur.';
    } else if (errorMessage.includes('Email non valide') || errorMessage.includes('duplication') || errorMessage.includes('already exists')) {
      console.error('❌ ERREUR EMAIL DÉJÀ UTILISÉ:', errorMessage);
      userFriendlyMessage = 'Email déjà utilisé';
      userFriendlyError = 'Cet email est déjà enregistré dans notre système. Veuillez utiliser un autre email ou vous connecter.';
    } else if (errorMessage.includes('Failed to retrieve id_cust_account')) {
      console.error('❌ ERREUR EXTRACTION ID:', errorMessage);
      userFriendlyMessage = 'Erreur lors de la création du compte';
      userFriendlyError = 'Le compte a peut-être été créé mais nous n\'avons pas pu confirmer. Veuillez vérifier votre email ou contacter le support.';
    } else if (errorMessage.includes('constraint') || errorMessage.includes('violates')) {
      console.error('❌ ERREUR CONTRAINTE BASE DE DONNÉES:', errorMessage);
      userFriendlyMessage = 'Données invalides';
      userFriendlyError = 'Certaines informations fournies ne sont pas valides. Veuillez vérifier vos données et réessayer.';
    }
    
    // En production, ne pas exposer les détails techniques complets pour la sécurité
    // Mais retourner assez d'infos pour le debug
    const isProduction = process.env.NODE_ENV === 'production';
    
    res.status(500).json({
      message: userFriendlyMessage,
      error: userFriendlyError,
      ...(errorDetails && !isProduction && { details: errorDetails }),
      ...(isProduction && { debug: 'Vérifiez les logs du serveur pour plus de détails' }),
    });
  }
};

const addCustAccountFile = async (req, res) => {
  try {
    // 1. Validation des champs requis
    if (!req.file || !req.body.id_cust_account || 
        !req.body.idfiles_repo_typeof || !req.body.idlogin) {
      return res.status(400).json({ error: 'Fichier ou champ requis manquant.' });
    }

    // 2. Récupération des données nécessaires
    const idCustAccount = req.body.id_cust_account;
    const idRepoType = req.body.idfiles_repo_typeof;
    const idLogin = req.body.idlogin;
    const fileOriginName = req.file.originalname;    // nom d'origine du fichier
    const fileGuid = req.file.filename;              // nom généré par multer
    const filePath = req.file.path;                  // chemin complet sur le serveur

    // 3. Appel de la procédure stockée via Sequelize (MySQL)
    const sql = 'CALL set_cust_account_files(?, ?, ?, ?, ?, ?, ?)';
    const replacements = [
      idCustAccount,
      idRepoType,
      fileOriginName,
      fileGuid,
      filePath,
      idLogin,
      0  // dernier paramètre fixé à 0
    ];
    await sequelize.query(sql, { replacements }); 

    // 4. Envoi de la réponse de succès
    res.json({ message: 'Fichier uploadé et enregistré avec succès.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Échec lors de l’upload du fichier.' });
  }
}


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
    const resetLink = `${FRONTEND_URL}/forgot-password?token=${token}`;
    await sendEmail(
      email,
      'Réinitialisation de mot de passe',
      `Bonjour,

Vous avez demandé à réinitialiser votre mot de passe. Veuillez cliquer sur le lien suivant pour définir un nouveau mot de passe :
${resetLink}

⚠️ Ce lien expirera dans 24 heures.

Si vous n'avez pas demandé cette réinitialisation, veuillez ignorer cet e-mail ou nous contacter à siee.certificat@ccd.dj.

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

Si vous n'avez pas effectué cette action, veuillez contacter notre support immédiatement à siee.certificat@ccd.dj.

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
const executeDeleteCustUser = async (req, res) => {
  try {
    const { id } = req.params; // id_cust_user to be deactivated

    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({
        message: "L’ID du contact est requis et doit être un entier valide."
      });
    }

    // Appel de la procédure stockée
    await sequelize.query(
      `CALL disable_cust_user(:id)`,
      {
        replacements: { id: parseInt(id) },
        type: sequelize.QueryTypes.RAW
      }
    );

    res.status(200).json({
      message: `Contact (ID: ${id}) désactivé avec succès via la procédure.`
    });
  } catch (error) {
    console.error("Erreur lors de l'appel à la procédure disable_cust_user:", error);
    res.status(500).json({
      message: "Erreur lors de la désactivation du contact via la procédure.",
      error: error.message || 'Erreur inconnue.'
    });
  }
};

const handleContactForm = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return res.status(400).json({
        message: 'Tous les champs sont obligatoires : nom, email, sujet et message.',
      });
    }

    // Email content for the company
    const companyEmailText = `
Nouveau message de contact:
      
Nom: ${name}
Email: ${email}
Sujet: ${subject}
      
Message:
${message}
`;

    // Send email to company
    await sendEmail(
      email,// 'contact@ccd.dj', // Your company email
      `[Contact] ${subject}`,
      companyEmailText
    );

    // Confirmation email to user
    const userEmailText = `
Bonjour ${name},

Nous avons bien reçu votre message et vous remercions de nous avoir contactés.

Nous traitons votre demande et vous répondrons dans les plus brefs délais.

Cordialement,
L'équipe de la Chambre de Commerce de Djibouti
`;

    await sendEmail(
      email,
      'Confirmation de réception de votre message',
      userEmailText
    );

    res.status(200).json({
      message: 'Votre message a été envoyé avec succès.',
    });
  } catch (error) {
    console.error('Erreur lors de l\'envoi du formulaire de contact:', error);
    res.status(500).json({
      message: 'Une erreur est survenue lors de l\'envoi du message.',
      error: error.message || 'Erreur inconnue',
    });
  }
};

const executeUpdCustAccount = async (req, res) => {
  try {
    const {
      id_cust_account,
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
      id_country_headoffice,
      other_legal_form,
      other_business_type,
    } = req.body;

    if (!id_cust_account) {
      return res.status(400).json({ message: "L'ID du compte client est requis." });
    }

    const result = await sequelize.query(
      `CALL upd_cust_account(
          :p_id_cust_account,
          :p_legal_form,
          :p_cust_name,
          :p_trade_registration_num,
          :p_in_free_zone,
          :p_identification_number,
          :p_register_number,
          :p_full_address,
          :p_id_sector,
          :p_other_sector,
          :p_id_country,
          :p_statut_flag,
          :p_idlogin,
          :p_billed_cust_name,
          :p_bill_full_address,
          :p_id_country_headoffice,
          :p_other_legal_form,
          :p_other_business_type
       )`,
      {
        replacements: {
          p_id_cust_account: id_cust_account,
          p_legal_form: legal_form,
          p_cust_name: cust_name,
          p_trade_registration_num: trade_registration_num,
          p_in_free_zone: in_free_zone,
          p_identification_number: identification_number,
          p_register_number: register_number,
          p_full_address: full_address,
          p_id_sector: id_sector,
          p_other_sector: other_sector,
          p_id_country: id_country,
          p_statut_flag: statut_flag,
          p_idlogin: idlogin,
          p_billed_cust_name: billed_cust_name,
          p_bill_full_address: bill_full_address,
          p_id_country_headoffice: id_country_headoffice,
          p_other_legal_form: other_legal_form,
          p_other_business_type: other_business_type,
        },
        type: sequelize.QueryTypes.RAW,
      }
    );

    console.log("upd_cust_account result:", result);

    res.status(200).json({
      message: "Customer account updated successfully",
      result,
    });
  } catch (error) {
    console.error("Error executing upd_cust_account:", error);
    res.status(500).json({
      message: "Error executing upd_cust_account",
      error: error.message || "Unknown error occurred",
      details: error.original || error,
    });
  }
};

const executeDelCustAccountFiles = async (req, res) => {
  try {
    const { id } = req.params;
    const { mode } = req.body;

    if (!id) {
      return res.status(400).json({
        message: 'L’ID du fichier du compte client est requis.',
      });
    }

    // Execute the stored procedure
    await sequelize.query(
      `CALL del_cust_account_files(:p_id_cust_account_files, :p_mode)`,
      {
        replacements: {
          p_id_cust_account_files: id,
          p_mode: mode || 0, // default to 0 if not provided
        },
        type: sequelize.QueryTypes.RAW,
      }
    );

    res.status(200).json({
      message: 'Fichier du compte client supprimé avec succès.',
    });
  } catch (error) {
    console.error('Erreur lors de la suppression du fichier du compte client:', error);
    res.status(500).json({
      message: 'Erreur lors de la suppression du fichier du compte client.',
      error: error.message || 'Erreur inconnue.',
    });
  }
};

const executeReactivateCustUser = async (req, res) => {
  try {
    const { id } = req.params; // id_cust_user à réactiver

    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({
        message: "L’ID du contact est requis et doit être un entier valide."
      });
    }

    // Appel de la procédure stockée de réactivation
    await sequelize.query(
      `CALL enable_cust_user(:id)`,
      {
        replacements: { id: parseInt(id) },
        type: sequelize.QueryTypes.RAW
      }
    );

    res.status(200).json({
      message: `Contact (ID: ${id}) réactivé avec succès via la procédure.`
    });
  } catch (error) {
    console.error("Erreur lors de l'appel à la procédure enable_cust_user:", error);
    res.status(500).json({
      message: "Erreur lors de la réactivation du contact via la procédure.",
      error: error.message || 'Erreur inconnue.'
    });
  }
};

const sendCustomEmail = async (req, res) => {
  try {
    const { to, subject, body, isHtml = false } = req.body;

    if (!to || !subject || !body) {
      return res.status(400).json({
        message: 'Les champs "to", "subject" et "body" sont requis.',
      });
    }

    if (isHtml) {
      await sendHtmlEmail(to, subject, body);
    } else {
      await sendEmail(to, subject, body);
    }

    res.status(200).json({
      message: `Email envoyé à ${to} avec succès.`,
    });
  } catch (error) {
    console.error('Erreur lors de l\'envoi de l\'email personnalisé :', error);
    res.status(500).json({
      message: 'Erreur lors de l\'envoi de l\'email.',
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
  executeResetPassword,
  executeGetCustUsersByAccount,
  executeDeleteCustUser,
  handleContactForm,
  executeSetCustSmallUser,
  executeUpdCustAccount,
  executeDelCustAccountFiles,
  disableCustAccount,
  reactivateCustAccount,
  executeReactivateCustUser,
  sendCustomEmail,
  addCustAccountFile
};