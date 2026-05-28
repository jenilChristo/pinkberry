import {
  makeStyles,
  shorthands,
  tokens,
  Button,
  Menu,
  MenuTrigger,
  MenuPopover,
  MenuList,
  MenuItem,
  Avatar,
  Text,
} from '@fluentui/react-components';
import {
  WeatherMoon24Regular,
  WeatherSunny24Regular,
  PersonRegular,
  SignOutRegular,
} from '@fluentui/react-icons';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store';
import { authService } from '@/services/api';

const useStyles = makeStyles({
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: '60px',
    ...shorthands.padding('0', '1.5rem'),
  },
  title: {
    fontSize: '1.25rem',
    fontWeight: 600,
  },
  actions: {
    display: 'flex',
    alignItems: 'center',
    ...shorthands.gap('0.75rem'),
  },
  userInfo: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    marginRight: '0.5rem',
  },
  userName: {
    fontSize: '0.875rem',
    fontWeight: 600,
  },
  userEmail: {
    fontSize: '0.75rem',
    color: tokens.colorNeutralForeground3,
  },
});

interface HeaderProps {
  toggleTheme: () => void;
  isDark: boolean;
}

export function Header({ toggleTheme, isDark }: HeaderProps) {
  const styles = useStyles();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  const handleLogout = async () => {
    try {
      await authService.logout();
      logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      logout();
      navigate('/login');
    }
  };

  return (
    <header className={styles.header}>
      <div>
        {/* Title can be dynamic based on route */}
      </div>

      <div className={styles.actions}>
        <Button
          appearance="subtle"
          icon={isDark ? <WeatherSunny24Regular /> : <WeatherMoon24Regular />}
          onClick={toggleTheme}
          title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        />

        <Menu>
          <MenuTrigger>
            <Button appearance="subtle" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div className={styles.userInfo}>
                <Text className={styles.userName}>{user?.name || 'User'}</Text>
                <Text className={styles.userEmail}>{user?.email || ''}</Text>
              </div>
              <Avatar
                name={user?.name}
                size={32}
                color="brand"
              />
            </Button>
          </MenuTrigger>

          <MenuPopover>
            <MenuList>
              <MenuItem icon={<PersonRegular />} onClick={() => navigate('/settings')}>
                Profile Settings
              </MenuItem>
              <MenuItem icon={<SignOutRegular />} onClick={handleLogout}>
                Sign Out
              </MenuItem>
            </MenuList>
          </MenuPopover>
        </Menu>
      </div>
    </header>
  );
}
