import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { Card } from '@/components/ui/card';
import Button from '@/components/ui/button';

export const Unauthorized: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-center min-h-[80vh] px-4 text-left">
      <Card className="max-w-md w-full p-6 text-center space-y-5">
        <div className="w-14 h-14 rounded-2xl bg-destructive/10 text-destructive flex items-center justify-center mx-auto animate-bounce">
          <ShieldAlert className="h-8 w-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-black">Akses Tidak Sah (401)</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Anda belum masuk ke dalam sesi aktif, atau sesi autentikasi Anda telah kedaluwarsa. Silakan masuk terlebih dahulu untuk mengakses menu ini.
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
          <Button className="flex-1" onClick={() => navigate('/login')}>
            Masuk Sesi
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default Unauthorized;
