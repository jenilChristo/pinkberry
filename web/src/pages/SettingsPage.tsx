import { useState, useEffect } from 'react';
import {
  makeStyles,
  shorthands,
  tokens,
  Card,
  Text,
  Title2,
  Title3,
  Button,
  Field,
  Input,
  Avatar,
  Divider,
} from '@fluentui/react-components';
import { Add24Regular, Delete24Regular } from '@fluentui/react-icons';
import { useBabyStore, useAuthStore, useUIStore } from '@/store';
import { babyService } from '@/services/api';
import type { Baby } from '@/types';

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
  section: {
    marginBottom: '2rem',
  },
  sectionCard: {
    ...shorthands.padding('2rem'),
  },
  sectionTitle: {
    fontSize: '1.25rem',
    fontWeight: 600,
    marginBottom: '1.5rem',
  },
  profileSection: {
    display: 'flex',
    alignItems: 'center',
    ...shorthands.gap('1.5rem'),
    marginBottom: '1.5rem',
  },
  profileInfo: {
    flex: 1,
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    ...shorthands.gap('1rem'),
  },
  formActions: {
    display: 'flex',
    ...shorthands.gap('0.75rem'),
    justifyContent: 'flex-end',
    marginTop: '1rem',
  },
  divider: {
    marginTop: '1.5rem',
    marginBottom: '1.5rem',
  },
  babyList: {
    display: 'flex',
    flexDirection: 'column',
    ...shorthands.gap('1rem'),
  },
  babyItem: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...shorthands.padding('1rem'),
    ...shorthands.border(tokens.strokeWidthThin, 'solid', tokens.colorNeutralStroke1),
    ...shorthands.borderRadius(tokens.borderRadiusMedium),
  },
  babyInfo: {
    display: 'flex',
    alignItems: 'center',
    ...shorthands.gap('1rem'),
    flex: 1,
  },
  babyActions: {
    display: 'flex',
    ...shorthands.gap('0.5rem'),
  },
  addBabySection: {
    marginTop: '1rem',
    ...shorthands.padding('1.5rem'),
    ...shorthands.border(tokens.strokeWidthThin, 'solid', tokens.colorNeutralStroke1),
    ...shorthands.borderRadius(tokens.borderRadiusMedium),
    backgroundColor: tokens.colorNeutralBackground3,
  },
});

