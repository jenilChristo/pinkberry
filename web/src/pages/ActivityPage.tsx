import { useState, useEffect } from 'react';
import {
  makeStyles,
  Card,
  Text,
  Title2,
  DataGrid,
  DataGridHeader,
  DataGridRow,
  DataGridHeaderCell,
  DataGridBody,
  DataGridCell,
  TableColumnDefinition,
  createTableColumn,
} from '@fluentui/react-components';
import { useBabyStore, useUIStore } from '@/store';
import { dashboardService } from '@/services/api';
import type { Activity } from '@/types';
import { Loading } from '@/components/common/Loading';

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
  dataGrid: {
    width: '100%',
  },
});

const columns: TableColumnDefinition<Activity>[] = [
  createTableColumn<Activity>({
    columnId: 'timestamp',
    compare: (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
    renderHeaderCell: () => 'Time',
    renderCell: (item) => new Date(item.timestamp).toLocaleString(),
  }),
  createTableColumn<Activity>({
    columnId: 'activityType',
    compare: (a, b) => a.activityType.localeCompare(b.activityType),
    renderHeaderCell: () => 'Type',
    renderCell: (item) => item.activityType,
  }),
  createTableColumn<Activity>({
    columnId: 'description',
    renderHeaderCell: () => 'Description',
    renderCell: (item) => item.description,
  }),
  createTableColumn<Activity>({
    columnId: 'recordedBy',
    renderHeaderCell: () => 'Recorded By',
    renderCell: (item) => item.recordedByName,
  }),
];

export function ActivityPage() {
  const styles = useStyles();
  const currentBaby = useBabyStore((state) => state.currentBaby);
  const { showToast } = useUIStore();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentBaby) {
      loadActivities();
    }
  }, [currentBaby]);

  const loadActivities = async () => {
    if (!currentBaby) return;

    try {
      setLoading(true);
      const data = await dashboardService.getActivities(currentBaby.id);
      setActivities(data);
    } catch (error) {
      showToast('Failed to load activities', 'error');
      console.error('Activities error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading message="Loading activities..." />;

  if (!currentBaby) {
    return (
      <div className={styles.container}>
        <Text>Please select a baby to view activities</Text>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Title2 className={styles.title}>Activity Feed</Title2>
        <Text>All activities for {currentBaby.name}</Text>
      </div>

      <Card>
        <DataGrid items={activities} columns={columns} className={styles.dataGrid}>
          <DataGridHeader>
            <DataGridRow>
              {({ renderHeaderCell }) => (
                <DataGridHeaderCell>{renderHeaderCell()}</DataGridHeaderCell>
              )}
            </DataGridRow>
          </DataGridHeader>
          <DataGridBody<Activity>>
            {({ item, rowId }) => (
              <DataGridRow<Activity> key={rowId}>
                {({ renderCell }) => <DataGridCell>{renderCell(item)}</DataGridCell>}
              </DataGridRow>
            )}
          </DataGridBody>
        </DataGrid>
      </Card>
    </div>
  );
}
