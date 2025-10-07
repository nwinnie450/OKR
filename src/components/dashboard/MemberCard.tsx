import { User, Clock, AlertTriangle, CheckCircle2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface MemberCardProps {
  name: string;
  role: string;
  avatarUrl?: string;
  okrCount: number;
  progress: number;
  status: "on-track" | "at-risk" | "off-track";
  lastCheckIn?: string;
  hasBlocker?: boolean;
  onClick?: () => void;
}

export default function MemberCard({
  name,
  role,
  avatarUrl,
  okrCount,
  progress,
  status,
  lastCheckIn,
  hasBlocker,
  onClick,
}: MemberCardProps) {
  const getStatusConfig = () => {
    switch (status) {
      case "on-track":
        return {
          icon: CheckCircle2,
          color: "text-green-600",
          bgColor: "bg-green-50",
          borderColor: "border-green-200",
        };
      case "at-risk":
        return {
          icon: AlertTriangle,
          color: "text-amber-600",
          bgColor: "bg-amber-50",
          borderColor: "border-amber-200",
        };
      case "off-track":
        return {
          icon: AlertTriangle,
          color: "text-red-600",
          bgColor: "bg-red-50",
          borderColor: "border-red-200",
        };
    }
  };

  const statusConfig = getStatusConfig();
  const StatusIcon = statusConfig.icon;

  return (
    <Card
      className={cn(
        "cursor-pointer transition-all hover:shadow-md",
        hasBlocker && "border-l-4 border-l-amber-500"
      )}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-start gap-3">
            {/* Avatar */}
            <div className="flex-shrink-0">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={name}
                  className="w-12 h-12 rounded-full object-cover"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                  <User className="h-6 w-6 text-blue-600" />
                </div>
              )}
            </div>

            {/* Name and Role */}
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-slate-900 truncate">{name}</h4>
              <p className="text-sm text-slate-600 truncate">{role}</p>
              <p className="text-xs text-slate-500 mt-1">
                {okrCount} OKR{okrCount !== 1 ? "s" : ""}
              </p>
            </div>

            {/* Status Indicator */}
            <div className="flex-shrink-0">
              <div
                className={cn(
                  "p-2 rounded-full",
                  statusConfig.bgColor
                )}
              >
                <StatusIcon className={cn("h-4 w-4", statusConfig.color)} />
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-600">Progress</span>
              <span className="font-semibold text-slate-900">{progress}%</span>
            </div>
            <Progress value={progress} />
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between text-xs">
            {lastCheckIn ? (
              <div className="flex items-center gap-1 text-slate-600">
                <Clock className="h-3 w-3" />
                <span>Last check-in: {lastCheckIn}</span>
              </div>
            ) : (
              <span className="text-slate-400">No check-ins yet</span>
            )}

            {hasBlocker && (
              <Badge
                variant="secondary"
                className="bg-amber-100 text-amber-700 border-amber-200"
              >
                Blocker
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
