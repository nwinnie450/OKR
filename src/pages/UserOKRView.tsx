import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  User,
  ArrowLeft,
  Target,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Mail,
  Briefcase,
  Search,
  Calendar,
  Filter,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { CircularProgress } from '@/components/ui/circular-progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useObjectives } from '@/hooks/useObjectives';
import { useUser } from '@/hooks/useUsers';
import type { Objective } from '@/lib/api';
import { cn } from '@/lib/utils';

type TabValue = 'all' | 'individual' | 'team' | 'completed' | 'archived';

export default function UserOKRView() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();

  // State
  const [activeTab, setActiveTab] = useState<TabValue>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [quarterFilter, setQuarterFilter] = useState('all');
  const [yearFilter, setYearFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [confidenceFilter, setConfidenceFilter] = useState('all');

  // Fetch user data
  const { data: userData, isLoading: isLoadingUser, error: userError } = useUser(userId!);
  const user = userData?.data;

  // Fetch objectives for this user
  const { data: objectivesData, isLoading: isLoadingObjectives, error: objectivesError } = useObjectives({
    ownerId: userId,
  });
  const objectives = objectivesData || [];

  const isLoading = isLoadingUser || isLoadingObjectives;
  const error = userError || objectivesError;

  // Filter objectives based on all filters
  const filteredObjectives = useMemo(() => {
    return objectives.filter((obj) => {
      // Tab filter
      if (activeTab === 'individual' && obj.type !== 'individual') return false;
      if (activeTab === 'team' && obj.type !== 'team') return false;
      if (activeTab === 'completed' && obj.status !== 'completed') return false;
      if (activeTab === 'archived' && obj.status !== 'archived') return false;

      // Search filter
      if (searchQuery && !obj.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !(obj.description?.toLowerCase().includes(searchQuery.toLowerCase()))) {
        return false;
      }

      // Quarter filter
      if (quarterFilter !== 'all' && obj.timePeriod !== quarterFilter) {
        return false;
      }

      // Year filter
      if (yearFilter !== 'all' && obj.year.toString() !== yearFilter) {
        return false;
      }

      // Status filter
      if (statusFilter !== 'all' && obj.status !== statusFilter) {
        return false;
      }

      // Confidence filter
      if (confidenceFilter !== 'all' && obj.confidence !== confidenceFilter) {
        return false;
      }

      return true;
    });
  }, [objectives, activeTab, searchQuery, quarterFilter, yearFilter, statusFilter, confidenceFilter]);

  // Calculate summary stats
  const stats = useMemo(() => {
    const totalOKRs = objectives.length;
    const completedOKRs = objectives.filter((obj) => obj.status === 'completed').length;
    const completionRate = totalOKRs > 0 ? Math.round((completedOKRs / totalOKRs) * 100) : 0;
    const atRiskCount = objectives.filter(
      (obj) => obj.confidence === 'at-risk' || obj.confidence === 'off-track'
    ).length;

    return {
      total: totalOKRs,
      completionRate,
      atRisk: atRiskCount,
    };
  }, [objectives]);

  // Helper functions
  const getStatusBadge = (confidence: string) => {
    const config = {
      'on-track': { label: 'On Track', class: 'bg-green-100 text-green-700 border-green-200', icon: CheckCircle2 },
      'at-risk': { label: 'At Risk', class: 'bg-amber-100 text-amber-700 border-amber-200', icon: AlertCircle },
      'off-track': { label: 'Off Track', class: 'bg-red-100 text-red-700 border-red-200', icon: AlertCircle },
    };
    const status = config[confidence as keyof typeof config] || config['on-track'];
    const Icon = status.icon;
    return (
      <Badge className={status.class}>
        <Icon className="h-3 w-3 mr-1" />
        {status.label}
      </Badge>
    );
  };

  const getRoleBadgeClass = (role: string) => {
    const config: Record<string, string> = {
      admin: 'bg-purple-100 text-purple-700 border-purple-200',
      manager: 'bg-blue-100 text-blue-700 border-blue-200',
      member: 'bg-slate-100 text-slate-700 border-slate-200',
      pm: 'bg-indigo-100 text-indigo-700 border-indigo-200',
      dev: 'bg-green-100 text-green-700 border-green-200',
      qa: 'bg-amber-100 text-amber-700 border-amber-200',
    };
    return config[role] || config.member;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  // Loading state
  if (isLoading) {
    return (
      <DashboardLayout title="User OKRs" description="Loading user OKRs">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <span className="ml-3 text-slate-600">Loading OKRs...</span>
        </div>
      </DashboardLayout>
    );
  }

  // Error state - User not found
  if (userError || (!isLoadingUser && !user)) {
    return (
      <DashboardLayout title="User Not Found" description="Unable to load user">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="h-12 w-12 text-amber-600 mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">User Not Found</h3>
            <p className="text-slate-600 text-center mb-6">
              The user you're looking for doesn't exist or you don't have permission to view their OKRs.
            </p>
            <Button onClick={() => navigate('/users')} variant="default">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Users
            </Button>
          </CardContent>
        </Card>
      </DashboardLayout>
    );
  }

  // Error state - Objectives failed to load
  if (objectivesError) {
    return (
      <DashboardLayout
        title={`User OKRs - ${user?.name || 'User'}`}
        description="Error loading OKRs"
      >
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="h-12 w-12 text-red-600 mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Failed to Load OKRs</h3>
            <p className="text-slate-600 text-center mb-6">
              There was an error loading the OKRs for this user. Please try again.
            </p>
            <Button onClick={() => window.location.reload()} variant="default" className="mr-2">
              Retry
            </Button>
            <Button onClick={() => navigate('/users')} variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Users
            </Button>
          </CardContent>
        </Card>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title={`User OKRs - ${user.name}`}
      description={`View and manage OKRs for ${user.name}`}
    >
      <div className="space-y-6">
        {/* Back Button */}
        <Button onClick={() => navigate('/users')} variant="outline" size="sm">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Users
        </Button>

        {/* User Profile Header */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-start gap-6">
              {/* Avatar */}
              <div className="flex-shrink-0">
                <div className="h-20 w-20 rounded-full bg-blue-600 flex items-center justify-center">
                  {user.avatarUrl ? (
                    <img
                      src={user.avatarUrl}
                      alt={user.name}
                      className="h-20 w-20 rounded-full object-cover"
                    />
                  ) : (
                    <User className="h-10 w-10 text-white" />
                  )}
                </div>
              </div>

              {/* User Info */}
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-2xl font-bold text-slate-900">{user.name}</h3>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge className={getRoleBadgeClass(user.role)}>
                        {user.role.toUpperCase()}
                      </Badge>
                      {user.department && (
                        <Badge variant="outline" className="capitalize">
                          <Briefcase className="h-3 w-3 mr-1" />
                          {user.department}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-3 text-slate-600">
                      <Mail className="h-4 w-4" />
                      <span className="text-sm">{user.email}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Summary Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Total OKRs</p>
                  <p className="text-3xl font-bold text-slate-900">{stats.total}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Target className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Completion Rate</p>
                  <p className="text-3xl font-bold text-green-600">{stats.completionRate}%</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">At Risk</p>
                  <p className="text-3xl font-bold text-amber-600">{stats.atRisk}</p>
                </div>
                <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                  <AlertCircle className="h-6 w-6 text-amber-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filter Tabs */}
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as TabValue)}>
          <TabsList className="w-full justify-start">
            <TabsTrigger value="all">All OKRs</TabsTrigger>
            <TabsTrigger value="individual">Individual</TabsTrigger>
            <TabsTrigger value="team">Team</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
            <TabsTrigger value="archived">Archived</TabsTrigger>
          </TabsList>

          {/* Additional Filters */}
          <Card className="mt-4">
            <CardContent className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
                {/* Search */}
                <div className="relative lg:col-span-2">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="Search OKR titles..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>

                {/* Quarter Filter */}
                <Select value={quarterFilter} onValueChange={setQuarterFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Quarter" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Quarters</SelectItem>
                    <SelectItem value="Q1">Q1</SelectItem>
                    <SelectItem value="Q2">Q2</SelectItem>
                    <SelectItem value="Q3">Q3</SelectItem>
                    <SelectItem value="Q4">Q4</SelectItem>
                  </SelectContent>
                </Select>

                {/* Year Filter */}
                <Select value={yearFilter} onValueChange={setYearFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Year" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Years</SelectItem>
                    <SelectItem value="2025">2025</SelectItem>
                    <SelectItem value="2024">2024</SelectItem>
                  </SelectContent>
                </Select>

                {/* Status Filter */}
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                  </SelectContent>
                </Select>

                {/* Confidence Filter */}
                <Select value={confidenceFilter} onValueChange={setConfidenceFilter}>
                  <SelectTrigger className="lg:col-span-1">
                    <SelectValue placeholder="Confidence" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Confidence</SelectItem>
                    <SelectItem value="on-track">On Track</SelectItem>
                    <SelectItem value="at-risk">At Risk</SelectItem>
                    <SelectItem value="off-track">Off Track</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* OKR List */}
          <TabsContent value={activeTab} className="mt-4">
            {filteredObjectives.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Target className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">No OKRs found</h3>
                  <p className="text-slate-600">
                    {searchQuery || quarterFilter !== 'all' || yearFilter !== 'all'
                      ? 'Try adjusting your filters'
                      : 'This user has no OKRs yet'}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredObjectives.map((obj) => {
                  const status = obj.confidence === 'on-track' ? 'on-track' :
                                obj.confidence === 'at-risk' ? 'at-risk' : 'off-track';

                  // Get the count of key results
                  const keyResultCount = obj.keyResults?.length || 0;

                  return (
                    <Card
                      key={obj._id}
                      className="hover:shadow-lg transition-all cursor-pointer"
                      onClick={() => navigate(`/okr/${obj._id}`)}
                    >
                      <CardContent className="p-6">
                        <div className="space-y-4">
                          {/* Progress Ring */}
                          <div className="flex items-center justify-center">
                            <CircularProgress
                              value={obj.progress}
                              size={80}
                              strokeWidth={8}
                              status={status}
                            />
                          </div>

                          {/* Content */}
                          <div>
                            <h3 className="font-semibold text-lg text-slate-900 line-clamp-2 mb-2">
                              {obj.title}
                            </h3>

                            <p className="text-sm text-slate-600 line-clamp-2 mb-3">
                              {obj.description || 'No description'}
                            </p>

                            <div className="flex flex-wrap items-center gap-2 mb-3">
                              {getStatusBadge(obj.confidence)}
                              <Badge className="bg-slate-100 text-slate-700 border-slate-200 capitalize">
                                {obj.type}
                              </Badge>
                              <Badge className="bg-blue-100 text-blue-700 border-blue-200">
                                <Calendar className="h-3 w-3 mr-1" />
                                {obj.timePeriod} {obj.year}
                              </Badge>
                            </div>

                            <div className="flex items-center justify-between text-xs text-slate-500">
                              <span className="flex items-center gap-1">
                                <Target className="h-3 w-3" />
                                {keyResultCount} Key Result{keyResultCount !== 1 ? 's' : ''}
                              </span>
                              <span>Updated {formatDate(obj.updatedAt)}</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
