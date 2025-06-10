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
    <Card sx={{ height: '100%', backgroundColor: bgColor }}>
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
}
function SpendChartCard({ custAccountId, unitCertif, unitCopy }) {
  const theme = useTheme();

  // State for chart
  const [timeframe, setTimeframe] = useState('month');
  const [series, setSeries]       = useState([{ name: 'Paid', data: [] }]);
  const [categories, setCategories] = useState([]);               // <<< moved dynamic

  // Custom date modal
  const [openCustomModal, setOpenCustomModal] = useState(false);
  const [customStart, setCustomStart] = useState('');
  const [customEnd,   setCustomEnd]   = useState('');

  useEffect(() => {
    (async () => {
      const now = new Date();
      let start, end = new Date(now);
      end.setHours(23,59,59,999);

      if (timeframe === 'week') {
        start = new Date(now); start.setDate(now.getDate() - 6); start.setHours(0,0,0,0);
      } else if (timeframe === 'month') {
        start = new Date(now.getFullYear(), now.getMonth(), 1); start.setHours(0,0,0,0);
      } else if (timeframe === 'semester') {
        const m = now.getMonth();
        start = m < 6 ? new Date(now.getFullYear(), 0, 1) : new Date(now.getFullYear(), 6, 1);
        start.setHours(0,0,0,0);
      } else if (timeframe === 'custom') {
        start = new Date(customStart); start.setHours(0,0,0,0);
        end   = new Date(customEnd);   end.setHours(23,59,59,999);
      } else {
        start = new Date(now.getFullYear(), 0, 1); start.setHours(0,0,0,0);
      }

      const p1 = start.toISOString(), p2 = end.toISOString();

      try {
        if (timeframe === 'month') {
          // → nouvelle fonction week
          const resp = await getOrderAmountByWeek({
            p_date_start:       p1,
            p_date_end:         p2,
            p_id_custaccount:   custAccountId,
            p_unit_ori_certif:  unitCertif,
            p_unit_ori_certif_copy: unitCopy
          });

          // build X axis from theYearWeek
          const cats = resp.data.map(r => r.theyearweek.toString());
          const dataPaid = resp.data.map(r => parseFloat(r.amount_ord_certif_ori_paid) || 0);

          setCategories(cats);
          setSeries([{ name: 'Paid', data: dataPaid }]);
        } else {
          // → fonction day
          const resp = await getOrderAmountByDay({
            p_date_start:       p1,
            p_date_end:         p2,
            p_id_custaccount:   custAccountId,
            p_unit_ori_certif:  unitCertif,
            p_unit_ori_certif_copy: unitCopy
          });

          // daily X axis fixed
          const days = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
          const mapP = days.reduce((acc, d) => ({ ...acc, [d]: 0 }), {});
          resp.data.forEach(r => {
            const raw = (r.thedayofweek || '').trim();
            const day = raw.charAt(0).toUpperCase() + raw.slice(1).toLowerCase();
            if (mapP[day] != null) mapP[day] = parseFloat(r.amount_ord_certif_ori_paid) || 0;
          });

          setCategories(days);
          setSeries([{ name: 'Paid', data: Object.values(mapP) }]);
        }
      } catch (e) {
        console.error(e);
      }
    })();
  }, [custAccountId, unitCertif, unitCopy, timeframe, customStart, customEnd]);

  const options = useMemo(() => ({
    chart:      { background: 'transparent', toolbar: { show: false } },
    title:      {
      text:  'Montant dépensé',
      align: 'center',
      style:{ fontSize:'16px', fontWeight:'normal', color: theme.palette.text.primary }
    },
    dataLabels: { enabled: false },
    fill:       { opacity: 1 },
    grid:       { borderColor: theme.palette.divider, strokeDashArray: 2 },
    legend:     { position: 'top', showForSingleSeries: true },
    plotOptions:{ bar: { columnWidth: '40px' }},
    stroke:     { show:true, width:2, colors:['transparent'] },
    theme:      { mode: theme.palette.mode },
    xaxis:      {
      categories,
      axisBorder: { color: theme.palette.divider },
      axisTicks:  { color: theme.palette.divider },
      labels:     { style: { color: theme.palette.text.secondary } }
    },
    yaxis: {
      labels: { formatter: v => v.toLocaleString(), style: { color: theme.palette.text.secondary } }
    }
  }), [theme, categories]);

  return (
    <Card>
      <CardHeader
        title={<strong>Finance</strong>}
        action={
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Période</InputLabel>
            <Select
              value={timeframe}
              label="Période"
              onChange={e => {
                if (e.target.value === 'custom') setOpenCustomModal(true);
                else setTimeframe(e.target.value);
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
      <CardContent>
        <ReactApexChart type="bar" series={series} options={options} width="100%" height={350} />
      </CardContent>

      <Modal open={openCustomModal} onClose={() => setOpenCustomModal(false)}>
        <Box sx={{
          position:'absolute', top:'50%', left:'50%',
          transform:'translate(-50%, -50%)', bgcolor:'background.paper',
          p:4, boxShadow:24, display:'flex', flexDirection:'column', gap:2, width:300
        }}>
          <Typography variant="h6">Choisissez les dates</Typography>
          <TextField
            label="Début"
            type="date"
            InputLabelProps={{ shrink:true }}
            value={customStart}
            onChange={e => setCustomStart(e.target.value)}
          />
          <TextField
            label="Fin"
            type="date"
            InputLabelProps={{ shrink:true }}
            value={customEnd}
            onChange={e => setCustomEnd(e.target.value)}
          />
          <Box sx={{ display:'flex', justifyContent:'flex-end', gap:1 }}>
            <Button onClick={() => setOpenCustomModal(false)}>Annuler</Button>
            <Button variant="contained" onClick={() => {
              if (customStart && customEnd) {
                setTimeframe('custom');
                setOpenCustomModal(false);
              }
            }}>Valider</Button>
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
  const [timeframe, setTimeframe] = useState('month');
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
        // du 1er du mois à aujourd'hui
        start = new Date(now.getFullYear(), now.getMonth(), 1);
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
          p_id_custaccount: user?.custAccountId,
        });
        setCoCount(parseInt(co.data[0]?.count_ord_certif_ori, 10) || 0);

        const inv = await getOrderStaticsByServices({
          p_date_start: p1,
          p_date_end: p2,
          p_id_custaccount: user?.custAccountId,
        });
        setInvoiceCount(parseInt(inv.data[0]?.count_ord_com_invoice, 10) || 0);

        const leg = await getOrderStaticsByServices({
          p_date_start: p1,
          p_date_end: p2,
          p_id_custaccount: user?.custAccountId,
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
        const start = new Date(now.getFullYear(), now.getMonth(), 1);
        const end = new Date(now);
        end.setHours(23,59,59,999);
        const resp = await getLastClients({
          p_date_start:    start.toISOString(),
          p_date_end:      end.toISOString(),
          p_id_list_order: null,
          p_id_custaccount: user.id_cust_account,
          p_idlogin:       user.id_login_user
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
          <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardHeader
              title={<strong>Client</strong>}
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
            custAccountId={user?.custAccountId}
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
          <Card>
            <CardHeader
              title={<strong>Liste des derniers clients</strong>}
            />
            <CardContent>
              <TableContainer component={Paper} sx={{ overflowX: 'auto' }}>
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
