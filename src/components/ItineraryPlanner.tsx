import React, { useState, useEffect, useRef } from 'react';
import { 
  CalendarDays, 
  Sparkles, 
  MapPin, 
  Clock, 
  Compass, 
  Utensils, 
  Coffee, 
  BookOpen, 
  ExternalLink, 
  RefreshCw, 
  Bookmark, 
  Check, 
  Info, 
  Car, 
  Lock, 
  User, 
  X,
  Calendar,
  CloudSun,
  FolderHeart,
  PlusCircle,
  Trash2,
  Edit3,
  Copy,
  HeartPulse,
  DoorClosed,
  CloudRain,
  AlarmClock,
  Wand2,
  RotateCcw,
  CheckCircle2,
  ArrowRight,
  Navigation,
  History
} from 'lucide-react';
import { aiService } from '../services/aiService';
import { storageService } from '../services/storageService';
import {
  ItineraryPlan,
  ItineraryIncidentType,
  ItineraryAdaptationRecord,
  NearbyAlternativeOption,
  UserProfile
} from '../types';
import { useLanguage } from '../hooks/useLanguage';
import { ItineraryWeatherCard } from './ItineraryWeatherCard';
import { triggerInAppMapRoute } from '../services/routeNavigationService';
import { HERITAGE_DATABASE } from '../data/vietnamHeritageData';

interface ItineraryPlannerProps {
  onNavigateToFood?: (heritageId: string) => void;
  currentUser?: UserProfile;
  onRequireAuth?: () => void;
  language?: string;
}

const DANANG_SAMPLE_ITINERARY: ItineraryPlan = {
  id: 'itinerary-danang-sample-2026',
  title: 'Khám phá Đà Nẵng: Cung đường Di sản Biển Mỹ Khê – Ngũ Hành Sơn – Ma Nhai',
  destination: 'Đà Nẵng',
  duration: '1 ngày (Sáng đến Tối)',
  vibe: 'Khám phá Di sản Văn hóa & Thiên nhiên Biển Đà Nẵng',
  routeSummary: 'Cung đường ven biển Bắc → Nam (7.5 km): Biển Mỹ Khê (Sơn Trà) → Danh thắng Ngũ Hành Sơn & Làng đá Non Nước → Văn khắc Ma Nhai (Động Huyền Không – Thủy Sơn)',
  aiOptimizationReasoning:
    'Hành trình mẫu "Khám phá Đà Nẵng" được sắp xếp tối ưu theo vị trí địa lý liên hoàn từ Bắc xuống Nam dọc tuyến đường biển Võ Nguyên Giáp – Trường Sa – Huyền Trân Công Chúa: Khởi đầu đón bình minh mát lành tại Biển Mỹ Khê (phía Bắc), xuôi 7km về phía Nam tham quan Danh thắng Quốc gia đặc biệt Ngũ Hành Sơn & Làng đá mỹ nghệ Non Nước vào khung giờ sáng, thưởng thức Mì Quảng trưa gần di tích, và khám phá hệ thống 78 văn khắc Ma Nhai Ngũ Hành Sơn (Di sản tư liệu UNESCO) trong lòng động Huyền Không – Hoa Nghiêm vào đầu giờ chiều khi ánh sáng tự nhiên chiếu rọi rõ nét chữ khắc trên vách đá.',
  slots: [
    {
      time: '07:00 - 09:00',
      durationMinutes: 120,
      activityType: 'heritage',
      title: 'Điểm 1 (Phía Bắc): Đón bình minh tại Biển Mỹ Khê Đà Nẵng & Không gian Văn hóa Biển',
      locationName: 'Bãi biển Mỹ Khê, Đường Võ Nguyên Giáp, Quận Sơn Trà, TP. Đà Nẵng',
      description:
        'Bắt đầu hành trình tại Biển Mỹ Khê — bãi biển từng được tạp chí Forbes bình chọn là một trong 6 bãi biển quyến rũ nhất hành tinh. Dạo bước trên bờ cát trắng mịn, ngắm toàn cảnh bán đảo Sơn Trà phía Bắc và cụm núi Ngũ Hành Sơn phía Nam, tìm hiểu nét văn hóa Lễ hội Cầu Ngư truyền thống của ngư dân Đà Nẵng.',
      tip: 'Di chuyển dọc đường biển Võ Nguyên Giáp từ Bắc xuống Nam giúp tiết kiệm tối đa thời gian di chuyển.'
    },
    {
      time: '09:15 - 11:30',
      durationMinutes: 135,
      activityType: 'heritage',
      title: 'Điểm 2 (Phía Nam 7km): Danh thắng Quốc gia đặc biệt Ngũ Hành Sơn & Làng đá Non Nước',
      locationName: '81 Huyền Trân Công Chúa, Phường Hòa Hải, Quận Ngũ Hành Sơn, TP. Đà Nẵng',
      description:
        'Từ biển Mỹ Khê xuôi thẳng theo cung đường ven biển khoảng 10 phút tới quần thể 6 ngọn núi đá vôi Kim, Mộc, Thủy, Dương Hỏa, Âm Hỏa, Thổ Sơn do vua Minh Mạng đặt tên năm 1825. Tham quan Làng nghề điêu khắc đá mỹ nghệ Non Nước hơn 400 năm tuổi dưới chân núi, sau đó lên ngọn Thủy Sơn viếng chùa Tam Thai, chùa Linh Ứng và Vọng Hải Đài.',
      tip: 'Di tích Quốc gia đặc biệt (2018) gắn với 3 lần ngự du của Hoàng đế Minh Mạng (1825, 1827, 1837).'
    },
    {
      time: '11:45 - 13:30',
      durationMinutes: 105,
      activityType: 'food',
      title: 'Thưởng thức Đặc sản Mì Quảng & Bánh tráng thịt heo khu vực Ngũ Hành Sơn',
      locationName: 'Khu ẩm thực truyền thống đường Lê Văn Hiến – Huyền Trân Công Chúa, Quận Ngũ Hành Sơn',
      description:
        'Nghỉ trưa và thưởng thức ẩm thực đặc trưng xứ Quảng - Đà ngay gần danh thắng Ngũ Hành Sơn với Mì Quảng tôm thịt, bánh tráng cuốn thịt heo và nước mát lá lao.',
      tip: 'Nên chọn các quán Mì Quảng truyền thống gần chân núi Thủy Sơn để thuận tiện tiếp tục hành trình buổi chiều.'
    },
    {
      time: '14:00 - 16:30',
      durationMinutes: 150,
      activityType: 'heritage',
      title: 'Điểm 3 (Trung tâm Thủy Sơn): Khám phá Hệ thống Văn khắc Ma Nhai Ngũ Hành Sơn (Di sản Tư liệu UNESCO)',
      locationName: 'Động Huyền Không, Động Hoa Nghiêm & Động Tàng Chơn — Ngọn Thủy Sơn, Ngũ Hành Sơn',
      description:
        'Điểm nhấn chiều sâu văn hóa của hành trình: Chiêm ngưỡng hệ thống 78 văn bia chữ Hán và chữ Nôm khắc trực tiếp trên vách đá tự nhiên từ thế kỷ XVII đến thế kỷ XX (được UNESCO ghi danh Di sản tư liệu Ký ức Thế giới năm 2022). Quan sát tấm bia cổ "Phổ Đà Sơn Linh Trung Phật" (1640) tại động Hoa Nghiêm và ngự bút của vua Minh Mạng (1837) tại động Huyền Không.',
      tip: 'Khung giờ 14:00 - 15:30 có ánh sáng tự nhiên chiếu qua vòm đá động Huyền Không giúp quan sát rõ nét chữ khắc Ma Nhai.'
    }
  ]
};

