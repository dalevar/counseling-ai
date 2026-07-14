import React, { useEffect, useMemo, useState } from 'react';
import {
  Users,
  Calendar,
  AlertTriangle,
  CheckCircle,
  XCircle,
  FileCheck,
  MessageCircle,
  Upload,
  School,
  UserPlus,
  Loader2,
  Download,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import Button from '@/components/ui/button';
import Avatar from '@/components/ui/avatar';
import Input from '@/components/ui/input';
import toast from 'react-hot-toast';
import { adminApi, type CreateUserPayload, type SchoolOption } from '@/api/admin';

const distributionData = [
  { name: 'Normal', siswa: 120 },
  { name: 'Ringan', siswa: 45 },
  { name: 'Sedang', siswa: 18 },
  { name: 'Berat', siswa: 6 },
];

type StudentForm = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  gender: '' | 'L' | 'P';
  birthDate: string;
  className: string;
  parentEmail: string;
  parentFirstName: string;
  parentLastName: string;
  parentPhone: string;
};

const EMPTY_FORM: StudentForm = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  gender: '',
  birthDate: '',
  className: '',
  parentEmail: '',
  parentFirstName: '',
  parentLastName: '',
  parentPhone: '',
};

export const TeacherDashboard: React.FC = () => {
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [schools, setSchools] = useState<SchoolOption[]>([]);
  const [studentForm, setStudentForm] = useState<StudentForm>(EMPTY_FORM);
  const [isSubmittingStudent, setIsSubmittingStudent] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importResults, setImportResults] = useState<Array<{
    row: number;
    email: string;
    status: 'SUCCESS' | 'FAILED';
    tempPassword?: string;
    error?: string;
  }>>([]);

  const pendingRequests = [
    { id: '1', student: 'Budi Santoso', class: 'XI IPA 2', date: 'Senin, 14 Juli - 10:00 WIB', issue: 'Stres Ujian & Tekanan Belajar' },
    { id: '2', student: 'Lani Marlina', class: 'X IPS 1', date: 'Selasa, 15 Juli - 11:30 WIB', issue: 'Kurang Percaya Diri & Hubungan Sosial' },
  ];

  const highRiskStudents = [
    { id: 'st-1', name: 'Budi Santoso', class: 'XI IPA 2', status: 'Sangat Cemas', score: 'GAD-7: 16 (Berat)' },
    { id: 'st-2', name: 'Rian Hidayat', class: 'XII IPS 3', status: 'Gejala Depresi', score: 'PHQ-9: 18 (Berat)' },
  ];

  useEffect(() => {
    const loadSchools = async () => {
      try {
        const result = await adminApi.getSchools();
        setSchools(result);
      } catch {
        // handled globally
      }
    };

    loadSchools();
  }, []);

  const teacherSchool = schools[0];

  const classOptions = useMemo(() => teacherSchool?.classes ?? [], [teacherSchool]);

  const handleApprove = (id: string, name: string) => {
    setApprovingId(id);
    setTimeout(() => {
      toast.success(`Permintaan konseling ${name} berhasil disetujui!`);
      setApprovingId(null);
    }, 1000);
  };

  const updateStudentForm = (key: keyof StudentForm, value: string) => {
    setStudentForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleCreateStudent = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!teacherSchool) {
      toast.error('Akun Guru BK belum terhubung ke sekolah.');
      return;
    }

    if (!studentForm.firstName || !studentForm.lastName || !studentForm.email || !studentForm.className) {
      toast.error('Nama, email, dan kelas siswa wajib diisi.');
      return;
    }

    setIsSubmittingStudent(true);
    try {
      const payload: CreateUserPayload = {
        role: 'STUDENT',
        schoolId: teacherSchool.id,
        firstName: studentForm.firstName,
        lastName: studentForm.lastName,
        email: studentForm.email,
        ...(studentForm.phone && { phone: studentForm.phone }),
        ...(studentForm.gender && { gender: studentForm.gender }),
        ...(studentForm.birthDate && { birthDate: studentForm.birthDate }),
        className: studentForm.className,
        ...(studentForm.parentEmail && { parentEmail: studentForm.parentEmail }),
        ...(studentForm.parentFirstName && { parentFirstName: studentForm.parentFirstName }),
        ...(studentForm.parentLastName && { parentLastName: studentForm.parentLastName }),
        ...(studentForm.parentPhone && { parentPhone: studentForm.parentPhone }),
      };

      const result = await adminApi.createUser(payload);
      toast.success(`Akun siswa ${result.email} berhasil dibuat. Password sementara: ${result.tempPassword}`);
      setStudentForm(EMPTY_FORM);
    } catch {
      // handled globally
    } finally {
      setIsSubmittingStudent(false);
    }
  };

  const handleImportStudents = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!teacherSchool) {
      toast.error('Akun Guru BK belum terhubung ke sekolah.');
      event.target.value = '';
      return;
    }

    setIsImporting(true);
    try {
      const result = await adminApi.importStudents(file, teacherSchool.id);
      setImportResults(result.results);
      toast.success(
        `Import selesai. ${result.successCount} berhasil, ${result.failedCount} gagal.`,
      );
    } catch {
      // handled globally
    } finally {
      setIsImporting(false);
      event.target.value = '';
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 text-left">
        <Card className="p-4 flex items-center gap-4 bg-primary/[0.02]">
          <div className="p-3.5 rounded-2xl bg-primary/10 text-primary">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs font-medium text-muted-foreground">Total Siswa Terdaftar</span>
            <h3 className="text-2xl font-bold mt-0.5">
              {teacherSchool?._count.students ?? 0} Siswa
            </h3>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-4 bg-amber-500/[0.02]">
          <div className="p-3.5 rounded-2xl bg-amber-500/10 text-amber-500">
            <AlertTriangle className="h-6 w-6 animate-pulse" />
          </div>
          <div>
            <span className="text-xs font-medium text-muted-foreground">Butuh Perhatian Berat</span>
            <h3 className="text-2xl font-bold mt-0.5 text-amber-600 dark:text-amber-400">6 Siswa</h3>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-4 bg-emerald-500/[0.02]">
          <div className="p-3.5 rounded-2xl bg-emerald-500/10 text-emerald-500">
            <FileCheck className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs font-medium text-muted-foreground">Asesmen Selesai Bulan Ini</span>
            <h3 className="text-2xl font-bold mt-0.5">142 Tes</h3>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-4 bg-indigo-500/[0.02]">
          <div className="p-3.5 rounded-2xl bg-indigo-500/10 text-indigo-500">
            <Calendar className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs font-medium text-muted-foreground">Konseling Aktif Pekan Ini</span>
            <h3 className="text-2xl font-bold mt-0.5">12 Sesi</h3>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <Card className="text-left">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <School className="h-5 w-5" />
              <span>Pendaftaran Siswa oleh Guru BK</span>
            </CardTitle>
            <CardDescription>
              Tambahkan akun siswa baru langsung dari dashboard Guru BK. Akun akan dibuat dengan password sementara.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4 rounded-2xl border border-border bg-muted/20 p-4">
              <p className="text-xs font-semibold text-muted-foreground">Sekolah Aktif</p>
              <p className="mt-1 text-sm font-bold">{teacherSchool?.name || 'Belum terhubung ke sekolah'}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {teacherSchool?.address || 'Silakan hubungi admin untuk mengaitkan akun Guru BK ke sekolah.'}
              </p>
            </div>

            <form onSubmit={handleCreateStudent} className="space-y-3">
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <Input
                  label="Nama Depan"
                  value={studentForm.firstName}
                  onChange={(e) => updateStudentForm('firstName', e.target.value)}
                  placeholder="Budi"
                  required
                />
                <Input
                  label="Nama Belakang"
                  value={studentForm.lastName}
                  onChange={(e) => updateStudentForm('lastName', e.target.value)}
                  placeholder="Santoso"
                  required
                />
              </div>

              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <Input
                  label="Email Siswa"
                  type="email"
                  value={studentForm.email}
                  onChange={(e) => updateStudentForm('email', e.target.value)}
                  placeholder="budi.santoso@sekolah.sch.id"
                  required
                />
                <Input
                  label="Nomor Telepon"
                  value={studentForm.phone}
                  onChange={(e) => updateStudentForm('phone', e.target.value)}
                  placeholder="0812xxxx"
                />
              </div>

              <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-foreground/80">Kelas</label>
                  <input
                    list="teacher-school-classes"
                    value={studentForm.className}
                    onChange={(e) => updateStudentForm('className', e.target.value)}
                    className="h-11 rounded-xl border border-border bg-card/50 px-4 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10"
                    placeholder="XI IPA 2"
                    required
                  />
                  <datalist id="teacher-school-classes">
                    {classOptions.map((classItem) => (
                      <option key={classItem.id} value={classItem.name} />
                    ))}
                  </datalist>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-foreground/80">Jenis Kelamin</label>
                  <select
                    value={studentForm.gender}
                    onChange={(e) => updateStudentForm('gender', e.target.value)}
                    className="h-11 rounded-xl border border-border bg-card/50 px-4 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10"
                  >
                    <option value="">Pilih...</option>
                    <option value="L">Laki-laki</option>
                    <option value="P">Perempuan</option>
                  </select>
                </div>
                <Input
                  label="Tanggal Lahir"
                  type="date"
                  value={studentForm.birthDate}
                  onChange={(e) => updateStudentForm('birthDate', e.target.value)}
                />
              </div>

              <div className="rounded-2xl border border-border/60 bg-primary/5 p-4">
                <p className="mb-3 text-xs font-bold text-primary">Data Orang Tua / Wali</p>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  <Input
                    label="Email Orang Tua"
                    type="email"
                    value={studentForm.parentEmail}
                    onChange={(e) => updateStudentForm('parentEmail', e.target.value)}
                    placeholder="orangtua@email.com"
                  />
                  <Input
                    label="Nomor HP Orang Tua"
                    value={studentForm.parentPhone}
                    onChange={(e) => updateStudentForm('parentPhone', e.target.value)}
                    placeholder="0813xxxx"
                  />
                </div>
                <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
                  <Input
                    label="Nama Depan Orang Tua"
                    value={studentForm.parentFirstName}
                    onChange={(e) => updateStudentForm('parentFirstName', e.target.value)}
                    placeholder="Ahmad"
                  />
                  <Input
                    label="Nama Belakang Orang Tua"
                    value={studentForm.parentLastName}
                    onChange={(e) => updateStudentForm('parentLastName', e.target.value)}
                    placeholder="Santoso"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Button
                  type="submit"
                  leftIcon={isSubmittingStudent ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
                  disabled={isSubmittingStudent || !teacherSchool}
                >
                  {isSubmittingStudent ? 'Mendaftarkan Siswa...' : 'Daftarkan Siswa'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card className="text-left">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              <span>Import Excel Data Siswa</span>
            </CardTitle>
            <CardDescription>
              Upload file `.xlsx`, `.xls`, atau `.csv` dengan kolom minimal: `email`, `firstName`, `lastName`, dan `className`.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-2xl border border-dashed border-border bg-muted/20 p-4">
              <p className="text-sm font-semibold">Format kolom yang didukung</p>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                `email`, `firstName`, `lastName`, `phone`, `gender`, `birthDate`, `className`,
                `parentEmail`, `parentFirstName`, `parentLastName`, `parentPhone`.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">
                  <Upload className="h-4 w-4" />
                  <span>{isImporting ? 'Mengimpor...' : 'Pilih File Excel'}</span>
                  <input
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    className="hidden"
                    onChange={handleImportStudents}
                    disabled={isImporting || !teacherSchool}
                  />
                </label>
                <Button
                  type="button"
                  variant="outline"
                  leftIcon={<Download className="h-4 w-4" />}
                  onClick={() =>
                    toast.success('Gunakan header: email, firstName, lastName, className, parentEmail')
                  }
                >
                  Lihat Template
                </Button>
              </div>
            </div>

            {importResults.length > 0 && (
              <div className="space-y-3">
                <div className="rounded-2xl border border-border bg-card p-4">
                  <p className="text-sm font-bold">Hasil Import Terakhir</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Berhasil: {importResults.filter((item) => item.status === 'SUCCESS').length} baris
                    {' · '}
                    Gagal: {importResults.filter((item) => item.status === 'FAILED').length} baris
                  </p>
                </div>
                <div className="max-h-80 space-y-2 overflow-y-auto pr-1">
                  {importResults.map((item) => (
                    <div
                      key={`${item.row}-${item.email}`}
                      className={`rounded-2xl border p-3 ${
                        item.status === 'SUCCESS'
                          ? 'border-emerald-500/20 bg-emerald-500/5'
                          : 'border-destructive/20 bg-destructive/5'
                      }`}
                    >
                      <p className="text-sm font-semibold">
                        Baris {item.row} · {item.email || 'Tanpa email'}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {item.status === 'SUCCESS'
                          ? `Berhasil dibuat. Password sementara: ${item.tempPassword}`
                          : item.error}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 text-left">
          <CardHeader>
            <CardTitle>Distribusi Risiko Kesehatan Mental Siswa</CardTitle>
            <CardDescription>
              Hasil pemetaan kondisi psikologis siswa berdasarkan asesmen gabungan PHQ-9 & GAD-7 terbaru.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={distributionData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
                  <Bar dataKey="siswa" fill="var(--color-primary)" radius={[8, 8, 0, 0]} name="Jumlah Siswa" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-1 text-left flex flex-col">
          <CardHeader>
            <CardTitle className="text-destructive flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              <span>Siswa Berisiko Tinggi</span>
            </CardTitle>
            <CardDescription>
              Segera hubungi siswa di bawah ini untuk bimbingan preventif awal.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 flex-1 overflow-y-auto">
            {highRiskStudents.map((st) => (
              <div key={st.id} className="p-3 border border-destructive/20 bg-destructive/5 rounded-2xl flex items-start justify-between gap-3">
                <div className="text-left space-y-1">
                  <span className="text-xs font-bold block text-foreground">{st.name} ({st.class})</span>
                  <span className="text-[10px] font-semibold text-destructive uppercase block">{st.status}</span>
                  <span className="text-[11px] text-muted-foreground block">{st.score}</span>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 text-xs shrink-0"
                  onClick={() => toast.success(`Membuka chat pribadi dengan ${st.name}`)}
                  leftIcon={<MessageCircle className="h-3.5 w-3.5" />}
                >
                  Hubungi
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card className="text-left">
        <CardHeader>
          <CardTitle>Persetujuan Jadwal Konseling Siswa</CardTitle>
          <CardDescription>
            Menampilkan permintaan sesi konseling baru dari siswa yang memerlukan konfirmasi waktu Anda.
          </CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          {pendingRequests.length > 0 ? (
            <table className="w-full text-sm border-collapse min-w-[600px]">
              <thead>
                <tr className="border-b border-border text-muted-foreground text-left">
                  <th className="pb-3 font-semibold">Nama Siswa</th>
                  <th className="pb-3 font-semibold">Kelas</th>
                  <th className="pb-3 font-semibold">Tanggal & Sesi</th>
                  <th className="pb-3 font-semibold">Keluhan / Alasan</th>
                  <th className="pb-3 font-semibold text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {pendingRequests.map((req) => (
                  <tr key={req.id} className="hover:bg-muted/30">
                    <td className="py-4 font-bold flex items-center gap-2.5">
                      <Avatar fallback={req.student} size="sm" />
                      <span>{req.student}</span>
                    </td>
                    <td className="py-4 text-muted-foreground">{req.class}</td>
                    <td className="py-4 font-semibold text-primary">{req.date}</td>
                    <td className="py-4 text-muted-foreground italic max-w-xs truncate">"{req.issue}"</td>
                    <td className="py-4 text-right">
                      <div className="inline-flex gap-2">
                        <Button
                          size="sm"
                          isLoading={approvingId === req.id}
                          onClick={() => handleApprove(req.id, req.student)}
                          leftIcon={<CheckCircle className="h-3.5 w-3.5" />}
                          className="bg-emerald-500 hover:bg-emerald-600 shadow-none h-8 text-xs py-1"
                        >
                          Setujui
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => toast.error('Permintaan sesi ditolak.')}
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
            <div className="py-8 text-center text-muted-foreground">Tidak ada permintaan pending.</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TeacherDashboard;
