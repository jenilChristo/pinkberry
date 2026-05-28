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
  Textarea,
} from '@fluentui/react-components';
import { Add24Regular, Delete24Regular } from '@fluentui/react-icons';
import { useBabyStore, useUIStore, useAuthStore } from '@/store';
import { feedingService } from '@/services/api';
import type { Feeding, FeedingType, BreastSide } from '@/types';
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

export function FeedingPage() {
  const styles = useStyles();
  const currentBaby = useBabyStore((state) => state.currentBaby);
  const user = useAuthStore((state) => state.user);
  const { showToast } = useUIStore();
  const [feedings, setFeedings] = useState<Feeding[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    feedingTime: '',
    feedingType: 'Breast' as FeedingType,
    amountMl: '',
    durationMinutes: '',
    breastSide: 'Left' as BreastSide,
    foodDescription: '',
    notes: '',
  });

  useEffect(() => {
    if (currentBaby) {
      loadFeedings();
    }
  }, [currentBaby]);

  const loadFeedings = async () => {
    if (!currentBaby) return;

    try {
      setLoading(true);
      const data = await feedingService.getFeedings(currentBaby.id);
      setFeedings(data);
    } catch (error) {
      showToast('Failed to load feedings', 'error');
      console.error('Feedings error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!currentBaby || !user) return;

    try {
      await feedingService.createFeeding({
        babyId: currentBaby.id,
        feedingTime: formData.feedingTime,
        feedingType: formData.feedingType,
        amountMl: formData.amountMl ? parseFloat(formData.amountMl) : undefined,
        durationMinutes: formData.durationMinutes ? parseInt(formData.durationMinutes) : undefined,
        breastSide: formData.feedingType === 'Breast' ? formData.breastSide : undefined,
        foodDescription: formData.foodDescription || undefined,
        notes: formData.notes || undefined,
        recordedBy: user.id,
      });
      showToast('Feeding recorded successfully', 'success');
      setDialogOpen(false);
      loadFeedings();
      setFormData({
        feedingTime: '',
        feedingType: 'Breast',
        amountMl: '',
        durationMinutes: '',
        breastSide: 'Left',
        foodDescription: '',
        notes: '',
      });
    } catch (error) {
      showToast('Failed to add feeding', 'error');
      console.error('Add feeding error:', error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await feedingService.deleteFeeding(id);
      showToast('Feeding deleted', 'success');
      loadFeedings();
    } catch (error) {
      showToast('Failed to delete feeding', 'error');
      console.error('Delete feeding error:', error);
    }
  };

  if (loading) return <Loading message="Loading feedings..." />;

  if (!currentBaby) {
    return (
      <div className={styles.container}>
        <Text>Please select a baby to view feedings</Text>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <Title2 className={styles.title}>Feeding Tracking</Title2>
          <Text>Track {currentBaby.name}'s feedings</Text>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(_, data) => setDialogOpen(data.open)}>
          <DialogTrigger>
            <Button appearance="primary" icon={<Add24Regular />}>
              Log Feeding
            </Button>
          </DialogTrigger>
          <DialogSurface>
            <DialogBody>
              <DialogTitle>Log Feeding</DialogTitle>
              <DialogContent>
                <div className={styles.dialogForm}>
                  <Field label="Feeding Time" required>
                    <Input
                      type="datetime-local"
                      value={formData.feedingTime}
                      onChange={(e) => setFormData({ ...formData, feedingTime: e.target.value })}
                    />
                  </Field>
                  <Field label="Type">
                    <Select
                      value={formData.feedingType}
                      onChange={(e) =>
                        setFormData({ ...formData, feedingType: e.target.value as FeedingType })
                      }
                    >
                      <option value="Breast">Breast</option>
                      <option value="Bottle">Bottle</option>
                      <option value="Solid">Solid</option>
                    </Select>
                  </Field>
                  {formData.feedingType === 'Breast' && (
                    <>
                      <Field label="Breast Side">
                        <Select
                          value={formData.breastSide}
                          onChange={(e) =>
                            setFormData({ ...formData, breastSide: e.target.value as BreastSide })
                          }
                        >
                          <option value="Left">Left</option>
                          <option value="Right">Right</option>
                          <option value="Both">Both</option>
                        </Select>
                      </Field>
                      <Field label="Duration (minutes)">
                        <Input
                          type="number"
                          value={formData.durationMinutes}
                          onChange={(e) =>
                            setFormData({ ...formData, durationMinutes: e.target.value })
                          }
                        />
                      </Field>
                    </>
                  )}
                  {formData.feedingType === 'Bottle' && (
                    <Field label="Amount (ml)">
                      <Input
                        type="number"
                        value={formData.amountMl}
                        onChange={(e) => setFormData({ ...formData, amountMl: e.target.value })}
                      />
                    </Field>
                  )}
                  {formData.feedingType === 'Solid' && (
                    <Field label="Food Description">
                      <Input
                        value={formData.foodDescription}
                        onChange={(e) =>
                          setFormData({ ...formData, foodDescription: e.target.value })
                        }
                      />
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
        {feedings.length === 0 ? (
          <Card>
            <Text>No feeding records yet. Start tracking!</Text>
          </Card>
        ) : (
          feedings.map((feeding) => (
            <Card key={feeding.id} className={styles.recordCard}>
              <div className={styles.recordInfo}>
                <Text weight="semibold">
                  {new Date(feeding.feedingTime).toLocaleString()}
                </Text>
                <Text>Type: {feeding.feedingType}</Text>
                {feeding.amountMl && <Text>Amount: {feeding.amountMl} ml</Text>}
                {feeding.durationMinutes && <Text>Duration: {feeding.durationMinutes} min</Text>}
                {feeding.breastSide && <Text>Side: {feeding.breastSide}</Text>}
                {feeding.notes && <Text size={200}>{feeding.notes}</Text>}
              </div>
              <div className={styles.recordActions}>
                <Button
                  appearance="subtle"
                  icon={<Delete24Regular />}
                  onClick={() => handleDelete(feeding.id)}
                />
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
