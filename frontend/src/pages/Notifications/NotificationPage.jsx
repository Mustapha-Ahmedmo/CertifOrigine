// NotificationPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Link as MuiLink,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Snackbar,
} from '@mui/material';
import { ackMemoCust, getMemo } from '../../services/apiServices';
import './NotificationPage.css';
import { format } from 'date-fns';

// A helper function that safely formats dates
const safeFormatDate = (dateString) => {
  if (!dateString) return '-';
  try {
    return format(new Date(dateString), "dd/MM/yyyy HH:mm");
  } catch (error) {
    console.error("Error formatting date:", error);
    return dateString;
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

  // Retrieve the logged-in user details from Redux
  const user = useSelector((state) => state.auth.user);
  const custAccountId = user?.id_cust_account;
  const isOperator = user?.isopuser; // true if operator, false otherwise
  const idLogin = user?.id_login_user;

  // Determine if we want to show all memos or only unacknowledged ones from query parameter "all"
  const queryParams = new URLSearchParams(location.search);
  const showAll = queryParams.get('all') === 'true';

  // Define fetchMemos outside useEffect so we can call it on event as well.
  const fetchMemos = useCallback(async () => {
    if (custAccountId) {
      const params = {
        // When showAll is true, don't filter by ack status; otherwise, only unacknowledged memos
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

  // Initial fetch on mount (and when dependencies change)
  useEffect(() => {
    fetchMemos();
  }, [fetchMemos]);

  // Listen for custom "memoAck" events and refresh the memo list accordingly.
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
    // Open confirmation modal and set the selected memo ID
    setSelectedMemoId(memoId);
    setOpenConfirm(true);
  };

  const handleConfirmAcknowledge = async () => {
    try {
      await ackMemoCust(selectedMemoId, custAccountId, idLogin);
      // Dispatch an event so that other components (e.g., header) can refresh their counts
      window.dispatchEvent(new Event('memoAck'));
      // Optionally remove the acknowledged memo from the list (or you can refetch)
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
      <Box sx={{ p: 2 }}>
        <Typography>Chargement des notifications...</Typography>
      </Box>
    );
  }

  return (
    <div className="notifications-page">
      <Box sx={{ p: 2 }}>
        <Typography variant="h4" gutterBottom>
          Notifications
        </Typography>
        {memos.length === 0 ? (
          <Typography>Aucune notification.</Typography>
        ) : (
          <TableContainer component={Paper}>
            <Table aria-label="notifications table">
              <TableHead>
                <TableRow>
                  <TableCell>Date Memo</TableCell>
                  {isOperator && <TableCell>Cust Name</TableCell>}
                  <TableCell>Order Title</TableCell>
                  <TableCell>Recipient Name</TableCell>
                  <TableCell>Memo Subject</TableCell>
                  <TableCell>Memo Body</TableCell>
                  {showAll && <TableCell>Ack Date</TableCell>}
                  <TableCell>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {memos.map((memo) => (
                  <TableRow key={memo.id_memo}>
                    <TableCell>{safeFormatDate(memo.memo_date)}</TableCell>
                    {isOperator && (
                      <TableCell>{memo.cust_name}</TableCell>
                    )}
                    <TableCell>{memo.order_title}</TableCell>
                    <TableCell>{memo.recipient_name}</TableCell>
                    <TableCell>{memo.memo_subject}</TableCell>
                    <TableCell>{memo.memo_body}</TableCell>
                    {showAll && (
                      <TableCell>
                        {memo.ack_date ? safeFormatDate(memo.ack_date) : '-'}
                      </TableCell>
                    )}
                    <TableCell>
                      {/* Link to view the order details */}
                      <MuiLink
                        component="button"
                        variant="body2"
                        onClick={() =>
                          navigate(`/dashboard/order-details?orderId=${memo.id_order}&certifId=${memo.id_ord_certif_ori || ''}`)
                        }
                        sx={{ mr: 1 }}
                      >
                        Voir la commande
                      </MuiLink>
                      {/* "S’acquitter" appears only if user is not an operator and ack_date is null */}
                      {!isOperator && !memo.ack_date && (
                        <MuiLink
                          component="button"
                          variant="body2"
                          onClick={() => handleAcknowledgeClick(memo.id_memo)}
                        >
                          S’acquitter
                        </MuiLink>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>

      {/* Confirmation Modal for Acknowledging a Memo */}
      <Dialog open={openConfirm} onClose={handleCancelAcknowledge}>
        <DialogTitle>Confirmer l'acquittement</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Êtes-vous sûr de vouloir acquitter ce memo ?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelAcknowledge} color="secondary">
            Annuler
          </Button>
          <Button onClick={handleConfirmAcknowledge} color="primary">
            Confirmer
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for feedback */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
        message={snackbarMsg}
      />
    </div>
  );
};

export default Notifications;