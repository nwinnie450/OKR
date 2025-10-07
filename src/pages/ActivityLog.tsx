import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Activity,
  User,
  Target,
  CheckCircle2,
  Trash2,
  Edit3,
  PlusCircle,
  Users,
  Clock,
  Search,
  Filter
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// TODO: Implement real activity tracking API
// For now, using empty array - activity log will show "No activities found"
const mockActivities: never[] = [];

const getActivityIcon = (type: string) => {
  switch (type) {
    case 'okr_created':
    case 'kr_created':
      return <PlusCircle className="h-4 w-4 text-green-600" />;
    case 'okr_updated':
    case 'kr_updated':
      return <Edit3 className="h-4 w-4 text-blue-600" />;
    case 'okr_deleted':
    case 'kr_deleted':
      return <Trash2 className="h-4 w-4 text-red-600" />;
    case 'checkin_submitted':
      return <CheckCircle2 className="h-4 w-4 text-purple-600" />;
    case 'user_created':
      return <User className="h-4 w-4 text-cyan-600" />;
    case 'team_created':
      return <Users className="h-4 w-4 text-orange-600" />;
    default:
      return <Activity className="h-4 w-4 text-slate-600" />;
  }
};

const getActivityColor = (type: string) => {
  switch (type) {
    case 'okr_created':
    case 'kr_created':
      return 'bg-green-50 border-green-200';
    case 'okr_updated':
    case 'kr_updated':
      return 'bg-blue-50 border-blue-200';
    case 'okr_deleted':
    case 'kr_deleted':
      return 'bg-red-50 border-red-200';
    case 'checkin_submitted':
      return 'bg-purple-50 border-purple-200';
    case 'user_created':
      return 'bg-cyan-50 border-cyan-200';
    case 'team_created':
      return 'bg-orange-50 border-orange-200';
    default:
      return 'bg-slate-50 border-slate-200';
  }
};

const formatTimeAgo = (timestamp: string) => {
  const seconds = Math.floor((Date.now() - new Date(timestamp).getTime()) / 1000);

  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return new Date(timestamp).toLocaleDateString();
};

export default function ActivityLog() {
  const { user: currentUser } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [activeTab, setActiveTab] = useState('all');

  // TODO: When real API is implemented, add role-based filtering here
  // Admin: See all activities
  // Manager: See activities from users in their department
  // Team Lead: See activities from users in their team

  const filterActivitiesByTab = (activities: typeof mockActivities) => {
    if (activeTab === 'all') return activities;
    if (activeTab === 'okrs') {
      return activities.filter(a =>
        ['okr_created', 'okr_updated', 'okr_deleted', 'kr_created', 'kr_updated', 'kr_deleted'].includes(a.type)
      );
    }
    if (activeTab === 'checkins') {
      return activities.filter(a => a.type === 'checkin_submitted');
    }
    if (activeTab === 'users') {
      return activities.filter(a => ['user_created', 'team_created'].includes(a.type));
    }
    return activities;
  };

  const filteredActivities = filterActivitiesByTab(mockActivities)
    .filter(activity => {
      const matchesSearch =
        activity.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
        activity.target.toLowerCase().includes(searchQuery.toLowerCase()) ||
        activity.action.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesType = filterType === 'all' || activity.type === filterType;

      return matchesSearch && matchesType;
    });

  return (
    <DashboardLayout
      title="Activity Log"
      description="Track all system activities and changes"
    >
      <div className="space-y-6">
        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search activities..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-full sm:w-[200px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Activities</SelectItem>
                  <SelectItem value="okr_created">OKR Created</SelectItem>
                  <SelectItem value="okr_updated">OKR Updated</SelectItem>
                  <SelectItem value="okr_deleted">OKR Deleted</SelectItem>
                  <SelectItem value="checkin_submitted">Check-in</SelectItem>
                  <SelectItem value="user_created">User Added</SelectItem>
                  <SelectItem value="team_created">Team Created</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Activity Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">All Activity</TabsTrigger>
            <TabsTrigger value="okrs">OKRs</TabsTrigger>
            <TabsTrigger value="checkins">Check-ins</TabsTrigger>
            <TabsTrigger value="users">Users & Teams</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Recent Activities
                  <Badge variant="secondary" className="ml-auto">
                    {filteredActivities.length} activities
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {filteredActivities.length === 0 ? (
                  <div className="text-center py-12 text-slate-500">
                    <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No activities found</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredActivities.map((activity) => (
                      <div
                        key={activity.id}
                        className={`flex items-start gap-4 p-4 rounded-lg border ${getActivityColor(activity.type)} transition-all hover:shadow-md`}
                      >
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white border-2">
                          {getActivityIcon(activity.type)}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                              <p className="text-sm font-medium text-slate-900">
                                <span className="font-semibold">{activity.user}</span>
                                {' '}{activity.action}{' '}
                                <span className="font-semibold text-blue-600">
                                  {activity.target}
                                </span>
                              </p>

                              {activity.metadata && (
                                <div className="mt-1 flex flex-wrap gap-2">
                                  {activity.metadata.progress !== undefined && (
                                    <Badge variant="outline" className="text-xs">
                                      Progress: {activity.metadata.progress}%
                                    </Badge>
                                  )}
                                  {activity.metadata.confidence && (
                                    <Badge
                                      variant="outline"
                                      className={`text-xs ${
                                        activity.metadata.confidence === 'on-track'
                                          ? 'border-green-500 text-green-700'
                                          : activity.metadata.confidence === 'at-risk'
                                          ? 'border-yellow-500 text-yellow-700'
                                          : 'border-red-500 text-red-700'
                                      }`}
                                    >
                                      {activity.metadata.confidence}
                                    </Badge>
                                  )}
                                  {activity.metadata.role && (
                                    <Badge variant="outline" className="text-xs">
                                      Role: {activity.metadata.role}
                                    </Badge>
                                  )}
                                  {activity.metadata.memberCount !== undefined && (
                                    <Badge variant="outline" className="text-xs">
                                      {activity.metadata.memberCount} members
                                    </Badge>
                                  )}
                                </div>
                              )}
                            </div>

                            <div className="flex items-center gap-2 text-xs text-slate-500 whitespace-nowrap">
                              <Clock className="h-3 w-3" />
                              {formatTimeAgo(activity.timestamp)}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
