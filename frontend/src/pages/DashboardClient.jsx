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
  Chip
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
  const weekCategories = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
  const dayCategories  = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];

  const [timeframe, setTimeframe] = useState('month');
  const [series, setSeries]       = useState([
    { name: 'Approved', data: Array(4).fill(0) },
    { name: 'Paid',     data: Array(4).fill(0) }
  ]);

  useEffect(() => {
    (async () => {
      const now = new Date();
      let start;
      if (timeframe === 'week') {
        const d = now.getDay() || 7;
        start = new Date(now); start.setDate(now.getDate() - d + 1);
      } else if (timeframe === 'month') {
        start = new Date(now.getFullYear(), now.getMonth(), 1);
      } else if (timeframe === 'semester') {
        const m = now.getMonth();
        start = m < 6
          ? new Date(now.getFullYear(), 0, 1)
          : new Date(now.getFullYear(), 6, 1);
      } else {
        start = new Date(now.getFullYear(), 0, 1);
      }

      try {
        const resp = await getOrderAmountByDay({
          p_date_start:           start.toISOString(),
          p_date_end:             now.toISOString(),
          p_id_custaccount:       custAccountId,
          p_unit_ori_certif:      unitCertif,
          p_unit_ori_certif_copy: unitCopy
        });
        if (timeframe === 'month') {
          const appr = [0,0,0,0], paid = [0,0,0,0];
          resp.data.forEach(r => {
            const day = new Date(r.theday).getDate();
            const idx = Math.min(Math.ceil(day/7)-1, 3);
            appr[idx] += parseFloat(r.amount_ord_certif_ori_approved) || 0;
            paid[idx] += parseFloat(r.amount_ord_certif_ori_paid)     || 0;
          });
          setSeries([{ name:'Approved', data:appr }, { name:'Paid', data:paid }]);
        } else {
          const mapA = { Monday:0, Tuesday:0, Wednesday:0, Thursday:0, Friday:0, Saturday:0, Sunday:0 };
          const mapP = {...mapA};
          resp.data.forEach(r => {
            const raw = (r.thedayofweek||'').trim();
            const day = raw.charAt(0).toUpperCase()+raw.slice(1).toLowerCase();
            if (mapA[day]!=null) {
              mapA[day] = parseFloat(r.amount_ord_certif_ori_approved)||0;
              mapP[day] = parseFloat(r.amount_ord_certif_ori_paid)    ||0;
            }
          });
          setSeries([{ name:'Approved', data:Object.values(mapA) }, { name:'Paid', data:Object.values(mapP) }]);
        }
      } catch(e){
        console.error(e);
      }
    })();
  }, [custAccountId, unitCertif, unitCopy, timeframe]);

  const options = useMemo(()=>({
    chart:{ background:'transparent', toolbar:{ show:false } },
    colors:['#66bb6a','#42a5f5'],
    dataLabels:{ enabled:false },
    fill:{ opacity:1 },
    grid:{ borderColor:theme.palette.divider, strokeDashArray:2 },
    legend:{ position:'top' },
    plotOptions:{ bar:{ columnWidth:'40px' } },
    stroke:{ show:true, width:2, colors:['transparent'] },
    theme:{ mode:theme.palette.mode },
    xaxis:{
      categories: timeframe==='month'?weekCategories:dayCategories,
      axisBorder:{ color:theme.palette.divider },
      axisTicks:{ color:theme.palette.divider },
      labels:{ style:{ color:theme.palette.text.secondary } }
    },
    yaxis:{
      labels:{ formatter: v=>'$'+v.toLocaleString(), style:{ color:theme.palette.text.secondary } }
    }
  }),[theme, timeframe]);

  return (
    <Card>
      <CardHeader
        title="Montant dépensé par mois"
        action={
          <FormControl size="small" sx={{ minWidth:120 }}>
            <InputLabel>Timeframe</InputLabel>
            <Select value={timeframe} label="Timeframe" onChange={e => setTimeframe(e.target.value)}>
              <MenuItem value="week">This Week</MenuItem>
              <MenuItem value="month">This Month</MenuItem>
              <MenuItem value="semester">This Semester</MenuItem>
              <MenuItem value="year">This Year</MenuItem>
            </Select>
          </FormControl>
        }
      />
      <CardContent>
        <ReactApexChart type="bar" series={series} options={options} width="100%" height={350} />
      </CardContent>
    </Card>
  );
}

