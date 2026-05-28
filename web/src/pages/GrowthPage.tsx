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
  Textarea,
} from '@fluentui/react-components';
import { Add24Regular, Delete24Regular } from '@fluentui/react-icons';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useBabyStore, useUIStore, useAuthStore } from '@/store';
import { growthService } from '@/services/api';
import type { GrowthMeasurement } from '@/types';
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
  chartsSection: {
    marginBottom: '2rem',
  },
  chartCard: {
    ...shorthands.padding('1.5rem'),
    marginBottom: '1.5rem',
  },
  chartTitle: {
    marginBottom: '1rem',
    fontSize: '1.125rem',
    fontWeight: 600,
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

export function GrowthPage() {
  const styles = useStyles();
  const currentBaby = useBabyStore((state) => state.currentBaby);
  const user = useAuthStore((state) => state.user);
  const { showToast } = useUIStore();
  const [measurements, setMeasurements] = useState<GrowthMeasurement[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    measurementDate: '',
    weightKg: '',
    heightCm: '',
    headCircumferenceCm: '',
    notes: '',
  });

  useEffect(() => {
    if (currentBaby) {
      loadMeasurements();
    }
  }, [currentBaby]);

  const loadMeasurements = async () => {
    if (!currentBaby) return;

    try {
      setLoading(true);
      const data = await growthService.getGrowthMeasurements(currentBaby.id);
      setMeasurements(data);
    } catch (error) {
      showToast('Failed to load growth measurements', 'error');
      console.error('Growth measurements error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!currentBaby || !user) return;

    try {
      await growthService.createGrowthMeasurement({
        babyId: currentBaby.id,
        measurementDate: formData.measurementDate,
        weightKg: formData.weightKg ? parseFloat(formData.weightKg) : undefined,
        heightCm: formData.heightCm ? parseFloat(formData.heightCm) : undefined,
        headCircumferenceCm: formData.headCircumferenceCm
          ? parseFloat(formData.headCircumferenceCm)
          : undefined,
        notes: formData.notes || undefined,
        recordedBy: user.id,
      });
      showToast('Growth measurement added successfully', 'success');
      setDialogOpen(false);
      loadMeasurements();
      setFormData({
        measurementDate: '',
        weightKg: '',
        heightCm: '',
        headCircumferenceCm: '',
        notes: '',
      });
    } catch (error) {
      showToast('Failed to add growth measurement', 'error');
      console.error('Add growth measurement error:', error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await growthService.deleteGrowthMeasurement(id);
      showToast('Growth measurement deleted', 'success');
      loadMeasurements();
    } catch (error) {
      showToast('Failed to delete growth measurement', 'error');
      console.error('Delete growth measurement error:', error);
    }
  };

  const prepareChartData = () => {
    return measurements
      .slice()
      .sort((a, b) => new Date(a.measurementDate).getTime() - new Date(b.measurementDate).getTime())
      .map((m) => ({
        date: new Date(m.measurementDate).toLocaleDateString(),
        weight: m.weightKg,
        height: m.heightCm,
        head: m.headCircumferenceCm,
      }));
  };

  if (loading) return <Loading message="Loading growth data..." />;

  if (!currentBaby) {
    return (
      <div className={styles.container}>
        <Text>Please select a baby to view growth tracking</Text>
      </div>
    );
  }

  const chartData = prepareChartData();

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <Title2 className={styles.title}>Growth Tracking</Title2>
          <Text>Track {currentBaby.name}'s growth and development</Text>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(_, data) => setDialogOpen(data.open)}>
          <DialogTrigger>
            <Button appearance="primary" icon={<Add24Regular />}>
              Add Measurement
            </Button>
          </DialogTrigger>
          <DialogSurface>
            <DialogBody>
              <DialogTitle>Add Growth Measurement</DialogTitle>
              <DialogContent>
                <div className={styles.dialogForm}>
                  <Field label="Measurement Date" required>
                    <Input
                      type="date"
                      value={formData.measurementDate}
                      onChange={(e) => setFormData({ ...formData, measurementDate: e.target.value })}
                    />
                  </Field>
                  <Field label="Weight (kg)">
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.weightKg}
                      onChange={(e) => setFormData({ ...formData, weightKg: e.target.value })}
                    />
                  </Field>
                  <Field label="Height (cm)">
                    <Input
                      type="number"
                      step="0.1"
                      value={formData.heightCm}
                      onChange={(e) => setFormData({ ...formData, heightCm: e.target.value })}
                    />
                  </Field>
                  <Field label="Head Circumference (cm)">
                    <Input
                      type="number"
                      step="0.1"
                      value={formData.headCircumferenceCm}
                      onChange={(e) =>
                        setFormData({ ...formData, headCircumferenceCm: e.target.value })
                      }
                    />
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

      {chartData.length > 0 && (
        <div className={styles.chartsSection}>
          <Card className={styles.chartCard}>
            <Text className={styles.chartTitle}>Weight Over Time</Text>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="weight" stroke="#0078d4" name="Weight (kg)" />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          <Card className={styles.chartCard}>
            <Text className={styles.chartTitle}>Height Over Time</Text>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="height" stroke="#00897b" name="Height (cm)" />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </div>
      )}

      <div className={styles.recordsList}>
        {measurements.length === 0 ? (
          <Card>
            <Text>No growth measurements yet. Start tracking!</Text>
          </Card>
        ) : (
          measurements.map((measurement) => (
            <Card key={measurement.id} className={styles.recordCard}>
              <div className={styles.recordInfo}>
                <Text weight="semibold">
                  {new Date(measurement.measurementDate).toLocaleDateString()}
                </Text>
                {measurement.weightKg && <Text>Weight: {measurement.weightKg} kg</Text>}
                {measurement.heightCm && <Text>Height: {measurement.heightCm} cm</Text>}
                {measurement.headCircumferenceCm && (
                  <Text>Head: {measurement.headCircumferenceCm} cm</Text>
                )}
                {measurement.notes && <Text size={200}>{measurement.notes}</Text>}
              </div>
              <div className={styles.recordActions}>
                <Button
                  appearance="subtle"
                  icon={<Delete24Regular />}
                  onClick={() => handleDelete(measurement.id)}
                />
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
