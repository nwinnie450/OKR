import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import type { UserRole } from '@/types/okr';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
  redirectTo?: string;
}

/**
 * ProtectedRoute - Wrapper for authenticated routes
 *
 * Features:
 * - Redirects to login if not authenticated
 * - Optional role-based access control
 * - Customizable redirect path
 *
 * @example
 * <ProtectedRoute allowedRoles={['admin']}>
 *   <AdminDashboard />
 * </ProtectedRoute>
 */
export function ProtectedRoute({
  children,
  allowedRoles,
  redirectTo = '/login',
}: ProtectedRouteProps) {
  const { isAuthenticated, user, hasRole, isLoading } = useAuth();

  // Wait for auth to load from localStorage
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Not authenticated - redirect to login
  if (!isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  // Authenticated but role not allowed
  if (allowedRoles && !hasRole(allowedRoles)) {
    // Redirect based on user's actual role
    const dashboardMap: Record<UserRole, string> = {
      admin: '/admin',
      manager: '/manager',
      member: '/member',
      viewer: '/member', // Viewers see member dashboard (read-only)
    };

    const userDashboard = user ? dashboardMap[user.role] : '/member';
    return <Navigate to={userDashboard} replace />;
  }

  // Authenticated and has correct role (or no role restriction)
  return <>{children}</>;
}

export default ProtectedRoute;
