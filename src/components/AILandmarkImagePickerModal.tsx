import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Search,
  MapPin,
  Check,
  X,
  Image as ImageIcon,
  Wand2,
  Loader2,
  Eye,
  Compass,
  Camera,
  Globe,
  ExternalLink,
  Edit3,
  Plus,
  Trash2,
  Upload,
  RotateCcw,
  Save
} from 'lucide-react';
import {
  LandmarkPhotoItem,
  DEFAULT_VIETNAM_LANDMARK_FALLBACK,
  getLandmarkPhotoGallery,
  findMatchingLandmarkPhotos,
  saveLandmarkPhotoItem,
  deleteLandmarkPhotoItem,
  resetLandmarkPhotoGallery
} from '../data/landmarkImagesDatabase';
import { aiService } from '../services/aiService';
import { storageService } from '../services/storageService';

interface AILandmarkImagePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialQuery?: string;
  initialCityName?: string;
  initialLandmarkName?: string;
  onSelectPhoto: (photo: LandmarkPhotoItem, applyMetadata: boolean) => void;
}

const POPULAR_REGIONS = [
  { label: '🌟 Tất cả nổi bật', query: '' },
  { label: '🏛️ Hà Nội', query: 'Hà Nội' },
  { label: '🏮 Hội An & Đà Nẵng', query: 'Đà Nẵng Hội An' },
  { label: '👑 Cung Đình Huế', query: 'Huế' },
  { label: '🏙️ TP. Hồ Chí Minh', query: 'Hồ Chí Minh' },
  { label: '🌊 Vịnh Hạ Long', query: 'Hạ Long' },
  { label: '⛰️ Ninh Bình Tràng An', query: 'Ninh Bình' },
  { label: '🌾 Tây Bắc (Sa Pa, Hà Giang)', query: 'Sa Pa Hà Giang Cao Bằng' },
  { label: '🏝️ Biển Đảo (Phú Quốc, Nha Trang)', query: 'Phú Quốc Nha Trang Quy Nhơn' },
  { label: '🚣 Miền Tây (Cần Thơ, Cà Mau)', query: 'Cần Thơ Cà Mau' }
];

async function compressGalleryImageFile(file: File, maxWidth = 1600, quality = 0.82): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = e => {
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
      img.onerror = () => reject(new Error('Tệp hình ảnh không hợp lệ'));
      img.src = dataUrl;
    };
    reader.onerror = () => reject(new Error('Lỗi đọc tệp từ thiết bị'));
    reader.readAsDataURL(file);
  });
}

