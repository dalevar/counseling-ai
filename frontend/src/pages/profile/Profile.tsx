import React, { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  Lock,
  Bell,
  Camera,
  UploadCloud,
  Shield,
  Languages,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/hooks/store';
import { updateProfileSuccess } from '@/store/slices/authSlice';
import { useTheme } from '@/hooks/useTheme';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import Input from '@/components/ui/input';
import Button from '@/components/ui/button';
import Avatar from '@/components/ui/avatar';
import toast from 'react-hot-toast';
import { apiClient } from '@/api/client';

// Zod Validation Schemas
const profileSchema = z.object({
  name: z.string().min(3, 'Nama minimal harus 3 karakter'),
  email: z.string().min(1, 'Email wajib diisi').email('Format email tidak valid'),
  phone: z.string().optional(),
  school: z.string().optional(),
  bio: z.string().max(200, 'Bio maksimal 200 karakter').optional(),
});

type ProfileFields = z.infer<typeof profileSchema>;

const passwordSchema = z
  .object({
    oldPassword: z.string().min(1, 'Password lama wajib diisi'),
    newPassword: z.string().min(6, 'Password baru minimal harus 6 karakter'),
    confirmPassword: z.string().min(1, 'Konfirmasi password baru wajib diisi'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Password baru tidak cocok',
    path: ['confirmPassword'],
  });

type PasswordFields = z.infer<typeof passwordSchema>;

export const Profile: React.FC = () => {
  const dispatch = useAppDispatch();
  const { theme, setTheme } = useTheme();
  
  // Get active session
  const { user } = useAppSelector((state) => state.auth);
  const userName = user?.name || 'Pengguna';
  const userEmail = user?.email || 'user@educouns.ai';
  const userAvatar = user?.avatar;
  const userRole = user?.role || 'student';

  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'preferences'>('profile');
  const [avatarPreview, setAvatarPreview] = useState<string | null>(userAvatar || null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Preference states
  const [prefs, setPrefs] = useState({
    emailNotif: true,
    pushNotif: true,
    weeklyReport: false,
    lang: 'id',
  });

  // Forms setup
  const {
    register: registerProfile,
    handleSubmit: handleSubmitProfile,
    reset: resetProfileForm,
    formState: { errors: profileErrors },
  } = useForm<ProfileFields>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: userName,
      email: userEmail,
      phone: '081234567890',
      school: 'SMA Negeri 1 Jakarta',
      bio: 'Selalu bersemangat belajar hal baru dan menjaga kesehatan mental!',
    },
  });

  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    reset: resetPasswordForm,
    formState: { errors: passwordErrors },
  } = useForm<PasswordFields>({
    resolver: zodResolver(passwordSchema),
  });

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const response = await apiClient.get('/v1/users/me');
        const profileData = response.data.data;
        const roleProfile = profileData.profile || {};
        const fullName = [roleProfile.firstName, roleProfile.lastName].filter(Boolean).join(' ') || userName;

        resetProfileForm({
          name: fullName,
          email: profileData.email || userEmail,
          phone: roleProfile.phone || '',
          school: roleProfile.school?.name || '',
          bio: roleProfile.bio || '',
        });

        if (profileData.avatarUrl) {
          setAvatarPreview(profileData.avatarUrl);
          dispatch(updateProfileSuccess({ avatar: profileData.avatarUrl }));
        }
      } catch (err) {
        toast.error('Gagal memuat profil pengguna.');
      }
    };

    loadProfile();
  }, [dispatch, resetProfileForm, userEmail, userName]);

  // Avatar upload logic
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error('Ukuran file maksimal adalah 2MB.');
        return;
      }
      setIsUploading(true);
      const formData = new FormData();
      formData.append('avatar', file);

      apiClient
        .post('/v1/users/me/avatar', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        })
        .then((response) => {
          const avatarUrl = response.data.data.avatarUrl;
          setAvatarPreview(avatarUrl);
          dispatch(updateProfileSuccess({ avatar: avatarUrl }));
          toast.success('Foto profil berhasil diunggah.');
        })
        .catch((err: any) => {
          toast.error(err.response?.data?.message || 'Gagal mengunggah foto profil.');
        })
        .finally(() => {
          setIsUploading(false);
        });
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  // Submit Profile Form
  const onProfileSubmit = async (data: ProfileFields) => {
    setIsSavingProfile(true);
    try {
      if (userRole === 'admin') {
        toast.error('Perubahan profil admin belum didukung dari halaman ini.');
        return;
      }

      const [firstName, ...restName] = data.name.trim().split(' ');
      const payload = {
        firstName,
        lastName: restName.join(' ') || '-',
        phone: data.phone || undefined,
        ...(userRole === 'counselor' ? { bio: data.bio || undefined } : {}),
      };

      await apiClient.put(`/v1/users/me/${userRole}`, payload);
      dispatch(updateProfileSuccess({ name: data.name, email: data.email }));
      toast.success('Informasi profil berhasil diperbarui.');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Gagal menyimpan profil.');
    } finally {
      setIsSavingProfile(false);
    }
  };

  // Submit Password Form
  const onPasswordSubmit = async (data: PasswordFields) => {
    setIsSavingPassword(true);
    try {
      await apiClient.put('/v1/users/me/change-password', {
        oldPassword: data.oldPassword,
        newPassword: data.newPassword,
      });
      toast.success('Kata sandi berhasil diubah.');
      resetPasswordForm();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Gagal mengubah kata sandi.');
    } finally {
      setIsSavingPassword(false);
    }
  };

  const handlePrefChange = (key: keyof typeof prefs, val: any) => {
    setPrefs((prev) => {
      const updated = { ...prev, [key]: val };
      toast.success('Preferensi akun berhasil disimpan.');
      return updated;
    });
  };

  const tabs = [
    { id: 'profile', label: 'Profil Saya', icon: <User className="h-4 w-4" /> },
    { id: 'security', label: 'Keamanan', icon: <Lock className="h-4 w-4" /> },
    { id: 'preferences', label: 'Preferensi', icon: <Bell className="h-4 w-4" /> },
  ] as const;

  return (
    <div className="space-y-6 text-left">
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl font-black">Pengaturan Akun</h2>
        <p className="text-sm text-muted-foreground">
          Kelola profil pribadi, kata sandi, perizinan, dan notifikasi akun EduCouns AI Anda.
        </p>
      </div>

      {/* Tab Switcher Grid */}
      <div className="flex border-b border-border gap-2 overflow-x-auto pb-px">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex items-center gap-2 px-4 py-3 text-sm font-semibold cursor-pointer border-b-2 transition-all duration-200
                ${
                  isActive
                    ? 'border-primary text-primary font-bold'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }
              `}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tabs Content */}
      <div className="mt-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
          >
            {/* 1. PROFILE DETAILS TAB */}
            {activeTab === 'profile' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Left Card: Avatar Uploader */}
                <Card className="md:col-span-1 p-6 flex flex-col items-center justify-center text-center">
                  <div className="relative group cursor-pointer" onClick={triggerFileInput}>
                    <Avatar
                      src={avatarPreview || undefined}
                      fallback={userName}
                      size="xl"
                      className="ring-4 ring-primary/20 shadow-lg"
                    />
                    <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <Camera className="h-6 w-6 text-white" />
                    </div>
                    {isUploading && (
                      <div className="absolute inset-0 bg-background/80 rounded-full flex items-center justify-center">
                        <UploadCloud className="h-6 w-6 animate-bounce text-primary" />
                      </div>
                    )}
                  </div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleAvatarChange}
                    accept="image/*"
                    className="hidden"
                  />
                  <h3 className="font-bold mt-4 text-base">{userName}</h3>
                  <span className="text-xs text-muted-foreground capitalize mt-1 px-3 py-1 rounded-full bg-muted">
                    {userRole}
                  </span>
                  <p className="text-[10px] text-muted-foreground mt-4 leading-normal max-w-[200px]">
                    Format gambar JPG, PNG. Ukuran maksimal 2MB.
                  </p>
                </Card>

                {/* Right Card: Profile Edit Form */}
                <Card className="md:col-span-2">
                  <CardHeader>
                    <CardTitle>Data Diri</CardTitle>
                    <CardDescription>
                      Edit nama lengkap, email, dan detail instansi sekolah Anda.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSubmitProfile(onProfileSubmit)} className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Input
                          label="Nama Lengkap"
                          error={profileErrors.name?.message}
                          {...registerProfile('name')}
                        />
                        <Input
                          label="Email"
                          type="email"
                          error={profileErrors.email?.message}
                          {...registerProfile('email')}
                        />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Input
                          label="Nomor Telepon"
                          error={profileErrors.phone?.message}
                          {...registerProfile('phone')}
                        />
                        <Input
                          label="Sekolah / Instansi"
                          error={profileErrors.school?.message}
                          {...registerProfile('school')}
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-foreground/80 tracking-wide select-none">
                          Bio Singkat
                        </label>
                        <textarea
                          rows={3}
                          className="w-full rounded-xl border border-border bg-card/50 text-sm p-3.5 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-200"
                          placeholder="Ceritakan sedikit tentang Anda..."
                          {...registerProfile('bio')}
                        />
                        {profileErrors.bio && (
                          <span className="text-xs font-medium text-destructive mt-0.5" role="alert">
                            {profileErrors.bio.message}
                          </span>
                        )}
                      </div>

                      <div className="flex justify-end pt-2">
                        <Button type="submit" isLoading={isSavingProfile}>
                          Simpan Perubahan
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* 2. SECURITY & PASSWORD TAB */}
            {activeTab === 'security' && (
              <Card className="max-w-xl mx-auto">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-primary" />
                    <span>Keamanan Kata Sandi</span>
                  </CardTitle>
                  <CardDescription>
                    Perbarui kata sandi secara berkala untuk menjaga kerahasiaan akun konseling Anda.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmitPassword(onPasswordSubmit)} className="space-y-4">
                    <Input
                      label="Password Lama"
                      type="password"
                      placeholder="••••••••"
                      error={passwordErrors.oldPassword?.message}
                      {...registerPassword('oldPassword')}
                    />
                    <Input
                      label="Password Baru"
                      type="password"
                      placeholder="••••••••"
                      error={passwordErrors.newPassword?.message}
                      {...registerPassword('newPassword')}
                    />
                    <Input
                      label="Konfirmasi Password Baru"
                      type="password"
                      placeholder="••••••••"
                      error={passwordErrors.confirmPassword?.message}
                      {...registerPassword('confirmPassword')}
                    />

                    <div className="flex justify-end pt-2">
                      <Button type="submit" isLoading={isSavingPassword} className="w-full sm:w-auto">
                        Perbarui Kata Sandi
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}

            {/* 3. PREFERENCES TAB */}
            {activeTab === 'preferences' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Communication Settings */}
                <Card>
                  <CardHeader>
                    <CardTitle>Notifikasi Aplikasi</CardTitle>
                    <CardDescription>
                      Pilih bagaimana Anda menerima notifikasi dan rangkuman aktivitas.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Toggle emailNotif */}
                    <div className="flex items-center justify-between p-3.5 border border-border bg-card/40 rounded-2xl">
                      <div className="text-left space-y-0.5">
                        <span className="text-sm font-bold text-foreground block">Notifikasi Email</span>
                        <span className="text-xs text-muted-foreground block">Terima email jadwal konseling dan laporan mingguan.</span>
                      </div>
                      <button
                        onClick={() => handlePrefChange('emailNotif', !prefs.emailNotif)}
                        className={`w-11 h-6 rounded-full cursor-pointer transition-colors duration-200 relative ${
                          prefs.emailNotif ? 'bg-primary' : 'bg-muted-foreground/30'
                        }`}
                      >
                        <span
                          className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform duration-200 ${
                            prefs.emailNotif ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>

                    {/* Toggle pushNotif */}
                    <div className="flex items-center justify-between p-3.5 border border-border bg-card/40 rounded-2xl">
                      <div className="text-left space-y-0.5">
                        <span className="text-sm font-bold text-foreground block">Notifikasi Push</span>
                        <span className="text-xs text-muted-foreground block">Terima push alert untuk pesan chat konselor baru.</span>
                      </div>
                      <button
                        onClick={() => handlePrefChange('pushNotif', !prefs.pushNotif)}
                        className={`w-11 h-6 rounded-full cursor-pointer transition-colors duration-200 relative ${
                          prefs.pushNotif ? 'bg-primary' : 'bg-muted-foreground/30'
                        }`}
                      >
                        <span
                          className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform duration-200 ${
                            prefs.pushNotif ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>

                    {/* Toggle weeklyReport */}
                    <div className="flex items-center justify-between p-3.5 border border-border bg-card/40 rounded-2xl">
                      <div className="text-left space-y-0.5">
                        <span className="text-sm font-bold text-foreground block">Laporan Mood Mingguan</span>
                        <span className="text-xs text-muted-foreground block">Terima analisis rangkuman emosional berkala.</span>
                      </div>
                      <button
                        onClick={() => handlePrefChange('weeklyReport', !prefs.weeklyReport)}
                        className={`w-11 h-6 rounded-full cursor-pointer transition-colors duration-200 relative ${
                          prefs.weeklyReport ? 'bg-primary' : 'bg-muted-foreground/30'
                        }`}
                      >
                        <span
                          className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform duration-200 ${
                            prefs.weeklyReport ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>
                  </CardContent>
                </Card>

                {/* App Language & Theme Settings */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Languages className="h-5 w-5 text-secondary" />
                      <span>Preferensi Tampilan & Bahasa</span>
                    </CardTitle>
                    <CardDescription>
                      Atur bahasa dasar dan tema antarmuka platform.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Language selector */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-foreground/80 tracking-wide select-none">
                        Bahasa Aplikasi
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => handlePrefChange('lang', 'id')}
                          className={`
                            p-3.5 border rounded-2xl font-bold text-xs text-center cursor-pointer transition-all duration-200
                            ${
                              prefs.lang === 'id'
                                ? 'border-primary bg-primary/10 text-primary'
                                : 'border-border bg-card hover:bg-muted/50'
                            }
                          `}
                        >
                          Bahasa Indonesia
                        </button>
                        <button
                          type="button"
                          onClick={() => handlePrefChange('lang', 'en')}
                          className={`
                            p-3.5 border rounded-2xl font-bold text-xs text-center cursor-pointer transition-all duration-200
                            ${
                              prefs.lang === 'en'
                                ? 'border-primary bg-primary/10 text-primary'
                                : 'border-border bg-card hover:bg-muted/50'
                            }
                          `}
                        >
                          English
                        </button>
                      </div>
                    </div>

                    {/* Quick Theme selector inside settings tab */}
                    <div className="flex flex-col gap-1.5 pt-2">
                      <label className="text-xs font-semibold text-foreground/80 tracking-wide select-none">
                        Tema Platform
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setTheme('light')}
                          className={`
                            p-3.5 border rounded-2xl font-bold text-xs text-center cursor-pointer transition-all duration-200
                            ${
                              theme === 'light'
                                ? 'border-primary bg-primary/10 text-primary'
                                : 'border-border bg-card hover:bg-muted/50'
                            }
                          `}
                        >
                          Light Mode
                        </button>
                        <button
                          type="button"
                          onClick={() => setTheme('dark')}
                          className={`
                            p-3.5 border rounded-2xl font-bold text-xs text-center cursor-pointer transition-all duration-200
                            ${
                              theme === 'dark'
                                ? 'border-primary bg-primary/10 text-primary'
                                : 'border-border bg-card hover:bg-muted/50'
                            }
                          `}
                        >
                          Dark Mode
                        </button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Profile;

