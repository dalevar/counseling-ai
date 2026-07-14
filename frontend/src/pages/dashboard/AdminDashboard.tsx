import React, { useState } from 'react';
import {
  Users,
  ShieldCheck,
  Server,
  Activity,
  UserCheck,
  CheckCircle,
  XCircle,
  Database,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import Button from '@/components/ui/button';
import Badge from '@/components/ui/badge';
import toast from 'react-hot-toast';

// Mock system server performance stats
const serverStats = [
  { name: '12:00', cpu: 22, ram: 45 },
  { name: '13:00', cpu: 35, ram: 48 },
  { name: '14:00', cpu: 55, ram: 50 },
  { name: '15:00', cpu: 28, ram: 44 },
  { name: '16:00', cpu: 42, ram: 47 },
  { name: '17:00', cpu: 30, ram: 45 },
];

export const AdminDashboard: React.FC = () => {
  const [approvingId, setApprovingId] = useState<string | null>(null);

  const verificationQueue = [
    { id: '1', name: 'Dr. Diana Putri, M.Psi.', license: 'SIPP: 12948-2024', email: 'diana.putri@counselor.id' },
    { id: '2', name: 'Bambang Sudjatmiko, S.Psi.', license: 'SIPP: 38402-2025', email: 'bambang.s@counselor.id' },
  ];

  const systemLogs = [
    { time: '17:42:01', event: 'Database Backup Completed', status: 'Success' },
    { time: '17:35:12', event: 'New Counselor SIPP Verified', status: 'Success' },
    { time: '17:20:45', event: 'API Endpoints Health Check', status: 'Success' },
  ];

  const handleVerify = (id: string, name: string) => {
    setApprovingId(id);
    setTimeout(() => {
      toast.success(`Akun Konselor ${name} berhasil diverifikasi!`);
      setApprovingId(null);
    }, 1000);
  };

  return (
    <div className="space-y-6">
      {/* Platform Counters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-left">
        <Card className="p-4 flex items-center gap-4 bg-primary/[0.02]">
          <div className="p-3.5 rounded-2xl bg-primary/10 text-primary">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs font-medium text-muted-foreground">Total Siswa</span>
            <h3 className="text-2xl font-bold mt-0.5">1,248 Siswa</h3>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-4 bg-secondary/[0.02]">
          <div className="p-3.5 rounded-2xl bg-secondary/10 text-secondary">
            <UserCheck className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs font-medium text-muted-foreground">Konselor Terverifikasi</span>
            <h3 className="text-2xl font-bold mt-0.5">32 Konselor</h3>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-4 bg-emerald-500/[0.02]">
          <div className="p-3.5 rounded-2xl bg-emerald-500/10 text-emerald-500">
            <Database className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs font-medium text-muted-foreground">Sekolah Terafiliasi</span>
            <h3 className="text-2xl font-bold mt-0.5">14 Sekolah</h3>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-4 bg-indigo-500/[0.02]">
          <div className="p-3.5 rounded-2xl bg-indigo-500/10 text-indigo-500">
            <Activity className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs font-medium text-muted-foreground">Aktif 24 Jam Terakhir</span>
            <h3 className="text-2xl font-bold mt-0.5">412 User</h3>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* System Monitoring Chart */}
        <Card className="lg:col-span-2 text-left">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Server className="h-5 w-5 text-primary" />
                <span>Beban Server & API Latency</span>
              </CardTitle>
              <CardDescription>
                Visualisasi beban utilisasi CPU & RAM backend aplikasi real-time.
              </CardDescription>
            </div>
            <Badge variant="success">Sistem Sehat</Badge>
          </CardHeader>
          <CardContent>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={serverStats} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorCpu" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorRam" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-secondary)" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="var(--color-secondary)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
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
                  <Area
                    type="monotone"
                    dataKey="cpu"
                    stroke="var(--color-primary)"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorCpu)"
                    name="CPU (%)"
                  />
                  <Area
                    type="monotone"
                    dataKey="ram"
                    stroke="var(--color-secondary)"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorRam)"
                    name="RAM (%)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* System audit log */}
        <Card className="lg:col-span-1 text-left flex flex-col justify-between">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-secondary" />
              <span>Log Audit Sistem</span>
            </CardTitle>
            <CardDescription>
              Aktivitas server background terbaru.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 flex-1">
            {systemLogs.map((log, idx) => (
              <div key={idx} className="p-3 border border-border bg-muted/20 rounded-2xl flex items-center justify-between text-xs">
                <div className="text-left space-y-0.5">
                  <span className="font-semibold text-foreground block">{log.event}</span>
                  <span className="text-[10px] text-muted-foreground block">{log.time}</span>
                </div>
                <Badge variant="success">{log.status}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Counselor verification queue table */}
      <Card className="text-left">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary" />
            <span>Antrean Verifikasi Lisensi Konselor</span>
          </CardTitle>
          <CardDescription>
            Validasi berkas Surat Izin Praktik Psikologi (SIPP) konselor eksternal baru sebelum diizinkan melayani siswa.
          </CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          {verificationQueue.length > 0 ? (
            <table className="w-full text-sm border-collapse min-w-[500px]">
              <thead>
                <tr className="border-b border-border text-muted-foreground text-left">
                  <th className="pb-3 font-semibold">Nama Lengkap</th>
                  <th className="pb-3 font-semibold">Nomor SIPP / Lisensi</th>
                  <th className="pb-3 font-semibold">Email</th>
                  <th className="pb-3 font-semibold text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {verificationQueue.map((couns) => (
                  <tr key={couns.id} className="hover:bg-muted/30">
                    <td className="py-4 font-bold">{couns.name}</td>
                    <td className="py-4 font-semibold text-primary">{couns.license}</td>
                    <td className="py-4 text-muted-foreground">{couns.email}</td>
                    <td className="py-4 text-right">
                      <div className="inline-flex gap-2">
                        <Button
                          size="sm"
                          isLoading={approvingId === couns.id}
                          onClick={() => handleVerify(couns.id, couns.name)}
                          leftIcon={<CheckCircle className="h-3.5 w-3.5" />}
                          className="bg-emerald-500 hover:bg-emerald-600 shadow-none h-8 text-xs py-1"
                        >
                          Verifikasi
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => toast.error('Dokumen ditolak.')}
                          leftIcon={<XCircle className="h-3.5 w-3.5" />}
                          className="border-destructive hover:bg-destructive/10 text-destructive h-8 text-xs py-1"
                        >
                          Tolak
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="py-8 text-center text-muted-foreground">Tidak ada antrean verifikasi.</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;
