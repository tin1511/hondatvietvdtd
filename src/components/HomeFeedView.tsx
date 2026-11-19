import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  Compass,
  Camera,
  Sparkles,
  CalendarDays,
  Award,
  Users,
  Globe,
  Volume2,
  VolumeX,
  ArrowDown,
  ArrowRight,
  ArrowUp,
  MapPin,
  CheckCircle2,
  Image as ImageIcon,
  Edit3,
  Search,
  Landmark,
  Shirt,
  Utensils,
  Palette,
  X,
  BookOpen,
  Eye,
  Video,
  Sun,
  Sunset,
  Moon,
} from 'lucide-react';
import { CityLandmarkBackground, HeritageAmbienceMode, HeritageItem, HomeBackgroundConfig, UserProfile } from '../types';
import { guideVoiceService, triggerGuideNarration } from '../services/guideVoiceService';
import { storageService, DEFAULT_HOME_BACKGROUNDS } from '../services/storageService';
import { loadHomeBackgroundsFromFirebase } from '../services/systemConfigService';
import { AdminBackgroundManagerModal } from './AdminBackgroundManagerModal';
import { DynamicHeritageBackground } from './DynamicHeritageBackground';

export interface HomeFeedViewProps {
  currentLandmark: CityLandmarkBackground;
  detectedLocationName: string;
  locationSource: 'gps' | 'preset' | 'default';
  isDetectingGps: boolean;
  onDetectGps: () => void;
  onOpenCityPicker: () => void;
  onNavigateTab: (tab: string) => void;
  onOpenStoryWithTopic: (topic: { name: string; history?: string; period?: string }) => void;
  onOpenHeritageDetail: (item: HeritageItem) => void;
  onOpenOfflineModal: () => void;
  currentUser?: UserProfile;
  onSelectLandmark?: (landmark: CityLandmarkBackground) => void;
  language?: string;
  isPeekingBackground?: boolean;
  onTogglePeekBackground?: (nextVal?: boolean) => void;
  isActiveTab?: boolean;
}

interface FullScreenFeatureData {
  id: string;
  indexNumber: number; // 1..7
  stepCode: string; // '01'..'07'
  categoryTag: string;
  categoryTagEn: string;
  title: string;
  titleEn: string;
  badgeText?: string;
  badgeTextEn?: string;
  badgeTone?: 'primary' | 'jade' | 'gold';
  description: string;
  descriptionEn: string;
  targetTab: string;
  guideId: string;
  webpImageUrl: string;
  fallbackImageUrl: string;
  dwellSpeech: string;
  dwellSpeechEn: string;
  highlights: readonly string[];
  highlightsEn: readonly string[];
  icon: React.ComponentType<{ className?: string }>;
}

const LANDMARK_EN_MAP: Record<string, string> = {
  'Đà Nẵng': 'Da Nang',
  'Hội An': 'Hoi An',
  'Hà Nội': 'Hanoi',
  'TP. Hồ Chí Minh': 'Ho Chi Minh City',
  'Thừa Thiên Huế': 'Thua Thien Hue',
  'Huế': 'Hue',
  'Quảng Nam': 'Quang Nam',
  'Quảng Nam (Mỹ Sơn)': 'Quang Nam (My Son)',
  'Hội An (Quảng Nam)': 'Hoi An (Quang Nam)',
  'Ninh Bình': 'Ninh Binh',
  'Quảng Ninh': 'Quang Ninh',
  'Lâm Đồng (Đà Lạt)': 'Lam Dong (Da Lat)',
  'Cần Thơ': 'Can Tho',
  'Quảng Bình': 'Quang Binh',
  'Hà Giang': 'Ha Giang',
  'Nha Trang (Khánh Hòa)': 'Nha Trang (Khanh Hoa)',
  'Kiên Giang (Phú Quốc)': 'Kien Giang (Phu Quoc)',
  'Lào Cai (Sa Pa)': 'Lao Cai (Sa Pa)',
  'Hải Phòng': 'Hai Phong',
  'Bà Rịa - Vũng Tàu': 'Ba Ria - Vung Tau',
  'Danh thắng Ngũ Hành Sơn · Ma Nhai · Biển Mỹ Khê': 'Marble Mountains · Ma Nhai Inscriptions · My Khe Beach',
  'Ngũ Hành Sơn, Ma Nhai & Biển Mỹ Khê': 'Marble Mountains, Ma Nhai Inscriptions & My Khe Beach',
  'Văn Miếu - Quốc Tử Giám & Hồ Gươm': 'Temple of Literature & Hoan Kiem Lake',
  'Dinh Độc Lập & Bến Bạch Đằng': 'Independence Palace & Bach Dang Wharf',
  'Đại Nội Cung Đình Huế & Sông Hương': 'Hue Imperial Citadel & Perfume River',
  'Phố Cổ Hội An & Cầu Vàng Bà Nà': 'Hoi An Ancient Town & Golden Bridge Ba Na',
  'Thánh Địa Mỹ Sơn & Tháp Chăm Cổ': 'My Son Sanctuary & Ancient Cham Towers',
  'Phố Cổ Hội An & Chùa Cầu': 'Hoi An Ancient Town & Japanese Covered Bridge',
  'Quần thể Danh thắng Tràng An & Tam Cốc': 'Trang An Landscape Complex & Tam Coc',
  'Vịnh Hạ Long & Quần đảo Cát Bà': 'Ha Long Bay & Cat Ba Archipelago',
  'Hồ Xuân Hương & Rừng thông Đà Lạt': 'Xuan Huong Lake & Da Lat Pine Forests',
  'Chợ nổi Cái Răng & Bến Ninh Kiều': 'Cai Rang Floating Market & Ninh Kieu Wharf',
  'Vườn Quốc gia Phong Nha - Kẻ Bàng': 'Phong Nha - Ke Bang National Park',
  'Cao nguyên đá Đồng Văn & Cột cờ Lũng Cú': 'Dong Van Karst Plateau & Lung Cu Flag Tower',
  'Tháp Bà Ponagar & Vịnh Biển Nha Trang': 'Ponagar Cham Towers & Nha Trang Bay',
  'Đảo Ngọc Phú Quốc & Bãi Sao': 'Phu Quoc Pearl Island & Sao Beach',
  'Đỉnh Fansipan & Thung lũng Mường Hoa': 'Fansipan Peak & Muong Hoa Valley',
  'Vịnh Lan Hạ & Quần đảo Cát Bà': 'Lan Ha Bay & Cat Ba Archipelago',
  'Tượng Chúa Kitô & Mũi Nghinh Phong': 'Christ of Vung Tau Statue & Nghinh Phong Cape',
};

function translateLandmarkText(text: string | undefined, isEn: boolean): string {
  if (!text) return '';
  if (!isEn) return text;
  if (LANDMARK_EN_MAP[text]) return LANDMARK_EN_MAP[text];
  let out = text;
  Object.entries(LANDMARK_EN_MAP).forEach(([vi, en]) => {
    if (out.includes(vi)) {
      out = out.replace(vi, en);
    }
  });
  return out;
}

const SPOKEN_REELS_SESSION_KEY = 'hdv_home_reels_spoken_v2';

function loadSpokenSectionIds(): Set<string> {
  try {
    const raw = sessionStorage.getItem(SPOKEN_REELS_SESSION_KEY);
    if (!raw) return new Set<string>();
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return new Set<string>(parsed.filter((x): x is string => typeof x === 'string'));
    }
    return new Set<string>();
  } catch {
    return new Set<string>();
  }
}

function saveSpokenSectionIds(set: Set<string>): void {
  try {
    sessionStorage.setItem(SPOKEN_REELS_SESSION_KEY, JSON.stringify(Array.from(set)));
  } catch {
    // Ignore storage errors
  }
}

/**
 * Hoa văn góc cổ truyền & họa tiết trống đồng tối giản (độ mờ thấp, không làm rối chữ)
 */
const HeritageCornerOrnament: React.FC = () => (
  <>
    <svg
      aria-hidden="true"
      viewBox="0 0 36 36"
      className="pointer-events-none absolute top-2.5 right-2.5 w-7 h-7 text-[var(--gold)] opacity-35"
    >
      <path
        d="M2 2 H24 V8 H8 V24 H2 Z M12 12 H22 V15 H15 V22 H12 Z"
        fill="currentColor"
      />
      <circle cx="28" cy="8" r="2" fill="currentColor" />
    </svg>
    <svg
      aria-hidden="true"
      viewBox="0 0 36 36"
      className="pointer-events-none absolute bottom-2.5 right-2.5 w-6 h-6 text-[var(--gold)] opacity-25 rotate-90"
    >
      <path d="M2 2 H20 V6 H6 V20 H2 Z" fill="currentColor" />
    </svg>
  </>
);

type QuickFilterCategory = 'all' | 'monument' | 'costume' | 'culinary' | 'craft';

