import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, CheckCircle2, AlertCircle, TrendingUp } from 'lucide-react';

interface PendingCheckIn {
  id: string;
  title: string;
  lastCheckinAt?: string;
  isOverdue: boolean;
}

interface CheckInWidgetProps {
  pendingCheckIns?: PendingCheckIn[];
  estimatedTime?: number; // in seconds
  onStartCheckIn?: () => void;
}

export default function CheckInWidget({
  pendingCheckIns = [],
  estimatedTime = 90,
  onStartCheckIn,
}: CheckInWidgetProps) {
  const navigate = useNavigate();

  const handleStartCheckIn = () => {
    if (onStartCheckIn) {
      onStartCheckIn();
    } else {
      navigate('/checkin');
    }
  };

  const overdueCount = pendingCheckIns.filter(ci => ci.isOverdue).length;
  const totalCount = pendingCheckIns.length;

  // Format time
  const formatTime = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    const mins = Math.ceil(seconds / 60);
    return `${mins} min`;
  };

  // Empty state
  if (totalCount === 0) {
    return (
      <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 border-green-200 dark:border-green-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-400">
            <CheckCircle2 className="h-5 w-5" />
            All Caught Up!
          </CardTitle>
          <CardDescription>No check-ins due this week</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <TrendingUp className="h-4 w-4" />
            <span>Next check-in due next week</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              This Week's Check-in
              {overdueCount > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {overdueCount} overdue
                </Badge>
              )}
            </CardTitle>
            <CardDescription>
              {totalCount} {totalCount === 1 ? 'KR needs' : 'KRs need'} your update
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Quick Stats */}
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
            <span className="font-medium">{totalCount} KRs due</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>{formatTime(estimatedTime)} estimated</span>
          </div>
        </div>

        {/* Preview of pending KRs */}
        <div className="space-y-2">
          {pendingCheckIns.slice(0, 3).map((checkIn) => (
            <div
              key={checkIn.id}
              className="flex items-center gap-2 p-2 rounded-md bg-background/50 text-sm"
            >
              {checkIn.isOverdue ? (
                <AlertCircle className="h-4 w-4 text-destructive flex-shrink-0" />
              ) : (
                <div className="h-4 w-4 rounded-full border-2 border-muted-foreground flex-shrink-0" />
              )}
              <span className="flex-1 truncate">{checkIn.title}</span>
              {checkIn.isOverdue && (
                <Badge variant="destructive" className="text-xs">
                  Overdue
                </Badge>
              )}
            </div>
          ))}
          {pendingCheckIns.length > 3 && (
            <p className="text-xs text-muted-foreground text-center">
              +{pendingCheckIns.length - 3} more
            </p>
          )}
        </div>

        {/* CTA Button */}
        <Button
          size="lg"
          className="w-full h-12 text-base font-medium"
          onClick={handleStartCheckIn}
        >
          Start Check-in ({formatTime(estimatedTime)})
        </Button>

        {/* Helper Text */}
        <p className="text-xs text-center text-muted-foreground">
          Quick updates to keep your team in sync
        </p>
      </CardContent>
    </Card>
  );
}

// Export a variant for compact display
export function CompactCheckInWidget({
  pendingCount = 0,
  isOverdue = false,
  onStartCheckIn,
}: {
  pendingCount?: number;
  isOverdue?: boolean;
  onStartCheckIn?: () => void;
}) {
  const navigate = useNavigate();

  const handleClick = () => {
    if (onStartCheckIn) {
      onStartCheckIn();
    } else {
      navigate('/checkin');
    }
  };

  if (pendingCount === 0) {
    return null;
  }

  return (
    <button
      onClick={handleClick}
      className="w-full p-4 rounded-lg border-2 border-primary bg-primary/5 hover:bg-primary/10 transition-colors text-left"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center">
            <Clock className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <p className="font-semibold text-base">Weekly Check-in Due</p>
            <p className="text-sm text-muted-foreground">
              {pendingCount} {pendingCount === 1 ? 'KR' : 'KRs'} waiting
            </p>
          </div>
        </div>
        {isOverdue && (
          <Badge variant="destructive">
            Overdue
          </Badge>
        )}
      </div>
    </button>
  );
}
