import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '@/hooks/store';
import Spinner from '@/components/ui/spinner';

export const DashboardRedirect: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (!isAuthenticated || !user) {
      navigate('/login', { replace: true });
    } else {
      // Map user role safely to the corresponding dashboard path
      const rolePathMap: Record<string, string> = {
        admin: 'admin',
        teacher: 'teacher',
        counselor: 'counselor',
        student: 'student',
        parent: 'parent',
      };
      const dashboardPath = rolePathMap[user.role.toLowerCase()] || 'student';
      navigate(`/dashboard/${dashboardPath}`, { replace: true });
    }
  }, [user, isAuthenticated, navigate]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
      <Spinner size="lg" />
      <p className="text-sm text-muted-foreground font-semibold">Mengalihkan ke dashboard Anda...</p>
    </div>
  );
};

export default DashboardRedirect;
