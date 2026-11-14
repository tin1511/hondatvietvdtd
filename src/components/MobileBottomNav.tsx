import React, { useState } from 'react';
import { 
  Compass, 
  Camera, 
  Sparkles, 
  MessageSquareQuote, 
  Globe, 
  Menu, 
  X, 
  Utensils, 
  CalendarDays, 
  Mic, 
  BookOpen, 
  Award, 
  Heart, 
  Users, 
  ShieldCheck, 
  MapPin,
  ChevronUp,
  Eye
} from 'lucide-react';
import { UserProfile, CityLandmarkBackground } from '../types';
import { languageService } from '../services/languageService';

interface MobileBottomNavProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  favoritesCount: number;
  userProfile: UserProfile;
  language?: string;
  onOpenCityPicker?: () => void;
  currentLandmark?: CityLandmarkBackground;
  onPeekBackground?: () => void;
  onExploreLandmark?: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  currentTab,
  onSelectTab,
  favoritesCount,
  userProfile,
  language = 'vi',
  onOpenCityPicker,
  currentLandmark,
  onPeekBackground,
  onExploreLandmark
}) => {
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);

  const mainBottomTabs = [
    { id: 'home', label: languageService.t('mobile.home', language, 'Home'), icon: Compass },
    { id: 'map', label: languageService.t('mobile.map', language, 'Bản đồ'), icon: Globe },
    { id: 'recognize', label: languageService.t('mobile.recognizer', language, 'Di tích'), icon: Camera, badge: 'AI' },
    { id: 'story', label: languageService.t('mobile.storyteller', language, 'Cổ phục'), icon: Sparkles },
  ];

  const moreMenuItems = [
    { 
      id: 'crafts', 
      label: languageService.t('tools.crafts', language, 'Làng nghề'), 
      description: languageService.t('tools.craftsDesc', language, 'Gốm Bát Tràng, lụa Vạn Phúc, tranh Đông Hồ & nghệ thuật cổ'), 
      icon: BookOpen, 
      color: 'text-[var(--jade)]',
      bg: 'bg-[#E2F2F0]'
    },
    { 
      id: 'food', 
      label: languageService.t('tools.food', language, 'Ẩm thực'), 
      description: languageService.t('tools.foodDesc', language, 'Đặc sản 3 miền & quán ngon quanh di sản'), 
      icon: Utensils, 
      color: 'text-[var(--primary)]',
      bg: 'bg-[#FCEAE8]'
    },
    { 
      id: 'itinerary', 
      label: languageService.t('tools.itinerary', language, 'Gợi ý hành trình'), 
      description: languageService.t('tools.itineraryDesc', language, 'Lên tour văn hóa thông minh theo giờ & sở thích'), 
      icon: CalendarDays, 
      color: 'text-[var(--jade)]',
      bg: 'bg-[#E2F2F0]'
    },
    { 
      id: 'learning', 
      label: languageService.t('tools.learning', language, 'Quiz & Thử Thách Di Sản'), 
      description: languageService.t('tools.learningDesc', language, 'Trắc nghiệm văn hóa & tích điểm thăng hạng'), 
      icon: Award, 
      color: 'text-[var(--primary)]',
      bg: 'bg-[#FBF3E4]'
    },
    { 
      id: 'favorites', 
      label: languageService.t('tools.favorites', language, 'Bộ Sưu Tập Yêu Thích'), 
      description: `${favoritesCount} ${languageService.t('detail.saved', language, 'địa danh đã lưu')}`, 
      icon: Heart, 
      color: 'text-[var(--primary)]',
      bg: 'bg-[#FCEAE8]',
      badge: favoritesCount > 0 ? `${favoritesCount}` : undefined
    },
    { 
      id: 'profile', 
      label: languageService.t('tools.profile', language, 'Hồ Sơ & Danh Hiệu'), 
      description: `${userProfile.displayName || 'Khách'} (${userProfile.points || 0} XP)`, 
      icon: Award, 
      color: 'text-[var(--primary)]',
      bg: 'bg-[#FBF3E4]'
    },
    { 
      id: 'community', 
      label: languageService.t('tools.community', language, 'Cộng Đồng Di Sản'), 
      description: languageService.t('tools.communityDesc', language, 'Đóng góp ảnh & chia sẻ câu chuyện cùng mọi người'), 
      icon: Users, 
      color: 'text-[var(--jade)]',
      bg: 'bg-[#E2F2F0]'
    },
  ];

  const handleSelectTab = (tabId: string) => {
    onSelectTab(tabId);
    setIsMoreMenuOpen(false);
  };

  return (
    <>
      {/* Fixed Bottom Navigation Bar (Home, Bản đồ, Di tích, Cổ phục, Khám phá) */}
      <nav 
        id="mobile-bottom-nav" 
        aria-label={languageService.t('mobile.navigation', language, 'Thanh điều hướng cố định')}
        className="md:hidden fixed inset-x-0 bottom-0 z-40 bg-[#FFFDF8]/96 backdrop-blur-md border-t border-[var(--gold)] shadow-[0_-4px_18px_rgba(59,42,32,0.1)] pb-[env(safe-area-inset-bottom)] transition-transform duration-200"
      >
        <div className="grid grid-cols-5 items-stretch min-h-[54px] px-1 max-w-2xl mx-auto">
          {mainBottomTabs.map((item) => {
            const Icon = item.icon;
            const isActive =
              (currentTab === item.id ||
                (item.id === 'recognize' && currentTab === 'recognizer') ||
                (item.id === 'story' && currentTab === 'storyteller')) &&
              !isMoreMenuOpen;
            const guideId =
              item.id === 'home'
                ? 'nav.home'
                : item.id === 'recognize'
                ? 'nav.recognize'
                : item.id === 'story'
                ? 'nav.story'
                : 'nav.map';
            return (
              <button
                key={item.id}
                id={`mobile-tab-${item.id}`}
                data-guide-id={guideId}
                data-guide-type="ui"
                onClick={() => handleSelectTab(item.id)}
                className={`relative min-h-[48px] min-w-0 flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-colors duration-150 active:bg-[var(--bg)] cursor-pointer ${
                  isActive 
                    ? 'text-[var(--primary)] font-extrabold' 
                    : 'text-[var(--text-muted)] hover:text-[var(--text)] font-semibold'
                }`}
              >
                {isActive && (
                  <span className="absolute top-0 w-8 h-1 bg-[var(--primary)] rounded-full shadow-sm" />
                )}
                <div className="relative">
                  <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110 text-[var(--primary)]' : 'text-[var(--text-muted)]'}`} />
                  {item.badge && !isActive && (
                    <span className="absolute -top-1 -right-2.5 px-1 py-0.2 bg-[var(--primary)] text-[#FFFDF8] text-[8px] font-extrabold rounded-full">
                      {item.badge}
                    </span>
                  )}
                </div>
                <span className="text-[11px] leading-tight mt-1 tracking-tight text-center truncate w-full px-0.5">
                  {item.label}
                </span>
              </button>
            );
          })}

          {/* Khám phá / More Drawer Button */}
          <button
            id="mobile-tab-more"
            data-guide-id="nav.more"
            data-guide-type="ui"
            aria-expanded={isMoreMenuOpen}
            aria-controls="mobile-more-features-sheet"
            aria-label={languageService.t('mobile.more', language, 'Khám phá thêm tính năng')}
            onClick={() => setIsMoreMenuOpen(!isMoreMenuOpen)}
            className={`relative min-h-[48px] min-w-0 flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-colors duration-150 active:bg-[var(--bg)] cursor-pointer ${
              isMoreMenuOpen || ['food', 'itinerary', 'crafts', 'learning', 'quiz', 'favorites', 'profile', 'community', 'admin'].includes(currentTab)
                ? 'text-[var(--primary)] font-extrabold' 
                : 'text-[var(--text-muted)] hover:text-[var(--text)] font-semibold'
            }`}
          >
            {isMoreMenuOpen && (
              <span className="absolute top-0 w-8 h-1 bg-[var(--primary)] rounded-full shadow-sm" />
            )}
            <div className="relative">
              {isMoreMenuOpen ? (
                <X className="w-5 h-5 text-[var(--primary)]" />
              ) : (
                <Menu className="w-5 h-5 text-[var(--text-muted)]" />
              )}
              {favoritesCount > 0 && (
                <span className="absolute -top-1 -right-1.5 w-3.5 h-3.5 bg-[var(--primary)] text-[#FFFDF8] text-[8px] font-bold rounded-full flex items-center justify-center">
                  {favoritesCount}
                </span>
              )}
            </div>
            <span className="text-[11px] leading-tight mt-1 tracking-tight text-center truncate w-full px-0.5">
              {isMoreMenuOpen ? languageService.t('lang.close', language, 'Đóng') : languageService.t('mobile.more', language, 'Khám phá')}
            </span>
          </button>
        </div>
      </nav>

      {/* "More Features / Khám phá" Bottom Sheet Modal */}
      {isMoreMenuOpen && (
        <div 
          className="fixed inset-0 z-50 flex flex-col justify-end bg-[#3B2A20]/55 backdrop-blur-sm animate-fadeIn"
          onClick={() => setIsMoreMenuOpen(false)}
        >
          <div 
            id="mobile-more-features-sheet"
            role="dialog"
            aria-modal="true"
            aria-label={languageService.t('tools.title', language, 'Tất Cả Tính Năng Di Sản')}
            className="w-full max-w-2xl mx-auto bg-[var(--surface)] border-t border-[var(--gold)] rounded-t-3xl max-h-[calc(100dvh-4.5rem)] overflow-y-auto overscroll-contain pb-[calc(env(safe-area-inset-bottom)+1rem)] shadow-[0_-12px_36px_rgba(59,42,32,0.22)] p-4 sm:p-6 space-y-4 animate-slideUp"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header / Grab Bar */}
            <div className="flex flex-col items-center">
              <div className="w-12 h-1.5 bg-[var(--gold)]/60 rounded-full mb-3" />
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full overflow-hidden bg-[#0d3b26] border border-[var(--gold)] flex items-center justify-center shrink-0">
                    <img src="/hon_dat_viet_logo.webp" alt="Hồn Đất Việt" className="w-full h-full object-contain scale-105" />
                  </div>
                  <div>
                    <h3 className="font-serif font-bold text-base text-[var(--text)]">
                      {languageService.t('tools.title', language, 'Tất Cả Tính Năng Di Sản')}
                    </h3>
                    <p className="text-[11px] text-[var(--text-muted)]">
                      {languageService.t('tools.desc', language, 'Chạm để chuyển nhanh sang chuyên mục mong muốn')}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setIsMoreMenuOpen(false)}
                  className="p-2 rounded-full bg-[var(--bg)] text-[var(--text)] hover:text-[var(--primary)] border border-[var(--gold)]/50"
                  title={languageService.t('mobile.close', language, 'Đóng menu')}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* GPS Landmark Background Switcher Shortcut */}
            {currentLandmark && (
              <div className="p-3 bg-[var(--bg)] rounded-2xl border border-[var(--gold)] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <div 
                  onClick={() => {
                    if (onOpenCityPicker) {
                      setIsMoreMenuOpen(false);
                      onOpenCityPicker();
                    }
                  }}
                  className="flex items-center gap-3 min-w-0 cursor-pointer flex-1"
                >
                  <div className="w-11 h-11 rounded-xl overflow-hidden shrink-0 border border-[var(--gold)]">
                    <img src={currentLandmark.imageUrl} alt={currentLandmark.landmarkName} className="w-full h-full object-cover" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1 text-xs font-bold text-[var(--jade)]">
                      <MapPin className="w-3.5 h-3.5 text-[var(--jade)] shrink-0" />
                      <span className="truncate">{currentLandmark.cityName} • {currentLandmark.landmarkName}</span>
                    </div>
                    <p className="text-[11px] text-[var(--text-muted)] truncate">
                      {languageService.t('hero.gpsNearest', language, 'Ảnh nền danh thắng theo tọa độ')}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0 flex-wrap sm:flex-nowrap">
                  {onExploreLandmark && (
                    <button
                      type="button"
                      id="btn-mobile-explore-landmark"
                      onClick={() => {
                        setIsMoreMenuOpen(false);
                        onExploreLandmark();
                      }}
                      className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1 text-[11px] px-2.5 py-1.5 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-[#FFFDF8] font-extrabold rounded-lg active:scale-95 transition-all shadow-sm"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-[#FFFDF8]" />
                      <span>{languageService.t('btn.details', language, 'Khám phá')}</span>
                    </button>
                  )}
                  {onPeekBackground && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsMoreMenuOpen(false);
                        onPeekBackground();
                      }}
                      className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1 text-[11px] px-2.5 py-1.5 bg-[var(--surface)] hover:bg-[#F3E5CD] text-[var(--text)] border border-[var(--gold)] rounded-lg active:scale-95 transition-all"
                    >
                      <Eye className="w-3.5 h-3.5 text-[var(--jade)]" />
                      <span>{languageService.t('floating.peekBackground', language, 'Ngắm ảnh')}</span>
                    </button>
                  )}
                  {onOpenCityPicker && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsMoreMenuOpen(false);
                        onOpenCityPicker();
                      }}
                      className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1 text-[11px] px-2.5 py-1.5 bg-[var(--surface)] hover:bg-[#F3E5CD] text-[var(--jade)] border border-[var(--gold)] font-bold rounded-lg active:scale-95 transition-all"
                    >
                      <span>{languageService.t('floating.changeLandmark', language, 'Đổi cảnh')}</span>
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Grid of All Core Extra Modules */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
              {moreMenuItems.map((item) => {
                const Icon = item.icon;
                const isItemActive = currentTab === item.id;
                return (
                  <div
                    key={item.id}
                    onClick={() => handleSelectTab(item.id)}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center gap-3 active:scale-[0.98] ${
                      isItemActive 
                        ? 'bg-[#FCEAE8] border-[var(--primary)] text-[var(--text)] shadow-sm' 
                        : 'bg-[var(--bg)] border-[var(--gold)]/65 hover:border-[var(--primary)] text-[var(--text)]'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-xl ${item.bg} ${item.color} border border-[var(--gold)]/50 flex items-center justify-center shrink-0`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <h4 className={`text-sm font-bold whitespace-normal break-words ${isItemActive ? 'text-[var(--primary)]' : 'text-[var(--text)]'}`}>
                          {item.label}
                        </h4>
                        {item.badge && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-[var(--primary)] text-[#FFFDF8] font-extrabold shrink-0">
                            {item.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] leading-snug text-[var(--text-muted)] whitespace-normal break-words mt-0.5">
                        {item.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Admin Dashboard link if needed */}
            <div className="pt-2 border-t border-[var(--gold)]/50 flex items-center justify-between text-xs text-[var(--text-muted)]">
              <button
                onClick={() => handleSelectTab('admin')}
                className="flex items-center gap-1.5 text-[var(--primary)] hover:text-[var(--primary-hover)] font-bold py-1"
              >
                <ShieldCheck className="w-4 h-4 text-[var(--primary)]" />
                <span>Trang Quản trị & Kiểm định Di sản</span>
              </button>
              <span>Hồn Đất Việt v4.0</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