export const AILandmarkImagePickerModal: React.FC<AILandmarkImagePickerModalProps> = ({
  isOpen,
  onClose,
  initialQuery = '',
  onSelectPhoto
}) => {
  const isAdmin = storageService.getCurrentUser()?.role === 'admin';

  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [photos, setPhotos] = useState<LandmarkPhotoItem[]>(() => getLandmarkPhotoGallery());
  const [aiSuggestions, setAiSuggestions] = useState<
    {
      landmarkName: string;
      cityName: string;
      province?: string;
      tagline: string;
      photoPerspective?: string;
      searchKeywords: string;
    }[]
  >([]);
  const [isSearchingAI, setIsSearchingAI] = useState(false);
  const [isGoogleSearching, setIsGoogleSearching] = useState(false);
  const [googleResult, setGoogleResult] = useState<{
    bestImageUrl: string;
    landmarkName: string;
    cityName: string;
    province: string;
    tagline: string;
    lat: number;
    lng: number;
    searchSummary: string;
    candidateImages: {
      url: string;
      title: string;
      source: string;
      photographer?: string;
    }[];
  } | null>(null);
  const [applyMetadata, setApplyMetadata] = useState(true);
  const [previewPhoto, setPreviewPhoto] = useState<LandmarkPhotoItem | null>(null);
  const [activeTab, setActiveTab] = useState<string>('');

  // Admin Photo Editor state inside the modal
  const [editingItem, setEditingItem] = useState<LandmarkPhotoItem | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editLandmarkName, setEditLandmarkName] = useState('');
  const [editCityName, setEditCityName] = useState('');
  const [editProvince, setEditProvince] = useState('');
  const [editTagline, setEditTagline] = useState('');
  const [editImageUrl, setEditImageUrl] = useState('');
  const [editTagsText, setEditTagsText] = useState('');
  const [editPhotographer, setEditPhotographer] = useState('');
  const [isUploadingFile, setIsUploadingFile] = useState(false);
  const [adminToast, setAdminToast] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      const q = initialQuery || '';
      setSearchQuery(q);
      setActiveTab(q);
      setPhotos(q.trim() ? findMatchingLandmarkPhotos(q) : getLandmarkPhotoGallery());
      if (q.trim()) {
        handleSearch(q);
      }
    }
  }, [isOpen, initialQuery]);

  useEffect(() => {
    const syncGallery = () => {
      setPhotos(
        searchQuery.trim() ? findMatchingLandmarkPhotos(searchQuery) : getLandmarkPhotoGallery()
      );
    };
    window.addEventListener('landmark-gallery-updated', syncGallery);
    return () => window.removeEventListener('landmark-gallery-updated', syncGallery);
  }, [searchQuery]);

  if (!isOpen) return null;

  const showToast = (msg: string) => {
    setAdminToast(msg);
    window.setTimeout(() => setAdminToast(null), 3500);
  };

  const handleSearch = async (queryText: string) => {
    const q = queryText.trim();
    if (!q) {
      setPhotos(getLandmarkPhotoGallery());
      setAiSuggestions([]);
      setGoogleResult(null);
      return;
    }

    const localMatched = findMatchingLandmarkPhotos(q);
    setPhotos(localMatched);

    setIsSearchingAI(true);
    try {
      const res = await aiService.searchLandmarkImages({ query: q });
      setPhotos(findMatchingLandmarkPhotos(q));
      if (res.aiSuggestions && res.aiSuggestions.length > 0) {
        setAiSuggestions(res.aiSuggestions);
      } else {
        setAiSuggestions([]);
      }
    } catch {
      setAiSuggestions([]);
    } finally {
      setIsSearchingAI(false);
    }
  };

  const handleGoogleGeminiSearch = async (overrideQuery?: string) => {
    const q = (overrideQuery ?? searchQuery).trim();
    if (!q) return;

    setIsGoogleSearching(true);
    setGoogleResult(null);
    try {
      const result = await aiService.findLandmarkImageWithGoogle({
        landmarkName: q,
        cityName: q
      });
      setGoogleResult(result);
    } catch (err) {
      console.error('Google Gemini Landmark Search error:', err);
    } finally {
      setIsGoogleSearching(false);
    }
  };

  const handleOpenAdminEditor = (photo?: LandmarkPhotoItem) => {
    if (photo) {
      setIsCreatingNew(false);
      setEditingItem(photo);
      setEditTitle(photo.title);
      setEditLandmarkName(photo.landmarkName);
      setEditCityName(photo.cityName);
      setEditProvince(photo.province || photo.cityName);
      setEditTagline(photo.tagline);
      setEditImageUrl(photo.imageUrl);
      setEditTagsText((photo.tags || []).join(', '));
      setEditPhotographer(photo.photographer || 'Kho Di Sản Quốc Gia');
    } else {
      const newItem: LandmarkPhotoItem = {
        id: `custom-landmark-${Date.now()}`,
        cityName: 'Đà Nẵng',
        province: 'Đà Nẵng',
        landmarkName: 'Danh thắng Di sản Việt Nam',
        title: 'Ảnh Danh Thắng Mới',
        tagline: 'Vẻ đẹp di sản văn hóa và thiên nhiên Việt Nam',
        imageUrl: DEFAULT_VIETNAM_LANDMARK_FALLBACK,
        thumbUrl: DEFAULT_VIETNAM_LANDMARK_FALLBACK,
        lat: 16.0544,
        lng: 108.2022,
        tags: ['Đà Nẵng', 'Di sản Việt Nam'],
        photographer: 'Admin Hồn Đất Việt',
        source: 'Kho Di Sản Quốc Gia'
      };
      setIsCreatingNew(true);
      setEditingItem(newItem);
      setEditTitle(newItem.title);
      setEditLandmarkName(newItem.landmarkName);
      setEditCityName(newItem.cityName);
      setEditProvince(newItem.province);
      setEditTagline(newItem.tagline);
      setEditImageUrl('');
      setEditTagsText('Đà Nẵng, Di sản Việt Nam');
      setEditPhotographer('Admin Hồn Đất Việt');
    }
  };

  const handleAdminFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingFile(true);
    try {
      const compressed = await compressGalleryImageFile(file, 1600, 0.84);
      setEditImageUrl(compressed);
      showToast('Đã tải và tối ưu ảnh từ thiết bị! Bấm "Lưu vào Kho Ảnh" để hoàn tất.');
    } catch (err: any) {
      showToast(err?.message || 'Không thể tải tệp ảnh');
    } finally {
      setIsUploadingFile(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSaveAdminPhoto = (andSelectImmediately = false) => {
    if (!editingItem) return;
    const finalUrl = editImageUrl.trim() || editingItem.imageUrl || DEFAULT_VIETNAM_LANDMARK_FALLBACK;
    const parsedTags = editTagsText
      .split(',')
      .map(t => t.trim())
      .filter(Boolean);

    const updated: LandmarkPhotoItem = {
      ...editingItem,
      title: editTitle.trim() || 'Danh thắng Việt Nam',
      landmarkName: editLandmarkName.trim() || editTitle.trim() || 'Danh thắng Việt Nam',
      cityName: editCityName.trim() || 'Việt Nam',
      province: editProvince.trim() || editCityName.trim() || 'Việt Nam',
      tagline: editTagline.trim() || 'Khám phá di sản văn hóa Việt Nam',
      imageUrl: finalUrl,
      thumbUrl: finalUrl,
      tags: parsedTags.length > 0 ? parsedTags : [editCityName.trim() || 'Việt Nam'],
      photographer: editPhotographer.trim() || 'Admin Hồn Đất Việt'
    };

    saveLandmarkPhotoItem(updated);
    setPhotos(searchQuery.trim() ? findMatchingLandmarkPhotos(searchQuery) : getLandmarkPhotoGallery());
    setEditingItem(null);
    showToast(`Đã lưu ảnh "${updated.title}" vào Kho ảnh HD Việt Nam!`);

    if (andSelectImmediately) {
      onSelectPhoto(updated, applyMetadata);
      onClose();
    }
  };

  const handleDeleteAdminPhoto = (photo: LandmarkPhotoItem, e: React.MouseEvent) => {
    e.stopPropagation();
    deleteLandmarkPhotoItem(photo.id);
    setPhotos(searchQuery.trim() ? findMatchingLandmarkPhotos(searchQuery) : getLandmarkPhotoGallery());
    showToast(`Đã xóa ảnh "${photo.title}" khỏi kho ảnh.`);
  };

  const handleResetGallery = () => {
    const fresh = resetLandmarkPhotoGallery();
    setPhotos(fresh);
    setSearchQuery('');
    setActiveTab('');
    showToast('Đã khôi phục toàn bộ Kho ảnh HD Việt Nam về mặc định!');
  };

  return (
    <div className="fixed inset-0 z-[10002] flex items-center justify-center p-2 sm:p-4 bg-[#3B2A20]/70 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-5xl bg-[#FFFDF8] border-2 border-[#C8963E]/60 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 border-b border-[#C8963E]/30 bg-[#FBF3E4]">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#B3261E] border border-[#C8963E] flex items-center justify-center text-[#FFFDF8] shadow-md shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-lg sm:text-xl font-serif font-bold text-[#3B2A20]">
                  AI Tìm Ảnh Danh Thắng Nổi Tiếng
                </h3>
                <span className="px-2.5 py-0.5 text-[11px] font-bold bg-[#B3261E]/10 text-[#B3261E] rounded-full border border-[#B3261E]/30">
                  Kho ảnh HD Việt Nam
                </span>
                {isAdmin && (
                  <span className="px-2.5 py-0.5 text-[11px] font-bold bg-[#C8963E]/25 text-[#3B2A20] rounded-full border border-[#C8963E]">
                    Quyền Admin: Có thể sửa & tải ảnh lên
                  </span>
                )}
              </div>
              <p className="text-xs text-[#7A6556] mt-0.5">
                Tìm kiếm hình ảnh danh lam thắng cảnh 34 tỉnh/thành để gắn vào ảnh nền
                {isAdmin ? ' · Bấm nút "Sửa ảnh" trên bất kỳ thẻ nào để đổi ảnh của bạn' : ''}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isAdmin && (
              <>
                <button
                  type="button"
                  onClick={() => handleOpenAdminEditor()}
                  className="px-3.5 py-2 rounded-xl bg-[#B3261E] hover:bg-[#8F1C16] text-[#FFFDF8] border border-[#C8963E] text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Thêm ảnh mới</span>
                </button>
                <button
                  type="button"
                  onClick={handleResetGallery}
                  title="Khôi phục kho ảnh mặc định"
                  className="px-3 py-2 rounded-xl bg-[#FFFDF8] hover:bg-[#FBF3E4] text-[#7A6556] hover:text-[#B3261E] border border-[#C8963E]/60 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Khôi phục gốc</span>
                </button>
              </>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-[#7A6556] hover:text-[#B3261E] hover:bg-[#C8963E]/15 rounded-xl transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Admin Toast Notification */}
        {adminToast && (
          <div className="px-5 py-2.5 bg-[#2E8B8B] text-[#FFFDF8] text-xs font-bold flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 shrink-0" />
              <span>{adminToast}</span>
            </div>
            <button type="button" onClick={() => setAdminToast(null)} className="text-white/80 hover:text-white">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Inline Admin Editor Drawer when editing or adding a photo */}
        {isAdmin && editingItem && (
          <div className="p-4 sm:p-5 bg-[#FBF3E4] border-b-2 border-[#C8963E] space-y-3 animate-fadeIn">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-[#B3261E]" />
                <span className="text-sm font-serif font-bold text-[#3B2A20]">
                  {isCreatingNew
                    ? 'Thêm Ảnh Danh Thắng Mới Vào Kho'
                    : `Chỉnh Sửa Thẻ Ảnh: ${editingItem.title}`}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setEditingItem(null)}
                className="text-xs font-semibold text-[#7A6556] hover:text-[#B3261E] flex items-center gap-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
                <span>Đóng khung sửa</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
              {/* Preview + Upload */}
              <div className="md:col-span-4 space-y-2">
                <div className="relative h-40 rounded-2xl overflow-hidden border-2 border-[#C8963E] bg-[#FFFDF8] shadow-sm">
                  <img
                    src={editImageUrl || editingItem.imageUrl || DEFAULT_VIETNAM_LANDMARK_FALLBACK}
                    alt={editTitle}
                    onError={e => {
                      (e.target as HTMLImageElement).src = DEFAULT_VIETNAM_LANDMARK_FALLBACK;
                    }}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-2 left-2 px-2.5 py-0.5 rounded-full bg-[#FFFDF8]/95 border border-[#C8963E] text-[11px] font-bold text-[#B3261E]">
                    📍 {editCityName || 'Việt Nam'}
                  </div>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAdminFileUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  disabled={isUploadingFile}
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-2 px-3 rounded-xl bg-[#FFFDF8] hover:bg-[#B3261E] text-[#B3261E] hover:text-[#FFFDF8] border border-[#C8963E] text-xs font-bold flex items-center justify-center gap-2 transition-colors shadow-sm cursor-pointer"
                >
                  {isUploadingFile ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Upload className="w-4 h-4" />
                  )}
                  <span>Tải ảnh từ Máy tính / Điện thoại</span>
                </button>
              </div>

              {/* Fields */}
              <div className="md:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold text-[#3B2A20] mb-1">
                    Đường dẫn URL Ảnh (hoặc tải file ở bên trái)
                  </label>
                  <input
                    type="text"
                    value={editImageUrl}
                    onChange={e => setEditImageUrl(e.target.value)}
                    placeholder="Dán link ảnh https://... hoặc tải tệp từ máy"
                    className="w-full px-3 py-2 rounded-xl bg-[#FFFDF8] border border-[#C8963E]/70 text-xs text-[#3B2A20] focus:outline-none focus:border-[#B3261E]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#3B2A20] mb-1">
                    Tiêu đề bức ảnh
                  </label>
                  <input
                    type="text"
                    value={editTitle}
                    onChange={e => setEditTitle(e.target.value)}
                    placeholder="VD: Khuê Văn Các - Văn Miếu Quốc Tử Giám"
                    className="w-full px-3 py-2 rounded-xl bg-[#FFFDF8] border border-[#C8963E]/70 text-xs text-[#3B2A20] focus:outline-none focus:border-[#B3261E]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#3B2A20] mb-1">
                    Tỉnh / Thành phố
                  </label>
                  <input
                    type="text"
                    value={editCityName}
                    onChange={e => {
                      setEditCityName(e.target.value);
                      setEditProvince(e.target.value);
                    }}
                    placeholder="VD: Hà Nội, Đà Nẵng, Huế..."
                    className="w-full px-3 py-2 rounded-xl bg-[#FFFDF8] border border-[#C8963E]/70 text-xs text-[#3B2A20] focus:outline-none focus:border-[#B3261E]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#3B2A20] mb-1">
                    Tên Danh thắng
                  </label>
                  <input
                    type="text"
                    value={editLandmarkName}
                    onChange={e => setEditLandmarkName(e.target.value)}
                    placeholder="VD: Văn Miếu - Quốc Tử Giám"
                    className="w-full px-3 py-2 rounded-xl bg-[#FFFDF8] border border-[#C8963E]/70 text-xs text-[#3B2A20] focus:outline-none focus:border-[#B3261E]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#3B2A20] mb-1">
                    Từ khóa (cách nhau dấu phẩy)
                  </label>
                  <input
                    type="text"
                    value={editTagsText}
                    onChange={e => setEditTagsText(e.target.value)}
                    placeholder="Hà Nội, Văn Miếu, Quốc Tử Giám"
                    className="w-full px-3 py-2 rounded-xl bg-[#FFFDF8] border border-[#C8963E]/70 text-xs text-[#3B2A20] focus:outline-none focus:border-[#B3261E]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold text-[#3B2A20] mb-1">
                    Mô tả ngắn / Khẩu hiệu
                  </label>
                  <input
                    type="text"
                    value={editTagline}
                    onChange={e => setEditTagline(e.target.value)}
                    placeholder="Mô tả ngắn gọn về danh thắng..."
                    className="w-full px-3 py-2 rounded-xl bg-[#FFFDF8] border border-[#C8963E]/70 text-xs text-[#3B2A20] focus:outline-none focus:border-[#B3261E]"
                  />
                </div>

                <div className="sm:col-span-2 flex flex-wrap items-center justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setEditingItem(null)}
                    className="px-3.5 py-2 rounded-xl bg-[#FFFDF8] border border-[#C8963E]/60 text-xs font-semibold text-[#7A6556] hover:text-[#3B2A20] cursor-pointer"
                  >
                    Hủy
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSaveAdminPhoto(false)}
                    className="px-4 py-2 rounded-xl bg-[#2E8B8B] hover:opacity-95 text-[#FFFDF8] text-xs font-bold flex items-center gap-1.5 shadow-sm cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Lưu vào Kho Ảnh</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSaveAdminPhoto(true)}
                    className="px-4 py-2 rounded-xl bg-[#B3261E] hover:bg-[#8F1C16] text-[#FFFDF8] text-xs font-bold flex items-center gap-1.5 shadow-sm cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Lưu & Gắn ảnh này luôn</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Search & Filter Controls */}
        <div className="px-5 py-3.5 bg-[#FFFDF8] border-b border-[#C8963E]/25 space-y-3">
          <div className="flex flex-col sm:flex-row gap-2.5">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-[#7A6556] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => {
                  const val = e.target.value;
                  setSearchQuery(val);
                  setPhotos(val.trim() ? findMatchingLandmarkPhotos(val) : getLandmarkPhotoGallery());
                }}
                onKeyDown={e => {
                  if (e.key === 'Enter') handleSearch(searchQuery);
                }}
                placeholder="Nhập tên thành phố hoặc danh thắng (VD: Hà Nội, Cầu Vàng, Đại Nội Huế, Tràng An...)"
                className="w-full pl-10 pr-9 py-2.5 bg-[#FBF3E4]/65 border border-[#C8963E]/60 rounded-xl text-sm text-[#3B2A20] placeholder-[#7A6556] focus:outline-none focus:border-[#B3261E]"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setActiveTab('');
                    setPhotos(getLandmarkPhotoGallery());
                    setAiSuggestions([]);
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#7A6556] hover:text-[#B3261E]"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={() => handleSearch(searchQuery)}
              disabled={isSearchingAI}
              className="px-4 py-2.5 bg-[#FBF3E4] hover:bg-[#C8963E]/25 text-[#3B2A20] border border-[#C8963E] text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer"
            >
              {isSearchingAI ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-[#B3261E]" />
                  <span>Đang tìm...</span>
                </>
              ) : (
                <>
                  <Wand2 className="w-4 h-4 text-[#B3261E]" />
                  <span>Lọc Kho Ảnh</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => handleGoogleGeminiSearch(searchQuery)}
              disabled={isGoogleSearching || !searchQuery.trim()}
              className="px-4 py-2.5 bg-[#B3261E] hover:bg-[#8F1C16] disabled:opacity-45 text-[#FFFDF8] text-xs font-bold rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer"
            >
              {isGoogleSearching ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Gemini đang tìm...</span>
                </>
              ) : (
                <>
                  <Globe className="w-4 h-4" />
                  <span>🌐 Gemini Tìm Google</span>
                </>
              )}
            </button>
          </div>

          {/* Quick Region Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            {POPULAR_REGIONS.map(reg => (
              <button
                key={reg.label}
                type="button"
                onClick={() => {
                  setActiveTab(reg.query);
                  setSearchQuery(reg.query);
                  handleSearch(reg.query);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border cursor-pointer ${
                  activeTab === reg.query
                    ? 'bg-[#B3261E] text-[#FFFDF8] border-[#C8963E] shadow-sm'
                    : 'bg-[#FFFDF8] text-[#3B2A20] hover:bg-[#FBF3E4] border-[#C8963E]/45'
                }`}
              >
                {reg.label}
              </button>
            ))}
          </div>

          {/* Option Toggle */}
          <div className="flex items-center justify-between pt-1 border-t border-[#C8963E]/20">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={applyMetadata}
                onChange={e => setApplyMetadata(e.target.checked)}
                className="w-4 h-4 rounded accent-[#B3261E]"
              />
              <span className="text-xs text-[#3B2A20]">
                Tự động điền <strong className="text-[#B3261E]">Tên thành phố, Danh thắng & Khẩu hiệu</strong> phù hợp khi chọn ảnh
              </span>
            </label>
            <span className="text-[11px] font-semibold text-[#B3261E]">
              Tìm thấy {photos.length} bức ảnh chất lượng cao
            </span>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="p-5 overflow-y-auto flex-1 space-y-5 bg-[#FBF3E4]/45">
          {/* Google Search Grounded Result Banner */}
          {googleResult && (
            <div className="p-4 rounded-2xl bg-[#FFFDF8] border-2 border-[#C8963E] space-y-3 shadow-md">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-[#2E8B8B]" />
                  <span className="text-xs font-bold uppercase tracking-wider text-[#2E8B8B]">
                    Kết quả Gemini AI Tìm qua Google cho "{searchQuery}"
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setGoogleResult(null)}
                  className="text-xs text-[#7A6556] hover:text-[#B3261E]"
                >
                  Đóng kết quả
                </button>
              </div>

              {googleResult.searchSummary && (
                <p className="text-xs text-[#3B2A20] leading-relaxed bg-[#FBF3E4] p-2.5 rounded-xl border border-[#C8963E]/40">
                  {googleResult.searchSummary}
                </p>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {googleResult.candidateImages.map((cand, idx) => {
                  const candidatePhotoItem: LandmarkPhotoItem = {
                    id: `google-cand-${Date.now()}-${idx}`,
                    cityName: googleResult.cityName,
                    province: googleResult.province,
                    landmarkName: googleResult.landmarkName,
                    title: cand.title || googleResult.landmarkName,
                    tagline: googleResult.tagline,
                    imageUrl: cand.url,
                    thumbUrl: cand.url,
                    lat: googleResult.lat,
                    lng: googleResult.lng,
                    tags: [googleResult.cityName, googleResult.landmarkName, 'Google Search'],
                    photographer: cand.photographer || 'Google Search',
                    source: cand.source || 'Google Images / Wikimedia'
                  };

                  return (
                    <div
                      key={idx}
                      onClick={() => {
                        onSelectPhoto(candidatePhotoItem, applyMetadata);
                        onClose();
                      }}
                      className="group relative bg-[#FFFDF8] border border-[#C8963E]/60 hover:border-[#B3261E] rounded-xl overflow-hidden cursor-pointer flex flex-col transition-all shadow-sm"
                    >
                      <div className="relative h-32 bg-[#FBF3E4] overflow-hidden">
                        <img
                          src={cand.url}
                          alt={cand.title}
                          onError={e => {
                            (e.target as HTMLImageElement).src = DEFAULT_VIETNAM_LANDMARK_FALLBACK;
                          }}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-[#2E8B8B] text-[10px] font-bold text-white flex items-center gap-1">
                          <Globe className="w-2.5 h-2.5" />
                          {idx === 0 ? 'Đề xuất tốt nhất' : `Phương án #${idx + 1}`}
                        </div>
                      </div>
                      <div className="p-2.5 flex-1 flex flex-col justify-between">
                        <div>
                          <h5 className="text-xs font-bold text-[#3B2A20] line-clamp-1">
                            {cand.title || googleResult.landmarkName}
                          </h5>
                          <p className="text-[10px] text-[#7A6556] line-clamp-1 mt-0.5">
                            Nguồn: {cand.source}
                          </p>
                        </div>
                        <button
                          type="button"
                          className="mt-2 w-full py-1.5 bg-[#B3261E] hover:bg-[#8F1C16] text-white text-[11px] font-bold rounded-lg transition-colors flex items-center justify-center gap-1"
                        >
                          <Check className="w-3 h-3" />
                          Chọn ảnh Google này
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Photo Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {photos.map(photo => (
              <div
                key={photo.id}
                onClick={() => {
                  onSelectPhoto(photo, applyMetadata);
                  onClose();
                }}
                className="group relative bg-[#FFFDF8] border border-[#C8963E]/55 hover:border-[#B3261E] rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-xl flex flex-col cursor-pointer"
              >
                {/* Image Container */}
                <div className="relative h-44 w-full bg-[#FBF3E4] overflow-hidden">
                  <img
                    src={photo.thumbUrl || photo.imageUrl || DEFAULT_VIETNAM_LANDMARK_FALLBACK}
                    alt={photo.title}
                    loading="lazy"
                    onError={e => {
                      (e.target as HTMLImageElement).src = DEFAULT_VIETNAM_LANDMARK_FALLBACK;
                    }}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#3B2A20]/70 via-transparent to-transparent" />

                  {/* City Badge */}
                  <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#FFFDF8]/95 border border-[#C8963E] text-[11px] font-bold text-[#B3261E] shadow-sm">
                    <MapPin className="w-3 h-3 text-[#B3261E]" />
                    {photo.cityName}
                  </div>

                  {/* Top-Right Action Buttons (Preview + Admin Edit/Delete) */}
                  <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5">
                    {isAdmin && (
                      <>
                        <button
                          type="button"
                          onClick={e => {
                            e.stopPropagation();
                            handleOpenAdminEditor(photo);
                          }}
                          title="Chỉnh sửa bức ảnh này (Admin)"
                          className="px-2.5 py-1 rounded-lg bg-[#FFFDF8]/95 hover:bg-[#B3261E] text-[#B3261E] hover:text-[#FFFDF8] border border-[#C8963E] text-[11px] font-bold flex items-center gap-1 shadow-sm transition-colors cursor-pointer"
                        >
                          <Edit3 className="w-3 h-3" />
                          <span>Sửa ảnh</span>
                        </button>
                        <button
                          type="button"
                          onClick={e => handleDeleteAdminPhoto(photo, e)}
                          title="Xóa ảnh này khỏi kho (Admin)"
                          className="p-1.5 rounded-lg bg-[#FFFDF8]/95 hover:bg-[#B3261E] text-[#7A6556] hover:text-[#FFFDF8] border border-[#C8963E] shadow-sm transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </>
                    )}
                    <button
                      type="button"
                      onClick={e => {
                        e.stopPropagation();
                        setPreviewPhoto(photo);
                      }}
                      title="Xem ảnh phóng to"
                      className="p-1.5 rounded-lg bg-[#FFFDF8]/95 hover:bg-[#B3261E] text-[#3B2A20] hover:text-[#FFFDF8] border border-[#C8963E] shadow-sm transition-colors cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Card Details */}
                <div className="p-3.5 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <h4 className="text-sm font-serif font-bold text-[#3B2A20] group-hover:text-[#B3261E] transition-colors line-clamp-1">
                      {photo.title}
                    </h4>
                    <p className="text-xs text-[#7A6556] line-clamp-2 mt-1 leading-relaxed">
                      {photo.tagline}
                    </p>
                  </div>

                  <div className="space-y-2.5 pt-2 border-t border-[#C8963E]/25">
                    <div className="flex flex-wrap gap-1">
                      {photo.tags.slice(0, 3).map(t => (
                        <span
                          key={t}
                          className="text-[10px] px-2 py-0.5 rounded-md bg-[#FBF3E4] text-[#7A6556] border border-[#C8963E]/40"
                        >
                          #{t}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] text-[#7A6556] truncate">
                        Ảnh bởi: {photo.photographer || 'Kho Di Sản VN'}
                      </span>
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#B3261E] text-[#FFFDF8] text-xs font-bold shadow-sm">
                        <Camera className="w-3.5 h-3.5" />
                        Gắn ảnh này
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Full Image Preview Lightbox */}
        {previewPhoto && (
          <div
            className="fixed inset-0 z-[10005] bg-[#3B2A20]/90 backdrop-blur-md flex items-center justify-center p-4"
            onClick={() => setPreviewPhoto(null)}
          >
            <div
              className="relative max-w-4xl w-full bg-[#FFFDF8] border-2 border-[#C8963E] rounded-3xl overflow-hidden shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              <div className="relative h-[60vh] bg-[#FBF3E4]">
                <img
                  src={previewPhoto.imageUrl || DEFAULT_VIETNAM_LANDMARK_FALLBACK}
                  alt={previewPhoto.title}
                  onError={e => {
                    (e.target as HTMLImageElement).src = DEFAULT_VIETNAM_LANDMARK_FALLBACK;
                  }}
                  className="w-full h-full object-contain"
                />
                <button
                  type="button"
                  onClick={() => setPreviewPhoto(null)}
                  className="absolute top-4 right-4 p-2 rounded-full bg-[#FFFDF8] text-[#3B2A20] hover:text-[#B3261E] border border-[#C8963E]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[#FBF3E4]">
                <div>
                  <div className="flex items-center gap-2 text-xs font-bold text-[#B3261E] mb-1">
                    <MapPin className="w-3.5 h-3.5" />
                    {previewPhoto.cityName} ({previewPhoto.province}) — {previewPhoto.landmarkName}
                  </div>
                  <h4 className="text-lg font-serif font-bold text-[#3B2A20]">
                    {previewPhoto.title}
                  </h4>
                  <p className="text-xs text-[#7A6556] mt-1">{previewPhoto.tagline}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {isAdmin && (
                    <button
                      type="button"
                      onClick={() => {
                        const target = previewPhoto;
                        setPreviewPhoto(null);
                        handleOpenAdminEditor(target);
                      }}
                      className="px-4 py-2.5 bg-[#FFFDF8] hover:bg-[#FBF3E4] text-[#B3261E] border border-[#C8963E] font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer"
                    >
                      <Edit3 className="w-4 h-4" />
                      <span>Sửa ảnh này</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      onSelectPhoto(previewPhoto, applyMetadata);
                      setPreviewPhoto(null);
                      onClose();
                    }}
                    className="px-5 py-2.5 bg-[#B3261E] hover:bg-[#8F1C16] text-[#FFFDF8] font-bold text-sm rounded-xl shadow-md flex items-center gap-2 shrink-0 cursor-pointer"
                  >
                    <Check className="w-4 h-4" />
                    Chọn làm Ảnh Nền
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="px-5 py-3 border-t border-[#C8963E]/30 bg-[#FBF3E4] flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-[#7A6556]">
            <Compass className="w-4 h-4 text-[#B3261E]" />
            <span>
              Hình ảnh được tối ưu chuẩn độ phân giải cao cho giao diện danh thắng Việt Nam
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold text-[#3B2A20] bg-[#FFFDF8] hover:bg-[#C8963E]/20 border border-[#C8963E]/60 transition-colors cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
