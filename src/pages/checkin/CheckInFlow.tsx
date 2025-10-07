import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { KeyResult } from '@/types/okr';
import { useCheckIn } from '@/hooks/useCheckIn';
import CheckInLanding from './CheckInLanding';
import CheckInCard from './CheckInCard';
import CheckInReview from './CheckInReview';

// Mock data for key results due this week
const mockKeyResults: KeyResult[] = [
  {
    id: 'kr-1',
    objectiveId: 'obj-1',
    title: 'Increase user engagement rate',
    description: 'Track daily active users as a percentage of total users',
    ownerId: 'user-1',
    metricType: 'percentage',
    unit: '%',
    startingValue: 35,
    targetValue: 50,
    currentValue: 42,
    progress: 46.67,
    confidence: 'on-track',
    createdAt: '2025-07-01T00:00:00Z',
    updatedAt: '2025-09-20T00:00:00Z',
    lastCheckinAt: '2025-09-20T00:00:00Z',
  },
  {
    id: 'kr-2',
    objectiveId: 'obj-1',
    title: 'Reduce customer churn rate',
    description: 'Monthly churn percentage',
    ownerId: 'user-1',
    metricType: 'percentage',
    unit: '%',
    startingValue: 8,
    targetValue: 3,
    currentValue: 6.5,
    progress: 30,
    confidence: 'at-risk',
    createdAt: '2025-07-01T00:00:00Z',
    updatedAt: '2025-09-18T00:00:00Z',
    lastCheckinAt: '2025-09-18T00:00:00Z',
  },
  {
    id: 'kr-3',
    objectiveId: 'obj-2',
    title: 'Launch 3 new product features',
    description: 'Number of features shipped to production',
    ownerId: 'user-1',
    metricType: 'number',
    unit: 'features',
    startingValue: 0,
    targetValue: 3,
    currentValue: 1,
    progress: 33.33,
    confidence: 'on-track',
    createdAt: '2025-07-01T00:00:00Z',
    updatedAt: '2025-09-15T00:00:00Z',
    lastCheckinAt: '2025-09-15T00:00:00Z',
  },
  {
    id: 'kr-4',
    objectiveId: 'obj-2',
    title: 'Achieve 95% uptime',
    description: 'System availability percentage',
    ownerId: 'user-1',
    metricType: 'percentage',
    unit: '%',
    startingValue: 92,
    targetValue: 95,
    currentValue: 93.5,
    progress: 50,
    confidence: 'on-track',
    createdAt: '2025-07-01T00:00:00Z',
    updatedAt: '2025-09-19T00:00:00Z',
    lastCheckinAt: '2025-09-19T00:00:00Z',
  },
];

type FlowStage = 'landing' | 'checkin' | 'review' | 'success';

export default function CheckInFlow() {
  const navigate = useNavigate();
  const [stage, setStage] = useState<FlowStage>('landing');

  const {
    currentIndex,
    currentKR,
    keyResults,
    formData,
    currentFormData,
    updateCheckIn,
    goToNext,
    goToPrevious,
    skipCurrent,
    goToIndex,
    clearDraft,
    getSuggestedValue,
    getAutoConfidence,
    getTimeTaken,
  } = useCheckIn(mockKeyResults);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Escape to go back or exit
      if (e.key === 'Escape') {
        if (stage === 'checkin') {
          setStage('landing');
        } else if (stage === 'review') {
          setStage('checkin');
        } else {
          navigate('/member');
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [stage, navigate]);

  const handleStartCheckIn = () => {
    setStage('checkin');
  };

  const handleRemindLater = () => {
    // In real app, set a reminder
    navigate('/member');
  };

  const handleNextCard = () => {
    if (currentIndex === keyResults.length - 1) {
      setStage('review');
    } else {
      goToNext();
    }
  };

  const handleEditFromReview = (index: number) => {
    goToIndex(index);
    setStage('checkin');
  };

  const handleBackFromReview = () => {
    setStage('checkin');
    goToIndex(keyResults.length - 1);
  };

  const handleSubmit = async () => {
    // In real app, submit to API
    try {
      const updates = Array.from(formData.entries()).map(([, data]) => ({
        ...data,
        submittedAt: new Date().toISOString(),
      }));

      console.log('Submitting check-ins:', updates);
      console.log('Time taken:', getTimeTaken(), 'seconds');

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));

      // Clear draft
      clearDraft();

      // Show success
      setStage('success');

      // Redirect to dashboard after a delay
      setTimeout(() => {
        navigate('/member', { state: { checkInComplete: true } });
      }, 2000);
    } catch (error) {
      console.error('Failed to submit check-in:', error);
      // In real app, show error toast
    }
  };

  // Render based on stage
  switch (stage) {
    case 'landing':
      return (
        <CheckInLanding
          keyResults={keyResults}
          onStartCheckIn={handleStartCheckIn}
          onRemindLater={handleRemindLater}
        />
      );

    case 'checkin':
      if (!currentKR) {
        setStage('review');
        return null;
      }

      return (
        <CheckInCard
          keyResult={currentKR}
          currentIndex={currentIndex}
          totalCount={keyResults.length}
          suggestedValue={getSuggestedValue(currentKR)}
          autoConfidence={getAutoConfidence(
            currentFormData?.currentValue ?? getSuggestedValue(currentKR),
            currentKR
          )}
          initialData={currentFormData}
          onUpdate={(data) => updateCheckIn(currentKR.id, data)}
          onNext={handleNextCard}
          onPrevious={goToPrevious}
          onSkip={skipCurrent}
        />
      );

    case 'review':
      return (
        <CheckInReview
          keyResults={keyResults}
          formData={formData}
          timeTaken={getTimeTaken()}
          onEdit={handleEditFromReview}
          onSubmit={handleSubmit}
          onBack={handleBackFromReview}
        />
      );

    case 'success':
      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <div className="max-w-md w-full text-center space-y-6">
            <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto">
              <svg
                className="w-12 h-12 text-white"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M5 13l4 4L19 7"></path>
              </svg>
            </div>

            <div>
              <h2 className="text-3xl font-bold mb-2">Check-in Complete!</h2>
              <p className="text-lg text-muted-foreground">
                Great job! You completed your check-in in {getTimeTaken()}s
              </p>
            </div>

            <div className="p-6 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground mb-2">You updated</p>
              <p className="text-4xl font-bold">{formData.size}</p>
              <p className="text-sm text-muted-foreground mt-1">
                {formData.size === 1 ? 'Key Result' : 'Key Results'}
              </p>
            </div>

            <p className="text-sm text-muted-foreground">
              Redirecting to dashboard...
            </p>
          </div>
        </div>
      );

    default:
      return null;
  }
}
