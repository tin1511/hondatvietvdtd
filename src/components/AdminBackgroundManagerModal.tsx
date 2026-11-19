import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  Image as ImageIcon,
  Upload,
  Check,
  RotateCcw,
  Sparkles,
  Sliders,
  MapPin,
  Layers,
  ExternalLink,
  CheckCircle2,
  Edit3,
  Plus,
  Loader2,
  Eye,
  Video,
  Film
} from 'lucide-react';
import { HomeBackgroundConfig, HomeSectionBackgroundOverride, CityLandmarkBackground } from '../types';
import { storageService, DEFAULT_HOME_BACKGROUNDS } from '../services/storageService';
import { saveHomeBackgroundsToFirebase } from '../services/systemConfigService';
import { AILandmarkImagePickerModal } from './AILandmarkImagePickerModal';
import { LandmarkEditModal } from './LandmarkEditModal';
import { handleImageError } from '../utils/imageUtils';
import { extractYouTubeId } from './DynamicHeritageBackground';

interface AdminBackgroundManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialSectionId?: string;
  onConfigUpdated?: (config: HomeBackgroundConfig) => void;
  onLandmarkSelected?: (landmark: CityLandmarkBackground) => void;
}

const CURATED_BACKGROUND_PRESETS: { title: string; subtitle: string; url: string; tag: string }[] = [
  {
    title: 'Đà Nẵng — Cầu Vàng & Núi Chúa',
    subtitle: 'Danh thắng Đà Nẵng · Sơn Trà · Ngũ Hành Sơn',
    url: 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?auto=format&fit=crop&w=1800&q=85',
    tag: 'Đà Nẵng'
  },
  {
    title: 'Ngũ Hành Sơn & Văn khắc Ma Nhai',
    subtitle: 'Di sản Tư liệu Ký ức Thế giới UNESCO tại Đà Nẵng',
    url: 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?auto=format&fit=crop&w=1800&q=85',
    tag: 'Đà Nẵng'
  },
  {
    title: 'Biển Mỹ Khê Bình Minh',
    subtitle: 'Bãi biển quyến rũ hành tinh tại TP. Đà Nẵng',
    url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1800&q=85',
    tag: 'Biển Đà Nẵng'
  },
  {
    title: 'Bán đảo Sơn Trà & Vịnh Đà Nẵng',
    subtitle: 'Cung đường biển Sơn Trà – Mỹ Khê – Non Nước',
    url: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=1800&q=85',
    tag: 'Đà Nẵng'
  },
  {
    title: 'Phố Cổ Hội An Đèn Lồng',
    subtitle: 'Di sản Văn hóa Thế giới UNESCO bên sông Hoài',
    url: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=1800&q=85',
    tag: 'Hội An'
  },
  {
    title: 'Đại Nội Cung Đình Huế',
    subtitle: 'Ngọ Môn & Hoàng thành Huế cổ kính vàng son',
    url: 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?auto=format&fit=crop&w=1800&q=85',
    tag: 'Cố đô Huế'
  },
  {
    title: 'Non Nước Tràng An — Ninh Bình',
    subtitle: 'Di sản Văn hóa & Thiên nhiên Thế giới cố đô Hoa Lư',
    url: 'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=1800&q=85',
    tag: 'Miền Bắc'
  },
  {
    title: 'Thủ đô Hà Nội Ngàn Năm Văn Hiến',
    subtitle: 'Văn Miếu - Quốc Tử Giám & Hồ Gươm lịch sử',
    url: 'https://images.unsplash.com/photo-1599707367072-cd6ada2bc375?auto=format&fit=crop&w=1800&q=85',
    tag: 'Hà Nội'
  },
  {
    title: 'Vịnh Hạ Long Kỳ Quan Thiên Nhiên',
    subtitle: 'Hàng nghìn đảo đá vôi kỳ vĩ trên mặt biển ngọc bích',
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/79/Ha_Long_Bay_in_2019.jpg/1280px-Ha_Long_Bay_in_2019.jpg',
    tag: 'Quảng Ninh'
  },
  {
    title: 'Thánh Địa Mỹ Sơn Chăm Pa',
    subtitle: 'Quần thể đền tháp Chăm Pa cổ đại giữa thung lũng thiêng',
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/94/A_far_view_of_the_ruins_at_My_Son_%2830992152933%29.jpg/1280px-A_far_view_of_the_ruins_at_My_Son_%2830992152933%29.jpg',
    tag: 'Quảng Nam'
  },
  {
    title: 'Ruộng Bậc Thang & Mây Ngàn Tây Bắc',
    subtitle: 'Vẻ đẹp hùng vĩ nơi địa đầu Tổ quốc',
    url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1800&q=85',
    tag: 'Tây Bắc'
  },
  {
    title: 'Sông Nước Miền Tây & Văn Hóa Biển',
    subtitle: 'Nét bình dị hiền hòa của non nước phương Nam',
    url: 'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=1800&q=85',
    tag: 'Miền Nam'
  }
];

const ORDERED_SECTION_IDS = [
  'hero',
  'feature-01-map',
  'feature-02-recognizer',
  'feature-03-storyteller',
  'feature-04-itinerary',
  'feature-05-learning',
  'feature-06-profile',
  'feature-07-community',
  'global-tab-banner'
];

/**
 * Compresses an uploaded image file via HTML5 Canvas so it saves smoothly to localStorage & Firestore
 */
