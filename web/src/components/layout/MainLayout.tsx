import { Outlet } from 'react-router-dom';
import {
  makeStyles,
  shorthands,
  tokens,
} from '@fluentui/react-components';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

const useStyles = makeStyles({
  container: {
    display: 'flex',
    height: '100vh',
    width: '100%',
    overflow: 'hidden',
  },
  main: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    overflow: 'hidden',
  },
  header: {
    ...shorthands.borderBottom(
      tokens.strokeWidthThin,
      'solid',
      tokens.colorNeutralStroke1
    ),
    backgroundColor: tokens.colorNeutralBackground1,
  },
  content: {
    flex: 1,
    overflowY: 'auto',
    ...shorthands.padding('1.5rem', '2rem'),
    backgroundColor: tokens.colorNeutralBackground2,
  },
});

interface MainLayoutProps {
  toggleTheme: () => void;
  isDark: boolean;
}

export function MainLayout({ toggleTheme, isDark }: MainLayoutProps) {
  const styles = useStyles();

  return (
    <div className={styles.container}>
      <Sidebar />
      <div className={styles.main}>
        <div className={styles.header}>
          <Header toggleTheme={toggleTheme} isDark={isDark} />
        </div>
        <main className={styles.content}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
