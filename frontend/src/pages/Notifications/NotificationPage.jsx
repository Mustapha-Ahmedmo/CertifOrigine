import React, { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Snackbar,
  IconButton,
  Link as MuiLink,
  Divider
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { ackMemoCust, getMemo } from '../../services/apiServices';
import { format } from 'date-fns';
import './NotificationPage.css';

const safeFormatDate = (dateString) => {
  if (!dateString) return '-';
  try {
    return format(new Date(dateString), "dd MMM yyyy 'à' HH:mm");
  } catch (error) {
    console.error("Error formatting date:", error);
    return dateString;
  }
};

const getChipPropsBySubject = (subject) => {
  switch (subject?.toLowerCase()) {
    case 'message':
      return { label: 'Message', sx: { backgroundColor: '#f44336', color: '#fff' } };
    case 'comment':
      return { label: 'Comment', sx: { backgroundColor: '#9c27b0', color: '#fff' } };
    case 'connect':
      return { label: 'Connect', sx: { backgroundColor: '#2196f3', color: '#fff' } };
    case 'joined new user':
      return { label: 'New User', sx: { backgroundColor: '#4caf50', color: '#fff' } };
    default:
      return { label: subject || 'Note', sx: { backgroundColor: '#607d8b', color: '#fff' } };
  }
};

const Notifications = () => {
  const [memos, setMemos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openConfirm, setOpenConfirm] = useState(false);
  const [selectedMemoId, setSelectedMemoId] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMsg, setSnackbarMsg] = useState('');

  const navigate = useNavigate();
  const location = useLocation();

  // Récupération de l'utilisateur depuis Redux
  const user = useSelector((state) => state.auth.user);
  const custAccountId = user?.id_cust_account;
  const isOperator = user?.isopuser;
  const idLogin = user?.id_login_user;

  const queryParams = new URLSearchParams(location.search);
  const showAll = queryParams.get('all') === 'true';

  const fetchMemos = useCallback(async () => {
    if (custAccountId) {
      const params = {
        p_isAck: showAll ? null : 'false',
        p_id_cust_account: custAccountId,
        p_isopuser: isOperator ? 'true' : 'false',
      };
      try {
        const result = await getMemo(params);
        if (result && result.data) {
          setMemos(result.data);
        }
      } catch (error) {
        console.error('Error fetching memos:', error);
      } finally {
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, [custAccountId, isOperator, showAll]);

  useEffect(() => {
    fetchMemos();
  }, [fetchMemos]);

  useEffect(() => {
    const handleMemoAck = () => {
      fetchMemos();
    };
    window.addEventListener('memoAck', handleMemoAck);
    return () => {
      window.removeEventListener('memoAck', handleMemoAck);
    };
  }, [fetchMemos]);

  const handleAcknowledgeClick = (memoId) => {
    setSelectedMemoId(memoId);
    setOpenConfirm(true);
  };

  const handleConfirmAcknowledge = async () => {
    try {
      await ackMemoCust(selectedMemoId, custAccountId, idLogin);
      window.dispatchEvent(new Event('memoAck'));
      setMemos((prev) => prev.filter((m) => m.id_memo !== selectedMemoId));
      setSnackbarMsg("Memo acquitté avec succès.");
      setSnackbarOpen(true);
    } catch (error) {
      console.error("Erreur lors de l'acquittement du memo:", error);
      setSnackbarMsg("Erreur lors de l'acquittement.");
      setSnackbarOpen(true);
    } finally {
      setOpenConfirm(false);
      setSelectedMemoId(null);
    }
  };

  const handleCancelAcknowledge = () => {
    setOpenConfirm(false);
    setSelectedMemoId(null);
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  if (loading) {
    return (
      <Box sx={{ p: 2, ml: '240px' }}>
        <Typography sx={{ fontSize: '0.8rem' }}>Chargement des notifications...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2, ml: '240px' }}>
     

      {memos.length === 0 ? (
        <Typography sx={{ fontSize: '0.8rem' }}>Aucune notification.</Typography>
      ) : (
        <Paper sx={{ p: 2, borderRadius: 2, boxShadow: 2 }}>
          {memos.map((memo, index) => {
            const {
              id_memo,
              memo_date,
              memo_subject,
              memo_body,
              ack_date,
              order_title,
              cust_name,
              id_order,
              id_ord_certif_ori,
            } = memo;

            const dateFormatted = safeFormatDate(memo_date);
            const dateAckFormatted = ack_date ? safeFormatDate(ack_date) : null;
            // Utilisation de la fonction d'origine pour le Chip
            const chipProps = getChipPropsBySubject(memo_subject);

            return (
              <Box key={id_memo} sx={{ mb: index < memos.length - 1 ? 1 : 0 }}>
                {/* Ligne du haut : bouton d'acquittement et date */}
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mb: 0.5,
                  }}
                >
                  <Box>
                    {!isOperator && !ack_date && (
                      <IconButton
                        onClick={() => handleAcknowledgeClick(id_memo)}
                        aria-label="Acquitter"
                        color="primary"
                        size="small"
                      >
                        <CloseIcon sx={{ fontSize: '1rem' }} />
                      </IconButton>
                    )}
                  </Box>
                  <Box sx={{ textAlign: 'right' }}>
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                      {dateFormatted}
                    </Typography>
                    {ack_date && (
                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }} display="block">
                        Acquitté : {dateAckFormatted}
                      </Typography>
                    )}
                  </Box>
                </Box>

                {/* Contenu de la notification */}
                <Box sx={{ mt: 0.5 }}>
                  <Chip size="small" {...chipProps} />
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mt: 0.5, fontSize: '0.8rem' }}>
                    {order_title || 'Notification'}
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 0.5, fontSize: '0.7rem' }}>
                    {memo_body || 'Pas de description.'}
                  </Typography>
                  {isOperator && cust_name && (
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, fontSize: '0.7rem' }}>
                      Client : {cust_name}
                    </Typography>
                  )}
                  <Box sx={{ mt: 0.5 }}>
                    <MuiLink
                      component="button"
                      variant="body2"
                      onClick={() =>
                        navigate(
                          `/dashboard/order-details?orderId=${id_order}&certifId=${id_ord_certif_ori || ''}`
                        )
                      }
                      sx={{ textDecoration: 'underline', cursor: 'pointer', fontSize: '0.7rem' }}
                    >
                      Voir la commande
                    </MuiLink>
                  </Box>
                </Box>
                {/* Divider léger entre notifications, sauf pour la dernière */}
                {index < memos.length - 1 && <Divider sx={{ my: 1 }} />}
              </Box>
            );
          })}
        </Paper>
      )}

      <Dialog open={openConfirm} onClose={handleCancelAcknowledge}>
        <DialogTitle sx={{ fontSize: '0.9rem' }}>Confirmer l'acquittement</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ fontSize: '0.8rem' }}>
            Êtes-vous sûr de vouloir acquitter ce memo ?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelAcknowledge} color="secondary" sx={{ fontSize: '0.7rem' }}>
            Annuler
          </Button>
          <Button onClick={handleConfirmAcknowledge} color="primary" sx={{ fontSize: '0.7rem' }}>
            Confirmer
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
        message={snackbarMsg}
      />
    </Box>
  );
};

export default Notifications;
