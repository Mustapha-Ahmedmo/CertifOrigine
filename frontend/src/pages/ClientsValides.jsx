import React, { useEffect, useState } from 'react';
import {
  addCustAccountFile,
  deleteCustAccountFile,
  disableCustAccount,
  fetchSectors,
  getCustAccountInfo,
  getFilesRepoTypeofInfo,
  reactivateCustAccount,
  sendEmail,
  sendEmailAndMemo,
  updateCustAccount
} from '../services/apiServices';
import './Inscriptions.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEdit, faEllipsisV } from '@fortawesome/free-solid-svg-icons';
import { formatDate } from '../utils/dateUtils';
import {
  Box,
  Typography,
  TextField,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Checkbox,
  Tabs,
  Tab,
  AppBar,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
  CardActions,
  Grid,
  useTheme,
  useMediaQuery,
  IconButton,
  Menu,
  Snackbar,
  Alert,
} from '@mui/material';
import { useSelector } from 'react-redux';

function TabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`clients-valides-tabpanel-${index}`}
      aria-labelledby={`clients-valides-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 2 }}>{children}</Box>}
    </div>
  );
}

function a11yProps(index) {
  return {
    id: `clients-valides-tab-${index}`,
    'aria-controls': `clients-valides-tabpanel-${index}`,
  };
}

const API_URL = import.meta.env.VITE_API_URL;

// Helper pour ne pas afficher "undefined"
const safeValue = (val) => {
  return val === undefined || val === null || val === 'undefined' ? '' : val;
};

function getImplantationLabel(registration) {

  console.log("REGISTRATION : ", registration)
  if (registration.in_free_zone === true) {
    return 'Zone franche';
  }

  /* si la société a un NIF ou un RCS, on la considère
     comme “Entreprise”, quel que soit le contenu de in_free_zone */
  if (
    (registration.trade_registration_num && registration.trade_registration_num !== 'null') ||  // NIF
    (registration.register_number && registration.register_number !== 'null')                   // RCS
  ) {
    return 'Entreprise';
  }

  /* sinon only -> “Autre” */
  return 'Autre';
}

const ClientsValides = () => {

  const user = useSelector((state) => state.auth.user);
  const idLogin = user?.id_login_user;
  const isOpUser = user?.isopuser;
  const isMainUser = user?.role_user;

  console.log(user);
  const [custAccounts, setCustAccounts] = useState([]);
  const [showContactModal, setShowContactModal] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [tabIndex, setTabIndex] = useState(0);
  const [selectedFilter, setSelectedFilter] = useState('validé');
  const [anchorEl, setAnchorEl] = useState(null);      // ancre du Menu
  const [selectedMenuAccount, setSelectedMenuAccount] = useState(null); // ligne cliquée
  const filterColor = '#C39408';


  // Modale édition
  const [openEditModal, setOpenEditModal] = useState(false);
  const [selectedEditAccount, setSelectedEditAccount] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [sectors, setSectors] = useState([]);

  // Modale fichiers
  const [openFileModal, setOpenFileModal] = useState(false);
  const [selectedFileAccount, setSelectedFileAccount] = useState(null);
  const [fileData, setFileData] = useState({
    justificatifFile: null,
    justificatifFileName: ''
  });

  const [openDisableModal, setOpenDisableModal] = useState(false);
  const [selectedDisableAccount, setSelectedDisableAccount] = useState(null);
  const [disableReason, setDisableReason] = useState('');

  const [openContactModal, setOpenContactModal] = useState(false);
  const [selectedContactEmail, setSelectedContactEmail] = useState('');
  const [mailMessage, setMailMessage] = useState('');

  const [fileTypes, setFileTypes] = useState([]);
  const [selectedFileType, setSelectedFileType] = useState('');

  const [fileAlertOpen, setFileAlertOpen] = useState(false);


  useEffect(() => {
    const fetchFileTypes = async () => {
      try {
        const fileTypesResp = await getFilesRepoTypeofInfo({
          p_id_files_repo_typeof_first: 0,
          p_id_files_repo_typeof_last: 99,
          p_ismandatory: null,
        });

        // Certains backends renvoient { data: [...] }
        const types = fileTypesResp?.data ?? fileTypesResp;
        setFileTypes(Array.isArray(types) ? types : []);
      } catch (err) {
        console.error('Erreur lors du chargement des types de fichiers :', err);
        setFileTypes([]); // fallback pour éviter l'erreur
      }
    };

    fetchFileTypes();
  }, []);

  const handleMenuOpen = (event, acc) => {
    setAnchorEl(event.currentTarget);  // ouvre le Menu
    setSelectedMenuAccount(acc);       // mémorise la ligne
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedMenuAccount(null);
  };


  const handleOpenContactModal = (email) => {
    setSelectedContactEmail(email);
    setMailMessage('');
    setOpenContactModal(true);
  };

  const handleCloseContactModal = () => {
    setOpenContactModal(false);
    setSelectedContactEmail('');
    setMailMessage('');
  };

  // Récupère les comptes selon le filtre
  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        let status;

        if (selectedFilter === 'validé') {
          status = 2;
        } else if (selectedFilter === 'non validé') {
          status = 1;
        } else if (selectedFilter === 'rejeté') {
          status = 4;
        } else if (selectedFilter === 'désactivé') {
          status = 3; // <-- Désactivé
        }
        const custAccountId = isOpUser ? null : user?.id_cust_account;
        const response = await getCustAccountInfo(custAccountId, status, true);

        const data = response.data || [];
        setCustAccounts(data);
      } catch (err) {
        console.error('Error fetching accounts:', err);
      }
    };
    fetchAccounts();
  }, [selectedFilter]);

  // Récupère les secteurs
  useEffect(() => {
    const fetchData = async () => {
      try {
        const sectorData = await fetchSectors();
        setSectors(sectorData);
      } catch (err) {
        console.error('Error fetching sectors:', err);
      }
    };
    fetchData();
  }, []);

  // Modale fichiers
  const handleOpenFileModal = (account) => {
    setSelectedFileAccount(account);
    setOpenFileModal(true);
  };

  const handleCloseFileModal = () => {
    setOpenFileModal(false);
    setSelectedFileAccount(null);
  };

  const handleDeleteFile = async (fileId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce fichier ?')) {
      try {
        await deleteCustAccountFile(fileId, 0);
        // 2. Envoi d'email si contact principal trouvé
        const mainContact = selectedFileAccount?.main_contact?.find(c => c.ismain_user === true);


        if (isOpUser && mainContact?.email && selectedFileAccount?.files) {
          const fileInfo = selectedFileAccount.files.find(f => f.id_cust_account_files === fileId);

          await sendEmailAndMemo({
            to: mainContact.email,
            subject: 'Un fichier a été supprimé de votre compte',
            body: `
                <p>Bonjour ${mainContact.full_name || ''},</p>
                <p>Un fichier a été supprimé de votre compte client par un opérateur.</p>
                <p>Nom du fichier supprimé : <strong>${fileInfo?.txt_description_fr} - ${fileInfo?.file_origin_name || 'Nom inconnu'}</strong></p>
                <p>Si vous avez des questions, contactez notre support.</p>
                <p>Chambre de Commerce de Djibouti</p>
              `,
            isHtml: true,
            id_cust_account: selectedFileAccount.id_cust_account,
            idlogin: idLogin
          });
        }




        setSelectedFileAccount((prev) => ({
          ...prev,
          files: prev.files.filter((file) => file.id_cust_account_files !== fileId)
        }));
        let status;
        if (selectedFilter === 'validé') {
          status = 2;
        } else if (selectedFilter === 'non validé') {
          status = 1;
        } else if (selectedFilter === 'rejeté') {
          status = 4;
        } const custAccountId = isOpUser ? null : user?.id_cust_account;

        const response = await getCustAccountInfo(custAccountId, status, true);
        const data = response.data || [];
        const sortedData = data.sort(
          (a, b) => new Date(b.insertdate) - new Date(a.insertdate)
        );
        setCustAccounts(sortedData);
        if (selectedFileAccount) {
          const updatedAccount = sortedData.find(
            (acc) => acc.id_cust_account === selectedFileAccount.id_cust_account
          );
          setSelectedFileAccount(updatedAccount);
        }
      } catch (error) {
        console.error('Error deleting file:', error);
        alert('Erreur lors de la suppression du fichier');
      }
    }
  };

  const handleFileModalChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFileData((prev) => ({ ...prev, justificatifFile: file }));
    }
  };

  const handleSaveFileModal = async () => {
    if (!fileData.justificatifFile || !selectedFileType || !selectedFileAccount) {
      alert('Merci de sélectionner un fichier et un type.');
      return;
    }

    const isZoneFranche = selectedFileAccount.in_free_zone === true;
    const isEntreprise = !selectedFileAccount.in_free_zone && !selectedFileAccount.other_business_type;
    const expectedFileType = isZoneFranche ? 1 : isEntreprise ? 50 : null;

    if (expectedFileType && Number(selectedFileType) !== expectedFileType) {
      const confirm = window.confirm(
        "⚠️ Le fichier sélectionné ne correspond pas au type de votre entreprise.\n\n" +
        `Vous êtes une entreprise ${isZoneFranche ? 'en zone franche' : 'standard'}, ` +
        `\n\nVoulez-vous continuer ?`
      );
      if (!confirm) return;
    }



    try {
      const filePayload = {
        uploadType: 'inscriptions',
        id_cust_account: selectedFileAccount.id_cust_account,
        idfiles_repo_typeof: selectedFileType,
        idlogin: idLogin,
        file: fileData.justificatifFile,
      };

      await addCustAccountFile(filePayload);

      // Avant l'envoi de l'email
      const selectedFileTypeLabel = fileTypes.find(t => t.id_files_repo_typeof === Number(selectedFileType))?.txt_description_fr || 'Type inconnu';


      const mainContact = selectedFileAccount?.main_contact?.find(c => c.ismain_user === true);
      if (isOpUser && mainContact?.email) {
        const emailBody = `
          <p>Bonjour ${mainContact.full_name || ''},</p>
          <p>Un nouveau fichier a été ajouté à votre compte client par un opérateur.</p>
          <p>Nom du fichier : <strong>${selectedFileTypeLabel} - ${fileData.justificatifFile.name}</strong></p>
          <p>Si ce fichier n’a pas été fourni par vous, veuillez contacter notre support.</p>
          <p>Chambre de Commerce de Djibouti</p>
        `;

        await sendEmailAndMemo({
          to: mainContact.email,
          subject: 'Nouveau fichier ajouté à votre compte',
          body: emailBody,
          isHtml: true,
          id_cust_account: selectedFileAccount.id_cust_account,
          idlogin: idLogin
        });
      }




      // Rafraîchir la liste
      let status;
      if (selectedFilter === 'validé') {
        status = 2;
      } else if (selectedFilter === 'non validé') {
        status = 1;
      } else if (selectedFilter === 'rejeté') {
        status = 4;
      }
      const custAccountId = isOpUser ? null : user?.id_cust_account;

      const response = await getCustAccountInfo(custAccountId, status, true);
      const data = response.data || [];
      const sortedData = data.sort(
        (a, b) => new Date(b.insertdate) - new Date(a.insertdate)
      );
      setCustAccounts(sortedData);

      // Mettre à jour les fichiers du compte affiché
      if (selectedFileAccount) {
        const updatedAccount = sortedData.find(
          (acc) => acc.id_cust_account === selectedFileAccount.id_cust_account
        );
        setSelectedFileAccount(updatedAccount);
      }

      // Reset
      setFileData({ justificatifFile: null, justificatifFileName: '' });
      setSelectedFileType('');
      handleCloseFileModal();
    } catch (error) {
      console.error('Erreur lors de l’ajout du fichier :', error);
      alert('Erreur lors de l’ajout du fichier.');
    }
  };


  useEffect(() => {
    if (selectedEditAccount && selectedEditAccount.files && selectedEditAccount.files.length > 0) {
      const existingFile = selectedEditAccount.files[0];
      setEditFormData((prev) => ({
        ...prev,
        justificatifFileName: safeValue(existingFile.file_origin_name)
      }));
    } else {
      setEditFormData((prev) => ({ ...prev, justificatifFileName: '' }));
    }
  }, [selectedEditAccount]);

  const handleTabChange = (event, newValue) => {
    setTabIndex(newValue);
  };

  // Contact principal
  const handleOpenContactsModal = (account) => {
    setSelectedAccount(account);
    setShowContactModal(true);
  };

  const handleCloseContactsModal = () => {
    setSelectedAccount(null);
    setShowContactModal(false);
  };

  const handleFileClick = (file) => {
    const fileUrl = `${API_URL}/files/inscriptions/${new Date().getFullYear()}/${file.file_guid}`;
    window.open(fileUrl, '_blank');
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const filteredAccounts = custAccounts.filter((registration) => {
    const search = searchTerm.toLowerCase().trim();
    if (!search) return true;
    const dateString = formatDate(registration.insertdate);
    const fields = [
      registration.cust_name,
      registration.legal_form,
      registration.full_address,
      registration.co_symbol_fr,
      registration.sectorName?.symbol_fr,
      registration.trade_registration_num,
      registration.rchNumber,
      registration.licenseNumber,
      dateString
    ]
      .filter(Boolean)
      .map((val) => String(val).toLowerCase());
    return fields.some((field) => field.includes(search));
  });

  const handleOpenEditModal = (account) => {
    setSelectedEditAccount(account);

    let companyType = '';

    if (account.in_free_zone === true) {
      companyType = 'zoneFranche';
    } else if (
      account.trade_registration_num ||    // NIF
      account.register_number              // RCS
    ) {
      companyType = 'autre'; // <-- entreprise standard
    } else if (account.in_free_zone === false) {
      companyType = 'autres';
    } else {
      companyType = 'autres'; // fallback
    }
    const justificatifFileName =
      account.files && account.files.length > 0
        ? safeValue(account.files[0].file_origin_name)
        : '';
    setEditFormData({
      companyName: safeValue(account.cust_name),
      legalForm: safeValue(account.legal_form),
      fullAddress: safeValue(account.full_address),
      country: safeValue(account.co_symbol_fr),
      sector: safeValue(account.sectorName?.symbol_fr),
      nif: safeValue(account.trade_registration_num),
      rchNumber: safeValue(account.register_number),
      licenseNumber: safeValue(account.identification_number),
      companyType,
      otherCompanyType: safeValue(account.other_business_type),
      otherLegalForm: safeValue(account.other_legal_form),
      otherSector: safeValue(account.other_sector),
      justificatifFile: '',
      justificatifFileName
    });
    setOpenEditModal(true);
  };

  const handleCloseEditModal = () => {
    setOpenEditModal(false);
    setSelectedEditAccount(null);
    setEditFormData({});
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleOpenDisableModal = (account) => {
    setSelectedDisableAccount(account);
    setDisableReason(''); // reset reason
    setOpenDisableModal(true);
  };

  const handleJustificatifChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setEditFormData((prev) => ({
        ...prev,
        justificatifFile: file,
        justificatifFileName: ''
      }));
    }
  };

  const handleSaveEdit = async () => {
    if (
      (selectedEditAccount.in_free_zone && editFormData.companyType !== 'zoneFranche') ||
      (!selectedEditAccount.in_free_zone &&
        editFormData.companyType !== 'autre' &&
        editFormData.companyType !== 'autres')
    ) {
      /* if (!editFormData.justificatifFile) {
         alert(
           "Le type d'entreprise a changé. Veuillez réuploader le fichier justificatif."
         );
         return;
       }*/
    }


    let idSectorToUse = null;

    const selectedSector = sectors.find(
      s => s.symbol_fr?.toLowerCase() === editFormData.sector?.toLowerCase()
    );

    if (selectedSector) {
      idSectorToUse = selectedSector.id_sector;
    }



    const updateData = {
      id_cust_account: selectedEditAccount.id_cust_account,
      legal_form: editFormData.legalForm,
      cust_name: editFormData.companyName,
      trade_registration_num: editFormData.nif || '',
      in_free_zone:
        editFormData.companyType === 'zoneFranche'
          ? true
          : editFormData.companyType === 'autres'
            ? false
            : null,
      identification_number: editFormData.licenseNumber,
      register_number: editFormData.rchNumber,
      full_address: editFormData.fullAddress,
      id_sector: idSectorToUse,
      id_country: selectedEditAccount.id_country,
      statut_flag: selectedEditAccount.statut_flag,
      idlogin: selectedEditAccount.idlogin_modify || 1,
      billed_cust_name: selectedEditAccount.billed_cust_name || '',
      bill_full_address: selectedEditAccount.bill_full_address || '',
      id_country_headoffice: selectedEditAccount.id_country_headoffice || null,
      other_legal_form: selectedEditAccount.other_legal_form || '',
      other_business_type:
        editFormData.companyType === 'autres'
          ? safeValue(editFormData.otherCompanyType)
          : '',
      companyType: editFormData.companyType || '',
      other_legal_form: editFormData.legalForm === 'Autre' ? safeValue(editFormData.otherLegalForm) : '',
      other_sector: editFormData.sector?.toLowerCase() === 'autres' ? safeValue(editFormData.otherSector) : '',
    };



    if (editFormData.companyType === 'autre') {
      updateData.trade_registration_num = safeValue(editFormData.nif);
      updateData.register_number = safeValue(editFormData.rchNumber);
      updateData.identification_number = '';
      updateData.other_business_type = '';
    } else if (editFormData.companyType === 'zoneFranche') {
      updateData.trade_registration_num = '';
      updateData.register_number = '';
      updateData.identification_number = safeValue(editFormData.licenseNumber);
      updateData.other_business_type = '';
    } else if (editFormData.companyType === 'autres') {
      updateData.trade_registration_num = '';
      updateData.register_number = '';
      updateData.identification_number = '';
      updateData.other_business_type = safeValue(editFormData.otherCompanyType);
    } else {
      updateData.trade_registration_num = '';
      updateData.register_number = '';
      updateData.identification_number = '';
      updateData.other_business_type = '';
    }


    let status;
    if (selectedFilter === 'validé') {
      status = 2;
    } else if (selectedFilter === 'non validé') {
      status = 1;
    } else if (selectedFilter === 'rejeté') {
      status = 4;
    }

    await updateCustAccount(updateData);
    // Si le nouveau type est "Entreprise" ou "Entreprise en zone franche" ⇒ invite à déposer les fichiers
    if (['autre', 'zoneFranche'].includes(editFormData.companyType)) {
      setFileAlertOpen(true);
    }

    // Envoi d'un email après la mise à jour
    const mainContact = selectedEditAccount?.main_contact?.find(c => c.ismain_user === true);
    if (isOpUser && mainContact?.email) {
      const emailBody = `
        <p>Bonjour ${mainContact.full_name || ''},</p>
        <p>Les informations de votre compte client ont été mises à jour par un opérateur.</p>
        <p>Si vous n'êtes pas à l'origine de cette modification, veuillez contacter notre support.</p>
        <p>Chambre de Commerce de Djibouti</p>
      `;

      await sendEmailAndMemo({
        to: mainContact.email,
        subject: 'Mise à jour de vos informations client',
        body: emailBody,
        isHtml: true,
        id_cust_account: selectedEditAccount.id_cust_account,
        idlogin: idLogin
      });
    }


    const custAccountId = isOpUser ? null : user?.id_cust_account;

    const response = await getCustAccountInfo(custAccountId, status, true);
    const data = response.data || [];
    const sortedData = data.sort(
      (a, b) => new Date(b.insertdate) - new Date(a.insertdate)
    );
    setCustAccounts(sortedData);
    // si le type final est « Entreprise » ou « Entreprise en zone franche »
    if (['autre', 'zoneFranche'].includes(editFormData.companyType)) {
      setFileAlertOpen(true);                            // 1.  Snackbar

      // 2. trouver la version fraîche du compte pour afficher ses fichiers
      const updatedAccount = sortedData.find(
        acc => acc.id_cust_account === selectedEditAccount.id_cust_account
      );

      handleOpenFileModal(updatedAccount);               // 3. ouvrir la modale fichiers
    }

    handleCloseEditModal();
  };

  // Détection de l'affichage mobile
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

  const handleReactivateConfirm = async (account) => {
    if (!account) return;

    try {
      // If your back-end expects (id, reason, idlogin):
      await reactivateCustAccount(
        account.id_cust_account,      // The ID to reactivate
        account.idlogin_modify || 1   // Operator ID
      );

      // Refresh the list
      let status;
      if (selectedFilter === 'validé') {
        status = 2;
      } else if (selectedFilter === 'non validé') {
        status = 1;
      } else if (selectedFilter === 'rejeté') {
        status = 4;
      } else if (selectedFilter === 'désactivé') {
        status = 3;
      }
      const custAccountId = isOpUser ? null : user?.id_cust_account;

      const response = await getCustAccountInfo(custAccountId, status, true);
      setCustAccounts(response.data || []);

      alert(`Le client « ${account.cust_name} » a été réactivé avec succès.`);
    } catch (error) {
      console.error('Erreur lors de la réactivation du client :', error);
      alert('Impossible de réactiver ce client.');
    }
  };

  const handleDisableConfirm = async () => {
    if (!selectedDisableAccount) return;
    // Vérification du motif
    if (!disableReason.trim()) {
      // affiche une notification (Snackbar ou alert)
      alert('Veuillez saisir un motif de désactivation.');
      return;
    }

    try {
      await disableCustAccount(
        selectedDisableAccount.id_cust_account,
        disableReason,
        selectedDisableAccount.idlogin_modify || 1
      );

      // Now refetch the list, based on the current filter (selectedFilter)
      let status;
      if (selectedFilter === 'validé') {
        status = 2;
      } else if (selectedFilter === 'non validé') {
        status = 1;
      } else if (selectedFilter === 'rejeté') {
        status = 4;
      } else if (selectedFilter === 'désactivé') {
        status = 3;
      }
      const response = await getCustAccountInfo(null, status, true);
      setCustAccounts(response.data || []);

      // Optionally log or store the reason
      console.log(
        `Client « ${selectedDisableAccount.cust_name} » désactivé. Raison :`,
        disableReason
      );

      // Close modal
      setOpenDisableModal(false);
      setSelectedDisableAccount(null);
      setDisableReason('');
      alert(`Le client « ${selectedDisableAccount.cust_name} » a été désactivé avec succès.`);
    } catch (error) {
      console.error('Erreur lors de la désactivation du client :', error);
      alert('Impossible de désactiver ce client.');
    }
  };

  const canAct = (isMainUser || isOpUser)
    && selectedFilter !== 'non validé'
    && selectedFilter !== 'rejeté';

  function getInformationsLabel(registration) {
    // 1) Zone franche ⇒ Licence
    if (registration.in_free_zone === true) {
      return registration.identification_number && registration.identification_number !== 'null' ? (
        <span>
          <strong>Licence :</strong> {registration.identification_number}
        </span>
      ) : null;
    }

    // 2) Si l’on dispose d’un NIF ou d’un RCS ⇒ toujours les afficher
    const hasNIF = registration.trade_registration_num && registration.trade_registration_num !== 'null';
    const hasRCS = registration.register_number && registration.register_number !== 'null';

    if (hasNIF || hasRCS) {
      return (
        <span>
          <strong>NIF :</strong> {hasNIF ? registration.trade_registration_num : 'N/A'}
          <br />
          <strong>RCS :</strong> {hasRCS ? registration.register_number : 'N/A'}
        </span>
      );
    }

    // 3) Cas résiduel ⇒ “Autre type”
    return <strong></strong>;
  }

  const renderTableView = () => (
    <Paper>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Date de soumission</TableCell>
              <TableCell>Client</TableCell>
              <TableCell>Secteur</TableCell>
              <TableCell>Adresse Complète</TableCell>
              <TableCell>Pays</TableCell>
              <TableCell>Type d'entreprise</TableCell>
              <TableCell>Informations</TableCell>
              <TableCell>Contact Principal</TableCell>
              {((isMainUser || isOpUser)
                && selectedFilter !== 'non validé'
                && selectedFilter !== 'rejeté'
              ) && <TableCell>Action</TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredAccounts.map((registration) => (
              <TableRow key={registration.id_cust_account}>
                <TableCell>{formatDate(registration.insertdate)}</TableCell>
                <TableCell>
                  {registration.cust_name} {registration.legal_form}
                  {registration.legal_form?.toLowerCase() === 'autre' && registration.other_legal_form && (
                    <> — {registration.other_legal_form}</>
                  )}
                </TableCell>
                <TableCell>
                  {registration.sectorName?.symbol_fr?.toLowerCase() === 'autres'
                    ? `AUTRES : ${safeValue(registration.other_sector)}`
                    : safeValue(registration.sectorName?.symbol_fr || 'N/A')}
                </TableCell>
                <TableCell>{registration.full_address}</TableCell>
                <TableCell>{registration.co_symbol_fr}</TableCell>
                <TableCell>{getImplantationLabel(registration)}</TableCell>
                <TableCell>
                  {getInformationsLabel(registration)}
                  {(selectedFilter === 'non validé' || selectedFilter === 'rejeté') &&
                    registration.files?.length > 0 && (
                      <Box mt={1}>
                        {registration.files.map((file) => {
                          const fileUrl = `${API_URL}/files/inscriptions/${new Date().getFullYear()}/${file.file_guid}`;
                          return (
                            <Typography key={file.id_cust_account_files} variant="body2">
                              <a
                                href={fileUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ color: '#C39408', textDecoration: 'none' }}
                              >
                                📎 {file.txt_description_fr || 'Document'}
                              </a>
                            </Typography>
                          );
                        })}
                      </Box>
                    )}

                </TableCell>

                <TableCell>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<FontAwesomeIcon icon={faEye} />}
                    onClick={() => handleOpenContactsModal(registration)}
                    style={{ color: '#C39408', borderColor: '#C39408' }}
                  >
                    Ouvrir
                  </Button>
                </TableCell>

                {selectedFilter !== 'non validé' && selectedFilter !== 'rejeté' && (
                  <>
                    {/* ---- colonne ACTION : icône ⋮ ---- */}
                    {canAct && (
                      <TableCell>
                        <IconButton
                          onClick={(e) => handleMenuOpen(e, registration)}
                          size="small"
                        >
                          <FontAwesomeIcon icon={faEllipsisV} style={{ color: '#C39408' }} />
                        </IconButton>
                      </TableCell>
                    )}
                  </>
                )}

              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );


  // Rendu en mode Card (mobile)
  const renderCardView = () => (
    <Grid container spacing={2}>
      {filteredAccounts.map((registration) => (
        <Grid item xs={12} key={registration.id_cust_account}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2">
                <strong>Date :</strong> {formatDate(registration.insertdate)}
              </Typography>
              <Typography variant="subtitle2">
                <strong>Client :</strong> {registration.legal_form} {registration.cust_name}
              </Typography>
              <Typography variant="subtitle2">
                <strong>Secteur :</strong> {registration.sectorName?.symbol_fr || 'N/A'}
              </Typography>
              <Typography variant="subtitle2">
                <strong>Adresse :</strong> {registration.full_address}
              </Typography>
              <Typography variant="subtitle2">
                <strong>Pays :</strong> {registration.co_symbol_fr}
              </Typography>
              <Typography variant="subtitle2">
                <strong>Type :</strong> {getImplantationLabel(registration)}
              </Typography>
              <Typography variant="subtitle2" sx={{ mt: 1 }}>
                <strong>Fichiers :</strong>
              </Typography>
              {registration.files && registration.files.length > 0 ? (
                registration.files.map((file) => {
                  let fileDescription = file.txt_description_fr || 'Type inconnu';
                  if (fileDescription.toLowerCase().includes('nif')) {
                    fileDescription = 'Patente';
                  }
                  return (
                    <Button
                      key={file.id_files_repo}
                      variant="text"
                      size="small"
                      onClick={() => handleFileClick(file)}
                      style={{ color: '#C39408' }}
                    >
                      {fileDescription}
                    </Button>
                  );
                })
              ) : (
                <Typography variant="body2">Aucun fichier</Typography>
              )}
              {registration.in_free_zone && registration.identification_number && (
                <Box mt={1} fontStyle="italic">
                  Numéro de licence : <strong>{registration.identification_number}</strong>
                </Box>
              )}
              {!registration.in_free_zone && registration.trade_registration_num && (
                <Box mt={1} fontStyle="italic">
                  Patente : <strong>{registration.trade_registration_num}</strong>
                </Box>
              )}
              {!registration.in_free_zone && registration.register_number && (
                <Box mt={1} fontStyle="italic">
                  RCS : <strong>{registration.register_number}</strong>
                </Box>
              )}
            </CardContent>
            <CardActions>
              {/* 1 — Ouvrir le contact principal */}
              <Button
                variant="outlined"
                size="small"
                startIcon={<FontAwesomeIcon icon={faEye} />}
                onClick={() => handleOpenContactsModal(registration)}
                style={{ color: '#C39408', borderColor: '#C39408' }}
              >
                Ouvrir
              </Button>

              {/* 2 — Gérer les fichiers (toujours visible) */}
              <Button
                variant="outlined"
                size="small"
                onClick={() => handleOpenFileModal(registration)}
                style={{ color: '#C39408', borderColor: '#C39408' }}
              >
                Gérer les fichiers
              </Button>

              {/* 3 — Menu d’action (⋮) : seulement Modifier / (Dés)activer */}
              {canAct && (
                <TableCell>
                  <IconButton onClick={e => handleMenuOpen(e, registration)}>
                    <FontAwesomeIcon icon={faEllipsisV} style={{ color: filterColor }} />
                  </IconButton>
                </TableCell>
              )}

            </CardActions>


          </Card>
        </Grid>
      ))}
    </Grid>
  );

  /* juste au‑dessus du return principal, dans ClientsValides */

  const FilterSwitcher = () => {
    if (!isOpUser) return null;         // pas d’opérateur → rien

    // --- MOBILE : Select déroulant ---
    if (isSmallScreen) {
      return (
        <FormControl fullWidth size="small" sx={{ my: 2 }}>
          <InputLabel
            id="mobile-filter-label"
            sx={{
              color: filterColor,
              '&.Mui-focused': { color: filterColor }         // couleur de l’étiquette quand on clique
            }}
          >
            Filtrer
          </InputLabel>

          <Select
            labelId="mobile-filter-label"
            value={selectedFilter}
            label="Filtrer"
            onChange={(e) => setSelectedFilter(e.target.value)}
            sx={{
              /* texte, icône et bordures : couleur CCD */
              color: filterColor,
              '& .MuiSvgIcon-root': { color: filterColor },
              '& .MuiOutlinedInput-notchedOutline': { borderColor: filterColor },
              '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: filterColor },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: filterColor },
            }}
            /* couleur de l’item sélectionné + hover dans la liste */
            MenuProps={{
              PaperProps: {
                sx: {
                  '& .MuiMenuItem-root.Mui-selected': {
                    backgroundColor: filterColor,
                    color: '#fff',
                  },
                  '& .MuiMenuItem-root:hover': {
                    backgroundColor: filterColor,
                    color: '#fff',
                  },
                },
              },
            }}
          >
            <MenuItem value="validé">Clients validés</MenuItem>
            <MenuItem value="non validé">Clients non validés</MenuItem>
            <MenuItem value="désactivé">Clients désactivés</MenuItem>
            <MenuItem value="rejeté">Inscriptions rejetées</MenuItem>
          </Select>
        </FormControl>

      );
    }

    // --- DESKTOP : 4 boutons comme avant ---
    return (
      <Box sx={{ mt: 2, mb: 2, display: 'flex', gap: 2 }}>
        {['validé', 'non validé', 'désactivé', 'rejeté'].map((f) => (
          <Button
            key={f}
            variant={selectedFilter === f ? 'contained' : 'outlined'}
            onClick={() => setSelectedFilter(f)}
            style={
              selectedFilter === f
                ? { backgroundColor: '#C39408', color: '#fff' }
                : { color: '#C39408', borderColor: '#C39408' }
            }
          >
            {f === 'validé' && 'Clients validés'}
            {f === 'non validé' && 'Clients non validés'}
            {f === 'désactivé' && 'Clients désactivés'}
            {f === 'rejeté' && 'Inscriptions rejetées'}
          </Button>
        ))}
      </Box>
    );
  };



  return (

    <Box sx={{ ml: { xs: '2px', md: '240px' }, p: 3 }} className="inscriptions-page-container">
      <AppBar position="static" color="default">
        <Tabs
          value={tabIndex}
          onChange={handleTabChange}
          indicatorColor="secondary"
          textColor="inherit"
          variant="fullWidth"
          aria-label="Clients validés Tabs"
        >
          <Tab label={`CLIENTS (${custAccounts.length})`} {...a11yProps(0)} />
        </Tabs>
      </AppBar>

      {/* --- Sélecteur de filtre --- */}
      <FilterSwitcher />


      {/* Recherche */}
      {isOpUser && (

        <Box mb={2} display="flex" alignItems="center" gap={2}>
          <Typography>Rechercher :</Typography>
          <TextField
            id="searchInput"
            variant="outlined"
            placeholder="Tapez un mot-clé ou un chiffre..."
            size="small"
            value={searchTerm}
            onChange={handleSearch}
            style={{ maxWidth: 300 }}
          />
        </Box>
      )}

      {isSmallScreen ? renderCardView() : renderTableView()}

      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
        {/* Modifier */}
        <MenuItem
          onClick={() => {
            handleOpenEditModal(selectedMenuAccount);
            handleMenuClose();
          }}
        >

          Modifier
        </MenuItem>

        {/* ---------- Gérer les fichiers ---------- */}
        {selectedMenuAccount && (
          <MenuItem
            onClick={() => {
              handleOpenFileModal(selectedMenuAccount);  // ← même fonction que l’ancien bouton
              handleMenuClose();
            }}
          >
            Gérer les fichiers
          </MenuItem>
        )}


        {/* Activer ou Désactiver selon le filtre */}
        {isOpUser && selectedMenuAccount && (
          <MenuItem
            onClick={() => {
              if (selectedFilter === 'désactivé') {
                handleReactivateConfirm(selectedMenuAccount);
              } else {
                handleOpenDisableModal(selectedMenuAccount);
              }
              handleMenuClose();
            }}
          >
            {selectedFilter === 'désactivé' ? 'Activer' : 'Désactiver'}
          </MenuItem>
        )}
      </Menu>


      <Dialog
        open={openFileModal}
        onClose={handleCloseFileModal}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Gérer les fichiers justificatifs</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            {selectedFileAccount?.files?.length > 0 ? (
              selectedFileAccount.files.map((file) => {
                const fileUrl = `${API_URL}/files/inscriptions/${new Date().getFullYear()}/${file.file_guid}`;
                return (
                  <Box
                    key={file.id_cust_account_files}
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                    sx={{
                      mb: 1,
                      p: 1,
                      border: '1px solid #ddd',
                      borderRadius: '4px'
                    }}
                  >
                    <Typography variant="body2">
                      <a href={fileUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#C39408', textDecoration: 'none' }}>
                        {file.txt_description_fr || 'Type inconnu'} : {file.file_origin_name}
                      </a>
                    </Typography>
                    <Button
                      variant="outlined"
                      color="error"
                      size="small"
                      onClick={() => handleDeleteFile(file.id_cust_account_files)}
                    >
                      Supprimer
                    </Button>
                  </Box>
                );
              })
            ) : (
              <Typography variant="body2">Aucun fichier associé</Typography>
            )}



            <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle2" gutterBottom>
                Ajouter un nouveau fichier :
              </Typography>

              <FormControl fullWidth margin="normal">
                <InputLabel id="file-type-label">Type de fichier</InputLabel>
                <Select
                  labelId="file-type-label"
                  value={selectedFileType}
                  onChange={(e) => setSelectedFileType(e.target.value)}
                  label="Type de fichier"
                >
                  {fileTypes.map((type) => (
                    <MenuItem key={type.id_files_repo_typeof} value={type.id_files_repo_typeof}>
                      {type.txt_description_fr}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <Box
                sx={{
                  mt: 1,
                  display: 'flex',
                  flexDirection: { xs: 'column', sm: 'row' },
                  alignItems: 'center',
                  gap: 2,
                }}
              >
                <Button component="label" variant="outlined">
                  Choisir un fichier
                  <input type="file" hidden onChange={handleFileModalChange} />
                </Button>

                <Button
                  variant="contained"
                  sx={{ backgroundColor: '#C39408', color: '#fff' }}
                  onClick={handleSaveFileModal}
                  disabled={!fileData.justificatifFile || !selectedFileType}
                >
                  + Ajouter le fichier
                </Button>
              </Box>

              {fileData.justificatifFile && (
                <Typography variant="body2" sx={{ mt: 1 }}>
                  Fichier sélectionné : {fileData.justificatifFile.name}
                </Typography>
              )}
            </Box>

          </Box>

        </DialogContent>



        <DialogActions>
          <Button onClick={handleCloseFileModal} color="error">
            Fermer
          </Button>
        </DialogActions>
      </Dialog>
      {/* Modale d'édition */}
      <Dialog
        open={openEditModal}
        onClose={handleCloseEditModal}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Modifier les informations du client</DialogTitle>
        <DialogContent>
          <Box component="form" noValidate sx={{ mt: 2 }}>
            <TextField
              margin="normal"
              fullWidth
              label="Nom de l'entreprise"
              name="companyName"
              value={safeValue(editFormData.companyName)}
              onChange={handleEditChange}
            />
            <FormControl fullWidth required sx={{ mt: 2 }}>
              <InputLabel id="legal-form-label">Statut juridique</InputLabel>
              <Select
                labelId="legal-form-label"
                name="legalForm"
                value={safeValue(editFormData.legalForm)}
                label="Statut juridique"
                onChange={handleEditChange}
              >
                <MenuItem value="" disabled hidden>Choisir</MenuItem>
                <MenuItem value="Auto-entrepreneur">Auto-entrepreneur</MenuItem>
                <MenuItem value="Entreprise individuelle">Entreprise individuelle</MenuItem>
                <MenuItem value="EIRL">EIRL</MenuItem>
                <MenuItem value="EURL">EURL</MenuItem>
                <MenuItem value="SARL">SARL</MenuItem>
                <MenuItem value="SAS">SAS</MenuItem>
                <MenuItem value="SASU">SASU</MenuItem>
                <MenuItem value="SA">SA</MenuItem>
                <MenuItem value="SNC">SNC</MenuItem>
                <MenuItem value="SCS">SCS</MenuItem>
                <MenuItem value="Autre">Autre</MenuItem>
              </Select>
            </FormControl>

            {editFormData.legalForm === 'Autre' && (
              <TextField
                margin="normal"
                fullWidth
                label="Précisez votre statut juridique"
                name="otherLegalForm"
                value={safeValue(editFormData.otherLegalForm)}
                onChange={handleEditChange}
              />
            )}


            <TextField
              margin="normal"
              fullWidth
              label="Adresse complète"
              name="fullAddress"
              value={safeValue(editFormData.fullAddress)}
              onChange={handleEditChange}
            />
            <TextField
              margin="normal"
              fullWidth
              label="Pays"
              name="country"
              value={safeValue(editFormData.country)}
              onChange={handleEditChange}
              disabled
              InputProps={{ style: { backgroundColor: '#f0f0f0' } }}
            />
            <FormControl margin="normal" fullWidth>
              <InputLabel id="edit-company-type-label">Type d'entreprise</InputLabel>
              <Select
                labelId="edit-company-type-label"
                id="edit-company-type-select"
                name="companyType"
                value={safeValue(editFormData.companyType)}
                onChange={handleEditChange}
                label="Type d'entreprise"
              >
                <MenuItem value="autre">Entreprise</MenuItem>
                <MenuItem value="zoneFranche">Entreprise en zone franche</MenuItem>
                <MenuItem value="autres">Autre</MenuItem>
              </Select>
            </FormControl>
            {safeValue(editFormData.companyType) === 'zoneFranche' ? (
              <TextField
                margin="normal"
                fullWidth
                label="Numéro de licence"
                name="licenseNumber"
                value={safeValue(editFormData.licenseNumber)}
                onChange={handleEditChange}
              />
            ) : safeValue(editFormData.companyType) === 'autre' ? (
              <>
                <TextField
                  margin="normal"
                  fullWidth
                  label="NIF"
                  name="nif"
                  value={safeValue(editFormData.nif)}
                  onChange={handleEditChange}
                />
                <TextField
                  margin="normal"
                  fullWidth
                  label="Numéro RCS"
                  name="rchNumber"
                  value={safeValue(editFormData.rchNumber)}
                  onChange={handleEditChange}
                />
              </>
            ) : null}
            <FormControl margin="normal" fullWidth>
              <InputLabel id="edit-sector-label">Secteur</InputLabel>
              <Select
                labelId="edit-sector-label"
                id="edit-sector-select"
                name="sector"
                value={safeValue(editFormData.sector)}
                onChange={handleEditChange}
                label="Secteur"
              >
                {sectors.map((sector) => (
                  <MenuItem key={sector.id_sector} value={sector.symbol_fr}>
                    {sector.symbol_fr.charAt(0).toUpperCase() +
                      sector.symbol_fr.slice(1).toLowerCase()}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            {editFormData.sector?.toLowerCase() === 'autres' && (
              <TextField
                margin="normal"
                fullWidth
                label="Précisez votre secteur d'activité"
                name="otherSector"
                value={safeValue(editFormData.otherSector)}
                onChange={handleEditChange}
              />
            )}


          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEditModal} color="error">
            Annuler
          </Button>
          <Button
            onClick={handleSaveEdit}
            variant="contained"
            style={{ backgroundColor: '#C39408', color: '#fff' }}
          >
            Sauvegarder
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={openDisableModal}
        onClose={() => setOpenDisableModal(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Désactiver ce client</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Veuillez indiquer la raison de la désactivation du client :
            <strong>{selectedDisableAccount?.cust_name}</strong>
          </Typography>
          <TextField
            label="Raison de désactivation"
            variant="outlined"
            multiline
            rows={3}
            fullWidth
            value={disableReason}
            onChange={(e) => setDisableReason(e.target.value)}
            error={!disableReason.trim()}
            helperText={!disableReason.trim() ? 'Veuillez saisir un motif' : ''}
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setOpenDisableModal(false)}
            color="error"
          >
            Annuler
          </Button>
          <Button
            onClick={handleDisableConfirm}
            variant="contained"
            style={{ backgroundColor: '#C39408', color: '#fff' }}
            disabled={!disableReason.trim()}
          >
            Désactiver
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={openContactModal}
        onClose={handleCloseContactModal}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Envoyer un message</DialogTitle>
        <DialogContent>
          <Typography>À : <strong>{selectedContactEmail}</strong></Typography>
          <TextField
            label="Message"
            value={mailMessage}
            onChange={(e) => setMailMessage(e.target.value)}
            multiline
            rows={6}
            fullWidth
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseContactModal} color="error">
            Annuler
          </Button>
          <Button
            variant="contained"
            style={{ backgroundColor: '#C39408', color: '#fff' }}
            onClick={async () => {
console.log(selectedAccount);
              const customerName = selectedAccount?.id_cust_account || order.cust_name || 'Client';
              const orderTitle = order.order_title;
              const rawDate = new Date(order.insertdate_order);
              const formattedDate = rawDate.toLocaleDateString('fr-FR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
              });

              // 2) Build the HTML body
              const htmlBody = `
  <p>Bonjour ${customerName},</p>
  <p>Veuillez trouver ci-dessous une information concernant votre commande « ${orderTitle} » du ${formattedDate}.</p>
  <p><strong>${mailMessage}</strong></p>
  <p>Nous restons à votre disposition pour toute question.</p>
  <p>Bien cordialement,<br/><strong>L'équipe du portail de la Chambre de Commerce de Djibouti</strong></p>
`.trim();

              try {
                if (isOpUser) {
                  await sendEmailAndMemo({
                    to: selectedContactEmail,
                    subject: 'Titre du message : La Chambre de Commerce de Djibouti vous a envoyé un message',
                    body: htmlBody,
                    isHtml: true,
                    id_cust_account: selectedAccount?.id_cust_account,
                    idlogin: idLogin,
                  });
                }

                alert('Message envoyé avec succès et mémo enregistré.');
                handleCloseContactModal();
              } catch (error) {
                console.error("Erreur lors de l'envoi de l'email et de l'enregistrement du mémo :", error);
                alert('Erreur lors de l’envoi du message.');
              }
            }}
          >
            Envoyer
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modale Contact Principal */}
      <Dialog
        open={showContactModal && !!selectedAccount}
        onClose={handleCloseContactsModal}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>Contact Principal</DialogTitle>
        <DialogContent>
          {selectedAccount?.main_contact && selectedAccount.main_contact.length > 0 ? (
            <TableContainer component={Paper}>
              <Table size="medium">
                <TableHead>
                  <TableRow>
                    <TableCell>Nom</TableCell>
                    <TableCell>Fonction</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Tél</TableCell>
                    <TableCell>Portable</TableCell>
                    {isOpUser && <TableCell>Actions</TableCell>}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {selectedAccount.main_contact.map((contact) => (
                    <TableRow key={contact.id_cust_user}>
                      <TableCell>{contact.full_name || 'N/A'}</TableCell>
                      <TableCell>{contact.position || 'N/A'}</TableCell>
                      <TableCell>{contact.email || 'N/A'}</TableCell>
                      <TableCell>{contact.phone_number || 'N/A'}</TableCell>
                      <TableCell>{contact.mobile_number || 'N/A'}</TableCell>
                      {isOpUser && (
                        <TableCell>
                          <Button
                            variant="outlined"
                            size="small"
                            style={{ color: '#C39408', borderColor: '#C39408' }}
                            onClick={() => handleOpenContactModal(contact.email)}
                          >
                            Contacter
                          </Button>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Typography>Aucun contact principal trouvé</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseContactsModal} color="error">
            Fermer
          </Button>
        </DialogActions>
      </Dialog>
      <Snackbar
        open={fileAlertOpen}
        autoHideDuration={6000}
        onClose={() => setFileAlertOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setFileAlertOpen(false)}
          severity="info"
          sx={{ width: '100%' }}
        >
          Veuillez ajouter les fichiers correspondant à votre type d'entreprise.
        </Alert>
      </Snackbar>

    </Box>


  );
};

export default ClientsValides;