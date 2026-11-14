import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Volume2, 
  Square, 
  Play, 
  Pause, 
  UserCheck, 
  ShieldCheck, 
  BookOpen, 
  Layers, 
  RefreshCw,
  Clock,
  MapPin,
  Share2,
  Heart,
  AlertCircle,
  Edit3,
  Search,
  CheckCircle2
} from 'lucide-react';
import { aiService } from '../services/aiService';
import { ttsService } from '../services/ttsService';
import { storageService } from '../services/storageService';
import { HERITAGE_DATABASE } from '../data/vietnamHeritageData';
import { HeritageItem, StoryMode, HeritageStory } from '../types';
import { cleanVietnameseText } from '../utils/textUtils';
import { AdminStoryEditModal } from './AdminStoryEditModal';

interface StoryPlayerProps {
  initialHeritageName?: string;
  initialHistory?: string;
  initialPeriod?: string;
  onSelectHeritageForPlaces?: (id: string) => void;
  language?: string;
}

export const StoryPlayer: React.FC<StoryPlayerProps> = ({
  initialHeritageName,
  initialHistory,
  initialPeriod,
  onSelectHeritageForPlaces,
  language = 'vi'
}) => {
  const isEnglish = language === 'en';
  const ui = (vi: string, en: string) => isEnglish ? en : vi;
  const displayHeritageName = (heritage: HeritageItem) => isEnglish ? (heritage.englishName || heritage.name) : heritage.name;
  const displayProvince = (province?: string) => isEnglish ? ({ 'Thừa Thiên Huế': 'Thua Thien Hue', 'Thành phố Hà Nội': 'Hanoi', 'Hà Nội': 'Hanoi', 'Quảng Nam': 'Quang Nam', 'Ninh Bình': 'Ninh Binh', 'Thành phố Hồ Chí Minh': 'Ho Chi Minh City', 'Quảng Ninh': 'Quang Ninh', 'Quảng Bình': 'Quang Binh', 'Khánh Hòa': 'Khanh Hoa', 'Lào Cai': 'Lao Cai' } as Record<string, string>)[province || ''] || province || '' : province || '';
  const [heritagesList, setHeritagesList] = useState<HeritageItem[]>(storageService.getHeritages());
  const [searchQuery, setSearchQuery] = useState('');
  
  const [selectedHeritage, setSelectedHeritage] = useState<HeritageItem>(() => {
    const list = storageService.getHeritages();
    return list.find(h => h.name.includes(initialHeritageName || '')) || list[0] || HERITAGE_DATABASE[0];
  });
  
  const [mode, setMode] = useState<StoryMode>('student');
  const [loading, setLoading] = useState<boolean>(false);
  const [story, setStory] = useState<HeritageStory | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [speed, setSpeed] = useState<number>(1.0);
  
  const [isAdmin, setIsAdmin] = useState<boolean>(storageService.getCurrentUser().role === 'admin');
  const [isStoryModalOpen, setIsStoryModalOpen] = useState<boolean>(false);

  const audienceModes: { id: StoryMode; label: string; icon: string; desc: string }[] = [
    { id: 'children', label: ui('Trẻ em', 'Children'), icon: '👦', desc: ui('Truyện cổ tích ấm áp, dễ thương, nhân văn', 'Warm, engaging and meaningful stories') },
    { id: 'student', label: ui('Học sinh', 'School students'), icon: '🎒', desc: ui('Sinh động, khơi gợi tự hào dân tộc', 'Vivid stories that inspire cultural pride') },
    { id: 'university', label: ui('Sinh viên', 'University students'), icon: '🎓', desc: ui('Chuyên sâu bối cảnh, triết lý kiến trúc', 'In-depth historical context and architectural philosophy') },
    { id: 'adult', label: ui('Người lớn', 'Adults'), icon: '☕', desc: ui('Điềm đạm, lắng đọng giá trị tâm hồn', 'Calm narration highlighting enduring human values') },
    { id: 'foreigner', label: ui('Khách quốc tế (EN)', 'International visitors (EN)'), icon: '🌐', desc: ui('Clear English cultural narrative', 'Clear English cultural narrative') },
  ];

  // Sync initialHeritageName prop when navigating from other screens
  useEffect(() => {
    if (initialHeritageName) {
      const list = storageService.getHeritages();
      const found = list.find(h => 
        h.name.toLowerCase().includes(initialHeritageName.toLowerCase()) || 
        initialHeritageName.toLowerCase().includes(h.name.toLowerCase())
      );
      if (found) {
        setSelectedHeritage(found);
      }
    }
  }, [initialHeritageName]);

  // Sync heritages list and admin role
  useEffect(() => {
    const refreshData = () => {
      const list = storageService.getHeritages();
      setHeritagesList(list);
      setIsAdmin(storageService.getCurrentUser().role === 'admin');
    };

    refreshData();
    window.addEventListener('heritage-data-updated', refreshData);
    window.addEventListener('custom-stories-updated', refreshData);
    return () => {
      window.removeEventListener('heritage-data-updated', refreshData);
      window.removeEventListener('custom-stories-updated', refreshData);
    };
  }, []);

  const fetchStory = async (heritage: HeritageItem, targetMode: StoryMode) => {
    setLoading(true);
    setError(null);
    if (isPlaying) {
      aiService.stopSpeaking();
      setIsPlaying(false);
    }

    // 1. Check if there is an Admin custom story override
    const customStory = storageService.getCustomStory(heritage.id || heritage.name, targetMode);
    if (customStory) {
      setStory(customStory);
      setLoading(false);
      return;
    }

    // 1B. Instant verified stories for the 3 core Đà Nẵng landmarks (Ngũ Hành Sơn, Ma Nhai, Biển Mỹ Khê)
    const DANANG_VERIFIED_STORIES: Record<string, Omit<HeritageStory, 'mode'>> = {
      'ngu-hanh-son-da-nang': {
        heritageId: 'ngu-hanh-son-da-nang',
        heritageName: 'Danh thắng Ngũ Hành Sơn',
        title: 'Danh thắng Ngũ Hành Sơn – Tuyệt tác Non Nước & Dấu ấn Hoàng đế Minh Mạng',
        storyText:
          'Nằm bên bờ biển phường Hòa Hải, quận Ngũ Hành Sơn, thành phố Đà Nẵng, danh thắng Quốc gia đặc biệt Ngũ Hành Sơn gồm sáu ngọn núi đá vôi nhô lên giữa trảng cát ven biển. Năm Minh Mạng thứ sáu (1825), trong chuyến ngự giá tuần du Quảng Nam dinh, Hoàng đế Minh Mạng đã chiêm ngưỡng thế núi kỳ vĩ và dựa theo thuyết Ngũ Hành của triết học phương Đông để đặt tên cho các ngọn núi: Kim Sơn, Mộc Sơn, Thủy Sơn, Dương Hỏa Sơn, Âm Hỏa Sơn và Thổ Sơn. Trong đó, Thủy Sơn là ngọn núi lớn và cao nhất, quy tụ chùa Tam Thai cổ kính từ thế kỷ mười bảy, động Huyền Không thông thiên rực sáng ánh nắng tự nhiên, cùng Vọng Giang Đài và Vọng Hải Đài do chính vua Minh Mạng cho dựng năm 1837. Dưới chân núi là Làng nghề điêu khắc đá mỹ nghệ Non Nước hơn bốn trăm năm tuổi, nơi tiếng đục chạm đá ngân vang nối tiếp truyền thống từ thời khai sáng.',
        historicalContext:
          'Năm Minh Mạng thứ 6 (1825), vua Minh Mạng chính thức đặt tên 6 ngọn núi theo thuyết Ngũ Hành và ba lần ngự du vào các năm 1825, 1827, 1837. Năm 2018, Danh thắng Ngũ Hành Sơn được xếp hạng Di tích Quốc gia đặc biệt.',
        distinctionNote:
          'Chính sử xác nhận tên gọi Ngũ Hành Sơn do vua Minh Mạng đặt năm 1825 cùng các công trình Vọng Giang Đài, Vọng Hải Đài (1837); truyền thuyết dân gian kể về sự tích 6 mảnh vỏ trứng thần Kim Quy hóa thành 6 ngọn núi.',
        sourceReferences: [
          'Đại Nam nhất thống chí – Quốc sử quán triều Nguyễn',
          'Ban Quản lý Di tích Danh thắng Ngũ Hành Sơn Đà Nẵng',
          'Hồ sơ Di tích Quốc gia đặc biệt Danh thắng Ngũ Hành Sơn (2018)'
        ]
      },
      'ma-nhai-ngu-hanh-son': {
        heritageId: 'ma-nhai-ngu-hanh-son',
        heritageName: 'Ma Nhai Ngũ Hành Sơn (Vách đá khắc chữ)',
        title: 'Ma Nhai Ngũ Hành Sơn – Sử thi khắc trên vách đá & Di sản Tư liệu UNESCO',
        storyText:
          'Ẩn mình trên các vách đá tự nhiên và trong lòng những hang động thuộc danh thắng Ngũ Hành Sơn tại Đà Nẵng là hệ thống Ma Nhai Ngũ Hành Sơn — kho tàng gồm bảy mươi tám văn bia chữ Hán và chữ Nôm có niên đại từ nửa đầu thế kỷ mười bảy đến thế kỷ hai mươi. Thuật ngữ "Ma Nhai" nghĩa là mài phẳng vách đá tự nhiên trên núi để khắc trực tiếp bài minh, bài thơ hay ngự bút mà không dựng bia đá rời. Nổi bật nhất tại động Huyền Không, động Hoa Nghiêm và động Tàng Chơn là những bức ngự bút của Hoàng đế Minh Mạng khắc năm 1837 như "Huyền Không Động", "Vọng Giang Đài", "Vọng Hải Đài", cùng tấm bia cổ nhất "Phổ Đà Sơn Linh Trung Phật" khắc năm 1640 ghi danh nhiều thương nhân Việt Nam, Nhật Bản và Trung Hoa từng giao thương tại cảng thị Đà Nẵng – Hội An. Ngày 26 tháng 11 năm 2022, Ma Nhai tại Danh thắng Ngũ Hành Sơn đã được UNESCO công nhận là Di sản tư liệu thuộc Chương trình Ký ức Thế giới khu vực Châu Á – Thái Bình Dương.',
        historicalContext:
          'Hệ thống gồm 78 văn bia chữ Hán và chữ Nôm (từ năm 1640 đến thế kỷ XX) khắc trực tiếp trên vách đá hang động Ngũ Hành Sơn, được UNESCO ghi danh Di sản tư liệu Ký ức Thế giới khu vực Châu Á – Thái Bình Dương ngày 26/11/2022.',
        distinctionNote:
          'Toàn bộ 78 bia Ma Nhai là tư liệu gốc khắc trực tiếp trên đá vôi tự nhiên có niên đại xác thực (như bia Phổ Đà Sơn Linh Trung Phật năm 1640 và ngự bút Minh Mạng năm 1837), phản ánh lịch sử giao thương quốc tế và văn hóa Phật giáo Đàng Trong.',
        sourceReferences: [
          'Hồ sơ Di sản tư liệu Ma Nhai tại Danh thắng Ngũ Hành Sơn – UNESCO (2022)',
          'Cục Di sản Văn hóa – Bộ Văn hóa, Thể thao và Du lịch',
          'Châu bản triều Nguyễn thời Minh Mạng'
        ]
      },
      'bien-my-khe-da-nang': {
        heritageId: 'bien-my-khe-da-nang',
        heritageName: 'Biển Mỹ Khê Đà Nẵng',
        title: 'Biển Mỹ Khê Đà Nẵng – Bờ biển quyến rũ hành tinh & Không gian Văn hóa Cầu Ngư',
        storyText:
          'Trải dài duyên dáng từ chân bán đảo Sơn Trà đến khu vực danh thắng Ngũ Hành Sơn, Biển Mỹ Khê là viên ngọc xanh biểu tượng của thành phố Đà Nẵng. Với bờ cát trắng mịn màng, độ dốc thoai thoải an toàn, làn nước biển trong xanh ấm áp quanh năm và hàng dừa rợp bóng, Mỹ Khê từng được tạp chí kinh tế Forbes của Hoa Kỳ bình chọn là một trong sáu bãi biển quyến rũ nhất hành tinh vào năm 2005. Không chỉ là thắng cảnh thiên nhiên kỳ thú nơi du khách đón những tia nắng bình minh đầu tiên trên biển Đông và phóng tầm mắt ngắm tượng Phật Bà Quan Âm chùa Linh Ứng Sơn Trà cùng cụm núi Ngũ Hành Sơn, biển Mỹ Khê còn gắn liền với đời sống văn hóa ngư dân Đà Nẵng qua Lễ hội Cầu Ngư truyền thống — Di sản văn hóa phi vật thể quốc gia tôn vinh lòng biết ơn biển cả.',
        historicalContext:
          'Danh thắng biển tiêu biểu của TP. Đà Nẵng trên cung đường ven biển Sơn Trà – Ngũ Hành Sơn, được tạp chí Forbes bình chọn năm 2005 và gắn với Lễ hội Cầu Ngư (Di sản văn hóa phi vật thể quốc gia).',
        distinctionNote:
          'Tư liệu địa lý và giải thưởng quốc tế ghi nhận vẻ đẹp tự nhiên của bãi biển Mỹ Khê; phần tín ngưỡng thờ cá Ông (Nam Hải Cự Tộc Ngọc Lân Thượng Đẳng Thần) và điệu hò bá trạo là di sản văn hóa dân gian đặc sắc của ngư dân Đà Nẵng.',
        sourceReferences: [
          'Cổng Thông tin Du lịch Thành phố Đà Nẵng',
          'Hồ sơ Di sản văn hóa phi vật thể quốc gia Lễ hội Cầu Ngư tại Đà Nẵng',
          'Tạp chí Forbes (2005) – World’s Most Luxurious Beaches'
        ]
      }
    };

    if (DANANG_VERIFIED_STORIES[heritage.id] && (!language || language === 'vi') && targetMode !== 'foreigner') {
      setStory({
        ...DANANG_VERIFIED_STORIES[heritage.id],
        mode: targetMode
      });
      setLoading(false);
      return;
    }

    // 2. Otherwise generate via AI
    try {
      const activeStoryLang = (language && language !== 'vi') ? language : (targetMode === 'foreigner' ? 'en' : 'vi');
      const generated = await aiService.generateStory({
        heritageName: heritage.name,
        category: heritage.categoryLabel,
        region: heritage.region,
        history: heritage.history,
        period: heritage.period,
        mode: targetMode,
        language: activeStoryLang
      });
      setStory(generated);

      storageService.logActivity({
        actionType: 'story',
        title: 'Nghe AI kể chuyện văn hóa',
        description: `Tạo câu chuyện di sản "${heritage.name}" (Đối tượng: ${audienceModes.find(m => m.id === targetMode)?.label})`,
        targetId: heritage.id,
        pointsEarned: 20
      });
    } catch (err: any) {
      console.warn('Lỗi tải câu chuyện AI:', err);
      setError(err?.message || 'AI hiện đang bận hoặc quá tải, vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  // Sync initialHeritageName prop if provided
  useEffect(() => {
    if (initialHeritageName) {
      const list = storageService.getHeritages();
      const match = list.find(h => h.name.toLowerCase().includes(initialHeritageName.toLowerCase()));
      if (match && match.id !== selectedHeritage.id) {
        setSelectedHeritage(match);
      }
    }
  }, [initialHeritageName]);

  // Stop TTS speech when component unmounts or user switches tabs
  useEffect(() => {
    return () => {
      aiService.stopSpeaking();
    };
  }, []);

  useEffect(() => {
    aiService.stopSpeaking();
    setIsPlaying(false);
    fetchStory(selectedHeritage, mode);
  }, [selectedHeritage.id, selectedHeritage.name, mode, language]);

  const handleTogglePlay = () => {
    ttsService.prepareForMobilePlayback();
    if (isPlaying) {
      aiService.stopSpeaking();
      setIsPlaying(false);
    } else if (story?.storyText) {
      setIsPlaying(true);
      const isEnglish = mode === 'foreigner' || language === 'en';
      const speechLangTag = isEnglish ? 'en-US' : (
        language === 'fr' ? 'fr-FR' : (
          language === 'ja' ? 'ja-JP' : (
            language === 'ko' ? 'ko-KR' : (
              language === 'zh' ? 'zh-CN' : 'vi-VN'
            )
          )
        )
      );
      aiService.speakText(story.storyText, {
        rate: speed,
        lang: speechLangTag,
        provider: isEnglish ? 'web_speech' : undefined,
        onEnd: () => setIsPlaying(false),
        onError: (err) => {
          console.warn('Playback error in StoryPlayer:', err);
          setIsPlaying(false);
        }
      });
    }
  };

  const handleStop = () => {
    aiService.stopSpeaking();
    setIsPlaying(false);
  };

  const handleSpeedChange = (newSpeed: number) => {
    setSpeed(newSpeed);
    if (isPlaying && story?.storyText) {
      aiService.stopSpeaking();
      const isEnglish = mode === 'foreigner' || language === 'en';
      const speechLangTag = isEnglish ? 'en-US' : (
        language === 'fr' ? 'fr-FR' : (
          language === 'ja' ? 'ja-JP' : (
            language === 'ko' ? 'ko-KR' : (
              language === 'zh' ? 'zh-CN' : 'vi-VN'
            )
          )
        )
      );
      aiService.speakText(story.storyText, {
        rate: newSpeed,
        lang: speechLangTag,
        provider: isEnglish ? 'web_speech' : undefined,
        onEnd: () => setIsPlaying(false),
        onError: (err) => {
          console.warn('Playback error in StoryPlayer:', err);
          setIsPlaying(false);
        }
      });
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      
      {/* Title & Introduction */}
      <div className="text-center max-w-3xl mx-auto mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 text-red-400 border border-red-500/20 text-xs font-semibold mb-3">
          <Volume2 className="w-3.5 h-3.5" />
          <span>{ui('Giọng Kể Di Sản Đa Đối Tượng', 'Multi-Audience Heritage Narration')}</span>
        </div>
        <h2 className="text-2xl sm:text-4xl font-serif font-bold text-stone-100">
          {ui('Nghe AI Kể Chuyện Di Sản', 'Listen to AI Heritage Stories')}
        </h2>
        <p className="text-stone-300 text-xs sm:text-sm mt-2">
          {ui('Truyền cảm xúc và sự thật lịch sử vào từng câu chuyện, phân biệt rạch ròi giữa chính sử và huyền tích dân gian.', 'Bring emotion and historical facts to every story, clearly distinguishing documented history from folk legends.')}
        </p>
      </div>

      {/* Select Heritage to Tell */}
      <div
        data-guide-id="story.heritageSelector"
        data-guide-type="ui"
        className="mb-6 bg-stone-900/95 border border-amber-500/35 rounded-2xl p-4 sm:p-5 space-y-4 shadow-xl"
      >
        {/* 8.4. Đề xuất câu chuyện về 3 địa danh Đà Nẵng ở vị trí đầu danh sách */}
        <div className="p-3 rounded-xl bg-stone-950/90 border border-amber-400/50">
          <div className="text-xs font-bold text-amber-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <span>★ Đề xuất câu chuyện Đà Nẵng trọng tâm (Chạm để nghe ngay):</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {heritagesList
              .filter(h =>
                ['ngu-hanh-son-da-nang', 'ma-nhai-ngu-hanh-son', 'bien-my-khe-da-nang'].includes(h.id)
              )
              .map((dnItem, idx) => {
                const isSelected = selectedHeritage.id === dnItem.id;
                return (
                  <button
                    key={dnItem.id}
                    type="button"
                    onClick={() => setSelectedHeritage(dnItem)}
                    className={`p-2.5 rounded-xl border text-left transition-all flex items-center gap-2.5 cursor-pointer ${
                      isSelected
                        ? 'bg-amber-500 text-[#FFFDF8] border-white font-bold shadow-lg'
                        : 'bg-stone-900 hover:bg-stone-800 border-amber-500/40 text-amber-100'
                    }`}
                  >
                    <span
                      className={`w-6 h-6 rounded-lg font-mono text-xs font-extrabold flex items-center justify-center shrink-0 ${
                        isSelected ? 'bg-stone-950 text-amber-300' : 'bg-amber-500/20 text-amber-300'
                      }`}
                    >
                      0{idx + 1}
                    </span>
                    <div className="min-w-0">
                      <span className="text-xs font-bold block truncate">
                        {displayHeritageName(dnItem)}
                      </span>
                      <span
                        className={`text-[10px] block truncate ${
                          isSelected ? 'text-stone-800 font-semibold' : 'text-amber-300/80'
                        }`}
                      >
                        {dnItem.categoryLabel}
                      </span>
                    </div>
                  </button>
                );
              })}
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2">
          <label className="block text-xs font-semibold text-amber-300 uppercase tracking-wider">
            {ui('Chọn di sản để nghe chuyện', 'Choose a heritage to hear its story')} ({heritagesList.length}):
          </label>

          {/* Search box for Heritages */}
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={ui('Tìm di sản để nghe chuyện...', 'Search heritage stories...')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-stone-950 border border-stone-800 text-stone-200 text-xs focus:outline-none focus:border-amber-500 transition-colors"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 max-h-56 overflow-y-auto pr-1 custom-scrollbar">
          {heritagesList
            .filter(item => 
              !searchQuery.trim() || 
              item.name.toLowerCase().includes(searchQuery.toLowerCase()) || (item.englishName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
              item.province?.toLowerCase().includes(searchQuery.toLowerCase()) ||
              item.categoryLabel?.toLowerCase().includes(searchQuery.toLowerCase())
            )
            .map((item) => (
              <button
                key={item.id}
                onClick={() => setSelectedHeritage(item)}
                className={`p-2.5 rounded-xl border text-left transition-all text-xs flex items-center gap-2.5 cursor-pointer ${
                  selectedHeritage.id === item.id 
                    ? 'bg-amber-600/30 border-amber-500 text-amber-200 shadow-md ring-1 ring-amber-500/40' 
                    : 'bg-stone-950/60 border-stone-800 text-stone-300 hover:bg-stone-800'
                }`}
              >
                <img src={item.imageUrl} alt={displayHeritageName(item)} className="w-9 h-9 rounded-lg object-cover shrink-0" />
                <div className="overflow-hidden">
                  <span className="font-medium line-clamp-1 block">{displayHeritageName(item)}</span>
                  <span className="text-[10px] text-stone-400 block truncate">{displayProvince(item.province)}</span>
                </div>
              </button>
            ))}
        </div>
      </div>

      {/* 5 Audience Mode Switchers */}
      <div className="mb-6" data-guide-id="story.audienceModes" data-guide-type="ui">
        <label className="block text-xs font-semibold text-stone-400 uppercase tracking-wider mb-2">
          {ui('Chọn đối tượng nghe chuyện:', 'Choose your story audience:')}
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
          {audienceModes.map((item) => (
            <button
              key={item.id}
              onClick={() => setMode(item.id)}
              className={`p-3 rounded-xl border text-left transition-all relative cursor-pointer ${
                mode === item.id 
                  ? 'bg-red-950/50 border-red-500 text-stone-100 ring-2 ring-red-500/20' 
                  : 'bg-stone-900 border-stone-800 text-stone-400 hover:bg-stone-800/80 hover:text-stone-200'
              }`}
            >
              <div className="text-xl mb-1">{item.icon}</div>
              <p className="text-xs font-bold text-amber-200">{item.label}</p>
              <p className="text-[10px] text-stone-400 mt-0.5 line-clamp-2">{item.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Main Story & Audio Player Container */}
      <div className="bg-stone-900 border border-stone-800 rounded-3xl overflow-hidden shadow-2xl">
        
        {/* Top Hero Banner of Selected Heritage */}
        <div className="relative h-48 sm:h-64 w-full overflow-hidden">
          <img 
            src={selectedHeritage.imageUrl} 
            alt={selectedHeritage.name} 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-stone-900 via-stone-900/60 to-transparent" />
          
          <div className="absolute top-4 right-4 z-10">
            {isAdmin && (
              <button
                onClick={() => setIsStoryModalOpen(true)}
                className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-[#FFFDF8] font-bold text-xs flex items-center gap-1.5 shadow-lg transition-all cursor-pointer"
                title={ui('Chỉnh sửa nội dung câu chuyện AI cho đối tượng đã chọn', 'Edit the AI story for the selected audience')}
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>{ui('Sửa Nội Dung AI (Admin)', 'Edit AI Story (Admin)')}</span>
              </button>
            )}
          </div>

          <div className="absolute bottom-4 left-4 sm:left-6 right-4 sm:right-6 flex flex-wrap items-end justify-between gap-3">
            <div className="bg-[var(--surface)]/92 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-[var(--gold)] shadow-sm">
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-[var(--primary)]/12 text-[var(--primary)] border border-[var(--gold)]/60 font-semibold">
                {isEnglish ? (selectedHeritage.englishName ? 'Cultural Heritage' : selectedHeritage.categoryLabel) : selectedHeritage.categoryLabel}
              </span>
              <h3 className="text-xl sm:text-3xl font-serif font-bold text-[var(--text)] mt-1">
                {story?.title || displayHeritageName(selectedHeritage)}
              </h3>
              <p className="text-xs text-[var(--text-muted)] flex items-center gap-1.5 mt-1">
                <MapPin className="w-3.5 h-3.5 text-[var(--primary)]" />
                <span>{selectedHeritage.address}</span>
              </p>
            </div>

            {/* Quick Tag */}
            <div className="text-xs px-3 py-1.5 bg-[var(--surface)]/95 backdrop-blur rounded-xl text-[var(--primary)] border border-[var(--gold)] shadow-sm">
              {ui('Chế độ: ', 'Mode: ')}<span className="font-bold">{audienceModes.find(m => m.id === mode)?.label}</span>
            </div>
          </div>
        </div>

        {/* Audio Controller Bar */}
        <div
          data-guide-id="story.audioPlayer"
          data-guide-type="ui"
          className="bg-stone-950/80 px-6 py-4 border-y border-stone-800 flex flex-wrap items-center justify-between gap-4"
        >
          
          <div className="flex items-center gap-3">
            <button
              id="btn-story-play"
              onClick={handleTogglePlay}
              disabled={loading || !story}
              className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-[#FFFDF8] transition-all shadow-lg ${
                isPlaying 
                  ? 'bg-amber-400 hover:bg-amber-300 animate-pulse' 
                  : 'bg-red-600 hover:bg-red-500 text-white'
              }`}
              title={isPlaying ? ui('Tạm dừng đọc', 'Pause narration') : ui('Đọc câu chuyện', 'Read story')}
            >
              {isPlaying ? <Pause className="w-5 h-5 text-[#FFFDF8]" /> : <Play className="w-5 h-5 ml-0.5 fill-current" />}
            </button>

            {isPlaying && (
              <button
                onClick={handleStop}
                className="p-2.5 rounded-full bg-stone-800 hover:bg-stone-700 text-stone-300 transition-colors"
                title="Dừng phát"
              >
                <Square className="w-4 h-4" />
              </button>
            )}

            <div>
              <p className="text-xs font-semibold text-stone-200">
                {isPlaying 
                  ? (mode === 'foreigner' || language === 'en' ? ui('Đang đọc bằng Giọng đọc Tiếng Anh (English AI Voice)...', 'Reading with English AI voice...') : ui('Đang đọc truyền cảm qua AI Voice...', 'AI is narrating your story...')) 
                  : (mode === 'foreigner' || language === 'en' ? ui('Bấm Play để nghe giọng đọc Tiếng Anh', 'Press Play to listen in English') : ui('Bấm Play để nghe AI đọc to', 'Press Play to hear the AI narration'))}
              </p>
              <div className="flex items-center gap-1 mt-1">
                {/* Audio Waveform simulation */}
                <div className={`flex items-end gap-1 h-3 ${isPlaying ? 'opacity-100' : 'opacity-30'}`}>
                  <div className="w-1 bg-amber-400 h-2 animate-bounce"></div>
                  <div className="w-1 bg-amber-400 h-3 animate-bounce [animation-delay:0.2s]"></div>
                  <div className="w-1 bg-amber-400 h-1.5 animate-bounce [animation-delay:0.4s]"></div>
                  <div className="w-1 bg-amber-400 h-2.5 animate-bounce [animation-delay:0.1s]"></div>
                </div>
                <span className="text-[10px] text-amber-300 ml-1.5 font-semibold">
                  {mode === 'foreigner' || language === 'en' ? ui('🌐 Giọng đọc Tiếng Anh (English Voice)', '🌐 English voice') : ui('🇻🇳 Tiếng Việt chuẩn', '🇻🇳 Vietnamese voice')}
                </span>
              </div>
            </div>
          </div>

          {/* Voice Speed Controls */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-stone-400">{ui('Tốc độ:', 'Speed:')}</span>
            {[0.8, 1.0, 1.2].map((s) => (
              <button
                key={s}
                onClick={() => handleSpeedChange(s)}
                className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                  speed === s 
                    ? 'bg-amber-500 text-[#FFFDF8] font-bold' 
                    : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
                }`}
              >
                {s}x
              </button>
            ))}
          </div>
        </div>

        {/* Story Content Area */}
        <div className="p-6 sm:p-8 space-y-6">
          {loading ? (
            <div className="py-12 text-center space-y-3">
              <RefreshCw className="w-8 h-8 text-amber-400 animate-spin mx-auto" />
              <p className="text-sm font-medium text-amber-200">{ui('AI đang sáng tác câu chuyện di sản cho bạn...', 'AI is creating a heritage story for you...')}</p>
              <p className="text-xs text-stone-500">{ui('Áp dụng bộ lọc phong cách: ', 'Narration style: ')}{audienceModes.find(m => m.id === mode)?.label}</p>
            </div>
          ) : story ? (
            <>
              {story.isFallback && (
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-950/40 border border-amber-500/30 text-amber-300 text-xs font-medium">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>{ui('Bản kể biên soạn từ Kho lưu trữ Di sản Quốc gia (Chế độ tin cậy khi AI đang bận)', 'Story adapted from the National Heritage Archive (fallback while AI is unavailable)')}</span>
                </div>
              )}

              {/* Story Text */}
              <div className="prose prose-invert max-w-none">
                <p className="text-base sm:text-lg text-stone-200 leading-relaxed sm:leading-loose whitespace-pre-line font-serif tracking-normal">
                  {cleanVietnameseText(story.storyText)}
                </p>
              </div>

              {/* Crucial: Distinction Note between History vs Legend */}
              {story.distinctionNote && (
                <div className="bg-amber-950/30 border border-amber-500/40 rounded-2xl p-4 sm:p-5 flex items-start gap-3.5">
                  <ShieldCheck className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider">
                      {ui('Phân biệt Rạch ròi: Lịch sử & Truyền thuyết', 'Clearly Distinguishing History & Legend')}
                    </h4>
                    <p className="text-xs sm:text-sm text-stone-300 mt-1 leading-relaxed">
                      {cleanVietnameseText(story.distinctionNote)}
                    </p>
                  </div>
                </div>
              )}

              {/* References & Sources */}
              {story.sourceReferences && story.sourceReferences.length > 0 && (
                <div className="pt-4 border-t border-stone-800 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-xs text-stone-400">
                    <BookOpen className="w-4 h-4 text-stone-500" />
                    <span>{ui('Nguồn tư liệu tham khảo:', 'References:')}</span>
                    <span className="text-stone-300 font-medium">
                      {story.sourceReferences.join(' • ')}
                    </span>
                  </div>

                  <button
                    onClick={() => onSelectHeritageForPlaces?.(selectedHeritage.id)}
                    className="text-xs text-amber-400 hover:text-amber-300 underline font-medium"
                  >
                    {ui('Xem quán ăn & trải nghiệm gần đây →', 'Explore nearby food & experiences →')}
                  </button>
                </div>
              )}
            </>
          ) : error ? (
            <div className="py-12 text-center space-y-4 max-w-md mx-auto">
              <div className="w-12 h-12 rounded-full bg-amber-500/10 text-amber-400 flex items-center justify-center mx-auto border border-amber-500/20">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-semibold text-stone-200">{ui('Máy chủ AI đang có lượng yêu cầu cao', 'AI server is experiencing high demand')}</p>
                <p className="text-xs text-stone-400 mt-1.5 leading-relaxed">{error}</p>
              </div>
              <button
                onClick={() => fetchStory(selectedHeritage, mode)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 text-[#FFFDF8] font-bold text-xs hover:bg-amber-400 transition-colors shadow-lg shadow-amber-500/10 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>{ui('Thử lại với AI', 'Try AI again')}</span>
              </button>
            </div>
          ) : null}
        </div>

      </div>

      <AdminStoryEditModal
        isOpen={isStoryModalOpen}
        onClose={() => setIsStoryModalOpen(false)}
        heritage={selectedHeritage}
        initialMode={mode}
        currentStory={story}
        onSaved={(updatedStory) => {
          setStory(updatedStory);
        }}
      />

    </div>
  );
};