async function compressImageFile(file: File, maxWidth = 1600, quality = 0.82): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      if (!dataUrl) {
        reject(new Error('Không thể đọc tệp ảnh'));
        return;
      }
      const img = new window.Image();
      img.onload = () => {
        try {
          let width = img.width;
          let height = img.height;
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(dataUrl);
            return;
          }
          ctx.drawImage(img, 0, 0, width, height);
          let out = canvas.toDataURL('image/webp', quality);
          if (!out || out.length < 64 || !out.startsWith('data:image/webp')) {
            out = canvas.toDataURL('image/jpeg', quality);
          }
          resolve(out);
        } catch {
          resolve(dataUrl);
        }
      };
      img.onerror = () => resolve(dataUrl);
      img.src = dataUrl;
    };
    reader.onerror = () => reject(new Error('Lỗi khi đọc tệp ảnh từ thiết bị'));
    reader.readAsDataURL(file);
  });
}

export const AdminBackgroundManagerModal: React.FC<AdminBackgroundManagerModalProps> = ({
  isOpen,
  onClose,
  initialSectionId = 'hero',
  onConfigUpdated,
  onLandmarkSelected
}) => {
  const [activeMode, setActiveMode] = useState<'home_sections' | 'city_landmarks'>('home_sections');
  const [config, setConfig] = useState<HomeBackgroundConfig>(() => storageService.getHomeBackgroundConfig());
  const [selectedSectionId, setSelectedSectionId] = useState<string>(initialSectionId || 'hero');

  // Form state for currently selected section
  const [editImageUrl, setEditImageUrl] = useState<string>('');
  const [editVideoUrl, setEditVideoUrl] = useState<string>('');
  const [editSubtitle, setEditSubtitle] = useState<string>('');
  const [editOpacity, setEditOpacity] = useState<number>(0.42);
  const [useCustomHero, setUseCustomHero] = useState<boolean>(false);

  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [isUploadingVideo, setIsUploadingVideo] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);
  const [isAIPickerOpen, setIsAIPickerOpen] = useState<boolean>(false);

  // City Landmarks state for Tab 2
  const [landmarks, setLandmarks] = useState<CityLandmarkBackground[]>([]);
  const [editingLandmark, setEditingLandmark] = useState<CityLandmarkBackground | null>(null);
  const [isLandmarkEditOpen, setIsLandmarkEditOpen] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      const freshConfig = storageService.getHomeBackgroundConfig();
      setConfig(freshConfig);
      const targetId = initialSectionId && freshConfig.sections[initialSectionId] ? initialSectionId : 'hero';
      setSelectedSectionId(targetId);
      const sec = freshConfig.sections[targetId] || DEFAULT_HOME_BACKGROUNDS.sections[targetId];
      if (sec) {
        setEditImageUrl(sec.imageUrl || '');
        setEditVideoUrl(sec.videoUrl || '');
        setEditSubtitle(sec.subtitle || '');
        setEditOpacity(sec.overlayOpacity ?? 0.42);
      }
      setUseCustomHero(Boolean(freshConfig.useCustomHeroBackground));
      setLandmarks(storageService.getLandmarkBackgrounds());
      setFeedbackMsg(null);
    }
  }, [isOpen, initialSectionId]);

  const handleSelectSection = (secId: string) => {
    setSelectedSectionId(secId);
    const sec = config.sections[secId] || DEFAULT_HOME_BACKGROUNDS.sections[secId];
    if (sec) {
      setEditImageUrl(sec.imageUrl || '');
      setEditVideoUrl(sec.videoUrl || '');
      setEditSubtitle(sec.subtitle || '');
      setEditOpacity(sec.overlayOpacity ?? 0.42);
    }
  };

  if (!isOpen) return null;

  const currentSectionMeta: HomeSectionBackgroundOverride =
    config.sections[selectedSectionId] ||
    DEFAULT_HOME_BACKGROUNDS.sections[selectedSectionId] || {
      sectionId: selectedSectionId,
      label: selectedSectionId,
      imageUrl: editImageUrl
    };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 15 * 1024 * 1024) {
      setFeedbackMsg('⚠️ Tệp ảnh quá lớn (tối đa 15MB). Vui lòng chọn ảnh nhẹ hơn.');
      return;
    }
    setIsUploading(true);
    try {
      const compressedDataUrl = await compressImageFile(file, 1600, 0.82);
      setEditImageUrl(compressedDataUrl);
      if (selectedSectionId === 'hero') {
        setUseCustomHero(true);
      }
      setFeedbackMsg('✨ Đã tải và tối ưu hóa ảnh từ thiết bị! Bấm "Lưu & Áp dụng ngay" để hoàn tất.');
    } catch (err: any) {
      setFeedbackMsg(err?.message || 'Không thể xử lý tệp ảnh.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleVideoFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 25 * 1024 * 1024) {
      setFeedbackMsg('⚠️ Video tải trực tiếp tối đa 25MB. Với video nặng hơn, bạn hãy dán link .mp4 hoặc link YouTube ở ô bên dưới nhé!');
      return;
    }
    setIsUploadingVideo(true);
    try {
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result || ''));
        reader.onerror = () => reject(new Error('Không thể đọc tệp video.'));
        reader.readAsDataURL(file);
      });
      setEditVideoUrl(dataUrl);
      if (selectedSectionId === 'hero') {
        setUseCustomHero(true);
      }
      setFeedbackMsg('🎬 Đã nạp tệp Video thành công! Bấm "Lưu & Áp Dụng Ngay" để phát trên trang chủ.');
    } catch (err: any) {
      setFeedbackMsg(err?.message || 'Không thể xử lý tệp video.');
    } finally {
      setIsUploadingVideo(false);
      if (videoFileInputRef.current) {
        videoFileInputRef.current.value = '';
      }
    }
  };

  const handleSaveCurrentSection = async () => {
    if (!editImageUrl.trim() && !editVideoUrl.trim()) {
      setFeedbackMsg('⚠️ Vui lòng nhập URL ảnh/video hoặc tải tệp từ máy lên.');
      return;
    }
    setIsSaving(true);
    try {
      const updatedSection: HomeSectionBackgroundOverride = {
        ...currentSectionMeta,
        sectionId: selectedSectionId,
        imageUrl: editImageUrl.trim() || currentSectionMeta.imageUrl,
        videoUrl: editVideoUrl.trim() || undefined,
        mediaType: editVideoUrl.trim() ? 'video' : 'image',
        subtitle: editSubtitle.trim(),
        overlayOpacity: editOpacity,
        updatedAt: new Date().toISOString()
      };

      const nextSections: Record<string, HomeSectionBackgroundOverride> = {
        ...config.sections,
        [selectedSectionId]: updatedSection,
        ...(editVideoUrl.trim() && config.sections['hero']
          ? {
              hero: {
                ...config.sections['hero'],
                videoUrl: editVideoUrl.trim(),
                mediaType: 'video',
                imageUrl: editImageUrl.trim() || config.sections['hero'].imageUrl,
                updatedAt: new Date().toISOString()
              }
            }
          : {})
      };

      const nextConfig: HomeBackgroundConfig = {
        ...config,
        sections: nextSections,
        useCustomHeroBackground: selectedSectionId === 'hero' || Boolean(editVideoUrl.trim()) ? true : useCustomHero,
        updatedAt: new Date().toISOString(),
        updatedBy: storageService.getCurrentUser()?.displayName || 'Admin'
      };

      if (selectedSectionId === 'hero' || editVideoUrl.trim()) {
        setUseCustomHero(true);
      }

      const saved = storageService.saveHomeBackgroundConfig(nextConfig);
      setConfig(saved);
      await saveHomeBackgroundsToFirebase(saved, storageService.getCurrentUser()?.email);

      if (onConfigUpdated) {
        onConfigUpdated(saved);
      }

      setFeedbackMsg(
        editVideoUrl.trim()
          ? `🎬 Đã gắn và phát Video nền cho "${currentSectionMeta.label}"!`
          : `✅ Đã lưu và áp dụng ảnh nền cho "${currentSectionMeta.label}"!`
      );
      setTimeout(() => setFeedbackMsg(null), 4000);
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetCurrentSection = async () => {
    const defSec = DEFAULT_HOME_BACKGROUNDS.sections[selectedSectionId];
    if (!defSec) return;
    const nextConfig = storageService.resetHomeSectionBackground(selectedSectionId);
    setConfig(nextConfig);
    setEditImageUrl(defSec.imageUrl);
    setEditVideoUrl(defSec.videoUrl || '');
    setEditSubtitle(defSec.subtitle || '');
    setEditOpacity(defSec.overlayOpacity ?? 0.36);
    if (selectedSectionId === 'hero') {
      setUseCustomHero(true);
    }
    await saveHomeBackgroundsToFirebase(nextConfig, storageService.getCurrentUser()?.email);
    if (onConfigUpdated) {
      onConfigUpdated(nextConfig);
    }
    setFeedbackMsg(`🔄 Đã khôi phục nền mặc định cho "${defSec.label}".`);
    setTimeout(() => setFeedbackMsg(null), 3500);
  };

  const handleResetAllSections = async () => {
    const resetCfg = storageService.resetHomeSectionBackground();
    setConfig(resetCfg);
    const defSec = resetCfg.sections[selectedSectionId] || DEFAULT_HOME_BACKGROUNDS.sections.hero;
    setEditImageUrl(defSec.imageUrl);
    setEditVideoUrl(defSec.videoUrl || '');
    setEditSubtitle(defSec.subtitle || '');
    setEditOpacity(defSec.overlayOpacity ?? 0.36);
    setUseCustomHero(true);
    await saveHomeBackgroundsToFirebase(resetCfg, storageService.getCurrentUser()?.email);
    if (onConfigUpdated) {
      onConfigUpdated(resetCfg);
    }
    setFeedbackMsg('🔄 Đã khôi phục toàn bộ ảnh & video nền về mặc định!');
    setTimeout(() => setFeedbackMsg(null), 3500);
  };

  return createPortal(
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-2 sm:p-4 bg-[#3B2A20]/75 backdrop-blur-md overflow-hidden animate-fadeIn">
      <div className="bg-[#FFFDF8] border-2 border-[#C8963E] rounded-3xl max-w-5xl w-full max-h-[94vh] flex flex-col shadow-[0_24px_60px_rgba(59,42,32,0.35)] overflow-hidden text-[#3B2A20]">
        {/* Top Modal Header */}
        <div className="px-5 py-4 border-b border-[#C8963E]/40 bg-[#FBF3E4] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#B3261E] text-[#FFFDF8] flex items-center justify-center shadow-md">
              <ImageIcon className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif font-bold text-[#3B2A20] text-base sm:text-lg">
                  Quản Trị Ảnh Nền Toàn Trang Web (Admin)
                </h3>
                <span className="px-2.5 py-0.5 rounded-full bg-[#B3261E]/10 text-[#B3261E] border border-[#B3261E]/30 text-[10px] font-bold uppercase tracking-wider">
                  Admin Studio
                </span>
              </div>
              <p className="text-xs text-[#7A6556]">
                Tuỳ chỉnh ảnh nền Màn hình Hero, 7 phần tính năng lướt dọc và ảnh nền 34 tỉnh thành GPS
              </p>
            </div>
          </div>

          {/* Mode Switch Tabs */}
          <div className="flex items-center gap-2">
            <div className="inline-flex rounded-xl bg-[#FFFDF8] p-1 border border-[#C8963E]/50 shadow-inner">
              <button
                type="button"
                onClick={() => setActiveMode('home_sections')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeMode === 'home_sections'
                    ? 'bg-[#B3261E] text-[#FFFDF8] shadow'
                    : 'text-[#7A6556] hover:text-[#3B2A20]'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Trang Chủ & 7 Tính Năng (9 mục)</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveMode('city_landmarks')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeMode === 'city_landmarks'
                    ? 'bg-[#2E8B8B] text-[#FFFDF8] shadow'
                    : 'text-[#7A6556] hover:text-[#3B2A20]'
                }`}
              >
                <MapPin className="w-3.5 h-3.5" />
                <span>Danh Thắng Tỉnh/Thành GPS ({landmarks.length})</span>
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-[#FFFDF8] hover:bg-[#B3261E]/10 text-[#7A6556] hover:text-[#B3261E] border border-[#C8963E]/40 transition-colors cursor-pointer"
              title="Đóng cửa sổ"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Feedback Banner */}
        {feedbackMsg && (
          <div className="px-5 py-2.5 bg-[#2E8B8B]/15 border-b border-[#2E8B8B]/30 text-[#1F6666] text-xs font-bold flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#2E8B8B] shrink-0" />
              <span>{feedbackMsg}</span>
            </div>
            <button
              type="button"
              onClick={() => setFeedbackMsg(null)}
              className="text-[11px] underline hover:text-[#3B2A20] cursor-pointer"
            >
              Ẩn
            </button>
          </div>
        )}

        {/* =========================================================
            MODE 1: HOME HERO + 7 FULLSCREEN SECTIONS + GLOBAL TAB
           ========================================================= */}
        {activeMode === 'home_sections' && (
          <div className="flex-1 overflow-y-auto grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-[#C8963E]/30">
            {/* Left Sidebar: 9 Background Slots */}
            <div className="lg:col-span-4 bg-[#FBF3E4]/60 p-4 space-y-2.5 overflow-y-auto max-h-[34vh] lg:max-h-[76vh]">
              <div className="flex items-center justify-between pb-1.5 border-b border-[#C8963E]/30">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#7A6556]">
                  Chọn vị trí ảnh nền cần sửa:
                </span>
                <button
                  type="button"
                  onClick={handleResetAllSections}
                  className="text-[11px] text-[#B3261E] hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                  title="Khôi phục toàn bộ 9 vị trí về mặc định"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Mặc định hết</span>
                </button>
              </div>

              <div className="space-y-2">
                {ORDERED_SECTION_IDS.map((secId) => {
                  const item = config.sections[secId] || DEFAULT_HOME_BACKGROUNDS.sections[secId];
                  if (!item) return null;
                  const isSelected = selectedSectionId === secId;
                  const defItem = DEFAULT_HOME_BACKGROUNDS.sections[secId];
                  const isCustomized =
                    defItem &&
                    (item.imageUrl !== defItem.imageUrl ||
                      (secId === 'hero' && config.useCustomHeroBackground));

                  return (
                    <button
                      key={secId}
                      type="button"
                      onClick={() => handleSelectSection(secId)}
                      className={`w-full text-left p-2.5 rounded-2xl border transition-all flex items-center gap-3 cursor-pointer ${
                        isSelected
                          ? 'bg-[#FFFDF8] border-[#B3261E] ring-2 ring-[#B3261E]/20 shadow-md'
                          : 'bg-[#FFFDF8]/70 border-[#C8963E]/35 hover:border-[#C8963E] hover:bg-[#FFFDF8]'
                      }`}
                    >
                      <div className="w-14 h-11 rounded-xl overflow-hidden border border-[#C8963E]/40 shrink-0 bg-[#E6D5B8] relative">
                        <img
                          src={item.imageUrl}
                          alt={item.label}
                          referrerPolicy="no-referrer"
                          onError={(e) => handleImageError(e)}
                          className="w-full h-full object-cover"
                        />
                        {isCustomized && (
                          <span className="absolute top-0.5 right-0.5 w-2.5 h-2.5 rounded-full bg-[#2E8B8B] ring-2 ring-white" title="Đã tuỳ chỉnh bởi Admin" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1">
                          <p className={`text-xs font-bold truncate ${isSelected ? 'text-[#B3261E]' : 'text-[#3B2A20]'}`}>
                            {item.label}
                          </p>
                        </div>
                        <p className="text-[10px] text-[#7A6556] truncate mt-0.5">
                          {item.subtitle || 'Ảnh nền toàn màn hình'}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Right Panel: Editor & Live Preview for Selected Slot */}
            <div className="lg:col-span-8 p-4 sm:p-6 space-y-5 overflow-y-auto max-h-[60vh] lg:max-h-[76vh] bg-[#FFFDF8]">
              {/* Live Visual Preview */}
              <div className="space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4 text-[#B3261E]" />
                    <h4 className="font-serif font-bold text-sm sm:text-base text-[#3B2A20]">
                      Xem trước: {currentSectionMeta.label}
                    </h4>
                  </div>
                  <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-[#FBF3E4] border border-[#C8963E]/50 text-[#7A6556] font-semibold">
                    Độ phủ nền: {Math.round(editOpacity * 100)}%
                  </span>
                </div>

                <div className="relative h-48 sm:h-56 rounded-2xl overflow-hidden border-2 border-[#C8963E]/60 shadow-inner bg-[#E6D5B8]">
                  {editVideoUrl.trim() ? (
                    extractYouTubeId(editVideoUrl) ? (
                      <iframe
                        title="YouTube Preview"
                        src={`https://www.youtube.com/embed/${extractYouTubeId(editVideoUrl)}?autoplay=1&mute=1&loop=1&playlist=${extractYouTubeId(editVideoUrl)}&controls=0&playsinline=1`}
                        allow="autoplay; encrypted-media"
                        className="w-full h-full object-cover pointer-events-none"
                      />
                    ) : (
                      <video
                        key={editVideoUrl}
                        src={editVideoUrl}
                        poster={editImageUrl || currentSectionMeta.imageUrl}
                        autoPlay
                        loop
                        muted
                        playsInline
                        className="w-full h-full object-cover"
                      />
                    )
                  ) : (
                    <img
                      src={editImageUrl || currentSectionMeta.imageUrl}
                      alt={currentSectionMeta.label}
                      referrerPolicy="no-referrer"
                      onError={(e) => handleImageError(e)}
                      className="w-full h-full object-cover transition-all duration-500"
                    />
                  )}
                  {/* Warm Heritage Overlay matching HomeFeedView */}
                  <div
                    className="absolute inset-0 transition-opacity duration-300"
                    style={{
                      background: `linear-gradient(to bottom, rgba(251,243,228,${Math.max(0.1, editOpacity - 0.12)}), rgba(59,42,32,${editOpacity}), rgba(251,243,228,${Math.min(0.95, editOpacity + 0.35)}))`
                    }}
                  />

                  {/* Simulated Card Preview Inside */}
                  <div className="absolute inset-0 p-4 flex flex-col items-center justify-center text-center">
                    <div className="bg-[#FFFDF8]/92 backdrop-blur-md border border-[#C8963E] rounded-2xl px-5 py-3.5 max-w-md shadow-lg">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-[#B3261E] block">
                        {editVideoUrl.trim() ? '🎬 ĐANG PHÁT VIDEO NỀN' : 'HỒN ĐẤT VIỆT · XEM TRƯỚC NỀN'}
                      </span>
                      <p className="font-serif font-bold text-sm sm:text-base text-[#3B2A20] mt-0.5">
                        {currentSectionMeta.label}
                      </p>
                      {editSubtitle && (
                        <p className="text-[11px] text-[#2E8B8B] font-medium mt-1 truncate">
                          📍 {editSubtitle}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Hero Mode Toggle (only when editing 'hero') */}
              {selectedSectionId === 'hero' && (
                <div className="p-3.5 rounded-2xl bg-[#FBF3E4] border border-[#C8963E]/50 flex flex-wrap items-center justify-between gap-3">
                  <div className="space-y-0.5">
                    <p className="text-xs font-bold text-[#3B2A20]">
                      Chế độ hiển thị ảnh nền Màn hình Mở đầu (Hero):
                    </p>
                    <p className="text-[11px] text-[#7A6556]">
                      {useCustomHero
                        ? 'Đang khoá cố định bằng ảnh nền Hero do Admin chọn bên dưới.'
                        : 'Đang tự động đổi theo Tỉnh/Thành định vị GPS (khi lưu ảnh mới bên dưới sẽ tự bật ảnh cố định của Admin).'}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const nextVal = !useCustomHero;
                      setUseCustomHero(nextVal);
                      const nextCfg = storageService.saveHomeBackgroundConfig({
                        ...config,
                        useCustomHeroBackground: nextVal
                      });
                      setConfig(nextCfg);
                      if (onConfigUpdated) onConfigUpdated(nextCfg);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      useCustomHero
                        ? 'bg-[#B3261E] text-[#FFFDF8] border-[#B3261E]'
                        : 'bg-[#FFFDF8] text-[#3B2A20] border-[#C8963E]'
                    }`}
                  >
                    {useCustomHero ? '✓ Đang dùng Ảnh Admin cố định' : 'Đang dùng theo Tỉnh/Thành GPS'}
                  </button>
                </div>
              )}

              {/* Upload & URL Controls */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Method 1: Upload from Computer / Phone */}
                <div className="p-3.5 rounded-2xl bg-[#FBF3E4]/70 border border-[#C8963E]/50 flex flex-col justify-between gap-2.5">
                  <div>
                    <span className="text-xs font-bold text-[#B3261E] flex items-center gap-1.5">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Cách 1: Tải ảnh từ Máy tính / Điện thoại</span>
                    </span>
                    <p className="text-[11px] text-[#7A6556] mt-0.5">
                      Tự động nén chuẩn WebP độ nét cao để tải mượt trên mọi thiết bị.
                    </p>
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />

                  <button
                    type="button"
                    disabled={isUploading}
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full py-2.5 px-3 rounded-xl bg-[#B3261E] hover:bg-[#8F1C16] text-[#FFFDF8] font-bold text-xs flex items-center justify-center gap-2 shadow transition-all cursor-pointer disabled:opacity-50"
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Đang xử lý ảnh...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4" />
                        <span>Chọn Tệp Ảnh Từ Thiết Bị</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Method 2: AI & Heritage Gallery Picker */}
                <div className="p-3.5 rounded-2xl bg-[#FBF3E4]/70 border border-[#C8963E]/50 flex flex-col justify-between gap-2.5">
                  <div>
                    <span className="text-xs font-bold text-[#2E8B8B] flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Cách 2: Kho Ảnh Di Sản & AI Tìm Ảnh</span>
                    </span>
                    <p className="text-[11px] text-[#7A6556] mt-0.5">
                      Duyệt kho ảnh danh thắng 3 miền hoặc tìm ảnh tự động.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsAIPickerOpen(true)}
                    className="w-full py-2.5 px-3 rounded-xl bg-[#2E8B8B] hover:bg-[#236B6B] text-[#FFFDF8] font-bold text-xs flex items-center justify-center gap-2 shadow transition-all cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Mở Kho Ảnh Di Sản Việt Nam</span>
                  </button>
                </div>
              </div>

              {/* VIDEO BACKGROUND UPLOAD & URL SECTION */}
              <div className="p-4 rounded-2xl bg-[#2E8B8B]/10 border-2 border-[#2E8B8B]/45 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <span className="text-xs font-extrabold text-[#1D5E5E] flex items-center gap-1.5">
                      <Video className="w-4 h-4 text-[#2E8B8B]" />
                      <span>Gắn Video Làm Nền Toàn Màn Hình (.MP4 / .WebM / YouTube)</span>
                    </span>
                    <p className="text-[11px] text-[#7A6556] mt-0.5">
                      Bạn có thể tải file video từ máy lên hoặc dán link video (.mp4, YouTube, Cloudinary, Pexels...).
                    </p>
                  </div>

                  <input
                    ref={videoFileInputRef}
                    type="file"
                    accept="video/mp4,video/webm,video/quicktime"
                    onChange={handleVideoFileUpload}
                    className="hidden"
                  />

                  <button
                    type="button"
                    disabled={isUploadingVideo}
                    onClick={() => videoFileInputRef.current?.click()}
                    className="px-3.5 py-2 rounded-xl bg-[#2E8B8B] hover:bg-[#236B6B] text-[#FFFDF8] font-bold text-xs inline-flex items-center gap-1.5 shadow transition-all cursor-pointer disabled:opacity-50"
                  >
                    {isUploadingVideo ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Đang nạp video...</span>
                      </>
                    ) : (
                      <>
                        <Film className="w-3.5 h-3.5" />
                        <span>Tải File Video (.MP4) Lên</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={editVideoUrl}
                    onChange={(e) => setEditVideoUrl(e.target.value)}
                    placeholder="Dán link video .mp4, .webm hoặc link YouTube (https://www.youtube.com/watch?v=...)"
                    className="flex-1 px-3.5 py-2 rounded-xl bg-[#FFFDF8] border border-[#2E8B8B]/50 text-[#3B2A20] text-xs font-mono focus:outline-none focus:border-[#2E8B8B]"
                  />
                  {editVideoUrl && (
                    <button
                      type="button"
                      onClick={() => setEditVideoUrl('')}
                      className="px-3 py-2 rounded-xl bg-[#FFFDF8] hover:bg-[#B3261E]/10 text-[#B3261E] border border-[#B3261E]/35 text-xs font-bold cursor-pointer"
                      title="Gỡ video để dùng ảnh tĩnh"
                    >
                      Gỡ Video
                    </button>
                  )}
                </div>

                {/* Nút chọn nhanh Video Đại Nội Huế HD đã xóa logo TikTok & nâng cấp độ nét */}
                <div className="pt-1 flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setEditVideoUrl('/assets/aistudio/hue_imperial_hd_clean.mp4');
                      setEditImageUrl('/assets/aistudio/hue_imperial_poster_hd.jpg');
                      setEditSubtitle('Toàn cảnh Đại Nội Cung Đình Huế · Ngọ Môn · Di sản Văn hóa Thế giới UNESCO');
                      setEditOpacity(0.34);
                      setFeedbackMsg('🎬 Đã chọn Video Đại Nội Huế HD (Đã xóa sạch chữ TikTok & nâng cấp độ nét)! Bấm "Lưu & Áp Dụng Ngay" để áp dụng.');
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 border transition-all cursor-pointer ${
                      editVideoUrl === '/assets/aistudio/hue_imperial_hd_clean.mp4'
                        ? 'bg-[#B3261E] text-[#FFFDF8] border-[#C8963E] shadow-sm'
                        : 'bg-[#FFFDF8] hover:bg-[#FBF3E4] text-[#3B2A20] border-[#2E8B8B]/50'
                    }`}
                  >
                    <Film className="w-3.5 h-3.5 shrink-0" />
                    <span>🎬 Dùng Video Đại Nội Huế HD (Đã xóa chữ TikTok · Sắc nét 1440p)</span>
                  </button>
                </div>
              </div>

              {/* Method 3: Direct Image URL Input + Subtitle + Opacity */}
              <div className="p-4 rounded-2xl bg-[#FBF3E4]/50 border border-[#C8963E]/40 space-y-3">
                <div>
                  <label className="block text-xs font-bold text-[#3B2A20] mb-1 flex items-center gap-1.5">
                    <ExternalLink className="w-3.5 h-3.5 text-[#B3261E]" />
                    <span>Cách 3: Dán đường dẫn URL hình ảnh trực tiếp (hoặc ảnh Poster cho Video)</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={editImageUrl}
                      onChange={(e) => setEditImageUrl(e.target.value)}
                      placeholder="https://images.unsplash.com/... hoặc data:image/..."
                      className="flex-1 px-3.5 py-2 rounded-xl bg-[#FFFDF8] border border-[#C8963E]/60 text-[#3B2A20] text-xs font-mono focus:outline-none focus:border-[#B3261E]"
                    />
                    {editImageUrl && (
                      <button
                        type="button"
                        onClick={() => setEditImageUrl('')}
                        className="px-2.5 py-2 rounded-xl bg-[#FFFDF8] hover:bg-[#B3261E]/10 text-[#7A6556] hover:text-[#B3261E] border border-[#C8963E]/40 text-xs cursor-pointer"
                        title="Xoá đường dẫn"
                      >
                        Xoá
                      </button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-xs font-bold text-[#3B2A20] mb-1">
                      Chú thích địa danh hiển thị góc dưới:
                    </label>
                    <input
                      type="text"
                      value={editSubtitle}
                      onChange={(e) => setEditSubtitle(e.target.value)}
                      placeholder="VD: Danh thắng Ngũ Hành Sơn · Đà Nẵng"
                      className="w-full px-3.5 py-2 rounded-xl bg-[#FFFDF8] border border-[#C8963E]/60 text-[#3B2A20] text-xs focus:outline-none focus:border-[#B3261E]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#3B2A20] mb-1 flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <Sliders className="w-3.5 h-3.5 text-[#C8963E]" />
                        <span>Độ đậm lớp phủ nền:</span>
                      </span>
                      <span className="text-[#B3261E] font-mono">{Math.round(editOpacity * 100)}%</span>
                    </label>
                    <input
                      type="range"
                      min={0.15}
                      max={0.75}
                      step={0.03}
                      value={editOpacity}
                      onChange={(e) => setEditOpacity(parseFloat(e.target.value))}
                      className="w-full accent-[#B3261E] cursor-pointer mt-1.5"
                    />
                  </div>
                </div>
              </div>

              {/* Curated Preset Gallery Grid */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-[#3B2A20] block">
                  Hoặc chạm chọn nhanh từ Bộ ảnh mẫu Đà Nẵng & Di sản Việt Nam:
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {CURATED_BACKGROUND_PRESETS.map((preset, idx) => {
                    const isPicked = editImageUrl === preset.url;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setEditImageUrl(preset.url);
                          setEditSubtitle(preset.subtitle);
                        }}
                        className={`group text-left rounded-xl overflow-hidden border transition-all cursor-pointer ${
                          isPicked
                            ? 'border-[#B3261E] ring-2 ring-[#B3261E]/30 shadow-md'
                            : 'border-[#C8963E]/40 hover:border-[#B3261E]'
                        }`}
                      >
                        <div className="aspect-video relative bg-[#E6D5B8] overflow-hidden">
                          <img
                            src={preset.url}
                            alt={preset.title}
                            referrerPolicy="no-referrer"
                            onError={(e) => handleImageError(e)}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded bg-[#FFFDF8]/90 text-[#3B2A20] font-bold text-[9px] border border-[#C8963E]/40">
                            {preset.tag}
                          </span>
                          {isPicked && (
                            <span className="absolute top-1 right-1 w-5 h-5 rounded-full bg-[#B3261E] text-[#FFFDF8] flex items-center justify-center shadow">
                              <Check className="w-3 h-3 stroke-[3]" />
                            </span>
                          )}
                        </div>
                        <div className="p-2 bg-[#FFFDF8]">
                          <p className="text-[11px] font-bold text-[#3B2A20] truncate">
                            {preset.title}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Bottom Save & Reset Bar */}
              <div className="pt-3 border-t border-[#C8963E]/40 flex flex-wrap items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={handleResetCurrentSection}
                  className="px-4 py-2.5 rounded-xl bg-[#FBF3E4] hover:bg-[#E6D5B8]/60 text-[#3B2A20] border border-[#C8963E]/50 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-[#B3261E]" />
                  <span>Khôi phục mục này về mặc định</span>
                </button>

                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2.5 rounded-xl bg-[#FBF3E4] hover:bg-[#E6D5B8]/50 text-[#7A6556] text-xs font-bold transition-colors cursor-pointer"
                  >
                    Đóng
                  </button>
                  <button
                    type="button"
                    disabled={isSaving}
                    onClick={handleSaveCurrentSection}
                    className="px-6 py-2.5 rounded-xl bg-[#B3261E] hover:bg-[#8F1C16] text-[#FFFDF8] font-bold text-xs shadow-lg transition-all flex items-center gap-2 cursor-pointer active:scale-95 disabled:opacity-50"
                  >
                    <Check className="w-4 h-4 stroke-[3]" />
                    <span>{isSaving ? 'Đang lưu...' : 'Lưu & Áp Dụng Ngay'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================
            MODE 2: CITY LANDMARK BACKGROUNDS (34 TỈNH/THÀNH GPS)
           ========================================================= */}
        {activeMode === 'city_landmarks' && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-[#FFFDF8]">
            <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-[#FBF3E4] border border-[#C8963E]/50">
              <div>
                <h4 className="font-serif font-bold text-[#3B2A20] text-sm sm:text-base">
                  Danh Sách Ảnh Nền Theo Tỉnh / Thành Phố (Định Vị GPS)
                </h4>
                <p className="text-xs text-[#7A6556]">
                  Bấm "Sửa ảnh" ở bất kỳ tỉnh thành nào để đổi ảnh nền hoặc bấm "Áp dụng ngay" để đặt làm nền hiện tại.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const reset = storageService.resetLandmarkBackgrounds();
                    setLandmarks(reset);
                    setFeedbackMsg('🔄 Đã khôi phục danh sách ảnh nền tỉnh thành về mặc định.');
                  }}
                  className="px-3 py-2 rounded-xl bg-[#FFFDF8] hover:bg-[#E6D5B8]/40 text-[#3B2A20] border border-[#C8963E]/50 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-[#B3261E]" />
                  <span>Mặc định</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditingLandmark(null);
                    setIsLandmarkEditOpen(true);
                  }}
                  className="px-4 py-2 rounded-xl bg-[#B3261E] hover:bg-[#8F1C16] text-[#FFFDF8] font-bold text-xs flex items-center gap-1.5 shadow cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Thêm Tỉnh/Danh Thắng Mới</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {landmarks.map((lm) => (
                <div
                  key={lm.id}
                  className="rounded-2xl border border-[#C8963E]/50 bg-[#FFFDF8] overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col"
                >
                  <div className="h-36 relative bg-[#E6D5B8] overflow-hidden">
                    <img
                      src={lm.imageUrl}
                      alt={lm.landmarkName}
                      referrerPolicy="no-referrer"
                      onError={(e) => handleImageError(e)}
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute top-2 left-2 px-2.5 py-0.5 rounded-full bg-[#FFFDF8]/90 text-[#B3261E] border border-[#C8963E]/50 text-[10px] font-bold uppercase">
                      {lm.cityName}
                    </span>
                  </div>
                  <div className="p-3.5 flex-1 flex flex-col justify-between gap-3">
                    <div>
                      <h5 className="font-serif font-bold text-sm text-[#3B2A20] line-clamp-1">
                        {lm.landmarkName}
                      </h5>
                      <p className="text-[11px] text-[#7A6556] line-clamp-2 mt-0.5">
                        {lm.tagline}
                      </p>
                    </div>
                    <div className="flex items-center justify-between gap-2 pt-2 border-t border-[#C8963E]/30">
                      <button
                        type="button"
                        onClick={() => {
                          if (onLandmarkSelected) {
                            onLandmarkSelected(lm);
                          }
                          setFeedbackMsg(`✅ Đã chọn ảnh nền danh thắng "${lm.cityName} — ${lm.landmarkName}"!`);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-[#2E8B8B]/15 hover:bg-[#2E8B8B] text-[#1F6666] hover:text-[#FFFDF8] text-xs font-bold transition-colors cursor-pointer"
                      >
                        Dùng làm nền
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingLandmark(lm);
                          setIsLandmarkEditOpen(true);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-[#B3261E] hover:bg-[#8F1C16] text-[#FFFDF8] text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Sửa ảnh</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* AI & Heritage Gallery Picker Modal */}
      <AILandmarkImagePickerModal
        isOpen={isAIPickerOpen}
        onClose={() => setIsAIPickerOpen(false)}
        initialQuery=""
        onSelectPhoto={(photo) => {
          setEditImageUrl(photo.imageUrl);
          if (photo.landmarkName) {
            setEditSubtitle(`${photo.landmarkName} · ${photo.cityName}`);
          }
          setIsAIPickerOpen(false);
          setFeedbackMsg(`✨ Đã chọn ảnh "${photo.title}" từ Kho Di Sản! Bấm "Lưu & Áp Dụng Ngay" để lưu.`);
        }}
      />

      {/* City Landmark Edit Modal */}
      <LandmarkEditModal
        isOpen={isLandmarkEditOpen}
        onClose={() => {
          setIsLandmarkEditOpen(false);
          setEditingLandmark(null);
        }}
        landmark={editingLandmark}
        onSave={(savedItem) => {
          setLandmarks(storageService.getLandmarkBackgrounds());
          if (onLandmarkSelected) {
            onLandmarkSelected(savedItem);
          }
          setFeedbackMsg(`✅ Đã cập nhật ảnh nền tỉnh "${savedItem.cityName}"!`);
        }}
        onDelete={() => {
          setLandmarks(storageService.getLandmarkBackgrounds());
        }}
      />
    </div>,
    document.body
  );
};
