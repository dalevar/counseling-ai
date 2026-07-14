import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Calendar,
  Clock,
  Video,
  MessageSquare,
  Star,
  ChevronRight,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import Button from '@/components/ui/button';
import Badge from '@/components/ui/badge';
import Avatar from '@/components/ui/avatar';
import toast from 'react-hot-toast';

const counselors = [
  { id: 'cn1', name: 'Sri Wahyuni, M.Psi.', role: 'Guru BK', school: 'SMA Negeri 1 Jakarta', rating: 4.9, sessions: 142, avatar: '', available: true },
  { id: 'cn2', name: 'Dr. Bambang Sudjatmiko', role: 'Psikolog Klinis', school: 'Universitas Indonesia', rating: 4.8, sessions: 89, avatar: '', available: false },
  { id: 'cn3', name: 'Rina Marliani, S.Psi.', role: 'Konselor Sekolah', school: 'SMA Negeri 5 Jakarta', rating: 4.7, sessions: 201, avatar: '', available: true },
];

const historyData = [
  { id: 'h1', counselor: 'Sri Wahyuni, M.Psi.', date: 'Senin, 7 Juli 2026', type: 'Video Call', duration: '45 menit', status: 'Selesai', rating: 5 },
  { id: 'h2', counselor: 'Rina Marliani, S.Psi.', date: 'Rabu, 2 Juli 2026', type: 'Chat Sesi', duration: '30 menit', status: 'Selesai', rating: 4 },
];

export const Counseling: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'booking' | 'history'>('booking');
  const [bookingId, setBookingId] = useState<string | null>(null);

  const handleBook = (name: string, id: string) => {
    setBookingId(id);
    setTimeout(() => {
      setBookingId(null);
      toast.success(`Permintaan sesi dengan ${name} berhasil dikirim! Menunggu konfirmasi.`);
    }, 1200);
  };

  const tabs = [
    { id: 'booking', label: 'Jadwalkan Sesi' },
    { id: 'history', label: 'Riwayat Konseling' },
  ] as const;

  return (
    <div className="space-y-6 text-left">
      <div>
        <h2 className="text-2xl font-black">Layanan Konseling</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Ajukan jadwal sesi konseling dengan Guru BK atau Psikolog Klinis terverifikasi.
        </p>
      </div>

      {/* Tab switcher */}
      <div className="flex border-b border-border gap-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-5 py-3 text-sm font-semibold cursor-pointer border-b-2 transition-all duration-200 ${
              activeTab === tab.id
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'booking' && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          {counselors.map((c) => (
            <Card key={c.id} className="flex flex-col sm:flex-row sm:items-center gap-4 p-5">
              <Avatar fallback={c.name} size="lg" className="shrink-0 mx-auto sm:mx-0" />
              <div className="flex-1 text-center sm:text-left">
                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                  <h3 className="font-bold text-base">{c.name}</h3>
                  <Badge variant={c.available ? 'success' : 'secondary'}>
                    {c.available ? 'Tersedia' : 'Penuh'}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">{c.role} · {c.school}</p>
                <div className="flex items-center justify-center sm:justify-start gap-3 mt-2 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" /> {c.rating}
                  </span>
                  <span>{c.sessions} sesi selesai</span>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 mt-2 sm:mt-0 shrink-0">
                <Button
                  size="sm"
                  variant="outline"
                  leftIcon={<MessageSquare className="h-4 w-4" />}
                  onClick={() => toast.success(`Membuka chat dengan ${c.name}`)}
                >
                  Chat
                </Button>
                <Button
                  size="sm"
                  disabled={!c.available}
                  isLoading={bookingId === c.id}
                  leftIcon={<Video className="h-4 w-4" />}
                  onClick={() => handleBook(c.name, c.id)}
                >
                  Booking Sesi
                </Button>
              </div>
            </Card>
          ))}
        </motion.div>
      )}

      {activeTab === 'history' && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          {historyData.map((h) => (
            <Card key={h.id} className="p-5 flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex-1 text-left">
                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                  <h3 className="font-bold text-sm">{h.counselor}</h3>
                  <Badge variant="success">{h.status}</Badge>
                </div>
                <div className="flex flex-wrap gap-3 mt-2 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> {h.date}</span>
                  <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {h.duration}</span>
                  <span className="flex items-center gap-1">
                    {h.type === 'Video Call' ? <Video className="h-3.5 w-3.5" /> : <MessageSquare className="h-3.5 w-3.5" />}
                    {h.type}
                  </span>
                </div>
                <div className="flex items-center gap-0.5 mt-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className={`h-3.5 w-3.5 ${i < h.rating ? 'text-amber-500 fill-amber-500' : 'text-muted-foreground/30'}`} />
                  ))}
                </div>
              </div>
              <Button size="sm" variant="outline" rightIcon={<ChevronRight className="h-4 w-4" />}>
                Lihat Detail
              </Button>
            </Card>
          ))}
        </motion.div>
      )}
    </div>
  );
};

export default Counseling;
