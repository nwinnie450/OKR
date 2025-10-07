import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { KeyResult } from '@/types/okr';
import { Clock, CheckCircle2, AlertCircle } from 'lucide-react';

interface CheckInLandingProps {
  keyResults: KeyResult[];
  onStartCheckIn: () => void;
  onRemindLater: () => void;
}

export default function CheckInLanding({
  keyResults,
  onStartCheckIn,
  onRemindLater,
}: CheckInLandingProps) {

  // Calculate estimated time (18 seconds per KR)
  const estimatedSeconds = keyResults.length * 18;
  const estimatedTime = estimatedSeconds < 60
    ? `${estimatedSeconds} sec`
    : `${Math.ceil(estimatedSeconds / 60)} min`;

  // Mock previous check-ins (in real app, fetch from API)
  const previousCheckIns: Array<{ date: string; count: number; time: number }> = [
    { date: '2025-09-26', count: 4, time: 65 },
    { date: '2025-09-19', count: 4, time: 72 },
    { date: '2025-09-12', count: 3, time: 54 },
  ];

  // Calculate if any KRs are overdue
  const overdueCount = keyResults.filter(kr => {
    if (!kr.lastCheckinAt) return true; // Never checked in
    const lastCheckin = new Date(kr.lastCheckinAt);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return lastCheckin < weekAgo;
  }).length;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-primary text-primary-foreground py-6 px-4">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl font-bold mb-2">Weekly Check-in</h1>
          <p className="text-primary-foreground/90">Update your progress on key results</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto px-4 py-6 pb-24 space-y-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-2xl font-bold">{estimatedTime}</p>
                  <p className="text-sm text-muted-foreground">Estimated time</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-2xl font-bold">{keyResults.length}</p>
                  <p className="text-sm text-muted-foreground">KRs to update</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Key Results Due */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Key Results Due</span>
              {overdueCount > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {overdueCount} overdue
                </Badge>
              )}
            </CardTitle>
            <CardDescription>Update progress on these key results</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {keyResults.map((kr, index) => {
              const isOverdue = kr.lastCheckinAt
                ? new Date(kr.lastCheckinAt) < new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                : true;

              return (
                <div
                  key={kr.id}
                  className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                >
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-medium">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-base leading-tight mb-1">{kr.title}</p>
                    <p className="text-sm text-muted-foreground">
                      Current: <span className="font-medium">{kr.currentValue}</span> → Target: <span className="font-medium">{kr.targetValue}</span> {kr.unit}
                    </p>
                    {kr.lastCheckinAt && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Last updated: {new Date(kr.lastCheckinAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  {isOverdue && (
                    <AlertCircle className="flex-shrink-0 h-5 w-5 text-destructive" />
                  )}
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Previous Check-ins */}
        {previousCheckIns.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Previous Check-ins</CardTitle>
              <CardDescription>Your recent check-in history</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {previousCheckIns.map((checkin, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <div>
                        <p className="text-sm font-medium">
                          {new Date(checkin.date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric'
                          })}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {checkin.count} KRs updated
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{checkin.time}s</p>
                      <p className="text-xs text-muted-foreground">Time taken</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* CTA Buttons */}
        <div className="fixed bottom-0 left-0 right-0 bg-background border-t p-4 md:relative md:border-0 md:p-0">
          <div className="max-w-2xl mx-auto space-y-3">
            <Button
              size="lg"
              className="w-full h-14 text-lg"
              onClick={onStartCheckIn}
            >
              Start Check-in ({estimatedTime})
            </Button>
            <Button
              variant="ghost"
              className="w-full"
              onClick={onRemindLater}
            >
              Remind Me Tomorrow
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
