// src/components/DashboardClient.jsx
import React, { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import useMediaQuery from '@mui/material/useMediaQuery';
import {
  Box,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Stack,
  Typography,
  Avatar,
  FormControl,
  Select,
  MenuItem,
  InputLabel,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Paper,
  Chip,
  Modal,
  Button,
  TextField,
  TablePagination
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import {
  ArrowDown as ArrowDownIcon,
  ArrowUp as ArrowUpIcon,
  Activity as ActivityIcon,
  CreditCard as CreditCardIcon,
  BagSimple as BagSimpleIcon
} from '@phosphor-icons/react';
import ReactApexChart from 'react-apexcharts';

import {
  getOrderStaticsByServices,
  getOrderAmountByDay,
  getOrderAmountByWeek,
  getLastClients
} from '../services/apiServices';

const drawerWidth = 240;

function StatCard({ title, value, diff, trend, icon, periodLabel, bgColor, iconColor, iconBg }) {
  const TrendIcon = trend === 'up' ? ArrowUpIcon : ArrowDownIcon;
  const trendColor = trend === 'up' ? '#66bb6a' : '#ef5350';
  return (
    <Card sx={{ height: '100%', backgroundColor: bgColor, borderRadius:4 }}>
      <CardContent>
        <Stack spacing={2}>
          <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
            <Stack spacing={1}>
              <Typography color="text.secondary" variant="overline">{title}</Typography>
              <Typography variant="h4">{value}</Typography>
            </Stack>
            <Avatar sx={{ backgroundColor: iconBg, color: iconColor, height: 56, width: 56 }}>
              {React.cloneElement(icon, { size: 28, color: iconColor })}
            </Avatar>
          </Stack>
          {diff != null && (
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <TrendIcon size={20} color={trendColor} />
              <Typography color={trendColor} variant="body2">{diff}%</Typography>
              <Typography color="text.secondary" variant="caption">{periodLabel}</Typography>
            </Stack>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}function SpendChartCard({ custAccountId, unitCertif, unitCopy }) {
  const theme = useTheme();

  const [timeframe, setTimeframe] = useState('monthly');
  const [categories, setCategories] = useState([]);
  const [series, setSeries] = useState([{ name: 'Paid', data: [] }]);

  const [openCustom, setOpenCustom] = useState(false);
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  const [openMonthly, setOpenMonthly] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return { month: now.getMonth(), year: now.getFullYear() };
  });
  // map timeframe → chart title
  const periodTitles = {
    month: 'Montant dépensé (1 mois glissant)',
    semester: 'Montant dépensé (6 mois glissant)',
    year: 'Montant dépensé (1 an glissant)',
    custom: `Montant dépensé (${customStart} → ${customEnd})`,
    monthly: selectedMonth
  ? `Montant dépensé (${new Date(selectedMonth.year, selectedMonth.month).toLocaleString('fr-FR', {
      month: 'long',
      year: 'numeric'
    })})`
  : 'Montant dépensé (mois sélectionné)'
  };

  useEffect(() => {
    (async () => {
      const now = new Date();
      let start = new Date(), end = new Date(now);
      end.setHours(23, 59, 59, 999);

      switch (timeframe) {
        case 'monthly':
        start = new Date(selectedMonth.year, selectedMonth.month, 1);
        end = new Date(selectedMonth.year, selectedMonth.month + 1, 0);
        start.setHours(12, 0, 0, 0);
        end.setHours(12, 0, 0, 0);
        break;
        case 'month':
          start.setMonth(now.getMonth() - 1);
          break;
        case 'semester':
          start.setMonth(now.getMonth() - 6);
          break;
        case 'year':
          start.setFullYear(now.getFullYear() - 1);
          break;
        case 'custom':
          start = new Date(customStart);
          start.setHours(12, 0, 0, 0);
          end = new Date(customEnd);
          end.setHours(12, 0, 0, 0);
          break;
        default:
          start.setMonth(now.getMonth() - 1);
      }

      try {
        const resp = await getOrderAmountByWeek({
          p_date_start:         start.toISOString(),
          p_date_end:           end.toISOString(),
          p_id_custaccount:     custAccountId,
          p_unit_ori_certif:    unitCertif,
          p_unit_ori_certif_copy: unitCopy
        });
        console.log('Week data →', resp.data);
        console.log('📊 Données reçues pour la période mensuelle :', {
          start: start.toISOString(),
          end: end.toISOString(),
          data: resp.data
        });

        const cats = resp.data.map((_, i) => `sem${i + 1}`);
        const paid = resp.data.map(r => parseFloat(r.amount_ord_certif_ori_paid) || 0);

        setCategories(cats);
        setSeries([{ name: 'Paid', data: paid }]);
      } catch (err) {
        console.error('Erreur getOrderAmountByWeek:', err);
      }
    })();
  }, [custAccountId, unitCertif, unitCopy, timeframe, customStart, customEnd]);

  const options = useMemo(() => ({
    chart: { background: 'transparent', toolbar: { show: false } },
    title: {
      text: periodTitles[timeframe] || 'Montant dépensé',
      align: 'center',
      style: {
        fontSize: '16px',
        fontWeight: 'normal',
        color: theme.palette.text.primary
      }
    },
    dataLabels: { enabled: false },
    grid: { borderColor: theme.palette.divider, strokeDashArray: 2 },
    plotOptions: { bar: { columnWidth: '40px' } },
    xaxis: {
      categories,
      axisBorder: { color: theme.palette.divider },
      axisTicks:  { color: theme.palette.divider },
      labels:     { style: { color: theme.palette.text.secondary } }
    },
    yaxis: {
      labels: { formatter: v => v.toLocaleString(), style: { color: theme.palette.text.secondary } }
    },
    theme: { mode: theme.palette.mode }
  }), [theme, categories, timeframe, customStart, customEnd]);

  return (
    <Card sx={{ borderRadius: 4, overflow: 'hidden' }}>
      <CardHeader
        title={<strong>Finance</strong>}
        action={
          <FormControl size="small" sx={{ minWidth: 140 }}>
            <InputLabel>Période</InputLabel>
            <Select
  value={timeframe}
  label="Période"
  onChange={e => {
    const v = e.target.value;
    setTimeframe(v);
    if (v === 'custom') setOpenCustom(true);
    // plus besoin du setOpenMonthly ici !
  }}
  renderValue={(selected) => {
    const labelMap = {
      monthly: 'Mensuel (mois précis)',
      month: 'Mois (1 mois glissant)',
      semester: 'Semestre (6 mois glissant)',
      year: 'Année (1 an glissant)',
      custom: 'Autre…',
      '': 'Choisir une période…'
    };
    return labelMap[selected] || selected;
  }}
>

<MenuItem value="monthly" onClick={() => {
  setOpenMonthly(true);
}}>Mensuel (mois précis)</MenuItem>
              {/* <MenuItem value="month">Mois (1 mois glissant)</MenuItem> */}
              {/* <MenuItem value="semester">Semestre (6 mois glissant)</MenuItem> */}
              {/* <MenuItem value="year">Année (1 an glissant)</MenuItem> */}
              {/* <MenuItem value="custom">Autre…</MenuItem> */}
            </Select>
          </FormControl>
        }
      />
      <CardContent>
        <ReactApexChart type="bar" series={series} options={options} width="100%" height={350} />
      </CardContent>

      <Modal open={openCustom} onClose={() => setOpenCustom(false)}>
        <Box sx={{
          position: 'absolute', top: '50%', left: '50%',
          transform: 'translate(-50%,-50%)',
          bgcolor: 'background.paper', p: 4, boxShadow: 24,
          display: 'flex', flexDirection: 'column', gap: 2, width: 300
        }}>
          <Typography variant="h6">Choisissez les dates</Typography>
          <TextField
            label="Début" type="date" InputLabelProps={{ shrink: true }}
            value={customStart} onChange={e => setCustomStart(e.target.value)}
          />
          <TextField
            label="Fin" type="date" InputLabelProps={{ shrink: true }}
            value={customEnd} onChange={e => setCustomEnd(e.target.value)}
          />
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
            <Button onClick={() => setOpenCustom(false)}>Annuler</Button>
            <Button
              variant="contained"
              onClick={() => {
                if (customStart && customEnd) {
                  setTimeframe('custom');
                  setOpenCustom(false);
                }
              }}
            >
              Valider
            </Button>
          </Box>
        </Box>
      </Modal>
      <Modal open={openMonthly} onClose={() => setOpenMonthly(false)}>
  <Box sx={{
    position: 'absolute', top: '50%', left: '50%',
    transform: 'translate(-50%,-50%)',
    bgcolor: 'background.paper', p: 4, boxShadow: 24,
    display: 'flex', flexDirection: 'column', gap: 2, width: 300
  }}>
    <Typography variant="h6">Choisissez un mois</Typography>

    <TextField
      label="Année"
      type="number"
      value={selectedMonth?.year ?? new Date().getFullYear()}
      onChange={e => setSelectedMonth(prev => ({ ...prev, year: parseInt(e.target.value, 10) }))}
    />

    <Grid container spacing={1}>
      {[
        'Janvier', 'Février', 'Mars', 'Avril',
        'Mai', 'Juin', 'Juillet', 'Août',
        'Septembre', 'Octobre', 'Novembre', 'Décembre'
      ].map((monthName, index) => (
        <Grid item xs={4} key={index}>
          <Button
            fullWidth
            variant={(selectedMonth?.month === index) ? 'contained' : 'outlined'}
            onClick={() => setSelectedMonth(prev => ({ ...prev, month: index }))}
          >
            {monthName}
          </Button>
        </Grid>
      ))}
    </Grid>

    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
      <Button onClick={() => setOpenMonthly(false)}>Annuler</Button>
      <Button
        variant="contained"
        onClick={() => {
          if (
            typeof selectedMonth?.month === 'number' &&
            typeof selectedMonth?.year === 'number'
          ) {
            const firstDay = new Date(selectedMonth.year, selectedMonth.month, 1);
            const lastDay = new Date(selectedMonth.year, selectedMonth.month + 1, 0);
      
            // ✅ Correction pour éviter les problèmes de fuseau horaire (décalage UTC)
            firstDay.setHours(12, 0, 0, 0);
            lastDay.setHours(12, 0, 0, 0);
      
            setCustomStart(firstDay.toISOString().substring(0, 10));
            setCustomEnd(lastDay.toISOString().substring(0, 10));
            setTimeframe('monthly'); // ou 'monthly' si tu gères le titre différemment
            setOpenMonthly(false);
          } else {
            console.warn('❌ selectedMonth incorrect :', selectedMonth);
          }
        }}
      >
        Valider
      </Button>
    </Box>
  </Box>
</Modal>
    </Card>
  );
}

export default function DashboardClient() {
  const user = useSelector(s => s.auth.user);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // filtres
  const [timeframe, setTimeframe] = useState('');
  const [openCustomModal, setOpenCustomModal] = useState(false);
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  const [coCount, setCoCount] = useState(0);
  const [invoiceCount, setInvoiceCount] = useState(0);
  const [legalCount, setLegalCount] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const handleChangePage = (_e, newPage) => setPage(newPage);

  const [lastClients, setLastClients] = useState([]);               // <<< ADDED

  const handleChangeRowsPerPage = e => {
    setRowsPerPage(parseInt(e.target.value, 10));
    setPage(0);
  };


  useEffect(() => {
    (async () => {
      const now = new Date();
      let start, end;

      // par défaut, fin = fin de la journée d'aujourd'hui
      end = new Date(now);
      end.setHours(23, 59, 59, 999);

      if (timeframe === 'week') {
        // 7 derniers jours
        start = new Date(now);
        start.setDate(now.getDate() - 6);
        start.setHours(0, 0, 0, 0);
      }
      else if (timeframe === 'month') {
        // 30 jours glissants
        start = new Date(now);
        start.setDate(now.getDate() - 30);
        start.setHours(0, 0, 0, 0);
      }
      else if (timeframe === 'semester') {
        const m = now.getMonth();
        start = m < 6
          ? new Date(now.getFullYear(), 0, 1)
          : new Date(now.getFullYear(), 6, 1);
        start.setHours(0, 0, 0, 0);
      }
      else if (timeframe === 'custom') {
        // dates choisies en modal
        start = new Date(customStart);
        start.setHours(0, 0, 0, 0);
        end = new Date(customEnd);
        end.setHours(23, 59, 59, 999);
      }
      else {
        // année en cours
        start = new Date(now.getFullYear(), 0, 1);
        start.setHours(0, 0, 0, 0);
      }

      const p1 = start.toISOString();
      const p2 = end.toISOString();

      try {
        const co = await getOrderStaticsByServices({
          p_date_start: p1,
          p_date_end: p2,
          p_borderstatus_approved: true,
          p_id_custaccount: user?.id_cust_account,
        });
        setCoCount(parseInt(co.data[0]?.count_ord_certif_ori, 10) || 0);

        const inv = await getOrderStaticsByServices({
          p_date_start: p1,
          p_date_end: p2,
          p_id_custaccount: user?.id_cust_account,
        });
        setInvoiceCount(parseInt(inv.data[0]?.count_ord_com_invoice, 10) || 0);

        const leg = await getOrderStaticsByServices({
          p_date_start: p1,
          p_date_end: p2,
          p_id_custaccount: user?.id_cust_account,
        });
        setLegalCount(parseInt(leg.data[0]?.count_ord_legalization, 10) || 0);
      }
      catch (e) {
        console.error(e);
      }
    })();
  }, [timeframe, customStart, customEnd, user]);

  const periodLabels = {
    week: 'Semaine',
    month: 'Mois',
    semester: 'Semestre',
    year: 'Année',
    custom: `${customStart} → ${customEnd}`
  };
  const trend = 'up';
  const unitCertif = 50, unitCopy = 10;

  // fetch last clients
  useEffect(() => {
    (async () => {

      if (!user?.id_cust_account || !user?.id_login_user) {
        console.log('⚠️ skip getLastClients, missing user info (check id_cust_account & id_login_user)');
        return;
      }
      try {
        const now = new Date();
        const start = new Date(2000, 0, 1);      // January is month 0
        const end = new Date(now);
        end.setHours(23, 59, 59, 999);
        const resp = await getLastClients({
          p_date_start: start.toISOString(),
          p_date_end: end.toISOString(),
          p_id_list_order: null,
          p_id_custaccount: user.id_cust_account,
          p_idlogin: user.id_login_user
        }, rowsPerPage);
        setLastClients(resp.data || []);
      } catch (e) {
        console.error('Erreur fetch last clients:', e);
      }
    })();
  }, [user, rowsPerPage]);

  return (
    <Box sx={{
      p: 2,
      ml: isMobile ? 0 : `${drawerWidth}px`,
      width: isMobile ? '100%' : `calc(100% - ${drawerWidth}px)`
    }}>
      <Typography variant="h5" mb={3}>
        Bienvenue <strong>{user?.companyname}</strong>
      </Typography>

      <Grid container spacing={3} alignItems="stretch">
        {/* Statistiques client */}
        <Grid item xs={12} md={8}>
          <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', borderRadius :4 }}>
            <CardHeader
              title={<strong>Commandes</strong>}
              action={
                <FormControl size="small" sx={{ minWidth: 140 }}>
                  <InputLabel>Période</InputLabel>
                  <Select
                    value={timeframe}
                    label="Période"
                    onChange={e => {
                      const v = e.target.value;
                      if (v === 'custom') {
                        setOpenCustomModal(true);
                      } else {
                        setTimeframe(v);
                      }
                    }}
                  >
                    <MenuItem value="week">Semaine</MenuItem>
                    <MenuItem value="month">Mois</MenuItem>
                    <MenuItem value="semester">Semestre</MenuItem>
                    <MenuItem value="year">Année</MenuItem>
                    <MenuItem value="custom">Autre…</MenuItem>
                  </Select>
                </FormControl>
              }
            />
            <CardContent sx={{ flexGrow: 1 }}>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6} md={4}>
                  <StatCard
                    title="Nombre de C.O effectués"
                    value={coCount.toLocaleString()}
                    trend={trend}
                    periodLabel={periodLabels[timeframe]}
                    icon={<ActivityIcon />}
                    bgColor="#E8F5E9"
                    iconColor="#388E3C"
                    iconBg={alpha('#388E3C', 0.1)}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <StatCard
                    title="Nombre factures commerciales"
                    value={invoiceCount.toLocaleString()}
                    trend={trend}
                    periodLabel={periodLabels[timeframe]}
                    icon={<CreditCardIcon />}
                    bgColor="#E3F2FD"
                    iconColor="#1E88E5"
                    iconBg={alpha('#1E88E5', 0.1)}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <StatCard
                    title="Nombre de documents légalisés"
                    value={legalCount.toLocaleString()}
                    trend={trend}
                    periodLabel={periodLabels[timeframe]}
                    icon={<BagSimpleIcon />}
                    bgColor="#FFFAE6"
                    iconColor="#C8A415"
                    iconBg={alpha('#C8A415', 0.1)}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Graphique finance */}
        <Grid item xs={12} md={4}>
          <SpendChartCard
            custAccountId={user?.id_cust_account}
            unitCertif={unitCertif}
            unitCopy={unitCopy}
          />
        </Grid>
      </Grid>

      {/* Modal dates personnalisées */}
      <Modal
        open={openCustomModal}
        onClose={() => setOpenCustomModal(false)}
      >
        <Box sx={{
          position: 'absolute', top: '50%', left: '50%',
          transform: 'translate(-50%,-50%)',
          bgcolor: 'background.paper', p: 4, boxShadow: 24,
          display: 'flex', flexDirection: 'column', gap: 2, width: 300
        }}>
          <Typography variant="h6">Choisissez les dates</Typography>
          <TextField
            label="Début"
            type="date"
            InputLabelProps={{ shrink: true }}
            value={customStart}
            onChange={e => setCustomStart(e.target.value)}
          />
          <TextField
            label="Fin"
            type="date"
            InputLabelProps={{ shrink: true }}
            value={customEnd}
            onChange={e => setCustomEnd(e.target.value)}
          />
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
            <Button onClick={() => setOpenCustomModal(false)}>Annuler</Button>
            <Button
              variant="contained"
              onClick={() => {
                if (customStart && customEnd) {
                  setTimeframe('custom');
                  setOpenCustomModal(false);
                }
              }}
            >
              Valider
            </Button>
          </Box>
        </Box>
      </Modal>

      {/* Tableau des derniers clients */}
      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item xs={12}>
        <Card sx={{ borderRadius: 4 }}>
            <CardHeader
              title={<strong>Liste des derniers clients</strong>}
            />
            <CardContent>
              <TableContainer component={Paper} sx={{ overflowX: 'auto', borderRadius: 4, overflow: 'hidden' }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Nom client</TableCell>
                      <TableCell>Pays – Adresse</TableCell>
                      <TableCell align="center">C.O. count</TableCell>
                      <TableCell align="center">Factures</TableCell>
                      <TableCell align="center">Légalisations</TableCell>
                      <TableCell align="right">Montant payé</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {lastClients
                      .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                      .map((c, idx) => (
                        <TableRow key={idx}>
                          <TableCell>{c.recipient_name}</TableCell>
                          <TableCell>
                            {[c.address_1, c.address_2, c.address_3]
                              .filter(Boolean)
                              .join(', ')}
                          </TableCell>
                          <TableCell align="center">{c.ord_certif_ori_count}</TableCell>
                          <TableCell align="center">{c.ord_com_invoice_count}</TableCell>
                          <TableCell align="center">{c.ord_legalization_count}</TableCell>
                          <TableCell align="right">
                            {parseFloat(c.amount_ord_certif_ori_paid).toLocaleString()} €
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </TableContainer>
              <TablePagination
                component="div"
                count={lastClients.length}                // <<< CHANGED
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                rowsPerPageOptions={[5, 10, 25]}            // <<< CHANGED
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
