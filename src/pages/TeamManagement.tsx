import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Users,
  Plus,
  Edit,
  Trash2,
  Search,
  Loader2,
  UserPlus,
  UserMinus,
  Building2,
  Eye,
  X,
  ArrowUpDown,
  Filter,
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useTeams, useCreateTeam, useUpdateTeam, useDeleteTeam } from '@/hooks/useTeams';
import { useDepartments } from '@/hooks/useDepartments';
import { useUsers } from '@/hooks/useUsers';
import { useToast } from '@/hooks/use-toast';
import type { Team, CreateTeamData, UpdateTeamData } from '@/lib/api';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function TeamManagement() {
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);

  const [formData, setFormData] = useState<CreateTeamData>({
    name: '',
    description: '',
    department: '',
    leaderId: '',
    color: '#3b82f6',
  });

  // Filter state
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'name' | 'department' | 'members'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Fetch teams, departments, and users
  const { data: teams = [], isLoading } = useTeams({ search: searchQuery || undefined });
  const { data: departments } = useDepartments();
  const { data: users } = useUsers();

  // Safe array for rendering
  const departmentsList = departments || [];
  const usersList = users || [];

  // Role-based filtering: Managers see only teams in their department
  const roleBasedFilteredTeams = (() => {
    if (!currentUser) return [];

    // Admin sees all teams
    if (currentUser.role === 'admin') return teams;

    // Manager sees only teams in their department
    if (currentUser.role === 'manager') {
      const userDeptId = currentUser.departments?.[0];
      if (!userDeptId) return [];
      const deptId = typeof userDeptId === 'string' ? userDeptId : userDeptId._id;
      return teams.filter(team => {
        const teamDeptId = typeof team.department === 'object' ? team.department._id : team.department;
        return teamDeptId === deptId;
      });
    }

    return [];
  })();

  // Filtered and sorted teams (applies on top of role-based filtering)
  const filteredTeams = roleBasedFilteredTeams
    .filter(team => {
      // Department filter
      if (departmentFilter !== 'all') {
        const teamDeptId = typeof team.department === 'object' ? team.department._id : team.department;
        if (teamDeptId !== departmentFilter) return false;
      }

      // Status filter
      if (statusFilter !== 'all') {
        if (statusFilter === 'active' && !team.isActive) return false;
        if (statusFilter === 'inactive' && team.isActive) return false;
      }

      return true;
    })
    .sort((a, b) => {
      let comparison = 0;

      if (sortBy === 'name') {
        comparison = a.name.localeCompare(b.name);
      } else if (sortBy === 'department') {
        const aDept = typeof a.department === 'object' ? a.department.name : '';
        const bDept = typeof b.department === 'object' ? b.department.name : '';
        comparison = aDept.localeCompare(bDept);
      } else if (sortBy === 'members') {
        const aMembers = a.memberCount || 0;
        const bMembers = b.memberCount || 0;
        comparison = aMembers - bMembers;
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });

  const clearFilters = () => {
    setSearchQuery('');
    setDepartmentFilter('all');
    setStatusFilter('all');
    setSortBy('name');
    setSortOrder('asc');
  };

  const activeFilterCount = (searchQuery ? 1 : 0) +
                            (departmentFilter !== 'all' ? 1 : 0) +
                            (statusFilter !== 'all' ? 1 : 0);

  // Mutations
  const createTeam = useCreateTeam();
  const updateTeam = useUpdateTeam();
  const deleteTeam = useDeleteTeam();

  const handleCreateClick = () => {
    setFormData({
      name: '',
      description: '',
      department: '',
      leaderId: 'none', // Default to "none" (no team lead)
      color: '#3b82f6',
    });
    setIsCreateOpen(true);
  };

  const handleEditClick = (team: Team) => {
    setSelectedTeam(team);
    const leaderId = typeof team.leaderId === 'object' ? team.leaderId?._id : team.leaderId;
    setFormData({
      name: team.name,
      description: team.description || '',
      department: typeof team.department === 'object' ? team.department._id : team.department || '',
      leaderId: leaderId || 'none', // Default to "none" if no leader
      color: team.color || '#3b82f6',
    });
    setIsEditOpen(true);
  };

  const handleDeleteClick = (team: Team) => {
    setSelectedTeam(team);
    setIsDeleteOpen(true);
  };

  const handleCreate = async () => {
    if (!formData.name) {
      toast({
        title: 'Validation Error',
        description: 'Team name is required',
        variant: 'destructive',
      });
      return;
    }

    if (!formData.department) {
      toast({
        title: 'Validation Error',
        description: 'Department is required',
        variant: 'destructive',
      });
      return;
    }

    try {
      // Convert "none" or empty string to undefined for optional leaderId
      const teamData = {
        ...formData,
        leaderId: !formData.leaderId || formData.leaderId === 'none' ? undefined : formData.leaderId
      };
      await createTeam.mutateAsync(teamData);
      toast({
        title: 'Team Created',
        description: `${formData.name} has been created successfully`,
      });
      setIsCreateOpen(false);
    } catch (error: any) {
      toast({
        title: 'Create Failed',
        description: error.response?.data?.message || 'Failed to create team',
        variant: 'destructive',
      });
    }
  };

  const handleUpdate = async () => {
    if (!selectedTeam || !formData.name) {
      return;
    }

    try {
      // Convert "none" or empty string to undefined for optional leaderId
      const teamData = {
        ...formData,
        leaderId: !formData.leaderId || formData.leaderId === 'none' ? undefined : formData.leaderId
      };

      await updateTeam.mutateAsync({
        id: selectedTeam._id,
        data: teamData as UpdateTeamData,
      });
      toast({
        title: 'Team Updated',
        description: `${formData.name} has been updated successfully`,
      });
      setIsEditOpen(false);
      setSelectedTeam(null);
    } catch (error: any) {
      toast({
        title: 'Update Failed',
        description: error.response?.data?.message || 'Failed to update team',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async () => {
    if (!selectedTeam) return;

    try {
      await deleteTeam.mutateAsync(selectedTeam._id);
      toast({
        title: 'Team Deleted',
        description: `${selectedTeam.name} has been deleted successfully`,
      });
      setIsDeleteOpen(false);
      setSelectedTeam(null);
    } catch (error: any) {
      toast({
        title: 'Delete Failed',
        description: error.response?.data?.message || 'Failed to delete team',
        variant: 'destructive',
      });
    }
  };

  return (
    <DashboardLayout title="Team Management" description="Manage teams and members">
      <div className="space-y-6">
        {/* Header Actions */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Team Management</h1>
          <Button onClick={handleCreateClick}>
            <Plus className="mr-2 h-4 w-4" />
            Create Team
          </Button>
        </div>

        {/* Teams List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-blue-600" />
              All Teams ({filteredTeams.length})
              {activeFilterCount > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {activeFilterCount} filter{activeFilterCount > 1 ? 's' : ''}
                </Badge>
              )}
            </CardTitle>
            <CardDescription>Manage your organization's teams</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Filter Section */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search teams..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>

              {/* Department Filter */}
              <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                <SelectTrigger className="w-full sm:w-[200px]">
                  <SelectValue placeholder="All Departments" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  {departmentsList.map((dept) => (
                    <SelectItem key={dept._id} value={dept._id}>
                      {dept.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Status Filter */}
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[150px]">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>

              {/* Sort By */}
              <Select value={sortBy} onValueChange={(value: 'name' | 'department' | 'members') => setSortBy(value)}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <ArrowUpDown className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Sort by Name</SelectItem>
                  <SelectItem value="department">Sort by Department</SelectItem>
                  <SelectItem value="members">Sort by Members</SelectItem>
                </SelectContent>
              </Select>

              {/* Sort Order */}
              <Button
                variant="outline"
                size="icon"
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                title={sortOrder === 'asc' ? 'Ascending' : 'Descending'}
              >
                <ArrowUpDown className="h-4 w-4" />
              </Button>

              {/* Clear Filters */}
              {activeFilterCount > 0 && (
                <Button variant="ghost" onClick={clearFilters} className="gap-2">
                  <X className="h-4 w-4" />
                  Clear
                </Button>
              )}
            </div>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                <span className="ml-3 text-slate-600">Loading teams...</span>
              </div>
            ) : filteredTeams.length > 0 ? (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[250px]">Team Name</TableHead>
                      <TableHead className="w-[200px]">Department</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead className="w-[120px]">Members</TableHead>
                      <TableHead className="w-[150px]">Team Lead</TableHead>
                      <TableHead className="text-right w-[150px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTeams.map((team) => (
                      <TableRow key={team._id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div
                              className="w-8 h-8 rounded-full flex items-center justify-center text-white font-semibold text-sm"
                              style={{ backgroundColor: team.color || '#3b82f6' }}
                            >
                              {team.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="font-medium">{team.name}</div>
                              {!team.isActive && (
                                <Badge variant="outline" className="text-xs mt-1">
                                  Inactive
                                </Badge>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {team.department ? (
                            <div className="flex items-center gap-1">
                              <Building2 className="h-3 w-3 text-blue-600" />
                              <span>
                                {typeof team.department === 'object' ? team.department.name : team.department}
                              </span>
                            </div>
                          ) : (
                            '-'
                          )}
                        </TableCell>
                        <TableCell className="max-w-md">
                          <p className="text-sm text-slate-600 line-clamp-2">
                            {team.description || '-'}
                          </p>
                        </TableCell>
                        <TableCell>
                          <button
                            onClick={() => navigate(`/users?team=${team._id}`)}
                            className="flex items-center gap-1 hover:text-blue-600 transition-colors"
                            title="View team members"
                          >
                            <Users className="h-3 w-3" />
                            <span className="underline">{team.memberCount || 0}</span>
                          </button>
                        </TableCell>
                        <TableCell>
                          {team.leaderId && typeof team.leaderId === 'object' ? (
                            <span>{team.leaderId.name}</span>
                          ) : (
                            '-'
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => navigate(`/teams/${team._id}/okrs`)}
                              title="View Team OKRs"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleEditClick(team)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDeleteClick(team)}
                            >
                              <Trash2 className="h-4 w-4 text-red-600" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-12">
                <Users className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-900 mb-2">No Teams Found</h3>
                <p className="text-slate-600 mb-4">
                  {activeFilterCount > 0
                    ? 'No teams match your filters. Try adjusting your search criteria.'
                    : 'Get started by creating your first team'}
                </p>
                {activeFilterCount === 0 && (
                  <Button onClick={handleCreateClick}>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Team
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Create Team Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Team</DialogTitle>
            <DialogDescription>Add a new team to your organization</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="create-name">Team Name *</Label>
              <Input
                id="create-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter team name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="create-description">Description</Label>
              <Textarea
                id="create-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe the team's purpose and goals"
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="create-department">Department *</Label>
              <Select
                value={formData.department}
                onValueChange={(value) => setFormData({ ...formData, department: value })}
                disabled={currentUser?.role === 'manager'}
              >
                <SelectTrigger id="create-department">
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  {currentUser?.role === 'manager' ? (
                    // Manager sees only their department
                    (() => {
                      const userDeptId = currentUser.departments?.[0];
                      const deptId = typeof userDeptId === 'string' ? userDeptId : userDeptId?._id;
                      return departmentsList
                        .filter(dept => dept._id === deptId)
                        .map((dept) => (
                          <SelectItem key={dept._id} value={dept._id}>
                            {dept.name} ({dept.code})
                          </SelectItem>
                        ));
                    })()
                  ) : (
                    // Admin sees all departments
                    departmentsList.map((dept) => (
                      <SelectItem key={dept._id} value={dept._id}>
                        {dept.name} ({dept.code})
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {currentUser?.role === 'manager' && (
                <p className="text-xs text-slate-500">Teams can only be created in your department</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="create-leader">Team Lead (Optional)</Label>
              <Select
                value={formData.leaderId}
                onValueChange={(value) => setFormData({ ...formData, leaderId: value })}
              >
                <SelectTrigger id="create-leader">
                  <SelectValue placeholder="Select team lead" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No Team Lead</SelectItem>
                  {usersList.map((user) => (
                    <SelectItem key={user._id} value={user._id}>
                      {user.name} - {user.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="create-color">Team Color</Label>
              <div className="flex items-center gap-4">
                <Input
                  id="create-color"
                  type="color"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  className="w-24 h-10"
                />
                <span className="text-sm text-slate-600">{formData.color}</span>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={createTeam.isPending}>
              {createTeam.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Team'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Team Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Team</DialogTitle>
            <DialogDescription>Update team information</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Team Name *</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter team name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe the team's purpose and goals"
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-department">Department *</Label>
              <Select
                value={formData.department}
                onValueChange={(value) => setFormData({ ...formData, department: value })}
              >
                <SelectTrigger id="edit-department">
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  {departmentsList.map((dept) => (
                    <SelectItem key={dept._id} value={dept._id}>
                      {dept.name} ({dept.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-leader">Team Lead (Optional)</Label>
              <Select
                value={formData.leaderId}
                onValueChange={(value) => setFormData({ ...formData, leaderId: value })}
              >
                <SelectTrigger id="edit-leader">
                  <SelectValue placeholder="Select team lead" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No Team Lead</SelectItem>
                  {usersList.map((user) => (
                    <SelectItem key={user._id} value={user._id}>
                      {user.name} - {user.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-color">Team Color</Label>
              <div className="flex items-center gap-4">
                <Input
                  id="edit-color"
                  type="color"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  className="w-24 h-10"
                />
                <span className="text-sm text-slate-600">{formData.color}</span>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdate} disabled={updateTeam.isPending}>
              {updateTeam.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Team</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{selectedTeam?.name}"? This action cannot be
              undone.
              {selectedTeam && selectedTeam.memberCount > 0 && (
                <span className="block mt-2 text-red-600 font-semibold">
                  Warning: This team has {selectedTeam.memberCount} member(s). Please reassign
                  them first.
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteTeam.isPending}
            >
              {deleteTeam.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete Team'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
