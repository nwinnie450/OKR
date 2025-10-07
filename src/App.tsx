import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import Login from '@/pages/Login';
import AdminDashboard from '@/pages/AdminDashboard';
import ManagerDashboard from '@/pages/ManagerDashboard';
import MemberDashboard from '@/pages/MemberDashboard';
import UserManagement from '@/pages/UserManagement';
import DepartmentManagement from '@/pages/DepartmentManagement';
import ReportDashboard from '@/pages/ReportDashboard';
import TeamManagement from '@/pages/TeamManagement';
import ActivityLog from '@/pages/ActivityLog';
import UserOKRView from '@/pages/UserOKRView';
import TeamOKRView from '@/pages/TeamOKRView';
import OKRCreation from '@/pages/OKRCreation';
import OKRList from '@/pages/OKRList';
import OKRDetail from '@/pages/OKRDetail';
import CheckInFlow from '@/pages/checkin/CheckInFlow';
import Profile from '@/pages/Profile';

function RoleBasedRedirect() {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Redirect authenticated users to their role-based dashboard
  const dashboardMap = {
    admin: '/admin',
    manager: '/manager',
    team_lead: '/member',
    member: '/member',
    viewer: '/member',
  };

  const userDashboard = user ? dashboardMap[user.role] : '/member';
  return <Navigate to={userDashboard} replace />;
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-background">
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />

            {/* Root - Redirect to role-based dashboard */}
            <Route path="/" element={<RoleBasedRedirect />} />

            {/* Protected Admin Routes */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/users"
              element={
                <ProtectedRoute allowedRoles={['admin', 'manager', 'team_lead']}>
                  <UserManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/departments"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <DepartmentManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/reports"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <ReportDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/teams"
              element={
                <ProtectedRoute allowedRoles={['admin', 'manager']}>
                  <TeamManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/activity"
              element={
                <ProtectedRoute allowedRoles={['admin', 'manager', 'team_lead']}>
                  <ActivityLog />
                </ProtectedRoute>
              }
            />
            <Route
              path="/users/:userId/okrs"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <UserOKRView />
                </ProtectedRoute>
              }
            />
            <Route
              path="/teams/:teamId/okrs"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <TeamOKRView />
                </ProtectedRoute>
              }
            />

            {/* Protected Manager Routes */}
            <Route
              path="/manager"
              element={
                <ProtectedRoute allowedRoles={['admin', 'manager']}>
                  <ManagerDashboard />
                </ProtectedRoute>
              }
            />

            {/* Protected Member Routes */}
            <Route
              path="/member"
              element={
                <ProtectedRoute allowedRoles={['admin', 'manager', 'member', 'viewer']}>
                  <MemberDashboard />
                </ProtectedRoute>
              }
            />

            {/* Other Protected Routes */}
            <Route
              path="/okrs"
              element={
                <ProtectedRoute allowedRoles={['admin', 'manager', 'member', 'viewer']}>
                  <OKRList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/okr/new"
              element={
                <ProtectedRoute allowedRoles={['admin', 'manager', 'member']}>
                  <OKRCreation />
                </ProtectedRoute>
              }
            />
            <Route
              path="/okr/:id"
              element={
                <ProtectedRoute allowedRoles={['admin', 'manager', 'member', 'viewer']}>
                  <OKRDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path="/checkin"
              element={
                <ProtectedRoute allowedRoles={['admin', 'manager', 'member']}>
                  <CheckInFlow />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute allowedRoles={['admin', 'manager', 'member', 'viewer']}>
                  <Profile />
                </ProtectedRoute>
              }
            />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