const CURATED_QUICK_FILTER_HERITAGES: HeritageItem[] = [
  // CỔ PHỤC VIỆT NAM
  {
    id: 'quick-costume-nhat-binh',
    name: 'Áo Nhật Bình Cung Đình Huế',
    englishName: 'Hue Imperial Nhat Binh Robe',
    category: 'costume',
    categoryLabel: 'Cổ phục Cung đình',
    region: 'central',
    province: 'Thừa Thiên Huế',
    period: 'Triều Nguyễn (1802 – 1945)',
    dynasty: 'Nhà Nguyễn',
    history:
      'Áo Nhật Bình là thường phục cao quý của Hoàng hậu, Công chúa và mệnh phụ phu nhân triều Nguyễn, nổi bật với cổ áo hình chữ nhật thêu họa tiết loan phượng, bát bảo thếp vàng rực rỡ.',
    culturalSignificance:
      'Biểu tượng đỉnh cao của mỹ thuật thêu thùa cung đình Việt Nam, hiện được giới trẻ phục dựng và tôn vinh mạnh mẽ.',
    interestingFacts: [
      'Cổ áo khi ghép lại tạo thành hình chữ nhật trước ngực nên gọi là Nhật Bình.',
      'Hoa văn hình tròn (phượng ổ, loan ổ) phân biệt rõ cấp bậc trong nội cung.',
    ],
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/a/ab/Meridian_Gate%2C_Hue_%28I%29.jpg',
    verifiedStatus: 'verified',
    lat: 16.4698,
    lng: 107.5786,
    address: 'Đại Nội Huế, TP. Huế',
    googleMapsUri: 'https://maps.google.com/?q=Dai+Noi+Hue',
    tags: ['Cổ phục', 'Áo Nhật Bình', 'Triều Nguyễn', 'Huế'],
    suggestedQuestions: ['Ý nghĩa hoa văn trên áo Nhật Bình là gì?'],
  },
  {
    id: 'quick-costume-ao-tac',
    name: 'Áo Ngũ Thân Tay Chẽn & Áo Tấc',
    englishName: 'Five-Panel Traditional Ao Tac & Ao Ngu Than',
    category: 'costume',
    categoryLabel: 'Cổ phục Truyền thống',
    region: 'central',
    province: 'Đà Nẵng · Huế · Hội An',
    period: 'Thế kỷ XVIII – XX',
    dynasty: 'Chúa Nguyễn – Triều Nguyễn',
    history:
      'Áo Ngũ thân (gồm Áo Tấc tay rộng dùng trong lễ nghi và Áo Ngũ thân tay chẽn thường nhật) là tiền thân trực tiếp của Áo dài Việt Nam hiện đại, gồm 5 thân tượng trưng cho đạo lý Nhân – Nghĩa – Lễ – Trí – Tín.',
    culturalSignificance:
      'Quốc phục thể hiện phong thái khiêm nhường, kín đáo và tôn nghiêm của người Việt qua nhiều thế kỷ.',
    interestingFacts: [
      '5 chiếc cúc áo cài bên phải tượng trưng cho Ngũ thường.',
      'Tà áo khâu nối tinh tế ôm vừa vặn mà vẫn trang nhã.',
    ],
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/f/f3/PhoCoHoiAn.jpg',
    verifiedStatus: 'verified',
    lat: 15.8794,
    lng: 108.335,
    address: 'Phố cổ Hội An & Cố đô Huế',
    googleMapsUri: 'https://maps.google.com/?q=Hoi+An+Ancient+Town',
    tags: ['Cổ phục', 'Áo Tấc', 'Áo Ngũ Thân', 'Áo dài'],
    suggestedQuestions: ['Áo Ngũ thân có ý nghĩa triết lý gì?'],
  },
  {
    id: 'quick-costume-giao-linh',
    name: 'Áo Giao Lĩnh & Viên Lĩnh Đại Việt',
    englishName: 'Ancient Giao Linh Cross-Collar Robe',
    category: 'costume',
    categoryLabel: 'Cổ phục Thời Lý – Trần – Lê',
    region: 'north',
    province: 'Hà Nội',
    period: 'Thế kỷ XI – XVIII',
    dynasty: 'Thời Lý – Trần – Lê Trung Hưng',
    history:
      'Giao Lĩnh (áo cổ giao nhau bên phải) và Viên Lĩnh (áo cổ tròn) là trang phục phổ biến bậc nhất của vương triều và dân gian Đại Việt suốt thời Lý, Trần, Lê.',
    culturalSignificance:
      'Minh chứng sống động cho nền văn hiến rực rỡ và quy chế y phục độc lập của quốc gia Đại Việt.',
    interestingFacts: [
      'Thường kết hợp cùng thường (váy) hoặc quần lụa, thắt đai lưng trang trọng.',
    ],
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/3/31/Hanoi_Temple_of_Literature.jpg',
    verifiedStatus: 'verified',
    lat: 21.0285,
    lng: 105.8355,
    address: 'Hoàng thành Thăng Long, Hà Nội',
    googleMapsUri: 'https://maps.google.com/?q=Imperial+Citadel+of+Thang+Long',
    tags: ['Cổ phục', 'Giao Lĩnh', 'Viên Lĩnh', 'Đại Việt'],
    suggestedQuestions: ['Áo Giao Lĩnh khác gì so với Áo Ngũ thân?'],
  },
  // ẨM THỰC DI SẢN
  {
    id: 'quick-culinary-mi-quang-cao-lau',
    name: 'Mì Quảng & Cao Lầu Đà Nẵng – Hội An',
    englishName: 'Mi Quang & Hoi An Cao Lau Noodles',
    category: 'culinary',
    categoryLabel: 'Ẩm thực Di sản Miền Trung',
    region: 'central',
    province: 'Đà Nẵng',
    period: 'Thế kỷ XVII – Nay',
    history:
      'Mì Quảng đậm đà nước nhân tôm thịt, bánh tráng nướng giòn và Cao Lầu sợi vàng óng dùng nước giếng cổ Bá Lễ là linh hồn ẩm thực xứ Quảng – Đà Nẵng.',
    culturalSignificance:
      'Được công nhận là Di sản Văn hóa Phi vật thể Quốc gia (2024), kết tinh giao thương cảng thị quốc tế Hội An – Đà Nẵng.',
    interestingFacts: [
      'Nước dùng Mì Quảng gọi là "nước nhân", cô đặc thơm lừng củ nén và dầu phộng.',
    ],
    imageUrl: 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?auto=format&fit=crop&w=900&q=80',
    verifiedStatus: 'verified',
    lat: 16.0544,
    lng: 108.2022,
    address: 'Đà Nẵng & Phố cổ Hội An',
    googleMapsUri: 'https://maps.google.com/?q=Mi+Quang+Da+Nang',
    tags: ['Ẩm thực', 'Mì Quảng', 'Cao Lầu', 'Đà Nẵng'],
    suggestedQuestions: ['Vì sao Mì Quảng lại chan rất ít nước dùng?'],
  },
  {
    id: 'quick-culinary-pho-ha-noi',
    name: 'Phở Hà Nội & Văn Hóa Ẩm Thực Kinh Kỳ',
    englishName: 'Hanoi Traditional Pho Noodle Soup',
    category: 'culinary',
    categoryLabel: 'Ẩm thực Di sản Quốc gia',
    region: 'north',
    province: 'Hà Nội',
    period: 'Đầu thế kỷ XX – Nay',
    history:
      'Phở Hà Nội với nước dùng ninh xương trong vắt, thơm mùi thảo quả, quế hồi, gừng nướng và bánh phở mềm mượt là đại sứ ẩm thực Việt Nam trên toàn thế giới.',
    culturalSignificance:
      'Di sản văn hóa phi vật thể quốc gia, biểu tượng tinh tế của nghệ thuật ẩm thực đất Kinh kỳ.',
    interestingFacts: [
      'Thưởng thức cùng quẩy giòn, hành hoa chẻ và chút giấm tỏi ớt thanh tao.',
    ],
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/3/31/Hanoi_Temple_of_Literature.jpg',
    verifiedStatus: 'verified',
    lat: 21.0285,
    lng: 105.8542,
    address: 'Khu Phố cổ 36 Phố Phường, Hà Nội',
    googleMapsUri: 'https://maps.google.com/?q=Pho+Ha+Noi',
    tags: ['Ẩm thực', 'Phở Hà Nội', 'Di sản phi vật thể'],
    suggestedQuestions: ['Lịch sử hình thành món Phở Hà Nội như thế nào?'],
  },
  {
    id: 'quick-culinary-bun-bo-hue',
    name: 'Bún Bò Huế & Ẩm Thực Cung Đình',
    englishName: 'Hue Royal Spicy Beef Noodle Soup',
    category: 'culinary',
    categoryLabel: 'Ẩm thực Cố đô Huế',
    region: 'central',
    province: 'Thừa Thiên Huế',
    period: 'Thế kỷ XVII – Nay',
    history:
      'Bún bò Huế nổi tiếng với vị sả thơm nồng, ruốc Huế đậm đà, giò heo và thịt bắp bò hầm mềm, phản ánh sự cầu kỳ trong văn hóa ẩm thực đất Thần Kinh.',
    culturalSignificance:
      'Tinh hoa ẩm thực miền Trung kết hợp hài hòa giữa vị cay, ngọt thanh từ xương và hương sả ruốc đặc trưng.',
    interestingFacts: [
      'Làng bún Vân Cù (Huế) có truyền thống hàng trăm năm làm sợi bún thủ công.',
    ],
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/a/ab/Meridian_Gate%2C_Hue_%28I%29.jpg',
    verifiedStatus: 'verified',
    lat: 16.4637,
    lng: 107.5909,
    address: 'TP. Huế, Thừa Thiên Huế',
    googleMapsUri: 'https://maps.google.com/?q=Bun+Bo+Hue',
    tags: ['Ẩm thực', 'Bún bò Huế', 'Ẩm thực Cung đình'],
    suggestedQuestions: ['Bí quyết nấu nước dùng Bún bò Huế chuẩn vị là gì?'],
  },
];

/**
 * ĐÚNG 7 TÍNH NĂNG THEO THỨ TỰ MENU HIỆN TẠI (KHÔNG THÊM BỚT)
 */
