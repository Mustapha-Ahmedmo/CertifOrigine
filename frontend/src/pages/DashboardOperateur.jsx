import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useSelector } from 'react-redux';
import { Box, Grid, Card, CardContent, CardHeader, Typography, Button } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { ArrowUp as ArrowUpIcon, ArrowDown as ArrowDownIcon } from '@phosphor-icons/react';
import { Gauge } from '@mui/x-charts/Gauge';
import { getOrderStaticsByServices } from '../services/apiServices';

//
// Composant générique StatCard
//
const StatCard = ({ title, value, diff, trend, periodLabel }) => {
  const TrendIcon = trend === 'up' ? ArrowUpIcon : ArrowDownIcon;
  const trendColor = trend === 'up' ? '#66bb6a' : '#ef5350';
  return (
    <Card sx={{ height: '100%', backgroundColor: '#fff', boxShadow: 3 }}>
      <CardHeader
        title={title}
        titleTypographyProps={{
          variant: 'overline',
          color: 'text.secondary',
          align: 'left'
        }}
        action={<Button variant="text" color="inherit">This Week</Button>}
      />
      <CardContent>
        <Typography variant="h4">{value}</Typography>
        {diff !== undefined && (
          <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
            <TrendIcon size={20} color={trendColor} />
            <Typography variant="body2" color={trendColor} sx={{ ml: 0.5 }}>
              {diff}%
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
              {periodLabel}
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

//
// Card pour "Certificats payés" avec jauge
//
const CertificatPayeCard = ({ percentage }) => {
  return (
    <Card sx={{ mb: 4 }}>
      <CardHeader
        title="Certificats payés"
        titleTypographyProps={{
          variant: 'overline',
          color: 'text.secondary',
          align: 'left'
        }}
        action={<Button variant="text" color="inherit">7 derniers jours</Button>}
      />
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
          <Box sx={{ position: 'relative', width: 150, height: 150 }}>
            <Gauge
              width={150}
              height={150}
              min={0}
              max={100}
              value={percentage}
              thickness={1}
              trackThickness={1}
              label={() => null}
              sx={{
                '--ChartsProgressBar-trackColor': '#ededed',
                '--ChartsProgressBar-progressColor': '#2962FF',
                '--ChartsProgressBar-labelColor': 'transparent',
                '& .ChartsProgressBar-label': { display: 'none' }
              }}
              startAngle={0}
              endAngle={360}
            />
          </Box>
        </Box>
        <Typography variant="h4" align="center" sx={{ mt: 2 }}>
          {percentage}%
        </Typography>
      </CardContent>
    </Card>
  );
};

//
// DashboardOperateur
//
const DashboardOperateur = () => {
  const user = useSelector((state) => state.auth.user);
  const operatorId = user?.id_login_user;
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const theme = useTheme();
  useEffect(() => {
    const fetchStats = async () => {
      if (!operatorId) return;
      try {
        setLoading(true);

        // ─── Compute "today" and "7 days ago" ─────────────────────────
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(endDate.getDate() - 7);

        // Format as ISO (Postgres accepts e.g. "2025-04-21T14:30:00.000Z")
        const p_date_start = startDate.toISOString();
        const p_date_end = endDate.toISOString();
        // ────────────────────────────────────────────────────────────────

        const params = {
          p_date_start,
          p_date_end,
          p_id_list_order: null,
          p_id_custaccount: null,   // operator-wide
          p_borderstatus_insert_exclusif: null,
          p_borderstatus_new_exclusif: null,
          p_borderstatus_new: null,
          p_borderstatus_approved: null,
          p_borderstatus_paid: true,   // only “paid” window
        };

        const result = await getOrderStaticsByServices(params);
        // your helper returns { data: [ { count_ord_certif_ori, ... } ] }
        const statsRow = result.data?.[0] ?? result[0] ?? null;
        setStats(statsRow);
      } catch (err) {
        console.error('Error fetching order statistics:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [operatorId]);

  let percentagePaidCertif = 0;
  let total = 0;
  if (stats) {
    total =
      (stats.count_ord_certif_ori || 0) +
      (stats.count_ord_legalization || 0) +
      (stats.count_ord_com_invoice || 0);
    if (total > 0) {
      percentagePaidCertif = Math.round((stats.count_ord_certif_ori / total) * 100);
    }
  }

  // Valeurs fixes pour les évolutions (maquette)
  const newOrdersDiff = 37.8;
  const paymentOrdersDiff = 20;

  return (
    <Box
      sx={{
        ml: { xs: '2px', md: '240px' },
        p: 2,
        width: { xs: '100%', md: `calc(100% - 240px)` }
      }}
    >
      <Helmet>
        <title>Dashboard Opérateur</title>
      </Helmet>
      <Typography variant="h5" gutterBottom>
        Bienvenue <strong>{user?.full_name || 'Utilisateur'}</strong>
      </Typography>
      {loading ? (
        <Typography>Chargement des statistiques...</Typography>
      ) : (
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <CertificatPayeCard percentage={percentagePaidCertif} />
          </Grid>
          <Grid item xs={12} md={4}>
            <StatCard
              title="Nouvelles commandes"
              value={total}
              diff={newOrdersDiff}
              trend="up"
              periodLabel="7 derniers jours"
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <StatCard
              title="Commandes en attente de paiement"
              value={stats ? stats.count_ord_com_invoice : 0}
              diff={paymentOrdersDiff}
              trend="down"
              periodLabel="7 derniers jours"
            />
          </Grid>
        </Grid>
      )}
    </Box>
  );
};

export default DashboardOperateur;
