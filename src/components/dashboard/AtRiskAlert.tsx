import { AlertCircle, User, ArrowDown } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface AtRiskAlertProps {
  title: string;
  owner: string;
  previousProgress: number;
  currentProgress: number;
  daysOverdue?: number;
  blockerFlagged?: boolean;
  onViewDetails?: () => void;
  onContactOwner?: () => void;
  severity?: "warning" | "critical";
}

export default function AtRiskAlert({
  title,
  owner,
  previousProgress,
  currentProgress,
  daysOverdue,
  blockerFlagged,
  onViewDetails,
  onContactOwner,
  severity = "warning",
}: AtRiskAlertProps) {
  const progressDrop = previousProgress - currentProgress;
  const isCritical = severity === "critical" || progressDrop > 15;

  return (
    <Card
      className={cn(
        "border-l-4 transition-shadow hover:shadow-md",
        isCritical ? "border-l-red-500" : "border-l-amber-500"
      )}
    >
      <CardContent className="p-4">
        <div className="space-y-3">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-2">
                <AlertCircle
                  className={cn(
                    "h-4 w-4",
                    isCritical ? "text-red-600" : "text-amber-600"
                  )}
                />
                <h4 className="font-semibold text-slate-900 text-sm">
                  {title}
                </h4>
              </div>
              <div className="flex items-center gap-4 text-xs text-slate-600">
                <div className="flex items-center gap-1">
                  <User className="h-3 w-3" />
                  <span>{owner}</span>
                </div>
                {daysOverdue && daysOverdue > 0 && (
                  <>
                    <span>•</span>
                    <span className="text-red-600 font-medium">
                      {daysOverdue} days overdue
                    </span>
                  </>
                )}
                {blockerFlagged && (
                  <>
                    <span>•</span>
                    <span className="text-amber-600 font-medium">
                      Blocker flagged
                    </span>
                  </>
                )}
              </div>
            </div>
            <div className="flex flex-col items-end gap-1">
              <div className="flex items-center gap-1 text-sm font-semibold">
                <span className="text-slate-400">{previousProgress}%</span>
                <ArrowDown className="h-4 w-4 text-red-500" />
                <span
                  className={cn(
                    isCritical ? "text-red-600" : "text-amber-600"
                  )}
                >
                  {currentProgress}%
                </span>
              </div>
              <span className="text-xs text-slate-500">
                -{progressDrop}% drop
              </span>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onViewDetails}
              className="flex-1"
            >
              View Details
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onContactOwner}
              className="flex-1"
            >
              Contact Owner
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
