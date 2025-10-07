import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { KeyResult, ConfidenceLevel, CheckInForm } from '@/types/okr';
import { ChevronLeft, ArrowRight, X } from 'lucide-react';

interface CheckInCardProps {
  keyResult: KeyResult;
  currentIndex: number;
  totalCount: number;
  suggestedValue: number;
  autoConfidence: ConfidenceLevel;
  initialData?: Partial<CheckInForm>;
  onUpdate: (data: Partial<CheckInForm>) => void;
  onNext: () => void;
  onPrevious: () => void;
  onSkip: () => void;
}

const confidenceOptions: Array<{ value: ConfidenceLevel; label: string; color: string }> = [
  { value: 'on-track', label: 'On Track', color: 'bg-green-500' },
  { value: 'at-risk', label: 'At Risk', color: 'bg-yellow-500' },
  { value: 'off-track', label: 'Off Track', color: 'bg-red-500' },
];

export default function CheckInCard({
  keyResult,
  currentIndex,
  totalCount,
  suggestedValue,
  autoConfidence,
  initialData,
  onUpdate,
  onNext,
  onPrevious,
  onSkip,
}: CheckInCardProps) {
  const navigate = useNavigate();
  const [currentValue, setCurrentValue] = useState(
    initialData?.currentValue?.toString() ?? suggestedValue.toString()
  );
  const [confidence, setConfidence] = useState<ConfidenceLevel>(
    initialData?.confidence ?? autoConfidence
  );
  const [statusComment, setStatusComment] = useState(initialData?.statusComment ?? '');
  const [blockers, setBlockers] = useState(initialData?.blockers ?? '');
  const [hasBlockers, setHasBlockers] = useState(!!initialData?.blockers);

  const inputRef = useRef<HTMLInputElement>(null);

  const handleCancel = () => {
    if (window.confirm('Are you sure you want to cancel this check-in? Your progress will not be saved.')) {
      navigate('/member');
    }
  };

  // Auto-focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
    inputRef.current?.select();
  }, [keyResult.id]);

  // Update parent whenever form changes
  useEffect(() => {
    const numValue = parseFloat(currentValue) || 0;
    onUpdate({
      keyResultId: keyResult.id,
      currentValue: numValue,
      confidence,
      statusComment: statusComment || undefined,
      blockers: hasBlockers && blockers ? blockers : undefined,
    });
  }, [currentValue, confidence, statusComment, blockers, hasBlockers, keyResult.id, onUpdate]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleNext();
    } else if (e.key === 'Escape') {
      onSkip();
    }
  };

  const handleNext = () => {
    const numValue = parseFloat(currentValue);
    if (isNaN(numValue)) {
      inputRef.current?.focus();
      return;
    }
    onNext();
  };

  const progress = ((parseFloat(currentValue) || 0 - keyResult.startingValue) /
    (keyResult.targetValue - keyResult.startingValue)) * 100;
  const clampedProgress = Math.max(0, Math.min(100, progress));

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Progress Header */}
      <div className="bg-primary text-primary-foreground py-4 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium">
              {currentIndex + 1} of {totalCount}
            </p>
            <p className="text-sm">Key Result</p>
          </div>

          {/* Progress Dots */}
          <div className="flex items-center gap-2">
            {Array.from({ length: totalCount }).map((_, idx) => (
              <div
                key={idx}
                className={`h-2 flex-1 rounded-full transition-all ${
                  idx < currentIndex
                    ? 'bg-primary-foreground'
                    : idx === currentIndex
                    ? 'bg-primary-foreground/60'
                    : 'bg-primary-foreground/20'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto px-4 py-6 pb-52">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* KR Title */}
          <div>
            <h2 className="text-2xl font-bold mb-2">{keyResult.title}</h2>
            {keyResult.description && (
              <p className="text-muted-foreground">{keyResult.description}</p>
            )}
          </div>

          {/* Current Progress */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Current Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-3xl font-bold">{keyResult.currentValue}</span>
                <span className="text-xl text-muted-foreground">/ {keyResult.targetValue}</span>
                {keyResult.unit && (
                  <span className="text-sm text-muted-foreground">{keyResult.unit}</span>
                )}
              </div>
              <div className="h-2 bg-secondary rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all"
                  style={{ width: `${keyResult.progress}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {keyResult.progress}% complete
              </p>
            </CardContent>
          </Card>

          {/* New Value Input */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">New Value</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <label htmlFor="value-input" className="sr-only">
                  Enter new value
                </label>
                <Input
                  ref={inputRef}
                  id="value-input"
                  type="number"
                  value={currentValue}
                  onChange={(e) => setCurrentValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="h-14 text-lg text-center font-semibold"
                  placeholder="Enter new value"
                  step="any"
                />
                <p className="text-sm text-muted-foreground text-center">
                  Suggested: {suggestedValue.toFixed(1)} {keyResult.unit}
                </p>
              </div>

              {/* Quick Templates */}
              <div className="flex gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentValue(suggestedValue.toString())}
                  className="flex-1"
                >
                  Use Suggested
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentValue(keyResult.targetValue.toString())}
                  className="flex-1"
                >
                  Target Reached
                </Button>
              </div>

              {/* New Progress Preview */}
              {currentValue && !isNaN(parseFloat(currentValue)) && (
                <div className="pt-6 mt-4 border-t space-y-3">
                  <div className="flex items-baseline gap-2">
                    <span className="text-sm text-muted-foreground">New Progress:</span>
                    <span className="text-2xl font-bold">{clampedProgress.toFixed(1)}%</span>
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-500 transition-all"
                      style={{ width: `${clampedProgress}%` }}
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Status/Confidence */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-3">
                {confidenceOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setConfidence(option.value)}
                    className={`h-14 rounded-lg border-2 font-medium transition-all ${
                      confidence === option.value
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border hover:border-muted-foreground/50'
                    }`}
                  >
                    <div className="flex flex-col items-center justify-center gap-1">
                      <div className={`w-3 h-3 rounded-full ${option.color}`} />
                      <span className="text-xs">{option.label}</span>
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Optional: Status Comment */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Quick Update (Optional)</CardTitle>
            </CardHeader>
            <CardContent>
              <textarea
                value={statusComment}
                onChange={(e) => setStatusComment(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full min-h-20 p-3 text-base rounded-md border border-input bg-background resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="Any updates or notes?"
              />
            </CardContent>
          </Card>

          {/* Optional: Blockers */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Blockers</CardTitle>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasBlockers}
                    onChange={(e) => setHasBlockers(e.target.checked)}
                    className="w-4 h-4 rounded"
                  />
                  <span className="text-sm">I have blockers</span>
                </label>
              </div>
            </CardHeader>
            {hasBlockers && (
              <CardContent>
                <textarea
                  value={blockers}
                  onChange={(e) => setBlockers(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="w-full min-h-20 p-3 text-base rounded-md border border-input bg-background resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="What's blocking your progress?"
                />
              </CardContent>
            )}
          </Card>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-background border-t p-4">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <Button
              variant="outline"
              size="lg"
              onClick={onPrevious}
              disabled={currentIndex === 0}
              className="h-12 px-6"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>

            <Button
              variant="ghost"
              onClick={onSkip}
              className="flex-1 h-12"
            >
              Skip
            </Button>

            <Button
              size="lg"
              onClick={handleNext}
              className="flex-1 h-12 text-base"
            >
              {currentIndex === totalCount - 1 ? 'Review' : 'Next'}
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleCancel}
            className="w-full text-muted-foreground hover:text-destructive"
          >
            <X className="h-4 w-4 mr-2" />
            Cancel Check-in
          </Button>
        </div>
      </div>
    </div>
  );
}
