import React, { useState } from 'react';
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
  Share2, 
  Info, 
  Car, 
  Lock, 
  User, 
  X,
  Calendar,
  CloudSun
} from 'lucide-react';
import { aiService } from '../services/aiService';
import { storageService } from '../services/storageService';
import { ItineraryPlan, UserProfile } from '../types';
import { useLanguage } from '../hooks/useLanguage';
import { ItineraryWeatherCard } from './ItineraryWeatherCard';

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

export const ItineraryPlanner: React.FC<ItineraryPlannerProps> = ({ onNavigateToFood, currentUser, onRequireAuth }) => {
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
  const [loading, setLoading] = useState<boolean>(false);
  const [itinerary, setItinerary] = useState<ItineraryPlan | null>(DANANG_SAMPLE_ITINERARY);
  const [saved, setSaved] = useState<boolean>(false);
  const [showAuthNoticeModal, setShowAuthNoticeModal] = useState<boolean>(false);

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

  const handleGenerate = async () => {
    // Check authentication: Guest user cannot generate itineraries
    const activeUser = currentUser || storageService.getCurrentUser();
    if (!activeUser || !activeUser.isLoggedIn) {
      setShowAuthNoticeModal(true);
      return;
    }

    setLoading(true);
    setSaved(false);
    try {
      const plan = await aiService.generateSmartItinerary({
        destination,
        duration,
        interests,
        budget,
        companion
      });
      setItinerary(plan);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveItinerary = () => {
    const activeUser = currentUser || storageService.getCurrentUser();
    if (!activeUser || !activeUser.isLoggedIn) {
      setShowAuthNoticeModal(true);
      return;
    }

    if (itinerary) {
      storageService.saveItinerary(itinerary);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
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

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-semibold mb-3">
          <CalendarDays className="w-3.5 h-3.5" />
          <span>{isEnglish ? 'Heritage & Culinary Itinerary Optimization' : 'Thuật Toán Tối Ưu Lịch Trình Di Sản & Ẩm Thực'}</span>
        </div>
        <h2 className="text-2xl sm:text-4xl font-serif font-bold text-stone-100">
          {isEnglish ? 'Design a Smart Cultural Itinerary' : 'Thiết Kế Lịch Trình Văn Hóa Thông Minh'}
        </h2>
        <p className="text-stone-300 text-xs sm:text-sm mt-2">
          {isEnglish ? 'AI arranges your visits along an optimized route, taking opening hours and your preferences into account.' : 'AI tự động sắp xếp thứ tự tham quan theo cung đường tối ưu, phù hợp giờ mở cửa và sở thích của bạn.'}
        </p>
      </div>

      {/* 8.4. Khối Lịch trình mẫu có sẵn: "Khám phá Đà Nẵng" đi qua 3 điểm theo thứ tự địa lý hợp lý */}
      <div className="mb-6 rounded-2xl bg-stone-900/95 border-2 border-amber-400/60 p-4 sm:p-5 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-amber-500 text-[#FFFDF8] text-xs font-extrabold uppercase mb-1.5">
            <span>★ Lịch trình mẫu Đà Nẵng (Chuẩn vị trí địa lý Bắc → Nam)</span>
          </div>
          <h3 className="text-base sm:text-lg font-serif font-bold text-amber-50">
            Khám phá Đà Nẵng: 1. Biển Mỹ Khê → 2. Danh thắng Ngũ Hành Sơn → 3. Văn khắc Ma Nhai
          </h3>
          <p className="text-xs sm:text-sm text-stone-300 mt-1">
            Sắp xếp tối ưu dọc trục đường biển Võ Nguyên Giáp – Trường Sa – Huyền Trân Công Chúa, tiết kiệm thời gian di chuyển.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setDestination('Đà Nẵng');
            setDuration('1 ngày (Sáng đến Tối)');
            setItinerary(DANANG_SAMPLE_ITINERARY);
          }}
          className="min-h-[44px] px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-[#FFFDF8] font-extrabold text-xs sm:text-sm shrink-0 cursor-pointer shadow-md"
        >
          Xem lịch trình mẫu Đà Nẵng
        </button>
      </div>

      {/* Input Form Panel */}
      <div
        data-guide-id="itinerary.form"
        data-guide-type="ui"
        className="bg-stone-900 border border-stone-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 mb-8"
      >
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          
          {/* Destination */}
          <div className="lg:col-span-1">
            <label className="block text-xs font-semibold text-stone-300 uppercase tracking-wider mb-2 flex items-center gap-1">
              <MapPin className="w-3 h-3 text-amber-400" />
              <span>{isEnglish ? 'Destination:' : 'Điểm đến:'}</span>
            </label>
            <select
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              className="w-full bg-stone-950 border border-stone-700 text-stone-100 text-xs rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-amber-500"
            >
              <option value="Đà Nẵng">{isEnglish ? 'Da Nang (Ngu Hanh Son - Ma Nhai - My Khe)' : 'Đà Nẵng (Ngũ Hành Sơn – Ma Nhai – Mỹ Khê)'}</option>
              <option value="Thành phố Huế">{isEnglish ? 'Hue (Imperial Capital)' : 'Thành phố Huế (Cố đô)'}</option>
              <option value="Hà Nội">{isEnglish ? 'Hanoi (Millennia-Old Capital)' : 'Hà Nội (Thủ đô ngàn năm)'}</option>
              <option value="Phố cổ Hội An">{isEnglish ? 'Hoi An Ancient Town & My Son' : 'Phố cổ Hội An & Mỹ Sơn'}</option>
              <option value="Ninh Bình">{isEnglish ? 'Ninh Binh (Trang An - Hoa Lu)' : 'Ninh Bình (Tràng An - Hoa Lư)'}</option>
              <option value="TP. Hồ Chí Minh">{isEnglish ? 'Ho Chi Minh City (Old & New Saigon)' : 'TP. Hồ Chí Minh (Sài Gòn xưa & nay)'}</option>
              <option value="Đà Nẵng">{isEnglish ? 'Da Nang & Cham Sculpture' : 'Đà Nẵng & Điêu khắc Chăm'}</option>
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
          <div className="lg:col-span-1">
            <label className="block text-xs font-semibold text-stone-300 uppercase tracking-wider mb-2 flex items-center gap-1">
              <Calendar className="w-3 h-3 text-amber-400" />
              <span>{isEnglish ? 'Start Date:' : 'Ngày khởi hành:'}</span>
            </label>
            <input
              type="date"
              value={travelStartDate}
              onChange={(e) => setTravelStartDate(e.target.value)}
              className="w-full bg-stone-950 border border-stone-700 text-stone-100 text-xs rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-amber-500 cursor-pointer"
            />
          </div>

          {/* Duration */}
          <div className="lg:col-span-1">
            <label className="block text-xs font-semibold text-stone-300 uppercase tracking-wider mb-2 flex items-center gap-1">
              <Clock className="w-3 h-3 text-amber-400" />
              <span>{isEnglish ? 'Duration:' : 'Thời lượng:'}</span>
            </label>
            <select
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="w-full bg-stone-950 border border-stone-700 text-stone-100 text-xs rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-amber-500"
            >
              <option value="1 ngày (Sáng đến Tối)">{isEnglish ? '1 full day' : '1 ngày (Trọn vẹn)'}</option>
              <option value="2 ngày 1 đêm">{isEnglish ? '2 days, 1 night' : '2 ngày 1 đêm'}</option>
              <option value="3 ngày 2 đêm">{isEnglish ? '3 days, 2 nights' : '3 ngày 2 đêm'}</option>
            </select>
          </div>

          {/* Companion */}
          <div className="lg:col-span-1">
            <label className="block text-xs font-semibold text-stone-300 uppercase tracking-wider mb-2">
              {isEnglish ? 'Travel party:' : 'Đồng hành:'}
            </label>
            <select
              value={companion}
              onChange={(e) => setCompanion(e.target.value)}
              className="w-full bg-stone-950 border border-stone-700 text-stone-100 text-xs rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-amber-500"
            >
              <option value="Gia đình có trẻ em">{isEnglish ? 'Family with children' : 'Gia đình có trẻ em'}</option>
              <option value="Nhóm bạn trẻ / Sinh viên">{isEnglish ? 'Friends / Students' : 'Nhóm bạn trẻ / Sinh viên'}</option>
              <option value="Đi một mình / Du lịch tự túc">{isEnglish ? 'Solo traveler' : 'Đi một mình'}</option>
              <option value="Người lớn tuổi / Nghỉ dưỡng">{isEnglish ? 'Older adults' : 'Người lớn tuổi'}</option>
            </select>
          </div>

          {/* Budget */}
          <div className="lg:col-span-1">
            <label className="block text-xs font-semibold text-stone-300 uppercase tracking-wider mb-2">
              {isEnglish ? 'Budget:' : 'Ngân sách:'}
            </label>
            <select
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              className="w-full bg-stone-950 border border-stone-700 text-stone-100 text-xs rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-amber-500"
            >
              <option value="Tiết kiệm (Sinh viên)">{isEnglish ? 'Budget-friendly' : 'Tiết kiệm'}</option>
              <option value="Vừa phải (Phổ thông)">{isEnglish ? 'Moderate' : 'Vừa phải'}</option>
              <option value="Thoải mái (Cao cấp)">{isEnglish ? 'Comfortable' : 'Thoải mái'}</option>
            </select>
          </div>
        </div>

        {/* Real-time Weather Card for Destination */}
        <div className="pt-1" data-guide-id="itinerary.weatherCard" data-guide-type="ui">
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
          <label className="block text-xs font-semibold text-stone-300 uppercase tracking-wider mb-2">
            {isEnglish ? 'Interests & Priorities:' : 'Sở thích & Ưu tiên:'}
          </label>
          <div className="flex flex-wrap gap-2">
            {interestOptions.map((opt) => {
              const active = interests.includes(opt);
              return (
                <button
                  key={opt}
                  type="button"
                  onClick={() => handleToggleInterest(opt)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
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
          onClick={handleGenerate}
          disabled={loading}
          className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 hover:from-amber-500 hover:to-amber-400 text-[#FFFDF8] font-bold text-sm shadow-xl shadow-amber-900/40 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
        >
          {loading ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin text-[#FFFDF8]" />
              <span>{isEnglish ? 'AI is calculating and optimizing your route...' : 'AI đang tính toán cung đường & tối ưu hóa...'}</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-[#FFFDF8]" />
              <span>{isEnglish ? 'Generate Optimized Itinerary' : 'Tạo Lịch Trình Tối Ưu Tự Động'}</span>
            </>
          )}
        </button>

      </div>

      {/* Itinerary Result Display */}
      {itinerary && (
        <div className="bg-stone-900 border border-amber-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 animate-fadeIn">
          
          {/* Header */}
          <div className="flex flex-wrap items-start justify-between gap-4 border-b border-stone-800 pb-5">
            <div>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-semibold">
                {itinerary.duration} • {itinerary.destination}
              </span>
              <h3 className="text-xl sm:text-2xl font-serif font-bold text-stone-100 mt-2">
                {itinerary.title}
              </h3>
              <p className="text-xs text-stone-400 mt-1 flex items-center gap-1.5">
                <Car className="w-3.5 h-3.5 text-amber-400" />
                <span>{itinerary.routeSummary}</span>
              </p>
            </div>

            <button
              onClick={handleSaveItinerary}
              className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow ${
                saved 
                  ? 'bg-emerald-600 text-white' 
                  : 'bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700'
              }`}
            >
              {saved ? <Check className="w-3.5 h-3.5" /> : <Bookmark className="w-3.5 h-3.5 text-amber-400" />}
              <span>{saved ? (isEnglish ? 'Saved to collection' : 'Đã lưu vào bộ sưu tập') : (isEnglish ? 'Save this itinerary' : 'Lưu lịch trình này')}</span>
            </button>
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
          <div className="p-5 bg-amber-950/30 border border-amber-500/40 rounded-2xl space-y-2">
            <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>{isEnglish ? 'Why did AI arrange the itinerary this way?' : 'Vì sao AI sắp xếp lịch trình như vậy?'}</span>
            </h4>
            <p className="text-xs text-stone-300 leading-relaxed">
              {itinerary.aiOptimizationReasoning}
            </p>
          </div>

          {/* Timeline Route Slots */}
          <div className="space-y-4 pt-2">
            <h4 className="text-xs font-semibold text-stone-400 uppercase tracking-wider">
              {isEnglish ? 'Itinerary timeline:' : 'Chi tiết các mốc thời gian:'}
            </h4>

            <div className="relative pl-6 sm:pl-8 border-l-2 border-amber-500/30 space-y-6">
              {itinerary.slots.map((slot, idx) => (
                <div key={idx} className="relative group">
                  
                  {/* Timeline Dot */}
                  <div className="absolute -left-[31px] sm:-left-[39px] top-0 w-6 h-6 rounded-full bg-stone-950 border-2 border-amber-500 flex items-center justify-center text-[10px] font-bold text-amber-400">
                    {idx + 1}
                  </div>

                  {/* Slot Card */}
                  <div className="p-4 bg-stone-950 rounded-2xl border border-stone-800 hover:border-amber-500/40 transition-all space-y-2">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        {getActivityIcon(slot.activityType)}
                        <span className="text-xs font-bold text-amber-300">{slot.time}</span>
                        <span className="text-stone-500 text-xs">({slot.durationMinutes} {isEnglish ? 'min' : 'phút'})</span>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-stone-900 text-stone-300 border border-stone-800">
                        {slot.locationName}
                      </span>
                    </div>

                    <h5 className="font-serif font-bold text-stone-100 text-sm">{slot.title}</h5>
                    <p className="text-xs text-stone-300 leading-relaxed">{slot.description}</p>

                    {/* Time-of-Day Weather Guidance */}
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-stone-900/90 border border-stone-800/80 text-[11px] text-stone-300">
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
                      <div className="p-2 bg-stone-900/80 rounded-lg text-[11px] text-amber-200 border border-amber-500/20 flex items-center gap-1.5">
                        <Info className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span><strong>{isEnglish ? 'AI Tip:' : 'Mẹo AI:'}</strong> {slot.tip}</span>
                      </div>
                    )}

                    <div className="pt-2 flex justify-end">
                      <a
                        href={`https://maps.google.com/?q=${encodeURIComponent(slot.locationName + ' ' + itinerary.destination)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[11px] text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-medium"
                      >
                        <MapPin className="w-3 h-3 text-red-400" />
                        <span>{isEnglish ? 'Open directions in Google Maps' : 'Mở Google Maps chỉ đường'}</span>
                        <ExternalLink className="w-3 h-3 opacity-70" />
                      </a>
                    </div>
                  </div>

                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* Guest Authentication Requirement Modal */}
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
                {isEnglish ? 'Sign-in Required' : 'Tính năng yêu cầu Đăng nhập'}
              </span>
              <h3 className="text-xl font-serif font-bold text-stone-100 mt-2">
                {isEnglish ? 'Create an AI Smart Itinerary' : 'Tạo Lịch Trình Thông Minh AI'}
              </h3>
              <p className="text-xs text-stone-300 mt-2 leading-relaxed">
                {isEnglish ? <>Visitors can explore HỒN ĐẤT VIỆT freely. However, <strong className="text-amber-400">creating and saving AI itineraries</strong> requires signing in to personalize and sync your journey.</> : <>Khách tham quan có thể trải nghiệm tự do toàn bộ tính năng trên Hồn Đất Việt! Tuy nhiên, tính năng <strong className="text-amber-400">Tạo & Lưu Lịch trình AI</strong> yêu cầu đăng nhập tài khoản để cá nhân hóa và đồng bộ hành trình.</>}
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
                {isEnglish ? 'Explore other features' : 'Trải nghiệm tính năng khác'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
