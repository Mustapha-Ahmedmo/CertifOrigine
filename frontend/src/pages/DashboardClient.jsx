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
  getOrderAmountByDay
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
  const weekCategories = ['Week 1','Week 2','Week 3','Week 4'];
  const dayCategories  = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];

  const [timeframe, setTimeframe] = useState('month');
  const [series, setSeries] = useState([
    { name: 'Paid', data: Array(4).fill(0) }
    ]);

    const [openCustomModal, setOpenCustomModal] = useState(false);
    const [customStart, setCustomStart] = useState('');
    const [customEnd,   setCustomEnd]   = useState('');

  useEffect(() => {
    (async () => {
      const now = new Date();
      let start;
      if (timeframe === 'week') {
        const d = now.getDay()||7;
        start = new Date(now); start.setDate(now.getDate() - d + 1);
      } else if (timeframe === 'month') {
        start = new Date(now.getFullYear(), now.getMonth(), 1);
      } else if (timeframe === 'semester') {
        const m = now.getMonth();
        start = m<6
          ? new Date(now.getFullYear(),0,1)
          : new Date(now.getFullYear(),6,1);
           } else if (timeframe === 'custom') {
               // dates choisies dans le modal « Autre… »
               start = new Date(customStart);
               now.setTime(new Date(customEnd).getTime());
             } else {
               start = new Date(now.getFullYear(), 0, 1);
      }

      try {
        const resp = await getOrderAmountByDay({
          p_date_start: start.toISOString(),
          p_date_end:   now.toISOString(),
          p_id_custaccount: custAccountId,
          p_unit_ori_certif: unitCertif,
          p_unit_ori_certif_copy: unitCopy
        });

        if (timeframe==='month') {
          const appr=[0,0,0,0], paid=[0,0,0,0];
          resp.data.forEach(r => {
            const day = new Date(r.theday).getDate();
            const idx = Math.min(Math.ceil(day/7)-1,3);
            appr[idx] += parseFloat(r.amount_ord_certif_ori_approved)||0;
            paid[idx] += parseFloat(r.amount_ord_certif_ori_paid)||0;
          });
           setSeries([
               { name: 'Paid', data: paid }
             ]);
        } else {
          const mapA = { Monday:0,Tuesday:0,Wednesday:0,Thursday:0,Friday:0,Saturday:0,Sunday:0 };
          const mapP = {...mapA};
          resp.data.forEach(r=>{
            const raw = (r.thedayofweek||'').trim();
            const day = raw.charAt(0).toUpperCase()+raw.slice(1).toLowerCase();
            if (mapA[day]!=null) {
              mapA[day] = parseFloat(r.amount_ord_certif_ori_approved)||0;
              mapP[day] = parseFloat(r.amount_ord_certif_ori_paid)||0;
            }
          });
          setSeries([
               { name: 'Paid', data: Object.values(mapP) }
             ]);
            
        }
      } catch(e){
        console.error(e);
      }
    })();
  }, [custAccountId, unitCertif, unitCopy, timeframe, customStart, customEnd]);

  const options = useMemo(() => ({
    chart:{ background:'transparent', toolbar:{ show:false }},
    title:{
      text:'Montant dépensé',
      align:'center',
      style:{ fontSize:'16px', fontWeight:'normal', color:theme.palette.text.primary }
    },
    colors:['#66bb6a','#42a5f5'],
    dataLabels:{ enabled:false },
    fill:{ opacity:1 },
    grid:{ borderColor:theme.palette.divider, strokeDashArray:2 },
    legend:{ position:'top' , showForSingleSeries:true },
    plotOptions:{ bar:{ columnWidth:'40px' }},
    stroke:{ show:true, width:2, colors:['transparent']},
    theme:{ mode:theme.palette.mode },
    xaxis:{
      categories: timeframe==='month'?weekCategories:dayCategories,
      axisBorder:{ color:theme.palette.divider },
      axisTicks:{ color:theme.palette.divider },
      labels:{ style:{ color:theme.palette.text.secondary }}
    },
    yaxis:{
      labels:{ formatter: v=>'$'+v.toLocaleString(), style:{ color:theme.palette.text.secondary }}
    }
  }),[theme, timeframe]);

  return (
    <Card>
      <CardHeader
        title={<strong>Finance</strong>}
        action={
          <FormControl size="small" sx={{ minWidth:120 }}>
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
      <Modal
  open={openCustomModal}
  onClose={() => setOpenCustomModal(false)}
>
  <Box sx={{
    position: 'absolute', top: '50%', left: '50%',
    transform: 'translate(-50%, -50%)',
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

    </Card>
  );
}

export default function DashboardClient() {
  const user = useSelector(s => s.auth.user);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // filtres
  const [timeframe, setTimeframe]             = useState('week');
  const [openCustomModal, setOpenCustomModal] = useState(false);
  const [customStart, setCustomStart]         = useState('');
  const [customEnd, setCustomEnd]             = useState('');
  const [coCount, setCoCount]                 = useState(0);
  const [invoiceCount, setInvoiceCount]       = useState(0);
  const [legalCount, setLegalCount]           = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const handleChangePage = (_e, newPage) => setPage(newPage);

  const handleChangeRowsPerPage = e => {
    setRowsPerPage(parseInt(e.target.value, 10));
    setPage(0);
  };

  

  useEffect(() => {
    (async () => {
      const now = new Date();
      let start;
      if (timeframe==='week') {
        const d = now.getDay()||7;
        start=new Date(now); start.setDate(now.getDate()-d+1);
      } else if (timeframe==='month') {
        start=new Date(now.getFullYear(),now.getMonth(),1);
      } else if (timeframe==='semester') {
        const m = now.getMonth();
        start = m<6
          ? new Date(now.getFullYear(),0,1)
          : new Date(now.getFullYear(),6,1);
      } else if (timeframe==='custom') {
        start = new Date(customStart);
        now.setTime(new Date(customEnd).getTime());
              } else if (timeframe === 'custom') {
                  start = new Date(customStart);
                  now.setTime(new Date(customEnd).getTime());
      } else {
        start = new Date(now.getFullYear(),0,1);
      }
      const p1 = start.toISOString(), p2 = now.toISOString();

      try {
        const co = await getOrderStaticsByServices({
          p_date_start:p1,
          p_date_end:  p2,
          p_borderstatus_approved:true,
          p_id_custaccount:user?.custAccountId
        });
        setCoCount(parseInt(co.data[0]?.count_ord_certif_ori,10)||0);

        const inv = await getOrderStaticsByServices({
          p_date_start:p1,
          p_date_end:  p2,
          p_id_custaccount:user?.custAccountId
        });
        setInvoiceCount(parseInt(inv.data[0]?.count_ord_com_invoice,10)||0);

        const leg = await getOrderStaticsByServices({
          p_date_start:p1,
          p_date_end:  p2,
          p_id_custaccount:user?.custAccountId
        });
        setLegalCount(parseInt(leg.data[0]?.count_ord_legalization,10)||0);
      } catch(e){
        console.error(e);
      }
    })();
  },[timeframe, customStart, customEnd, user]);

  const periodLabels = {
    week:'Semaine',
    month:'Mois',
    semester:'Semestre',
    year:'Année',
    custom:`${customStart} → ${customEnd}`
  };
  const trend = 'up';
  const unitCertif = 50, unitCopy = 10;

  return (
    <Box sx={{
      p:2,
      ml: isMobile?0:`${drawerWidth}px`,
      width: isMobile?'100%':`calc(100% - ${drawerWidth}px)`
    }}>
      <Typography variant="h5" mb={3}>
        Bienvenue <strong>{user?.companyname}</strong>
      </Typography>

      <Grid container spacing={3} alignItems="stretch">
        {/* Statistiques client */}
        <Grid item xs={12} md={8}>
          <Card sx={{ height:'100%', display:'flex', flexDirection:'column' }}>
            <CardHeader
              title={<strong>Client</strong>}
              action={
                <FormControl size="small" sx={{ minWidth:140 }}>
                  <InputLabel>Période</InputLabel>
                  <Select
                    value={timeframe}
                    label="Période"
                    onChange={e => {
                      const v = e.target.value;
                      if (v==='custom') {
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
            <CardContent sx={{ flexGrow:1 }}>
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
                    iconBg={alpha('#388E3C',0.1)}
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
                    iconBg={alpha('#1E88E5',0.1)}
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
                    iconBg={alpha('#C8A415',0.1)}
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
          position:'absolute', top:'50%', left:'50%',
          transform:'translate(-50%,-50%)',
          bgcolor:'background.paper', p:4, boxShadow:24,
          display:'flex', flexDirection:'column', gap:2, width:300
        }}>
          <Typography variant="h6">Choisissez les dates</Typography>
          <TextField
            label="Début"
            type="date"
            InputLabelProps={{ shrink:true }}
            value={customStart}
            onChange={e=>setCustomStart(e.target.value)}
          />
          <TextField
            label="Fin"
            type="date"
            InputLabelProps={{ shrink:true }}
            value={customEnd}
            onChange={e=>setCustomEnd(e.target.value)}
          />
          <Box sx={{ display:'flex', justifyContent:'flex-end', gap:1 }}>
            <Button onClick={()=>setOpenCustomModal(false)}>Annuler</Button>
            <Button
              variant="contained"
              onClick={()=> {
                if(customStart && customEnd){
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
      <Grid container spacing={3} sx={{ mt:2 }}>
        <Grid item xs={12}>
          <Card>
            <CardHeader
              title={<strong>Liste des derniers clients</strong>}
            />
            <CardContent>
              <TableContainer component={Paper} sx={{ overflowX:'auto' }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Nom client</TableCell>
                      <TableCell>Pays – Adresse</TableCell>
                      <TableCell>Certificat d'Origine</TableCell>
                      <TableCell>Facture commerciale</TableCell>
                      <TableCell>Legalisation document</TableCell>
                      <TableCell align="right">Montant</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
  {[
    { name: 'Mutsibushi ethio bo', amount: '$128 899.00', co: true,  inv: false, leg: true  },
    { name: 'REVO . djib. q6',     amount: '$128 899.00', co: true,  inv: false, leg: true  },
    // { name: 'Autre client',       amount: '$45 000.00',  co: false, inv: true,  leg: true  },
  ]
    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
    .map(row => (
      <TableRow key={row.name}>
        <TableCell>{row.name}</TableCell>
        <TableCell>-</TableCell>
        <TableCell>
          <Chip
            label={row.co ? 'check' : 'No check'}
            color={row.co ? 'success' : 'error'}
            size="small"
          />
        </TableCell>
        <TableCell>
          <Chip
            label={row.inv ? 'check' : 'No check'}
            color={row.inv ? 'success' : 'error'}
            size="small"
          />
        </TableCell>
        <TableCell>
          <Chip
            label={row.leg ? 'check' : 'No check'}
            color={row.leg ? 'success' : 'error'}
            size="small"
          />
        </TableCell>
        <TableCell align="right">{row.amount}</TableCell>
      </TableRow>
    ))}
</TableBody>

                </Table>
              </TableContainer>
              <TablePagination
  component="div"
  count={2}                 // ← remplace 2 par le nombre total réel de clients
  rowsPerPage={rowsPerPage}
  page={page}
  onPageChange={handleChangePage}
  onRowsPerPageChange={handleChangeRowsPerPage}
  rowsPerPageOptions={[10, 25, 50, 100]}
/>

            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