export function SettingsPage() {
  const styles = useStyles();
  const user = useAuthStore((state) => state.user);
  const { babies, currentBaby, setBabies, setCurrentBaby, addBaby, removeBaby } = useBabyStore();
  const { showToast } = useUIStore();

  const [showAddBaby, setShowAddBaby] = useState(false);
  const [babyForm, setBabyForm] = useState({
    name: '',
    dateOfBirth: '',
    gender: 'Female' as Baby['gender'],
  });

  useEffect(() => {
    loadBabies();
  }, []);

  const loadBabies = async () => {
    try {
      const data = await babyService.getBabies();
      setBabies(data);
      if (!currentBaby && data.length > 0) {
        setCurrentBaby(data[0]);
      }
    } catch (error) {
      showToast('Failed to load babies', 'error');
      console.error('Load babies error:', error);
    }
  };

  const handleAddBaby = async () => {
    if (!user) return;

    try {
      const newBaby = await babyService.createBaby({
        name: babyForm.name,
        dateOfBirth: babyForm.dateOfBirth,
        gender: babyForm.gender,
        familyId: user.familyId || user.id,
      });
      addBaby(newBaby);
      showToast('Baby added successfully', 'success');
      setShowAddBaby(false);
      setBabyForm({ name: '', dateOfBirth: '', gender: 'Female' });
    } catch (error) {
      showToast('Failed to add baby', 'error');
      console.error('Add baby error:', error);
    }
  };

  const handleDeleteBaby = async (babyId: string) => {
    try {
      await babyService.deleteBaby(babyId);
      removeBaby(babyId);
      showToast('Baby removed successfully', 'success');
    } catch (error) {
      showToast('Failed to remove baby', 'error');
      console.error('Delete baby error:', error);
    }
  };

  const handleSelectBaby = (baby: Baby) => {
    setCurrentBaby(baby);
    showToast(`Switched to ${baby.name}`, 'success');
  };

  const calculateAge = (dateOfBirth: string): string => {
    const birth = new Date(dateOfBirth);
    const now = new Date();
    const diffMonths =
      (now.getFullYear() - birth.getFullYear()) * 12 +
      (now.getMonth() - birth.getMonth());

    if (diffMonths < 12) {
      return `${diffMonths} months`;
    }
    const years = Math.floor(diffMonths / 12);
    const months = diffMonths % 12;
    return months > 0 ? `${years}y ${months}m` : `${years} years`;
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Title2 className={styles.title}>Settings</Title2>
        <Text>Manage your account and preferences</Text>
      </div>

      {/* Profile Section */}
      <div className={styles.section}>
        <Card className={styles.sectionCard}>
          <Title3 className={styles.sectionTitle}>Profile</Title3>
          <div className={styles.profileSection}>
            <Avatar name={user?.name} size={72} color="brand" />
            <div className={styles.profileInfo}>
              <Text weight="semibold" size={500}>
                {user?.name}
              </Text>
              <Text size={300}>{user?.email}</Text>
            </div>
          </div>
          <Text size={300} style={{ color: tokens.colorNeutralForeground3 }}>
            Profile editing coming soon
          </Text>
        </Card>
      </div>

      {/* Babies Management */}
      <div className={styles.section}>
        <Card className={styles.sectionCard}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Title3 className={styles.sectionTitle} style={{ marginBottom: 0 }}>
              Babies
            </Title3>
            <Button
              appearance="primary"
              icon={<Add24Regular />}
              onClick={() => setShowAddBaby(!showAddBaby)}
            >
              Add Baby
            </Button>
          </div>

          <Divider className={styles.divider} />

          {showAddBaby && (
            <div className={styles.addBabySection}>
              <Text weight="semibold" style={{ marginBottom: '1rem', display: 'block' }}>
                Add New Baby
              </Text>
              <div className={styles.form}>
                <Field label="Name" required>
                  <Input
                    value={babyForm.name}
                    onChange={(e) => setBabyForm({ ...babyForm, name: e.target.value })}
                    placeholder="Baby's name"
                  />
                </Field>
                <Field label="Date of Birth" required>
                  <Input
                    type="date"
                    value={babyForm.dateOfBirth}
                    onChange={(e) => setBabyForm({ ...babyForm, dateOfBirth: e.target.value })}
                  />
                </Field>
                <Field label="Gender">
                  <select
                    value={babyForm.gender}
                    onChange={(e) =>
                      setBabyForm({ ...babyForm, gender: e.target.value as Baby['gender'] })
                    }
                    style={{
                      padding: '0.5rem',
                      borderRadius: tokens.borderRadiusMedium,
                      border: `${tokens.strokeWidthThin} solid ${tokens.colorNeutralStroke1}`,
                    }}
                  >
                    <option value="Female">Female</option>
                    <option value="Male">Male</option>
                    <option value="Other">Other</option>
                  </select>
                </Field>
                <div className={styles.formActions}>
                  <Button appearance="secondary" onClick={() => setShowAddBaby(false)}>
                    Cancel
                  </Button>
                  <Button
                    appearance="primary"
                    onClick={handleAddBaby}
                    disabled={!babyForm.name || !babyForm.dateOfBirth}
                  >
                    Add Baby
                  </Button>
                </div>
              </div>
            </div>
          )}

          <div className={styles.babyList}>
            {babies.length === 0 ? (
              <Text>No babies added yet. Add your first baby above!</Text>
            ) : (
              babies.map((baby) => (
                <div key={baby.id} className={styles.babyItem}>
                  <div className={styles.babyInfo}>
                    <Avatar name={baby.name} image={{ src: baby.photoUrl }} size={48} />
                    <div>
                      <Text weight="semibold">{baby.name}</Text>
                      <Text size={200} style={{ display: 'block' }}>
                        {calculateAge(baby.dateOfBirth)} • {baby.gender}
                      </Text>
                    </div>
                  </div>
                  <div className={styles.babyActions}>
                    {currentBaby?.id !== baby.id && (
                      <Button appearance="primary" onClick={() => handleSelectBaby(baby)}>
                        Select
                      </Button>
                    )}
                    {currentBaby?.id === baby.id && (
                      <Button appearance="subtle" disabled>
                        Current
                      </Button>
                    )}
                    <Button
                      appearance="subtle"
                      icon={<Delete24Regular />}
                      onClick={() => handleDeleteBaby(baby.id)}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      {/* Caregivers Section */}
      <div className={styles.section}>
        <Card className={styles.sectionCard}>
          <Title3 className={styles.sectionTitle}>Caregivers</Title3>
          <Text size={300} style={{ color: tokens.colorNeutralForeground3 }}>
            Multi-caregiver support coming soon. Share baby tracking with family members.
          </Text>
        </Card>
      </div>

      {/* Data & Privacy */}
      <div className={styles.section}>
        <Card className={styles.sectionCard}>
          <Title3 className={styles.sectionTitle}>Data & Privacy</Title3>
          <Text size={300} style={{ color: tokens.colorNeutralForeground3 }}>
            Export your data, manage privacy settings, and delete your account.
          </Text>
          <div className={styles.formActions}>
            <Button appearance="secondary">Export Data</Button>
            <Button appearance="secondary">Delete Account</Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
