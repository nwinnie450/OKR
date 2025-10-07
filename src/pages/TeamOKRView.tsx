import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { CircularProgress } from '@/components/ui/circular-progress';
import { useObjectives } from '@/hooks/useObjectives';
import { useTeams } from '@/hooks/useTeams';
import type { Objective } from '@/lib/api';
import {
  ArrowLeft,
  Target,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Users,
  Search,
  Plus,
  Clock,
  Filter,
  SortAsc,
} from 'lucide-react';

type FilterTab = 'all' | 'active' | 'completed' | 'at-risk' | 'archived';
type SortOption = 'progress' | 'confidence' | 'owner' | 'updated';

export default function TeamOKRView() {
  const { teamId } = useParams<{ teamId: string }>();
  const navigate = useNavigate();

  // State management
  const [filterTab, setFilterTab] = useState<FilterTab>('all');
  const [quarterFilter, setQuarterFilter] = useState<string>('all');
  const [yearFilter, setYearFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [ownerFilter, setOwnerFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('progress');
  const [groupByOwner, setGroupByOwner] = useState(false);

  // Data fetching
  const { objectives, isLoading: objectivesLoading, error: objectivesError } = useObjectives({
    teamId: teamId,
  });
  const { data: teams, isLoading: teamsLoading } = useTeams();

  // Get team data
  const team = useMemo(() => {
    return teams?.find(t => t._id === teamId);
  }, [teams, teamId]);

  // Filter and process OKRs
  const filteredAndSortedOKRs = useMemo(() => {
    if (!objectives) return [];

    let filtered = [...objectives];

    // Apply tab filter
    if (filterTab === 'active') {
      filtered = filtered.filter(okr => okr.status === 'active');
    } else if (filterTab === 'completed') {
      filtered = filtered.filter(okr => okr.status === 'completed');
    } else if (filterTab === 'at-risk') {
      filtered = filtered.filter(okr =>
        okr.confidence === 'at-risk' || okr.confidence === 'off-track'
      );
    } else if (filterTab === 'archived') {
      filtered = filtered.filter(okr => okr.status === 'archived');
    }

    // Apply quarter filter
    if (quarterFilter !== 'all') {
      filtered = filtered.filter(okr => okr.timePeriod?.startsWith(quarterFilter));
    }

    // Apply year filter
    if (yearFilter !== 'all') {
      filtered = filtered.filter(okr => okr.timePeriod?.includes(yearFilter));
    }

    // Apply status filter (separate from tab)
    if (statusFilter !== 'all') {
      filtered = filtered.filter(okr => okr.status === statusFilter);
    }

    // Apply owner filter
    if (ownerFilter !== 'all') {
      filtered = filtered.filter(okr => okr.ownerId === ownerFilter);
    }

    // Apply search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(okr =>
        okr.title.toLowerCase().includes(query) ||
        okr.description?.toLowerCase().includes(query)
      );
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'progress':
          return (b.progress || 0) - (a.progress || 0);
        case 'confidence':
          const confidenceOrder = { 'on-track': 3, 'at-risk': 2, 'off-track': 1 };
          return (confidenceOrder[b.confidence as ConfidenceLevel] || 0) -
                 (confidenceOrder[a.confidence as ConfidenceLevel] || 0);
        case 'owner':
          return (a.owner?.name || '').localeCompare(b.owner?.name || '');
        case 'updated':
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        default:
          return 0;
      }
    });

    return filtered;
  }, [objectives, filterTab, quarterFilter, yearFilter, statusFilter, ownerFilter, searchQuery, sortBy]);

  // Calculate summary stats
  const summaryStats = useMemo(() => {
    if (!objectives) {
      return {
        totalOKRs: 0,
        avgCompletion: 0,
        activeOKRs: 0,
        atRiskOKRs: 0,
      };
    }

    const activeOKRs = objectives.filter(okr => okr.status === 'active').length;
    const atRiskOKRs = objectives.filter(okr =>
      okr.confidence === 'at-risk' || okr.confidence === 'off-track'
    ).length;
    const avgCompletion = objectives.length > 0
      ? objectives.reduce((sum, okr) => sum + (okr.progress || 0), 0) / objectives.length
      : 0;

    return {
      totalOKRs: objectives.length,
      avgCompletion: Math.round(avgCompletion),
      activeOKRs,
      atRiskOKRs,
    };
  }, [objectives]);

  // Get unique team members from OKRs
  const teamMembers = useMemo(() => {
    if (!objectives) return [];
    const membersMap = new Map();
    objectives.forEach(okr => {
      if (okr.owner && !membersMap.has(okr.owner.id)) {
        membersMap.set(okr.owner.id, okr.owner);
      }
    });
    return Array.from(membersMap.values());
  }, [objectives]);

  // Group OKRs by owner if enabled
  const groupedOKRs = useMemo(() => {
    if (!groupByOwner) return null;

    const grouped = new Map<string, Objective[]>();
    filteredAndSortedOKRs.forEach(okr => {
      const ownerId = okr.ownerId || 'unassigned';
      if (!grouped.has(ownerId)) {
        grouped.set(ownerId, []);
      }
      grouped.get(ownerId)!.push(okr);
    });

    return grouped;
  }, [filteredAndSortedOKRs, groupByOwner]);

  // Get confidence badge color
  const getConfidenceBadgeVariant = (confidence?: ConfidenceLevel) => {
    switch (confidence) {
      case 'on-track':
        return 'default';
      case 'at-risk':
        return 'warning';
      case 'off-track':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  // Get status badge variant
  const getStatusBadgeVariant = (status?: string) => {
    switch (status) {
      case 'active':
        return 'default';
      case 'completed':
        return 'success';
      case 'archived':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  // Format time ago
  const formatTimeAgo = (date: string) => {
    const now = new Date();
    const updated = new Date(date);
    const diffMs = now.getTime() - updated.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  // Loading state
  if (objectivesLoading || teamsLoading) {
    return (
      <DashboardLayout title="Team OKRs">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  // Team not found error
  if (!teamsLoading && !team) {
    return (
      <DashboardLayout title="Team Not Found" description="Unable to load team">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="h-12 w-12 text-amber-600 mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Team Not Found</h3>
            <p className="text-slate-600 text-center mb-6">
              The team you're looking for doesn't exist or you don't have permission to view its OKRs.
            </p>
            <Button onClick={() => navigate('/teams')} variant="default">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Teams
            </Button>
          </CardContent>
        </Card>
      </DashboardLayout>
    );
  }

  // Error loading OKRs
  if (objectivesError) {
    return (
      <DashboardLayout title={`Team OKRs - ${team?.name || 'Team'}`} description="Error loading OKRs">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="h-12 w-12 text-red-600 mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Failed to Load OKRs</h3>
            <p className="text-slate-600 text-center mb-6">
              There was an error loading the OKRs for this team. Please try again.
            </p>
            <div className="flex gap-2">
              <Button onClick={() => window.location.reload()} variant="default">
                Retry
              </Button>
              <Button onClick={() => navigate('/teams')} variant="outline">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Teams
              </Button>
            </div>
          </CardContent>
        </Card>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title={`Team OKRs - ${team.name}`}>
      <div className="space-y-6">
        {/* Team Header Section */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center text-white text-2xl font-bold"
                  style={{ backgroundColor: team.color }}
                >
                  {team.name.charAt(0)}
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <CardTitle className="text-3xl">{team.name}</CardTitle>
                    <Badge variant="outline">
                      {typeof team.department === 'object' ? team.department.name : team.department}
                    </Badge>
                  </div>
                  <CardDescription className="text-base">
                    {team.description}
                  </CardDescription>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={team.lead?.avatar} />
                        <AvatarFallback>{team.lead?.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <span>Led by {team.lead?.name}</span>
                    </div>
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {team.memberCount} members
                    </Badge>
                  </div>
                </div>
              </div>
              <Button onClick={() => navigate('/teams')} variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Teams
              </Button>
            </div>
          </CardHeader>
        </Card>

        {/* Summary Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total OKRs</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summaryStats.totalOKRs}</div>
              <p className="text-xs text-muted-foreground">All team objectives</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Completion</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summaryStats.avgCompletion}%</div>
              <p className="text-xs text-muted-foreground">Across all OKRs</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active OKRs</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summaryStats.activeOKRs}</div>
              <p className="text-xs text-muted-foreground">Currently in progress</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">At Risk</CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">{summaryStats.atRiskOKRs}</div>
              <p className="text-xs text-muted-foreground">Need attention</p>
            </CardContent>
          </Card>
        </div>

        {/* Team Members Section */}
        {teamMembers.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="h-5 w-5" />
                Team Members
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 flex-wrap">
                {teamMembers.slice(0, 8).map(member => (
                  <div
                    key={member.id}
                    className="group relative cursor-pointer"
                    onClick={() => setOwnerFilter(member.id)}
                  >
                    <Avatar className="h-10 w-10 border-2 border-background ring-2 ring-transparent hover:ring-primary transition-all">
                      <AvatarImage src={member.avatar} />
                      <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-popover text-popover-foreground text-xs rounded shadow-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                      {member.name}
                    </div>
                  </div>
                ))}
                {teamMembers.length > 8 && (
                  <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center text-sm font-medium">
                    +{teamMembers.length - 8}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Filters and Tabs */}
        <div className="space-y-4">
          {/* Filter Tabs */}
          <Tabs value={filterTab} onValueChange={(v) => setFilterTab(v as FilterTab)}>
            <TabsList>
              <TabsTrigger value="all">All OKRs</TabsTrigger>
              <TabsTrigger value="active">Active</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
              <TabsTrigger value="at-risk">At Risk</TabsTrigger>
              <TabsTrigger value="archived">Archived</TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Additional Filters */}
          <div className="flex flex-wrap gap-3">
            <div className="flex-1 min-w-[200px] max-w-sm">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search OKRs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            <Select value={quarterFilter} onValueChange={setQuarterFilter}>
              <SelectTrigger className="w-[140px]">
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

            <Select value={yearFilter} onValueChange={setYearFilter}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Year" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Years</SelectItem>
                <SelectItem value="2024">2024</SelectItem>
                <SelectItem value="2025">2025</SelectItem>
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>

            <Select value={ownerFilter} onValueChange={setOwnerFilter}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Owner" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Members</SelectItem>
                {teamMembers.map(member => (
                  <SelectItem key={member.id} value={member.id}>
                    {member.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="progress">Progress</SelectItem>
                <SelectItem value="confidence">Confidence</SelectItem>
                <SelectItem value="owner">Owner</SelectItem>
                <SelectItem value="updated">Updated Date</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant={groupByOwner ? 'default' : 'outline'}
              onClick={() => setGroupByOwner(!groupByOwner)}
            >
              <Filter className="h-4 w-4 mr-2" />
              Group by Owner
            </Button>
          </div>
        </div>

        {/* OKR List Display */}
        {filteredAndSortedOKRs.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Target className="h-16 w-16 text-muted-foreground mb-4" />
              <CardTitle className="text-xl mb-2">No OKRs Found</CardTitle>
              <CardDescription className="text-center mb-6">
                {searchQuery || filterTab !== 'all'
                  ? 'No OKRs match your current filters. Try adjusting your search criteria.'
                  : "This team doesn't have any OKRs yet. Create one to get started!"}
              </CardDescription>
              <Button onClick={() => navigate('/objectives/create')}>
                <Plus className="h-4 w-4 mr-2" />
                Create Team OKR
              </Button>
            </CardContent>
          </Card>
        ) : groupByOwner && groupedOKRs ? (
          // Grouped view
          <div className="space-y-6">
            {Array.from(groupedOKRs.entries()).map(([ownerId, okrs]) => {
              const owner = okrs[0]?.owner;
              return (
                <div key={ownerId} className="space-y-3">
                  <div className="flex items-center gap-3">
                    {owner ? (
                      <>
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={owner.avatar} />
                          <AvatarFallback>{owner.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <h3 className="font-semibold text-lg">{owner.name}</h3>
                        <Badge variant="secondary">{okrs.length} OKRs</Badge>
                      </>
                    ) : (
                      <h3 className="font-semibold text-lg">Unassigned</h3>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {okrs.map(okr => (
                      <OKRCard
                        key={okr.id}
                        okr={okr}
                        onClick={() => navigate(`/okr/${okr.id}`)}
                        getConfidenceBadgeVariant={getConfidenceBadgeVariant}
                        getStatusBadgeVariant={getStatusBadgeVariant}
                        formatTimeAgo={formatTimeAgo}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          // Regular list view
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAndSortedOKRs.map(okr => (
              <OKRCard
                key={okr.id}
                okr={okr}
                onClick={() => navigate(`/okr/${okr.id}`)}
                getConfidenceBadgeVariant={getConfidenceBadgeVariant}
                getStatusBadgeVariant={getStatusBadgeVariant}
                formatTimeAgo={formatTimeAgo}
              />
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

// OKR Card Component
interface OKRCardProps {
  okr: Objective;
  onClick: () => void;
  getConfidenceBadgeVariant: (confidence?: ConfidenceLevel) => string;
  getStatusBadgeVariant: (status?: string) => string;
  formatTimeAgo: (date: string) => string;
}

function OKRCard({
  okr,
  onClick,
  getConfidenceBadgeVariant,
  getStatusBadgeVariant,
  formatTimeAgo,
}: OKRCardProps) {
  return (
    <Card
      className="cursor-pointer hover:shadow-md transition-shadow"
      onClick={onClick}
    >
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <CardTitle className="text-lg line-clamp-2">{okr.title}</CardTitle>
          <CircularProgress value={okr.progress || 0} size={48} />
        </div>
        <div className="flex items-center gap-2 pt-2">
          <Avatar className="h-6 w-6">
            <AvatarImage src={okr.owner?.avatar} />
            <AvatarFallback>{okr.owner?.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <span className="text-sm text-muted-foreground">{okr.owner?.name}</span>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex flex-wrap gap-2">
          <Badge variant={getConfidenceBadgeVariant(okr.confidence) as any}>
            {okr.confidence}
          </Badge>
          <Badge variant={getStatusBadgeVariant(okr.status) as any}>
            {okr.status}
          </Badge>
          <Badge variant="outline">{okr.timePeriod}</Badge>
        </div>
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Target className="h-3 w-3" />
            <span>{okr.keyResults?.length || 0} Key Results</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>{formatTimeAgo(okr.updatedAt)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
