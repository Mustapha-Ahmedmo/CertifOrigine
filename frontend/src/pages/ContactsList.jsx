// ContactsList.jsx
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import {
  getCustUsersByAccount,
  setCustUser,
  deleteCustUser,
} from '../services/apiServices';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faEdit, faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import './ContactsList.css'; 
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
  Alert,
} from '@mui/material';

// (optionnel) si tu voulais chiffrer le mot de passe
// import { homemadeHash } from '../utils/hashUtils';

const ContactsList = () => {
  const { user } = useSelector((state) => state.auth);
  const custAccountId = user?.id_cust_account;

  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Barre de recherche
  const [searchTerm, setSearchTerm] = useState('');

  // Modale : ajout ou édition
  const [showModal, setShowModal] = useState(false);
  const [modalError, setModalError] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  // Contact en cours (pour la modale)
  const [currentContact, setCurrentContact] = useState({
    id_cust_user: 0,
    full_name: '',
    position: '',
    email: '',
    phone_number: '',
    mobile_number: '',
    ismain_user: false,
    // On retire totalement password si on veut
    password: '',
    confirmPassword: '',
  });

  // Récupération des contacts
  useEffect(() => {
    const fetchContacts = async () => {
      try {
        if (!custAccountId) {
          setError('Aucun compte client trouvé.');
          setLoading(false);
          return;
        }
        const result = await getCustUsersByAccount(
          custAccountId,
          null,
          'true',
          'true',
          null
        );
        setContacts(result.data || []);
      } catch (err) {
        console.error('Error fetching contacts:', err);
        setError('Une erreur est survenue lors de la récupération des contacts.');
      } finally {
        setLoading(false);
      }
    };
    fetchContacts();
  }, [custAccountId]);

  // Filtrage local via searchTerm
  const filteredContacts = contacts.filter((contact) => {
    const search = searchTerm.toLowerCase().trim();
    if (!search) return true;
    const fieldsToSearch = [
      contact.full_name,
      contact.position,
      contact.email,
      contact.phone_number,
      contact.mobile_number,
    ]
      .filter(Boolean)
      .map((val) => val.toLowerCase());
    return fieldsToSearch.some((field) => field.includes(search));
  });

  // Ouvrir la modale en mode Ajout (pas de champs mot de passe)
  const handleOpenAddModal = () => {
    setModalError('');
    setIsEditing(false);
    setCurrentContact({
      id_cust_user: 0,
      full_name: '',
      position: '',
      email: '',
      phone_number: '',
      mobile_number: '',
      ismain_user: false,
      // Pour l'add, on ignore password/confirmPassword
      password: '',
      confirmPassword: '',
    });
    setShowModal(true);
  };

  // Ouvrir la modale en mode Édition
  const handleOpenEditModal = (contact) => {
    setModalError('');
    setIsEditing(true);
    setCurrentContact({
      id_cust_user: contact.id_cust_user,
      full_name: contact.full_name || '',
      position: contact.position || '',
      email: contact.email || '',
      phone_number: contact.phone_number || '',
      mobile_number: contact.mobile_number || '',
      ismain_user: contact.ismain_user || false,
      // Ici, on propose un champ password si on veut
      // ex : nouveau mot de passe facultatif
      password: '',
      confirmPassword: '',
    });
    setShowModal(true);
  };

  // Fermer la modale
  const handleCloseModal = () => {
    setShowModal(false);
  };

  // Gérer la saisie (modale)
  const handleChange = (field, value) => {
    setCurrentContact((prev) => ({ ...prev, [field]: value }));
  };

  // Sauvegarder
  const handleSaveContact = async () => {
    // Si on ne veut pas du tout de mot de passe en ajout, on ignore tout ça
    // et on enverra pwd = null au back pour la création
    // (afin que le user reçoive un mail de "réinitialisation" côté back)

    const {
      id_cust_user,
      full_name,
      position,
      email,
      phone_number,
      mobile_number,
      ismain_user,
      password,
      confirmPassword,
    } = currentContact;

    // Vérif champs obligatoires
    if (!full_name || !email) {
      setModalError("Veuillez renseigner au minimum le nom et l'email du contact.");
      return;
    }

    // Si on est en mode édition ET qu'on veut permettre un nouveau mot de passe :
    if (isEditing && (password || confirmPassword)) {
      if (password !== confirmPassword) {
        setModalError('Les mots de passe ne correspondent pas.');
        return;
      }
    }

    try {
      setModalError('');

      let pwdToSend = null;
      if (isEditing) {
        // en édition, si le password est non vide, on met ce champ
        if (password.trim()) {
          // => si tu veux le chiffrer : pwdToSend = homemadeHash(password.trim());
          pwdToSend = password.trim();
        }
        // si password est vide, on envoie null => pas de changement
      } else {
        // on est en création => on ne met pas de password => le contact recevra un mail
        pwdToSend = null;
      }

      const payload = {
        id_cust_user: isEditing ? id_cust_user : 0,
        id_cust_account: custAccountId,
        gender: 0, // ou 1 si besoin
        full_name,
        position,
        email,
        phone_number,
        mobile_number,
        pwd: pwdToSend, 
        ismain_user,
        statut_flag: 1,
        id_login_insert: user?.id_login_user || 1,
        id_login_modify: isEditing ? (user?.id_login_user || 1) : null,
      };

      await setCustUser(payload);

      // Rechargement
      const updated = await getCustUsersByAccount(custAccountId, null, 'true', 'true', null);
      setContacts(updated.data || []);

      setShowModal(false);

      // Ici, tu peux appeler ton endpoint "sendMailForNewContact" si c'est un nouveau contact
      // if (!isEditing) {
      //   await sendMailForNewContact(email);
      // }

    } catch (err) {
      console.error('Erreur lors de la création/édition du contact:', err);
      setModalError(
        isEditing
          ? 'Impossible de modifier ce contact.'
          : 'Impossible de créer ce contact.'
      );
    }
  };

  // Suppression
  const handleDelete = async (contactId) => {
    if (!window.confirm('Voulez-vous vraiment désactiver ce contact ?')) {
      return;
    }
    try {
      await deleteCustUser(contactId);
      setContacts((prev) => prev.filter((c) => c.id_cust_user !== contactId));
      alert('Contact désactivé avec succès.');
    } catch (err) {
      console.error('Erreur lors de la suppression du contact:', err);
      alert('Impossible de désactiver ce contact.');
    }
  };

  // Affichage conditionnel en cas de chargement ou erreur
  if (loading) {
    return <Box sx={{ ml: '240px', p: 3 }}>Chargement en cours...</Box>;
  }
  if (error) {
    return (
      <Box sx={{ ml: '240px', p: 3 }}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ ml: '240px', p: 3 }}>
      {/* Entête façon "DestinataireList" */}
      <Paper elevation={1} sx={{ mb: 2 }}>
        <Box
          sx={{
            p: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Typography variant="h6">LISTE DES CONTACTS</Typography>
          <Button
            variant="contained"
            startIcon={<FontAwesomeIcon icon={faPlus} />}
            onClick={handleOpenAddModal}
          >
            Ajouter un contact
          </Button>
        </Box>
      </Paper>

      {/* Barre de recherche */}
      <Box mb={2} display="flex" alignItems="center" gap={2}>
        <Typography>Rechercher :</Typography>
        <TextField
          variant="outlined"
          placeholder="Tapez un nom, email, téléphone..."
          size="small"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ maxWidth: 300 }}
        />
      </Box>

      {/* Tableau */}
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Nom</TableCell>
                <TableCell>Fonction</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Tél</TableCell>
                <TableCell>Portable</TableCell>
                <TableCell>Principal ?</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredContacts.map((contact) => (
                <TableRow key={contact.id_cust_user}>
                  <TableCell>{contact.full_name}</TableCell>
                  <TableCell>{contact.position}</TableCell>
                  <TableCell>
                    <a href={`mailto:${contact.email}`}>{contact.email}</a>
                  </TableCell>
                  <TableCell>{contact.phone_number}</TableCell>
                  <TableCell>{contact.mobile_number}</TableCell>
                  <TableCell>
                    <input
                      type="checkbox"
                      checked={contact.ismain_user}
                      disabled
                    />
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<FontAwesomeIcon icon={faEdit} />}
                      onClick={() => handleOpenEditModal(contact)}
                      sx={{ mr: 1 }}
                    >
                      Modifier
                    </Button>
                    {/* Si c'est un contact principal, on ne montre pas le bouton Supprimer */}
                    {!contact.ismain_user && (
                      <Button
                        variant="outlined"
                        size="small"
                        color="error"
                        startIcon={<FontAwesomeIcon icon={faTrashAlt} />}
                        onClick={() => handleDelete(contact.id_cust_user)}
                      >
                        Supprimer
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}

              {filteredContacts.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    Aucun contact trouvé.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Modale AJOUT/EDIT */}
      <Dialog
        open={showModal}
        onClose={handleCloseModal}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {isEditing ? 'Modifier le contact' : 'Ajouter un contact'}
        </DialogTitle>
        <DialogContent dividers>
          {modalError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {modalError}
            </Alert>
          )}

          {/* Nom */}
          <TextField
            label="Nom du contact *"
            variant="outlined"
            fullWidth
            value={currentContact.full_name}
            onChange={(e) => handleChange('full_name', e.target.value)}
            sx={{ mb: 2 }}
          />

          {/* Fonction */}
          <TextField
            label="Fonction"
            variant="outlined"
            fullWidth
            value={currentContact.position}
            onChange={(e) => handleChange('position', e.target.value)}
            sx={{ mb: 2 }}
          />

          {/* Email */}
          <TextField
            label="Email *"
            variant="outlined"
            fullWidth
            value={currentContact.email}
            onChange={(e) => handleChange('email', e.target.value)}
            sx={{ mb: 2 }}
          />

          {/* Téléphone fixe */}
          <TextField
            label="Téléphone fixe"
            variant="outlined"
            fullWidth
            value={currentContact.phone_number}
            onChange={(e) => handleChange('phone_number', e.target.value)}
            sx={{ mb: 2 }}
          />

          {/* Téléphone portable */}
          <TextField
            label="Téléphone portable"
            variant="outlined"
            fullWidth
            value={currentContact.mobile_number}
            onChange={(e) => handleChange('mobile_number', e.target.value)}
            sx={{ mb: 2 }}
          />

          {/* MDP : seulement si on édite (et encore c'est facultatif) */}
          {isEditing && (
            <>
              <TextField
                label="Nouveau mot de passe (facultatif)"
                variant="outlined"
                fullWidth
                type="password"
                value={currentContact.password}
                onChange={(e) => handleChange('password', e.target.value)}
                sx={{ mb: 2 }}
              />
              <TextField
                label="Confirmer le nouveau mot de passe"
                variant="outlined"
                fullWidth
                type="password"
                value={currentContact.confirmPassword}
                onChange={(e) => handleChange('confirmPassword', e.target.value)}
              />
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal}>Annuler</Button>
          <Button variant="contained" onClick={handleSaveContact}>
            {isEditing ? 'Enregistrer' : 'Enregistrer'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ContactsList;
