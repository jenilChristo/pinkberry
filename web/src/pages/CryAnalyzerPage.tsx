import { useState, useEffect, useRef } from 'react';
import {
  makeStyles,
  shorthands,
  tokens,
  Card,
  Text,
  Title2,
  Button,
  ProgressBar,
} from '@fluentui/react-components';
import { Mic24Regular, Stop24Regular, Delete24Regular } from '@fluentui/react-icons';
import { useBabyStore, useUIStore, useAuthStore } from '@/store';
import { cryAnalysisService } from '@/services/api';
import type { CryAnalysisResult, CryAnalysis } from '@/types';
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
  recordSection: {
    marginBottom: '2rem',
  },
  recordCard: {
    ...shorthands.padding('2rem'),
    textAlign: 'center',
  },
  recordButton: {
    width: '120px',
    height: '120px',
    borderRadius: '50%',
    fontSize: '3rem',
    margin: '0 auto',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  recordingIndicator: {
    marginTop: '1rem',
    color: tokens.colorPaletteRedForeground1,
    fontWeight: 600,
  },
  timer: {
    fontSize: '1.5rem',
    marginTop: '1rem',
  },
  resultCard: {
    ...shorthands.padding('2rem'),
    marginBottom: '2rem',
  },
  resultTitle: {
    fontSize: '1.5rem',
    fontWeight: 700,
    color: tokens.colorBrandForeground1,
    marginBottom: '1rem',
  },
  confidenceBar: {
    marginTop: '1rem',
    marginBottom: '1rem',
  },
  suggestions: {
    marginTop: '1.5rem',
    ...shorthands.padding('1rem'),
    backgroundColor: tokens.colorNeutralBackground3,
    ...shorthands.borderRadius(tokens.borderRadiusMedium),
  },
  suggestionTitle: {
    fontWeight: 600,
    marginBottom: '0.75rem',
  },
  suggestionList: {
    listStyle: 'none',
    ...shorthands.padding(0),
    ...shorthands.margin(0),
  },
  suggestionItem: {
    marginBottom: '0.5rem',
    paddingLeft: '1.5rem',
    position: 'relative',
    '::before': {
      content: '"→"',
      position: 'absolute',
      left: 0,
      color: tokens.colorBrandForeground1,
    },
  },
  historySection: {
    marginTop: '2rem',
  },
  historyTitle: {
    fontSize: '1.25rem',
    fontWeight: 600,
    marginBottom: '1rem',
  },
  historyList: {
    display: 'flex',
    flexDirection: 'column',
    ...shorthands.gap('1rem'),
  },
  historyCard: {
    ...shorthands.padding('1.5rem'),
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  historyInfo: {
    flex: 1,
  },
});

export function CryAnalyzerPage() {
  const styles = useStyles();
  const currentBaby = useBabyStore((state) => state.currentBaby);
  const user = useAuthStore((state) => state.user);
  const { showToast } = useUIStore();
  
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<CryAnalysisResult | null>(null);
  const [history, setHistory] = useState<CryAnalysis[]>([]);
  const [loading, setLoading] = useState(true);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (currentBaby) {
      loadHistory();
    }
  }, [currentBaby]);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const loadHistory = async () => {
    if (!currentBaby) return;

    try {
      setLoading(true);
      const data = await cryAnalysisService.getHistory(currentBaby.id);
      setHistory(data);
    } catch (error) {
      showToast('Failed to load cry analysis history', 'error');
      console.error('History error:', error);
    } finally {
      setLoading(false);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        await analyzeCry(audioBlob);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (error) {
      showToast('Failed to access microphone', 'error');
      console.error('Microphone error:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  };

  const analyzeCry = async (audioBlob: Blob) => {
    if (!currentBaby || !user) return;

    try {
      setAnalyzing(true);

      // Convert blob to base64
      const reader = new FileReader();
      reader.readAsDataURL(audioBlob);
      reader.onloadend = async () => {
        const base64Audio = reader.result as string;
        const base64Data = base64Audio.split(',')[1];

        const analysisResult = await cryAnalysisService.analyzeCry(
          currentBaby.id,
          base64Data,
          recordingTime,
          user.id
        );

        setResult(analysisResult);
        
        // Save the analysis
        await cryAnalysisService.saveAnalysis(
          currentBaby.id,
          analysisResult,
          recordingTime,
          user.id
        );

        loadHistory();
        showToast('Analysis complete', 'success');
      };
    } catch (error) {
      showToast('Failed to analyze cry', 'error');
      console.error('Analysis error:', error);
    } finally {
      setAnalyzing(false);
    }
  };

  const getConfidenceValue = (confidence: string): number => {
    const map: Record<string, number> = {
      VeryLow: 20,
      Low: 40,
      Medium: 60,
      High: 80,
      VeryHigh: 100,
    };
    return map[confidence] || 50;
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) return <Loading message="Loading cry analyzer..." />;

  if (!currentBaby) {
    return (
      <div className={styles.container}>
        <Text>Please select a baby to use cry analyzer</Text>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Title2 className={styles.title}>Cry Analyzer</Title2>
        <Text>Record and analyze {currentBaby.name}'s cry to understand their needs</Text>
      </div>

      <div className={styles.recordSection}>
        <Card className={styles.recordCard}>
          <Button
            appearance={isRecording ? 'secondary' : 'primary'}
            size="large"
            icon={isRecording ? <Stop24Regular /> : <Mic24Regular />}
            onClick={isRecording ? stopRecording : startRecording}
            className={styles.recordButton}
            disabled={analyzing}
          />
          {isRecording && (
            <>
              <Text className={styles.recordingIndicator}>● Recording...</Text>
              <Text className={styles.timer}>{formatTime(recordingTime)}</Text>
            </>
          )}
          {analyzing && <Text className={styles.recordingIndicator}>Analyzing...</Text>}
          {!isRecording && !analyzing && (
            <Text style={{ marginTop: '1rem' }}>
              Tap the microphone to start recording
            </Text>
          )}
        </Card>
      </div>

      {result && (
        <Card className={styles.resultCard}>
          <Text className={styles.resultTitle}>Primary Reason: {result.primaryReason}</Text>
          <Text>{result.reasonDescription}</Text>
          
          <div className={styles.confidenceBar}>
            <Text size={200} style={{ marginBottom: '0.5rem' }}>
              Confidence: {result.confidenceLevel}
            </Text>
            <ProgressBar value={getConfidenceValue(result.confidenceLevel)} max={100} />
          </div>

          {result.secondaryReason && (
            <Text>Secondary Reason: {result.secondaryReason}</Text>
          )}

          <div className={styles.suggestions}>
            <Text className={styles.suggestionTitle}>Suggested Actions:</Text>
            <ul className={styles.suggestionList}>
              {result.suggestedActions.map((action, index) => (
                <li key={index} className={styles.suggestionItem}>
                  {action}
                </li>
              ))}
            </ul>
          </div>
        </Card>
      )}

      <div className={styles.historySection}>
        <Text className={styles.historyTitle}>Analysis History</Text>
        <div className={styles.historyList}>
          {history.length === 0 ? (
            <Card>
              <Text>No analysis history yet</Text>
            </Card>
          ) : (
            history.slice(0, 10).map((analysis) => (
              <Card key={analysis.id} className={styles.historyCard}>
                <div className={styles.historyInfo}>
                  <Text weight="semibold">
                    {new Date(analysis.recordedAt).toLocaleString()}
                  </Text>
                  <Text>Primary: {analysis.primaryReason}</Text>
                  <Text size={200}>
                    Confidence: {analysis.confidenceLevel} • {analysis.durationSeconds}s
                  </Text>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
