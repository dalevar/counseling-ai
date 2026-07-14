import React from 'react';
import { useNavigate } from 'react-router-dom';
import { HelpCircle, ArrowLeft, Home } from 'lucide-react';
import { Card } from '@/components/ui/card';
import Button from '@/components/ui/button';

export const NotFound: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-center min-h-[80vh] px-4 text-left">
      <Card className="max-w-md w-full p-6 text-center space-y-5">
        <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto">
          <HelpCircle className="h-8 w-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-black">Halaman Tidak Ditemukan (404)</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Halaman yang Anda cari tidak dapat ditemukan. Alamat tautan mungkin salah, dipindahkan, atau telah dihapus oleh tim administrator.
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
          <Button className="flex-1" leftIcon={<Home className="h-4 w-4" />} onClick={() => navigate('/')}>
            Beranda
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default NotFound;
