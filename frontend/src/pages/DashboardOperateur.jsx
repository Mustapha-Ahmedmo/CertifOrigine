// src/components/DashboardOperateur.jsx
import React, { useState, useEffect, useMemo } from 'react';
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
  Paper
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
import { getOrderStaticsByServices } from '../services/apiServices';

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

//
// 2. ClientsCountCard with stacked bar + legend
//
const ClientsCountCard = () => (
  <Card sx={{ boxShadow: 3, height: '100%' }}>
    <CardHeader
      title="Nombre des clients"
      titleTypographyProps={{ variant: 'overline', color: 'text.secondary' }}
      action={
        <FormControl size="small" sx={{ minWidth: 140 }}>
          <InputLabel>Filtre</InputLabel>
          <Select defaultValue="6m" label="Filtre">
            <MenuItem value="6m">Last 6 Months</MenuItem>
          </Select>
        </FormControl>
      }
    />
    <CardContent>
      {/* stacked bar */}
      <Box sx={{ display: 'flex', height: 40, mb: 3 }}>
        <Box sx={{ flex: 32, bgcolor: '#0288D1' }} />
        <Box sx={{ flex: 87, bgcolor: '#C2185B' }} />
        <Box sx={{ flex: 286, bgcolor: '#C0CA33' }} />
      </Box>
      {/* legend */}
      <Grid container spacing={2}>
        <Grid item xs={6}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box sx={{ width: 4, height: 24, bgcolor: '#0288D1', mr: 1 }} />
            <Box>
              <Typography variant="caption" color="text.secondary">
                nouvelle inscription
              </Typography>
              <Typography variant="h5">32</Typography>
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
              <Typography variant="h5">87</Typography>
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
              <Typography variant="h5">286</Typography>
            </Box>
          </Box>
        </Grid>
      </Grid>
    </CardContent>
  </Card>
);

