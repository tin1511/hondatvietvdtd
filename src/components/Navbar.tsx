import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  MapPin, 
  Compass, 
  Camera, 
  MessageSquareQuote, 
  Utensils, 
  CalendarDays, 
  Mic, 
  BookOpen, 
  Users, 
  ShieldCheck, 
  Info, 
  Heart, 
  Globe, 
  Menu, 
  X,
  User,
  History,
  LogIn,
  LogOut,
  Award,
  ArrowLeft,
  Database,
  WifiOff,
  Eye,
  Plus
} from 'lucide-react';
import { UserProfile } from '../types';
import { PWAInstallButton } from './PWAInstallButton';
import { storageService, DEFAULT_SITE_LOGO } from '../services/storageService';
import { languageService, SUPPORTED_LANGUAGES } from '../services/languageService';

interface NavbarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  favoritesCount: number;
  userProfile: UserProfile;
  language: string;
  onLanguageChange: (lang: string) => void;
  onOpenAuthModal: (initialTab?: 'login' | 'register' | 'profile' | 'activity') => void;
  onOpenOfflineManager?: () => void;
  onLogout?: () => void;
  onPeekBackground?: () => void;
  onOpenAddHeritage?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  favoritesCount,
  userProfile,
  language,
  onLanguageChange,
  onOpenAuthModal,
  onOpenOfflineManager,
  onLogout,
  onPeekBackground,
  onOpenAddHeritage
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [siteLogo, setSiteLogo] = useState<string>(() => storageService.getSiteLogo());

  useEffect(() => {
    const handleLogoChange = (e: Event) => {
      const customEvent = e as CustomEvent<string>;
      if (customEvent.detail) {
        setSiteLogo(customEvent.detail);
      }
    };
    window.addEventListener('hdv_site_logo_changed', handleLogoChange);
    return () => window.removeEventListener('hdv_site_logo_changed', handleLogoChange);
  }, []);

  const navItems = [
    { id: 'home', label: languageService.t('nav.home', language, 'Trang chủ'), icon: Compass },
    { id: 'map', label: languageService.t('nav.map', language, 'Bản đồ Việt Nam'), icon: Globe, badge: language === 'en' ? 'S-Shape VN' : 'Chữ S 🇻🇳' },
    { id: 'recognizer', label: languageService.t('nav.recognizer', language, 'Nhận diện AI'), icon: Camera, badge: 'Vision' },
    { id: 'storyteller', label: languageService.t('nav.storyteller', language, 'Kể chuyện AI'), icon: Sparkles },
    { id: 'itinerary', label: languageService.t('nav.itinerary', language, 'Lịch trình'), icon: CalendarDays },
    { id: 'learning', label: languageService.t('nav.learning', language, 'Quiz & Lịch sử'), icon: Award },
    { id: 'profile', label: languageService.t('nav.profile', language, 'Hồ sơ & Danh hiệu'), icon: Award, badge: 'XP' },
    { id: 'community', label: languageService.t('nav.community', language, 'Cộng đồng'), icon: Users },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#FFFDF8]/95 backdrop-blur-md border-b border-[var(--gold)]/70 text-[var(--text)] shadow-[0_4px_18px_rgba(59,42,32,0.08)]">
      <div className="max-w-7xl mx-auto px-2.5 sm:px-6 lg:px-8">
        {/* Row 1: Brand & Right Actions — fits 100% of mobile viewport without horizontal clipping */}
        <div className="flex items-center justify-between h-12 sm:h-15 gap-1.5 sm:gap-2">
          
          {/* Logo & Brand & Back Button */}
          <div className="flex items-center gap-1.5 sm:gap-3 min-w-0 shrink-0">
            {currentTab !== 'home' && (
              <button
                id="btn-nav-back-to-home"
                type="button"
                onClick={() => onSelectTab('home')}
                className="flex items-center gap-1 p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-[var(--bg)] hover:bg-[#F3E5CD] text-[var(--text)] border border-[var(--gold)] text-xs font-bold transition-all group shrink-0 active:scale-95 shadow-sm whitespace-nowrap cursor-pointer"
                title={languageService.t('nav.backToHome', language, 'Quay về Trang chủ')}
              >
                <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[var(--primary)] group-hover:-translate-x-0.5 transition-transform shrink-0" />
                <span className="hidden sm:inline">{languageService.t('nav.home', language, 'Trang chủ')}</span>
              </button>
            )}

            <div 
              id="brand-logo"
              data-guide-id="nav.logo"
              data-guide-type="ui"
              onClick={() => onSelectTab('home')}
              className="flex items-center gap-1.5 sm:gap-2.5 cursor-pointer group select-none min-w-0 shrink-0"
            >
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full overflow-hidden shadow-sm border border-[var(--gold)] group-hover:scale-105 transition-transform duration-200 shrink-0 bg-[#0d3b26] flex items-center justify-center">
                <img 
                  src={siteLogo || DEFAULT_SITE_LOGO} 
                  alt="Hồn Đất Việt" 
                  className="w-full h-full object-contain scale-105"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    const parent = e.currentTarget.parentElement;
                    if (parent) {
                      parent.className = "w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[var(--primary)] flex items-center justify-center shadow-sm border border-[var(--gold)] group-hover:scale-105 transition-transform duration-200 shrink-0";
                      const textSpan = document.createElement('span');
                      textSpan.className = "text-sm sm:text-lg font-serif font-bold text-[#FFFDF8]";
                      textSpan.innerText = "H";
                      parent.appendChild(textSpan);
                    }
                  }}
                />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 whitespace-nowrap">
                  <span className="font-serif font-bold tracking-wide text-sm sm:text-lg text-[var(--text)] group-hover:text-[var(--primary)] transition-colors whitespace-nowrap">
                    HỒN ĐẤT <span className="text-[var(--primary)]">VIỆT</span>
                  </span>
                  <span className="hidden sm:inline-block text-[9px] sm:text-[10px] px-1.5 py-0.2 rounded-full bg-[var(--bg)] text-[var(--primary)] border border-[var(--gold)] font-bold whitespace-nowrap">
                    VN 4.0
                  </span>
                </div>
                <p className="text-[10px] sm:text-[11px] text-[var(--text-muted)] hidden md:block font-normal whitespace-nowrap">
                  {languageService.t('nav.brandTagline', language, 'Hiểu di sản. Khám phá Việt Nam.')}
                </p>
              </div>
            </div>
          </div>

          {/* Right actions — compact on mobile so all controls stay visible */}
          <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
            
            {/* 1. Authentication / Profile Status Button */}
            {userProfile.isLoggedIn ? (
              <button
                id="btn-profile"
                data-guide-id="nav.user"
                data-guide-type="ui"
                onClick={() => onSelectTab('profile')}
                className="flex items-center gap-1 px-2 py-1 sm:px-3 sm:py-1.5 rounded-xl bg-[var(--bg)] hover:bg-[#F3E5CD] border border-[var(--gold)] transition-all shrink-0 cursor-pointer"
                title={`Tài khoản: ${userProfile.displayName}`}
              >
                <User className="w-3.5 h-3.5 text-[var(--primary)] shrink-0" />
                <span className="text-[11px] sm:text-xs font-semibold text-[var(--text)] truncate max-w-[68px] xs:max-w-[90px] sm:max-w-[165px]">
                  {userProfile.displayName}
                </span>
              </button>
            ) : (
              <div className="flex items-center gap-1 shrink-0" data-guide-id="nav.user" data-guide-type="ui">
                <button
                  id="btn-login"
                  onClick={() => onOpenAuthModal('login')}
                  className="flex items-center gap-1 px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-xl bg-[var(--bg)] hover:bg-[#F3E5CD] text-[var(--text)] border border-[var(--gold)] text-[11px] sm:text-xs font-bold transition-all shrink-0 shadow-sm cursor-pointer whitespace-nowrap"
                  title="Đăng nhập tài khoản"
                >
                  <LogIn className="w-3.5 h-3.5 text-[var(--primary)] shrink-0" />
                  <span className="hidden sm:inline">{languageService.t('nav.login', language, 'Đăng nhập')}</span>
                </button>
                <button
                  id="btn-register"
                  onClick={() => onOpenAuthModal('register')}
                  className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-[#FFFDF8] text-xs font-extrabold shadow-sm transition-all shrink-0 active:scale-95 cursor-pointer border border-[var(--gold)] whitespace-nowrap"
                  title="Tạo tài khoản mới"
                >
                  <User className="w-3.5 h-3.5 text-[#FFFDF8] shrink-0" />
                  <span className="hidden md:inline">{languageService.t('nav.register', language, 'Đăng ký')}</span>
                </button>
              </div>
            )}

            {/* 2. "ĐỀ XUẤT MỚI" BUTTON */}
            {onOpenAddHeritage && (
              <button
                id="btn-nav-add-heritage"
                onClick={onOpenAddHeritage}
                className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-[#FFFDF8] font-extrabold text-xs shadow-sm transition-all shrink-0 active:scale-95 cursor-pointer border border-[var(--gold)]"
                title="Đề xuất thêm di sản hoặc địa điểm mới ngay lập tức"
              >
                <img 
                  src={siteLogo || DEFAULT_SITE_LOGO} 
                  alt="Logo Hồn Đất Việt" 
                  className="w-4 h-4 rounded-full object-contain bg-[#0d3b26] border border-[#FFFDF8]/60 shrink-0" 
                />
                <span className="hidden lg:inline">{languageService.t('nav.addHeritage', language, 'Đề Xuất Mới')}</span>
              </button>
            )}

            {/* 3. FAVORITES ICON */}
            <button
              id="btn-favorites"
              data-guide-id="nav.favorites"
              data-guide-type="ui"
              onClick={() => onSelectTab('favorites')}
              className="relative p-1.5 sm:p-2 rounded-xl text-[var(--text)] hover:text-[var(--primary)] hover:bg-[var(--bg)] transition-colors shrink-0 cursor-pointer"
              title="Danh sách di sản đã lưu"
            >
              <Heart className="w-4 h-4 text-[var(--primary)] fill-[var(--primary)]/20" />
              {favoritesCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-[var(--primary)] text-[#FFFDF8] text-[8px] font-bold flex items-center justify-center">
                  {favoritesCount}
                </span>
              )}
            </button>

            {/* Quick Peek Background Icon — also accessible on mobile to admire background */}
            {onPeekBackground && (
              <button
                id="btn-peek-background-nav"
                onClick={onPeekBackground}
                className="p-1.5 sm:p-2 rounded-xl text-[var(--text)] hover:text-[var(--jade)] hover:bg-[var(--bg)] transition-colors shrink-0 flex cursor-pointer"
                title={languageService.t('floating.peekBackground', language, 'Ngắm trọn vẹn bức ảnh nền danh thắng')}
              >
                <Eye className="w-4 h-4 text-[var(--jade)]" />
              </button>
            )}

            {/* Single Primary Language Selector */}
            <div className="relative flex items-center" data-guide-id="nav.language" data-guide-type="ui">
              <label htmlFor="nav-primary-language-select" className="sr-only">
                {languageService.t('lang.selectInterface', language, 'Chọn ngôn ngữ')}
              </label>
              <div className="relative flex items-center">
                <Globe className="absolute left-2 w-3 h-3 sm:w-3.5 sm:h-3.5 text-[var(--jade)] pointer-events-none" />
                <select
                  id="nav-primary-language-select"
                  value={language}
                  onChange={(e) => onLanguageChange(e.target.value)}
                  className="bg-[var(--bg)] hover:bg-[#F3E5CD] text-[var(--text)] text-[11px] sm:text-xs font-bold rounded-xl pl-6 pr-2 sm:pl-7 sm:pr-2.5 py-1 sm:py-1.5 border border-[var(--gold)] focus:outline-none focus:border-[var(--primary)] cursor-pointer shadow-sm transition-all select-none"
                  title="Chọn ngôn ngữ toàn website / Choose website language"
                  aria-label="Chọn ngôn ngữ website"
                >
                  {SUPPORTED_LANGUAGES.map((lang) => (
                    <option key={lang.code} value={lang.code} className="bg-[var(--surface)] text-[var(--text)] font-semibold py-1">
                      {lang.flag}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Offline Manager Button */}
            {onOpenOfflineManager && (
              <button
                id="btn-offline-mode"
                onClick={onOpenOfflineManager}
                className="hidden 2xl:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-[var(--bg)] hover:bg-[#F3E5CD] text-[var(--text)] border border-[var(--gold)] text-xs font-semibold transition-colors shrink-0"
                title="Quản lý Chế độ Ngoại tuyến & Service Worker"
              >
                <Database className="w-3.5 h-3.5 text-[var(--jade)]" />
                <span>{languageService.t('nav.offline', language, 'Ngoại tuyến')}</span>
              </button>
            )}

            {/* PWA In-App Install Button */}
            <div className="hidden 2xl:block shrink-0">
              <PWAInstallButton variant="button" language={language} />
            </div>

            {/* Mobile Website Overview Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="xl:hidden p-1.5 sm:p-2 rounded-xl bg-[var(--bg)] text-[var(--text)] hover:text-[var(--primary)] border border-[var(--gold)]/70 transition-colors shrink-0 cursor-pointer"
              aria-label="Tổng quan menu"
              title={language === 'en' ? 'Quick Website Overview' : 'Xem bao quát toàn bộ chức năng'}
            >
              {mobileMenuOpen ? <X className="w-4 h-4 sm:w-5 sm:h-5 text-[var(--primary)]" /> : <Menu className="w-4 h-4 sm:w-5 sm:h-5 text-[var(--primary)]" />}
            </button>
          </div>
        </div>

        {/* Row 2: Primary Nav — compact horizontal bar on mobile, spacious on desktop */}
        <nav className="flex items-center gap-1 sm:gap-1.5 py-1.5 sm:py-2 px-0.5 overflow-x-auto scrollbar-none border-t border-[var(--gold)]/40">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              currentTab === item.id ||
              (item.id === 'recognizer' && currentTab === 'recognize') ||
              (item.id === 'storyteller' && currentTab === 'story') ||
              (item.id === 'learning' && currentTab === 'quiz');
            const navGuideId =
              item.id === 'recognizer'
                ? 'nav.recognize'
                : item.id === 'storyteller'
                ? 'nav.story'
                : item.id === 'learning'
                ? 'nav.quiz'
                : `nav.${item.id}`;
            return (
              <button
                key={item.id}
                id={`nav-link-${item.id}`}
                data-guide-id={navGuideId}
                data-guide-type="ui"
                onClick={() => {
                  onSelectTab(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`relative px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-medium transition-all duration-150 flex items-center gap-1 sm:gap-1.5 whitespace-nowrap cursor-pointer shrink-0 ${
                  isActive 
                    ? 'bg-[var(--primary)] text-[#FFFDF8] border border-[var(--gold)] shadow-[0_2px_10px_rgba(179,38,30,0.25)] font-bold' 
                    : 'text-[var(--text)] hover:text-[var(--primary)] hover:bg-[var(--bg)]'
                }`}
                title={item.label}
              >
                <Icon className={`w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0 ${isActive ? 'text-[#FFFDF8]' : 'text-[var(--gold)]'}`} />
                <span>{item.label}</span>
                {item.badge && (
                  <span
                    className={`hidden sm:inline-block text-[9px] px-1.5 py-0.2 font-extrabold rounded shrink-0 ${
                      isActive
                        ? 'bg-[#FFFDF8] text-[var(--primary)]'
                        : item.id === 'map'
                        ? 'bg-[var(--jade)] text-[#FFFDF8]'
                        : 'bg-[var(--bg)] border border-[var(--gold)] text-[var(--primary)]'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Mobile Quick Overview Drawer (khi bấm nút Menu góc phải) */}
        {mobileMenuOpen && (
          <div className="xl:hidden py-3 border-t border-[var(--gold)]/60 bg-[#FFFDF8] space-y-2.5 animate-fadeIn">
            <div className="flex items-center justify-between px-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--primary)]">
                {language === 'en' ? 'Website Overview · All Spaces' : 'Bao quát nhanh toàn bộ trang web'}
              </span>
              {onOpenAddHeritage && (
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenAddHeritage();
                  }}
                  className="px-2.5 py-1 rounded-lg bg-[var(--primary)] text-[#FFFDF8] text-[11px] font-bold flex items-center gap-1 border border-[var(--gold)]"
                >
                  <Plus className="w-3 h-3" />
                  <span>{languageService.t('nav.addHeritage', language, 'Đề Xuất Mới')}</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
              {navItems.map((item, idx) => {
                const Icon = item.icon;
                const isActive =
                  currentTab === item.id ||
                  (item.id === 'recognizer' && currentTab === 'recognize') ||
                  (item.id === 'storyteller' && currentTab === 'story') ||
                  (item.id === 'learning' && currentTab === 'quiz');
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      onSelectTab(item.id);
                      setMobileMenuOpen(false);
                    }}
                    className={`p-2 rounded-xl border text-left flex items-center gap-2 transition-all cursor-pointer ${
                      isActive
                        ? 'bg-[var(--primary)] text-[#FFFDF8] border-[var(--gold)] font-bold shadow-sm'
                        : 'bg-[var(--bg)] text-[var(--text)] border-[var(--gold)]/60 hover:border-[var(--primary)]'
                    }`}
                  >
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#FFFDF8]' : 'text-[var(--primary)]'}`} />
                    <span className="text-xs truncate">
                      {idx > 0 ? `0${idx}. ` : ''}{item.label}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 pt-1.5 border-t border-[var(--gold)]/40 text-xs">
              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    onSelectTab('crafts');
                    setMobileMenuOpen(false);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-[var(--bg)] border border-[var(--gold)] text-[var(--text)] font-semibold"
                >
                  {language === 'en' ? 'Craft Villages & Arts' : 'Làng nghề & Nghệ thuật'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onSelectTab('food');
                    setMobileMenuOpen(false);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-[var(--bg)] border border-[var(--gold)] text-[var(--text)] font-semibold"
                >
                  {language === 'en' ? 'Regional Cuisine' : 'Ẩm thực 3 miền'}
                </button>
                {onOpenOfflineManager && (
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onOpenOfflineManager();
                    }}
                    className="px-2.5 py-1 rounded-lg bg-[var(--bg)] border border-[var(--gold)] text-[var(--jade)] font-semibold flex items-center gap-1"
                  >
                    <Database className="w-3 h-3" />
                    <span>{languageService.t('nav.offline', language, 'Ngoại tuyến')}</span>
                  </button>
                )}
              </div>
              <PWAInstallButton variant="button" language={language} />
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
