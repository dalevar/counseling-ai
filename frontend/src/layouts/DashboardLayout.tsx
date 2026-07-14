import React, { useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '@/hooks/useTheme';
import { useAppDispatch, useAppSelector } from '@/hooks/store';
import { logout } from '@/store/slices/authSlice';
import {
  Menu,
  X,
  Sun,
  Moon,
  LogOut,
  ChevronRight,
  GraduationCap,
  Users,
  Award,
  ShieldAlert,
  Home,
  User,
  MessageSquare,
  Calendar,
  FileText,
  Smile,
  BookOpen,
  Bell,
  Settings,
  Search,
  Activity,
} from 'lucide-react';
import Avatar from '@/components/ui/avatar';
import Button from '@/components/ui/button';
import toast from 'react-hot-toast';
import { usePWAInstall } from '@/hooks/usePWAInstall';
import { Download, Smartphone } from 'lucide-react';

export const DashboardLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const { theme, toggleTheme } = useTheme();
  
  // Get active session
  const { user } = useAppSelector((state) => state.auth);
  const userRole = user?.role || 'student';
  const userName = user?.name || 'Pengguna';
  const userEmail = user?.email || 'user@educouns.ai';

  // State management for Sidebar
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showPWABanner, setShowPWABanner] = useState(true);

  // PWA Install
  const { canInstall, isInstalling, install } = usePWAInstall();

  const handleLogout = () => {
    dispatch(logout());
    toast.success('Anda berhasil keluar.');
    navigate('/login', { replace: true });
  };

  // Define navigation links based on user roles
  const getNavLinks = (role: string) => {
    const commonLinks = [
      { path: `/dashboard/${role}`, label: 'Dashboard', icon: <Home className="h-5 w-5" /> },
      { path: '/profile', label: 'Profil Saya', icon: <User className="h-5 w-5" /> },
      { path: '/ai-chat', label: 'Konseling AI', icon: <MessageSquare className="h-5 w-5" /> },
    ];

    const studentLinks = [
      ...commonLinks,
      { path: '/counseling', label: 'Konseling', icon: <Calendar className="h-5 w-5" /> },
      { path: '/assessment', label: 'Asesmen Psikologi', icon: <FileText className="h-5 w-5" /> },
      { path: '/mood', label: 'Mood & Jurnal', icon: <Smile className="h-5 w-5" /> },
      { path: '/forum', label: 'Forum Diskusi', icon: <MessageSquare className="h-5 w-5 text-indigo-400" /> },
      { path: '/articles', label: 'Artikel Edukasi', icon: <BookOpen className="h-5 w-5" /> },
    ];

    const teacherLinks = [
      ...commonLinks,
      { path: '/counseling', label: 'Jadwal Konseling', icon: <Calendar className="h-5 w-5" /> },
      { path: '/forum', label: 'Forum Sekolah', icon: <MessageSquare className="h-5 w-5 text-indigo-400" /> },
      { path: '/articles', label: 'Artikel BK', icon: <BookOpen className="h-5 w-5" /> },
    ];

    const counselorLinks = [
      ...commonLinks,
      { path: '/counseling', label: 'Jadwal Konsultasi', icon: <Calendar className="h-5 w-5" /> },
      { path: '/articles', label: 'Tulis Artikel', icon: <BookOpen className="h-5 w-5" /> },
    ];

    const parentLinks = [
      ...commonLinks,
      { path: '/counseling', label: 'Sesi Anak', icon: <Calendar className="h-5 w-5" /> },
      { path: '/mood', label: 'Perkembangan Anak', icon: <Smile className="h-5 w-5" /> },
    ];

    const adminLinks = [
      ...commonLinks,
      { path: '/admin/users', label: 'Manajemen Pengguna', icon: <Users className="h-5 w-5" /> },
      { path: '/admin/system', label: 'Monitor Sistem', icon: <Activity className="h-5 w-5" /> },
      { path: '/forum', label: 'Kelola Forum', icon: <MessageSquare className="h-5 w-5 text-indigo-400" /> },
      { path: '/articles', label: 'Kelola Artikel', icon: <BookOpen className="h-5 w-5" /> },
    ];

    switch (role) {
      case 'student': return studentLinks;
      case 'teacher': return teacherLinks;
      case 'counselor': return counselorLinks;
      case 'parent': return parentLinks;
      case 'admin': return adminLinks;
      default: return studentLinks;
    }
  };

  const menuLinks = getNavLinks(userRole);

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'student': return <GraduationCap className="h-4 w-4" />;
      case 'teacher': return <Users className="h-4 w-4" />;
      case 'counselor': return <Award className="h-4 w-4" />;
      case 'parent': return <Users className="h-4 w-4 text-indigo-400" />;
      case 'admin': return <ShieldAlert className="h-4 w-4" />;
      default: return <GraduationCap className="h-4 w-4" />;
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'student': return 'Siswa';
      case 'teacher': return 'Guru BK';
      case 'counselor': return 'Konselor';
      case 'parent': return 'Orang Tua';
      case 'admin': return 'Admin';
      default: return 'User';
    }
  };

  // Render navigation list
  const renderNavList = () => (
    <nav className="flex-1 px-3 py-4 space-y-1">
      {menuLinks.map((link) => {
        const isActive = location.pathname === link.path;
        return (
          <Link
            key={link.path}
            to={link.path}
            onClick={() => setIsMobileOpen(false)}
            className={`
              flex items-center gap-3.5 px-3 py-3 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer
              ${
                isActive
                  ? 'bg-primary text-primary-foreground shadow-md shadow-primary/10'
                  : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
              }
            `}
          >
            <div className="shrink-0">{link.icon}</div>
            {(!isCollapsed || isMobileOpen) && (
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="truncate"
              >
                {link.label}
              </motion.span>
            )}
            {(!isCollapsed || isMobileOpen) && isActive && (
              <ChevronRight className="ml-auto h-4 w-4" />
            )}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="min-h-screen w-full flex bg-background text-foreground transition-colors duration-300">
      
      {/* 1. DESKTOP SIDEBAR */}
      <aside
        className={`
          hidden md:flex flex-col border-r border-border bg-card transition-all duration-300 relative z-20
          ${isCollapsed ? 'w-[76px]' : 'w-64'}
        `}
      >
        {/* Sidebar Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-border">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="shrink-0 w-9 h-9 rounded-xl bg-gradient-to-tr from-primary to-secondary text-primary-foreground font-black flex items-center justify-center text-sm shadow-md">
              EC
            </div>
            {!isCollapsed && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="font-bold text-lg bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent truncate"
              >
                EduCouns AI
              </motion.span>
            )}
          </div>
        </div>

        {/* Navigation list */}
        {renderNavList()}

        {/* Sidebar Footer / User section */}
        <div className="p-3 border-t border-border bg-muted/20">
          <div className="flex items-center gap-3 overflow-hidden">
            <Avatar src={user?.avatar} fallback={userName} size="sm" className="shrink-0" />
            {!isCollapsed && (
              <div className="flex flex-col text-left overflow-hidden">
                <span className="text-xs font-bold truncate leading-tight">{userName}</span>
                <span className="text-[10px] text-muted-foreground truncate">{userEmail}</span>
              </div>
            )}
          </div>
          {!isCollapsed && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              leftIcon={<LogOut className="h-3.5 w-3.5" />}
              className="w-full mt-3 h-9 text-xs border-dashed text-destructive hover:bg-destructive/10"
            >
              Keluar
            </Button>
          )}
        </div>
      </aside>

      {/* 2. MOBILE SIDEBAR DRAWER (drawer slider via Framer Motion) */}
      <AnimatePresence>
        {isMobileOpen && (
          <div className="fixed inset-0 z-40 md:hidden flex">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileOpen(false)}
              className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            />
            {/* Drawer */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="relative w-72 max-w-[85vw] bg-card border-r border-border h-full flex flex-col z-10 p-4"
            >
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-border">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-primary to-secondary text-primary-foreground font-black flex items-center justify-center text-xs">
                    EC
                  </div>
                  <span className="font-bold text-base bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                    EduCouns AI
                  </span>
                </div>
                <button
                  onClick={() => setIsMobileOpen(false)}
                  className="p-1 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {renderNavList()}

              <div className="mt-auto p-3 border-t border-border bg-muted/20 rounded-xl">
                <div className="flex items-center gap-3 mb-3">
                  <Avatar src={user?.avatar} fallback={userName} size="sm" />
                  <div className="flex flex-col text-left overflow-hidden">
                    <span className="text-xs font-bold truncate leading-tight">{userName}</span>
                    <span className="text-[10px] text-muted-foreground truncate">{userEmail}</span>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                  leftIcon={<LogOut className="h-3.5 w-3.5" />}
                  className="w-full h-9 text-xs border-dashed text-destructive hover:bg-destructive/10"
                >
                  Keluar
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 3. MAIN CONTENT CONTAINER */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto h-screen relative">
        
        {/* STICKY TOP NAVBAR */}
        <header className="sticky top-0 z-30 h-16 border-b border-border bg-background/80 backdrop-blur-md flex items-center justify-between px-4 sm:px-6">
          {/* Mobile hamburger & collapse trigger */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileOpen(true)}
              className="p-2 rounded-xl border border-border bg-card text-foreground md:hidden cursor-pointer hover:bg-muted/50"
              aria-label="Open sidebar"
            >
              <Menu className="h-5 w-5" />
            </button>
            <button
              onClick={() => setIsCollapsed((prev) => !prev)}
              className="hidden md:flex p-2 rounded-xl border border-border bg-card text-foreground cursor-pointer hover:bg-muted/50"
              aria-label="Collapse sidebar"
            >
              <Menu className="h-5 w-5" />
            </button>
            
            {/* Title / Breadcrumbs */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold tracking-wide text-foreground capitalize">
                Dashboard
              </span>
              <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold">
                {getRoleIcon(userRole)}
                <span>{getRoleLabel(userRole)}</span>
              </div>
            </div>
          </div>

          {/* Right Header Menu Actions */}
          <div className="flex items-center gap-3">
            {/* Search Trigger */}
            <div className="relative hidden sm:block w-48 lg:w-60">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Cari..."
                className="w-full h-9 rounded-xl border border-border bg-card/40 pl-9 pr-4 text-xs focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
              />
            </div>

            {/* Notification center */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowNotifications((prev) => !prev);
                  setShowProfileMenu(false);
                }}
                className="p-2.5 rounded-xl border border-border bg-card text-foreground hover:bg-muted/50 cursor-pointer relative"
                aria-label="Notifications"
              >
                <Bell className="h-4.5 w-4.5" />
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-primary animate-pulse" />
              </button>

              <AnimatePresence>
                {showNotifications && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 mt-2 w-80 bg-card border border-border rounded-2xl shadow-xl z-50 p-4 overflow-hidden glass text-left"
                    >
                      <h4 className="font-bold text-sm mb-3">Pemberitahuan</h4>
                      <div className="space-y-3 max-h-60 overflow-y-auto">
                        <div className="p-2.5 rounded-xl bg-muted/40 text-xs border border-border/50">
                          <p className="font-semibold mb-0.5 text-foreground">Sesi Konseling Mendatang</p>
                          <p className="text-muted-foreground">Sesi dengan Konselor Budi dimulai 30 menit lagi.</p>
                          <span className="text-[10px] text-primary/75 mt-1 block">Baru saja</span>
                        </div>
                        <div className="p-2.5 rounded-xl bg-muted/20 text-xs border border-border/10">
                          <p className="font-semibold mb-0.5 text-foreground">Asesmen Baru Tersedia</p>
                          <p className="text-muted-foreground">Isi kuesioner PHQ-9 mingguan Anda untuk memantau mood.</p>
                          <span className="text-[10px] text-muted-foreground/60 mt-1 block">1 jam lalu</span>
                        </div>
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            {/* Toggle Theme button */}
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-xl border border-border bg-card text-foreground hover:bg-muted/50 cursor-pointer"
              aria-label="Toggle Theme"
            >
              {theme === 'dark' ? <Sun className="h-4.5 w-4.5 text-amber-400" /> : <Moon className="h-4.5 w-4.5 text-indigo-600" />}
            </button>

            {/* User Profile Avatar dropdown menu */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowProfileMenu((prev) => !prev);
                  setShowNotifications(false);
                }}
                className="flex items-center gap-2 p-1.5 rounded-xl border border-border bg-card hover:bg-muted/50 cursor-pointer"
              >
                <Avatar src={user?.avatar} fallback={userName} size="sm" />
              </button>

              <AnimatePresence>
                {showProfileMenu && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowProfileMenu(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 mt-2 w-56 bg-card border border-border rounded-2xl shadow-xl z-50 p-2 overflow-hidden glass text-left"
                    >
                      <div className="px-3 py-2 border-b border-border/60 mb-1.5">
                        <p className="text-sm font-bold truncate">{userName}</p>
                        <p className="text-[10px] text-muted-foreground truncate">{userEmail}</p>
                      </div>
                      <Link
                        to="/profile"
                        onClick={() => setShowProfileMenu(false)}
                        className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-medium text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-all duration-200"
                      >
                        <User className="h-4 w-4" /> Profil Saya
                      </Link>
                      <Link
                        to="/settings"
                        onClick={() => setShowProfileMenu(false)}
                        className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-medium text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-all duration-200"
                      >
                        <Settings className="h-4 w-4" /> Pengaturan
                      </Link>
                      <button
                        onClick={() => {
                          setShowProfileMenu(false);
                          handleLogout();
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-medium text-destructive hover:bg-destructive/10 transition-all duration-200 cursor-pointer"
                      >
                        <LogOut className="h-4 w-4" /> Keluar Sesi
                      </button>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* PAGE CONTENT CONTAINER */}
        <main className="flex-1 p-4 sm:p-6 md:p-8 max-w-7xl w-full mx-auto relative z-10">
          {/* PWA Install Banner */}
          <AnimatePresence>
            {canInstall && showPWABanner && (
              <motion.div
                initial={{ opacity: 0, y: -12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                className="mb-5 flex items-center gap-3 p-3.5 rounded-2xl border border-primary/30 bg-primary/5 backdrop-blur-sm"
              >
                <div className="w-9 h-9 rounded-xl bg-primary/15 text-primary flex items-center justify-center shrink-0">
                  <Smartphone className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold">Install EduCouns AI</p>
                  <p className="text-xs text-muted-foreground">Pasang aplikasi ke perangkatmu untuk akses lebih cepat & offline.</p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <Button
                    size="sm"
                    isLoading={isInstalling}
                    leftIcon={<Download className="h-3.5 w-3.5" />}
                    onClick={install}
                    className="h-8 text-xs"
                  >
                    Install
                  </Button>
                  <button
                    onClick={() => setShowPWABanner(false)}
                    className="p-1.5 rounded-xl text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-all cursor-pointer"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