export const HOME_FULLSCREEN_FEATURES: readonly FullScreenFeatureData[] = [
  {
    id: 'feature-01-map',
    indexNumber: 1,
    stepCode: '01',
    categoryTag: 'TÍNH NĂNG 01 · KHÔNG GIAN ĐỊA LÝ',
    categoryTagEn: 'FEATURE 01 · GEOGRAPHICAL SPACE',
    title: 'Bản đồ (Chữ S VN)',
    titleEn: 'Heritage Map (S-Shape VN)',
    badgeText: 'Chữ S VN',
    badgeTextEn: 'S-Shape VN',
    badgeTone: 'jade',
    description:
      'Bản đồ di sản 34 tỉnh thành cùng quần đảo Hoàng Sa & Trường Sa, tích hợp định vị GPS và chạm trực tiếp vào từng tỉnh để nghe thuyết minh.',
    descriptionEn:
      'Interactive heritage map of all 34 provinces plus the Hoang Sa & Truong Sa archipelagos, with live GPS positioning and voice narration on tap.',
    targetTab: 'map',
    guideId: 'nav.map',
    webpImageUrl:
      'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?auto=format&fit=crop&w=2000&q=90&fm=webp',
    fallbackImageUrl:
      'https://upload.wikimedia.org/wikipedia/commons/a/ab/Meridian_Gate%2C_Hue_%28I%29.jpg',
    dwellSpeech:
      'Đây là Bản đồ Chữ S Việt Nam với 34 tỉnh thành cùng Hoàng Sa và Trường Sa. Bạn hãy bấm Mở ngay để chạm vào từng tỉnh nghe mình thuyết minh nhé!',
    dwellSpeechEn:
      'This is the S-Shaped Map of Vietnam featuring 34 provinces along with Hoang Sa and Truong Sa. Tap Open Now to touch any province and hear my voice narration!',
    highlights: ['34 Tỉnh thành', 'Ngũ Hành Sơn · Ma Nhai · Mỹ Khê', 'Định vị GPS & Thuyết minh'],
    highlightsEn: ['34 Provinces', 'Marble Mountains · Ma Nhai · My Khe', 'GPS & Voice Narration'],
    icon: Globe,
  },
  {
    id: 'feature-02-recognizer',
    indexNumber: 2,
    stepCode: '02',
    categoryTag: 'TÍNH NĂNG 02 · THỊ GIÁC NHÂN TẠO',
    categoryTagEn: 'FEATURE 02 · COMPUTER VISION',
    title: 'Nhận diện AI (Vision)',
    titleEn: 'AI Vision Recognition',
    badgeText: 'Vision',
    badgeTextEn: 'Vision',
    badgeTone: 'primary',
    description:
      'Chụp hoặc tải ảnh lên để AI nhận diện tức thì di tích lịch sử, cổ phục, món ăn truyền thống và vật phẩm văn hoá Việt Nam.',
    descriptionEn:
      'Snap or upload a photo for AI to instantly identify historical monuments, traditional costumes, local delicacies, and cultural artifacts.',
    targetTab: 'recognizer',
    guideId: 'nav.recognize',
    webpImageUrl:
      'https://images.unsplash.com/photo-1583417319070-4a69db38a482?auto=format&fit=crop&w=2000&q=90&fm=webp',
    fallbackImageUrl:
      'https://upload.wikimedia.org/wikipedia/commons/3/31/Hanoi_Temple_of_Literature.jpg',
    dwellSpeech:
      'Với Nhận diện AI Vision, bạn chỉ cần chụp hoặc tải ảnh di tích, cổ phục hay món ăn là biết ngay tên gọi và lịch sử hình thành.',
    dwellSpeechEn:
      'With AI Vision Recognition, simply snap or upload a photo of a monument, traditional costume, or dish to discover its name and historical origins.',
    highlights: ['Quét ảnh di tích', 'Nhận diện cổ phục & món ăn', 'Phân tích niên đại'],
    highlightsEn: ['Scan Monuments', 'Identify Costumes & Cuisine', 'Historical Period Analysis'],
    icon: Camera,
  },
  {
    id: 'feature-03-storyteller',
    indexNumber: 3,
    stepCode: '03',
    categoryTag: 'TÍNH NĂNG 03 · THUYẾT MINH LỊCH SỬ',
    categoryTagEn: 'FEATURE 03 · HISTORICAL NARRATION',
    title: 'Kể chuyện AI',
    titleEn: 'AI Storyteller',
    description:
      'Lắng nghe AI kể lại những câu chuyện lịch sử hào hùng, điển tích và truyền thuyết dân gian gắn liền với từng địa danh đất Việt.',
    descriptionEn:
      'Listen to expressive AI storytelling recounting heroic history, royal anecdotes, and folk legends tied to iconic Vietnamese landmarks.',
    targetTab: 'storyteller',
    guideId: 'nav.story',
    webpImageUrl:
      'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=2000&q=90&fm=webp',
    fallbackImageUrl:
      'https://upload.wikimedia.org/wikipedia/commons/f/f3/PhoCoHoiAn.jpg',
    dwellSpeech:
      'Ở mục Kể chuyện AI, bạn sẽ được lắng nghe những câu chuyện lịch sử và truyền thuyết hấp dẫn gắn với từng vùng đất Việt Nam.',
    dwellSpeechEn:
      'In AI Storyteller, you can listen to captivating historical tales and folk legends connected to every region of Vietnam.',
    highlights: ['Truyền thuyết địa danh', 'Giọng kể truyền cảm', 'Tùy chỉnh theo lứa tuổi'],
    highlightsEn: ['Landmark Legends', 'Expressive Voice Narration', 'Tailored by Audience'],
    icon: Sparkles,
  },
  {
    id: 'feature-04-itinerary',
    indexNumber: 4,
    stepCode: '04',
    categoryTag: 'TÍNH NĂNG 04 · DU LỊCH THÔNG MINH',
    categoryTagEn: 'FEATURE 04 · SMART TRAVEL PLANNER',
    title: 'Lịch trình',
    titleEn: 'Smart Itinerary',
    description:
      'Gợi ý hành trình tham quan di sản, làng nghề và ẩm thực bản địa được cá nhân hoá theo sở thích, thời gian và ngân sách của bạn.',
    descriptionEn:
      'Personalized cultural itineraries combining heritage sites, craft villages, and local cuisine tailored to your time, interests, and budget.',
    targetTab: 'itinerary',
    guideId: 'nav.itinerary',
    webpImageUrl:
      'https://images.unsplash.com/photo-1509030450996-dd1a26dda07a?auto=format&fit=crop&w=2000&q=90&fm=webp',
    fallbackImageUrl:
      'https://upload.wikimedia.org/wikipedia/commons/3/31/Hanoi_Temple_of_Literature.jpg',
    dwellSpeech:
      'Tính năng Lịch trình sẽ tự động gợi ý hành trình tham quan di sản phù hợp nhất với thời gian và sở thích của bạn.',
    dwellSpeechEn:
      'Smart Itinerary automatically builds the best heritage tour route tailored to your schedule and preferences.',
    highlights: ['Gợi ý theo sở thích', 'Lịch trình Sáng – Chiều – Tối', 'Tối ưu cung đường'],
    highlightsEn: ['Tailored to Interests', 'Morning – Afternoon – Evening', 'Optimized Routes'],
    icon: CalendarDays,
  },
  {
    id: 'feature-05-learning',
    indexNumber: 5,
    stepCode: '05',
    categoryTag: 'TÍNH NĂNG 05 · TƯƠNG TÁC TRI THỨC',
    categoryTagEn: 'FEATURE 05 · INTERACTIVE KNOWLEDGE',
    title: 'Quiz & Lịch sử',
    titleEn: 'Quiz & History',
    description:
      'Thử sức với những câu đố văn hoá thú vị và khám phá kho tàng kiến thức lịch sử Việt Nam qua từng thời kỳ dựng nước và giữ nước.',
    descriptionEn:
      'Challenge yourself with engaging cultural quizzes and explore Vietnamese history across dynasties and eras of nation-building.',
    targetTab: 'learning',
    guideId: 'nav.learning',
    webpImageUrl:
      'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&w=2000&q=90&fm=webp',
    fallbackImageUrl:
      'https://upload.wikimedia.org/wikipedia/commons/a/ab/Meridian_Gate%2C_Hue_%28I%29.jpg',
    dwellSpeech:
      'Hãy vào mục Quiz và Lịch sử để thử tài đố vui văn hóa và khám phá dòng thời gian các triều đại Việt Nam nhé!',
    dwellSpeechEn:
      'Visit Quiz & History to test your cultural trivia and explore the timeline of Vietnamese dynasties!',
    highlights: ['Câu đố văn hoá', 'Dòng thời gian lịch sử', 'Tích lũy điểm thưởng'],
    highlightsEn: ['Cultural Quizzes', 'Historical Timeline', 'Earn Bonus XP'],
    icon: Award,
  },
  {
    id: 'feature-06-profile',
    indexNumber: 6,
    stepCode: '06',
    categoryTag: 'TÍNH NĂNG 06 · THÀNH TỰU CÁ NHÂN',
    categoryTagEn: 'FEATURE 06 · PERSONAL ACHIEVEMENTS',
    title: 'Hồ sơ & Danh hiệu (XP)',
    titleEn: 'Profile & Badges (XP)',
    badgeText: 'XP',
    badgeTextEn: 'XP',
    badgeTone: 'gold',
    description:
      'Theo dõi điểm kinh nghiệm XP, mở khoá bộ sưu tập huy hiệu di sản cao quý và nâng cấp độ người dùng qua từng chuyến khám phá.',
    descriptionEn:
      'Track your cultural XP points, unlock prestigious heritage badges, and level up your Cultural Ambassador rank as you explore.',
    targetTab: 'profile',
    guideId: 'nav.profile',
    webpImageUrl:
      'https://images.unsplash.com/photo-1540611025311-01df3cef54b5?auto=format&fit=crop&w=2000&q=90&fm=webp',
    fallbackImageUrl:
      'https://upload.wikimedia.org/wikipedia/commons/f/f3/PhoCoHoiAn.jpg',
    dwellSpeech:
      'Mọi hoạt động khám phá của bạn đều được tích lũy điểm kinh nghiệm XP và mở khóa huy hiệu tại mục Hồ sơ và Danh hiệu.',
    dwellSpeechEn:
      'All your exploration activities earn XP points and unlock prestigious badges in Profile & Badges.',
    highlights: ['Điểm kinh nghiệm XP', 'Huy hiệu di sản', 'Cấp độ sứ giả văn hoá'],
    highlightsEn: ['Cultural XP Points', 'Heritage Badges', 'Ambassador Ranks'],
    icon: Award,
  },
  {
    id: 'feature-07-community',
    indexNumber: 7,
    stepCode: '07',
    categoryTag: 'TÍNH NĂNG 07 · KẾT NỐI DI SẢN',
    categoryTagEn: 'FEATURE 07 · HERITAGE COMMUNITY',
    title: 'Cộng đồng',
    titleEn: 'Community',
    description:
      'Không gian chia sẻ hình ảnh, câu chuyện di sản và trò chuyện kết nối cùng cộng đồng những người yêu văn hoá Việt Nam.',
    descriptionEn:
      'A vibrant space to share photos, heritage stories, and connect with fellow lovers of Vietnamese culture around the world.',
    targetTab: 'community',
    guideId: 'nav.community',
    webpImageUrl:
      'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?auto=format&fit=crop&w=2000&q=90&fm=webp',
    fallbackImageUrl:
      'https://upload.wikimedia.org/wikipedia/commons/a/ab/Meridian_Gate%2C_Hue_%28I%29.jpg',
    dwellSpeech:
      'Cuối cùng là Cộng đồng, nơi bạn có thể chia sẻ hình ảnh, câu chuyện và trò chuyện cùng những người yêu di sản khắp mọi miền.',
    dwellSpeechEn:
      'Finally, Community is where you can share photos, stories, and connect with heritage enthusiasts everywhere.',
    highlights: ['Chia sẻ ảnh & ký ức', 'Đóng góp tư liệu', 'Kết nối người yêu di sản'],
    highlightsEn: ['Share Photos & Memories', 'Contribute Archives', 'Connect with Enthusiasts'],
    icon: Users,
  },
];

interface FullScreenFeatureSectionProps {
  feature: FullScreenFeatureData;
  totalCount: number;
  shouldPreload: boolean;
  customImageUrl?: string;
  customVideoUrl?: string;
  customSubtitle?: string;
  customOverlayOpacity?: number;
  ambienceMode?: HeritageAmbienceMode;
  enableDynamicEffects?: boolean;
  isAdmin?: boolean;
  language?: string;
  onAdminEditBackground?: (sectionId: string) => void;
  onOpenFeature: (feature: FullScreenFeatureData) => void;
  onBecomeActive: (indexNumber: number) => void;
  onDwellTrigger: (feature: FullScreenFeatureData) => void;
  onScrollToIndex: (indexNumber: number) => void;
  isPeekingBackground?: boolean;
  onTogglePeekBackground?: (nextVal?: boolean) => void;
}

