import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  UserPlus,
  MoreVertical,
  Shield,
  ShieldOff,
  Trash2,
  Edit2,
  ChevronLeft,
  ChevronRight,
  Download,
  RefreshCw,
  GraduationCap,
  Users,
  Award,
  ShieldAlert,
  Copy,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Eye,
  EyeOff,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import Button from '@/components/ui/button';
import Badge from '@/components/ui/badge';
import Avatar from '@/components/ui/avatar';
import Dialog from '@/components/ui/dialog';
import Input from '@/components/ui/input';
import toast from 'react-hot-toast';
import { useAppSelector } from '@/hooks/store';
import {
  adminApi,
  type AdminUser,
  type CreateSchoolPayload,
  type CreateUserPayload,
  type SchoolOption,
} from '@/api/admin';


// ─── Helpers ──────────────────────────────────────────────────────────────────

const getDisplayName = (u: AdminUser): string => {
  const profile = u.student ?? u.counselor ?? u.teacher ?? u.parent;
  if (profile) return `${profile.firstName} ${profile.lastName}`;
  return u.email.split('@')[0];
};

const roleConfig: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  STUDENT:  { label: 'Siswa',     icon: <GraduationCap className="h-3.5 w-3.5" />, color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400' },
  TEACHER:  { label: 'Guru BK',   icon: <Users className="h-3.5 w-3.5" />,         color: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400' },
  COUNSELOR:{ label: 'Konselor',  icon: <Award className="h-3.5 w-3.5" />,         color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' },
  PARENT:   { label: 'Orang Tua', icon: <Users className="h-3.5 w-3.5" />,         color: 'bg-orange-500/10 text-orange-600 dark:text-orange-400' },
  ADMIN:    { label: 'Admin',     icon: <ShieldAlert className="h-3.5 w-3.5" />,   color: 'bg-red-500/10 text-red-600 dark:text-red-400' },
};

const statusVariant: Record<string, 'success' | 'warning' | 'destructive'> = {
  ACTIVE:    'success',
  SUSPENDED: 'destructive',
  PENDING:   'warning',
};

const statusLabel: Record<string, string> = {
  ACTIVE:    'Aktif',
  SUSPENDED: 'Ditangguhkan',
  PENDING:   'Menunggu',
};

// ─── Add User Form State ───────────────────────────────────────────────────────

interface AddUserForm {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: CreateUserPayload['role'];
  schoolId: string;
  className: string;
  // Student extras
  gender: '' | 'L' | 'P';
  birthDate: string;
  parentEmail: string;
  parentFirstName: string;
  parentLastName: string;
  // Staff extras
  employeeId: string;
  specialization: string;
}

const EMPTY_FORM: AddUserForm = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  role: 'STUDENT',
  schoolId: '',
  className: '',
  gender: '',
  birthDate: '',
  parentEmail: '',
  parentFirstName: '',
  parentLastName: '',
  employeeId: '',
  specialization: '',
};

const PAGE_SIZE = 8;

// ─── Component ────────────────────────────────────────────────────────────────

export const UserManagement: React.FC = () => {
  const currentUser = useAppSelector((state) => state.auth.user);
  const canManageSchools = currentUser?.role?.toUpperCase() === 'ADMIN';

  // ── List State ────────────────────────────────────────────────────────────
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [schools, setSchools] = useState<SchoolOption[]>([]);
  const [isSchoolLoading, setIsSchoolLoading] = useState(false);

  // ── Filter State ──────────────────────────────────────────────────────────
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  // ── Add Modal State ───────────────────────────────────────────────────────
  const [showAddModal, setShowAddModal] = useState(false);
  const [form, setForm] = useState<AddUserForm>(EMPTY_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSchoolModal, setShowSchoolModal] = useState(false);
  const [isCreatingSchool, setIsCreatingSchool] = useState(false);
  const [schoolForm, setSchoolForm] = useState<CreateSchoolPayload>({
    name: '',
    address: '',
    phone: '',
  });

  // ── Success Modal (temp password) ─────────────────────────────────────────
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [createdUser, setCreatedUser] = useState<{ email: string; tempPassword: string } | null>(null);
  const [passwordRevealed, setPasswordRevealed] = useState(false);
  const [copied, setCopied] = useState(false);

  // ── Load Users ─────────────────────────────────────────────────────────────
  const fetchUsers = useCallback(async (showLoader = true) => {
    try {
      if (showLoader) setIsLoading(true);
      const res = await adminApi.getUsers({
        page: currentPage,
        limit: PAGE_SIZE,
        ...(search && { search }),
        ...(roleFilter && { role: roleFilter }),
        ...(statusFilter && { status: statusFilter }),
      });
      setUsers(res.data);
      setTotalUsers(res.meta?.total ?? res.data.length);
    } catch {
      // Error already handled globally by apiClient interceptor
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [currentPage, search, roleFilter, statusFilter]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const fetchSchools = useCallback(async () => {
    try {
      setIsSchoolLoading(true);
      const result = await adminApi.getSchools();
      setSchools(result);
      setForm((prev) => ({
        ...prev,
        schoolId:
          prev.schoolId || (currentUser?.role?.toUpperCase() === 'TEACHER' ? result[0]?.id ?? '' : prev.schoolId),
      }));
    } catch {
      // handled globally
    } finally {
      setIsSchoolLoading(false);
    }
  }, [currentUser?.role]);

  useEffect(() => {
    fetchSchools();
  }, [fetchSchools]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchUsers(false);
  };

  // ── Stats ──────────────────────────────────────────────────────────────────
  const stats = useMemo(() => ({
    total:     totalUsers,
    active:    users.filter((u) => u.status === 'ACTIVE').length,
    pending:   users.filter((u) => u.status === 'PENDING').length,
    suspended: users.filter((u) => u.status === 'SUSPENDED').length,
  }), [users, totalUsers]);

  const totalPages = Math.ceil(totalUsers / PAGE_SIZE);

  // ── Toggle Status ──────────────────────────────────────────────────────────
  const handleToggleStatus = async (user: AdminUser) => {
    const nextStatus = user.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    try {
      await adminApi.updateUserStatus(user.id, nextStatus);
      toast.success(
        nextStatus === 'SUSPENDED'
          ? `${getDisplayName(user)} ditangguhkan.`
          : `${getDisplayName(user)} diaktifkan kembali.`
      );
      fetchUsers(false);
    } catch {
      // handled globally
    }
    setOpenMenuId(null);
  };

  // ── Delete ─────────────────────────────────────────────────────────────────
  const handleDelete = async (user: AdminUser) => {
    if (!window.confirm(`Hapus akun ${getDisplayName(user)}? Tindakan ini tidak dapat dibatalkan.`)) return;
    try {
      await adminApi.deleteUser(user.id);
      toast.success(`Akun ${getDisplayName(user)} dihapus.`);
      fetchUsers(false);
    } catch {
      // handled globally
    }
    setOpenMenuId(null);
  };

  // ── Add User ───────────────────────────────────────────────────────────────
  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.firstName || !form.lastName || !form.email) {
      toast.error('Nama depan, nama belakang, dan email wajib diisi.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: CreateUserPayload = {
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        role: form.role,
        ...(form.phone && { phone: form.phone }),
        ...(form.schoolId && { schoolId: form.schoolId }),
        // Student-specific
        ...(form.role === 'STUDENT' && {
          ...(form.gender && { gender: form.gender }),
          ...(form.birthDate && { birthDate: form.birthDate }),
          ...(form.className && { className: form.className }),
          ...(form.parentEmail && { parentEmail: form.parentEmail }),
          ...(form.parentFirstName && { parentFirstName: form.parentFirstName }),
          ...(form.parentLastName && { parentLastName: form.parentLastName }),
        }),
        // Counselor-specific
        ...(form.role === 'COUNSELOR' && form.specialization && { specialization: form.specialization }),
        // Teacher-specific
        ...(form.role === 'TEACHER' && form.employeeId && { employeeId: form.employeeId }),
      };

      const result = await adminApi.createUser(payload);

      toast.success(`Akun ${result.email} berhasil dibuat!`);
      setShowAddModal(false);
      setForm(EMPTY_FORM);
      setCreatedUser({ email: result.email, tempPassword: result.tempPassword });
      setPasswordRevealed(false);
      setCopied(false);
      setShowSuccessModal(true);
      fetchUsers(false);
    } catch {
      // handled globally
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyPassword = () => {
    if (!createdUser) return;
    navigator.clipboard.writeText(createdUser.tempPassword);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const updateForm = (key: keyof AddUserForm, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleCreateSchool = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!schoolForm.name?.trim()) {
      toast.error('Nama sekolah wajib diisi.');
      return;
    }

    setIsCreatingSchool(true);
    try {
      const createdSchool = await adminApi.createSchool(schoolForm);
      toast.success(`Sekolah ${createdSchool.name} berhasil ditambahkan.`);
      setShowSchoolModal(false);
      setSchoolForm({ name: '', address: '', phone: '' });
      await fetchSchools();
      setForm((prev) => ({ ...prev, schoolId: createdSchool.id }));
    } catch {
      // handled globally
    } finally {
      setIsCreatingSchool(false);
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6 text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end gap-4 justify-between">
        <div>
          <h2 className="text-2xl font-black">Manajemen Pengguna</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Kelola semua akun pengguna, verifikasi konselor, dan pantau aktivitas sistem.
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {canManageSchools && (
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Award className="h-4 w-4" />}
              onClick={() => setShowSchoolModal(true)}
            >
              Daftarkan Sekolah
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            leftIcon={<RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />}
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            Refresh
          </Button>
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Download className="h-4 w-4" />}
            onClick={() => toast.success('Mengekspor data CSV...')}
          >
            Export
          </Button>
          <Button
            size="sm"
            leftIcon={<UserPlus className="h-4 w-4" />}
            onClick={() => setShowAddModal(true)}
          >
            Tambah Pengguna
          </Button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total Pengguna', val: stats.total, color: 'text-foreground' },
          { label: 'Aktif', val: stats.active, color: 'text-emerald-600 dark:text-emerald-400' },
          { label: 'Menunggu', val: stats.pending, color: 'text-amber-600 dark:text-amber-400' },
          { label: 'Ditangguhkan', val: stats.suspended, color: 'text-red-600 dark:text-red-400' },
        ].map((s) => (
          <Card key={s.label} className="p-4 text-center">
            <p className={`text-3xl font-black ${s.color}`}>{s.val}</p>
            <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
          </Card>
        ))}
      </div>

      <Card className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-base font-bold">Data Sekolah</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Sekolah yang terdaftar dapat dipilih saat membuat akun Guru BK maupun siswa.
            </p>
          </div>
          <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
            {schools.length} sekolah
          </span>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {schools.map((school) => (
            <div key={school.id} className="rounded-2xl border border-border bg-muted/20 p-4">
              <p className="text-sm font-bold">{school.name}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {school.address || 'Alamat belum diisi'}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {school.phone || 'Telepon belum diisi'}
              </p>
              <div className="mt-3 flex flex-wrap gap-2 text-[11px] font-semibold text-muted-foreground">
                <span>{school._count.teachers} Guru BK</span>
                <span>{school._count.students} Siswa</span>
                <span>{school.classes.length} Kelas</span>
              </div>
            </div>
          ))}
          {!isSchoolLoading && schools.length === 0 && (
            <div className="rounded-2xl border border-dashed border-border p-4 text-sm text-muted-foreground">
              Belum ada data sekolah.
            </div>
          )}
        </div>
      </Card>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Cari nama atau email..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
            className="w-full h-10 rounded-xl border border-border bg-card/50 pl-10 pr-4 text-sm focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-200"
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => { setRoleFilter(e.target.value); setCurrentPage(1); }}
          className="h-10 px-3 rounded-xl border border-border bg-card/50 text-sm focus:outline-none focus:border-primary cursor-pointer"
        >
          <option value="">Semua Peran</option>
          <option value="STUDENT">Siswa</option>
          <option value="TEACHER">Guru BK</option>
          <option value="COUNSELOR">Konselor</option>
          <option value="PARENT">Orang Tua</option>
          <option value="ADMIN">Admin</option>
        </select>
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
          className="h-10 px-3 rounded-xl border border-border bg-card/50 text-sm focus:outline-none focus:border-primary cursor-pointer"
        >
          <option value="">Semua Status</option>
          <option value="ACTIVE">Aktif</option>
          <option value="PENDING">Menunggu</option>
          <option value="SUSPENDED">Ditangguhkan</option>
        </select>
      </div>

      {/* User Table */}
      <Card>
        <CardContent className="p-0">
          {/* Desktop header */}
          <div className="hidden md:grid grid-cols-[2fr_1fr_1fr_1fr_80px] px-5 py-3 text-xs font-bold text-muted-foreground border-b border-border bg-muted/20 rounded-t-2xl">
            <span>Pengguna</span>
            <span>Peran</span>
            <span>Status</span>
            <span>Bergabung</span>
            <span className="text-center">Aksi</span>
          </div>

          <div className="divide-y divide-border">
            <AnimatePresence initial={false}>
              {isLoading ? (
                <div className="py-16 flex flex-col items-center gap-3 text-muted-foreground">
                  <Loader2 className="h-6 w-6 animate-spin" />
                  <span className="text-sm">Memuat data pengguna...</span>
                </div>
              ) : users.length === 0 ? (
                <div className="py-16 flex flex-col items-center gap-2 text-muted-foreground">
                  <AlertCircle className="h-6 w-6" />
                  <span className="text-sm">Tidak ada pengguna yang cocok dengan filter.</span>
                </div>
              ) : (
                users.map((user) => {
                  const roleName = user.role.name.toUpperCase() as string;
                  const rc = roleConfig[roleName] ?? roleConfig['ADMIN'];
                  const displayName = getDisplayName(user);
                  return (
                    <motion.div
                      key={user.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0, height: 0 }}
                      className="grid md:grid-cols-[2fr_1fr_1fr_1fr_80px] items-center px-5 py-3.5 gap-3 hover:bg-muted/20 transition-colors relative"
                    >
                      {/* User info */}
                      <div className="flex items-center gap-3 min-w-0">
                        <Avatar fallback={displayName} size="sm" className="shrink-0" />
                        <div className="min-w-0">
                          <p className="text-sm font-semibold truncate">{displayName}</p>
                          <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                          <p className="text-[10px] text-muted-foreground/60 truncate">
                            {user.isEmailVerified ? '✅ Email terverifikasi' : '⏳ Belum verifikasi'}
                          </p>
                        </div>
                      </div>

                      {/* Role */}
                      <div>
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold ${rc.color}`}>
                          {rc.icon} {rc.label}
                        </span>
                      </div>

                      {/* Status */}
                      <div>
                        <Badge variant={statusVariant[user.status] ?? 'warning'}>
                          {statusLabel[user.status] ?? user.status}
                        </Badge>
                      </div>

                      {/* Join date */}
                      <div className="text-xs text-muted-foreground hidden md:block">
                        {new Date(user.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </div>

                      {/* Actions */}
                      <div className="flex justify-center relative">
                        <button
                          onClick={() => setOpenMenuId(openMenuId === user.id ? null : user.id)}
                          className="p-2 rounded-xl cursor-pointer hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-all duration-200"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </button>

                        <AnimatePresence>
                          {openMenuId === user.id && (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.9, y: -4 }}
                              animate={{ opacity: 1, scale: 1, y: 0 }}
                              exit={{ opacity: 0, scale: 0.9, y: -4 }}
                              transition={{ duration: 0.15 }}
                              className="absolute right-0 top-10 z-50 bg-card border border-border rounded-2xl shadow-xl overflow-hidden min-w-[180px]"
                            >
                              <button
                                onClick={() => { toast.success(`Edit pengguna ${displayName}`); setOpenMenuId(null); }}
                                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-left hover:bg-muted/50 transition-colors cursor-pointer"
                              >
                                <Edit2 className="h-4 w-4 text-muted-foreground" /> Edit Profil
                              </button>
                              <button
                                onClick={() => handleToggleStatus(user)}
                                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-left hover:bg-muted/50 transition-colors cursor-pointer"
                              >
                                {user.status === 'ACTIVE'
                                  ? <><ShieldOff className="h-4 w-4 text-amber-500" /> Tangguhkan</>
                                  : <><Shield className="h-4 w-4 text-emerald-500" /> Aktifkan</>
                                }
                              </button>
                              <div className="border-t border-border" />
                              <button
                                onClick={() => handleDelete(user)}
                                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-left hover:bg-destructive/10 text-destructive transition-colors cursor-pointer"
                              >
                                <Trash2 className="h-4 w-4" /> Hapus Akun
                              </button>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </AnimatePresence>
          </div>
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            Halaman {currentPage} dari {totalPages} ({totalUsers} pengguna)
          </span>
          <div className="flex items-center gap-1">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => p - 1)}
              className="p-2 rounded-xl cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed hover:bg-muted/50 transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`w-8 h-8 rounded-xl text-xs font-bold cursor-pointer transition-all duration-200 ${
                  currentPage === page
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-muted/50'
                }`}
              >
                {page}
              </button>
            ))}
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => p + 1)}
              className="p-2 rounded-xl cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed hover:bg-muted/50 transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* ── Add User Dialog ────────────────────────────────────────────────── */}
      <Dialog
        isOpen={showAddModal}
        onClose={() => { if (!isSubmitting) { setShowAddModal(false); setForm(EMPTY_FORM); } }}
        title="Daftarkan Pengguna Baru"
        description="Akun akan dibuat dengan kata sandi sementara. Admin/Guru BK menyerahkan kata sandi tersebut kepada pengguna."
      >
        <form onSubmit={handleAddUser} className="space-y-4">
          {/* Name row */}
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Nama Depan"
              placeholder="Ahmad"
              value={form.firstName}
              onChange={(e) => updateForm('firstName', e.target.value)}
              required
            />
            <Input
              label="Nama Belakang"
              placeholder="Fauzi"
              value={form.lastName}
              onChange={(e) => updateForm('lastName', e.target.value)}
              required
            />
          </div>

          <Input
            label="Alamat Email"
            type="email"
            placeholder="ahmad.fauzi@sekolah.sch.id"
            value={form.email}
            onChange={(e) => updateForm('email', e.target.value)}
            required
          />

          <Input
            label="Nomor Telepon (opsional)"
            type="tel"
            placeholder="0812-xxxx-xxxx"
            value={form.phone}
            onChange={(e) => updateForm('phone', e.target.value)}
          />

          {/* Role selector */}
          <div className="flex flex-col gap-1.5 text-left">
            <label className="text-xs font-semibold text-foreground/80">Peran Pengguna</label>
            <select
              value={form.role}
              onChange={(e) => updateForm('role', e.target.value)}
              className="h-10 px-3 rounded-xl border border-border bg-card text-sm focus:outline-none focus:border-primary cursor-pointer w-full"
            >
              <option value="STUDENT">Siswa</option>
              <option value="TEACHER">Guru BK</option>
              <option value="COUNSELOR">Konselor</option>
              <option value="PARENT">Orang Tua</option>
            </select>
          </div>

          {(form.role === 'STUDENT' || form.role === 'TEACHER') && (
            <div className="flex flex-col gap-1.5 text-left">
              <label className="text-xs font-semibold text-foreground/80">Sekolah</label>
              <select
                value={form.schoolId}
                onChange={(e) => updateForm('schoolId', e.target.value)}
                className="h-10 w-full cursor-pointer rounded-xl border border-border bg-card px-3 text-sm focus:border-primary focus:outline-none"
                required
                disabled={isSchoolLoading || (currentUser?.role?.toUpperCase() === 'TEACHER' && schools.length === 1)}
              >
                <option value="">Pilih sekolah...</option>
                {schools.map((school) => (
                  <option key={school.id} value={school.id}>
                    {school.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Student-specific fields */}
          {form.role === 'STUDENT' && (
            <div className="space-y-3 p-3 rounded-xl border border-border/60 bg-blue-500/5">
              <p className="text-xs font-bold text-blue-600 dark:text-blue-400">Data Siswa</p>
              <Input
                label="Kelas"
                placeholder="XI IPA 2"
                value={form.className}
                onChange={(e) => updateForm('className', e.target.value)}
              />
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-foreground/80">Jenis Kelamin</label>
                  <select
                    value={form.gender}
                    onChange={(e) => updateForm('gender', e.target.value)}
                    className="h-10 px-3 rounded-xl border border-border bg-card text-sm focus:outline-none focus:border-primary cursor-pointer"
                  >
                    <option value="">Pilih...</option>
                    <option value="L">Laki-laki</option>
                    <option value="P">Perempuan</option>
                  </select>
                </div>
                <Input
                  label="Tanggal Lahir"
                  type="date"
                  value={form.birthDate}
                  onChange={(e) => updateForm('birthDate', e.target.value)}
                />
              </div>

              <p className="text-xs text-muted-foreground pt-1">
                Informasi Orang Tua / Wali <span className="italic">(opsional — akun orang tua dibuat otomatis)</span>
              </p>
              <Input
                label="Email Orang Tua"
                type="email"
                placeholder="orang.tua@gmail.com"
                value={form.parentEmail}
                onChange={(e) => updateForm('parentEmail', e.target.value)}
              />
              {form.parentEmail && (
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    label="Nama Depan Orang Tua"
                    placeholder="Budi"
                    value={form.parentFirstName}
                    onChange={(e) => updateForm('parentFirstName', e.target.value)}
                  />
                  <Input
                    label="Nama Belakang Orang Tua"
                    placeholder="Santoso"
                    value={form.parentLastName}
                    onChange={(e) => updateForm('parentLastName', e.target.value)}
                  />
                </div>
              )}
            </div>
          )}

          {/* Counselor-specific fields */}
          {form.role === 'COUNSELOR' && (
            <div className="p-3 rounded-xl border border-border/60 bg-emerald-500/5 space-y-3">
              <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400">Data Konselor</p>
              <Input
                label="Spesialisasi"
                placeholder="Psikologi Klinis, Bimbingan & Konseling..."
                value={form.specialization}
                onChange={(e) => updateForm('specialization', e.target.value)}
              />
            </div>
          )}

          {/* Teacher-specific fields */}
          {form.role === 'TEACHER' && (
            <div className="p-3 rounded-xl border border-border/60 bg-indigo-500/5 space-y-3">
              <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400">Data Guru BK</p>
              <Input
                label="NIP / ID Karyawan"
                placeholder="198001012005011001"
                value={form.employeeId}
                onChange={(e) => updateForm('employeeId', e.target.value)}
              />
            </div>
          )}

          <div className="flex gap-2 justify-end pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => { setShowAddModal(false); setForm(EMPTY_FORM); }}
              disabled={isSubmitting}
            >
              Batal
            </Button>
            <Button type="submit" size="sm" disabled={isSubmitting}
              leftIcon={isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : undefined}
            >
              {isSubmitting ? 'Mendaftarkan...' : 'Daftarkan'}
            </Button>
          </div>
        </form>
      </Dialog>

      <Dialog
        isOpen={showSchoolModal}
        onClose={() => {
          if (!isCreatingSchool) {
            setShowSchoolModal(false);
            setSchoolForm({ name: '', address: '', phone: '' });
          }
        }}
        title="Daftarkan Sekolah"
        description="Tambahkan sekolah baru agar dapat dipilih saat membuat akun Guru BK dan siswa."
      >
        <form onSubmit={handleCreateSchool} className="space-y-4">
          <Input
            label="Nama Sekolah"
            placeholder="SMA Negeri 1 Makassar"
            value={schoolForm.name}
            onChange={(e) => setSchoolForm((prev) => ({ ...prev, name: e.target.value }))}
            required
          />
          <Input
            label="Alamat"
            placeholder="Jl. Pendidikan No. 1"
            value={schoolForm.address ?? ''}
            onChange={(e) => setSchoolForm((prev) => ({ ...prev, address: e.target.value }))}
          />
          <Input
            label="Telepon"
            placeholder="0411-xxxxxx"
            value={schoolForm.phone ?? ''}
            onChange={(e) => setSchoolForm((prev) => ({ ...prev, phone: e.target.value }))}
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isCreatingSchool}
              onClick={() => {
                setShowSchoolModal(false);
                setSchoolForm({ name: '', address: '', phone: '' });
              }}
            >
              Batal
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isCreatingSchool}
              leftIcon={isCreatingSchool ? <Loader2 className="h-4 w-4 animate-spin" /> : undefined}
            >
              {isCreatingSchool ? 'Menyimpan...' : 'Simpan Sekolah'}
            </Button>
          </div>
        </form>
      </Dialog>

      {/* ── Success Modal (show temp password) ────────────────────────────── */}
      <Dialog
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title="Akun Berhasil Dibuat! 🎉"
        description={`Akun untuk ${createdUser?.email} telah berhasil dibuat. Bagikan kata sandi sementara di bawah kepada pengguna secara aman.`}
      >
        <div className="space-y-4">
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
              <p className="text-xs text-amber-700 dark:text-amber-300">
                Kata sandi sementara ini hanya ditampilkan <strong>sekali</strong>. Pastikan sudah disalin sebelum menutup dialog ini.
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-semibold text-foreground/80">Kata Sandi Sementara</p>
            <div className="flex items-center gap-2">
              <div className="flex-1 font-mono text-sm bg-muted/50 rounded-xl px-4 py-3 border border-border tracking-widest">
                {passwordRevealed ? createdUser?.tempPassword : '••••••••••••••••'}
              </div>
              <button
                onClick={() => setPasswordRevealed((v) => !v)}
                className="p-2.5 rounded-xl border border-border bg-card hover:bg-muted/50 transition-colors"
                title={passwordRevealed ? 'Sembunyikan' : 'Tampilkan'}
              >
                {passwordRevealed ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
              <button
                onClick={handleCopyPassword}
                className="p-2.5 rounded-xl border border-border bg-card hover:bg-muted/50 transition-colors"
                title="Salin kata sandi"
              >
                {copied ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button size="sm" onClick={() => setShowSuccessModal(false)}>
              Selesai
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
};

export default UserManagement;
