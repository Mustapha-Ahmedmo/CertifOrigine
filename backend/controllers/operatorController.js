const sequelize = require('../config/db');

const crypto = require('crypto');

const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransport({
  host: 'mail.gandi.net',
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

const FRONTEND_URL = "http://146.59.239.14"

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
const createOperator = async (req, res) => {
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

  const isUpdate = Boolean(id_op_user && Number(id_op_user) !== 0);

  try {
    // 1) Upsert operator  
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
          p_id_op_user: id_op_user || 0,
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

    // 2) If this was a creation, generate a reset token and email it
    if (!isUpdate) {
      const token = crypto.randomUUID();
      const now = new Date();
      const expire = new Date(now.getTime() + 24 * 60 * 60 * 1000); // +24h

      // store in your reset‑token SP
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
            p_activation_date: now,
            p_deactivation: expire,
            p_id: null,
          },
          type: sequelize.QueryTypes.RAW,
        }
      );

      const resetLink = `${FRONTEND_URL}/forgot-password?token=${token}`;

      const html = `
        <p>Bonjour ${fullName},</p>
        <p>Votre compte opérateur a été créé.</p>
        <p>Pour sécuriser votre accès, merci de définir votre mot de passe en cliquant sur le lien ci‑dessous :</p>
        <p><a href="${resetLink}">Définir mon mot de passe</a> (valable 24 h)</p>
        <p>Si vous n'avez pas demandé la création de ce compte, contactez immédiatement le support.</p>
        <p>Cordialement,<br/>Chambre de Commerce de Djibouti</p>
      `;
      await sendHtmlEmail(email, 'Bienvenue – Définissez votre mot de passe', html);
    } else {
      // 3) If update, just notify
      const html = `
        <p>Bonjour ${fullName},</p>
        <p>Les informations de votre compte opérateur ont été mises à jour.</p>
        <p>Si vous n'êtes pas à l'origine de cette modification, contactez le support.</p>
        <p>Cordialement,<br/>Chambre de Commerce de Djibouti</p>
      `;
      await sendHtmlEmail(email, 'Votre compte opérateur a été modifié', html);
    }

    res.status(isUpdate ? 200 : 201).json({
      message: isUpdate
        ? 'Opérateur mis à jour avec succès.'
        : 'Opérateur créé et email d’invitation envoyé.',
    });
  } catch (error) {
    console.error('Erreur createOperator:', error);
    res.status(500).json({ message: error.message || 'Erreur interne.' });
  }
};

// Disable an operator
const disableOperator = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id || isNaN(id)) {
      return res.status(400).json({ message: 'ID invalide.' });
    }

    await sequelize.query(
      `CALL disable_op_user(:p_id_op_user)`,
      {
        replacements: { p_id_op_user: parseInt(id, 10) },
        type: sequelize.QueryTypes.RAW,
      }
    );

    res.status(200).json({
      message: `Opérateur avec l'ID ${id} désactivé avec succès.`,
      id,
    });
  } catch (error) {
    console.error('Erreur lors de la désactivation de l’opérateur:', error);
    res.status(500).json({
      message: 'Erreur lors de la désactivation de l’opérateur.',
      error: error.message || 'Erreur inconnue.',
    });
  }
};

const enableOperator = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id || isNaN(id)) {
      return res.status(400).json({ message: 'ID invalide.' });
    }

    await sequelize.query(
      `CALL enable_op_user(:p_id_op_user)`,
      {
        replacements: { p_id_op_user: parseInt(id, 10) },
        type: sequelize.QueryTypes.RAW,
      }
    );

    res.status(200).json({
      message: `Opérateur avec l'ID ${id} réactivé avec succès.`,
      id,
    });
  } catch (error) {
    console.error('Erreur lors de la réactivation de l’opérateur:', error);
    res.status(500).json({
      message: 'Erreur lors de la réactivation de l’opérateur.',
      error: error.message || 'Erreur inconnue.',
    });
  }
};


module.exports = {
  getOperators,
  disableOperator,
  createOperator,
  enableOperator
};