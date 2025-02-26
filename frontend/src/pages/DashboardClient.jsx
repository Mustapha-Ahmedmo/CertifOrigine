// DashboardClient.jsx
import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';

// MUI Components
import {
  Box,
  Grid,
  Card,
  CardContent,
  CardHeader,
  CardActions,
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
  Users as UsersIcon,
  CheckSquare as CheckSquareIcon,
  CurrencyDollar as CurrencyDollarIcon,
  ArrowClockwise as ArrowClockwiseIcon,
  ArrowRight as ArrowRightIcon,
} from '@phosphor-icons/react';

// ApexCharts + ReactApexChart
import ReactApexChart from 'react-apexcharts';

/*******************************************************************************
 * Largeur du menu latéral
 ******************************************************************************/
const drawerWidth = 240;

/*******************************************************************************
 * Composant générique de stats (StatCard)
 ******************************************************************************/
function StatCard({ title, value, diff, trend, icon }) {
  const TrendIcon = trend === 'up' ? ArrowUpIcon : ArrowDownIcon;
  const trendColor = trend === 'up' ? 'green' : 'red';

  return (
    <Card sx={{ height: '100%' }}>
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
                backgroundColor: '#f5f5f5',
                height: 56,
                width: 56,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {React.cloneElement(icon, { size: 28 })}
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
                since last month
              </Typography>
            </Stack>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}

/*******************************************************************************
 * Nouveau composant : OrdersChartCard
 * -> Remplace votre ancien BarChart en "mode" ApexCharts
 ******************************************************************************/
function OrdersChartCard() {
  const theme = useTheme();

  // Catégories fictives (X-axis)
  const categories = ['À soumettre', 'En validation', 'En paiement', 'Retournées'];

  // Série fictive (peut être modifiée selon vos vraies données)
  const chartSeries = [
    { name: 'Commandes 2023', data: [10, 8, 5, 2] },
    // Vous pourriez ajouter d'autres séries
  ];

  // Configuration ApexCharts
  const chartOptions = useMemo(() => {
    return {
      chart: {
        background: 'transparent',
        stacked: false,
        toolbar: { show: false },
      },
      colors: [
        theme.palette.primary.main,
        alpha(theme.palette.primary.main, 0.25),
      ],
      dataLabels: { enabled: false },
      fill: { opacity: 1, type: 'solid' },
      grid: {
        borderColor: theme.palette.divider,
        strokeDashArray: 2,
        xaxis: { lines: { show: false } },
        yaxis: { lines: { show: true } },
      },
      legend: { show: false },
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
        labels: {
          formatter: (value) => (value > 0 ? `${value}K` : `${value}`),
          offsetX: -10,
          style: { colors: theme.palette.text.secondary },
        },
      },
    };
  }, [theme, categories]);

  return (
    <Card>
      <CardHeader
        action={
          <Button
            color="inherit"
            size="small"
            startIcon={<ArrowClockwiseIcon size={18} />}
          >
            Sync
          </Button>
        }
        title="Statistiques de commandes"
      />
      <CardContent>
        <ReactApexChart
          type="bar"
          series={chartSeries}
          options={chartOptions}
          width="100%"
          height={350}
        />
      </CardContent>
      <Divider />
      <CardActions sx={{ justifyContent: 'flex-end' }}>
        <Button
          color="inherit"
          size="small"
          endIcon={<ArrowRightIcon size={18} />}
        >
          Voir plus
        </Button>
      </CardActions>
    </Card>
  );
}

/*******************************************************************************
 * Page DashboardClient
 ******************************************************************************/
export default function DashboardClient() {
  const user = useSelector((state) => state.auth.user);

  return (
    <Box
      sx={{
        p: 2,
        // Décale vers la droite pour laisser la place au menu (240px)
        ml: `${drawerWidth}px`,
        width: `calc(100% - ${drawerWidth}px)`,
      }}
    >
      {/* Titre "Bienvenue <nom>" */}
      <div className="home-welcome-message" style={{ marginBottom: '2rem' }}>
        Bienvenue <span className="home-highlight-text">{user?.companyname}</span>
      </div>

      {/* Cartes de stats */}
      <Grid container spacing={3} sx={{ marginBottom: 4 }}>
        {/* Stat réelle : Total des commandes */}
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total des commandes"
            value="1"
            icon={
              <UsersIcon color="#DCAF26" />
            }
          />
        </Grid>

        {/* Stat fictive : Task Progress */}
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Task Progress"
            value="67%"
            diff={3}
            trend="up"
            icon={
              <CheckSquareIcon color="#4caf50" />
            }
          />
        </Grid>

        {/* Stat fictive : Budget */}
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Budget"
            value="12 000 €"
            diff={12}
            trend="up"
            icon={
              <CurrencyDollarIcon color="#1976d2" />
            }
          />
        </Grid>
      </Grid>

      {/* Nouveau diagramme en barres (ApexCharts) dans un Card soigné */}
      <OrdersChartCard />
    </Box>
  );
}
