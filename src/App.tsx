import React, { useState, useEffect, useRef, Suspense, lazy } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Compass, 
  Camera, 
  Volume2, 
  MessageSquareQuote, 
  MapPin, 
  Utensils, 
  CalendarDays, 
  FolderHeart, 
  BookOpen, 
  Sparkles, 
  Users, 
  ShieldCheck, 
  ChevronRight,
  Globe,
  Award,
  Heart,
  Share2,
  Layers,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  ExternalLink,
  Mic,
  History,
  UserCheck,
  Eye,
  EyeOff
} from 'lucide-react';
import { Navbar } from './components/Navbar';
import { HomeFeedView } from './components/HomeFeedView';

// Lazy-load heavy tab modules so Home loads fast and each tab is code-split into its own chunk
const CulturalMap = lazy(() =>
  import('./components/CulturalMap').then(m => ({ default: m.CulturalMap }))
);
const ImageRecognizer = lazy(() =>
  import('./components/ImageRecognizer').then(m => ({ default: m.ImageRecognizer }))
);
const StoryPlayer = lazy(() =>
  import('./components/StoryPlayer').then(m => ({ default: m.StoryPlayer }))
);
const FoodAndEntertainmentModule = lazy(() =>
  import('./components/FoodAndEntertainmentModule').then(m => ({
    default: m.FoodAndEntertainmentModule
  }))
);
const ItineraryPlanner = lazy(() =>
  import('./components/ItineraryPlanner').then(m => ({ default: m.ItineraryPlanner }))
);
const TraditionalCraftsAndArts = lazy(() =>
  import('./components/TraditionalCraftsAndArts').then(m => ({
    default: m.TraditionalCraftsAndArts
  }))
);
const HeritageLearning = lazy(() =>
  import('./components/HeritageLearning').then(m => ({ default: m.HeritageLearning }))
);
const CommunityContributionModule = lazy(() =>
  import('./components/CommunityContribution').then(m => ({
    default: m.CommunityContributionModule
  }))
);
const AdminDashboard = lazy(() =>
  import('./components/AdminDashboard').then(m => ({ default: m.AdminDashboard }))
);
const FavoritesView = lazy(() =>
  import('./components/FavoritesView').then(m => ({ default: m.FavoritesView }))
);
const UserProfileView = lazy(() =>
  import('./components/UserProfileView').then(m => ({ default: m.UserProfileView }))
);
import { AuthModal } from './components/AuthModal';
import { AuthGateway } from './components/AuthGateway';
import { CityLandmarkModal } from './components/CityLandmarkModal';
import { HeritageDetailModal } from './components/HeritageDetailModal';
import { GuideCharacter } from './components/GuideCharacter';
import { MobileBottomNav } from './components/MobileBottomNav';
import { OfflineIndicator } from './components/OfflineIndicator';
import { OfflineHeritageManagerModal } from './components/OfflineHeritageManagerModal';
import { MobileAppDownloadBanner } from './components/MobileAppDownloadBanner';
import { MobileAppDownloadModal } from './components/MobileAppDownloadModal';
import { HeritageEditModal } from './components/HeritageEditModal';
import { PlaceEditModal } from './components/PlaceEditModal';
import { HeritageItem, UserProfile, CityLandmarkBackground } from './types';
import { HERITAGE_DATABASE, getPlacesForHeritage } from './data/vietnamHeritageData';
import { storageService, applySiteLogoToDom } from './services/storageService';
import { geolocationService, CITY_LANDMARK_PRESETS } from './services/geolocationService';
import { getHeritageForLandmark } from './services/landmarkHeritageService';
import { loadAIConfigFromFirebase, loadTTSConfigFromFirebase } from './services/systemConfigService';
import { languageService } from './services/languageService';
import { guideVoiceService, triggerGuideNarration } from './services/guideVoiceService';
import { getHeritageIntroText, getFoodRecommendationIntroText } from './data/guideIntroData';
import { MAP_OPEN_ROUTE_EVENT, MapRouteRequestPayload } from './services/routeNavigationService';
import { DongSonWatermarkSvg } from './components/DynamicHeritageBackground';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('home');
  const homeScrollYRef = useRef<number>(0);
  const activeTabRef = useRef<string>('home');
  const [language, setLanguage] = useState<string>(() => languageService.loadLanguage());
  const [favoritesCount, setFavoritesCount] = useState<number>(2);
  const [userProfile, setUserProfile] = useState<UserProfile>(storageService.getUserProfile());

  // Dynamic GPS Landmark Background for the entire website
  const [currentLandmark, setCurrentLandmark] = useState<CityLandmarkBackground>(CITY_LANDMARK_PRESETS[0]);
  const [isDetectingGps, setIsDetectingGps] = useState<boolean>(false);
  const [locationSource, setLocationSource] = useState<'gps' | 'preset' | 'default'>('default');
  const [detectedLocationName, setDetectedLocationName] = useState<string>('Đà Nẵng');
  const [showCityPicker, setShowCityPicker] = useState<boolean>(false);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [isPeekingBackground, setIsPeekingBackground] = useState<boolean>(false);

  // Auth Modal State
  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);
  const [authModalTab, setAuthModalTab] = useState<'login' | 'register' | 'profile' | 'activity'>('login');

  // Cross-component state transfers
  const [storyInitialTopic, setStoryInitialTopic] = useState<{
    name: string;
    history?: string;
    period?: string;
  } | undefined>(undefined);

  const [selectedFoodHeritageId, setSelectedFoodHeritageId] = useState<string>('dai-noi-hue');
  const [pendingMapRoute, setPendingMapRoute] = useState<MapRouteRequestPayload | null>(null);
  const [selectedDetailHeritage, setSelectedDetailHeritage] = useState<HeritageItem | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState<boolean>(false);
  const [isOfflineModalOpen, setIsOfflineModalOpen] = useState<boolean>(false);
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState<boolean>(false);
  const [isGlobalHeritageModalOpen, setIsGlobalHeritageModalOpen] = useState<boolean>(false);
  const [isGlobalPlaceModalOpen, setIsGlobalPlaceModalOpen] = useState<boolean>(false);

  // Auto-detect GPS and match city's iconic landmark on app load
  useEffect(() => {
    const saved = geolocationService.getLastKnownLocation();
    if (saved) {
      const landmark = geolocationService.getCityLandmarkForCoordinates(saved.lat, saved.lng);
      setCurrentLandmark(landmark);
      setDetectedLocationName(landmark.cityName);
      setLocationSource(saved.source === 'gps' ? 'gps' : 'preset');
    }

    const detectGps = async () => {
      try {
        const res = await geolocationService.requestCurrentPosition();
        if (res.success && res.location) {
          const landmark = geolocationService.getCityLandmarkForCoordinates(res.location.lat, res.location.lng);
          setCurrentLandmark(landmark);
          setLocationSource('gps');
          const reverseName = await geolocationService.reverseGeocodeCity(res.location.lat, res.location.lng);
          setDetectedLocationName(reverseName || landmark.cityName);
        }
      } catch {
        // Fallback gracefully to default
      }
    };

    // Fetch and sync accounts & all 63 provinces heritages from server database
    storageService.fetchAccounts().then(accounts => {
      const current = storageService.getCurrentUser();
      if (current.isLoggedIn) {
        const refreshed = accounts.find(a => a.id === current.id || a.email.toLowerCase() === current.email.toLowerCase());
        if (refreshed) setUserProfile(refreshed);
      }
    }).catch(err => console.warn('Sync accounts error:', err));
    storageService.fetchHeritages().catch(err => console.warn('Sync heritages error:', err));

    // Sync active AI & TTS API configurations from Firebase Firestore
    loadAIConfigFromFirebase().catch(() => {});
    loadTTSConfigFromFirebase().catch(() => {});

    // Apply site logo & PWA app icon synchronization to DOM
    applySiteLogoToDom(storageService.getSiteLogo());
    const handleLogoChanged = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail) {
        applySiteLogoToDom(customEvent.detail);
      }
    };
    window.addEventListener('hdv_site_logo_changed', handleLogoChanged);

    // Synchronize global language changes
    const handleLanguageChanged = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail?.language) {
        setLanguage(customEvent.detail.language);
      }
    };
    window.addEventListener('hdv_language_changed', handleLanguageChanged);

    // Listen for in-app map route requests from FoodAndEntertainmentModule or 3D GuideCharacter
    const handleOpenMapRoute = (e: Event) => {
      const customEvent = e as CustomEvent<MapRouteRequestPayload>;
      if (customEvent.detail?.heritageId) {
        setPendingMapRoute(customEvent.detail);
        setActiveTab('map');
      }
    };
    window.addEventListener(MAP_OPEN_ROUTE_EVENT, handleOpenMapRoute);

    detectGps();

    return () => {
      window.removeEventListener('hdv_site_logo_changed', handleLogoChanged);
      window.removeEventListener('hdv_language_changed', handleLanguageChanged);
      window.removeEventListener(MAP_OPEN_ROUTE_EVENT, handleOpenMapRoute);
    };
  }, []);

  // Ghi nhớ vị trí cuộn của trang Home liên tục và khôi phục chính xác khi quay lại Home (kèm scroll-snap y mandatory)
  useEffect(() => {
    activeTabRef.current = activeTab;
    const htmlEl = document.documentElement;
    if (activeTab === 'home') {
      const targetY = homeScrollYRef.current;
      htmlEl.style.scrollSnapType = 'none';
      htmlEl.style.scrollBehavior = 'auto';
      window.scrollTo({ top: targetY, left: 0, behavior: 'instant' });
      const rafId = window.requestAnimationFrame(() => {
        window.scrollTo({ top: targetY, left: 0, behavior: 'instant' });
        htmlEl.style.scrollSnapType = 'y mandatory';
        htmlEl.style.scrollBehavior = 'smooth';
      });
      return () => {
        window.cancelAnimationFrame(rafId);
      };
    } else {
      htmlEl.style.scrollSnapType = 'none';
      htmlEl.style.scrollBehavior = 'auto';
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      if (document.body) document.body.scrollTop = 0;
      htmlEl.scrollTop = 0;
      const rafId = window.requestAnimationFrame(() => {
        htmlEl.style.scrollBehavior = 'smooth';
      });
      return () => window.cancelAnimationFrame(rafId);
    }
  }, [activeTab]);

  useEffect(() => {
    const handleScroll = () => {
      if (activeTabRef.current === 'home') {
        homeScrollYRef.current = window.scrollY || document.documentElement.scrollTop || 0;
      }
    };
    const handlePopState = (e: PopStateEvent) => {
      const nextTab = e.state?.tab || 'home';
      if (activeTabRef.current === 'home' && nextTab !== 'home') {
        homeScrollYRef.current = window.scrollY || document.documentElement.scrollTop || 0;
      }
      setActiveTab(nextTab);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  // Keep document language and browser-tab branding synchronized with the selected language.
  useEffect(() => {
    document.documentElement.lang = language;
    document.title = language === 'en'
      ? 'HỒN ĐẤT VIỆT | Discover Vietnam Heritage & Culture'
      : 'HỒN ĐẤT VIỆT | Khám phá Di sản & Văn hóa Việt Nam';
    languageService.translateDOM(language);
  }, [activeTab, language]);

  const handleDetectGps = async () => {
    setIsDetectingGps(true);
    setGpsError(null);
    try {
      const res = await geolocationService.requestCurrentPosition();
      if (res.success && res.location) {
        const landmark = geolocationService.getCityLandmarkForCoordinates(res.location.lat, res.location.lng);
        setCurrentLandmark(landmark);
        setLocationSource('gps');
        const reverseName = await geolocationService.reverseGeocodeCity(res.location.lat, res.location.lng);
        setDetectedLocationName(reverseName || landmark.cityName);
      } else if (res.error) {
        setGpsError(res.error);
      }
    } catch {
      setGpsError('Không thể lấy tọa độ GPS từ trình duyệt.');
    } finally {
      setIsDetectingGps(false);
    }
  };

  const handleSelectLandmarkPreset = (landmark: CityLandmarkBackground) => {
    setCurrentLandmark(landmark);
    setDetectedLocationName(landmark.cityName);
    setLocationSource('preset');
    setShowCityPicker(false);
    setGpsError(null);

    storageService.logActivity({
      actionType: 'landmark',
      title: 'Đổi ảnh nền danh thắng',
      description: `Đã đổi cảnh sắc sang "${landmark.landmarkName}" (${landmark.cityName} - ${landmark.province})`,
      targetId: landmark.id,
      pointsEarned: 5
    });
  };

  useEffect(() => {
    setFavoritesCount(storageService.getFavorites().length);
    setUserProfile(storageService.getUserProfile());
  }, [activeTab]);

  const handleOpenAuthModal = (tab: 'login' | 'register' | 'profile' | 'activity' = 'login') => {
    setAuthModalTab(tab);
    setAuthModalOpen(true);
  };

  const handleLogout = () => {
    const guest = storageService.logout();
    setUserProfile(guest);
    setAuthModalOpen(false);
  };

  const switchTabPreservingHomeScroll = (nextTab: string) => {
    if (activeTabRef.current === 'home' && nextTab !== 'home') {
      homeScrollYRef.current = window.scrollY || document.documentElement.scrollTop || 0;
    }
    if (nextTab !== activeTabRef.current) {
      try {
        window.history.pushState({ tab: nextTab }, '');
      } catch {
        // ignore history error in restricted iframe
      }
    }
    setActiveTab(nextTab);
  };

  const handleNavigate = (tab: string, heritageId?: string) => {
    if (tab === 'heritage') {
      if (heritageId) {
        setSelectedFoodHeritageId(heritageId);
      }
      switchTabPreservingHomeScroll('map');
    } else if (tab === 'recognizer') {
      switchTabPreservingHomeScroll('recognize');
    } else if (tab === 'storyteller') {
      switchTabPreservingHomeScroll('story');
    } else if (tab === 'learning') {
      switchTabPreservingHomeScroll('quiz');
    } else if (tab === 'profile' || tab === 'badges') {
      switchTabPreservingHomeScroll('profile');
      setAuthModalOpen(false);
    } else if (tab === 'activity' || tab === 'history') {
      switchTabPreservingHomeScroll('profile');
      setAuthModalOpen(false);
    } else {
      switchTabPreservingHomeScroll(tab);
    }
  };

  const handleNavigateToStory = (name: string, history?: string, period?: string) => {
    setStoryInitialTopic({ name, history, period });
    switchTabPreservingHomeScroll('story');
  };

  const handleNavigateToFood = (heritageId: string) => {
    guideVoiceService.unlockAudioOnUserGesture();
    setSelectedFoodHeritageId(heritageId);
    switchTabPreservingHomeScroll('food');

    const currentLang = language === 'en' ? 'en' : 'vi';
    const heritage = HERITAGE_DATABASE.find((h) => h.id === heritageId);
    const allPlacesMap = storageService.getPlaces();
    const places = getPlacesForHeritage(heritageId, allPlacesMap);
    const introText = getFoodRecommendationIntroText(heritage, places, currentLang);

    triggerGuideNarration({
      id: `food-recommend-${heritageId}-${Date.now()}`,
      title:
        currentLang === 'en'
          ? `Nearby Cuisine · ${heritage?.englishName || heritage?.name || 'Heritage'}`
          : `Ẩm thực gần ${heritage?.name || 'Di sản'}`,
      subtitleBadge:
        heritage?.province || (currentLang === 'en' ? 'Culinary Guide' : 'Đề xuất Ẩm thực'),
      introText,
      targetType: 'food_recommendation',
      heritageId,
      provinceName: heritage?.province,
      lang: currentLang,
      recommendedPlaces: places.slice(0, 3).map((p) => ({
        id: p.id,
        name: p.name,
        categoryLabel: p.categoryLabel,
        rating: p.rating,
        distanceKm: p.distanceKm,
        priceText: p.priceText,
        specialties: p.specialties,
        googleMapsUri: p.googleMapsUri,
        address: p.address,
      })),
    });
  };

  const handleSelectHeritage = (heritage: HeritageItem) => {
    setSelectedFoodHeritageId(heritage.id);
    setSelectedDetailHeritage(heritage);
    setIsDetailModalOpen(true);
    const currentLang = language === 'en' ? 'en' : 'vi';
    triggerGuideNarration({
      id: `heritage-${heritage.id}`,
      title: heritage.name,
      subtitleBadge: heritage.province,
      introText: getHeritageIntroText(heritage, currentLang),
      targetType: 'heritage',
      lang: currentLang,
    });
  };

  const handleExploreCurrentLandmark = () => {
    const item = getHeritageForLandmark(currentLandmark);
    handleSelectHeritage(item);
  };

  const handleUserChange = (user: UserProfile) => {
    setUserProfile(user);
    setFavoritesCount(storageService.getFavorites().length);
  };

  return (
    <div className="min-h-screen text-[var(--text)] flex flex-col font-sans selection:bg-[var(--primary)] selection:text-[#FFFDF8] relative bg-[var(--bg)]">
      
      {/* 🖼️ 10.3. Khi Ngắm ảnh nền (isPeekingBackground) ở các tab khác ngoài Home: hiển thị trọn vẹn bức ảnh danh thắng.
          Khi ở tab Home: chính các màn hình full-screen của Home sẽ ẩn toàn bộ thẻ chữ & thanh điều hướng để lộ 100% ảnh nền thực tế của từng mục. */}
      {isPeekingBackground && activeTab !== 'home' ? (
        <div
          onClick={() => setIsPeekingBackground(false)}
          className="fixed inset-0 pointer-events-auto z-0 overflow-hidden select-none cursor-pointer bg-[var(--bg)]"
          title="Chạm để quay lại giao diện"
        >
          <video
            key={currentLandmark.id + (currentLandmark.videoUrl || '/assets/aistudio/hue_imperial_hd_clean.mp4')}
            src={currentLandmark.videoUrl || '/assets/aistudio/hue_imperial_hd_clean.mp4'}
            poster={currentLandmark.imageUrl || '/assets/aistudio/hue_imperial_poster_hd.jpg'}
            autoPlay
            loop
            muted
            playsInline
            className="hdv-crisp-media w-full h-full object-cover object-center scale-100"
          />
        </div>
      ) : (
        activeTab !== 'home' &&
        activeTab !== 'map' && (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute top-0 inset-x-0 h-56 sm:h-72 z-0 overflow-hidden select-none"
          >
            <img
              key={currentLandmark.id + currentLandmark.imageUrl}
              src={currentLandmark.imageUrl}
              alt={currentLandmark.landmarkName}
              referrerPolicy="no-referrer"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/assets/aistudio/hue_imperial_poster_hd.jpg';
              }}
              className="hdv-crisp-media w-full h-full object-cover object-center opacity-22 saturate-95 animate-hdv-kenburns"
            />
            <DongSonWatermarkSvg
              className="absolute -top-16 -right-16 w-72 h-72 sm:w-96 sm:h-96"
              opacityClass="opacity-[0.14]"
            />
            <div
              className="absolute inset-0"
              style={{
                background:
                  'linear-gradient(180deg, rgba(251,243,228,0.45) 0%, rgba(251,243,228,0.82) 65%, #FBF3E4 100%)',
              }}
            />
          </div>
        )
      )}

      {/* Main UI Body Wrapper with Peeking Toggle (No CSS transform/scale here so position:fixed children stay viewport-locked) */}
      <div className={`relative z-10 flex-1 flex flex-col justify-between transition-opacity duration-300 ${
        isPeekingBackground && activeTab !== 'home' ? 'opacity-0 pointer-events-none invisible' : 'opacity-100 pointer-events-auto'
      }`}>

        {/* Navigation Bar (Ẩn mượt mà khi đang bật chế độ Ngắm toàn cảnh 100%) */}
      <div className={`${activeTab === 'home' ? 'fixed top-0 inset-x-0 z-40' : 'relative z-40'} transition-all duration-300 ${
        isPeekingBackground ? 'opacity-0 -translate-y-full pointer-events-none invisible' : 'opacity-100 translate-y-0'
      }`}>
        <Navbar
          currentTab={activeTab}
          onSelectTab={handleNavigate}
          favoritesCount={favoritesCount}
          userProfile={userProfile}
          language={language}
          onLanguageChange={(newLang) => {
            setLanguage(newLang);
            languageService.setLanguage(newLang);
          }}
          onOpenAuthModal={handleOpenAuthModal}
          onOpenOfflineManager={() => setIsOfflineModalOpen(true)}
          onLogout={handleLogout}
          onPeekBackground={() => setIsPeekingBackground(true)}
          onOpenAddHeritage={() => setIsGlobalHeritageModalOpen(true)}
        />
      </div>

      {/* Main Content Body */}
      <main className={`flex-1 relative z-10 ${activeTab === 'home' ? 'pb-0' : activeTab === 'map' ? 'pb-16 md:pb-0' : 'pb-20 md:pb-24'}`}>
        {/* VIEW 1: HOME FEED LANDING (Luôn giữ trong DOM để bảo toàn vị trí cuộn 100% không giật) */}
        <div className={activeTab === 'home' ? 'block' : 'hidden'}>
          <HomeFeedView
            currentLandmark={currentLandmark}
            detectedLocationName={detectedLocationName}
            locationSource={locationSource}
            isDetectingGps={isDetectingGps}
            onDetectGps={handleDetectGps}
            onOpenCityPicker={() => setShowCityPicker(true)}
            onNavigateTab={handleNavigate}
            onOpenStoryWithTopic={({ name, history, period }) =>
              handleNavigateToStory(name, history, period)
            }
            onOpenHeritageDetail={handleSelectHeritage}
            onOpenOfflineModal={() => setIsOfflineModalOpen(true)}
            currentUser={userProfile}
            onSelectLandmark={handleSelectLandmarkPreset}
            language={language}
            isPeekingBackground={isPeekingBackground}
            onTogglePeekBackground={(nextVal?: boolean) =>
              setIsPeekingBackground((prev) => (typeof nextVal === 'boolean' ? nextVal : !prev))
            }
            isActiveTab={activeTab === 'home'}
          />
        </div>

        {/* Thanh Quay lại Home giữ nguyên vị trí cuộn cũ khi đang ở các tab tính năng */}
        {activeTab !== 'home' && activeTab !== 'map' && (
          <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-2 sm:pt-3 pb-0.5 sm:pb-1 flex flex-wrap items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => handleNavigate('home')}
              className="min-h-[40px] sm:min-h-[44px] px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl bg-[var(--surface)] hover:bg-[#F3E5CD] border border-[var(--gold)] text-[var(--text)] text-xs sm:text-sm font-bold inline-flex items-center gap-1.5 sm:gap-2 shadow-[0_3px_10px_rgba(59,42,32,0.08)] transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[var(--primary)]" />
              <span className="sm:hidden">
                {language === 'en' ? 'Back to Home' : 'Về Trang chủ'}
              </span>
              <span className="hidden sm:inline">
                {language === 'en'
                  ? 'Back to Home (keep scroll position)'
                  : 'Quay lại Home (giữ vị trí đang lướt)'}
              </span>
            </button>

            <span className="text-xs text-[var(--jade)] font-semibold hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--surface)]/90 border border-[var(--gold)]/60">
              <MapPin className="w-3.5 h-3.5 text-[var(--jade)]" />
              <span>
                {language === 'en' ? 'Scenery:' : 'Cảnh sắc:'} {detectedLocationName} ·{' '}
                {currentLandmark.landmarkName}
              </span>
            </span>
          </div>
        )}

        {activeTab !== 'home' && (
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
            >
              <Suspense
                fallback={
                  <div className="w-full min-h-[72dvh] flex flex-col items-center justify-center p-6 text-center bg-[var(--bg)]">
                    <div className="w-12 h-12 rounded-2xl bg-[var(--surface)] border-2 border-[var(--gold)] flex items-center justify-center shadow-md mb-3 animate-pulse">
                      <Compass className="w-6 h-6 text-[var(--primary)] animate-spin" />
                    </div>
                    <p className="font-serif font-bold text-base text-[var(--text)]">
                      {language === 'en'
                        ? 'Opening heritage space...'
                        : 'Đang mở không gian di sản...'}
                    </p>
                    <p className="text-xs text-[var(--text-muted)] mt-1">
                      {language === 'en'
                        ? 'HỒN ĐẤT VIỆT · Cultural Map & 34 Provinces'
                        : 'HỒN ĐẤT VIỆT · Bản đồ & Văn hóa 34 Tỉnh/Thành'}
                    </p>
                  </div>
                }
              >
                {/* VIEW 2: AI RECOGNITION */}
                {(activeTab === 'recognize' || activeTab === 'recognizer') && (
                  <ImageRecognizer
                    onNavigateToStory={handleNavigateToStory}
                    onNavigateToFood={handleNavigateToFood}
                    onNavigateToMap={() => setActiveTab('map')}
                    language={language}
                  />
                )}

                {/* VIEW 3: AI STORYTELLER */}
                {(activeTab === 'story' || activeTab === 'storyteller') && (
                  <StoryPlayer
                    initialHeritageName={storyInitialTopic?.name}
                    initialHistory={storyInitialTopic?.history}
                    initialPeriod={storyInitialTopic?.period}
                    onSelectHeritageForPlaces={handleNavigateToFood}
                    language={language}
                  />
                )}

                {/* VIEW 5: CULTURAL MAP */}
                {activeTab === 'map' && (
                  <CulturalMap
                    currentUser={userProfile}
                    language={language}
                    onNavigateToStory={handleNavigateToStory}
                    onNavigateToFood={handleNavigateToFood}
                    onSelectHeritage={handleSelectHeritage}
                    initialRouteRequest={pendingMapRoute}
                    onClearRouteRequest={() => setPendingMapRoute(null)}
                  />
                )}

                {/* VIEW 6: FOOD & ENTERTAINMENT NEAR HERITAGE */}
                {activeTab === 'food' && (
                  <FoodAndEntertainmentModule
                    initialHeritageId={selectedFoodHeritageId}
                    onNavigateToHeritage={(hId) => {
                      setActiveTab('map');
                    }}
                    language={language}
                  />
                )}

                {/* VIEW 7: SMART ITINERARY PLANNER */}
                {activeTab === 'itinerary' && (
                  <ItineraryPlanner
                    onNavigateToFood={handleNavigateToFood}
                    currentUser={userProfile}
                    onRequireAuth={() => handleOpenAuthModal('login')}
                    language={language}
                  />
                )}

                {/* VIEW 9: CRAFTS & TRADITIONAL ARTS */}
                {activeTab === 'crafts' && (
                  <TraditionalCraftsAndArts
                    currentUser={userProfile}
                    language={language}
                  />
                )}

                {/* VIEW 10: QUIZ & HISTORICAL TIMELINE */}
                {(activeTab === 'quiz' || activeTab === 'learning') && (
                  <HeritageLearning
                    language={language}
                  />
                )}

                {/* VIEW 11: COMMUNITY CONTRIBUTIONS */}
                {activeTab === 'community' && (
                  <CommunityContributionModule
                    language={language}
                  />
                )}

                {/* VIEW 12: FAVORITES & SAVED ITEMS */}
                {activeTab === 'favorites' && (
                  <FavoritesView
                    onNavigateToStory={handleNavigateToStory}
                    onNavigateToFood={handleNavigateToFood}
                    onNavigateToMap={() => setActiveTab('map')}
                    onNavigateToTab={handleNavigate}
                    onSelectHeritage={handleSelectHeritage}
                    language={language}
                  />
                )}

                {/* VIEW 13: ADMIN DASHBOARD */}
                {activeTab === 'admin' && (
                  <AdminDashboard
                    currentUser={userProfile}
                    onUserChange={handleUserChange}
                    language={language}
                  />
                )}

                {/* VIEW 14: USER PROFILE & HERITAGE BADGES */}
                {(activeTab === 'profile' || activeTab === 'badges') && (
                  <UserProfileView
                    currentUser={userProfile}
                    onUserChange={handleUserChange}
                    onNavigateTab={handleNavigate}
                    language={language}
                  />
                )}
              </Suspense>
            </motion.div>
          </AnimatePresence>
        )}

      </main>

      {/* Auth & Profile & Activity History Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialTab={authModalTab}
        onUserChange={handleUserChange}
        onNavigateTab={handleNavigate}
      />

      {/* Footer */}
      <footer className={`relative z-10 bg-[var(--surface)] border-t border-[var(--gold)]/60 py-12 px-4 sm:px-6 lg:px-8 text-xs text-[var(--text-muted)] ${activeTab === 'home' ? 'hidden' : activeTab === 'map' ? 'hidden md:block' : ''}`}>
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          
          <div className="space-y-3 md:col-span-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center font-serif font-bold text-[#FFFDF8] text-xs bg-[#0d3b26] border border-[var(--gold)]">
                <img 
                  src="/hon_dat_viet_logo.webp" 
                  alt="Hồn Đất Việt" 
                  className="w-full h-full object-contain scale-105"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    const parent = e.currentTarget.parentElement;
                    if (parent) {
                      parent.className = "w-8 h-8 rounded-full bg-[var(--primary)] flex items-center justify-center font-serif font-bold text-[#FFFDF8] text-xs";
                      parent.innerText = "H";
                    }
                  }}
                />
              </div>
              <span className="font-serif font-bold text-[var(--primary)] text-base tracking-wider">HỒN ĐẤT VIỆT</span>
            </div>
            <p className="text-[var(--text)] text-xs max-w-md leading-relaxed">
              {languageService.t('footer.platformDesc', language, 'Nền tảng trí tuệ nhân tạo đồng hành khám phá, bảo tồn và lan tỏa giá trị di sản văn hóa, lịch sử và trải nghiệm du lịch Việt Nam.')}
            </p>
            <p className="text-[11px] text-[var(--text-muted)]">
              {languageService.t('footer.pride', language, 'Phát triển với sự trân trọng đối với 4.000 năm lịch sử hào hùng và nguồn tư liệu lịch sử dân tộc.')}
            </p>
          </div>

          <div className="space-y-2">
            <h5 className="font-semibold text-[var(--primary)] uppercase tracking-wider text-[11px]">
              {languageService.t('footer.coreFeatures', language, 'Chức năng cốt lõi')}
            </h5>
            <ul className="space-y-1.5 text-[var(--text)]">
              <li><button onClick={() => handleNavigate('recognizer')} className="hover:text-[var(--primary)]">{languageService.t('footer.fRecognizer', language, 'Nhận diện di sản bằng AI Vision')}</button></li>
              <li><button onClick={() => handleNavigate('storyteller')} className="hover:text-[var(--primary)]">{languageService.t('footer.fStory', language, 'Nghe AI kể chuyện văn hóa')}</button></li>
              <li><button onClick={() => handleNavigate('food')} className="hover:text-[var(--primary)]">{languageService.t('footer.fFood', language, 'Ăn uống & vui chơi gần di sản')}</button></li>
              <li><button onClick={() => handleNavigate('itinerary')} className="hover:text-[var(--primary)]">{languageService.t('footer.fItinerary', language, 'Lập lịch trình du lịch thông minh')}</button></li>
            </ul>
          </div>

          <div className="space-y-2">
            <h5 className="font-semibold text-[var(--primary)] uppercase tracking-wider text-[11px]">
              {languageService.t('footer.accountDevice', language, 'Tài khoản & Thiết bị')}
            </h5>
            <ul className="space-y-1.5 text-[var(--text)] text-[11px]">
              <li><button onClick={() => handleOpenAuthModal('login')} className="hover:text-[var(--primary)]">{languageService.t('footer.loginRegister', language, 'Đăng nhập / Đăng ký tài khoản')}</button></li>
              <li><button onClick={() => setActiveTab('profile')} className="hover:text-[var(--primary)]">{languageService.t('footer.viewBadges', language, 'Xem điểm văn hóa & danh hiệu')}</button></li>
              <li><button onClick={() => handleOpenAuthModal('activity')} className="hover:text-[var(--primary)]">{languageService.t('footer.activityHistory', language, 'Lịch sử thao tác thiết bị')}</button></li>
              <li><button onClick={() => handleNavigate('favorites')} className="hover:text-[var(--primary)]">{languageService.t('footer.savedFavorites', language, 'Bộ sưu tập di sản đã lưu')}</button></li>
            </ul>
          </div>

        </div>

        <div className="max-w-7xl mx-auto pt-6 border-t border-[var(--gold)]/45 flex flex-wrap items-center justify-between gap-4 text-[11px] text-[var(--text-muted)]">
          <span>{languageService.t('footer.copyright', language, '© 2026 HỒN ĐẤT VIỆT. Tự hào Di sản Việt Nam.')}</span>
          <div className="flex flex-wrap items-center gap-4">
            <span>{languageService.t('footer.dataCredit', language, 'Dữ liệu đối chiếu: Đại Việt Sử Ký Toàn Thư, UNESCO & Google Places')}</span>
            <span aria-hidden="true">·</span>
            <span>Credits 3D: rong.glb (github.com/tin1511/tour-guide-3d)</span>
          </div>
        </div>
      </footer>
      </div>

      {/* 📱 Floating Controls (Placed at bottom-left on desktop/tablet so they never overlap the 3D Guide Character at bottom-right) */}
      {!isPeekingBackground ? (
        <div className="hidden md:block fixed bottom-4 left-4 sm:left-6 z-40 pointer-events-none">
          <div className="flex items-center gap-2 pointer-events-auto">
            {/* Nút Khám phá Di sản / Danh thắng hình nền đang hiển thị */}
            <button
              type="button"
              id="btn-floating-explore-landmark"
              onClick={handleExploreCurrentLandmark}
              className="group flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-[#FFFDF8] font-extrabold text-xs shadow-[0_8px_22px_rgba(179,38,30,0.28)] border border-[var(--gold)] transition-all active:scale-95 cursor-pointer shrink-0"
              title={`Khám phá & xem giới thiệu chi tiết di sản "${currentLandmark.landmarkName}"`}
            >
              <Sparkles className="w-3.5 h-3.5 text-[#FFFDF8]" />
              <span>{languageService.t('floating.exploreLandmark', language, 'Khám phá di sản')}</span>
            </button>

            {/* Peek Background & Landmark Selector */}
            <button
              type="button"
              id="btn-floating-peek-background"
              onClick={() => setIsPeekingBackground(true)}
              className="group flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-[var(--surface)]/95 hover:bg-[#F3E5CD] text-[var(--text)] border border-[var(--gold)] shadow-[0_6px_18px_rgba(59,42,32,0.14)] backdrop-blur-md text-xs font-bold transition-all active:scale-95 cursor-pointer shrink-0"
              title={languageService.t('floating.peekBackground', language, 'Ẩn giao diện để chiêm ngưỡng trọn vẹn bức ảnh nền danh thắng')}
            >
              <Eye className="w-4 h-4 text-[var(--jade)] group-hover:scale-110 transition-transform" />
              <span>{languageService.t('floating.peekBackground', language, 'Ngắm ảnh nền')}</span>
            </button>

            <button
              type="button"
              onClick={() => setShowCityPicker(true)}
              className="group flex items-center gap-2 px-3 py-2 rounded-full bg-[var(--surface)]/95 hover:bg-[#F3E5CD] text-[var(--text)] border border-[var(--gold)] shadow-[0_6px_18px_rgba(59,42,32,0.14)] backdrop-blur-md text-xs font-bold transition-all active:scale-95 cursor-pointer max-w-[220px]"
              title={languageService.t('floating.changeLandmark', language, 'Đổi ảnh nền danh thắng các tỉnh thành khác')}
            >
              <div className="relative flex h-2 w-2 sm:h-2.5 sm:w-2.5 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--jade)] opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 sm:h-2.5 sm:w-2.5 bg-[var(--jade)]" />
              </div>
              <MapPin className="w-3.5 h-3.5 text-[var(--jade)] shrink-0" />
              <span className="font-bold text-[var(--jade)] text-xs truncate">{detectedLocationName}</span>
            </button>
          </div>
        </div>
      ) : (
        <div
          onClick={() => setIsPeekingBackground(false)}
          className="fixed top-4 left-4 right-4 z-50 flex flex-wrap sm:flex-nowrap items-center justify-between gap-2 px-4 py-3 rounded-2xl bg-[var(--surface)]/95 border border-[var(--gold)] backdrop-blur-lg shadow-[0_12px_32px_rgba(59,42,32,0.22)] text-xs cursor-pointer animate-in fade-in slide-in-from-top-4 duration-300"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="relative flex h-2.5 w-2.5 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--jade)] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[var(--jade)]"></span>
            </span>
            <div className="truncate">
              <p className="font-bold text-[var(--text)] truncate">
                {currentLandmark.landmarkName}
              </p>
              <p className="text-[11px] text-[var(--jade)] font-semibold truncate">
                {detectedLocationName} • {currentLandmark.tagline}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setShowCityPicker(true);
              }}
              className="px-3 py-1.5 rounded-xl bg-[var(--bg)] hover:bg-[#F3E5CD] text-[var(--jade)] border border-[var(--gold)] font-bold text-xs shrink-0 shadow-sm transition-colors flex items-center gap-1.5 cursor-pointer"
              title={language === 'en' ? 'Change scenic background photo' : 'Đổi ảnh nền danh thắng khác'}
            >
              <MapPin className="w-3.5 h-3.5 text-[var(--jade)]" />
              <span className="hidden sm:inline">
                {language === 'en' ? 'Change Scenery' : 'Đổi cảnh nền'}
              </span>
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsPeekingBackground(false);
                handleExploreCurrentLandmark();
              }}
              className="px-3.5 py-1.5 rounded-xl bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-[#FFFDF8] font-extrabold text-xs shrink-0 shadow-md transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{languageService.t('floating.exploreLandmark', language, 'Khám phá di sản')}</span>
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsPeekingBackground(false);
              }}
              className="px-3.5 py-1.5 rounded-xl bg-[var(--bg)] hover:bg-[#F3E5CD] text-[var(--text)] border border-[var(--gold)] font-bold text-xs shrink-0 shadow-sm transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <EyeOff className="w-3.5 h-3.5 text-[var(--primary)]" />
              <span>{languageService.t('floating.showUI', language, 'Hiện giao diện')}</span>
            </button>
          </div>
        </div>
      )}

      {/* 📱 Mobile Bottom Navigation Bar */}
      <MobileBottomNav
        currentTab={activeTab}
        onSelectTab={handleNavigate}
        favoritesCount={favoritesCount}
        userProfile={userProfile}
        language={language}
        onOpenCityPicker={() => setShowCityPicker(true)}
        currentLandmark={currentLandmark}
        onPeekBackground={() => setIsPeekingBackground(true)}
        onExploreLandmark={handleExploreCurrentLandmark}
      />

      {/* Modal: Khám phá & Chọn ảnh danh thắng Việt Nam làm hình nền trang web */}
      <CityLandmarkModal
        isOpen={showCityPicker}
        onClose={() => setShowCityPicker(false)}
        currentLandmark={currentLandmark}
        onSelectLandmark={handleSelectLandmarkPreset}
        onDetectGps={handleDetectGps}
        isDetectingGps={isDetectingGps}
        language={language}
      />

      {/* Modal: Xem chi tiết Di sản Văn hóa & Thuyết minh */}
      <HeritageDetailModal
        heritage={selectedDetailHeritage}
        isOpen={isDetailModalOpen}
        language={language}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedDetailHeritage(null);
        }}
        onNavigateToStory={handleNavigateToStory}
        onNavigateToFood={handleNavigateToFood}
        onNavigateToMap={() => handleNavigate('map')}
      />

      {/* Floating Offline Connection Indicator */}
      <OfflineIndicator
        onOpenOfflineManager={() => setIsOfflineModalOpen(true)}
      />

      {/* Nhân vật Hướng dẫn viên 3D luôn hiện ở tầng gốc của ứng dụng */}
      <GuideCharacter
        isPeekingBackground={isPeekingBackground}
        activeTab={activeTab}
        onNavigateTab={handleNavigate}
        language={language}
      />

      {/* Modal: Quản lý Chế độ Ngoại tuyến & Service Worker Cache */}
      <OfflineHeritageManagerModal
        isOpen={isOfflineModalOpen}
        onClose={() => setIsOfflineModalOpen(false)}
        onSelectHeritage={(item) => {
          setSelectedDetailHeritage(item);
          setIsDetailModalOpen(true);
        }}
      />

      {/* Modal: Tải & Cài Đặt App Mobile (PWA & QR Code) */}
      <MobileAppDownloadModal
        isOpen={isDownloadModalOpen}
        onClose={() => setIsDownloadModalOpen(false)}
      />

      {/* Modal: Đề xuất Thêm Di sản Mới (Mở trực tiếp ở đầu trang) */}
      {isGlobalHeritageModalOpen && (
        <HeritageEditModal
          heritage={null}
          isOpen={isGlobalHeritageModalOpen}
          language={language}
          onClose={() => setIsGlobalHeritageModalOpen(false)}
          onSaveSuccess={() => setIsGlobalHeritageModalOpen(false)}
        />
      )}

    </div>
  );
}

