import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAppSelector } from '@/hooks/store';

interface ProtectedRouteProps {
  children: React.ReactNode;
  /** Roles allowed to access this route. If empty, any authenticated user may access. */
  allowedRoles?: string[];
}

/**
 * ProtectedRoute — wraps any route that requires authentication (and optionally specific roles).
 *
 * Behaviour:
 *  - Not authenticated → redirect to /login (saves the attempted path in state)
 *  - Authenticated but wrong role → redirect to /forbidden
 *  - Authenticated + correct role → render children
 */
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles = [] }) => {
  const location = useLocation();
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);

  // 1. Not authenticated at all — send to login
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 2. Authenticated but no required-role match — send to forbidden
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role.toLowerCase())) {
    return <Navigate to="/forbidden" replace />;
  }

  // 3. All checks passed — render page
  return <>{children}</>;
};

export default ProtectedRoute;