//
// 3. ClientsEvolutionCard with thicker line
//
const ClientsEvolutionCard = () => {
  const theme = useTheme();
  const series = [{ name: 'Taux inscrit', data: [60, 50, 85, 70, 90, 75] }];
  const options = {
    chart: { toolbar: { show: false }, zoom: { enabled: false } },
    stroke: { curve: 'smooth', width: 4 },
    xaxis: {
      categories: ['Dec 2027','Jan 2028','Feb 2028','Mar 2028','Apr 2028','May 2028'],
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
    <Card sx={{ boxShadow: 3, height: '100%' }}>
      <CardHeader
        title="Évolution des clients"
        titleTypographyProps={{ variant: 'overline', color: 'text.secondary' }}
        action={
          <FormControl size="small" sx={{ minWidth: 140 }}>
            <InputLabel>Filtre</InputLabel>
            <Select defaultValue="6m" label="Filtre">
              <MenuItem value="6m">Last 6 Months</MenuItem>
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
const CommandEvolutionCard = ({ title, value, diff, trend, bg }) => {
  const TrendIcon = trend === 'up' ? ArrowUpIcon : ArrowDownIcon;
  const color = trend === 'up' ? '#66bb6a' : '#ef5350';
  return (
    <Card sx={{ background: bg, boxShadow: 3 }}>
      <CardHeader
        title={title}
        titleTypographyProps={{ variant: 'overline', color: 'text.secondary' }}
      />
      <CardContent>
        <Typography variant="h4">{value}</Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
          <TrendIcon size={20} color={color} />
          <Typography variant="body2" sx={{ color, ml: 0.5 }}>{diff}%</Typography>
          <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
            this week
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

//
// 5. RecetteTable
//
const RecetteTable = () => {
  const data = [
    { mois: 'Janvier', coN: 40, coM: 35000, fcN: 101, fcM: 30000, legN: 19, legM: 60000 },
    { mois: 'Février', coN: 50, coM: 50000, fcN: 202, fcM: 2000,  legN: 19, legM: 50000 }
  ];
  const totals = data.reduce(
    (acc, cur) => ({
      coN: acc.coN + cur.coN,
      coM: acc.coM + cur.coM,
      fcN: acc.fcN + cur.fcN,
      fcM: acc.fcM + cur.fcM,
      legN: acc.legN + cur.legN,
      legM: acc.legM + cur.legM
    }),
    { coN: 0, coM: 0, fcN: 0, fcM: 0, legN: 0, legM: 0 }
  );

  return (
    <TableContainer component={Paper} sx={{ boxShadow: 3, mt: 4 }}>
      <Box sx={{ p: 1, display: 'flex', justifyContent: 'space-between' }}>
        <Typography variant="overline">État des recettes par prestation</Typography>
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Filtre</InputLabel>
          <Select defaultValue="week" label="Filtre">
            <MenuItem value="week">This Week</MenuItem>
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
          {data.map(r => (
            <TableRow key={r.mois}>
              <TableCell>{r.mois}</TableCell>
              <TableCell>{r.coN}</TableCell>
              <TableCell>{r.coM.toLocaleString()}</TableCell>
              <TableCell>{r.fcN}</TableCell>
              <TableCell>{r.fcM.toLocaleString()}</TableCell>
              <TableCell>{r.legN}</TableCell>
              <TableCell>{r.legM.toLocaleString()}</TableCell>
            </TableRow>
          ))}
          <TableRow>
            <TableCell><strong>Totaux</strong></TableCell>
            <TableCell>{totals.coN}</TableCell>
            <TableCell>{totals.coM.toLocaleString()}</TableCell>
            <TableCell>{totals.fcN}</TableCell>
            <TableCell>{totals.fcM.toLocaleString()}</TableCell>
            <TableCell>{totals.legN}</TableCell>
            <TableCell>{totals.legM.toLocaleString()}</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </TableContainer>
  );
};

//
// 6. DashboardOperateur
//
export default function DashboardOperateur() {
  const user = useSelector(state => state.auth.user);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('week');

  useEffect(() => {
    (async () => {
      setLoading(true);
      const now = new Date();
      const start = new Date(now);
      start.setDate(now.getDate() - (filter === 'week' ? 7 : 30));

      try {
        const resp = await getOrderStaticsByServices({
          p_date_start: start.toISOString(),
          p_date_end: now.toISOString(),
          p_id_custaccount: null
        });
        setStats(resp.data?.[0] || {});
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, [filter]);

  if (loading) {
    return <Typography>Chargement…</Typography>;
  }

  return (
    <Box sx={{ ml: { xs: 0, md: '240px' }, p: 2 }}>
      <Helmet><title>Dashboard Opérateur</title></Helmet>

      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ flexGrow: 1 }}>Dashboard</Typography>
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Filtre</InputLabel>
          <Select value={filter} label="Filtre" onChange={e => setFilter(e.target.value)}>
            <MenuItem value="week">This Week</MenuItem>
            <MenuItem value="month">This Month</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Overview */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} md={4}>
          <OverviewCard
            title="Certificat d'origine émis"
            value={stats.count_ord_certif_ori?.toLocaleString() || '0'}
            subtitle="Entre hier et aujourd'hui"
            icon={<ArrowRightIcon />}
            iconColor="#388E3C"
            iconBg="rgba(56,142,60,0.1)"
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <OverviewCard
            title="Factures commerciales visées"
            value={stats.count_ord_com_invoice?.toLocaleString() || '0'}
            subtitle="Entre hier et aujourd'hui"
            icon={<CurrencyDollarIcon />}
            iconColor="#1E88E5"
            iconBg="rgba(30,136,229,0.1)"
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <OverviewCard
            title="Documents légalisés"
            value={stats.count_ord_legalization?.toLocaleString() || '0'}
            subtitle="Entre hier et aujourd'hui"
            icon={<CheckCircleIcon />}
            iconColor="#C8A415"
            iconBg="rgba(200,164,21,0.1)"
          />
        </Grid>
      </Grid>

      {/* Clients */}
      <Grid container spacing={3} mb={4} alignItems="stretch">
        <Grid item xs={12} md={6}>
          <ClientsCountCard />
        </Grid>
        <Grid item xs={12} md={6}>
          <ClientsEvolutionCard />
        </Grid>
      </Grid>

      {/* Évolution des commandes in white rectangle */}
      <Card sx={{ background: '#fff', boxShadow: 3, p: 2, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="overline">Évolution des commandes</Typography>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Filtre</InputLabel>
            <Select value={filter} label="Filtre" onChange={e => setFilter(e.target.value)}>
              <MenuItem value="week">This Week</MenuItem>
              <MenuItem value="month">This Month</MenuItem>
            </Select>
          </FormControl>
        </Box>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={4}>
            <CommandEvolutionCard
              title="Nombre de C.O effectués"
              value="128k"
              diff={37.8}
              trend="up"
              bg="#E8F5E9"
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <CommandEvolutionCard
              title="Nombre facture commerciale visée"
              value="521"
              diff={37.8}
              trend="down"
              bg="#E3F2FD"
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <CommandEvolutionCard
              title="Nombre de document légalisé"
              value="64k"
              diff={37.8}
              trend="up"
              bg="#FFF8E1"
            />
          </Grid>
        </Grid>
      </Card>

      {/* Recette table */}
      <RecetteTable />
    </Box>
  );
}
