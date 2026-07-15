import React from "react";
import { motion } from "framer-motion";
import {
  Activity,
  Server,
  Database,
  Cpu,
  Wifi,
  Users,
  MessageSquare,
  FileText,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import Badge from "@/components/ui/badge";

const trafficData = [
  { name: "Sen", requests: 1240, errors: 12 },
  { name: "Sel", requests: 980, errors: 8 },
  { name: "Rab", requests: 1550, errors: 15 },
  { name: "Kam", requests: 2100, errors: 9 },
  { name: "Jum", requests: 1800, errors: 6 },
  { name: "Sab", requests: 900, errors: 4 },
  { name: "Min", requests: 620, errors: 3 },
];

const performanceData = [
  { name: "08:00", cpu: 18, ram: 42 },
  { name: "10:00", cpu: 35, ram: 47 },
  { name: "12:00", cpu: 62, ram: 55 },
  { name: "14:00", cpu: 45, ram: 52 },
  { name: "16:00", cpu: 55, ram: 58 },
  { name: "18:00", cpu: 30, ram: 49 },
  { name: "20:00", cpu: 22, ram: 44 },
];

const systemLogs = [
  { time: "21:15:34", event: "Backup database selesai", level: "success" },
  {
    time: "21:08:12",
    event: "SIPP Konselor baru diverifikasi",
    level: "success",
  },
  { time: "20:55:01", event: "Health check API endpoints", level: "success" },
  {
    time: "20:43:27",
    event: "Percobaan login gagal (5x) dari IP 103.x.x.x",
    level: "warning",
  },
  {
    time: "20:30:00",
    event: "Scheduled cache cleanup berjalan",
    level: "success",
  },
  { time: "19:58:44", event: "WebSocket reconnect timeout", level: "warning" },
];

const metricCards = [
  {
    label: "Total Pengguna Aktif",
    value: "1,842",
    delta: "+12 hari ini",
    icon: <Users className="h-5 w-5" />,
    color: "text-primary",
    bg: "bg-primary/10",
  },
  {
    label: "Sesi Chat AI",
    value: "3,290",
    delta: "+248 hari ini",
    icon: <MessageSquare className="h-5 w-5" />,
    color: "text-blue-500",
    bg: "bg-blue-500/10",
  },
  {
    label: "Artikel Diterbitkan",
    value: "127",
    delta: "+3 pekan ini",
    icon: <FileText className="h-5 w-5" />,
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
  },
  {
    label: "Uptime Server",
    value: "99.98%",
    delta: "30 hari terakhir",
    icon: <Server className="h-5 w-5" />,
    color: "text-amber-500",
    bg: "bg-amber-500/10",
  },
];

const serverStatus = [
  { name: "API Server", status: "Operational", latency: "12ms" },
  { name: "Database (PostgreSQL)", status: "Operational", latency: "4ms" },
  { name: "AI Model (Gemini)", status: "Operational", latency: "340ms" },
  { name: "WebSocket Gateway", status: "Operational", latency: "8ms" },
  { name: "Object Storage", status: "Operational", latency: "22ms" },
];

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0 },
};

export const SystemStats: React.FC = () => {
  return (
    <div className="space-y-6 text-left">
      <div>
        <h2 className="text-2xl font-black">Statistik & Monitor Sistem</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Pantau performa server, trafik API, dan kondisi layanan secara
          real-time.
        </p>
      </div>

      {/* Metric Cards */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {metricCards.map((m) => (
          <motion.div key={m.label} variants={itemVariants}>
            <Card className="p-4 flex flex-col gap-3 h-full">
              <div
                className={`w-10 h-10 rounded-2xl flex items-center justify-center ${m.bg} ${m.color}`}
              >
                {m.icon}
              </div>
              <div>
                <p className="text-2xl font-black">{m.value}</p>
                <p className="text-xs text-muted-foreground">{m.label}</p>
                <p className="text-[11px] text-emerald-500 font-medium mt-0.5">
                  {m.delta}
                </p>
              </div>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Traffic chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Activity className="h-4 w-4 text-primary" /> Trafik API Mingguan
            </CardTitle>
            <CardDescription>
              Jumlah request dan error 7 hari terakhir
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={trafficData}
                  margin={{ top: 4, right: 8, left: -20, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    opacity={0.15}
                  />
                  <XAxis
                    dataKey="name"
                    stroke="var(--color-muted-foreground)"
                    fontSize={10}
                    tickLine={false}
                  />
                  <YAxis
                    stroke="var(--color-muted-foreground)"
                    fontSize={10}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "var(--color-card)",
                      borderColor: "var(--color-border)",
                      borderRadius: "12px",
                      fontSize: "12px",
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: "11px" }} />
                  <Bar
                    dataKey="requests"
                    name="Requests"
                    fill="var(--color-primary)"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="errors"
                    name="Errors"
                    fill="var(--color-destructive)"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Performance chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Cpu className="h-4 w-4 text-amber-500" /> Performa Server Hari
              Ini
            </CardTitle>
            <CardDescription>
              Penggunaan CPU dan RAM (%) per jam
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={performanceData}
                  margin={{ top: 4, right: 8, left: -20, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorCpu" x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset="5%"
                        stopColor="var(--color-primary)"
                        stopOpacity={0.25}
                      />
                      <stop
                        offset="95%"
                        stopColor="var(--color-primary)"
                        stopOpacity={0}
                      />
                    </linearGradient>
                    <linearGradient id="colorRam" x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset="5%"
                        stopColor="#f59e0b"
                        stopOpacity={0.25}
                      />
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    opacity={0.15}
                  />
                  <XAxis
                    dataKey="name"
                    stroke="var(--color-muted-foreground)"
                    fontSize={10}
                    tickLine={false}
                  />
                  <YAxis
                    domain={[0, 100]}
                    stroke="var(--color-muted-foreground)"
                    fontSize={10}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "var(--color-card)",
                      borderColor: "var(--color-border)",
                      borderRadius: "12px",
                      fontSize: "12px",
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: "11px" }} />
                  <Area
                    type="monotone"
                    dataKey="cpu"
                    name="CPU %"
                    stroke="var(--color-primary)"
                    strokeWidth={2}
                    fill="url(#colorCpu)"
                  />
                  <Area
                    type="monotone"
                    dataKey="ram"
                    name="RAM %"
                    stroke="#f59e0b"
                    strokeWidth={2}
                    fill="url(#colorRam)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Service Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Wifi className="h-4 w-4 text-emerald-500" /> Status Layanan
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2.5">
            {serverStatus.map((s) => (
              <div
                key={s.name}
                className="flex items-center justify-between py-2 border-b border-border last:border-0"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-sm font-medium">{s.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-muted-foreground font-mono">
                    {s.latency}
                  </span>
                  <Badge variant="success" className="text-[10px] px-2 py-0.5">
                    {s.status}
                  </Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* System Logs */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Database className="h-4 w-4 text-blue-500" /> Log Sistem Terbaru
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {systemLogs.map((log, i) => (
              <div
                key={i}
                className="flex items-start gap-2.5 py-1.5 border-b border-border last:border-0"
              >
                {log.level === "success" ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium leading-snug">
                    {log.event}
                  </p>
                  <p className="text-[10px] text-muted-foreground font-mono mt-0.5">
                    {log.time}
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SystemStats;
