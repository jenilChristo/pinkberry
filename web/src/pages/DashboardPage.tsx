import { useState, useEffect } from 'react';
import {
  makeStyles,
  shorthands,
  tokens,
  Card,
  Text,
  Title2,
  Button,
  Spinner,
} from '@fluentui/react-components';
import {
  Sleep24Regular,
  Food24Regular,
  ClipboardTask24Regular,
  Add24Regular,
} from '@fluentui/react-icons';
import { useBabyStore, useUIStore } from '@/store';
import { dashboardService } from '@/services/api';
import type { DashboardSummary } from '@/types';
import { Loading } from '@/components/common/Loading';
import { useNavigate } from 'react-router-dom';

const useStyles = makeStyles({
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
  },
  header: {
    marginBottom: '2rem',
  },
  title: {
    marginBottom: '0.5rem',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    ...shorthands.gap('1.5rem'),
    marginBottom: '2rem',
  },
  statCard: {
    ...shorthands.padding('1.5rem'),
    cursor: 'pointer',
    transition: 'transform 0.2s',
    ':hover': {
      transform: 'scale(1.02)',
    },
  },
  statHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '1rem',
  },
  statIcon: {
    color: tokens.colorBrandForeground1,
  },
  statValue: {
    fontSize: '2rem',
    fontWeight: 700,
    marginBottom: '0.25rem',
  },
  statLabel: {
    color: tokens.colorNeutralForeground3,
    fontSize: '0.875rem',
  },
  recentSection: {
    marginTop: '2rem',
  },
  sectionTitle: {
    marginBottom: '1rem',
    fontSize: '1.25rem',
    fontWeight: 600,
  },
  activityList: {
    display: 'flex',
    flexDirection: 'column',
    ...shorthands.gap('0.75rem'),
  },
  activityCard: {
    ...shorthands.padding('1rem'),
  },
  activityTime: {
    color: tokens.colorNeutralForeground3,
    fontSize: '0.75rem',
  },
  quickActions: {
    display: 'flex',
    ...shorthands.gap('1rem'),
    marginTop: '2rem',
    flexWrap: 'wrap',
  },
});

export function DashboardPage() {
  const styles = useStyles();
  const navigate = useNavigate();
  const currentBaby = useBabyStore((state) => state.currentBaby);
  const { showToast } = useUIStore();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentBaby) {
      loadDashboard();
    }
  }, [currentBaby]);

  const loadDashboard = async () => {
    if (!currentBaby) return;

    try {
      setLoading(true);
      const data = await dashboardService.getDashboardSummary(currentBaby.id);
      setSummary(data);
    } catch (error) {
      showToast('Failed to load dashboard', 'error');
      console.error('Dashboard error:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleDateString();
  };

  if (loading) return <Loading message="Loading dashboard..." />;

  if (!currentBaby) {
    return (
      <div className={styles.container}>
        <Text>Please select a baby to view dashboard</Text>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Title2 className={styles.title}>Dashboard</Title2>
        <Text>Welcome back! Here's what's happening with {currentBaby.name}</Text>
      </div>

      <div className={styles.quickActions}>
        <Button
          appearance="primary"
          icon={<Add24Regular />}
          onClick={() => navigate('/sleep')}
        >
          Log Sleep
        </Button>
        <Button
          appearance="primary"
          icon={<Add24Regular />}
          onClick={() => navigate('/feeding')}
        >
          Log Feeding
        </Button>
        <Button
          appearance="primary"
          icon={<Add24Regular />}
          onClick={() => navigate('/diaper')}
        >
          Log Diaper
        </Button>
      </div>

      {summary && (
        <>
          <div className={styles.statsGrid}>
            <Card className={styles.statCard} onClick={() => navigate('/sleep')}>
              <div className={styles.statHeader}>
                <Sleep24Regular className={styles.statIcon} />
              </div>
              <div className={styles.statValue}>{summary.todayStats.totalSleepHours.toFixed(1)}h</div>
              <Text className={styles.statLabel}>Sleep Today</Text>
            </Card>

            <Card className={styles.statCard} onClick={() => navigate('/feeding')}>
              <div className={styles.statHeader}>
                <Food24Regular className={styles.statIcon} />
              </div>
              <div className={styles.statValue}>{summary.todayStats.totalFeedings}</div>
              <Text className={styles.statLabel}>Feedings Today</Text>
            </Card>

            <Card className={styles.statCard} onClick={() => navigate('/diaper')}>
              <div className={styles.statHeader}>
                <ClipboardTask24Regular className={styles.statIcon} />
              </div>
              <div className={styles.statValue}>{summary.todayStats.totalDiaperChanges}</div>
              <Text className={styles.statLabel}>Diapers Today</Text>
            </Card>
          </div>

          <div className={styles.recentSection}>
            <Text className={styles.sectionTitle}>Recent Activity</Text>
            <div className={styles.activityList}>
              {summary.recentActivities.slice(0, 5).map((activity) => (
                <Card key={activity.id} className={styles.activityCard}>
                  <Text weight="semibold">{activity.description}</Text>
                  <Text className={styles.activityTime}>
                    {formatTime(activity.timestamp)} • {activity.recordedByName}
                  </Text>
                </Card>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
