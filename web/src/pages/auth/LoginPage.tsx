import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  makeStyles,
  shorthands,
  tokens,
  Button,
  Input,
  Field,
  Text,
  Title3,
} from '@fluentui/react-components';
import { authService } from '@/services/api';
import { useAuthStore, useUIStore } from '@/store';

const useStyles = makeStyles({
  form: {
    display: 'flex',
    flexDirection: 'column',
    ...shorthands.gap('1.5rem'),
  },
  header: {
    textAlign: 'center',
    marginBottom: '1rem',
  },
  title: {
    marginBottom: '0.5rem',
  },
  subtitle: {
    color: tokens.colorNeutralForeground3,
  },
  footer: {
    textAlign: 'center',
    marginTop: '1rem',
  },
  link: {
    color: tokens.colorBrandForeground1,
    textDecoration: 'none',
    fontWeight: 600,
    ':hover': {
      textDecoration: 'underline',
    },
  },
});

export function LoginPage() {
  const styles = useStyles();
  const navigate = useNavigate();
  const setUser = useAuthStore((state) => state.setUser);
  const { showToast, setLoading } = useUIStore();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await authService.login(formData);
      setUser(response.user);
      showToast('Login successful!', 'success');
      navigate('/dashboard');
    } catch (error) {
      showToast('Login failed. Please check your credentials.', 'error');
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <div className={styles.header}>
        <Title3 className={styles.title}>Welcome Back</Title3>
        <Text className={styles.subtitle}>Sign in to continue to Baby Chloe</Text>
      </div>

      <Field label="Email" required>
        <Input
          type="email"
          name="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          placeholder="Enter your email"
          required
        />
      </Field>

      <Field label="Password" required>
        <Input
          type="password"
          name="password"
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          placeholder="Enter your password"
          required
        />
      </Field>

      <Button appearance="primary" type="submit" size="large">
        Sign In
      </Button>

      <div className={styles.footer}>
        <Text>
          Don't have an account?{' '}
          <Link to="/register" className={styles.link}>
            Sign up
          </Link>
        </Text>
      </div>
    </form>
  );
}
