import React from 'react';
import {
  Award,
  Video,
  MessageSquare,
  Clock,
  CheckCircle2,
  Calendar,
  Star,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import Button from '@/components/ui/button';
import Badge from '@/components/ui/badge';
import Avatar from '@/components/ui/avatar';
import toast from 'react-hot-toast';

// Mock data for counselor activity
const performanceData = [
  { name: 'Jan', sesi: 12 },
  { name: 'Feb', sesi: 18 },
  { name: 'Mar', sesi: 25 },
  { name: 'Apr', sesi: 22 },
  { name: 'Mei', sesi: 30 },
  { name: 'Jun', sesi: 35 },
];

export const CounselorDashboard: React.FC = () => {
  const agendaList = [
    { id: '1', time: '09:00 - 10:00 WIB', client: 'Farhan Maulana', type: 'Video Call', status: 'Mendatang', details: 'Konsultasi Kecemasan Sosial' },
    { id: '2', time: '11:00 - 12:00 WIB', client: 'Dewi Lestari', type: 'Chat Sesi', status: 'Mendatang', details: 'Bimbingan Karir & Motivasi' },
    { id: '3', time: '14:00 - 15:00 WIB', client: 'Rahmat Hidayat', type: 'Video Call', status: 'Selesai', details: 'Krisis Identitas & Masalah Keluarga' },
  ];

  return (
    <div className="space-y-6">
      {/* Overview stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-left">
        <Card className="p-5 flex items-center gap-4 bg-primary/[0.02]">
          <div className="p-3.5 rounded-2xl bg-primary/10 text-primary">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs font-medium text-muted-foreground">Sesi Diselesaikan</span>
            <h3 className="text-2xl font-bold mt-0.5">142 Sesi</h3>
          </div>
        </Card>

        <Card className="p-5 flex items-center gap-4 bg-secondary/[0.02]">
          <div className="p-3.5 rounded-2xl bg-secondary/10 text-secondary">
            <Clock className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs font-medium text-muted-foreground">Pending Booking</span>
            <h3 className="text-2xl font-bold mt-0.5">4 Permintaan</h3>
          </div>
        </Card>

        <Card className="p-5 flex items-center gap-4 bg-amber-500/[0.02]">
          <div className="p-3.5 rounded-2xl bg-amber-500/10 text-amber-500">
            <Star className="h-6 w-6 text-amber-500" />
          </div>
          <div>
            <span className="text-xs font-medium text-muted-foreground">Rating Kepuasan</span>
            <h3 className="text-2xl font-bold mt-0.5 flex items-center gap-1.5">
              <span>4.9</span>
              <span className="text-xs text-muted-foreground">(98 review)</span>
            </h3>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Performance Chart */}
        <Card className="lg:col-span-2 text-left">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-primary" />
              <span>Volume Sesi Konseling Bulanan</span>
            </CardTitle>
            <CardDescription>
              Grafik perkembangan jam sesi konseling psikologi aktif yang telah Anda pimpin sepanjang tahun ini.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={performanceData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.15} />
                  <XAxis dataKey="name" stroke="var(--color-muted-foreground)" fontSize={10} tickLine={false} />
                  <YAxis stroke="var(--color-muted-foreground)" fontSize={10} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      background: 'var(--color-card)',
                      borderColor: 'var(--color-border)',
                      borderRadius: '12px',
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="sesi"
                    stroke="var(--color-primary)"
                    strokeWidth={3}
                    dot={{ fill: 'var(--color-primary)', r: 4 }}
                    name="Total Sesi"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Schedule List */}
        <Card className="lg:col-span-1 text-left flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-secondary" />
              <span>Agenda Konseling Hari Ini</span>
            </CardTitle>
            <CardDescription>
              Daftar pertemuan konseling aktif hari ini.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 flex-1 overflow-y-auto">
            {agendaList.map((agenda) => {
              const isUpcoming = agenda.status === 'Mendatang';
              const isVideo = agenda.type === 'Video Call';
              return (
                <div
                  key={agenda.id}
                  className={`p-3 border rounded-2xl space-y-2.5 transition-colors duration-200 ${
                    isUpcoming ? 'border-border bg-card' : 'border-border/40 bg-muted/20 opacity-70'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2.5">
                      <Avatar fallback={agenda.client} size="sm" />
                      <div className="text-left">
                        <span className="text-xs font-bold block text-foreground">{agenda.client}</span>
                        <span className="text-[10px] text-muted-foreground">{agenda.time}</span>
                      </div>
                    </div>
                    <Badge variant={isUpcoming ? 'default' : 'secondary'}>{agenda.status}</Badge>
                  </div>
                  
                  <div className="text-xs text-muted-foreground italic pl-10 border-l border-muted">
                    "{agenda.details}"
                  </div>

                  {isUpcoming && (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        className="flex-1 text-xs py-1"
                        onClick={() => toast.success(`Menghubungkan ke ${agenda.type}...`)}
                        leftIcon={isVideo ? <Video className="h-3.5 w-3.5" /> : <MessageSquare className="h-3.5 w-3.5" />}
                      >
                        Mulai {agenda.type}
                      </Button>
                    </div>
                  )}
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CounselorDashboard;
