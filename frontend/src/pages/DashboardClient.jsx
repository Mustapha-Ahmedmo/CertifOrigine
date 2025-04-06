// DashboardClient.jsx
import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import useMediaQuery from '@mui/material/useMediaQuery';

// MUI Components
import {
  Box,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Stack,
  Typography,
  Avatar,
  Button,
  Divider
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';

// Phosphor Icons
import {
  ArrowDown as ArrowDownIcon,
  ArrowUp as ArrowUpIcon,
  Activity as ActivityIcon,      // Icône "onde" verte
  CreditCard as CreditCardIcon,    // Icône "carte bleue"
  BagSimple as BagSimpleIcon,      // Icône "sac"
} from '@phosphor-icons/react';

// ApexCharts
import ReactApexChart from 'react-apexcharts';

/*******************************************************************************
 * Largeur du menu latéral
 ******************************************************************************/
const drawerWidth = 240;

/*******************************************************************************
 * Composant générique StatCard
 ******************************************************************************/
function StatCard({
  title,
  value,
  diff,
  trend,
  icon,
  periodLabel = "since last month",
  bgColor,
  iconColor,
  iconBg
}) {
  const TrendIcon = trend === 'up' ? ArrowUpIcon : ArrowDownIcon;
  // Couleur de la flèche + pourcentage
  const trendColor = trend === 'up' ? '#66bb6a' : '#ef5350';

  return (
    <Card sx={{ height: '100%', backgroundColor: bgColor || 'transparent' }}>
      <CardContent>
        <Stack spacing={2}>
          {/* Titre + Valeur */}
          <Stack
            direction="row"
            alignItems="flex-start"
            justifyContent="space-between"
            spacing={3}
          >
            <Stack spacing={1}>
              <Typography color="text.secondary" variant="overline">
                {title}
              </Typography>
              <Typography variant="h4">{value}</Typography>
            </Stack>

            <Avatar
              sx={{
                backgroundColor: iconBg || alpha('#66bb6a', 0.1),
                color: iconColor || '#66bb6a',
                height: 56,
                width: 56,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {React.cloneElement(icon, { size: 28, color: iconColor || '#66bb6a' })}
            </Avatar>
          </Stack>

          {/* Pourcentage d'évolution (optionnel) */}
          {diff !== undefined && (
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Stack direction="row" spacing={0.5} alignItems="center">
                <TrendIcon size={20} color={trendColor} />
                <Typography color={trendColor} variant="body2">
                  {diff}%
                </Typography>
              </Stack>
              <Typography color="text.secondary" variant="caption">
                {periodLabel}
              </Typography>
            </Stack>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}

/*******************************************************************************
 * Composant pour le bar chart "Montant dépensé par Certificat d'Origine"
 ******************************************************************************/
function SpendChartCard() {
  const theme = useTheme();
  const categories = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const chartSeries = [
    { name: 'Payer', data: [12000, 21000, 15000, 42000, 30000, 65000, 10000] },
    { name: 'Valider', data: [8000, 12000, 18000, 25000, 40000, 15000, 45000] },
  ];

  const chartOptions = useMemo(() => {
    return {
      chart: {
        background: 'transparent',
        stacked: false,
        toolbar: { show: false },
      },
      colors: ['#66bb6a', '#42a5f5'],
      dataLabels: { enabled: false },
      fill: { opacity: 1, type: 'solid' },
      grid: {
        borderColor: theme.palette.divider,
        strokeDashArray: 2,
        xaxis: { lines: { show: false } },
        yaxis: { lines: { show: true } },
      },
      legend: {
        show: true,
        position: 'top',
      },
      plotOptions: {
        bar: { columnWidth: '40px' },
      },
      stroke: {
        colors: ['transparent'],
        show: true,
        width: 2,
      },
      theme: {
        mode: theme.palette.mode,
      },
      xaxis: {
        categories,
        axisBorder: { color: theme.palette.divider, show: true },
        axisTicks: { color: theme.palette.divider, show: true },
        labels: {
          offsetY: 5,
          style: { colors: theme.palette.text.secondary },
        },
      },
      yaxis: {
        min: 0,
        max: 75000,
        tickAmount: 5,
        labels: {
          formatter: (value) => {
            if (value === 0) return '0$';
            return `${value / 1000}k$`;
          },
          offsetX: -10,
          style: { colors: theme.palette.text.secondary },
        },
      },
    };
  }, [theme, categories]);

  return (
    <Card>
      <CardHeader title="Montant dépensé par Certificat d'Origine" />
      <CardContent>
        <ReactApexChart
          type="bar"
          series={chartSeries}
          options={chartOptions}
          width="100%"
          height={350}
        />
      </CardContent>
    </Card>
  );
}

/*******************************************************************************
 * Page DashboardClient
 ******************************************************************************/
export default function DashboardClient() {
  const user = useSelector((state) => state.auth.user);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Box
      sx={{
        p: 2,
        // Si mobile, on n'applique pas de marginLeft (car le menu est souvent masqué)
        ml: isMobile ? 0 : `${drawerWidth}px`,
        width: isMobile ? '100%' : `calc(100% - ${drawerWidth}px)`,
      }}
    >
      {/* Titre "Bienvenue <nom>" */}
      <div className="home-welcome-message" style={{ marginBottom: '2rem' }}>
        Bienvenue <span className="home-highlight-text">{user?.companyname}</span>
      </div>

      {/* Card Overview */}
      <Card sx={{ mb: 4 }}>
        <CardHeader
          title="Overview"
          action={
            <Button variant="text" color="inherit">
              This Week
            </Button>
          }
        />
        <CardContent>
          <Grid container spacing={3}>
            {/* Stat Card 1 */}
            <Grid item xs={12} sm={6} md={4}>
              <StatCard
                title="Nombre de C.O effectue"
                value="128k"
                diff={37.8}
                trend="up"
                periodLabel="this week"
                icon={<ActivityIcon />}
                bgColor="#E8F5E9"
                iconColor="#388E3C"
                iconBg={alpha('#388E3C', 0.1)}
              />
            </Grid>

            {/* Stat Card 2 */}
            <Grid item xs={12} sm={6} md={4}>
              <StatCard
                title="Nombre facture commercial visé"
                value="521"
                diff={37.8}
                trend="down"
                periodLabel="this week"
                icon={<CreditCardIcon />}
                bgColor="#E3F2FD"
                iconColor="#1E88E5"
                iconBg={alpha('#1E88E5', 0.1)}
              />
            </Grid>

            {/* Stat Card 3 */}
            <Grid item xs={12} sm={6} md={4}>
              <StatCard
                title="Nombre de document legalisé"
                value="64k"
                diff={37.8}
                trend="up"
                periodLabel="this week"
                icon={<BagSimpleIcon />}
                bgColor="#FFFAE6"
                iconColor="#C8A415"
                iconBg={alpha('#C8A415', 0.1)}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Spend Chart Card */}
      <SpendChartCard />
    </Box>
  );
}