export const ItineraryPlanner: React.FC<ItineraryPlannerProps> = ({ onRequireAuth }) => {
  const { language } = useLanguage();
  const isEnglish = language === 'en';
  const [destination, setDestination] = useState<string>('Đà Nẵng');
  const [duration, setDuration] = useState<string>('1 ngày (Sáng đến Tối)');
  const [travelStartDate, setTravelStartDate] = useState<string>(() => {
    return new Date().toISOString().split('T')[0];
  });
  const [companion, setCompanion] = useState<string>('Gia đình có trẻ em');
  const [budget, setBudget] = useState<string>('Vừa phải (Phổ thông)');
  const [interests, setInterests] = useState<string[]>([
    'Di tích Cung đình & Lịch sử',
    'Ẩm thực địa phương & Ăn vặt',
    'Làng nghề thủ công & Trải nghiệm'
  ]);
  const [customPlanName, setCustomPlanName] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [itinerary, setItinerary] = useState<ItineraryPlan | null>(() => {
    const savedList = storageService.getSavedItineraries();
    return savedList.length > 0 ? savedList[0] : DANANG_SAMPLE_ITINERARY;
  });

  // Multi-itinerary saved collection state
  const [savedItineraries, setSavedItineraries] = useState<ItineraryPlan[]>(() =>
    storageService.getSavedItineraries()
  );
  const [savedToastMessage, setSavedToastMessage] = useState<string | null>(null);
  const [editingPlanId, setEditingPlanId] = useState<string | null>(null);
  const [editingTitleValue, setEditingTitleValue] = useState<string>('');
  const [showAuthNoticeModal, setShowAuthNoticeModal] = useState<boolean>(false);

  // Real-time AI Travel Incident Adaptation states
  const [selectedIncidentType, setSelectedIncidentType] = useState<ItineraryIncidentType>('child_sick');
  const [incidentTargetSlot, setIncidentTargetSlot] = useState<number | 'all'>('all');
  const [incidentShiftMinutes, setIncidentShiftMinutes] = useState<number>(120);
  const [incidentCustomNote, setIncidentCustomNote] = useState<string>('');
  const [adaptingLoading, setAdaptingLoading] = useState<boolean>(false);
  const [adaptingSlotIndex, setAdaptingSlotIndex] = useState<number | null>(null);
  const [latestAdaptationRecord, setLatestAdaptationRecord] = useState<ItineraryAdaptationRecord | null>(null);
  const [previousItinerarySnapshot, setPreviousItinerarySnapshot] = useState<ItineraryPlan | null>(null);

  const formRef = useRef<HTMLDivElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);
  const incidentPanelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const syncItineraries = () => {
      setSavedItineraries(storageService.getSavedItineraries());
    };
    window.addEventListener('hdv_itineraries_updated', syncItineraries);
    return () => window.removeEventListener('hdv_itineraries_updated', syncItineraries);
  }, []);

  const showToast = (msg: string) => {
    setSavedToastMessage(msg);
    setTimeout(() => {
      setSavedToastMessage(prev => (prev === msg ? null : prev));
    }, 3500);
  };

  const getDurationDays = (dur: string) => {
    if (dur.includes('3 ngày') || dur.includes('3 days')) return 3;
    if (dur.includes('2 ngày') || dur.includes('2 days')) return 2;
    return 1;
  };
  const durationDays = getDurationDays(duration);

  const interestOptions = [
    'Di tích Cung đình & Lịch sử',
    'Ẩm thực địa phương & Ăn vặt',
    'Làng nghề thủ công & Trải nghiệm',
    'Cà phê ngắm cảnh & Check-in',
    'Nghệ thuật & Bảo tàng',
    'Chùa chiền & Tâm linh'
  ];

  const handleToggleInterest = (opt: string) => {
    if (interests.includes(opt)) {
      setInterests(interests.filter(i => i !== opt));
    } else {
      setInterests([...interests, opt]);
    }
  };

  const handleGenerate = async (autoSaveNew = true) => {
    setLoading(true);
    setLatestAdaptationRecord(null);
    setPreviousItinerarySnapshot(null);
    try {
      const plan = await aiService.generateSmartItinerary({
        destination,
        duration,
        interests,
        budget,
        companion
      });

      const enrichedPlan: ItineraryPlan = {
        ...plan,
        id: `itin-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        title: customPlanName.trim() ? customPlanName.trim() : plan.title,
        tripStartDate: travelStartDate,
        companion,
        budget,
        interests,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      if (autoSaveNew) {
        const savedPlan = storageService.saveItinerary(enrichedPlan, { saveAsNew: true });
        setItinerary(savedPlan);
        setSavedItineraries(storageService.getSavedItineraries());
        setCustomPlanName('');
        showToast(
          isEnglish
            ? `Created & saved "${savedPlan.title}" to your collection!`
            : `Đã tạo và lưu "${savedPlan.title}" vào Danh sách lịch trình của bạn!`
        );
      } else {
        setItinerary(enrichedPlan);
      }

      setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 150);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveCurrentItinerary = (saveAsNew = false) => {
    if (!itinerary) return;
    const planToSave: ItineraryPlan = {
      ...itinerary,
      tripStartDate: itinerary.tripStartDate || travelStartDate,
      companion: itinerary.companion || companion,
      budget: itinerary.budget || budget,
      interests: itinerary.interests || interests
    };
    const savedPlan = storageService.saveItinerary(planToSave, {
      saveAsNew,
      customTitle: saveAsNew && customPlanName.trim() ? customPlanName.trim() : undefined
    });
    setItinerary(savedPlan);
    setSavedItineraries(storageService.getSavedItineraries());
    showToast(
      saveAsNew
        ? isEnglish
          ? 'Saved as a new itinerary in your collection!'
          : 'Đã lưu thành một lịch trình mới trong bộ sưu tập!'
        : isEnglish
        ? 'Saved changes to your itinerary!'
        : 'Đã lưu cập nhật lịch trình vào bộ sưu tập!'
    );
  };

  const handleSelectSavedItinerary = (plan: ItineraryPlan) => {
    setItinerary(plan);
    setDestination(plan.destination || 'Đà Nẵng');
    setDuration(plan.duration || '1 ngày (Sáng đến Tối)');
    if (plan.tripStartDate) setTravelStartDate(plan.tripStartDate);
    if (plan.companion) setCompanion(plan.companion);
    if (plan.budget) setBudget(plan.budget);
    if (plan.interests && plan.interests.length > 0) setInterests(plan.interests);
    setLatestAdaptationRecord(plan.adaptationHistory?.[0] || null);
    setPreviousItinerarySnapshot(null);

    setTimeout(() => {
      resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const handleDuplicateItinerary = (plan: ItineraryPlan, e: React.MouseEvent) => {
    e.stopPropagation();
    const copyTitle = `${plan.title} (Bản sao)`;
    const duplicated = storageService.saveItinerary(
      {
        ...plan,
        title: copyTitle
      },
      { saveAsNew: true, customTitle: copyTitle }
    );
    setSavedItineraries(storageService.getSavedItineraries());
    setItinerary(duplicated);
    showToast(isEnglish ? `Duplicated "${duplicated.title}"` : `Đã nhân bản lịch trình "${duplicated.title}"`);
  };

  const handleDeleteSavedItinerary = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = storageService.deleteItinerary(id);
    setSavedItineraries(updated);
    if (itinerary?.id === id) {
      setItinerary(updated[0] || DANANG_SAMPLE_ITINERARY);
    }
    showToast(isEnglish ? 'Removed itinerary from saved list.' : 'Đã xóa lịch trình khỏi danh sách đã lưu.');
  };

  const handleStartRename = (plan: ItineraryPlan, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingPlanId(plan.id);
    setEditingTitleValue(plan.title);
  };

  const handleConfirmRename = (id: string, e: React.MouseEvent | React.FormEvent) => {
    e.stopPropagation();
    if (editingTitleValue.trim()) {
      const updated = storageService.renameItinerary(id, editingTitleValue.trim());
      setSavedItineraries(updated);
      if (itinerary?.id === id) {
        setItinerary({ ...itinerary, title: editingTitleValue.trim() });
      }
      showToast(isEnglish ? 'Renamed itinerary!' : 'Đã đổi tên lịch trình!');
    }
    setEditingPlanId(null);
  };

  // Real-time AI Incident Adaptation handler
  const handleAdaptForIncident = async (options?: {
    overrideType?: ItineraryIncidentType;
    overrideSlotIndex?: number | 'all';
    overrideShiftMinutes?: number;
    overrideNote?: string;
  }) => {
    if (!itinerary) return;
    const typeToUse = options?.overrideType || selectedIncidentType;
    const slotToUse =
      options?.overrideSlotIndex !== undefined ? options.overrideSlotIndex : incidentTargetSlot;
    const shiftToUse =
      options?.overrideShiftMinutes !== undefined ? options.overrideShiftMinutes : incidentShiftMinutes;
    const noteToUse = options?.overrideNote !== undefined ? options.overrideNote : incidentCustomNote;

    setAdaptingLoading(true);
    if (typeof slotToUse === 'number') {
      setAdaptingSlotIndex(slotToUse);
    }

    // Keep snapshot for 1-click Undo
    setPreviousItinerarySnapshot(itinerary);

    try {
      const { updatedPlan, record } = await aiService.adaptItineraryForIncident({
        itinerary,
        incidentType: typeToUse,
        targetSlotIndex: typeof slotToUse === 'number' ? slotToUse : undefined,
        customReason: noteToUse,
        shiftMinutes: shiftToUse,
        language
      });

      // Automatically save/update if this itinerary is already saved in user's collection (or save it now so user doesn't lose changes)
      const isAlreadySaved = savedItineraries.some(item => item.id === itinerary.id);
      const persistedPlan = storageService.saveItinerary(updatedPlan, {
        saveAsNew: !isAlreadySaved && itinerary.id === 'itinerary-danang-sample-2026'
      });

      setItinerary(persistedPlan);
      setSavedItineraries(storageService.getSavedItineraries());
      setLatestAdaptationRecord(record);
      showToast(
        isEnglish
          ? 'AI adapted your itinerary & saved the updated schedule!'
          : 'AI đã điều chỉnh lịch trình linh hoạt và tự động lưu lại!'
      );
    } catch (err) {
      console.error('Error adapting itinerary:', err);
    } finally {
      setAdaptingLoading(false);
      setAdaptingSlotIndex(null);
    }
  };

  const handleSwapSlotWithAlternative = (slotIdx: number, alt: NearbyAlternativeOption) => {
    if (!itinerary) return;
    setPreviousItinerarySnapshot(itinerary);

    const newSlots = itinerary.slots.map((slot, idx) => {
      if (idx !== slotIdx) return slot;
      return {
        ...slot,
        activityType: alt.activityType,
        title: `[Điểm gần đó đã chọn] ${alt.name}`,
        locationName: alt.locationName,
        description: alt.description,
        tip: alt.tip || slot.tip,
        isAdapted: true,
        adaptationReason: `Đã chuyển sang "${alt.name}" (${alt.distance}) — ${alt.reason}`,
        previousLocationName: slot.previousLocationName || slot.locationName,
        previousTitle: slot.previousTitle || slot.title
      };
    });

    const updatedPlan: ItineraryPlan = {
      ...itinerary,
      slots: newSlots,
      updatedAt: new Date().toISOString()
    };

    const persisted = storageService.saveItinerary(updatedPlan, {
      saveAsNew: itinerary.id === 'itinerary-danang-sample-2026'
    });
    setItinerary(persisted);
    setSavedItineraries(storageService.getSavedItineraries());
    showToast(
      isEnglish
        ? `Switched Stop #${slotIdx + 1} to "${alt.name}"!`
        : `Đã đổi Mốc #${slotIdx + 1} sang "${alt.name}" (${alt.distance})!`
    );
  };

  const handleUndoAdaptation = () => {
    if (!previousItinerarySnapshot) return;
    const restored = storageService.saveItinerary(previousItinerarySnapshot, { saveAsNew: false });
    setItinerary(restored);
    setSavedItineraries(storageService.getSavedItineraries());
    setPreviousItinerarySnapshot(null);
    setLatestAdaptationRecord(null);
    showToast(isEnglish ? 'Restored previous schedule!' : 'Đã hoàn tác về lịch trình trước khi chỉnh!');
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'food': return <Utensils className="w-4 h-4 text-orange-400" />;
      case 'cafe': return <Coffee className="w-4 h-4 text-amber-400" />;
      case 'craft': return <BookOpen className="w-4 h-4 text-purple-400" />;
      case 'heritage':
      case 'museum': return <Compass className="w-4 h-4 text-emerald-400" />;
      default: return <Clock className="w-4 h-4 text-sky-400" />;
    }
  };

  const isCurrentPlanSaved = Boolean(
    itinerary && savedItineraries.some(item => item.id === itinerary.id)
  );

  return (
    <div className="max-w-5xl mx-auto px-3 sm:px-4 pt-2 pb-28 sm:py-8">
      {/* Floating Toast Notification */}
      {savedToastMessage && (
        <div className="fixed bottom-20 sm:bottom-6 right-4 z-50 max-w-sm bg-emerald-900/95 border-2 border-emerald-400 text-[#FFFDF8] px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 text-emerald-300 shrink-0" />
          <span className="text-xs sm:text-sm font-bold">{savedToastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="text-left sm:text-center max-w-3xl mx-auto mb-3 sm:mb-8">
        <div className="hidden sm:inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-semibold mb-3">
          <CalendarDays className="w-3.5 h-3.5" />
          <span>{isEnglish ? 'Heritage & Culinary Itinerary Optimization' : 'Thuật Toán Tối Ưu Lịch Trình Di Sản & Ẩm Thực'}</span>
        </div>
        <h2 className="text-xl sm:text-4xl font-serif font-bold text-stone-100 leading-tight">
          <span className="sm:hidden">
            {isEnglish ? 'Smart Cultural Itinerary' : 'Lịch Trình Văn Hóa Thông Minh'}
          </span>
          <span className="hidden sm:inline">
            {isEnglish ? 'Design a Smart Cultural Itinerary' : 'Thiết Kế Lịch Trình Văn Hóa Thông Minh'}
          </span>
        </h2>
        <p className="text-stone-300 text-[11px] sm:text-sm mt-1 sm:mt-2 leading-snug sm:leading-relaxed">
          <span className="sm:hidden">
            {isEnglish
              ? 'Save multiple plans & let AI adapt times or nearby stops.'
              : 'Lưu nhiều lịch trình & nhờ AI đổi giờ, gợi ý điểm thay thế tức thì.'}
          </span>
          <span className="hidden sm:inline">
            {isEnglish
              ? 'Create and save multiple trips, view your saved schedules anytime, and let AI flexibly adapt when a child gets sick or a venue is closed.'
              : 'Tạo nhiều lịch trình và lưu lại xem mọi lúc — đặc biệt có Trợ lý AI tự động đổi giờ khi con ốm hoặc gợi ý địa điểm gần đó khi điểm đến bị đóng cửa.'}
          </span>
        </p>
      </div>

      {/* ===================================================================== */}
      {/* KHU VỰC 1: QUẢN LÝ NHIỀU LỊCH TRÌNH ĐÃ TẠO & ĐÃ LƯU                   */}
      {/* ===================================================================== */}
      <div className="mb-3.5 sm:mb-6 rounded-2xl sm:rounded-3xl bg-stone-900 border sm:border-2 border-amber-500/45 p-3 sm:p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3 mb-2.5 sm:mb-4">
          <div className="flex items-center justify-between sm:justify-start gap-2.5">
            <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
                <FolderHeart className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                  <h3 className="text-sm sm:text-lg font-serif font-bold text-stone-100 truncate">
                    <span className="sm:hidden">
                      {isEnglish ? 'Saved Itineraries' : 'Lịch Trình Của Tôi'}
                    </span>
                    <span className="hidden sm:inline">
                      {isEnglish ? 'My Saved Itineraries Collection' : 'Lịch Trình Đã Tạo & Đã Lưu Của Tôi'}
                    </span>
                  </h3>
                  <span className="px-2 py-0.5 rounded-md sm:rounded-full bg-amber-500 text-[#FFFDF8] text-[11px] sm:text-xs font-extrabold tabular-nums shrink-0">
                    {savedItineraries.length} {isEnglish ? 'plans' : 'lịch'}
                  </span>
                </div>
                <p className="hidden sm:block text-xs text-stone-300 mt-0.5">
                  {isEnglish
                    ? 'Click any saved itinerary below to reopen, view details, or adapt on the go.'
                    : 'Bấm vào bất kỳ lịch trình nào bên dưới để xem lại, chỉnh sửa hoặc nhờ AI xử lý tình huống khi đi chơi.'}
                </p>
              </div>
            </div>
          </div>

          <div className={`grid ${itinerary ? 'grid-cols-2' : 'grid-cols-1'} sm:flex sm:flex-wrap items-center gap-2 w-full sm:w-auto`}>
            <button
              type="button"
              onClick={() => {
                setCustomPlanName(`Chuyến đi ${destination} mới (${savedItineraries.length + 1})`);
                formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
              }}
              className="min-h-[38px] sm:min-h-0 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-[#FFFDF8] font-bold text-[11px] sm:text-xs flex items-center justify-center gap-1.5 shadow cursor-pointer"
            >
              <PlusCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
              <span className="sm:hidden truncate">{isEnglish ? '+ New Plan' : '+ Tạo mới'}</span>
              <span className="hidden sm:inline">{isEnglish ? '+ Create New Itinerary' : '+ Tạo Lịch Trình Mới'}</span>
            </button>

            {itinerary && (
              <button
                type="button"
                onClick={() => handleSaveCurrentItinerary(true)}
                className="min-h-[38px] sm:min-h-0 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-amber-300 border border-amber-500/40 font-bold text-[11px] sm:text-xs flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5 shrink-0" />
                <span className="sm:hidden truncate">{isEnglish ? 'Save Copy' : 'Lưu bản mới'}</span>
                <span className="hidden sm:inline">{isEnglish ? 'Save Current as New Copy' : 'Lưu lịch đang mở thành bản mới'}</span>
              </button>
            )}
          </div>
        </div>

        {savedItineraries.length === 0 ? (
          <div className="rounded-xl sm:rounded-2xl bg-stone-950/90 border border-dashed border-stone-700 px-3 py-2.5 sm:p-5 flex flex-col sm:flex-col items-start sm:items-center justify-between gap-2 sm:text-center">
            <p className="text-[11px] sm:text-sm font-semibold text-stone-200 leading-snug">
              <span className="sm:hidden">
                {isEnglish
                  ? 'No saved plans yet. Save this sample or generate one below.'
                  : 'Chưa có lịch trình đã lưu. Lưu lịch Đà Nẵng bên dưới hoặc tạo mới.'}
              </span>
              <span className="hidden sm:inline">
                {isEnglish
                  ? 'You have no saved itineraries yet. Click "Save this itinerary" or generate a new schedule below!'
                  : 'Bạn chưa lưu lịch trình nào. Hãy bấm "Lưu lịch trình" hoặc bấm "Tạo Lịch Trình Tối Ưu Tự Động" bên dưới để lưu nhiều lịch trình nhé!'}
              </span>
            </p>
            <button
              type="button"
              onClick={() => handleSaveCurrentItinerary(true)}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-[#FFFDF8] text-[11px] sm:text-xs font-bold shadow cursor-pointer shrink-0"
            >
              <Bookmark className="w-3.5 h-3.5" />
              <span className="sm:hidden">{isEnglish ? 'Save Da Nang Sample' : 'Lưu lịch Đà Nẵng đang mở'}</span>
              <span className="hidden sm:inline">{isEnglish ? 'Save Sample Da Nang Itinerary Now' : 'Lưu ngay Lịch trình Đà Nẵng đang mở'}</span>
            </button>
          </div>
        ) : (
          <div className="flex overflow-x-auto snap-x snap-mandatory gap-2.5 pb-1 sm:grid sm:grid-cols-2 lg:grid-cols-3 sm:gap-3 sm:max-h-[340px] sm:overflow-y-auto sm:pr-1">
            {savedItineraries.map((plan, index) => {
              const isSelected = itinerary?.id === plan.id;
              const hasAdapted = plan.slots?.some(s => s.isAdapted) || (plan.adaptationHistory && plan.adaptationHistory.length > 0);
              return (
                <div
                  key={plan.id}
                  onClick={() => handleSelectSavedItinerary(plan)}
                  className={`min-w-[235px] max-w-[260px] sm:min-w-0 sm:max-w-none shrink-0 snap-start group rounded-xl sm:rounded-2xl p-3 sm:p-3.5 border transition-all cursor-pointer flex flex-col justify-between gap-2 ${
                    isSelected
                      ? 'bg-amber-500/15 border-2 border-amber-500 shadow-lg'
                      : 'bg-stone-950/90 border-stone-800 hover:border-amber-500/50'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-1.5 mb-1">
                      <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 truncate">
                        #{index + 1} • {plan.destination}
                      </span>
                      <div className="flex items-center gap-1 shrink-0">
                        {isSelected && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-600 text-white font-bold">
                            {isEnglish ? 'Viewing' : 'Đang xem'}
                          </span>
                        )}
                        {hasAdapted && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500 text-[#FFFDF8] font-bold">
                            AI
                          </span>
                        )}
                      </div>
                    </div>

                    {editingPlanId === plan.id ? (
                      <form
                        onSubmit={e => handleConfirmRename(plan.id, e)}
                        onClick={e => e.stopPropagation()}
                        className="flex items-center gap-1.5 mt-1"
                      >
                        <input
                          type="text"
                          value={editingTitleValue}
                          onChange={e => setEditingTitleValue(e.target.value)}
                          className="w-full bg-stone-900 border border-amber-500 text-stone-100 text-xs rounded-lg px-2 py-1 focus:outline-none"
                          autoFocus
                        />
                        <button
                          type="submit"
                          className="px-2 py-1 rounded-lg bg-emerald-600 text-white text-xs font-bold shrink-0"
                        >
                          Lưu
                        </button>
                      </form>
                    ) : (
                      <h4 className="font-serif font-bold text-stone-100 text-xs sm:text-sm line-clamp-2">
                        {plan.title}
                      </h4>
                    )}

                    <div className="mt-1 flex flex-wrap items-center gap-1.5 text-[10px] sm:text-[11px] text-stone-400">
                      <span>⏱ {plan.duration}</span>
                      <span>• 📍 {plan.slots?.length || 0} {isEnglish ? 'stops' : 'điểm'}</span>
                      {plan.tripStartDate && <span className="hidden sm:inline">• 📅 {plan.tripStartDate}</span>}
                    </div>
                  </div>

                  <div className="pt-1.5 border-t border-stone-800/80 flex items-center justify-between gap-2">
                    <span className="text-[10px] sm:text-[11px] font-bold text-amber-400 flex items-center gap-1 truncate">
                      <span>{isSelected ? (isEnglish ? 'Active' : 'Đang mở') : (isEnglish ? 'Open' : 'Mở xem')}</span>
                      <ArrowRight className="w-3 h-3 shrink-0" />
                    </span>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        title={isEnglish ? 'Rename itinerary' : 'Đổi tên lịch trình'}
                        onClick={e => handleStartRename(plan, e)}
                        className="p-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-stone-300 border border-stone-700"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        title={isEnglish ? 'Duplicate itinerary' : 'Nhân bản lịch trình này'}
                        onClick={e => handleDuplicateItinerary(plan, e)}
                        className="p-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-amber-300 border border-stone-700"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        title={isEnglish ? 'Delete itinerary' : 'Xóa lịch trình'}
                        onClick={e => handleDeleteSavedItinerary(plan.id, e)}
                        className="p-1.5 rounded-lg bg-stone-900 hover:bg-red-950/60 text-red-400 border border-stone-700"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 8.4. Khối Lịch trình mẫu có sẵn: "Khám phá Đà Nẵng" đi qua 3 điểm theo thứ tự địa lý hợp lý */}
      <div className="mb-3.5 sm:mb-6 rounded-2xl bg-stone-900/95 border sm:border-2 border-amber-400/55 p-3 sm:p-5 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-4">
        <div className="min-w-0">
          <div className="inline-flex items-center gap-1 text-amber-300 text-[10px] sm:text-xs font-extrabold uppercase mb-0.5 sm:mb-1.5">
            <span>★ Lịch trình mẫu Đà Nẵng (Bắc → Nam)</span>
          </div>
          <h3 className="text-xs sm:text-lg font-serif font-bold text-amber-50 leading-snug">
            1. Biển Mỹ Khê → 2. Ngũ Hành Sơn → 3. Văn khắc Ma Nhai
          </h3>
          <p className="hidden sm:block text-xs sm:text-sm text-stone-300 mt-1">
            Sắp xếp tối ưu dọc trục đường biển Võ Nguyên Giáp – Trường Sa – Huyền Trân Công Chúa, tiết kiệm thời gian di chuyển.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setDestination('Đà Nẵng');
            setDuration('1 ngày (Sáng đến Tối)');
            setItinerary(DANANG_SAMPLE_ITINERARY);
            setLatestAdaptationRecord(null);
          }}
          className="min-h-[38px] sm:min-h-[44px] px-3.5 sm:px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-[#FFFDF8] font-extrabold text-xs sm:text-sm shrink-0 cursor-pointer shadow-md text-center"
        >
          <span className="sm:hidden">Mở lịch mẫu Đà Nẵng</span>
          <span className="hidden sm:inline">Xem lịch trình mẫu Đà Nẵng</span>
        </button>
      </div>

      {/* Input Form Panel */}
      <div
        ref={formRef}
        data-guide-id="itinerary.form"
        data-guide-type="ui"
        className="bg-stone-900 border border-stone-800 rounded-2xl sm:rounded-3xl p-3.5 sm:p-8 shadow-2xl space-y-3.5 sm:space-y-6 mb-5 sm:mb-8"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-3 border-b border-stone-800 pb-3 sm:pb-4">
          <div>
            <h3 className="text-sm sm:text-lg font-serif font-bold text-stone-100 flex items-center gap-1.5 sm:gap-2">
              <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
              <span>
                <span className="sm:hidden">{isEnglish ? 'Create New Plan' : 'Tạo Lịch Trình Mới'}</span>
                <span className="hidden sm:inline">{isEnglish ? 'Create & Save a New Itinerary' : 'Tạo Lịch Trình Mới & Lưu Vào Bộ Sưu Tập'}</span>
              </span>
            </h3>
            <p className="hidden sm:block text-xs text-stone-400 mt-0.5">
              {isEnglish
                ? 'Each generated itinerary is automatically saved so you can compare and switch between multiple plans.'
                : 'Bạn có thể đặt tên riêng cho từng lịch trình (VD: "Lịch Đà Nẵng ngày 1", "Lịch dự phòng cho bé") để lưu và xem lại dễ dàng.'}
            </p>
          </div>
          <div className="w-full sm:w-72">
            <input
              type="text"
              value={customPlanName}
              onChange={e => setCustomPlanName(e.target.value)}
              placeholder={isEnglish ? 'Optional: Custom itinerary name...' : 'Đặt tên lịch trình (tùy chọn)...'}
              className="w-full bg-stone-950 border border-stone-700 text-stone-100 text-xs rounded-xl px-3 sm:px-3.5 py-2 sm:py-2.5 focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-5 gap-2.5 sm:gap-4">
          {/* Destination */}
          <div className="col-span-2 lg:col-span-1">
            <label className="block text-[11px] sm:text-xs font-semibold text-stone-300 uppercase tracking-wider mb-1 sm:mb-2 flex items-center gap-1">
              <MapPin className="w-3 h-3 text-amber-400" />
              <span>{isEnglish ? 'Destination:' : 'Điểm đến:'}</span>
            </label>
            <select
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              className="w-full bg-stone-950 border border-stone-700 text-stone-100 text-xs rounded-xl px-2.5 sm:px-3.5 py-2 sm:py-2.5 focus:outline-none focus:border-amber-500"
            >
              <option value="Đà Nẵng">{isEnglish ? 'Da Nang (Ngu Hanh Son - Ma Nhai - My Khe)' : 'Đà Nẵng (Ngũ Hành Sơn – Ma Nhai – Mỹ Khê)'}</option>
              <option value="Thành phố Huế">{isEnglish ? 'Hue (Imperial Capital)' : 'Thành phố Huế (Cố đô)'}</option>
              <option value="Hà Nội">{isEnglish ? 'Hanoi (Millennia-Old Capital)' : 'Hà Nội (Thủ đô ngàn năm)'}</option>
              <option value="Phố cổ Hội An">{isEnglish ? 'Hoi An Ancient Town & My Son' : 'Phố cổ Hội An & Mỹ Sơn'}</option>
              <option value="Ninh Bình">{isEnglish ? 'Ninh Binh (Trang An - Hoa Lu)' : 'Ninh Bình (Tràng An - Hoa Lư)'}</option>
              <option value="TP. Hồ Chí Minh">{isEnglish ? 'Ho Chi Minh City (Old & New Saigon)' : 'TP. Hồ Chí Minh (Sài Gòn xưa & nay)'}</option>
              <option value="Quảng Ninh">{isEnglish ? 'Ha Long Bay (Quang Ninh)' : 'Vịnh Hạ Long (Quảng Ninh)'}</option>
              <option value="Lào Cai">{isEnglish ? 'Sa Pa & Fansipan (Lao Cai)' : 'Sa Pa & Fansipan (Lào Cai)'}</option>
              <option value="Hà Giang">{isEnglish ? 'Ha Giang (Dong Van Karst)' : 'Hà Giang (Đồng Văn - Lũng Cú)'}</option>
              <option value="Cao Bằng">{isEnglish ? 'Cao Bang (Ban Gioc Waterfall)' : 'Cao Bằng (Thác Bản Giốc)'}</option>
              <option value="Lâm Đồng">{isEnglish ? 'Da Lat (City of Eternal Spring)' : 'Đà Lạt (Xứ ngàn hoa)'}</option>
              <option value="Khánh Hòa">{isEnglish ? 'Nha Trang (Ponagar Tower)' : 'Nha Trang (Tháp Bà Ponagar)'}</option>
              <option value="Kiên Giang">{isEnglish ? 'Phu Quoc Island' : 'Đảo Ngọc Phú Quốc'}</option>
              <option value="Cần Thơ">{isEnglish ? 'Can Tho (Mekong Delta)' : 'Cần Thơ (Chợ nổi Cái Răng)'}</option>
              <option value="Tây Ninh">{isEnglish ? 'Tay Ninh (Ba Den Mountain)' : 'Tây Ninh (Núi Bà Đen)'}</option>
              <option value="Bà Rịa - Vũng Tàu">{isEnglish ? 'Con Dao & Vung Tau' : 'Côn Đảo & Vũng Tàu'}</option>
            </select>
          </div>

          {/* Travel Start Date */}
          <div className="col-span-1">
            <label className="block text-[11px] sm:text-xs font-semibold text-stone-300 uppercase tracking-wider mb-1 sm:mb-2 flex items-center gap-1">
              <Calendar className="w-3 h-3 text-amber-400" />
              <span>{isEnglish ? 'Start Date:' : 'Ngày đi:'}</span>
            </label>
            <input
              type="date"
              value={travelStartDate}
              onChange={(e) => setTravelStartDate(e.target.value)}
              className="w-full bg-stone-950 border border-stone-700 text-stone-100 text-xs rounded-xl px-2.5 sm:px-3.5 py-2 sm:py-2.5 focus:outline-none focus:border-amber-500 cursor-pointer"
            />
          </div>

          {/* Duration */}
          <div className="col-span-1">
            <label className="block text-[11px] sm:text-xs font-semibold text-stone-300 uppercase tracking-wider mb-1 sm:mb-2 flex items-center gap-1">
              <Clock className="w-3 h-3 text-amber-400" />
              <span>{isEnglish ? 'Duration:' : 'Thời lượng:'}</span>
            </label>
            <select
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="w-full bg-stone-950 border border-stone-700 text-stone-100 text-xs rounded-xl px-2.5 sm:px-3.5 py-2 sm:py-2.5 focus:outline-none focus:border-amber-500"
            >
              <option value="1 ngày (Sáng đến Tối)">{isEnglish ? '1 full day' : '1 ngày (Trọn vẹn)'}</option>
              <option value="2 ngày 1 đêm">{isEnglish ? '2 days, 1 night' : '2 ngày 1 đêm'}</option>
              <option value="3 ngày 2 đêm">{isEnglish ? '3 days, 2 nights' : '3 ngày 2 đêm'}</option>
            </select>
          </div>

          {/* Companion */}
          <div className="col-span-1">
            <label className="block text-[11px] sm:text-xs font-semibold text-stone-300 uppercase tracking-wider mb-1 sm:mb-2">
              {isEnglish ? 'Travel party:' : 'Đồng hành:'}
            </label>
            <select
              value={companion}
              onChange={(e) => setCompanion(e.target.value)}
              className="w-full bg-stone-950 border border-stone-700 text-stone-100 text-xs rounded-xl px-2.5 sm:px-3.5 py-2 sm:py-2.5 focus:outline-none focus:border-amber-500"
            >
              <option value="Gia đình có trẻ em">{isEnglish ? 'Family with children' : 'Gia đình có trẻ em'}</option>
              <option value="Nhóm bạn trẻ / Sinh viên">{isEnglish ? 'Friends / Students' : 'Nhóm bạn trẻ / Sinh viên'}</option>
              <option value="Đi một mình / Du lịch tự túc">{isEnglish ? 'Solo traveler' : 'Đi một mình'}</option>
              <option value="Người lớn tuổi / Nghỉ dưỡng">{isEnglish ? 'Older adults' : 'Người lớn tuổi'}</option>
            </select>
          </div>

          {/* Budget */}
          <div className="col-span-1">
            <label className="block text-[11px] sm:text-xs font-semibold text-stone-300 uppercase tracking-wider mb-1 sm:mb-2">
              {isEnglish ? 'Budget:' : 'Ngân sách:'}
            </label>
            <select
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              className="w-full bg-stone-950 border border-stone-700 text-stone-100 text-xs rounded-xl px-2.5 sm:px-3.5 py-2 sm:py-2.5 focus:outline-none focus:border-amber-500"
            >
              <option value="Tiết kiệm (Sinh viên)">{isEnglish ? 'Budget-friendly' : 'Tiết kiệm'}</option>
              <option value="Vừa phải (Phổ thông)">{isEnglish ? 'Moderate' : 'Vừa phải'}</option>
              <option value="Thoải mái (Cao cấp)">{isEnglish ? 'Comfortable' : 'Thoải mái'}</option>
            </select>
          </div>
        </div>

        {/* Real-time Weather Card for Destination */}
        <div className="pt-0.5 sm:pt-1" data-guide-id="itinerary.weatherCard" data-guide-type="ui">
          <ItineraryWeatherCard
            destination={destination}
            onCityChange={(newCity) => setDestination(newCity)}
            language={language}
            selectedDate={travelStartDate}
            durationDays={durationDays}
          />
        </div>

        {/* Interests Selection */}
        <div>
          <label className="block text-[11px] sm:text-xs font-semibold text-stone-300 uppercase tracking-wider mb-1.5 sm:mb-2">
            {isEnglish ? 'Interests & Priorities:' : 'Sở thích & Ưu tiên:'}
          </label>
          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            {interestOptions.map((opt) => {
              const active = interests.includes(opt);
              return (
                <button
                  key={opt}
                  type="button"
                  onClick={() => handleToggleInterest(opt)}
                  className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-medium transition-all ${
                    active
                      ? 'bg-amber-500 text-[#FFFDF8] font-bold shadow'
                      : 'bg-stone-950 text-stone-400 border border-stone-800 hover:border-stone-700'
                  }`}
                >
                  {active ? '✓ ' : '+ '}
                  {isEnglish ? ({ 'Di tích Cung đình & Lịch sử': 'Imperial Sites & History', 'Ẩm thực địa phương & Ăn vặt': 'Local Food & Street Snacks', 'Làng nghề thủ công & Trải nghiệm': 'Craft Villages & Experiences', 'Cà phê ngắm cảnh & Check-in': 'Scenic Cafés & Photo Spots', 'Nghệ thuật & Bảo tàng': 'Art & Museums', 'Chùa chiền & Tâm linh': 'Temples & Spirituality' } as Record<string, string>)[opt] || opt : opt}
                </button>
              );
            })}
          </div>
        </div>

        {/* Generate Button */}
        <button
          id="btn-generate-itinerary"
          data-guide-id="itinerary.generateBtn"
          data-guide-type="ui"
          onClick={() => handleGenerate(true)}
          disabled={loading}
          className="w-full min-h-[44px] py-3 sm:py-3.5 rounded-xl bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 hover:from-amber-500 hover:to-amber-400 text-[#FFFDF8] font-bold text-xs sm:text-sm shadow-xl shadow-amber-900/40 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
        >
          {loading ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin text-[#FFFDF8]" />
              <span>{isEnglish ? 'AI is calculating and saving your new itinerary...' : 'AI đang thiết kế cung đường tối ưu & lưu...'}</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-[#FFFDF8]" />
              <span>{isEnglish ? 'Generate & Save New Optimized Itinerary' : 'Tạo Lịch Trình Mới & Tự Động Lưu Lại'}</span>
            </>
          )}
        </button>
      </div>

      {/* Itinerary Result Display */}
      {itinerary && (
        <div
          ref={resultRef}
          className="bg-stone-900 border border-amber-500/40 rounded-2xl sm:rounded-3xl p-3.5 sm:p-8 shadow-2xl space-y-4 sm:space-y-6 animate-fadeIn"
        >
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 sm:gap-4 border-b border-stone-800 pb-3.5 sm:pb-5">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[11px] sm:text-xs font-semibold text-amber-300">
                  {itinerary.duration} • {itinerary.destination}
                </span>
                {isCurrentPlanSaved && (
                  <span className="text-[11px] sm:text-xs px-2 py-0.5 rounded-md bg-emerald-600/20 text-emerald-300 border border-emerald-500/30 font-bold inline-flex items-center gap-1">
                    <Check className="w-3 h-3" />
                    <span>{isEnglish ? 'Saved' : 'Đã lưu'}</span>
                  </span>
                )}
              </div>
              <h3 className="text-lg sm:text-2xl font-serif font-bold text-stone-100 mt-1 sm:mt-2 leading-snug">
                {itinerary.title}
              </h3>
              <p className="text-[11px] sm:text-xs text-stone-400 mt-1 flex items-start gap-1.5">
                <Car className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                <span>{itinerary.routeSummary}</span>
              </p>
            </div>

            <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2 w-full sm:w-auto shrink-0">
              <button
                type="button"
                onClick={() => handleSaveCurrentItinerary(false)}
                className="min-h-[38px] sm:min-h-0 px-3 sm:px-4 py-2 rounded-xl text-[11px] sm:text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow bg-amber-500 hover:bg-amber-400 text-[#FFFDF8] cursor-pointer"
              >
                <Bookmark className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">
                  {isCurrentPlanSaved
                    ? isEnglish
                      ? 'Update Plan'
                      : 'Cập nhật lịch'
                    : isEnglish
                    ? 'Save Plan'
                    : 'Lưu lịch này'}
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleSaveCurrentItinerary(true)}
                className="min-h-[38px] sm:min-h-0 px-3 sm:px-3.5 py-2 rounded-xl text-[11px] sm:text-xs font-semibold flex items-center justify-center gap-1.5 transition-all bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 cursor-pointer"
              >
                <PlusCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span className="truncate">{isEnglish ? 'Save as New' : 'Lưu lịch mới'}</span>
              </button>
            </div>
          </div>

          {/* ===================================================================== */}
          {/* KHU VỰC 2: TRỢ LÝ AI XỬ LÝ TÌNH HUỐNG PHÁT SINH KHI ĐI CHƠI          */}
          {/* (Con ốm, Địa điểm đóng cửa, Mưa lớn, Trễ giờ)                          */}
          {/* ===================================================================== */}
          <div
            ref={incidentPanelRef}
            className="rounded-2xl sm:rounded-3xl bg-stone-950 border sm:border-2 border-amber-500/55 p-3.5 sm:p-6 shadow-xl space-y-3 sm:space-y-4"
          >
            <div className="flex flex-wrap items-start justify-between gap-2.5 sm:gap-3">
              <div className="flex items-start gap-2.5 sm:gap-3">
                <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
                  <Wand2 className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div>
                  <div className="text-amber-400 text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wide mb-0.5">
                    <span>Trợ Lý AI Xử Lý Tình Huống Thực Tế</span>
                  </div>
                  <h4 className="text-sm sm:text-lg font-serif font-bold text-stone-100 leading-snug">
                    {isEnglish
                      ? 'Unexpected Situation? Let AI Adapt Immediately'
                      : 'Gặp tình huống phát sinh? AI đổi giờ & gợi ý điểm gần đó'}
                  </h4>
                  <p className="hidden sm:block text-xs text-stone-300 mt-0.5">
                    {isEnglish
                      ? 'If your child feels sick/tired or a venue is unexpectedly closed, select a situation below and AI will reschedule or find the closest open spot.'
                      : 'Khi con ốm cần nghỉ ngơi/đổi giờ hoặc địa điểm dự kiến bị đóng cửa, hãy chọn tình huống bên dưới để AI gợi ý ngay điểm thay thế gần đó và sắp xếp lại giờ hợp lý.'}
                  </p>
                </div>
              </div>

              {previousItinerarySnapshot && (
                <button
                  type="button"
                  onClick={handleUndoAdaptation}
                  className="px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-amber-300 border border-amber-500/40 text-[11px] sm:text-xs font-bold flex items-center gap-1.5 cursor-pointer shrink-0"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>{isEnglish ? 'Undo' : 'Hoàn tác'}</span>
                </button>
              )}
            </div>

            {/* 4 Quick Scenario Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-2.5">
              {/* 1. Con ốm / Trẻ mệt */}
              <button
                type="button"
                onClick={() => {
                  setSelectedIncidentType('child_sick');
                  setIncidentShiftMinutes(120);
                }}
                className={`text-left p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl border transition-all cursor-pointer ${
                  selectedIncidentType === 'child_sick'
                    ? 'bg-amber-500/20 border-2 border-amber-500 shadow-md'
                    : 'bg-stone-900/90 border-stone-800 hover:border-amber-500/40'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="inline-flex items-center gap-1 sm:gap-1.5 text-[11px] sm:text-xs font-extrabold text-amber-300">
                    <HeartPulse className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-400 shrink-0" />
                    <span>{isEnglish ? 'Child Sick' : 'Con ốm / mệt'}</span>
                  </span>
                  {selectedIncidentType === 'child_sick' && (
                    <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0" />
                  )}
                </div>
                <p className="text-[10px] sm:text-[11px] text-stone-300 leading-snug line-clamp-2 sm:line-clamp-none">
                  {isEnglish
                    ? 'Delay schedule for rest, replace climbing/sun with gentle indoor spot.'
                    : 'Lùi giờ cho bé nghỉ, đổi sang điểm mát nhẹ nhàng gần đó.'}
                </p>
              </button>

              {/* 2. Địa điểm đóng cửa */}
              <button
                type="button"
                onClick={() => {
                  setSelectedIncidentType('place_closed');
                  setIncidentShiftMinutes(0);
                }}
                className={`text-left p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl border transition-all cursor-pointer ${
                  selectedIncidentType === 'place_closed'
                    ? 'bg-amber-500/20 border-2 border-amber-500 shadow-md'
                    : 'bg-stone-900/90 border-stone-800 hover:border-amber-500/40'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="inline-flex items-center gap-1 sm:gap-1.5 text-[11px] sm:text-xs font-extrabold text-amber-300">
                    <DoorClosed className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-orange-400 shrink-0" />
                    <span>{isEnglish ? 'Place Closed' : 'Đóng cửa'}</span>
                  </span>
                  {selectedIncidentType === 'place_closed' && (
                    <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0" />
                  )}
                </div>
                <p className="text-[10px] sm:text-[11px] text-stone-300 leading-snug line-clamp-2 sm:line-clamp-none">
                  {isEnglish
                    ? 'Replace closed spot with the nearest open venue (1–3 km).'
                    : 'Gợi ý ngay địa điểm mở cửa gần đó nhất (1–3 km) thay thế.'}
                </p>
              </button>

              {/* 3. Mưa lớn / Nắng gắt */}
              <button
                type="button"
                onClick={() => {
                  setSelectedIncidentType('bad_weather');
                  setIncidentShiftMinutes(0);
                }}
                className={`text-left p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl border transition-all cursor-pointer ${
                  selectedIncidentType === 'bad_weather'
                    ? 'bg-amber-500/20 border-2 border-amber-500 shadow-md'
                    : 'bg-stone-900/90 border-stone-800 hover:border-amber-500/40'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="inline-flex items-center gap-1 sm:gap-1.5 text-[11px] sm:text-xs font-extrabold text-amber-300">
                    <CloudRain className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-sky-400 shrink-0" />
                    <span>{isEnglish ? 'Rain / Heat' : 'Mưa / Nắng gắt'}</span>
                  </span>
                  {selectedIncidentType === 'bad_weather' && (
                    <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0" />
                  )}
                </div>
                <p className="text-[10px] sm:text-[11px] text-stone-300 leading-snug line-clamp-2 sm:line-clamp-none">
                  {isEnglish
                    ? 'Switch outdoor stops to indoor museums or craft workshops.'
                    : 'Chuyển điểm ngoài trời sang bảo tàng, nhà cổ có mái che.'}
                </p>
              </button>

              {/* 4. Đổi giờ / Trễ lịch */}
              <button
                type="button"
                onClick={() => {
                  setSelectedIncidentType('time_shift');
                  if (incidentShiftMinutes === 0) setIncidentShiftMinutes(120);
                }}
                className={`text-left p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl border transition-all cursor-pointer ${
                  selectedIncidentType === 'time_shift'
                    ? 'bg-amber-500/20 border-2 border-amber-500 shadow-md'
                    : 'bg-stone-900/90 border-stone-800 hover:border-amber-500/40'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="inline-flex items-center gap-1 sm:gap-1.5 text-[11px] sm:text-xs font-extrabold text-amber-300">
                    <AlarmClock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400 shrink-0" />
                    <span>{isEnglish ? 'Reschedule' : 'Đổi giờ / Trễ'}</span>
                  </span>
                  {selectedIncidentType === 'time_shift' && (
                    <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0" />
                  )}
                </div>
                <p className="text-[10px] sm:text-[11px] text-stone-300 leading-snug line-clamp-2 sm:line-clamp-none">
                  {isEnglish
                    ? 'Shift start time +1–3h & recalculate all subsequent stops.'
                    : 'Lùi lịch +1h, +2h, +3h và tự động tính lại toàn bộ giờ.'}
                </p>
              </button>
            </div>

            {/* Target Slot & Time Shift Controls */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              {/* Chọn mốc áp dụng */}
              <div>
                <label className="block text-[11px] font-bold text-stone-300 uppercase mb-1.5">
                  {isEnglish ? '1. Apply to which stop?' : '1. Áp dụng cho mốc nào?'}
                </label>
                <select
                  value={incidentTargetSlot === 'all' ? 'all' : String(incidentTargetSlot)}
                  onChange={e =>
                    setIncidentTargetSlot(e.target.value === 'all' ? 'all' : parseInt(e.target.value, 10))
                  }
                  className="w-full bg-stone-900 border border-stone-700 text-stone-100 text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:border-amber-500"
                >
                  <option value="all">
                    {isEnglish ? 'Entire itinerary (AI auto-optimizes)' : 'Toàn bộ lịch trình (AI tự động tối ưu)'}
                  </option>
                  {itinerary.slots.map((s, idx) => (
                    <option key={idx} value={String(idx)}>
                      Mốc #{idx + 1} ({s.time}): {s.locationName}
                    </option>
                  ))}
                </select>
              </div>

              {/* Chọn mức đổi thời gian */}
              <div>
                <label className="block text-[11px] font-bold text-stone-300 uppercase mb-1.5">
                  {isEnglish ? '2. Time adjustment (if needed):' : '2. Điều chỉnh thời gian (khi con ốm / trễ giờ):'}
                </label>
                <select
                  value={incidentShiftMinutes}
                  onChange={e => setIncidentShiftMinutes(parseInt(e.target.value, 10))}
                  className="w-full bg-stone-900 border border-stone-700 text-stone-100 text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:border-amber-500"
                >
                  <option value={0}>
                    {isEnglish ? 'Keep current time (Only change nearby place)' : 'Giữ nguyên giờ — Chỉ đổi sang địa điểm gần đó'}
                  </option>
                  <option value={60}>
                    {isEnglish ? 'Delay by +1 hour (60 mins rest)' : 'Lùi lịch +1 tiếng (Nghỉ ngơi 60 phút)'}
                  </option>
                  <option value={120}>
                    {isEnglish ? 'Delay by +2 hours (120 mins rest for child)' : 'Lùi lịch +2 tiếng (Cho bé nghỉ ngơi 2 giờ)'}
                  </option>
                  <option value={180}>
                    {isEnglish ? 'Delay by +3 hours (Move to afternoon)' : 'Lùi lịch +3 tiếng (Dời sang buổi chiều mát)'}
                  </option>
                </select>
              </div>

              {/* Ghi chú chi tiết */}
              <div>
                <label className="block text-[11px] font-bold text-stone-300 uppercase mb-1.5">
                  {isEnglish ? '3. Specific note (optional):' : '3. Mô tả thêm tình huống (tùy chọn):'}
                </label>
                <input
                  type="text"
                  value={incidentCustomNote}
                  onChange={e => setIncidentCustomNote(e.target.value)}
                  placeholder={
                    selectedIncidentType === 'child_sick'
                      ? 'VD: Bé hơi sốt cần chỗ mát có cháo ấm...'
                      : selectedIncidentType === 'place_closed'
                      ? 'VD: Điểm này đang bảo trì, tìm điểm cách <2km...'
                      : 'Nhập yêu cầu cụ thể của gia đình...'
                  }
                  className="w-full bg-stone-900 border border-stone-700 text-stone-100 text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            {/* Submit Adaptation Button */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
              <p className="text-[11px] text-stone-400">
                💡 {isEnglish
                  ? 'Tip: You can also click "Place Closed" or "Child Sick / Reschedule" directly on any stop card below.'
                  : 'Mẹo: Bạn cũng có thể bấm nút "Đóng cửa" hoặc "Con ốm / Đổi giờ" trực tiếp ở từng mốc thời gian bên dưới.'}
              </p>

              <button
                type="button"
                disabled={adaptingLoading}
                onClick={() => handleAdaptForIncident()}
                className="px-5 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-[#FFFDF8] font-extrabold text-xs sm:text-sm shadow-lg flex items-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {adaptingLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>{isEnglish ? 'AI is finding nearby places & rescheduling...' : 'AI đang tìm địa điểm gần đó & sắp xếp lại giờ...'}</span>
                  </>
                ) : (
                  <>
                    <Wand2 className="w-4 h-4" />
                    <span>
                      {selectedIncidentType === 'child_sick'
                        ? isEnglish
                          ? 'Adapt Schedule for Sick Child & Save'
                          : 'Đổi Giờ & Tìm Điểm Nghỉ Nhẹ Nhàng Cho Bé'
                        : selectedIncidentType === 'place_closed'
                        ? isEnglish
                          ? 'Suggest Open Nearby Place & Save'
                          : 'Gợi Ý Địa Điểm Mở Cửa Gần Đó Thay Thế'
                        : isEnglish
                        ? 'Apply AI Itinerary Adaptation'
                        : 'Nhờ AI Điều Chỉnh Lịch Trình Ngay'}
                    </span>
                  </>
                )}
              </button>
            </div>

            {/* Latest AI Adaptation Result Banner */}
            {latestAdaptationRecord && (
              <div className="mt-3 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 p-4 space-y-2 animate-fadeIn">
                <div className="flex items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1.5 text-xs font-extrabold text-emerald-300 uppercase">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>{latestAdaptationRecord.incidentLabel}</span>
                  </span>
                  <span className="text-[11px] text-stone-400 flex items-center gap-1">
                    <History className="w-3 h-3" />
                    <span>Đã tự động lưu cập nhật</span>
                  </span>
                </div>
                <p className="text-xs text-stone-200 leading-relaxed">
                  {latestAdaptationRecord.aiSummary}
                </p>
                {latestAdaptationRecord.changesMade.length > 0 && (
                  <ul className="space-y-1 pt-1">
                    {latestAdaptationRecord.changesMade.map((chg, i) => (
                      <li key={i} className="text-xs text-amber-200 flex items-start gap-1.5">
                        <span className="text-amber-400 font-bold">•</span>
                        <span>{chg}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>

          {/* Active Trip Weather Forecast & Activity Guidance */}
          <div>
            <ItineraryWeatherCard
              destination={itinerary.destination || destination}
              onCityChange={(newCity) => setDestination(newCity)}
              language={language}
              selectedDate={travelStartDate}
              durationDays={durationDays}
            />
          </div>

          {/* AI Reasoning Box: "Vì sao AI sắp xếp như vậy?" */}
          <div className="p-3.5 sm:p-5 bg-amber-950/30 border border-amber-500/40 rounded-xl sm:rounded-2xl space-y-1.5 sm:space-y-2">
            <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>{isEnglish ? 'Why did AI arrange the itinerary this way?' : 'Vì sao AI sắp xếp lịch trình như vậy?'}</span>
            </h4>
            <p className="text-[11px] sm:text-xs text-stone-300 leading-snug sm:leading-relaxed whitespace-pre-line">
              {itinerary.aiOptimizationReasoning}
            </p>
          </div>

          {/* Timeline Route Slots */}
          <div className="space-y-3 sm:space-y-4 pt-1 sm:pt-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h4 className="text-[11px] sm:text-xs font-semibold text-stone-300 uppercase tracking-wider">
                {isEnglish ? 'Itinerary timeline (Click buttons on any stop if needed):' : 'Chi tiết các mốc thời gian:'}
              </h4>
            </div>

            <div className="relative pl-5 sm:pl-8 border-l-2 border-amber-500/30 space-y-3.5 sm:space-y-6">
              {itinerary.slots.map((slot, idx) => {
                const isThisSlotAdapting = adaptingLoading && adaptingSlotIndex === idx;
                return (
                  <div key={idx} className="relative group">
                    {/* Timeline Dot */}
                    <div
                      className={`absolute -left-[27px] sm:-left-[39px] top-0 w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                        slot.isAdapted
                          ? 'bg-emerald-600 border-2 border-emerald-300 text-white'
                          : 'bg-stone-950 border-2 border-amber-500 text-amber-400'
                      }`}
                    >
                      {idx + 1}
                    </div>

                    {/* Slot Card */}
                    <div
                      className={`p-3 sm:p-5 bg-stone-950 rounded-xl sm:rounded-2xl border transition-all space-y-2 sm:space-y-3 ${
                        slot.isAdapted
                          ? 'border-emerald-500/60 shadow-lg shadow-emerald-950/30'
                          : 'border-stone-800 hover:border-amber-500/40'
                      }`}
                    >
                      {/* Adapted Status Banner */}
                      {slot.isAdapted && (
                        <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-1.5 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-xs text-emerald-200">
                          <span className="font-bold flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                            <span>{slot.adaptationReason || 'Đã được AI điều chỉnh linh hoạt theo tình huống thực tế'}</span>
                          </span>
                          {(slot.previousLocationName || slot.previousTime) && (
                            <span className="text-[11px] text-stone-400">
                              {slot.previousTime && slot.previousTime !== slot.time ? `Giờ cũ: ${slot.previousTime} • ` : ''}
                              {slot.previousLocationName && slot.previousLocationName !== slot.locationName
                                ? `Điểm cũ: ${slot.previousLocationName}`
                                : ''}
                            </span>
                          )}
                        </div>
                      )}

                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          {getActivityIcon(slot.activityType)}
                          <span className="text-xs font-bold text-amber-300">{slot.time}</span>
                          <span className="text-stone-400 text-xs">({slot.durationMinutes} {isEnglish ? 'min' : 'phút'})</span>
                        </div>
                        <span className="text-[11px] px-2.5 py-0.5 rounded-lg bg-stone-900 text-amber-200 border border-stone-700 font-medium">
                          📍 {slot.locationName}
                        </span>
                      </div>

                      <h5 className="font-serif font-bold text-stone-100 text-sm sm:text-base">{slot.title}</h5>
                      <p className="text-xs text-stone-300 leading-relaxed">{slot.description}</p>

                      {/* Time-of-Day Weather Guidance */}
                      <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-stone-900/90 border border-stone-800/80 text-[11px] text-stone-300">
                        <CloudSun className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span>
                          {slot.time.startsWith('07') || slot.time.startsWith('08') || slot.time.startsWith('09')
                            ? (isEnglish ? 'Morning: Mild & cool weather, ideal for photography & heritage walking' : 'Buổi sáng: Không khí mát lành, lý tưởng chụp ảnh & dạo bộ di tích')
                            : slot.time.startsWith('11') || slot.time.startsWith('12') || slot.time.startsWith('13')
                            ? (isEnglish ? 'Midday: Strong sun, enjoy local dining or sheltered indoor halls' : 'Buổi trưa: Nắng gắt, ưu tiên thưởng thức ẩm thực hoặc gian trưng bày trong nhà')
                            : slot.time.startsWith('14') || slot.time.startsWith('15')
                            ? (isEnglish ? 'Early afternoon: Shaded palace pavilions or craft workshops' : 'Đầu giờ chiều: Trải nghiệm làng nghề, gian cung điện râm mát')
                            : (isEnglish ? 'Late afternoon: Pleasant breeze, perfect for scenic sunset walk' : 'Chiều tà: Gió dịu mát, lý tưởng ngắm hoàng hôn & phố cổ')}
                        </span>
                      </div>

                      {slot.tip && (
                        <div className="p-2.5 bg-stone-900/80 rounded-xl text-[11px] text-amber-200 border border-amber-500/20 flex items-start gap-1.5">
                          <Info className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                          <span><strong>{isEnglish ? 'AI Tip:' : 'Mẹo AI:'}</strong> {slot.tip}</span>
                        </div>
                      )}

                      {/* Nearby Alternative Suggestions (if generated by AI when venue closed / child sick) */}
                      {slot.nearbyAlternativeSuggestions && slot.nearbyAlternativeSuggestions.length > 0 && (
                        <div className="p-3 rounded-xl bg-stone-900 border border-amber-500/30 space-y-2">
                          <p className="text-[11px] font-bold text-amber-300 flex items-center gap-1.5">
                            <Navigation className="w-3.5 h-3.5 text-amber-400" />
                            <span>
                              {isEnglish
                                ? 'Other nearby places recommended by AI (Click to switch immediately):'
                                : 'Các địa điểm gần đó khác do AI đề xuất (Bấm để đổi ngay sang điểm bạn thích):'}
                            </span>
                          </p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {slot.nearbyAlternativeSuggestions.map((alt, altIdx) => (
                              <div
                                key={altIdx}
                                className="p-2.5 rounded-xl bg-stone-950 border border-stone-800 hover:border-amber-500/50 flex flex-col justify-between gap-2"
                              >
                                <div>
                                  <div className="flex items-center justify-between gap-1">
                                    <span className="text-xs font-bold text-stone-100">{alt.name}</span>
                                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-semibold shrink-0">
                                      {alt.distance}
                                    </span>
                                  </div>
                                  <p className="text-[11px] text-stone-400 mt-1">{alt.reason}</p>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => handleSwapSlotWithAlternative(idx, alt)}
                                  className="self-start px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-[#FFFDF8] text-[11px] font-bold cursor-pointer"
                                >
                                  {isEnglish ? 'Choose this place' : 'Chọn địa điểm này'}
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Per-Slot Quick Incident Action Buttons */}
                      <div className="pt-2 border-t border-stone-800/80 flex flex-wrap items-center justify-between gap-2">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <button
                            type="button"
                            disabled={adaptingLoading}
                            onClick={() =>
                              handleAdaptForIncident({
                                overrideType: 'place_closed',
                                overrideSlotIndex: idx,
                                overrideShiftMinutes: 0
                              })
                            }
                            className="px-2 sm:px-2.5 py-1.5 rounded-lg bg-stone-900 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[11px] font-semibold flex items-center gap-1 cursor-pointer disabled:opacity-50"
                          >
                            {isThisSlotAdapting && selectedIncidentType === 'place_closed' ? (
                              <RefreshCw className="w-3 h-3 animate-spin" />
                            ) : (
                              <DoorClosed className="w-3 h-3 text-orange-400" />
                            )}
                            <span className="sm:hidden">{isEnglish ? 'Closed → Swap' : 'Đóng cửa → Đổi'}</span>
                            <span className="hidden sm:inline">{isEnglish ? 'Place Closed -> Suggest Nearby' : 'Điểm này đóng cửa → Gợi ý điểm gần đó'}</span>
                          </button>

                          <button
                            type="button"
                            disabled={adaptingLoading}
                            onClick={() =>
                              handleAdaptForIncident({
                                overrideType: 'child_sick',
                                overrideSlotIndex: idx,
                                overrideShiftMinutes: 120
                              })
                            }
                            className="px-2 sm:px-2.5 py-1.5 rounded-lg bg-stone-900 hover:bg-red-500/20 text-stone-200 border border-stone-700 hover:border-red-400/40 text-[11px] font-semibold flex items-center gap-1 cursor-pointer disabled:opacity-50"
                          >
                            <HeartPulse className="w-3 h-3 text-red-400" />
                            <span className="sm:hidden">{isEnglish ? 'Child Sick (-2h)' : 'Con ốm → Lùi 2h'}</span>
                            <span className="hidden sm:inline">{isEnglish ? 'Child Sick -> Delay & Gentle Spot' : 'Con ốm / mệt → Lùi 2h & tìm chỗ nhẹ nhàng'}</span>
                          </button>

                          <button
                            type="button"
                            disabled={adaptingLoading}
                            onClick={() =>
                              handleAdaptForIncident({
                                overrideType: 'time_shift',
                                overrideSlotIndex: idx,
                                overrideShiftMinutes: 60
                              })
                            }
                            className="px-2 sm:px-2.5 py-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-stone-300 border border-stone-700 text-[11px] font-medium flex items-center gap-1 cursor-pointer disabled:opacity-50"
                          >
                            <AlarmClock className="w-3 h-3 text-emerald-400" />
                            <span>{isEnglish ? '+1h' : 'Lùi +1h'}</span>
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            const matchedH =
                              HERITAGE_DATABASE.find(
                                (h) =>
                                  slot.locationName
                                    .toLowerCase()
                                    .includes(h.name.toLowerCase()) ||
                                  h.name
                                    .toLowerCase()
                                    .includes(slot.locationName.toLowerCase())
                              ) ||
                              HERITAGE_DATABASE.find((h) =>
                                itinerary.destination
                                  .toLowerCase()
                                  .includes(h.province.toLowerCase())
                              ) ||
                              HERITAGE_DATABASE[0];
                            triggerInAppMapRoute({
                              heritageId: matchedH.id,
                            });
                          }}
                          className="text-[11px] text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-bold shrink-0 cursor-pointer py-1"
                        >
                          <MapPin className="w-3 h-3 text-red-400" />
                          <span className="sm:hidden">{isEnglish ? 'Web Map' : 'Bản đồ Web'}</span>
                          <span className="hidden sm:inline">
                            {isEnglish
                              ? 'Route on Web Map'
                              : 'Chỉ đường trên Bản đồ Web'}
                          </span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Optional Authentication Modal */}
      {showAuthNoticeModal && (
        <div className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-stone-900 border border-amber-500/40 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 text-center relative">
            <button
              onClick={() => setShowAuthNoticeModal(false)}
              className="absolute top-4 right-4 p-1 rounded-xl bg-stone-800 text-stone-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 mx-auto flex items-center justify-center">
              <Lock className="w-8 h-8" />
            </div>

            <div>
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-extrabold uppercase border border-amber-500/30">
                {isEnglish ? 'Sync Across Devices' : 'Đồng bộ Tài khoản'}
              </span>
              <h3 className="text-xl font-serif font-bold text-stone-100 mt-2">
                {isEnglish ? 'Sync Your Saved Itineraries' : 'Đồng Bộ Lịch Trình Của Bạn'}
              </h3>
              <p className="text-xs text-stone-300 mt-2 leading-relaxed">
                {isEnglish
                  ? 'Sign in to sync your saved itineraries across all your devices.'
                  : 'Đăng nhập tài khoản để đồng bộ các lịch trình đã lưu trên mọi thiết bị của bạn.'}
              </p>
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <button
                onClick={() => {
                  setShowAuthNoticeModal(false);
                  if (onRequireAuth) onRequireAuth();
                }}
                className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-[#FFFDF8] font-bold text-xs rounded-xl shadow-lg transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <User className="w-4 h-4" />
                <span>{isEnglish ? 'Sign In / Register' : 'Đăng Nhập / Đăng Ký Ngay'}</span>
              </button>
              <button
                onClick={() => setShowAuthNoticeModal(false)}
                className="w-full py-2.5 bg-stone-800 hover:bg-stone-700 text-stone-300 font-semibold text-xs rounded-xl transition cursor-pointer"
              >
                {isEnglish ? 'Close' : 'Đóng'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
