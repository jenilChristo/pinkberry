import { useNavigate, useLocation } from 'react-router-dom';
import {
  makeStyles,
  shorthands,
  tokens,
  Button,
  Text,
  Avatar,
  Divider,
} from '@fluentui/react-components';
import {
  Home24Regular,
  Sleep24Regular,
  Food24Regular,
  ClipboardTask24Regular,
  DataArea24Regular,
  MicPulse24Regular,
  Timeline24Regular,
  Settings24Regular,
} from '@fluentui/react-icons';
import { useBabyStore } from '@/store';

const useStyles = makeStyles({
  sidebar: {
    display: 'flex',
    flexDirection: 'column',
    width: '240px',
    backgroundColor: tokens.colorNeutralBackground1,
    ...shorthands.borderRight(
      tokens.strokeWidthThin,
      'solid',
      tokens.colorNeutralStroke1
    ),
    ...shorthands.padding('1.5rem', '1rem'),
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    ...shorthands.gap('0.75rem'),
    ...shorthands.padding('0.5rem'),
    marginBottom: '1.5rem',
  },
  logoText: {
    fontSize: '1.25rem',
    fontWeight: 600,
    color: tokens.colorBrandForeground1,
  },
  babyInfo: {
    display: 'flex',
    alignItems: 'center',
    ...shorthands.gap('0.75rem'),
    ...shorthands.padding('0.75rem'),
    ...shorthands.borderRadius(tokens.borderRadiusMedium),
    backgroundColor: tokens.colorNeutralBackground3,
    marginBottom: '1.5rem',
  },
  babyName: {
    fontSize: '0.875rem',
    fontWeight: 600,
  },
  nav: {
    display: 'flex',
    flexDirection: 'column',
    ...shorthands.gap('0.25rem'),
    flex: 1,
  },
  navButton: {
    justifyContent: 'flex-start',
    width: '100%',
  },
  divider: {
    marginTop: '1rem',
    marginBottom: '1rem',
  },
});

export function Sidebar() {
  const styles = useStyles();
  const navigate = useNavigate();
  const location = useLocation();
  const currentBaby = useBabyStore((state) => state.currentBaby);

  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: <Home24Regular /> },
    { path: '/sleep', label: 'Sleep', icon: <Sleep24Regular /> },
    { path: '/feeding', label: 'Feeding', icon: <Food24Regular /> },
    { path: '/diaper', label: 'Diaper', icon: <ClipboardTask24Regular /> },
    { path: '/growth', label: 'Growth', icon: <DataArea24Regular /> },
    { path: '/cry-analyzer', label: 'Cry Analyzer', icon: <MicPulse24Regular /> },
    { path: '/activity', label: 'Activity', icon: <Timeline24Regular /> },
  ];

  return (
    <aside className={styles.sidebar}>
      <div className={styles.logo}>
        <Avatar color="brand" size={32} />
        <Text className={styles.logoText}>Baby Chloe</Text>
      </div>

      {currentBaby && (
        <div className={styles.babyInfo}>
          <Avatar
            name={currentBaby.name}
            image={{ src: currentBaby.photoUrl }}
            size={40}
          />
          <div>
            <Text className={styles.babyName}>{currentBaby.name}</Text>
            <Text size={200} style={{ display: 'block' }}>
              {new Date().getFullYear() -
                new Date(currentBaby.dateOfBirth).getFullYear()}{' '}
              years old
            </Text>
          </div>
        </div>
      )}

      <nav className={styles.nav}>
        {navItems.map((item) => (
          <Button
            key={item.path}
            appearance={isActive(item.path) ? 'primary' : 'subtle'}
            icon={item.icon}
            onClick={() => navigate(item.path)}
            className={styles.navButton}
          >
            {item.label}
          </Button>
        ))}

        <Divider className={styles.divider} />

        <Button
          appearance={isActive('/settings') ? 'primary' : 'subtle'}
          icon={<Settings24Regular />}
          onClick={() => navigate('/settings')}
          className={styles.navButton}
        >
          Settings
        </Button>
      </nav>
    </aside>
  );
}
