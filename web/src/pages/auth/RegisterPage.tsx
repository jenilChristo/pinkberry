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

export function RegisterPage() {
  const styles = useStyles();
  const navigate = useNavigate();
  const setUser = useAuthStore((state) => state.setUser);
  const { showToast, setLoading } = useUIStore();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      showToast('Passwords do not match', 'error');
      return;
    }

    setLoading(true);

    try {
      const response = await authService.register(formData);
      setUser(response.user);
      showToast('Registration successful!', 'success');
      navigate('/dashboard');
    } catch (error) {
      showToast('Registration failed. Please try again.', 'error');
      console.error('Registration error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <div className={styles.header}>
        <Title3 className={styles.title}>Create Account</Title3>
        <Text className={styles.subtitle}>Sign up to get started with Baby Chloe</Text>
      </div>

      <Field label="Name" required>
        <Input
          type="text"
          name="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="Enter your name"
          required
        />
      </Field>

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

      <Field label="Confirm Password" required>
        <Input
          type="password"
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
          placeholder="Confirm your password"
          required
        />
      </Field>

      <Button appearance="primary" type="submit" size="large">
        Sign Up
      </Button>

      <div className={styles.footer}>
        <Text>
          Already have an account?{' '}
          <Link to="/login" className={styles.link}>
            Sign in
          </Link>
        </Text>
      </div>
    </form>
  );
}
