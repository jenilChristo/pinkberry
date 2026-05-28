import { Outlet } from 'react-router-dom';
import {
  makeStyles,
  shorthands,
  tokens,
} from '@fluentui/react-components';

const useStyles = makeStyles({
  container: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    backgroundColor: tokens.colorNeutralBackground2,
    ...shorthands.padding('2rem'),
  },
  content: {
    width: '100%',
    maxWidth: '450px',
    backgroundColor: tokens.colorNeutralBackground1,
    ...shorthands.borderRadius(tokens.borderRadiusLarge),
    ...shorthands.padding('3rem', '2.5rem'),
    boxShadow: tokens.shadow16,
  },
});

export function AuthLayout() {
  const styles = useStyles();

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <Outlet />
      </div>
    </div>
  );
}
