import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Calendar, MessageSquare, AlertTriangle, CheckCircle2, BellOff, Trash2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import Button from '@/components/ui/button';
import Badge from '@/components/ui/badge';
import toast from 'react-hot-toast';

type NotifType = 'session' | 'message' | 'assessment' | 'system';

interface Notif {
  id: string;
  type: NotifType;
  title: string;
  body: string;
  time: string;
  isRead: boolean;
}

const initialNotifs: Notif[] = [
  { id: 'n1', type: 'session', title: 'Sesi Konseling Dikonfirmasi', body: 'Sesi Anda dengan Sri Wahyuni, M.Psi. pada Kamis, 17 Juli 2026 pukul 10:00 WIB telah dikonfirmasi.', time: '5 menit lalu', isRead: false },
  { id: 'n2', type: 'message', title: 'Pesan dari Guru BK', body: 'Sri Wahyuni mengirimkan Anda ringkasan dari sesi terakhir dan beberapa rekomendasi kegiatan.', time: '2 jam lalu', isRead: false },
  { id: 'n3', type: 'assessment', title: 'Pengingat: Asesmen Mingguan', body: 'Sudah waktunya mengisi kuesioner PHQ-9 mingguan Anda. Hanya butuh 5 menit!', time: '1 hari lalu', isRead: true },
  { id: 'n4', type: 'system', title: 'Selamat Datang di EduCouns AI!', body: 'Akun Anda telah berhasil diverifikasi. Jelajahi fitur-fitur unggulan yang tersedia untukmu.', time: '3 hari lalu', isRead: true },
];

const iconMap: Record<NotifType, React.ReactNode> = {
  session: <Calendar className="h-5 w-5 text-primary" />,
  message: <MessageSquare className="h-5 w-5 text-blue-500" />,
  assessment: <AlertTriangle className="h-5 w-5 text-amber-500" />,
  system: <CheckCircle2 className="h-5 w-5 text-emerald-500" />,
};

const bgMap: Record<NotifType, string> = {
  session: 'bg-primary/10',
  message: 'bg-blue-500/10',
  assessment: 'bg-amber-500/10',
  system: 'bg-emerald-500/10',
};

export const Notifications: React.FC = () => {
  const [notifs, setNotifs] = useState<Notif[]>(initialNotifs);
  const [muteAll, setMuteAll] = useState(false);

  const unreadCount = notifs.filter((n) => !n.isRead).length;

  const markAllRead = () => setNotifs((prev) => prev.map((n) => ({ ...n, isRead: true })));

  const dismiss = (id: string) => {
    setNotifs((prev) => prev.filter((n) => n.id !== id));
    toast.success('Notifikasi dihapus.');
  };

  const markRead = (id: string) => {
    setNotifs((prev) => prev.map((n) => n.id === id ? { ...n, isRead: true } : n));
  };

  const toggleMute = () => {
    setMuteAll((prev) => !prev);
    toast.success(muteAll ? 'Notifikasi diaktifkan kembali.' : 'Semua notifikasi dinonaktifkan.');
  };

  return (
    <div className="space-y-6 text-left">
      <div className="flex flex-col sm:flex-row sm:items-end gap-4 justify-between">
        <div>
          <h2 className="text-2xl font-black flex items-center gap-2">
            Notifikasi
            {unreadCount > 0 && (
              <Badge variant="destructive" className="text-[11px] h-5 px-2 rounded-full">{unreadCount}</Badge>
            )}
          </h2>
          <p className="text-sm text-muted-foreground mt-1">Pusat pemberitahuan sesi, pesan, dan pengingat penting Anda.</p>
        </div>
        <div className="flex gap-2">
          {unreadCount > 0 && (
            <Button variant="outline" size="sm" onClick={markAllRead}>Tandai Semua Dibaca</Button>
          )}
          <Button
            variant={muteAll ? 'default' : 'outline'}
            size="sm"
            leftIcon={<BellOff className="h-4 w-4" />}
            onClick={toggleMute}
          >
            {muteAll ? 'Aktifkan Notif' : 'Nonaktifkan'}
          </Button>
        </div>
      </div>

      <div className="space-y-3">
        <AnimatePresence initial={false}>
          {notifs.map((n) => (
            <motion.div
              key={n.id}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 16, height: 0, marginBottom: 0 }}
              transition={{ duration: 0.25 }}
            >
              <Card
                onClick={() => markRead(n.id)}
                className={`flex items-start gap-4 p-4 cursor-pointer transition-all duration-200 ${
                  !n.isRead ? 'border-primary/40 bg-primary/[0.03]' : ''
                }`}
              >
                <div className={`w-10 h-10 rounded-2xl shrink-0 flex items-center justify-center ${bgMap[n.type]}`}>
                  {iconMap[n.type]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className={`text-sm font-bold leading-snug ${n.isRead ? 'font-semibold text-foreground/70' : ''}`}>{n.title}</h3>
                    {!n.isRead && <div className="w-2 h-2 rounded-full bg-primary shrink-0 mt-1.5" />}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{n.body}</p>
                  <p className="text-[10px] text-muted-foreground/60 mt-1.5">{n.time}</p>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); dismiss(n.id); }}
                  className="p-1.5 rounded-xl cursor-pointer text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all duration-200 shrink-0"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>

        {notifs.length === 0 && (
          <div className="py-16 text-center space-y-2">
            <Bell className="h-10 w-10 mx-auto text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground">Tidak ada notifikasi saat ini.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;