export default function DashboardClient() {
  const user = useSelector(s => s.auth.user);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [timeframe, setTimeframe]       = useState('week');
  const [coCount, setCoCount]           = useState(0);
  const [invoiceCount, setInvoiceCount] = useState(0);
  const [legalCount, setLegalCount]     = useState(0);

  // filtre pour le tableau
  const [tableFilter, setTableFilter]   = useState('week');

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
        const m=now.getMonth();
        start=m<6?new Date(now.getFullYear(),0,1):new Date(now.getFullYear(),6,1);
      } else {
        start=new Date(now.getFullYear(),0,1);
      }
      const p1=start.toISOString(), p2=now.toISOString();
      try {
        const co = await getOrderStaticsByServices({ p_date_start:p1, p_date_end:p2, p_borderstatus_approved:true, p_id_custaccount:user?.custAccountId });
        setCoCount(parseInt(co.data[0]?.count_ord_certif_ori,10)||0);
        const inv = await getOrderStaticsByServices({ p_date_start:p1, p_date_end:p2, p_id_custaccount:user?.custAccountId });
        setInvoiceCount(parseInt(inv.data[0]?.count_ord_com_invoice,10)||0);
        const leg = await getOrderStaticsByServices({ p_date_start:p1, p_date_end:p2, p_id_custaccount:user?.custAccountId });
        setLegalCount(parseInt(leg.data[0]?.count_ord_legalization,10)||0);
      } catch(e){ console.error(e) }
    })();
  },[timeframe, user]);

  const periodLabels = { week:'This Week', month:'This Month', semester:'This Semester', year:'This Year' };
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

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardHeader
              title="Overview"
              action={
                <FormControl size="small" sx={{ minWidth:120 }}>
                  <InputLabel>Timeframe</InputLabel>
                  <Select value={timeframe} label="Timeframe" onChange={e=>setTimeframe(e.target.value)}>
                    <MenuItem value="week">This Week</MenuItem>
                    <MenuItem value="month">This Month</MenuItem>
                    <MenuItem value="semester">This Semester</MenuItem>
                    <MenuItem value="year">This Year</MenuItem>
                  </Select>
                </FormControl>
              }
            />
            <CardContent>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6} md={4}>
                  <StatCard
                    title="Nombre de C.O effectués"
                    value={coCount.toLocaleString()}
                    trend={trend}
                    periodLabel={periodLabels[timeframe]}
                    icon={<ActivityIcon />} bgColor="#E8F5E9" iconColor="#388E3C" iconBg={alpha('#388E3C',0.1)}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <StatCard
                    title="Nombre factures commerciales"
                    value={invoiceCount.toLocaleString()}
                    trend={trend}
                    periodLabel={periodLabels[timeframe]}
                    icon={<CreditCardIcon />} bgColor="#E3F2FD" iconColor="#1E88E5" iconBg={alpha('#1E88E5',0.1)}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <StatCard
                    title="Nombre de documents légalisés"
                    value={legalCount.toLocaleString()}
                    trend={trend}
                    periodLabel={periodLabels[timeframe]}
                    icon={<BagSimpleIcon />} bgColor="#FFFAE6" iconColor="#C8A415" iconBg={alpha('#C8A415',0.1)}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <SpendChartCard
            custAccountId={user?.custAccountId}
            unitCertif={unitCertif}
            unitCopy={unitCopy}
          />
        </Grid>
      </Grid>

      {/* section séparée pour le tableau */}
      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item xs={12}>
          <Card>
            <CardHeader
              title="Liste des derniers clients"
              action={
                <FormControl size="small" sx={{ minWidth:120 }}>
                  <InputLabel>Filter</InputLabel>
                  <Select value={tableFilter} label="Filter" onChange={e=>setTableFilter(e.target.value)}>
                    <MenuItem value="week">This Week</MenuItem>
                  </Select>
                </FormControl>
              }
            />
            <CardContent>
              <TableContainer component={Paper} sx={{ overflowX: 'auto' }}>
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
                    <TableRow>
                      <TableCell>Mutsibushi ethio bo</TableCell>
                      <TableCell>-</TableCell>
                      <TableCell><Chip label="check" color="success" size="small"/></TableCell>
                      <TableCell><Chip label="No check" color="error" size="small"/></TableCell>
                      <TableCell><Chip label="check" color="success" size="small"/></TableCell>
                      <TableCell align="right">$128,899.00</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>REVO . djib. q6</TableCell>
                      <TableCell>-</TableCell>
                      <TableCell><Chip label="check" color="success" size="small"/></TableCell>
                      <TableCell><Chip label="No check" color="error" size="small"/></TableCell>
                      <TableCell><Chip label="check" color="success" size="small"/></TableCell>
                      <TableCell align="right">$128,899.00</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
