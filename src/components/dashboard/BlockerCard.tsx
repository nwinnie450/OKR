import { AlertCircle, User, Calendar, MessageSquare } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface BlockerCardProps {
  description: string;
  flaggedBy: string;
  assignedTo?: string;
  daysSinceFlagged: number;
  onMarkResolved?: () => void;
  onAddComment?: () => void;
}

export default function BlockerCard({
  description,
  flaggedBy,
  assignedTo,
  daysSinceFlagged,
  onMarkResolved,
  onAddComment,
}: BlockerCardProps) {
  const getPriorityColor = () => {
    if (daysSinceFlagged >= 5) return "bg-red-100 text-red-700 border-red-200";
    if (daysSinceFlagged >= 3) return "bg-amber-100 text-amber-700 border-amber-200";
    return "bg-blue-100 text-blue-700 border-blue-200";
  };

  const getPriorityLabel = () => {
    if (daysSinceFlagged >= 5) return "Critical";
    if (daysSinceFlagged >= 3) return "High";
    return "Medium";
  };

  return (
    <Card className="border-l-4 border-l-red-500">
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Header */}
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="font-medium text-slate-900 leading-tight">
                {description}
              </p>
            </div>
            <Badge className={getPriorityColor()}>
              {getPriorityLabel()}
            </Badge>
          </div>

          {/* Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <User className="h-3.5 w-3.5" />
              <span>
                Flagged by <span className="font-medium">{flaggedBy}</span>
              </span>
            </div>
            {assignedTo && (
              <div className="flex items-center gap-2">
                <User className="h-3.5 w-3.5" />
                <span>
                  Assigned to <span className="font-medium">{assignedTo}</span>
                </span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Calendar className="h-3.5 w-3.5" />
              <span>
                {daysSinceFlagged} day{daysSinceFlagged !== 1 ? "s" : ""} ago
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-1">
            <Button
              variant="default"
              size="sm"
              onClick={onMarkResolved}
              className="flex-1"
            >
              Mark Resolved
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onAddComment}
              className="flex-1"
            >
              <MessageSquare className="h-4 w-4 mr-1" />
              Add Comment
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
