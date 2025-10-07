import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { MultiSelect } from '@/components/ui/multi-select';
import { UserPlus, Pencil, Trash2, Shield, Users as UsersIcon, Eye, Loader2, Search, Filter, X } from 'lucide-react';
import type { User, UserRole, Department } from '@/lib/api/auth';
import { useUsers, useCreateUser, useUpdateUser, useDeleteUser } from '@/hooks/useUsers';
import { useDepartments } from '@/hooks/useDepartments';
import { useTeams } from '@/hooks/useTeams';
import { useToast } from '@/hooks/use-toast';
import { getRoleDisplayName } from '@/lib/utils/roleMapping';

export default function UserManagement() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user: currentUser } = useAuth();
  const { toast } = useToast();

  // API hooks
  const { data: users, isLoading, error } = useUsers();
  const { data: departments } = useDepartments();
  const { data: teams } = useTeams();
  const createUserMutation = useCreateUser();
  const updateUserMutation = useUpdateUser();
  const deleteUserMutation = useDeleteUser();

  // Safe array for rendering
  const usersList = users || [];
  const departmentsList = departments || [];
  const teamsList = teams || [];

  // Role-based filtering: Filter users based on current user's role
  const roleBasedFilteredUsers = (() => {
    if (!currentUser) return [];

    // Admin sees all users
    if (currentUser.role === 'admin') return usersList;

    // Manager sees only users in their department
    if (currentUser.role === 'manager') {
      const userDeptId = currentUser.departments?.[0];
      if (!userDeptId) return [];
      const deptId = typeof userDeptId === 'string' ? userDeptId : userDeptId._id;
      return usersList.filter(u =>
        u.departments?.some(d =>
          (typeof d === 'string' ? d : d._id) === deptId
        )
      );
    }

    // Team lead sees only users in their team
    if (currentUser.role === 'team_lead') {
      const userTeamId = currentUser.teams?.[0];
      if (!userTeamId) return [];
      const teamId = typeof userTeamId === 'string' ? userTeamId : userTeamId._id;
      return usersList.filter(u =>
        u.teams?.some(t =>
          (typeof t === 'string' ? t : t._id) === teamId
        )
      );
    }

    return [];
  })();

  // Filtered teams based on selected departments
  const getFilteredTeams = (departmentIds: string[]) => {
    if (!departmentIds || departmentIds.length === 0) return teamsList;
    return teamsList.filter(team => {
      const teamDeptId = typeof team.department === 'object' ? team.department._id : team.department;
      return departmentIds.includes(teamDeptId);
    });
  };

  // Dialog states
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'member' as UserRole,
    departments: [] as string[],
    teams: [] as string[],
    password: '',
  });

  // Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const [teamFilter, setTeamFilter] = useState<string>('all');

  // Apply team filter from URL query parameter on mount
  useEffect(() => {
    const teamParam = searchParams.get('team');
    if (teamParam) {
      setTeamFilter(teamParam);
    }
  }, [searchParams]);

  // Filtered users based on all filters (applies on top of role-based filtering)
  const filteredUsers = roleBasedFilteredUsers.filter(user => {
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      if (
        !user.name.toLowerCase().includes(query) &&
        !user.email.toLowerCase().includes(query)
      ) {
        return false;
      }
    }

    // Role filter
    if (roleFilter !== 'all' && user.role !== roleFilter) {
      return false;
    }

    // Department filter
    if (departmentFilter !== 'all') {
      const userDepts = user.departments?.map(dept =>
        typeof dept === 'object' ? dept._id : dept
      ) || [];
      if (!userDepts.includes(departmentFilter)) {
        return false;
      }
    }

    // Team filter
    if (teamFilter !== 'all') {
      const userTeams = user.teams?.map(team =>
        typeof team === 'object' ? team._id : team
      ) || [];
      if (!userTeams.includes(teamFilter)) {
        return false;
      }
    }

    return true;
  });

  // Clear all filters
  const clearFilters = () => {
    setSearchQuery('');
    setRoleFilter('all');
    setDepartmentFilter('all');
    setTeamFilter('all');
  };

  // Count active filters
  const activeFilterCount = [
    searchQuery,
    roleFilter !== 'all',
    departmentFilter !== 'all',
    teamFilter !== 'all',
  ].filter(Boolean).length;

  const handleAddUser = () => {
    setFormData({
      name: '',
      email: '',
      role: 'member',
      departments: [],
      teams: [],
      password: '',
    });
    setIsAddDialogOpen(true);
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);

    // Extract department IDs
    const departmentIds = user.departments?.map(dept =>
      typeof dept === 'object' ? dept._id : dept
    ) || [];

    // Extract team IDs
    const teamIds = user.teams?.map(team =>
      typeof team === 'object' ? team._id : team
    ) || [];

    setFormData({
      name: user.name,
      email: user.email,
      role: user.role,
      departments: departmentIds,
      teams: teamIds,
      password: '', // Don't show password in edit
    });
    setIsEditDialogOpen(true);
  };

  const handleDeleteUser = (user: User) => {
    setSelectedUser(user);
    setIsDeleteDialogOpen(true);
  };

  const confirmAddUser = async () => {
    try {
      await createUserMutation.mutateAsync({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        departments: formData.departments,
        teams: formData.teams,
      });

      toast({
        title: 'Success',
        description: 'User created successfully',
      });
      setIsAddDialogOpen(false);
      setFormData({
        name: '',
        email: '',
        role: 'member',
        departments: [],
        teams: [],
        password: '',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create user',
        variant: 'destructive',
      });
    }
  };

  const confirmEditUser = async () => {
    if (!selectedUser) return;

    try {
      await updateUserMutation.mutateAsync({
        id: selectedUser._id,
        data: {
          name: formData.name,
          email: formData.email,
          role: formData.role,
          departments: formData.departments,
          teams: formData.teams,
        },
      });

      toast({
        title: 'Success',
        description: 'User updated successfully',
      });
      setIsEditDialogOpen(false);
      setSelectedUser(null);
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update user',
        variant: 'destructive',
      });
    }
  };

  const confirmDeleteUser = async () => {
    if (!selectedUser) return;

    try {
      await deleteUserMutation.mutateAsync(selectedUser._id);

      toast({
        title: 'Success',
        description: 'User deleted successfully',
      });
      setIsDeleteDialogOpen(false);
      setSelectedUser(null);
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to delete user',
        variant: 'destructive',
      });
    }
  };

  const getRoleBadgeColor = (role: UserRole) => {
    const colors: Record<UserRole, string> = {
      admin: 'bg-red-100 text-red-800',
      pm: 'bg-purple-100 text-purple-800',
      ba: 'bg-indigo-100 text-indigo-800',
      dev: 'bg-blue-100 text-blue-800',
      qa: 'bg-cyan-100 text-cyan-800',
      support: 'bg-green-100 text-green-800',
      hr: 'bg-pink-100 text-pink-800',
      finance: 'bg-yellow-100 text-yellow-800',
      manager: 'bg-orange-100 text-orange-800',
      member: 'bg-gray-100 text-gray-800',
    };
    return colors[role];
  };

  const formatDate = (date: Date | string) => {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Show loading state
  if (isLoading) {
    return (
      <DashboardLayout
        title="User Management"
        description="Manage user accounts, roles, and permissions"
      >
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </CardContent>
        </Card>
      </DashboardLayout>
    );
  }

  // Show error state
  if (error) {
    return (
      <DashboardLayout
        title="User Management"
        description="Manage user accounts, roles, and permissions"
      >
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <p className="text-red-600">Error loading users: {error.message}</p>
            </div>
          </CardContent>
        </Card>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title="User Management"
      description="Manage user accounts, roles, and permissions"
    >
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <UsersIcon className="h-5 w-5" />
                All Users ({filteredUsers.length})
                {activeFilterCount > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {activeFilterCount} filter{activeFilterCount > 1 ? 's' : ''} active
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>
                View and manage all user accounts in the system
              </CardDescription>
            </div>
            {/* Hide Add User button for team_lead (read-only access) */}
            {currentUser?.role !== 'team_lead' && (
              <Button onClick={handleAddUser} className="gap-2">
                <UserPlus className="h-4 w-4" />
                Add User
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {/* Filter Section */}
          <div className="mb-6 space-y-4">
            <div className="flex flex-wrap gap-3">
              {/* Search */}
              <div className="flex-1 min-w-[250px] max-w-sm">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name or email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>

              {/* Role Filter */}
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="All Roles" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="pm">Product Manager</SelectItem>
                  <SelectItem value="ba">Business Analyst</SelectItem>
                  <SelectItem value="dev">Developer</SelectItem>
                  <SelectItem value="qa">QA</SelectItem>
                  <SelectItem value="support">Support</SelectItem>
                  <SelectItem value="hr">HR</SelectItem>
                  <SelectItem value="finance">Finance</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="member">Member</SelectItem>
                </SelectContent>
              </Select>

              {/* Department Filter */}
              <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                <SelectTrigger className="w-[200px]">
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

              {/* Team Filter */}
              <Select value={teamFilter} onValueChange={setTeamFilter}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="All Teams" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Teams</SelectItem>
                  {teamsList.map((team) => (
                    <SelectItem key={team._id} value={team._id}>
                      {team.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Clear Filters Button */}
              {activeFilterCount > 0 && (
                <Button variant="outline" onClick={clearFilters} className="gap-2">
                  <X className="h-4 w-4" />
                  Clear Filters
                </Button>
              )}
            </div>
          </div>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Team</TableHead>
                  <TableHead>Created Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                      {searchQuery || activeFilterCount > 0
                        ? 'No users match your filters'
                        : 'No users found. Click "Add User" to create one.'}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => (
                    <TableRow key={user._id}>
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${getRoleBadgeColor(
                              user.role
                            )}`}
                          >
                            <Shield className="h-3 w-3 mr-1" />
                            {getRoleDisplayName(user.role)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {user.departments && user.departments.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {user.departments.map((dept, index) => (
                              <span key={index} className="inline-flex items-center px-2 py-0.5 rounded-md text-xs bg-blue-100 text-blue-800">
                                {typeof dept === 'object' ? dept.name : dept}
                              </span>
                            ))}
                          </div>
                        ) : (
                          '-'
                        )}
                      </TableCell>
                      <TableCell>
                        {user.teams && user.teams.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {user.teams.map((team, index) => (
                              <span key={index} className="inline-flex items-center px-2 py-0.5 rounded-md text-xs bg-green-100 text-green-800">
                                {typeof team === 'object' ? team.name : team}
                              </span>
                            ))}
                          </div>
                        ) : (
                          '-'
                        )}
                      </TableCell>
                      <TableCell>{formatDate(user.createdAt)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate(`/users/${user._id}/okrs`)}
                            className="h-8 w-8 p-0"
                            title="View OKRs"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {/* Hide Edit/Delete for team_lead (read-only access) */}
                          {currentUser?.role !== 'team_lead' && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditUser(user)}
                                className="h-8 w-8 p-0"
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteUser(user)}
                                className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                                disabled={user._id === currentUser?.id}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Add User Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New User</DialogTitle>
            <DialogDescription>
              Create a new user account with role and team assignment.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4 overflow-visible">
            <div className="grid gap-2">
              <Label htmlFor="add-name">Name</Label>
              <Input
                id="add-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="John Doe"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="add-email">Email</Label>
              <Input
                id="add-email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="john@company.com"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="add-password">Password</Label>
              <Input
                id="add-password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Enter password"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="add-role">Role</Label>
              <Select
                value={formData.role}
                onValueChange={(value) => setFormData({ ...formData, role: value as UserRole })}
              >
                <SelectTrigger id="add-role">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Administrator</SelectItem>
                  <SelectItem value="pm">Product Manager</SelectItem>
                  <SelectItem value="ba">Business Analyst</SelectItem>
                  <SelectItem value="dev">Developer</SelectItem>
                  <SelectItem value="qa">QA Engineer</SelectItem>
                  <SelectItem value="support">Support Specialist</SelectItem>
                  <SelectItem value="hr">HR Specialist</SelectItem>
                  <SelectItem value="finance">Finance Specialist</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="member">Member</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="add-department">Departments (Optional)</Label>
              <MultiSelect
                options={departmentsList.map(dept => ({
                  value: dept._id,
                  label: `${dept.name} (${dept.code})`
                }))}
                selected={formData.departments}
                onChange={(selected) => {
                  // Filter out teams that are not in the selected departments
                  const validTeams = formData.teams.filter(teamId => {
                    const team = teamsList.find(t => t._id === teamId);
                    const teamDeptId = typeof team?.department === 'object' ? team.department._id : team?.department;
                    return selected.includes(teamDeptId);
                  });
                  setFormData({ ...formData, departments: selected, teams: validTeams });
                }}
                placeholder="Select departments"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="add-team">Teams (Optional)</Label>
              <MultiSelect
                options={getFilteredTeams(formData.departments).map(team => ({
                  value: team._id,
                  label: team.name
                }))}
                selected={formData.teams}
                onChange={(selected) => setFormData({ ...formData, teams: selected })}
                placeholder={formData.departments.length > 0 ? "Select teams" : "Select departments first"}
                disabled={formData.departments.length === 0}
              />
              {formData.departments.length > 0 && getFilteredTeams(formData.departments).length === 0 && (
                <p className="text-xs text-muted-foreground">
                  No teams in selected departments yet
                </p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={confirmAddUser}
              disabled={!formData.name || !formData.email || !formData.password || createUserMutation.isPending}
            >
              {createUserMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Add User'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Update user information, role, and team assignment. Password changes must be done separately.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-name">Name</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-email">Email</Label>
              <Input
                id="edit-email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-role">Role</Label>
              <Select
                value={formData.role}
                onValueChange={(value) => setFormData({ ...formData, role: value as UserRole })}
              >
                <SelectTrigger id="edit-role">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Administrator</SelectItem>
                  <SelectItem value="pm">Product Manager</SelectItem>
                  <SelectItem value="ba">Business Analyst</SelectItem>
                  <SelectItem value="dev">Developer</SelectItem>
                  <SelectItem value="qa">QA Engineer</SelectItem>
                  <SelectItem value="support">Support Specialist</SelectItem>
                  <SelectItem value="hr">HR Specialist</SelectItem>
                  <SelectItem value="finance">Finance Specialist</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="member">Member</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-department">Departments (Optional)</Label>
              <MultiSelect
                options={departmentsList.map(dept => ({
                  value: dept._id,
                  label: `${dept.name} (${dept.code})`
                }))}
                selected={formData.departments}
                onChange={(selected) => {
                  // Filter out teams that are not in the selected departments
                  const validTeams = formData.teams.filter(teamId => {
                    const team = teamsList.find(t => t._id === teamId);
                    const teamDeptId = typeof team?.department === 'object' ? team.department._id : team?.department;
                    return selected.includes(teamDeptId);
                  });
                  setFormData({ ...formData, departments: selected, teams: validTeams });
                }}
                placeholder="Select departments"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-team">Teams (Optional)</Label>
              <MultiSelect
                options={getFilteredTeams(formData.departments).map(team => ({
                  value: team._id,
                  label: team.name
                }))}
                selected={formData.teams}
                onChange={(selected) => setFormData({ ...formData, teams: selected })}
                placeholder={formData.departments.length > 0 ? "Select teams" : "Select departments first"}
                disabled={formData.departments.length === 0}
              />
              {formData.departments.length > 0 && getFilteredTeams(formData.departments).length === 0 && (
                <p className="text-xs text-muted-foreground">
                  No teams in selected departments yet
                </p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={confirmEditUser}
              disabled={!formData.name || !formData.email || updateUserMutation.isPending}
            >
              {updateUserMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the user account for{' '}
              <span className="font-semibold">{selectedUser?.name}</span>.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteUser}
              disabled={deleteUserMutation.isPending}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleteUserMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete User'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}
