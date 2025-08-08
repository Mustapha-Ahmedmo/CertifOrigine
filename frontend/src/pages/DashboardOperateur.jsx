// src/components/DashboardOperateur.jsx
import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useSelector } from 'react-redux';

import {
    Box,
    Grid,
    Card,
    CardContent,
    CardHeader,
    Typography,
    FormControl,
    Select,
    MenuItem,
    InputLabel,
    TableContainer,
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
    Paper,
    Dialog,
    DialogTitle,
    DialogContent,
    TextField,
    DialogActions,
    Button,
    Stack
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import {
    ArrowRight as ArrowRightIcon,
    CurrencyDollar as CurrencyDollarIcon,
    CheckCircle as CheckCircleIcon,
    ArrowUp as ArrowUpIcon,
    ArrowDown as ArrowDownIcon
} from '@phosphor-icons/react';
import ReactApexChart from 'react-apexcharts';
import { Gauge } from '@mui/x-charts/Gauge';
import { fetchStatisticOrders, fetchStatisticCustaccount, fetchCustAccountEvolutionByMonth, fetchOrderStatisticsByMonth, fetchStatisticOrdersByCountry } from '../services/apiServices';

//
// 1. OverviewCard
//
const OverviewCard = ({ title, value, subtitle, icon, iconColor, iconBg }) => (
    <Card sx={{ background: '#fff', boxShadow: 3, height: '100%' }}>
        <CardHeader
            title={title}
            titleTypographyProps={{ variant: 'overline', color: 'text.secondary' }}
        />
        <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                    <Typography variant="h4">{value}</Typography>
                    <Typography variant="caption" color="text.secondary">
                        {subtitle}
                    </Typography>
                </Box>
                <Box
                    sx={{
                        bgcolor: iconBg,
                        color: iconColor,
                        width: 48,
                        height: 48,
                        borderRadius: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                >
                    {React.cloneElement(icon, { size: 24, color: iconColor })}
                </Box>
            </Box>
        </CardContent>
    </Card>
);
const ClientsCountCard = ({ custStats, filter, onFilterChange, subtitle, onOpenCustom,
    customStart,
    customEnd,
    onCustomDateChange
   }) => (
    <Card sx={{ boxShadow: 3, height: '100%' }}>
        <CardHeader
            title="Nombre des clients"
            titleTypographyProps={{ variant: 'overline', color: 'text.secondary' }}
            action={
                <FormControl size="small" sx={{ minWidth: 140 }}>
                    <InputLabel>Date</InputLabel>
                    <Select value={filter} label="Date" onChange={e => {
  const v = e.target.value;
  if (v === 'custom') onOpenCustom();
  onFilterChange(v);
}}>
                        <MenuItem value="24h">Dernières 24 h</MenuItem>
                        <MenuItem value="week">7 derniers jours</MenuItem>
                        <MenuItem value="month">30 derniers jours</MenuItem>
                        <MenuItem value="custom">Autre…</MenuItem>
                    </Select>
                </FormControl>
            }
        />
        < CardContent >
            {filter === 'custom' && (
                <Stack direction="row" spacing={1} mb={2}>
                    <TextField
                        label="From"
                        type="date"
                        size="small"
                        value={customStart}
                        onChange={e => onCustomDateChange('start', e.target.value)}
                        InputLabelProps={{ shrink: true }}
                    />
                    <TextField
                        label="To"
                        type="date"
                        size="small"
                        value={customEnd}
                        onChange={e => onCustomDateChange('end', e.target.value)}
                        InputLabelProps={{ shrink: true }}
                    />
                </Stack>
            )}

            <Box sx={{ display: 'flex', height: 40, mb: 3 }}>
                <Box sx={{ flex: 32, bgcolor: '#0288D1' }} />
                <Box sx={{ flex: 87, bgcolor: '#C2185B' }} />
                <Box sx={{ flex: 286, bgcolor: '#C0CA33' }} />
            </Box>

            <Grid container spacing={2}>
                <Grid item xs={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Box sx={{ width: 4, height: 24, bgcolor: '#0288D1', mr: 1 }} />
                        <Box>
                            <Typography variant="caption" color="text.secondary">
                                nouvelle inscription
                            </Typography>
                            <Typography variant="h5">
                                {(custStats.count_new_custaccount || 0).toLocaleString()}
                            </Typography>
                        </Box>
                    </Box>
                </Grid>

                <Grid item xs={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Box sx={{ width: 4, height: 24, bgcolor: '#C2185B', mr: 1 }} />
                        <Box>
                            <Typography variant="caption" color="text.secondary">
                                Clients rejetés
                            </Typography>
                            <Typography variant="h5">
                            {(custStats.count_rejected_custaccount || 0).toLocaleString()}
                            </Typography>
                        </Box>
                    </Box>
                </Grid>

                <Grid item xs={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                        <Box sx={{ width: 4, height: 24, bgcolor: '#C0CA33', mr: 1 }} />
                        <Box>
                            <Typography variant="caption" color="text.secondary">
                                Client validés
                            </Typography>
                            <Typography variant="h5">
                            {(custStats.count_custaccount_early || 0).toLocaleString()}
                            </Typography>
                        </Box>
                    </Box>
                </Grid>
            </Grid>
        </CardContent >
    </Card >
);

//
// 3. ClientsEvolutionCard
//
const ClientsEvolutionCard = ({ data = [], evoFilter, onEvoFilterChange, onOpenCustom,
    customStart,
    customEnd,
    onCustomDateChange }) => {
    const theme = useTheme();
    // build categories like "2025-01", etc.

    const categories = data
        .filter(r => r.theyearmonth)
        .map(r => r.theyearmonth.toString());

    const series = [{
        name: 'Nouveaux comptes',
        data: data.map(r => Number(r.count_custaccount))
    }];

    const options = {
        chart: { toolbar: { show: false }, zoom: { enabled: false } },
        stroke: { curve: 'smooth', width: 4 },
        xaxis: {
            categories,
            labels: { style: { colors: theme.palette.text.secondary } },
            axisBorder: { color: theme.palette.divider },
            axisTicks: { color: theme.palette.divider }
        },
        yaxis: {
            labels: { style: { colors: theme.palette.text.secondary } },
            title: { text: 'Nombre', style: { color: theme.palette.text.secondary } },
            min: 0
        },
        grid: { borderColor: theme.palette.divider, strokeDashArray: 4 },
        tooltip: { theme: theme.palette.mode }
    };

    return (
        <Card sx={{ boxShadow: 3 }}>
            <CardHeader
                title="Évolution des clients"
                titleTypographyProps={{ variant: 'overline', color: 'text.secondary' }}
                action={
                    <FormControl size="small" sx={{ minWidth: 140 }}>
                        <InputLabel>Période</InputLabel>
                        <Select
                            value={evoFilter}
                            label="Période"
                            onChange={e => {
                                const v = e.target.value;
                                if (v === 'custom') onOpenCustom();
                                onEvoFilterChange(v);
                              }}
                        >
                            <MenuItem value="6m">Last 6 months</MenuItem>
                            <MenuItem value="1y">Last year</MenuItem>
                            <MenuItem value="custom">Autre…</MenuItem>
                        </Select>
                    </FormControl>
                }
            />
            <CardContent>
                <ReactApexChart options={options} series={series} type="area" height={280} />
            </CardContent>
        </Card>
    );
};

//
// 4. CommandEvolutionCard
//
const CommandEvolutionCard = ({ title, value, diff, trend, bg, subtitle }) => (
    <Card sx={{ background: bg, boxShadow: 3, height: '100%' }}>
        <CardHeader
            title={title}
            titleTypographyProps={{ variant: 'overline', color: 'text.secondary' }}
        />
        <CardContent>
            <Typography variant="h4">{value}</Typography>

            <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                {(trend === 'up' ? <ArrowUpIcon size={20} /> : <ArrowDownIcon size={20} />)}
                <Typography variant="body2" sx={{ color: trend === 'up' ? '#66bb6a' : '#ef5350', ml: 0.5 }}>
                    {diff}%
                </Typography>
                <Typography variant="caption" color="text.secondary">
                    - {subtitle}
                </Typography>
            </Box>
        </CardContent>
    </Card>
);


//
// 5. RecetteTable
//
const RecetteTable = ({ data = [], filter, onFilterChange, onOpenCustom,
    customStart,
    customEnd,
    onCustomDateChange }) => {
    // French month names
    const monthNames = [
        'Janvier', 'Février', 'Mars', 'Avril',
        'Mai', 'Juin', 'Juillet', 'Août',
        'Septembre', 'Octobre', 'Novembre', 'Décembre'
    ];

    // Compute totals
    const totals = data.reduce(
        (acc, cur) => ({
            coN: acc.coN + Number(cur.count_ord_certif_ori),
            coM: acc.coM + Number(cur.amount_ord_certif_ori_paid),
            fcN: acc.fcN + Number(cur.count_ord_com_invoice),
            fcM: acc.fcM + Number(cur.amount_ord_com_invoice),
            legN: acc.legN + Number(cur.count_ord_legalization),
            legM: acc.legM + Number(cur.amount_ord_legalization)
        }),
        { coN: 0, coM: 0, fcN: 0, fcM: 0, legN: 0, legM: 0 }
    );

    return (
        <TableContainer component={Paper} sx={{ boxShadow: 3, mt: 4 }}>
            <Box sx={{ p: 1, display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="overline">État des recettes par prestation</Typography>
                <FormControl size="small" sx={{ minWidth: 120 }}>
                    <InputLabel>Période</InputLabel>
                    <Select value={filter} label="Période" onChange={e => {
  const v = e.target.value;
  if (v === 'custom') onOpenCustom();
  onFilterChange(v);
}}
>
                        <MenuItem value="6m">Last 6 months</MenuItem>
                        <MenuItem value="1y">Last year</MenuItem>
                        <MenuItem value="custom">Autre…</MenuItem>
                    </Select>
                </FormControl>
            </Box>
            <Table size="small">
                <TableHead>
                    <TableRow>
                        <TableCell>Mois</TableCell>
                        <TableCell>Nombre C.O</TableCell>
                        <TableCell>Montant C.O</TableCell>
                        <TableCell>Nombre FC</TableCell>
                        <TableCell>Montant FC</TableCell>
                        <TableCell>Nombre légalisation</TableCell>
                        <TableCell>Montant légalisation</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {data.map(row => {
                        const monthIndex = Number(row.themonth) - 1;
                        return (
                            <TableRow key={row.theyearmonth}>
                                <TableCell>
                                    {monthNames[monthIndex] || row.theyearmonth.toString()}
                                </TableCell>
                                <TableCell>{Number(row.count_ord_certif_ori)}</TableCell>
                                <TableCell>{Number(row.amount_ord_certif_ori_paid).toLocaleString()}</TableCell>
                                <TableCell>{Number(row.count_ord_com_invoice)}</TableCell>
                                <TableCell>{Number(row.amount_ord_com_invoice).toLocaleString()}</TableCell>
                                <TableCell>{Number(row.count_ord_legalization)}</TableCell>
                                <TableCell>{Number(row.amount_ord_legalization).toLocaleString()}</TableCell>
                            </TableRow>
                        );
                    })}
                    <TableRow>
                        <TableCell><strong>Totaux</strong></TableCell>
                        <TableCell><strong>{totals.coN}</strong></TableCell>
                        <TableCell><strong>{totals.coM.toLocaleString()}</strong></TableCell>
                        <TableCell><strong>{totals.fcN}</strong></TableCell>
                        <TableCell><strong>{totals.fcM.toLocaleString()}</strong></TableCell>
                        <TableCell><strong>{totals.legN}</strong></TableCell>
                        <TableCell><strong>{totals.legM.toLocaleString()}</strong></TableCell>
                    </TableRow>
                </TableBody>
            </Table>
        </TableContainer>
    );
};

// just before DashboardOperateur()
const CountryOrdersCard = ({
    title,
    data,
    filter,
    onFilterChange,
    onOpenCustom  // ← new
}) => (
    <Card sx={{ boxShadow: 3, height: '100%' }}>
        <CardHeader
            title={title}
            action={
                <FormControl size="small" sx={{ minWidth: 140 }}>
                    <InputLabel>Période</InputLabel>
                    <Select
                        value={filter}
                        label="Période"
                        onChange={e => {
                            const v = e.target.value;
                            onFilterChange(v);
                            if (v === 'custom') onOpenCustom();
                        }}
                    >
                        <MenuItem value="week">7 derniers jours</MenuItem>
                        <MenuItem value="month">30 derniers jours</MenuItem>
                        <MenuItem value="custom">Autre…</MenuItem>
                    </Select>
                </FormControl>
            }
            titleTypographyProps={{ variant: 'overline', color: 'text.secondary' }}
        />
        <CardContent>
            <TableContainer>
                <Table size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell>Pays</TableCell>
                            <TableCell align="right">Nombre Commande</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {data.map(row => (
                            <TableRow key={row.country_symbol_fr_recipient}>
                                <TableCell>{row.country_symbol_fr_recipient}</TableCell>
                                <TableCell align="right">
                                    {Number(row.count_ord_certif_ori ?? 0).toLocaleString()}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </CardContent>
    </Card>
);

//
// 6. DashboardOperateur
//
export default function DashboardOperateur() {

    const [dateModalOpen, setDateModalOpen] = useState(false);

    const openDateModal = (target) => {
        setCustomTarget(target);
        setDateModalOpen(true);
      };
      
    const closeDateModal = () => setDateModalOpen(false);

    const applyCustomDates = () => {
        switch (customTarget) {
          case 'country':
            setCountryFilter('custom');
            break;
          case 'clients':
            setFilter('custom');
            break;
          case 'evolution':
            setEvoFilter('custom');
            break;
          case 'recette':
            setRecFilter('custom');
            break;
          case 'cmd':
            setCmdEvoFilter('custom');
            break;
          default:
            break;
            case 'overview':
            setOverviewFilter('custom');
            break;

        }
        closeDateModal();
      };
      
      const [customDates, setCustomDates] = useState({
        clients: { start: '', end: '' },
        evolution: { start: '', end: '' },
        recette: { start: '', end: '' },
        country: { start: '', end: '' },
        cmd: { start: '', end: '' },
        overview: { start: '', end: '' },
      });
      
    const user = useSelector(state => state.auth.user);
    const [overviewStats, setOverviewStats] = useState({
        count_ord_certif_ori: 0,
        count_ord_com_invoice: 0,
        count_ord_legalization: 0
    });
    
    const [cmdStats, setCmdStats] = useState({
        count_ord_certif_ori: 0,
        count_ord_com_invoice: 0,
        count_ord_legalization: 0,
        diff_certif: 0,
        trend_certif: 'up',
        diff_invoice: 0,
        trend_invoice: 'down',
        diff_legal: 0,
        trend_legal: 'up'
    });

    const [custStats, setCustStats] = useState({
        count_custaccount: 0,
        count_custaccount_early: 0,
        count_new_custaccount: 0,
        count_suspended_custaccount: 0,
        count_rejected_custaccount: 0
    });
    const [loading, setLoading] = useState(true);

    const [filter, setFilter] = useState('24h');
    const [overviewFilter, setOverviewFilter] = useState('24h');

    const [evoFilter, setEvoFilter] = useState('6m');
    const [custEvolution, setCustEvolution] = useState([]);
    const [cmdEvoFilter, setCmdEvoFilter] = useState('month');
    const [orderEvolution, setOrderEvolution] = useState([]);
    const [recFilter, setRecFilter] = useState('6m');
    const [recEvolution, setRecEvolution] = useState([]);
    const [originData, setOriginData] = useState([]);
    const [destData, setDestData] = useState([]);
    // —————— AJOUT POUR FILTRE CUSTOM PAYS ——————
    const [customTarget, setCustomTarget] = useState('');

    const currentCustomStart = customDates[customTarget]?.start || '';
    const currentCustomEnd = customDates[customTarget]?.end || '';

    

    const subtitles = {
        '24h': "Dernières 24 h",
        week: "7 derniers jours",
        month: "30 derniers jours"
    };

    const [countryFilter, setCountryFilter] = useState('week');
    const handleCustomDateChange = (field, value) => {
        setCustomDates(prev => ({
          ...prev,
          [customTarget]: {
            ...prev[customTarget],
            [field]: value
          }
        }));
      };

    // load overview metrics once (hier→aujourd'hui)
    useEffect(() => {
        (async () => {
          const { start, end } = customDates.clients;
          if (filter === 'custom' && (!start || !end)) return;
      
          setLoading(true);
          const now = new Date();
          let s = new Date(now), e = new Date(now);
      
          if (filter === 'custom') {
            s = new Date(start);
            e = new Date(end);
            s.setHours(0, 0, 0, 0);
            e.setHours(23, 59, 59, 999);
          } else if (filter === '24h') s.setHours(now.getHours() - 24);
          else if (filter === 'week') s.setDate(now.getDate() - 7);
          else s.setDate(now.getDate() - 30);
      
          try {
            const { data: cd } = await fetchStatisticCustaccount({
              p_date_start: s.toISOString(),
              p_date_end: e.toISOString(),
              p_isactive: null,
              p_idlogin: user.id_login_user
            });
            const c0 = (Array.isArray(cd) && cd[0]) || {};
            setCustStats({
              count_custaccount: c0.count_custaccount || 0,
              count_new_custaccount: c0.count_new_custaccount || 0,
              count_rejected_custaccount: c0.count_rejected_custaccount || 0,
              count_custaccount_early: c0.count_custaccount_early || 0
            });
          } catch (err) {
            console.error(err);
          } finally {
            setLoading(false);
          }
        })();
      }, [filter, customDates.clients, user.id_login_user]);
      


      useEffect(() => {
        (async () => {
          const { start, end } = customDates.overview;
          if (overviewFilter === 'custom' && (!start || !end)) return;
      
          setLoading(true);
          const now = new Date();
          let s = new Date(now), e = new Date(now);
      
          if (overviewFilter === 'custom') {
            s = new Date(start);
            e = new Date(end);
            s.setHours(0, 0, 0, 0);
            e.setHours(23, 59, 59, 999);
          } else if (overviewFilter === '24h') s.setHours(now.getHours() - 24);
          else if (overviewFilter === 'week') s.setDate(now.getDate() - 7);
          else s.setDate(now.getDate() - 30);
      
          try {
            const { data } = await fetchStatisticOrders({
              p_date_start: s.toISOString(),
              p_date_end: e.toISOString(),
              p_id_list_order: null,
              p_id_custaccount: null,
              p_orderstatus_exclusif: 4,
              p_idlogin: user.id_login_user
            });
            setOverviewStats(data[0] || {});
          } catch (err) {
            console.error('orders overview fetch failed', err);
          } finally {
            setLoading(false);
          }
        })();
      }, [overviewFilter, customDates.overview, user.id_login_user]);
      
      useEffect(() => {
        (async () => {
          const { start, end } = customDates.cmd;
          if (cmdEvoFilter === 'custom' && (!start || !end)) return;
      
          setLoading(true);
          const now = new Date();
          let s = new Date(now), e = new Date(now);
      
          if (cmdEvoFilter === 'custom') {
            s = new Date(start);
            e = new Date(end);
            s.setHours(0, 0, 0, 0);
            e.setHours(23, 59, 59, 999);
          } else if (cmdEvoFilter === 'week') s.setDate(now.getDate() - 7);
          else s.setDate(now.getDate() - 30);
      
          try {
            const { data } = await fetchStatisticOrders({
              p_date_start: s.toISOString(),
              p_date_end: e.toISOString(),
              p_id_list_order: null,
              p_id_custaccount: null,
              p_orderstatus_exclusif: 4,
              p_idlogin: user.id_login_user
            });
            setCmdStats(data[0] || {});
          } catch (err) {
            console.error('orders evolution fetch failed', err);
          } finally {
            setLoading(false);
          }
        })();
      }, [cmdEvoFilter, customDates.cmd, user.id_login_user]);
      
    // fetch monthly evolution
    useEffect(() => {
        (async () => {
          const { start, end } = customDates.evolution;
          if (evoFilter === 'custom' && (!start || !end)) return;
      
          const now = new Date();
          let s = new Date(now), e = new Date(now);
      
          if (evoFilter === 'custom') {
            s = new Date(start);
            e = new Date(end);
            s.setHours(0, 0, 0, 0);
            e.setHours(23, 59, 59, 999);
          } else if (evoFilter === '6m') s.setMonth(now.getMonth() - 5);
          else s.setFullYear(now.getFullYear() - 1);
      
          try {
            const rows = await fetchCustAccountEvolutionByMonth({
              p_date_start: s.toISOString(),
              p_date_end: e.toISOString(),
              p_idlogin: user.id_login_user
            });
            setCustEvolution(rows);
          } catch (e) {
            console.error('Failed to load cust evolution:', e);
          }
        })();
      }, [evoFilter, customDates.evolution, user.id_login_user]);
      
    useEffect(() => {
        (async () => {
            const now = new Date();
            const start = new Date(now.getFullYear(), now.getMonth() - 6, now.getDate());
            try {
                const rows = await fetchOrderStatisticsByMonth({
                    p_date_start: start.toISOString(),
                    p_date_end: now.toISOString(),
                    p_idlogin: user.id_login_user
                });
                setOrderEvolution(rows);
            } catch (err) {
                console.error(err);
            }
        })();
    }, [user.id_login_user]);

    useEffect(() => {
        (async () => {
          const { start, end } = customDates.recette;
          if (recFilter === 'custom' && (!start || !end)) return;
      
          const now = new Date();
          let s = new Date(now), e = new Date(now);
      
          if (recFilter === 'custom') {
            s = new Date(start);
            e = new Date(end);
            s.setHours(0, 0, 0, 0);
            e.setHours(23, 59, 59, 999);
          } else if (recFilter === '6m') s.setMonth(now.getMonth() - 6);
          else s.setFullYear(now.getFullYear() - 1);
      
          try {
            const rows = await fetchOrderStatisticsByMonth({
              p_date_start: s.toISOString(),
              p_date_end: e.toISOString(),
              p_idlogin: user.id_login_user
            });
            setRecEvolution(rows);
          } catch (err) {
            console.error('RecetteTable fetch failed', err);
          }
        })();
      }, [recFilter, customDates.recette, user.id_login_user]);
      
      useEffect(() => {
        const { start, end } = customDates.country;
        if (countryFilter === 'custom' && (!start || !end)) return;
      
        const now = new Date();
        let s = new Date(now), e = new Date(now);
      
        if (countryFilter === 'custom') {
          s = new Date(start);
          e = new Date(end);
          s.setHours(0, 0, 0, 0);
          e.setHours(23, 59, 59, 999);
        } else if (countryFilter === 'week') {
          s.setDate(now.getDate() - 6);
          s.setHours(0, 0, 0, 0);
          e.setHours(23, 59, 59, 999);
        } else {
          s.setMonth(now.getMonth() - 1);
          s.setHours(0, 0, 0, 0);
          e.setHours(23, 59, 59, 999);
        }
      
        (async () => {
          try {
            const origin = await fetchStatisticOrdersByCountry({
              p_date_start: s.toISOString(),
              p_date_end: e.toISOString(),
              p_id_list_order: null,
              p_id_custaccount: null,
              p_orderstatus_exclusif: 4,
              p_typeOf_country: 0,
              p_idlogin: user.id_login_user
            });
            setOriginData(origin);
      
            const dest = await fetchStatisticOrdersByCountry({
              p_date_start: s.toISOString(),
              p_date_end: e.toISOString(),
              p_id_list_order: null,
              p_id_custaccount: null,
              p_orderstatus_exclusif: 4,
              p_typeOf_country: 1,
              p_idlogin: user.id_login_user
            });
            setDestData(dest);
          } catch (err) {
            console.error('Erreur fetch pays :', err);
          }
        })();
      }, [countryFilter, customDates.country, user.id_login_user]);
      

    if (loading) return <Typography>Chargement…</Typography>;

    return (
        <Box sx={{ ml: { xs: 0, md: '240px' }, p: 2 }}>
            <Helmet><title>Dashboard Opérateur</title></Helmet>

            {/* Header */}
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Typography variant="h5" sx={{ flexGrow: 1 }}>Aperçu des commandes</Typography>
                <FormControl size="small" sx={{ minWidth: 140 }}>
  <InputLabel>Filtre</InputLabel>
  <Select
    value={overviewFilter}
    label="Filtre"
    onChange={e => {
      const v = e.target.value;
      if (v === 'custom') {
        openDateModal('overview'); // 👉 Ouvre le date picker
      } else {
        setOverviewFilter(v);     // 👉 Applique les autres filtres directement
      }
    }}
  >
    <MenuItem value="24h">Dernières 24 h</MenuItem>
    <MenuItem value="week">7 derniers jours</MenuItem>
    <MenuItem value="month">30 derniers jours</MenuItem>
    <MenuItem value="custom">Autre…</MenuItem> {/* ✅ Ajouté */}
  </Select>
</FormControl>
            </Box>


            {/* Overview cards */}
            <Grid container spacing={3} mb={4}>
                <Grid item xs={12} md={4}>
                    <OverviewCard
                        title="Certificat d'origine émis"
                        value={(overviewStats.count_ord_certif_ori ?? 0).toLocaleString()}
                        subtitle={subtitles[overviewFilter]}
                        icon={<ArrowRightIcon />}
                        iconColor="#388E3C"
                        iconBg="rgba(56,142,60,0.1)"
                    />
                </Grid>
                <Grid item xs={12} md={4}>
                    <OverviewCard
                        title="Factures commerciales visées"
                        value={(overviewStats.count_ord_com_invoice ?? 0).toLocaleString()}
                        subtitle={subtitles[overviewFilter]}
                        icon={<CurrencyDollarIcon />}
                        iconColor="#1E88E5"
                        iconBg="rgba(30,136,229,0.1)"
                    />
                </Grid>
                <Grid item xs={12} md={4}>
                    <OverviewCard
                        title="Documents légalisés"
                        value={(overviewStats.count_ord_legalization ?? 0).toLocaleString()}
                        subtitle={subtitles[overviewFilter]}
                        icon={<CheckCircleIcon />}
                        iconColor="#C8A415"
                        iconBg="rgba(200,164,21,0.1)"
                    />
                </Grid>
            </Grid>



            {/* Rest of dashboard... */}
            <Grid container spacing={3} mb={4} alignItems="stretch">
                <Grid item xs={12} md={6}>
                <ClientsCountCard
    custStats={custStats}
    filter={filter}
    onFilterChange={setFilter}
    subtitle={subtitles[filter]}
    onOpenCustom={() => openDateModal('clients')}
    customStart={customDates.clients.start}
customEnd={customDates.clients.end}
onCustomDateChange={(field, value) => {
  setCustomDates(prev => ({
    ...prev,
    clients: {
      ...prev.clients,
      [field]: value
    }
  }));
}}
/>
                </Grid>

                <Grid item xs={12} md={6}>
                <ClientsEvolutionCard
    data={custEvolution}
    evoFilter={evoFilter}
    onEvoFilterChange={setEvoFilter}
    onOpenCustom={() => openDateModal('evolution')}
    customStart={customDates.evolution.start}
customEnd={customDates.evolution.end}
onCustomDateChange={(field, value) => {
  setCustomDates(prev => ({
    ...prev,
    evolution: {
      ...prev.evolution,
      [field]: value
    }
  }));
}}
/>
                </Grid>
            </Grid>

            <Card sx={{ background: '#fff', boxShadow: 3, p: 2, mb: 4 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="overline">Évolution des commandes</Typography>
                    <FormControl size="small" sx={{ minWidth: 140 }}>
                        <InputLabel>Période</InputLabel>
                        <Select
                        value={cmdEvoFilter}
                        label="Période"
                        onChange={e => {
                            const v = e.target.value;
                            if (v === 'custom') {
                            openDateModal('cmd'); // ← seulement ouvrir la modale
                            } else {
                            setCmdEvoFilter(v);   // ← ne changer le filtre que si ce n’est pas custom
                            }
                        }}
                        >

                            <MenuItem value="week">7 derniers jours</MenuItem>
                            <MenuItem value="month">30 derniers jours</MenuItem>
                            <MenuItem value="custom">Autre…</MenuItem>

                        </Select>
                    </FormControl>
                </Box>
                <Grid container spacing={3}>
                    <Grid item xs={12} sm={4}>
                        <CommandEvolutionCard
                            title="Nombre de C.O effectués"
                            value={(cmdStats.count_ord_certif_ori ?? 0).toLocaleString()}
                            diff={cmdStats.diff_certif || 0}
                            trend={cmdStats.trend_certif || 'up'}
                            bg="#E8F5E9"
                            subtitle={subtitles[cmdEvoFilter]}
                        />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <CommandEvolutionCard
                            title="Nombre facture commerciale visée"
                            value={(cmdStats.count_ord_com_invoice ?? 0).toLocaleString()}
                            diff={cmdStats.diff_invoice || 0}
                            trend={cmdStats.trend_invoice || 'down'}
                            bg="#E3F2FD"
                            subtitle={subtitles[cmdEvoFilter]}
                        />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <CommandEvolutionCard
                            title="Nombre de document légalisé"
                            value={(cmdStats.count_ord_legalization ?? 0).toLocaleString()}
                            diff={cmdStats.diff_legal || 0}
                            trend={cmdStats.trend_legal || 'up'}
                            bg="#FFF8E1"
                            subtitle={subtitles[cmdEvoFilter]}
                        />
                    </Grid>
                </Grid>
            </Card>

            {/* --- New: Dashboard Pays d'origine / destination --- */}
            <Grid container spacing={3} mb={4}>
                <Grid item xs={12} md={6}>
                    <CountryOrdersCard
                        title="Pays d’origine"
                        data={originData}
                        filter={countryFilter}
                        onFilterChange={setCountryFilter}
                        onOpenCustom={() => openDateModal('country')}
customStart={customDates.country.start}
customEnd={customDates.country.end}
onCustomDateChange={(field, value) => {
  setCustomDates(prev => ({
    ...prev,
    country: {
      ...prev.country,
      [field]: value
    }
  }));
}}
                    />

                </Grid>
                <Grid item xs={12} md={6}>
                <CountryOrdersCard
    title="Pays de destination"
    data={destData}
    filter={countryFilter}
    onFilterChange={setCountryFilter}
    onOpenCustom={() => openDateModal('country')}
    customStart={customDates.country.start}
    customEnd={customDates.country.end}
    onCustomDateChange={(field, value) => {
        setCustomDates(prev => ({
            ...prev,
            country: {
                ...prev.country,
                [field]: value
            }
        }));
    }}
/>
                </Grid>
            </Grid>
            {/* ---------------------------------------------------- */}

            <RecetteTable
    data={recEvolution}
    filter={recFilter}
    onFilterChange={setRecFilter}
    onOpenCustom={() => openDateModal('recette')}
    customStart={customDates.recette.start}
customEnd={customDates.recette.end}
onCustomDateChange={(field, value) => {
  setCustomDates(prev => ({
    ...prev,
    recette: {
      ...prev.recette,
      [field]: value
    }
  }));
}}
/>


           


            <Dialog open={dateModalOpen} onClose={closeDateModal}>
                <DialogTitle>Choisir une plage de dates {customTarget && `(${customTarget})`}</DialogTitle>
                <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <TextField
                        label="Date de début"
                        type="date"
                        value={currentCustomStart}
                        onChange={e => handleCustomDateChange('start', e.target.value)}
                        InputLabelProps={{ shrink: true }}
                    />
                    <TextField
                        label="Date de fin"
                        type="date"
                        value={currentCustomEnd}
                        onChange={e => handleCustomDateChange('end', e.target.value)}
                        InputLabelProps={{ shrink: true }}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={closeDateModal}>Annuler</Button>
                    <Button
                        onClick={() => {
                            applyCustomDates();
                        }}
                        disabled={!currentCustomStart || !currentCustomEnd}
                    >
                        Appliquer
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>


    );
}
