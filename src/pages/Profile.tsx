import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { User, Mail, Shield, Calendar, Edit, Save, X, Lock, Award, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useBadges, useCheckBadges } from '@/hooks/useBadges';
import { useToast } from '@/hooks/use-toast';

export default function Profile() {
  const { user, updateProfile } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Fetch user's badges
  const { data: badges = [], isLoading: isLoadingBadges } = useBadges({ userId: user?.id });
  const checkBadges = useCheckBadges();

  const handleSave = () => {
    if (!user) return;

    // Validate
    if (!formData.name || formData.name.length < 2) {
      setError('Name must be at least 2 characters');
      return;
    }

    if (!formData.email || !formData.email.includes('@')) {
      setError('Please enter a valid email');
      return;
    }

    // Update profile
    const updated = updateProfile(user.id, {
      name: formData.name,
      email: formData.email,
    });

    if (updated) {
      setSuccess('Profile updated successfully!');
      setIsEditing(false);
      setTimeout(() => setSuccess(''), 3000);
    } else {
      setError('Failed to update profile');
    }
  };

  const handleCancel = () => {
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
    });
    setIsEditing(false);
    setError('');
  };

  const handleChangePassword = () => {
    setError('');

    // Validate
    if (!passwordData.currentPassword) {
      setError('Current password is required');
      return;
    }

    if (passwordData.newPassword.length < 8) {
      setError('New password must be at least 8 characters');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError("New passwords don't match");
      return;
    }

    // Change password (mock implementation)
    setSuccess('Password changed successfully!');
    setIsChangePasswordOpen(false);
    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    setTimeout(() => setSuccess(''), 3000);
  };

  const handleCheckBadges = async () => {
    try {
      const result = await checkBadges.mutateAsync(user?.id);

      if (result.newBadges && result.newBadges.length > 0) {
        toast({
          title: `${result.newBadges.length} New Badge${result.newBadges.length > 1 ? 's' : ''} Earned!`,
          description: result.newBadges.map(b => `${b.icon} ${b.title}`).join(', '),
        });
      } else {
        toast({
          title: 'No New Badges',
          description: 'Keep working on your OKRs to earn more badges!',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to check badges',
        variant: 'destructive',
      });
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'manager':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'member':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (!user) {
    return null;
  }

  return (
    <DashboardLayout
      title="My Profile"
      description="View and manage your account settings"
    >
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Success Message */}
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg">
            {success}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Profile Overview Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>Your personal details and account information</CardDescription>
              </div>
              <div className="flex gap-2">
                {!isEditing ? (
                  <>
                    <Button onClick={() => setIsEditing(true)} variant="outline" size="sm">
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Profile
                    </Button>
                    <Button onClick={() => setIsChangePasswordOpen(true)} variant="outline" size="sm">
                      <Lock className="h-4 w-4 mr-2" />
                      Change Password
                    </Button>
                  </>
                ) : (
                  <>
                    <Button onClick={handleSave} size="sm">
                      <Save className="h-4 w-4 mr-2" />
                      Save
                    </Button>
                    <Button onClick={handleCancel} variant="outline" size="sm">
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                  </>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Avatar & Basic Info */}
            <div className="flex items-center gap-6">
              <div className="h-24 w-24 rounded-full bg-blue-600 flex items-center justify-center text-white text-3xl font-bold">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-slate-900">{user.name}</h3>
                <p className="text-slate-600">{user.email}</p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge className={getRoleBadgeColor(user.role)}>
                    <Shield className="h-3 w-3 mr-1" />
                    {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                  </Badge>
                  {user.teamId && (
                    <Badge variant="outline">
                      Team: {user.teamId}
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            {/* Editable Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t">
              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="name" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Full Name
                </Label>
                {isEditing ? (
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter your name"
                  />
                ) : (
                  <p className="text-slate-900 font-medium">{user.name}</p>
                )}
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email Address
                </Label>
                {isEditing ? (
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="Enter your email"
                  />
                ) : (
                  <p className="text-slate-900 font-medium">{user.email}</p>
                )}
              </div>

              {/* Role (Read-only) */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Role
                </Label>
                <p className="text-slate-900 font-medium capitalize">{user.role}</p>
                <p className="text-xs text-slate-500">Contact admin to change role</p>
              </div>

              {/* Member Since */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Member Since
                </Label>
                <p className="text-slate-900 font-medium">
                  {new Date(user.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Badges & Achievements Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-yellow-600" />
                  Badges & Achievements
                </CardTitle>
                <CardDescription>Your earned accomplishments</CardDescription>
              </div>
              <Button
                onClick={handleCheckBadges}
                disabled={checkBadges.isPending}
                size="sm"
                variant="outline"
              >
                {checkBadges.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Checking...
                  </>
                ) : (
                  'Check for New Badges'
                )}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {isLoadingBadges ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                <span className="ml-3 text-slate-600">Loading badges...</span>
              </div>
            ) : badges.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {badges.map((badge) => (
                  <div
                    key={badge._id}
                    className="flex flex-col items-center p-4 bg-gradient-to-br from-yellow-50 to-amber-50 border-2 border-yellow-200 rounded-lg hover:shadow-md transition-all"
                  >
                    <div className="text-5xl mb-2">{badge.icon}</div>
                    <h4 className="font-semibold text-slate-900 text-sm text-center">{badge.title}</h4>
                    <p className="text-xs text-slate-600 text-center mt-1">{badge.description}</p>
                    <p className="text-xs text-slate-500 mt-2">
                      {new Date(badge.earnedAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Award className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-900 mb-2">No Badges Yet</h3>
                <p className="text-slate-600 mb-4">
                  Complete OKRs and check-in regularly to earn badges!
                </p>
                <Button onClick={handleCheckBadges} disabled={checkBadges.isPending}>
                  {checkBadges.isPending ? 'Checking...' : 'Check for Badges'}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Account Statistics Card */}
        <Card>
          <CardHeader>
            <CardTitle>Account Statistics</CardTitle>
            <CardDescription>Your activity and performance metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-4 bg-slate-50 rounded-lg">
                <p className="text-3xl font-bold text-blue-600">5</p>
                <p className="text-sm text-slate-600 mt-1">Active OKRs</p>
              </div>
              <div className="text-center p-4 bg-slate-50 rounded-lg">
                <p className="text-3xl font-bold text-green-600">12</p>
                <p className="text-sm text-slate-600 mt-1">Check-ins Completed</p>
              </div>
              <div className="text-center p-4 bg-slate-50 rounded-lg">
                <p className="text-3xl font-bold text-purple-600">78%</p>
                <p className="text-sm text-slate-600 mt-1">Avg Progress</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Change Password Dialog */}
      <Dialog open={isChangePasswordOpen} onOpenChange={setIsChangePasswordOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
            <DialogDescription>
              Enter your current password and choose a new password
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Current Password */}
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Current Password</Label>
              <Input
                id="currentPassword"
                type="password"
                value={passwordData.currentPassword}
                onChange={(e) =>
                  setPasswordData({ ...passwordData, currentPassword: e.target.value })
                }
                placeholder="Enter current password"
              />
            </div>

            {/* New Password */}
            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                type="password"
                value={passwordData.newPassword}
                onChange={(e) =>
                  setPasswordData({ ...passwordData, newPassword: e.target.value })
                }
                placeholder="Enter new password (min 8 characters)"
              />
              {passwordData.newPassword && (
                <p className={`text-xs ${
                  passwordData.newPassword.length >= 8 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {passwordData.newPassword.length >= 8
                    ? '✓ Password meets minimum length'
                    : '✗ Password must be at least 8 characters'}
                </p>
              )}
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) =>
                  setPasswordData({ ...passwordData, confirmPassword: e.target.value })
                }
                placeholder="Confirm new password"
              />
              {passwordData.confirmPassword && (
                <p className={`text-xs ${
                  passwordData.newPassword === passwordData.confirmPassword
                    ? 'text-green-600'
                    : 'text-red-600'
                }`}>
                  {passwordData.newPassword === passwordData.confirmPassword
                    ? '✓ Passwords match'
                    : '✗ Passwords do not match'}
                </p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsChangePasswordOpen(false);
                setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                setError('');
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleChangePassword}>
              Change Password
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
