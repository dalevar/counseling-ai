import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldOff, ArrowLeft } from 'lucide-react';
import { Card } from '@/components/ui/card';
import Button from '@/components/ui/button';
import { useAppSelector } from '@/hooks/store';

export const Forbidden: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.auth);

  return (
    <div className="flex items-center justify-center min-h-[80vh] px-4 text-left">
      <Card className="max-w-md w-full p-6 text-center space-y-5">
        <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto">
          <ShieldOff className="h-8 w-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-black">Akses Ditolak (403)</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Maaf, akun Anda ({user?.email}) tidak memiliki hak akses atau izin yang memadai untuk membuka halaman ini. Hubungi administrator sekolah jika Anda memerlukan bantuan.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="flex-1"
            leftIcon={<ArrowLeft className="h-4 w-4" />}
            onClick={() => navigate(-1)}
          >
            Kembali
          </Button>
          <Button className="flex-1" onClick={() => navigate(`/dashboard/${user?.role || 'student'}`)}>
            Ke Dashboard
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default Forbidden;