const FullScreenFeatureSection: React.FC<FullScreenFeatureSectionProps> = React.memo(
  ({
    feature,
    totalCount,
    isAdmin,
    language = 'vi',
    onAdminEditBackground,
    onOpenFeature,
    onBecomeActive,
    onDwellTrigger,
    onScrollToIndex,
    isPeekingBackground = false,
    onTogglePeekBackground,
  }) => {
    const isEn = language === 'en';
    const sectionRef = useRef<HTMLElement | null>(null);
    const [isEntered, setIsEntered] = useState<boolean>(feature.indexNumber === 1);

    // 1. IntersectionObserver cho Hiệu ứng hiện thẻ mượt mà khi cuộn tới (< 300ms)
    useEffect(() => {
      const el = sectionRef.current;
      if (!el || typeof IntersectionObserver === 'undefined') {
        setIsEntered(true);
        return;
      }

      const activeObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting && entry.intersectionRatio >= 0.55) {
              setIsEntered(true);
              onBecomeActive(feature.indexNumber);
            }
          });
        },
        { threshold: [0.55] }
      );

      activeObserver.observe(el);

      return () => {
        activeObserver.disconnect();
      };
    }, [feature.indexNumber, onBecomeActive]);

    // 2. IntersectionObserver phát hiện dừng lại 2-3 giây (2.2s) để nhân vật 3D giới thiệu 1 lần
    useEffect(() => {
      const el = sectionRef.current;
      if (!el || typeof IntersectionObserver === 'undefined') return;

      let dwellTimer: number | null = null;

      const dwellObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            const isFocused = entry.isIntersecting && entry.intersectionRatio >= 0.65;
            if (isFocused) {
              if (dwellTimer === null) {
                dwellTimer = window.setTimeout(() => {
                  onDwellTrigger(feature);
                }, 2200);
              }
            } else if (dwellTimer !== null) {
              window.clearTimeout(dwellTimer);
              dwellTimer = null;
            }
          });
        },
        { threshold: [0, 0.3, 0.65, 0.9] }
      );

      dwellObserver.observe(el);

      return () => {
        if (dwellTimer !== null) {
          window.clearTimeout(dwellTimer);
        }
        dwellObserver.disconnect();
      };
    }, [feature, onDwellTrigger]);

    const Icon = feature.icon;
    const isMapOrDaNang = feature.indexNumber === 1;

    return (
      <section
        ref={sectionRef}
        id={`home-feature-section-${feature.indexNumber}`}
        data-feature-index={feature.indexNumber}
        onClick={() => {
          if (isPeekingBackground && onTogglePeekBackground) {
            onTogglePeekBackground(false);
          }
        }}
        title={
          isPeekingBackground
            ? isEn
              ? 'Tap anywhere to show interface'
              : 'Chạm vào màn hình để hiện lại giao diện'
            : undefined
        }
        className={`relative w-full h-[100dvh] min-h-[100dvh] snap-start snap-always overflow-hidden flex flex-col justify-end select-none bg-transparent ${
          isPeekingBackground ? 'cursor-pointer' : ''
        }`}
      >
        {/* Vùng nội dung an toàn nổi trên nền Video cố định: ẩn mượt 100% khi người dùng bật chế độ Ngắm video nền */}
        <div
          className={`relative z-10 w-full max-w-6xl mx-auto px-3 sm:px-8 pt-14 md:pt-28 pb-20 sm:pb-24 flex flex-col justify-end h-full transition-all duration-300 ${
            isPeekingBackground
              ? 'opacity-0 pointer-events-none scale-95 invisible'
              : 'opacity-100 pointer-events-auto scale-100'
          }`}
        >
          {/* Thẻ nội dung nền --surface (#FFFDF8) nửa trong suốt, gọn gàng trên mobile để thấy rõ video nền danh thắng */}
          <div
            className={`relative max-w-2xl sm:mr-28 p-3.5 sm:p-7 rounded-2xl sm:rounded-3xl bg-[#FFFDF8]/92 backdrop-blur-md border border-[var(--gold)] shadow-[0_12px_34px_rgba(59,42,32,0.2)] transition-[transform,opacity] duration-250 ease-out will-change-[transform,opacity] ${
              isEntered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
          >
            <HeritageCornerOrnament />

            {/* Nhãn nhỏ phía trên + Chỉ báo tiến trình X/7 + Nút Admin đổi video/ảnh nền */}
            <div className="flex flex-wrap items-center justify-between gap-1.5 sm:gap-2 mb-2 sm:mb-3">
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                <span className="inline-flex items-center gap-1 px-2 sm:px-3 py-0.5 sm:py-1 rounded-lg bg-[#FBF3E4] border border-[var(--gold)] text-[var(--primary)] font-mono text-[10px] sm:text-sm font-bold tracking-wider uppercase">
                  <Icon className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[var(--gold)] shrink-0" />
                  <span>{isEn ? feature.categoryTagEn : feature.categoryTag}</span>
                </span>

                {(isEn ? feature.badgeTextEn || feature.badgeText : feature.badgeText) && (
                  <span
                    className={`px-2 py-0.5 sm:py-1 rounded-lg font-mono text-[10px] sm:text-xs font-extrabold ${
                      feature.badgeTone === 'jade'
                        ? 'bg-[var(--jade)] text-[#FFFDF8]'
                        : feature.badgeTone === 'gold'
                        ? 'bg-[#FBF3E4] border border-[var(--gold)] text-[var(--text)]'
                        : 'bg-[var(--primary)] text-[#FFFDF8]'
                    }`}
                  >
                    {isEn ? feature.badgeTextEn || feature.badgeText : feature.badgeText}
                  </span>
                )}

                <span className="px-2 py-0.5 sm:py-1 rounded-lg bg-[#FBF3E4] border border-[var(--gold)]/70 text-[var(--text)] font-mono text-[10px] sm:text-xs font-extrabold">
                  {feature.indexNumber}/{totalCount}
                </span>
              </div>

              {isAdmin && onAdminEditBackground && (
                <button
                  type="button"
                  onClick={() => onAdminEditBackground('hero')}
                  className="px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-xl bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-[#FFFDF8] border border-[var(--gold)] font-bold text-[11px] sm:text-xs inline-flex items-center gap-1 shadow-md transition-all cursor-pointer active:scale-95"
                  title={
                    isEn
                      ? 'Change global background video (Admin)'
                      : 'Đổi video nền toàn trang (Admin)'
                  }
                >
                  <Video className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                  <span>{isEn ? 'Edit Video Bg' : 'Đổi Video nền'}</span>
                </button>
              )}
            </div>

            {/* Tiêu đề lớn kiểu serif trang trọng, vừa vặn trên mobile */}
            <h2 className="text-xl sm:text-4xl md:text-5xl font-serif font-bold text-[var(--primary)] tracking-tight leading-tight mb-1.5 sm:mb-2.5">
              {isEn ? feature.titleEn : feature.title}
            </h2>

            {/* Đường kẻ trang trí vàng đồng mảnh */}
            <div className="hdv-gold-divider my-1.5 sm:my-2.5" />

            {/* Mô tả ngắn 2 dòng trên mobile, chữ chính --text (#3B2A20) */}
            <p className="text-[var(--text)] text-xs sm:text-base md:text-lg leading-snug sm:leading-relaxed line-clamp-2 sm:line-clamp-3 mb-2.5 sm:mb-4 font-medium">
              {isEn ? feature.descriptionEn : feature.description}
            </p>

            {/* Điểm nhấn ngắn gọn phân cách bằng dấu chấm giữa */}
            <div
              className={`flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] sm:text-sm font-bold mb-3 sm:mb-5 ${
                isMapOrDaNang ? 'text-[var(--jade)]' : 'text-[var(--text-muted)]'
              }`}
            >
              {(isEn ? feature.highlightsEn : feature.highlights).map((hl, idx) => (
                <React.Fragment key={hl}>
                  {idx > 0 && <span aria-hidden="true" className="text-[var(--gold)]">·</span>}
                  <span>{hl}</span>
                </React.Fragment>
              ))}
            </div>

            {/* Cụm nút hành động "Mở ngay" đỏ son (#B3261E) + Nút cuộn tiếp nằm gọn trên 1 hàng */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-3.5 pr-16 sm:pr-0">
              <button
                type="button"
                data-guide-id={feature.guideId}
                onClick={() => onOpenFeature(feature)}
                className="min-h-[40px] sm:min-h-[48px] px-4 sm:px-7 py-2 sm:py-3 rounded-xl sm:rounded-2xl bg-[var(--primary)] hover:bg-[var(--primary-hover)] active:scale-[0.98] text-[#FFFDF8] font-extrabold text-xs sm:text-base inline-flex items-center gap-1.5 sm:gap-2 shadow-[0_6px_18px_rgba(179,38,30,0.28)] border border-[var(--gold)] transition-all duration-150 cursor-pointer"
              >
                <span>{isEn ? 'Open Now' : 'Mở ngay'}</span>
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5]" />
              </button>

              {feature.indexNumber < totalCount ? (
                <button
                  type="button"
                  onClick={() => onScrollToIndex(feature.indexNumber + 1)}
                  className="min-h-[40px] sm:min-h-[48px] px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl bg-[#FBF3E4] hover:bg-[#F3E5CD] border border-[var(--gold)] text-[var(--text)] text-[11px] sm:text-sm font-bold inline-flex items-center gap-1 sm:gap-1.5 transition-colors cursor-pointer"
                >
                  <span>
                    {isEn
                      ? `Next (${feature.indexNumber + 1}/7)`
                      : `Tiếp (${feature.indexNumber + 1}/7)`}
                  </span>
                  <ArrowDown className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[var(--primary)]" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => onScrollToIndex(totalCount + 1)}
                  className="min-h-[40px] sm:min-h-[48px] px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl bg-[#FBF3E4] hover:bg-[#F3E5CD] border border-[var(--gold)] text-[var(--text)] text-[11px] sm:text-sm font-bold inline-flex items-center gap-1 sm:gap-1.5 transition-colors cursor-pointer"
                >
                  <span>{isEn ? 'Summary' : 'Tổng kết'}</span>
                  <ArrowDown className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[var(--primary)]" />
                </button>
              )}

              {onTogglePeekBackground && (
                <button
                  type="button"
                  onClick={() => onTogglePeekBackground(true)}
                  title={
                    isEn
                      ? 'Hide interface to admire the full-screen background photo'
                      : 'Ẩn giao diện để chiêm ngưỡng trọn vẹn ảnh nền danh thắng'
                  }
                  className="min-h-[40px] sm:min-h-[48px] px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl bg-[#FBF3E4] hover:bg-[#F3E5CD] border border-[var(--gold)] text-[var(--jade)] text-[11px] sm:text-sm font-bold inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[var(--jade)]" />
                  <span>{isEn ? 'View Bg' : 'Ngắm ảnh nền'}</span>
                </button>
              )}
            </div>

            {/* Thanh chấm chỉ báo tiến trình (1/7 .. 7/7) ngay phía dưới nút */}
            <div
              role="navigation"
              aria-label={isEn ? '7-feature progress indicator' : 'Chỉ báo tiến trình 7 tính năng'}
              className="mt-2.5 sm:mt-4 inline-flex items-center gap-1.5 sm:gap-2 px-2.5 py-1 rounded-xl bg-[#FBF3E4] border border-[var(--gold)]/75"
            >
              <span className="text-[10px] sm:text-[11px] font-mono font-extrabold text-[var(--primary)] mr-0.5">
                {feature.indexNumber}/{totalCount}
              </span>
              {HOME_FULLSCREEN_FEATURES.map((item) => {
                const isCurrent = item.indexNumber === feature.indexNumber;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => onScrollToIndex(item.indexNumber)}
                    aria-label={
                      isEn
                        ? `Go to feature ${item.indexNumber}: ${item.titleEn}`
                        : `Chuyển tới tính năng ${item.indexNumber}: ${item.title}`
                    }
                    className="p-0.5 sm:p-1 cursor-pointer flex items-center justify-center"
                  >
                    <span
                      className={`block rounded-full transition-all duration-200 ${
                        isCurrent
                          ? 'w-5 sm:w-6 h-1.5 sm:h-2 bg-[var(--primary)] ring-1 ring-[var(--gold)]'
                          : 'w-1.5 sm:w-2 h-1.5 sm:h-2 bg-[#C8963E]/55 hover:bg-[var(--primary)]/70'
                      }`}
                    />
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>
    );
  }
);

FullScreenFeatureSection.displayName = 'FullScreenFeatureSection';

export const HomeFeedView: React.FC<HomeFeedViewProps> = ({
  currentLandmark,
  detectedLocationName,
  onOpenCityPicker,
  onNavigateTab,
  onOpenStoryWithTopic,
  onOpenHeritageDetail,
  currentUser,
  onSelectLandmark,
  language = 'vi',
  isPeekingBackground = false,
  onTogglePeekBackground,
  isActiveTab = true,
}) => {
  const isEn = language === 'en';
  const spokenIdsRef = useRef<Set<string>>(loadSpokenSectionIds());
  const [activeFeatureIdx, setActiveFeatureIdx] = useState<number>(0); // 0 = Hero, 1..7 = Features, 8 = Summary
  const [isMuted, setIsMuted] = useState<boolean>(() => guideVoiceService.isMuted());
  const [homeBgConfig, setHomeBgConfig] = useState<HomeBackgroundConfig>(() =>
    storageService.getHomeBackgroundConfig()
  );
  const [isBgManagerOpen, setIsBgManagerOpen] = useState<boolean>(false);
  const [editingBgSectionId, setEditingBgSectionId] = useState<string>('hero');

  // State cho Thanh Bộ Lọc Nhanh (Cổ phục, Ẩm thực, Di tích, Làng nghề) ở đầu trang Home
  const [selectedQuickFilter, setSelectedQuickFilter] = useState<QuickFilterCategory>('all');
  const [quickSearchQuery, setQuickSearchQuery] = useState<string>('');
  const [allHeritages, setAllHeritages] = useState<HeritageItem[]>(() =>
    storageService.getHeritages()
  );

  useEffect(() => {
    setAllHeritages(storageService.getHeritages());
  }, []);

  const quickFilteredItems = useMemo(() => {
    const combinedMap = new Map<string, HeritageItem>();
    allHeritages.forEach((item) => combinedMap.set(item.id, item));
    CURATED_QUICK_FILTER_HERITAGES.forEach((item) => {
      if (!combinedMap.has(item.id)) {
        combinedMap.set(item.id, item);
      }
    });
    const combined = Array.from(combinedMap.values());

    const q = quickSearchQuery.trim().toLowerCase();
    const hasFilterOrSearch = selectedQuickFilter !== 'all' || q.length > 0;
    if (!hasFilterOrSearch) return [];

    return combined
      .filter((item) => {
        if (selectedQuickFilter === 'monument') {
          const isMonument = [
            'monument',
            'temple',
            'citadel',
            'palace',
            'tomb',
            'ancient_house',
            'architecture',
            'scenic_landscape',
            'cultural_site',
          ].includes(item.category);
          if (!isMonument) return false;
        } else if (selectedQuickFilter === 'costume') {
          const textBlob = `${item.name} ${item.categoryLabel} ${(item.tags || []).join(' ')}`.toLowerCase();
          const isCostume =
            item.category === 'costume' ||
            textBlob.includes('cổ phục') ||
            textBlob.includes('nhật bình') ||
            textBlob.includes('áo dài') ||
            textBlob.includes('áo tấc') ||
            textBlob.includes('giao lĩnh') ||
            textBlob.includes('trang phục');
          if (!isCostume) return false;
        } else if (selectedQuickFilter === 'culinary') {
          const textBlob = `${item.name} ${item.categoryLabel} ${(item.tags || []).join(' ')}`.toLowerCase();
          const isFood =
            item.category === 'culinary' ||
            textBlob.includes('ẩm thực') ||
            textBlob.includes('mì quảng') ||
            textBlob.includes('phở') ||
            textBlob.includes('bún bò') ||
            textBlob.includes('đặc sản');
          if (!isFood) return false;
        } else if (selectedQuickFilter === 'craft') {
          const isCraft = ['craft_village', 'folk_art', 'instrument', 'artifact'].includes(
            item.category
          );
          if (!isCraft) return false;
        }

        if (q.length > 0) {
          const searchable = `${item.name} ${item.englishName || ''} ${item.province} ${item.categoryLabel} ${item.period} ${(item.tags || []).join(' ')}`.toLowerCase();
          return searchable.includes(q);
        }
        return true;
      })
      .slice(0, 8);
  }, [allHeritages, selectedQuickFilter, quickSearchQuery]);

  const effectiveUser = currentUser || storageService.getCurrentUser();
  const isAdmin = Boolean(effectiveUser?.isLoggedIn && effectiveUser?.role === 'admin');

  const resolveHeroImage = useCallback(
    (cfg: HomeBackgroundConfig, landmark?: CityLandmarkBackground): string => {
      const heroOverride = cfg.sections?.['hero']?.imageUrl;
      if (
        cfg.useCustomHeroBackground &&
        heroOverride &&
        heroOverride.trim() &&
        !heroOverride.startsWith('/images/danang/')
      ) {
        return heroOverride;
      }
      if (
        landmark?.imageUrl &&
        landmark.imageUrl.trim() &&
        !landmark.imageUrl.startsWith('/images/danang/')
      ) {
        return landmark.imageUrl;
      }
      if (heroOverride && heroOverride.trim() && !heroOverride.startsWith('/images/danang/')) {
        return heroOverride;
      }
      return DEFAULT_HOME_BACKGROUNDS.sections['hero'].imageUrl;
    },
    []
  );

  const [heroImgSrc, setHeroImgSrc] = useState<string>(() =>
    resolveHeroImage(storageService.getHomeBackgroundConfig(), currentLandmark)
  );

  const heroRef = useRef<HTMLElement | null>(null);
  const summaryRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    setHeroImgSrc(resolveHeroImage(homeBgConfig, currentLandmark));
  }, [currentLandmark, homeBgConfig, resolveHeroImage]);

  useEffect(() => {
    loadHomeBackgroundsFromFirebase().then((remoteCfg) => {
      if (remoteCfg) {
        setHomeBgConfig(remoteCfg);
      }
    });

    const handleBgUpdated = (e: Event) => {
      const custom = e as CustomEvent<HomeBackgroundConfig>;
      const nextCfg = custom.detail || storageService.getHomeBackgroundConfig();
      setHomeBgConfig(nextCfg);
    };

    window.addEventListener('home-backgrounds-updated', handleBgUpdated);
    return () => window.removeEventListener('home-backgrounds-updated', handleBgUpdated);
  }, []);

  // Đồng bộ trạng thái tắt tiếng với nhân vật 3D
  useEffect(() => {
    const handleMuteSynced = (e: Event) => {
      const custom = e as CustomEvent<{ muted: boolean }>;
      if (typeof custom.detail?.muted === 'boolean') {
        setIsMuted(custom.detail.muted);
      }
    };
    window.addEventListener('hdv_guide_mute_synced', handleMuteSynced);
    return () => window.removeEventListener('hdv_guide_mute_synced', handleMuteSynced);
  }, []);

  // Theo dõi khi người dùng đang ở màn hình Hero hoặc màn hình Tổng kết cuối trang
  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return;
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.55) {
            if (entry.target === heroRef.current) {
              setActiveFeatureIdx(0);
            } else if (entry.target === summaryRef.current) {
              setActiveFeatureIdx(8);
            }
          }
        });
      },
      { threshold: [0.55] }
    );
    if (heroRef.current) obs.observe(heroRef.current);
    if (summaryRef.current) obs.observe(summaryRef.current);
    return () => obs.disconnect();
  }, []);

  const handleToggleMute = useCallback(() => {
    guideVoiceService.unlockAudioOnUserGesture();
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    window.dispatchEvent(
      new CustomEvent('hdv_guide_toggle_mute', { detail: { muted: nextMuted } })
    );
  }, [isMuted]);

  const scrollToSlideIndex = useCallback((targetIdx: number) => {
    guideVoiceService.unlockAudioOnUserGesture();
    if (targetIdx === 0 && heroRef.current) {
      heroRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }
    if (targetIdx >= 1 && targetIdx <= HOME_FULLSCREEN_FEATURES.length) {
      const el = document.getElementById(`home-feature-section-${targetIdx}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      return;
    }
    if (targetIdx > HOME_FULLSCREEN_FEATURES.length && summaryRef.current) {
      summaryRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  const handleOpenFeature = useCallback(
    (feature: FullScreenFeatureData) => {
      guideVoiceService.unlockAudioOnUserGesture();
      onNavigateTab(feature.targetTab);
    },
    [onNavigateTab]
  );

  // Reset danh sách phần đã đọc khi người dùng đổi ngôn ngữ VI <-> EN để nhân vật 3D có thể thuyết minh bằng ngôn ngữ mới
  useEffect(() => {
    spokenIdsRef.current.clear();
  }, [isEn]);

  // Khi người dùng dừng lại ở một tính năng 2-3 giây -> Nhân vật 3D nói một câu giới thiệu ngắn (chỉ 1 lần cho mỗi phần)
  const handleFeatureDwellNarration = useCallback(
    (feature: FullScreenFeatureData) => {
      if (isMuted || guideVoiceService.isMuted()) return;
      if (spokenIdsRef.current.has(feature.id)) return;

      spokenIdsRef.current.add(feature.id);
      saveSpokenSectionIds(spokenIdsRef.current);

      triggerGuideNarration({
        id: `home-reel-dwell-${feature.id}`,
        title: `${feature.stepCode}/07 · ${isEn ? feature.titleEn : feature.title}`,
        introText: isEn ? feature.dwellSpeechEn : feature.dwellSpeech,
        targetType: 'heritage',
        lang: isEn ? 'en' : 'vi',
      });
    },
    [isMuted, isEn]
  );

  const displayCityName = translateLandmarkText(detectedLocationName, isEn);
  const displayLandmarkName = translateLandmarkText(currentLandmark?.landmarkName, isEn);

  return (
    <div className="relative w-full text-[var(--text)]">
      {/* =====================================================================
          VIDEO NỀN TOÀN MÀN HÌNH CỐ ĐỊNH DUY NHẤT (FIXED 100vw x 100dvh)
          Vừa khít khung hình trình duyệt & chạy lặp đi lặp lại xuyên suốt 7 tính năng
         ===================================================================== */}
      <div className="fixed top-0 left-0 w-screen h-[100dvh] z-0 pointer-events-none overflow-hidden">
        <DynamicHeritageBackground
          imageUrl={heroImgSrc}
          videoUrl={
            homeBgConfig.sections?.['hero']?.mediaType === 'image' &&
            !homeBgConfig.sections?.['hero']?.videoUrl
              ? undefined
              : homeBgConfig.sections?.['hero']?.videoUrl ||
                currentLandmark?.videoUrl ||
                '/assets/aistudio/hue_imperial_hd_clean.mp4'
          }
          alt={displayLandmarkName || 'Hồn Đất Việt'}
          overlayOpacity={homeBgConfig.sections?.['hero']?.overlayOpacity ?? 0.34}
          isPeeking={isPeekingBackground}
          shouldLoad={true}
          isActiveTab={isActiveTab}
          priority="high"
          ambienceMode={homeBgConfig.ambienceMode || 'auto'}
          enableDynamicEffects={homeBgConfig.enableDynamicEffects ?? true}
          fallbackImageUrl="/assets/aistudio/hue_imperial_poster_hd.jpg"
        />
      </div>

      {/* Thanh chỉ báo tiến trình dọc cố định bên trái trên màn hình lớn (1/7 .. 7/7) */}
      {activeFeatureIdx >= 1 && activeFeatureIdx <= 7 && !isPeekingBackground && (
        <aside
          aria-label={isEn ? 'Feature progress' : 'Tiến trình tính năng'}
          className="hidden lg:flex fixed left-5 top-1/2 -translate-y-1/2 z-30 flex-col items-center gap-2.5 bg-[#FFFDF8]/95 backdrop-blur-md border border-[var(--gold)] rounded-2xl py-3.5 px-2.5 shadow-[0_10px_28px_rgba(59,42,32,0.18)]"
        >
          <span className="text-[11px] font-mono font-extrabold text-[var(--primary)]">
            {activeFeatureIdx}/7
          </span>
          <div className="flex flex-col items-center gap-2">
            {HOME_FULLSCREEN_FEATURES.map((f) => {
              const isCurrent = f.indexNumber === activeFeatureIdx;
              const label = isEn ? f.titleEn : f.title;
              return (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => scrollToSlideIndex(f.indexNumber)}
                  title={`${f.stepCode}. ${label}`}
                  aria-label={isEn ? `Go to ${label}` : `Đi tới ${label}`}
                  className="p-0.5 cursor-pointer"
                >
                  <span
                    className={`block rounded-full transition-all duration-200 ${
                      isCurrent
                        ? 'w-2.5 h-6 bg-[var(--primary)] ring-1 ring-[var(--gold)]'
                        : 'w-2 h-2 bg-[#C8963E]/60 hover:bg-[var(--primary)]'
                    }`}
                  />
                </button>
              );
            })}
          </div>
          <button
            type="button"
            onClick={handleToggleMute}
            title={
              isEn
                ? isMuted
                  ? 'Unmute 3D Guide'
                  : 'Mute 3D Guide'
                : isMuted
                ? 'Bật tiếng HDV 3D'
                : 'Tắt tiếng HDV 3D'
            }
            aria-label={
              isEn
                ? isMuted
                  ? 'Unmute 3D Guide'
                  : 'Mute 3D Guide'
                : isMuted
                ? 'Bật tiếng HDV 3D'
                : 'Tắt tiếng HDV 3D'
            }
            className={`mt-1 w-8 h-8 rounded-xl border flex items-center justify-center transition-colors cursor-pointer ${
              isMuted
                ? 'bg-[#FCEAE8] border-[var(--primary)] text-[var(--primary)]'
                : 'bg-[#FBF3E4] border-[var(--gold)] text-[var(--jade)] hover:bg-[#F3E5CD]'
            }`}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </aside>
      )}

      {/* =====================================================================
          MÀN HÌNH 0 (HERO): 100dvh, Tên HỒN ĐẤT VIỆT, câu giới thiệu văn hóa,
          nút "Bắt đầu khám phá" cuộn xuống Tính năng 01 trên nền Video cố định
         ===================================================================== */}
      <section
        ref={heroRef}
        id="home-hero-section"
        onClick={() => {
          if (isPeekingBackground && onTogglePeekBackground) {
            onTogglePeekBackground(false);
          }
        }}
        title={
          isPeekingBackground
            ? isEn
              ? 'Tap anywhere to show interface'
              : 'Chạm vào màn hình để hiện lại giao diện'
            : undefined
        }
        className={`relative w-full h-[100dvh] min-h-[100dvh] snap-start snap-always overflow-hidden flex items-center justify-center bg-transparent select-none ${
          isPeekingBackground ? 'cursor-pointer' : ''
        }`}
      >

        <div
          className={`relative z-10 w-full max-w-4xl mx-auto px-3 sm:px-6 pt-14 md:pt-28 pb-16 md:pb-14 text-center flex flex-col justify-center max-h-[100dvh] overflow-y-auto no-scrollbar transition-all duration-300 ${
            isPeekingBackground
              ? 'opacity-0 pointer-events-none scale-95 invisible'
              : 'opacity-100 pointer-events-auto scale-100'
          }`}
        >
          {/* =================================================================
              THANH BỘ LỌC NHANH VĂN HÓA (DI TÍCH · CỔ PHỤC · ẨM THỰC · LÀNG NGHỀ)
              Đặt ngay đầu trang Home giúp người dùng mobile lọc & tìm kiếm tức thì
             ================================================================= */}
          <div
            id="home-quick-cultural-filter-bar"
            className="mb-2.5 sm:mb-3.5 p-2.5 sm:p-3.5 rounded-2xl bg-[#FFFDF8]/95 backdrop-blur-md border border-[var(--gold)] shadow-[0_10px_28px_rgba(59,42,32,0.18)] text-left"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              {/* Ô tìm kiếm nhanh */}
              <div className="relative flex-1 min-w-0">
                <Search className="w-3.5 h-3.5 text-[var(--primary)] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={quickSearchQuery}
                  onChange={(e) => setQuickSearchQuery(e.target.value)}
                  placeholder={
                    isEn
                      ? 'Quick search monuments, royal costumes, cuisine...'
                      : 'Tìm nhanh di tích, cổ phục, ẩm thực, tỉnh thành...'
                  }
                  className="w-full pl-8 pr-7 py-1.5 sm:py-2 rounded-xl bg-[#FBF3E4] border border-[var(--gold)]/80 focus:border-[var(--primary)] focus:outline-none text-xs text-[var(--text)] placeholder:text-[var(--text-muted)] font-medium"
                />
                {(quickSearchQuery || selectedQuickFilter !== 'all') && (
                  <button
                    type="button"
                    onClick={() => {
                      setQuickSearchQuery('');
                      setSelectedQuickFilter('all');
                    }}
                    title={isEn ? 'Clear filter' : 'Xóa bộ lọc'}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-full text-[var(--text-muted)] hover:text-[var(--primary)] cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Các nút lọc nhanh loại hình văn hóa (Cổ phục, Ẩm thực, Di tích, Làng nghề) */}
              <div
                role="group"
                aria-label={isEn ? 'Quick cultural category filter' : 'Bộ lọc nhanh loại hình văn hóa'}
                className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-0.5 sm:pb-0 shrink-0"
              >
                {(
                  [
                    {
                      id: 'monument' as const,
                      label: isEn ? 'Monuments' : 'Di tích',
                      icon: Landmark,
                    },
                    {
                      id: 'costume' as const,
                      label: isEn ? 'Costumes' : 'Cổ phục',
                      icon: Shirt,
                    },
                    {
                      id: 'culinary' as const,
                      label: isEn ? 'Cuisine' : 'Ẩm thực',
                      icon: Utensils,
                    },
                    {
                      id: 'craft' as const,
                      label: isEn ? 'Craft Villages' : 'Làng nghề',
                      icon: Palette,
                    },
                  ] as const
                ).map((cat) => {
                  const CatIcon = cat.icon;
                  const isSelected = selectedQuickFilter === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => {
                        guideVoiceService.unlockAudioOnUserGesture();
                        setSelectedQuickFilter((prev) => (prev === cat.id ? 'all' : cat.id));
                      }}
                      className={`min-h-[34px] px-2.5 sm:px-3 py-1 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 whitespace-nowrap transition-all cursor-pointer shrink-0 border ${
                        isSelected
                          ? 'bg-[var(--primary)] text-[#FFFDF8] border-[var(--gold)] shadow-[0_3px_10px_rgba(179,38,30,0.28)]'
                          : 'bg-[#FBF3E4] hover:bg-[#F3E5CD] text-[var(--text)] border-[var(--gold)]/80'
                      }`}
                    >
                      <CatIcon
                        className={`w-3.5 h-3.5 shrink-0 ${
                          isSelected ? 'text-[#FFFDF8]' : 'text-[var(--primary)]'
                        }`}
                      />
                      <span>{cat.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Ngăn hiển thị kết quả tức thì khi người dùng chọn bộ lọc (Di tích / Cổ phục / Ẩm thực / Làng nghề) hoặc gõ từ khóa */}
            {(selectedQuickFilter !== 'all' || quickSearchQuery.trim().length > 0) && (
              <div className="mt-2.5 pt-2.5 border-t border-[var(--gold)]/45 animate-fadeIn">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[11px] font-bold text-[var(--primary)]">
                    {quickFilteredItems.length > 0
                      ? isEn
                        ? `Found ${quickFilteredItems.length} cultural highlights`
                        : `Gợi ý nhanh (${quickFilteredItems.length} mục phù hợp)`
                      : isEn
                      ? 'No matching items found'
                      : 'Không tìm thấy mục phù hợp'}
                  </span>
                  <div className="flex items-center gap-2">
                    {selectedQuickFilter === 'culinary' && (
                      <button
                        type="button"
                        onClick={() => onNavigateTab('food')}
                        className="text-[11px] font-extrabold text-[var(--jade)] hover:underline inline-flex items-center gap-1 cursor-pointer"
                      >
                        <span>{isEn ? 'Open Full Cuisine Space' : 'Mở chuyên trang Ẩm thực'}</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    )}
                    {selectedQuickFilter === 'monument' && (
                      <button
                        type="button"
                        onClick={() => onNavigateTab('map')}
                        className="text-[11px] font-extrabold text-[var(--jade)] hover:underline inline-flex items-center gap-1 cursor-pointer"
                      >
                        <span>{isEn ? 'Open Heritage Map' : 'Xem trên Bản đồ Di sản'}</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    )}
                    {selectedQuickFilter === 'costume' && (
                      <button
                        type="button"
                        onClick={() => onNavigateTab('recognizer')}
                        className="text-[11px] font-extrabold text-[var(--jade)] hover:underline inline-flex items-center gap-1 cursor-pointer"
                      >
                        <span>{isEn ? 'Scan Costume with AI' : 'Quét ảnh Cổ phục bằng AI'}</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    )}
                    {selectedQuickFilter === 'craft' && (
                      <button
                        type="button"
                        onClick={() => onNavigateTab('crafts')}
                        className="text-[11px] font-extrabold text-[var(--jade)] hover:underline inline-flex items-center gap-1 cursor-pointer"
                      >
                        <span>{isEn ? 'Open Craft Villages' : 'Mở trang Làng nghề'}</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>

                {quickFilteredItems.length > 0 && (
                  <div className="flex gap-2.5 overflow-x-auto pb-1 scrollbar-none">
                    {quickFilteredItems.map((item) => (
                      <div
                        key={item.id}
                        className="w-60 sm:w-64 shrink-0 p-2.5 rounded-xl bg-[#FBF3E4] border border-[var(--gold)]/80 hover:border-[var(--primary)] transition-all flex flex-col justify-between gap-2 shadow-xs"
                      >
                        <div
                          onClick={() => onOpenHeritageDetail(item)}
                          className="flex items-start gap-2.5 cursor-pointer group"
                        >
                          <img
                            src={item.imageUrl}
                            alt={item.name}
                            referrerPolicy="no-referrer"
                            onError={(e) => {
                              e.currentTarget.src =
                                'https://upload.wikimedia.org/wikipedia/commons/a/ab/Meridian_Gate%2C_Hue_%28I%29.jpg';
                            }}
                            className="w-12 h-12 rounded-lg object-cover border border-[var(--gold)] shrink-0"
                          />
                          <div className="min-w-0 flex-1">
                            <p className="text-[10px] text-[var(--jade)] font-bold truncate">
                              {item.province} · {item.categoryLabel}
                            </p>
                            <h4 className="text-xs font-serif font-bold text-[var(--text)] group-hover:text-[var(--primary)] line-clamp-1">
                              {isEn && item.englishName ? item.englishName : item.name}
                            </h4>
                            <p className="text-[10.5px] text-[var(--text-muted)] line-clamp-1 mt-0.5">
                              {item.history}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between gap-1.5 pt-1 border-t border-[var(--gold)]/35">
                          <button
                            type="button"
                            onClick={() => onOpenHeritageDetail(item)}
                            className="flex-1 py-1 px-2 rounded-lg bg-[var(--primary)] text-[#FFFDF8] text-[10.5px] font-bold text-center hover:bg-[var(--primary-hover)] transition-colors cursor-pointer"
                          >
                            {isEn ? 'View Details' : 'Xem chi tiết'}
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              onOpenStoryWithTopic({
                                name: item.name,
                                history: item.history,
                                period: item.period,
                              })
                            }
                            className="py-1 px-2 rounded-lg bg-[var(--surface)] border border-[var(--gold)] text-[var(--text)] hover:text-[var(--primary)] text-[10.5px] font-bold inline-flex items-center gap-1 transition-colors cursor-pointer"
                            title={isEn ? 'Listen to AI story' : 'Nghe kể chuyện lịch sử'}
                          >
                            <BookOpen className="w-3 h-3 text-[var(--primary)]" />
                            <span>{isEn ? 'Story' : 'Kể chuyện'}</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="relative p-3.5 sm:p-7 rounded-2xl sm:rounded-3xl bg-[#FFFDF8]/92 backdrop-blur-md border border-[var(--gold)] shadow-[0_14px_38px_rgba(59,42,32,0.2)]">
            <HeritageCornerOrnament />

            {/* Thanh công cụ Admin chỉnh ảnh nền trực tiếp trên trang chủ */}
            {isAdmin && (
              <div className="mb-2 sm:mb-4 pb-2 sm:pb-3 border-b border-[var(--gold)]/45 flex flex-wrap items-center justify-center gap-1.5 sm:gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setEditingBgSectionId('hero');
                    setIsBgManagerOpen(true);
                  }}
                  className="px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-xl bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-[#FFFDF8] border border-[var(--gold)] font-bold text-[11px] sm:text-xs inline-flex items-center gap-1 shadow-md transition-all cursor-pointer active:scale-95"
                >
                  <Edit3 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                  <span>{isEn ? 'Edit Hero Bg' : 'Đổi nền Hero'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setEditingBgSectionId('feature-01-map');
                    setIsBgManagerOpen(true);
                  }}
                  className="px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-xl bg-[var(--jade)] hover:bg-[#236B6B] text-[#FFFDF8] border border-[var(--gold)] font-bold text-[11px] sm:text-xs inline-flex items-center gap-1 shadow-md transition-all cursor-pointer active:scale-95"
                >
                  <ImageIcon className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                  <span>
                    {isEn ? 'Manage All Backgrounds' : 'Quản lý tất cả ảnh nền'}
                  </span>
                </button>
              </div>
            )}

            <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 mb-2 sm:mb-3 text-[10px] sm:text-xs text-[var(--text-muted)] font-bold">
              <span className="text-[var(--primary)] tracking-wider uppercase">
                {isEn ? 'VIETNAM DIGITAL HERITAGE SPACE' : 'KHÔNG GIAN DI SẢN SỐ VIỆT NAM'}
              </span>
              <span aria-hidden="true" className="hidden sm:inline text-[var(--gold)]">·</span>
              <button
                type="button"
                onClick={onOpenCityPicker}
                className="min-h-[30px] sm:min-h-[36px] max-w-full px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-xl bg-[#FBF3E4] hover:bg-[#F3E5CD] border border-[var(--gold)] text-[var(--jade)] font-bold inline-flex items-center gap-1 transition-colors cursor-pointer"
              >
                <MapPin className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[var(--jade)] shrink-0" />
                <span className="truncate text-[11px] sm:text-xs">
                  {displayCityName} — {displayLandmarkName}
                </span>
              </button>

              {/* Nút chuyển nhanh sắc thái không gian (Bình minh / Hoàng hôn / Đêm hoa đăng) & Gắn Video Nền */}
              <div className="inline-flex items-center gap-1 p-0.5 rounded-xl bg-[#FBF3E4] border border-[var(--gold)]/80">
                {(
                  [
                    { id: 'dawn' as const, label: isEn ? 'Dawn' : 'Bình minh', icon: Sun },
                    { id: 'sunset' as const, label: isEn ? 'Sunset' : 'Hoàng hôn', icon: Sunset },
                    { id: 'lantern' as const, label: isEn ? 'Lantern' : 'Hoa đăng', icon: Moon },
                  ] as const
                ).map((amb) => {
                  const AmbIcon = amb.icon;
                  const currentAmb = homeBgConfig.ambienceMode || 'auto';
                  const isActive = currentAmb === amb.id;
                  return (
                    <button
                      key={amb.id}
                      type="button"
                      onClick={() => {
                        const nextMode: HeritageAmbienceMode = isActive ? 'auto' : amb.id;
                        const nextCfg = storageService.saveHomeBackgroundConfig({
                          ...homeBgConfig,
                          ambienceMode: nextMode,
                        });
                        setHomeBgConfig(nextCfg);
                      }}
                      title={
                        isEn
                          ? `Switch background ambience: ${amb.label}`
                          : `Đổi sắc thái cảnh sắc nền: ${amb.label}`
                      }
                      className={`px-2 py-1 rounded-lg text-[10px] sm:text-[11px] font-bold inline-flex items-center gap-1 transition-all cursor-pointer ${
                        isActive
                          ? 'bg-[var(--primary)] text-[#FFFDF8] shadow-xs'
                          : 'text-[var(--text)] hover:bg-[#F3E5CD]'
                      }`}
                    >
                      <AmbIcon className="w-3 h-3 shrink-0" />
                      <span className="hidden sm:inline">{amb.label}</span>
                    </button>
                  );
                })}
                <button
                  type="button"
                  onClick={() => {
                    setEditingBgSectionId('hero');
                    setIsBgManagerOpen(true);
                  }}
                  title={
                    isEn
                      ? 'Attach Video or Change Background'
                      : 'Gắn Video nền (.mp4 / YouTube) hoặc đổi ảnh nền'
                  }
                  className="px-2 py-1 rounded-lg text-[10px] sm:text-[11px] font-bold inline-flex items-center gap-1 bg-[var(--jade)] hover:bg-[#236B6B] text-[#FFFDF8] transition-all cursor-pointer"
                >
                  <Video className="w-3 h-3 shrink-0" />
                  <span>{isEn ? 'Video Bg' : 'Gắn Video'}</span>
                </button>
              </div>
            </div>

            <h1 className="text-2xl sm:text-5xl md:text-6xl font-serif font-bold tracking-tight text-[var(--text)] mb-1.5 sm:mb-2.5">
              HỒN ĐẤT <span className="text-[var(--primary)]">VIỆT</span>
            </h1>

            <div className="hdv-gold-divider max-w-xs sm:max-w-md mx-auto my-1.5 sm:my-2.5" />

            <p className="max-w-2xl mx-auto text-xs sm:text-lg text-[var(--text)] font-serif italic leading-snug sm:leading-relaxed line-clamp-2 sm:line-clamp-none mb-3 sm:mb-5">
              {isEn
                ? '“Listen to the heartbeat of a thousand years of civilization — explore 7 cultural spaces across 34 provinces of Vietnam.”'
                : '“Lắng nghe nhịp đập ngàn năm văn hiến — chạm vào 7 không gian trải nghiệm di sản, lịch sử và văn hoá Việt Nam.”'}
            </p>

            <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3.5">
              <button
                type="button"
                onClick={() => scrollToSlideIndex(1)}
                className="min-h-[40px] sm:min-h-[50px] px-4 sm:px-7 py-2 sm:py-3 rounded-xl sm:rounded-2xl bg-[var(--primary)] hover:bg-[var(--primary-hover)] active:scale-[0.98] text-[#FFFDF8] font-extrabold text-xs sm:text-base inline-flex items-center gap-1.5 sm:gap-2 shadow-[0_6px_20px_rgba(179,38,30,0.3)] border border-[var(--gold)] transition-all duration-150 cursor-pointer"
              >
                <span>{isEn ? 'Start Exploring' : 'Bắt đầu khám phá'}</span>
                <ArrowDown className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5]" />
              </button>

              <button
                type="button"
                onClick={handleToggleMute}
                aria-label={
                  isEn
                    ? isMuted
                      ? 'Unmute 3D Tour Guide'
                      : 'Mute 3D Tour Guide'
                    : isMuted
                    ? 'Bật tiếng Hướng dẫn viên 3D'
                    : 'Tắt tiếng Hướng dẫn viên 3D'
                }
                className={`min-h-[40px] sm:min-h-[50px] px-3.5 sm:px-5 py-2 sm:py-3 rounded-xl sm:rounded-2xl border font-bold text-xs sm:text-base inline-flex items-center gap-1.5 sm:gap-2 transition-colors cursor-pointer ${
                  isMuted
                    ? 'bg-[#FCEAE8] border-[var(--primary)] text-[var(--primary)] hover:bg-[#F8D8D4]'
                    : 'bg-[#FBF3E4] border-[var(--gold)] text-[var(--text)] hover:bg-[#F3E5CD]'
                }`}
              >
                {isMuted ? (
                  <>
                    <VolumeX className="w-4 h-4 sm:w-5 sm:h-5 text-[var(--primary)]" />
                    <span>{isEn ? '3D Guide: Muted' : 'Tắt tiếng HDV 3D'}</span>
                  </>
                ) : (
                  <>
                    <Volume2 className="w-4 h-4 sm:w-5 sm:h-5 text-[var(--jade)]" />
                    <span>{isEn ? 'Auto Narration: On' : 'Tự thuyết minh: Bật'}</span>
                  </>
                )}
              </button>

              {onTogglePeekBackground && (
                <button
                  type="button"
                  onClick={() => onTogglePeekBackground(true)}
                  title={
                    isEn
                      ? 'Hide interface to admire the full-screen background photo'
                      : 'Ẩn giao diện để chiêm ngưỡng trọn vẹn bức ảnh nền danh thắng'
                  }
                  className="min-h-[40px] sm:min-h-[50px] px-3.5 sm:px-5 py-2 sm:py-3 rounded-xl sm:rounded-2xl bg-[#FBF3E4] hover:bg-[#F3E5CD] border border-[var(--gold)] text-[var(--jade)] font-bold text-xs sm:text-base inline-flex items-center gap-1.5 sm:gap-2 transition-colors cursor-pointer"
                >
                  <Eye className="w-4 h-4 sm:w-5 sm:h-5 text-[var(--jade)]" />
                  <span>{isEn ? 'View Background' : 'Ngắm ảnh nền'}</span>
                </button>
              )}
            </div>

            {/* BAO QUÁT NHANH 7 TÍNH NĂNG CỐT LÕI NGAY TRÊN MÀN HÌNH ĐẦU (DỄ NHÌN BAO QUÁT TRÊN MOBILE & DESKTOP) */}
            <div className="mt-3.5 sm:mt-5 pt-2.5 sm:pt-3.5 border-t border-[var(--gold)]/45">
              <div className="flex items-center justify-between gap-2 mb-2 px-0.5">
                <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-[var(--primary)]">
                  {isEn ? 'Quick Overview · 7 Heritage Spaces' : 'Bao quát 7 không gian trải nghiệm'}
                </span>
                <span className="text-[10px] sm:text-[11px] text-[var(--text-muted)]">
                  {isEn ? 'Tap to open or swipe down' : 'Chạm mở ngay hoặc vuốt xuống'}
                </span>
              </div>
              <div className="grid grid-cols-4 sm:grid-cols-7 gap-1.5 sm:gap-2">
                {HOME_FULLSCREEN_FEATURES.map((item) => {
                  const ItemIcon = item.icon;
                  const shortLabel = isEn
                    ? item.indexNumber === 1
                      ? 'Map'
                      : item.indexNumber === 2
                      ? 'AI Vision'
                      : item.indexNumber === 3
                      ? 'Stories'
                      : item.indexNumber === 4
                      ? 'Itinerary'
                      : item.indexNumber === 5
                      ? 'Quiz'
                      : item.indexNumber === 6
                      ? 'Profile'
                      : 'Community'
                    : item.indexNumber === 1
                    ? 'Bản đồ'
                    : item.indexNumber === 2
                    ? 'Nhận diện'
                    : item.indexNumber === 3
                    ? 'Kể chuyện'
                    : item.indexNumber === 4
                    ? 'Lịch trình'
                    : item.indexNumber === 5
                    ? 'Quiz & Sử'
                    : item.indexNumber === 6
                    ? 'Hồ sơ XP'
                    : 'Cộng đồng';
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleOpenFeature(item)}
                      className="group p-1.5 sm:p-2 rounded-xl bg-[#FBF3E4]/95 hover:bg-[var(--primary)] text-[var(--text)] hover:text-[#FFFDF8] border border-[var(--gold)]/75 transition-all flex flex-col items-center justify-center gap-1 cursor-pointer active:scale-95 shadow-xs"
                      title={isEn ? item.titleEn : item.title}
                    >
                      <div className="flex items-center gap-0.5">
                        <span className="text-[9px] font-mono font-bold text-[var(--primary)] group-hover:text-[#FFFDF8]/90">
                          {item.stepCode}
                        </span>
                        <ItemIcon className="w-3.5 h-3.5 text-[var(--primary)] group-hover:text-[#FFFDF8]" />
                      </div>
                      <span className="text-[10px] sm:text-[11px] font-bold leading-tight truncate w-full text-center">
                        {shortLabel}
                      </span>
                    </button>
                  );
                })}
                {/* Ô thứ 8 trên mobile (grid-cols-4 x 2 hàng = 8 ô cân đối): Xem Tổng kết */}
                <button
                  type="button"
                  onClick={() => scrollToSlideIndex(8)}
                  className="sm:hidden p-1.5 rounded-xl bg-[var(--jade)]/15 hover:bg-[var(--jade)] text-[var(--jade)] hover:text-[#FFFDF8] border border-[var(--jade)]/50 transition-all flex flex-col items-center justify-center gap-1 cursor-pointer active:scale-95"
                >
                  <Compass className="w-3.5 h-3.5" />
                  <span className="text-[10px] font-bold leading-tight truncate w-full text-center">
                    {isEn ? 'All 7/7' : 'Tổng hợp'}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          7 PHẦN TÍNH NĂNG FULL-SCREEN (100dvh, scroll-snap)
         ===================================================================== */}
      {HOME_FULLSCREEN_FEATURES.map((feature) => {
        const secOverride = homeBgConfig.sections?.[feature.id];
        return (
          <FullScreenFeatureSection
            key={feature.id}
            feature={feature}
            totalCount={HOME_FULLSCREEN_FEATURES.length}
            shouldPreload={Math.abs(feature.indexNumber - activeFeatureIdx) <= 1}
            customImageUrl={secOverride?.imageUrl}
            customVideoUrl={secOverride?.videoUrl}
            customSubtitle={secOverride?.subtitle}
            customOverlayOpacity={secOverride?.overlayOpacity}
            ambienceMode={homeBgConfig.ambienceMode || 'auto'}
            enableDynamicEffects={homeBgConfig.enableDynamicEffects ?? true}
            isAdmin={isAdmin}
            language={language}
            onAdminEditBackground={(sectionId) => {
              setEditingBgSectionId(sectionId);
              setIsBgManagerOpen(true);
            }}
            onOpenFeature={handleOpenFeature}
            onBecomeActive={setActiveFeatureIdx}
            onDwellTrigger={handleFeatureDwellNarration}
            onScrollToIndex={scrollToSlideIndex}
            isPeekingBackground={isPeekingBackground}
            onTogglePeekBackground={onTogglePeekBackground}
          />
        );
      })}

      {/* =====================================================================
          MÀN HÌNH CUỐI (TỔNG KẾT & LỐI TẮT TỚI CẢ 7 TÍNH NĂNG): 100dvh trên nền Video cố định
         ===================================================================== */}
      <section
        ref={summaryRef}
        id="home-summary-section"
        onClick={() => {
          if (isPeekingBackground && onTogglePeekBackground) {
            onTogglePeekBackground(false);
          }
        }}
        className={`relative w-full h-[100dvh] min-h-[100dvh] snap-start snap-always overflow-hidden flex flex-col justify-center bg-transparent select-none ${
          isPeekingBackground ? 'cursor-pointer' : ''
        }`}
      >
        <div
          className={`relative z-10 w-full max-w-5xl mx-auto px-3 sm:px-8 pt-14 md:pt-28 pb-20 sm:pr-28 flex flex-col justify-center max-h-[100dvh] overflow-y-auto no-scrollbar transition-all duration-300 ${
            isPeekingBackground
              ? 'opacity-0 pointer-events-none scale-95 invisible'
              : 'opacity-100 pointer-events-auto scale-100'
          }`}
        >
          <div className="relative p-4 sm:p-7 rounded-2xl sm:rounded-3xl bg-[#FFFDF8]/92 backdrop-blur-md border border-[var(--gold)] shadow-[0_14px_38px_rgba(59,42,32,0.2)]">
            <HeritageCornerOrnament />
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-xs font-mono font-bold uppercase tracking-widest text-[var(--primary)]">
                {isEn ? 'JOURNEY SUMMARY · 7/7 FEATURES' : 'TỔNG KẾT HÀNH TRÌNH · 7/7 TÍNH NĂNG'}
              </span>
              <button
                type="button"
                onClick={() => scrollToSlideIndex(0)}
                className="min-h-[44px] px-3.5 py-1.5 rounded-xl bg-[var(--surface)] hover:bg-[#F3E5CD] border border-[var(--gold)] text-[var(--text)] text-xs font-bold inline-flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
              >
                <ArrowUp className="w-3.5 h-3.5 text-[var(--primary)]" />
                <span>{isEn ? 'Back to Top' : 'Lên đầu trang'}</span>
              </button>
            </div>

            <h2 className="text-2xl sm:text-4xl font-serif font-bold text-[var(--text)] mb-2">
              {isEn ? (
                <>
                  Explore All 7 Features of <span className="text-[var(--primary)]">HỒN ĐẤT VIỆT</span>
                </>
              ) : (
                <>
                  Khám phá ngay 7 tính năng <span className="text-[var(--primary)]">HỒN ĐẤT VIỆT</span>
                </>
              )}
            </h2>
            <p className="text-[var(--text-muted)] text-xs sm:text-sm mb-4">
              {isEn
                ? 'Tap any feature below to open it right away. Your scroll position on Home is always saved when you return.'
                : 'Chạm vào bất kỳ tính năng nào dưới đây để mở ngay. Vị trí bạn đang xem ở trang Home luôn được lưu giữ khi quay lại.'}
            </p>

            {/* Lưới lối tắt tới đúng 7 tính năng cốt lõi */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-3">
              {HOME_FULLSCREEN_FEATURES.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleOpenFeature(item)}
                    className="relative min-h-[64px] p-3.5 rounded-2xl bg-[var(--surface)] hover:bg-[#FAF0DF] border border-[var(--gold)]/70 hover:border-[var(--primary)] shadow-[0_6px_18px_rgba(59,42,32,0.08)] text-left flex items-center justify-between gap-3 transition-all cursor-pointer group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-[#FBF3E4] border border-[var(--gold)] flex items-center justify-center shrink-0 text-[var(--primary)] font-mono text-xs font-bold">
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[11px] font-mono font-bold text-[var(--primary)]">
                            {item.stepCode}.
                          </span>
                          <span className="text-sm font-serif font-bold text-[var(--text)] truncate group-hover:text-[var(--primary)]">
                            {isEn ? item.titleEn : item.title}
                          </span>
                        </div>
                        <p className="text-[11.5px] text-[var(--text-muted)] truncate mt-0.5">
                          {(isEn ? item.highlightsEn : item.highlights).join(' · ')}
                        </p>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-[var(--primary)] shrink-0 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                );
              })}
            </div>

            {/* Giới thiệu ngắn gọn dự án */}
            <div className="mt-4 pt-3 border-t border-[var(--gold)]/45 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-[var(--text-muted)]">
              <div className="flex items-center gap-2 text-[var(--text)]">
                <Compass className="w-4 h-4 text-[var(--primary)] shrink-0" />
                <span>
                  <strong className="text-[var(--primary)]">HỒN ĐẤT VIỆT</strong> —{' '}
                  {isEn
                    ? 'Digital heritage map, AI vision recognition & voice narration platform across 34 provinces of Vietnam.'
                    : 'Nền tảng bản đồ số, AI nhận diện & thuyết minh di sản 34 tỉnh thành Việt Nam.'}
                </span>
              </div>
              <span className="inline-flex items-center gap-1 text-[var(--jade)] font-bold shrink-0">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {isEn ? 'Pride of Vietnam Heritage' : 'Tự hào Di sản Việt Nam'}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Cửa sổ Quản lý Ảnh nền dành cho Admin */}
      <AdminBackgroundManagerModal
        isOpen={isBgManagerOpen}
        onClose={() => setIsBgManagerOpen(false)}
        initialSectionId={editingBgSectionId}
        onConfigUpdated={(nextCfg) => setHomeBgConfig(nextCfg)}
        onLandmarkSelected={(lm) => {
          if (onSelectLandmark) {
            onSelectLandmark(lm);
          }
        }}
      />
    </div>
  );
};
