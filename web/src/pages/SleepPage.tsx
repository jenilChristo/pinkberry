import { useState, useEffect } from 'react';
import {
  makeStyles,
  shorthands,
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
  Textarea,
} from '@fluentui/react-components';
import { Add24Regular, Delete24Regular } from '@fluentui/react-icons';
import { useBabyStore, useUIStore, useAuthStore } from '@/store';
import { sleepService } from '@/services/api';
import type { SleepRecord } from '@/types';
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
});

export function SleepPage() {
  const styles = useStyles();
  const currentBaby = useBabyStore((state) => state.currentBaby);
  const user = useAuthStore((state) => state.user);
  const { showToast } = useUIStore();
  const [records, setRecords] = useState<SleepRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    startTime: '',
    endTime: '',
    quality: 'Good' as SleepRecord['quality'],
    notes: '',
  });

  useEffect(() => {
    if (currentBaby) {
      loadSleepRecords();
    }
  }, [currentBaby]);

  const loadSleepRecords = async () => {
    if (!currentBaby) return;

    try {
      setLoading(true);
      const data = await sleepService.getSleepRecords(currentBaby.id);
      setRecords(data);
    } catch (error) {
      showToast('Failed to load sleep records', 'error');
      console.error('Sleep records error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!currentBaby || !user) return;

    try {
      await sleepService.createSleepRecord({
        babyId: currentBaby.id,
        startTime: formData.startTime,
        endTime: formData.endTime || undefined,
        quality: formData.quality,
        notes: formData.notes || undefined,
        recordedBy: user.id,
      });
      showToast('Sleep record added successfully', 'success');
      setDialogOpen(false);
      loadSleepRecords();
      setFormData({ startTime: '', endTime: '', quality: 'Good', notes: '' });
    } catch (error) {
      showToast('Failed to add sleep record', 'error');
      console.error('Add sleep error:', error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await sleepService.deleteSleepRecord(id);
      showToast('Sleep record deleted', 'success');
      loadSleepRecords();
    } catch (error) {
      showToast('Failed to delete sleep record', 'error');
      console.error('Delete sleep error:', error);
    }
  };

  const formatDuration = (durationMinutes?: number) => {
    if (!durationMinutes) return 'In progress';
    const hours = Math.floor(durationMinutes / 60);
    const mins = durationMinutes % 60;
    return `${hours}h ${mins}m`;
  };

  if (loading) return <Loading message="Loading sleep records..." />;

  if (!currentBaby) {
    return (
      <div className={styles.container}>
        <Text>Please select a baby to view sleep records</Text>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <Title2 className={styles.title}>Sleep Tracking</Title2>
          <Text>Track {currentBaby.name}'s sleep patterns</Text>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(_, data) => setDialogOpen(data.open)}>
          <DialogTrigger>
            <Button appearance="primary" icon={<Add24Regular />}>
              Log Sleep
            </Button>
          </DialogTrigger>
          <DialogSurface>
            <DialogBody>
              <DialogTitle>Log Sleep</DialogTitle>
              <DialogContent>
                <div className={styles.dialogForm}>
                  <Field label="Start Time" required>
                    <Input
                      type="datetime-local"
                      value={formData.startTime}
                      onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    />
                  </Field>
                  <Field label="End Time">
                    <Input
                      type="datetime-local"
                      value={formData.endTime}
                      onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    />
                  </Field>
                  <Field label="Quality">
                    <Select
                      value={formData.quality}
                      onChange={(e) =>
                        setFormData({ ...formData, quality: e.target.value as SleepRecord['quality'] })
                      }
                    >
                      <option value="Excellent">Excellent</option>
                      <option value="Good">Good</option>
                      <option value="Fair">Fair</option>
                      <option value="Poor">Poor</option>
                    </Select>
                  </Field>
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
        {records.length === 0 ? (
          <Card>
            <Text>No sleep records yet. Start tracking!</Text>
          </Card>
        ) : (
          records.map((record) => (
            <Card key={record.id} className={styles.recordCard}>
              <div className={styles.recordInfo}>
                <Text weight="semibold">
                  {new Date(record.startTime).toLocaleString()}
                </Text>
                <Text>Duration: {formatDuration(record.duration)}</Text>
                <Text>Quality: {record.quality}</Text>
                {record.notes && <Text size={200}>{record.notes}</Text>}
              </div>
              <div className={styles.recordActions}>
                <Button
                  appearance="subtle"
                  icon={<Delete24Regular />}
                  onClick={() => handleDelete(record.id)}
                />
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
