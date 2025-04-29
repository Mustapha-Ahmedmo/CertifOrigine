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
  ToggleButton,
  ToggleButtonGroup,
  FormControl,
  Select,
  MenuItem,
  InputLabel
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

function StatCard({
  title,
  value,
  diff,
  trend,
  icon,
  periodLabel,
  bgColor,
  iconColor,
  iconBg
}) {
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
          {diff !== undefined && (
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <Stack direction="row" alignItems="center" spacing={0.5}>
                <TrendIcon size={20} color={trendColor} />
                <Typography color={trendColor} variant="body2">{diff}%</Typography>
              </Stack>
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
  const categories = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const [series, setSeries] = useState([
    { name: 'Approved', data: Array(7).fill(0) },
    { name: 'Paid', data: Array(7).fill(0) }
  ]);

  useEffect(() => {
    (async () => {
      const now = new Date();
      const dayOfWeek = now.getDay() || 7;      // Sunday as 7
      const mon = new Date(now);
      mon.setDate(now.getDate() - dayOfWeek + 1);
      const sun = new Date(mon);
      sun.setDate(mon.getDate() + 6);

      try {
        const resp = await getOrderAmountByDay({
          p_date_start: mon.toISOString(),
          p_date_end: sun.toISOString(),
          p_id_custaccount: custAccountId,
          p_unit_ori_certif: unitCertif,
          p_unit_ori_certif_copy: unitCopy
        });
        const approvedMap = { Monday: 0, Tuesday: 0, Wednesday: 0, Thursday: 0, Friday: 0, Saturday: 0, Sunday: 0 };
        const paidMap = { ...approvedMap };
        resp.data.forEach(r => {
          const raw = (r.thedayofweek || '').trim();
          const dayName = raw.charAt(0).toUpperCase() + raw.slice(1).toLowerCase();
          if (approvedMap.hasOwnProperty(dayName)) {
            approvedMap[dayName] = parseFloat(r.amount_ord_certif_ori_approved) || 0;
            paidMap[dayName] = parseFloat(r.amount_ord_certif_ori_paid) || 0;
          }
        });
        setSeries([
          { name: 'Approved', data: Object.values(approvedMap) },
          { name: 'Paid', data: Object.values(paidMap) }
        ]);
      } catch (err) {
        console.error('Failed to load daily amounts', err);
      }
    })();
  }, [custAccountId, unitCertif, unitCopy]);

  const chartOptions = useMemo(() => ({
    chart: { background: 'transparent', stacked: false, toolbar: { show: false } },
    colors: ['#66bb6a', '#42a5f5'],
    dataLabels: { enabled: false },
    fill: { opacity: 1, type: 'solid' },
    grid: {
      borderColor: theme.palette.divider,
      strokeDashArray: 2,
      xaxis: { lines: { show: false } },
      yaxis: { lines: { show: true } }
    },
    legend: { show: true, position: 'top' },
    plotOptions: { bar: { columnWidth: '40px' } },
    stroke: { colors: ['transparent'], show: true, width: 2 },
    theme: { mode: theme.palette.mode },
    xaxis: {
      categories,
      axisBorder: { color: theme.palette.divider },
      axisTicks: { color: theme.palette.divider },
      labels: { style: { colors: theme.palette.text.secondary } }
    },
    yaxis: {
      min: 0,
      labels: { formatter: v => v.toLocaleString(), style: { colors: theme.palette.text.secondary } }
    }
  }), [theme]);

  return (
    <Card>
      <CardHeader title="Montant dépensé par Certificat d'Origine" />
      <CardContent>
        <ReactApexChart type="bar" series={series} options={chartOptions} width="100%" height={350} />
      </CardContent>
    </Card>
  );
}

export default function DashboardClient() {
  const user = useSelector(state => state.auth.user);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [timeframe, setTimeframe] = useState('week');
  const [coCount, setCoCount] = useState(0);
  const [invoiceCount, setInvoiceCount] = useState(0);
  const [legalCount, setLegalCount] = useState(0);

  const handleTimeframeChange = (e) => {
    setTimeframe(e.target.value);
  };

  useEffect(() => {
    (async () => {
      const now = new Date();
      let start;
      if (timeframe === 'week') {
        const d = now.getDay() || 7;
        start = new Date(now);
        start.setDate(now.getDate() - d + 1);
      } else if (timeframe === 'month') {
        start = new Date(now.getFullYear(), now.getMonth(), 1);
      } else if (timeframe === 'semester') {
        const m = now.getMonth();
        start = m < 6
          ? new Date(now.getFullYear(), 0, 1)
          : new Date(now.getFullYear(), 6, 1);
      } else { // year
        start = new Date(now.getFullYear(), 0, 1);
      }
      const startISO = start.toISOString();
      const endISO = now.toISOString();

      try {
        // Certificat d'Origine
        const coResp = await getOrderStaticsByServices({
          p_date_start: startISO,
          p_date_end: endISO,
          p_borderstatus_approved: true,
          p_id_custaccount: user?.custAccountId
        });
        setCoCount(parseInt(coResp.data[0]?.count_ord_certif_ori, 10) || 0);

        // Factures Commerciales
        const invResp = await getOrderStaticsByServices({
          p_date_start: startISO,
          p_date_end: endISO,
          p_id_custaccount: user?.custAccountId
        });
        setInvoiceCount(parseInt(invResp.data[0]?.count_ord_com_invoice, 10) || 0);

        // Légalisations
        const legResp = await getOrderStaticsByServices({
          p_date_start: startISO,
          p_date_end: endISO,
          p_id_custaccount: user?.custAccountId
        });
        setLegalCount(parseInt(legResp.data[0]?.count_ord_legalization, 10) || 0);

      } catch (e) {
        console.error('Overview stats error', e);
      }
    })();
  }, [timeframe, user]);

  const periodLabels = {
    week: 'This Week',
    month: 'This Month',
    semester: 'This Semester',
    year: 'This Year'
  };

  // placeholder trend
  const trend = 'up';
  const unitCertif = 50, unitCopy = 10;

  return (
    <Box sx={{
      p: 2,
      ml: isMobile ? 0 : `${drawerWidth}px`,
      width: isMobile ? '100%' : `calc(100% - ${drawerWidth}px)`
    }}>
      <Typography variant="h5" mb={3}>
        Bienvenue <strong>{user?.companyname}</strong>
      </Typography>

      <Card sx={{ mb: 4 }}>
        <CardHeader
          title="Overview"
          action={
            <FormControl size="small" sx={{ minWidth: 140 }}>
              <InputLabel>Timeframe</InputLabel>
              <Select
                value={timeframe}
                label="Timeframe"
                onChange={handleTimeframeChange}
              >
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
                diff={undefined}
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
                diff={undefined}
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
                title="Nombre de légalisations"
                value={legalCount.toLocaleString()}
                diff={undefined}
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

      <SpendChartCard
        custAccountId={user?.custAccountId}
        unitCertif={unitCertif}
        unitCopy={unitCopy}
      />
    </Box>
  );
}