import { useState, useEffect } from 'react';
import {
  makeStyles,
  shorthands,
  tokens,
  Card,
  Text,
  Title2,
  Button,
  Dialog,
  DialogTrigger,
  DialogSurface,
  DialogTitle,
  DialogBody,
  DialogActions,
  DialogContent,
  Field,
  Input,
  Select,
  Checkbox,
  Textarea,
} from '@fluentui/react-components';
import { Add24Regular, Delete24Regular } from '@fluentui/react-icons';
import { useBabyStore, useUIStore, useAuthStore } from '@/store';
import { diaperService } from '@/services/api';
import type { DiaperChange, DiaperType } from '@/types';
import { Loading } from '@/components/common/Loading';

const useStyles = makeStyles({
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '2rem',
  },
  title: {
    marginBottom: '0.5rem',
  },
  recordsList: {
    display: 'flex',
    flexDirection: 'column',
    ...shorthands.gap('1rem'),
  },
  recordCard: {
    ...shorthands.padding('1.5rem'),
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  recordInfo: {
    flex: 1,
  },
  recordActions: {
    display: 'flex',
    ...shorthands.gap('0.5rem'),
  },
  dialogForm: {
    display: 'flex',
    flexDirection: 'column',
    ...shorthands.gap('1rem'),
  },
  rashIndicator: {
    color: tokens.colorPaletteRedForeground1,
    fontWeight: 600,
  },
});

export function DiaperPage() {
  const styles = useStyles();
  const currentBaby = useBabyStore((state) => state.currentBaby);
  const user = useAuthStore((state) => state.user);
  const { showToast } = useUIStore();
  const [changes, setChanges] = useState<DiaperChange[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    changeTime: '',
    diaperType: 'Wet' as DiaperType,
    hasRash: false,
    rashSeverity: 'Mild' as 'Mild' | 'Moderate' | 'Severe',
    notes: '',
  });

  useEffect(() => {
    if (currentBaby) {
      loadDiaperChanges();
    }
  }, [currentBaby]);

  const loadDiaperChanges = async () => {
    if (!currentBaby) return;

    try {
      setLoading(true);
      const data = await diaperService.getDiaperChanges(currentBaby.id);
      setChanges(data);
    } catch (error) {
      showToast('Failed to load diaper changes', 'error');
      console.error('Diaper changes error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!currentBaby || !user) return;

    try {
      await diaperService.createDiaperChange({
        babyId: currentBaby.id,
        changeTime: formData.changeTime,
        diaperType: formData.diaperType,
        hasRash: formData.hasRash,
        rashSeverity: formData.hasRash ? formData.rashSeverity : undefined,
        notes: formData.notes || undefined,
        recordedBy: user.id,
      });
      showToast('Diaper change recorded successfully', 'success');
      setDialogOpen(false);
      loadDiaperChanges();
      setFormData({
        changeTime: '',
        diaperType: 'Wet',
        hasRash: false,
        rashSeverity: 'Mild',
        notes: '',
      });
    } catch (error) {
      showToast('Failed to add diaper change', 'error');
      console.error('Add diaper error:', error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await diaperService.deleteDiaperChange(id);
      showToast('Diaper change deleted', 'success');
      loadDiaperChanges();
    } catch (error) {
      showToast('Failed to delete diaper change', 'error');
      console.error('Delete diaper error:', error);
    }
  };

  if (loading) return <Loading message="Loading diaper changes..." />;

  if (!currentBaby) {
    return (
      <div className={styles.container}>
        <Text>Please select a baby to view diaper changes</Text>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <Title2 className={styles.title}>Diaper Tracking</Title2>
          <Text>Track {currentBaby.name}'s diaper changes</Text>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(_, data) => setDialogOpen(data.open)}>
          <DialogTrigger>
            <Button appearance="primary" icon={<Add24Regular />}>
              Log Diaper Change
            </Button>
          </DialogTrigger>
          <DialogSurface>
            <DialogBody>
              <DialogTitle>Log Diaper Change</DialogTitle>
              <DialogContent>
                <div className={styles.dialogForm}>
                  <Field label="Change Time" required>
                    <Input
                      type="datetime-local"
                      value={formData.changeTime}
                      onChange={(e) => setFormData({ ...formData, changeTime: e.target.value })}
                    />
                  </Field>
                  <Field label="Type">
                    <Select
                      value={formData.diaperType}
                      onChange={(e) =>
                        setFormData({ ...formData, diaperType: e.target.value as DiaperType })
                      }
                    >
                      <option value="Wet">Wet</option>
                      <option value="Dirty">Dirty</option>
                      <option value="Both">Both</option>
                      <option value="Dry">Dry</option>
                    </Select>
                  </Field>
                  <Checkbox
                    label="Has Rash"
                    checked={formData.hasRash}
                    onChange={(_, data) => setFormData({ ...formData, hasRash: data.checked === true })}
                  />
                  {formData.hasRash && (
                    <Field label="Rash Severity">
                      <Select
                        value={formData.rashSeverity}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            rashSeverity: e.target.value as 'Mild' | 'Moderate' | 'Severe',
                          })
                        }
                      >
                        <option value="Mild">Mild</option>
                        <option value="Moderate">Moderate</option>
                        <option value="Severe">Severe</option>
                      </Select>
                    </Field>
                  )}
                  <Field label="Notes">
                    <Textarea
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      placeholder="Optional notes..."
                    />
                  </Field>
                </div>
              </DialogContent>
              <DialogActions>
                <DialogTrigger>
                  <Button appearance="secondary">Cancel</Button>
                </DialogTrigger>
                <Button appearance="primary" onClick={handleSubmit}>
                  Save
                </Button>
              </DialogActions>
            </DialogBody>
          </DialogSurface>
        </Dialog>
      </div>

      <div className={styles.recordsList}>
        {changes.length === 0 ? (
          <Card>
            <Text>No diaper changes yet. Start tracking!</Text>
          </Card>
        ) : (
          changes.map((change) => (
            <Card key={change.id} className={styles.recordCard}>
              <div className={styles.recordInfo}>
                <Text weight="semibold">
                  {new Date(change.changeTime).toLocaleString()}
                </Text>
                <Text>Type: {change.diaperType}</Text>
                {change.hasRash && (
                  <Text className={styles.rashIndicator}>
                    ⚠️ Rash: {change.rashSeverity}
                  </Text>
                )}
                {change.notes && <Text size={200}>{change.notes}</Text>}
              </div>
              <div className={styles.recordActions}>
                <Button
                  appearance="subtle"
                  icon={<Delete24Regular />}
                  onClick={() => handleDelete(change.id)}
                />
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
