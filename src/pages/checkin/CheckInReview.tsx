import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { KeyResult, CheckInForm, ConfidenceLevel } from '@/types/okr';
import { CheckCircle2, ArrowLeft, Clock, TrendingUp, AlertTriangle } from 'lucide-react';

interface CheckInReviewProps {
  keyResults: KeyResult[];
  formData: Map<string, CheckInForm>;
  timeTaken: number;
  onEdit: (index: number) => void;
  onSubmit: () => void;
  onBack: () => void;
}

const getConfidenceColor = (confidence: ConfidenceLevel) => {
  switch (confidence) {
    case 'on-track':
      return 'bg-green-500';
    case 'at-risk':
      return 'bg-yellow-500';
    case 'off-track':
      return 'bg-red-500';
    default:
      return 'bg-gray-500';
  }
};

const getConfidenceLabel = (confidence: ConfidenceLevel) => {
  switch (confidence) {
    case 'on-track':
      return 'On Track';
    case 'at-risk':
      return 'At Risk';
    case 'off-track':
      return 'Off Track';
    default:
      return confidence;
  }
};

export default function CheckInReview({
  keyResults,
  formData,
  timeTaken,
  onEdit,
  onSubmit,
  onBack,
}: CheckInReviewProps) {
  const formatTime = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const updatedCount = formData.size;
  const skippedCount = keyResults.length - updatedCount;

  // Calculate overall progress
  const totalProgress = keyResults.reduce((sum, kr) => {
    const update = formData.get(kr.id);
    if (!update) return sum + kr.progress;

    const newProgress = ((update.currentValue - kr.startingValue) /
      (kr.targetValue - kr.startingValue)) * 100;
    return sum + Math.max(0, Math.min(100, newProgress));
  }, 0);
  const averageProgress = totalProgress / keyResults.length;

  // Count by status
  const statusCounts = {
    'on-track': 0,
    'at-risk': 0,
    'off-track': 0,
  };

  formData.forEach((data) => {
    statusCounts[data.confidence]++;
  });

  const hasBlockers = Array.from(formData.values()).some(data => data.blockers);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="bg-primary text-primary-foreground py-6 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <CheckCircle2 className="h-8 w-8" />
            <h1 className="text-2xl font-bold">Review Check-in</h1>
          </div>
          <p className="text-primary-foreground/90">
            Review your updates before submitting
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto px-4 py-6 pb-32">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Summary Stats */}
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-2xl font-bold">{formatTime(timeTaken)}</p>
                    <p className="text-sm text-muted-foreground">Time taken</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-2xl font-bold">{averageProgress.toFixed(0)}%</p>
                    <p className="text-sm text-muted-foreground">Avg progress</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Status Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Status Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-3">
                <div className="text-center p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                  <p className="text-2xl font-bold text-green-700">{statusCounts['on-track']}</p>
                  <p className="text-xs text-muted-foreground mt-1">On Track</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                  <p className="text-2xl font-bold text-yellow-700">{statusCounts['at-risk']}</p>
                  <p className="text-xs text-muted-foreground mt-1">At Risk</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                  <p className="text-2xl font-bold text-red-700">{statusCounts['off-track']}</p>
                  <p className="text-xs text-muted-foreground mt-1">Off Track</p>
                </div>
              </div>

              {skippedCount > 0 && (
                <div className="mt-4 p-3 rounded-lg bg-muted">
                  <p className="text-sm text-muted-foreground">
                    {skippedCount} {skippedCount === 1 ? 'KR' : 'KRs'} skipped
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Blockers Alert */}
          {hasBlockers && (
            <Card className="border-yellow-500/50 bg-yellow-500/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-yellow-700">
                  <AlertTriangle className="h-5 w-5" />
                  Blockers Reported
                </CardTitle>
                <CardDescription>
                  You've reported blockers on some key results. Your manager will be notified.
                </CardDescription>
              </CardHeader>
            </Card>
          )}

          {/* Updated Key Results */}
          <Card>
            <CardHeader>
              <CardTitle>Updated Key Results</CardTitle>
              <CardDescription>
                {updatedCount} {updatedCount === 1 ? 'update' : 'updates'} ready to submit
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {keyResults.map((kr, index) => {
                const update = formData.get(kr.id);
                if (!update) return null;

                const oldProgress = kr.progress;
                const newProgress = ((update.currentValue - kr.startingValue) /
                  (kr.targetValue - kr.startingValue)) * 100;
                const clampedProgress = Math.max(0, Math.min(100, newProgress));
                const progressChange = clampedProgress - oldProgress;

                return (
                  <div
                    key={kr.id}
                    className="p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors cursor-pointer"
                    onClick={() => onEdit(index)}
                  >
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-base leading-tight mb-1">{kr.title}</h3>
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge
                            variant="outline"
                            className={`${getConfidenceColor(update.confidence)} text-white border-0`}
                          >
                            {getConfidenceLabel(update.confidence)}
                          </Badge>
                          {update.blockers && (
                            <Badge variant="outline" className="border-yellow-500 text-yellow-700">
                              Has Blockers
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Value Change */}
                    <div className="flex items-center gap-2 mb-2 text-sm">
                      <span className="text-muted-foreground">{kr.currentValue}</span>
                      <span className="text-muted-foreground">→</span>
                      <span className="font-semibold">{update.currentValue}</span>
                      <span className="text-muted-foreground">{kr.unit}</span>
                      {progressChange !== 0 && (
                        <span
                          className={`ml-auto text-xs font-medium ${
                            progressChange > 0 ? 'text-green-600' : 'text-red-600'
                          }`}
                        >
                          {progressChange > 0 ? '+' : ''}
                          {progressChange.toFixed(1)}%
                        </span>
                      )}
                    </div>

                    {/* Progress Bar */}
                    <div className="relative h-2 bg-secondary rounded-full overflow-hidden mb-2">
                      <div
                        className="absolute h-full bg-muted-foreground/30 transition-all"
                        style={{ width: `${oldProgress}%` }}
                      />
                      <div
                        className="absolute h-full bg-green-500 transition-all"
                        style={{ width: `${clampedProgress}%` }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {clampedProgress.toFixed(1)}% complete
                    </p>

                    {/* Comment */}
                    {update.statusComment && (
                      <div className="mt-3 p-2 rounded bg-muted">
                        <p className="text-sm text-muted-foreground italic">
                          "{update.statusComment}"
                        </p>
                      </div>
                    )}

                    {/* Blockers */}
                    {update.blockers && (
                      <div className="mt-3 p-2 rounded bg-yellow-500/10 border border-yellow-500/20">
                        <p className="text-xs font-medium text-yellow-700 mb-1">Blockers:</p>
                        <p className="text-sm text-yellow-700">{update.blockers}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Bottom Actions */}
      <div className="fixed bottom-0 left-0 right-0 bg-background border-t p-4">
        <div className="max-w-2xl mx-auto space-y-3">
          <Button
            size="lg"
            className="w-full h-14 text-lg"
            onClick={onSubmit}
          >
            <CheckCircle2 className="h-5 w-5 mr-2" />
            Submit Check-in
          </Button>
          <Button
            variant="ghost"
            className="w-full"
            onClick={onBack}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Edit Updates
          </Button>
        </div>
      </div>
    </div>
  );
}
