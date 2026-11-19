import React, { useState, useEffect, useRef, useCallback } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import {
  Volume2,
  VolumeX,
  RotateCcw,
  Compass,
  Utensils,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  HelpCircle,
  Play,
  SlidersHorizontal,
  X,
  Star,
  MapPin,
  ExternalLink,
} from 'lucide-react';
import {
  guideVoiceService,
  GuideNarrationPayload,
  GuideSpeechRate,
  VIENEU_MALE_VOICES,
  VieNeuMaleVoiceId,
  GUIDE_NARRATE_EVENT,
  GUIDE_MAP_SHEET_EVENT,
  GUIDE_MAP_INTERACTION_EVENT,
  triggerGuideNarration,
} from '../services/guideVoiceService';
import { VIETNAM_34_ADMINISTRATIVE_UNITS } from '../data/administrativeUnits';
import { getProvinceIntroText, getHeritageIntroText } from '../data/guideIntroData';
import { storageService } from '../services/storageService';
import { triggerInAppMapRoute } from '../services/routeNavigationService';
import {
  GUIDE_CONTENT,
  SCREEN_ID_BY_TAB,
  PRIMARY_GUIDE_ID_BY_TAB,
  SCREEN_FEATURE_GUIDE_IDS_BY_TAB,
  getGuideContentOrFallback,
  getOrderedAppTourSteps,
  localizeGuideEntry,
  GuideContentEntry,
} from '../guideContent';

/**
 * ============================================================================
 * CÁC HẰNG SỐ TÙY CHỈNH KHUÔN MẶT CHIBI & NHÂN VẬT 3D (<GuideCharacter />)
 * ============================================================================
 * Bạn có thể chỉnh trực tiếp các hằng số dưới đây để thay đổi màu da, màu mắt,
 * độ to mắt, độ đậm má hồng và ria/râu (FACIAL_HAIR).
 */
export const SKIN_COLOR = '#f0c3a0';
export const SKIN_SHADOW_COLOR = '#e8b08a';
export const EYE_COLOR = '#4a2511';
export const EYE_SIZE = 1.0;
export const BLUSH_COLOR = '#ff8da1';
export const BLUSH_OPACITY = 0.44;
export const FACIAL_HAIR = false;

export const MODEL_URL: string = '/models/3D.glb';
export const FALLBACK_REMOTE_MODEL_URL: string =
  'https://raw.githubusercontent.com/tin1511/tour-guide-3d/main/3D.glb';

export type GuideCharacterStateMode =
  | 'idle'
  | 'greeting'
  | 'speaking'
  | 'reacting'
  | 'dragged';

export type IdleRandomActionType = 'none' | 'look_around' | 'stretch' | 'wave';

export const GUIDE_CHARACTER_CONFIG = {
  // --- HẰNG SỐ GIAO DIỆN & KÍCH THƯỚC (120-190px) ---
  /** Chiều rộng nhân vật trên mobile (px) — nhỏ gọn để không che nút lọc & tiêu đề */
  MOBILE_WIDTH_PX: 74,
  /** Chiều rộng nhân vật trên máy tính / tablet (px) */
  DESKTOP_WIDTH_PX: 148,
  /** Tỉ lệ khung hình dọc (chiều cao / chiều rộng) -> ~92px trên mobile, ~185px trên desktop */
  ASPECT_RATIO: 1.25,
  /** Hệ số phóng to khi cần */
  LARGE_SCALE_MULTIPLIER: 1.25,
  /** Ngưỡng phân biệt chạm (tap) và kéo (drag) tính bằng pixel */
  DRAG_THRESHOLD_PX: 6,
  /** Khoảng cách lề trái/phải khi tự hít vào cạnh màn hình (px) */
  EDGE_MARGIN_PX: 6,
  /** Khoảng cách đáy mặc định trên mobile để nằm ngay trên thanh điều hướng dưới (px) */
  DEFAULT_BOTTOM_MOBILE_PX: 64,
  /** Khoảng cách đáy mặc định trên màn hình lớn (px) */
  DEFAULT_BOTTOM_DESKTOP_PX: 24,
  /** Thời gian tự ẩn bong bóng phụ đề sau khi đọc xong (ms) */
  SUBTITLE_AUTO_HIDE_MS: 8500,
  /** Giới hạn tỉ lệ điểm ảnh (DPR) tối đa để vừa sắc nét vừa mượt trên điện thoại */
  MAX_PIXEL_RATIO: 2.0,
  /** Đường dẫn bộ giải mã Draco (nếu mô hình .glb nén Draco) */
  DRACO_DECODER_PATH: 'https://www.gstatic.com/draco/versioned/decoders/1.5.7/',
  /** Khóa lưu vị trí và cài đặt trong localStorage */
  STORAGE_KEY: 'hdv_guide_character_prefs_v2',

  // --- HẰNG SỐ THẨM MỸ KHUÔN MẶT CHIBI (DỄ CHỈNH SỬA) ---
  /** Màu da chính ấm sáng (trán, sống mũi, gò má trên) */
  SKIN_COLOR,
  /** Màu da sắc độ ấm nhẹ (cằm, hàm dưới, cổ) */
  SKIN_SHADOW_COLOR,
  /** Màu đường viền mảnh quanh khuôn mặt (toon outline) */
  FACE_OUTLINE_COLOR: '#2d1810',
  /** Màu tròng mắt nâu hạt dẻ đậm */
  EYE_COLOR,
  /** Ánh nâu hổ phách ấm ở phần dưới tròng mắt */
  EYE_LOWER_WARM_COLOR: '#7c3f1d',
  /** Hệ số độ to của mắt chibi (mặc định 1.0; có thể chỉnh từ 0.85 đến 1.25) */
  EYE_SIZE,
  /** Màu chân mày và đường mi trên (nâu đen tự nhiên) */
  EYEBROW_COLOR: '#24120b',
  /** Màu môi hồng đỏ dịu thân thiện */
  MOUTH_LIP_COLOR: '#df5b68',
  /** Màu má hồng hai bên */
  BLUSH_COLOR,
  /** Độ đậm / độ trong suốt của má hồng (0.35 - 0.50) */
  BLUSH_OPACITY,
  /** Bật/tắt ria mép và râu dê (mặc định false để mặt trẻ trung, thân thiện) */
  FACIAL_HAIR,

  // --- CÁC THAM SỐ HOẠT ẢNH KHUÔN MẶT & TƯƠNG TÁC ---
  /** Độ mở miệng tối đa khi nói ở tốc độ 1x (0..1) */
  MAX_MOUTH_OPEN: 0.92,
  /** Khoảng thời gian ngẫu nhiên giữa 2 lần chớp mắt tự động (giây) */
  BLINK_INTERVAL_MIN_SEC: 2.2,
  BLINK_INTERVAL_MAX_SEC: 4.8,
  /** Xác suất chớp mắt đôi (double blink) trong mỗi chu kỳ chớp mắt (0..1) */
  DOUBLE_BLINK_CHANCE: 0.25,
  /** Thời lượng 1 lần hạ-nâng nắp mi chớp mắt (giây) */
  BLINK_DURATION_SEC: 0.14,
  /** Góc quay đầu & đồng tử tối đa theo con trỏ/ngón tay (độ, ±25°) */
  MAX_LOOK_ANGLE_DEG: 25,
  /** Thời gian tự quay đầu/mắt về chính giữa khi không có thao tác con trỏ (giây) */
  LOOK_RETURN_CENTER_SEC: 3.2,
  /** Khoảng thời gian rảnh trước khi kích hoạt hành động ngẫu nhiên nhẹ (giây) */
  IDLE_ACTION_MIN_SEC: 10.5,
  IDLE_ACTION_MAX_SEC: 15.0,
  /** Tốc độ nội suy mượt (lerp) cho biểu cảm khuôn mặt */
  FACE_LERP_SPEED: 15.0,
  /** Tốc độ nội suy mượt (slerp) cho xương Rigify */
  BONE_LERP_SPEED: 8.5,
} as const;

const GREETING_MESSAGES: readonly string[] = [
  'Xin chào! Bạn muốn khám phá vùng đất hay di sản nào hôm nay?',
  'Chào bạn! Hãy chạm vào một tỉnh thành trên bản đồ để mình thuyết minh nhé!',
  'Rất vui được đồng hành cùng bạn trên hành trình khám phá Hồn Đất Việt!',
  'Xin chào! Cùng mình tìm hiểu vẻ đẹp văn hóa 34 tỉnh thành Việt Nam nhé!',
];

const DOUBLE_TAP_GREETINGS: readonly string[] = [
  'Xin kính chào quý khách! Chúc bạn có chuyến du ngoạn di sản thật thú vị!',
  'Chào mừng bạn! Mình luôn sẵn sàng kể chuyện lịch sử và văn hóa Việt Nam!',
];

interface StoredPrefs {
  dockSide: 'left' | 'right';
  yRatio: number;
  muted: boolean;
  rate: GuideSpeechRate;
  isLargeSize: boolean;
  isHidden: boolean;
}

const DEFAULT_PREFS: StoredPrefs = {
  dockSide: 'right',
  yRatio: 0.82,
  muted: false,
  rate: 1,
  isLargeSize: false,
  isHidden: false,
};

function loadStoredPrefs(): StoredPrefs {
  try {
    const raw = localStorage.getItem(GUIDE_CHARACTER_CONFIG.STORAGE_KEY);
    if (!raw) return DEFAULT_PREFS;
    const parsed = JSON.parse(raw);
    return {
      dockSide: parsed.dockSide === 'left' ? 'left' : 'right',
      yRatio:
        typeof parsed.yRatio === 'number'
          ? Math.max(0.12, Math.min(0.88, parsed.yRatio))
          : DEFAULT_PREFS.yRatio,
      muted: false,
      rate: parsed.rate === 0.8 || parsed.rate === 1.2 ? parsed.rate : 1,
      isLargeSize: false,
      isHidden: false,
    };
  } catch {
    return DEFAULT_PREFS;
  }
}

export type GuideInteractionMode = 'off' | 'first_time' | 'guide';

const GUIDE_MODE_STORAGE_KEY = 'hdv_3d_guide_mode_v1';
const GUIDE_SEEN_STORAGE_KEY = 'hdv_3d_guide_seen_v1';
const GUIDE_WELCOME_PROMPTED_KEY = 'hdv_3d_welcome_prompted_v1';

function loadStoredGuideMode(): GuideInteractionMode {
  try {
    const raw = localStorage.getItem(GUIDE_MODE_STORAGE_KEY);
    if (raw === 'off' || raw === 'first_time' || raw === 'guide') {
      return raw;
    }
    return 'first_time';
  } catch {
    return 'first_time';
  }
}

function saveStoredGuideMode(mode: GuideInteractionMode): void {
  try {
    localStorage.setItem(GUIDE_MODE_STORAGE_KEY, mode);
  } catch {
    // Ignore storage quota or private mode errors
  }
}

function loadStoredSeenGuideIds(): Set<string> {
  try {
    const raw = localStorage.getItem(GUIDE_SEEN_STORAGE_KEY);
    if (!raw) return new Set<string>();
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return new Set<string>(parsed.filter((item): item is string => typeof item === 'string'));
    }
    return new Set<string>();
  } catch {
    return new Set<string>();
  }
}

function saveStoredSeenGuideIds(seen: Set<string>): void {
  try {
    localStorage.setItem(GUIDE_SEEN_STORAGE_KEY, JSON.stringify(Array.from(seen)));
  } catch {
    // Ignore storage quota or private mode errors
  }
}

function saveStoredPrefs(prefs: StoredPrefs): void {
  try {
    localStorage.setItem(GUIDE_CHARACTER_CONFIG.STORAGE_KEY, JSON.stringify(prefs));
  } catch {
    // Ignore storage quota or private mode errors
  }
}

function checkWebGLAndDeviceSupport(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const canvas = document.createElement('canvas');
    const gl =
      canvas.getContext('webgl2') ||
      canvas.getContext('webgl') ||
      canvas.getContext('experimental-webgl');
    return Boolean(gl);
  } catch {
    return false;
  }
}

function normalizeBoneName(name: string): string {
  return (name || '').replace(/\./g, '').toLowerCase();
}

function matchesBonePrefix(boneName: string, prefix: string): boolean {
  return normalizeBoneName(boneName).startsWith(normalizeBoneName(prefix));
}

export interface FaceControllerValues {
  smile: number;     // 0..1 (0.28 = cười nhẹ mặc định, >0.6 = cười tươi lộ răng trắng)
  mouthOpen: number; // 0..1 (độ mở miệng khi nói hoặc ngạc nhiên)
  blink: number;     // 0..1 (0 = mở mắt, 1 = hạ nắp mi nhắm mắt)
  browRaise: number; // 0..1 (độ nhướn chân mày)
  surprise: number;  // 0..1 (khi đang kéo nhân vật: mắt mở to hơn, miệng hơi tròn)
}

interface FollowUpChip {
  id: string;
  label: string;
  icon: 'replay' | 'next' | 'neighbor' | 'food';
  onClick: () => void;
}

/**
 * Tạo Texture bậc thang mềm (4-stop gradient map) dùng chung cho MeshToonMaterial
 * để khuôn mặt có khối mềm mại mà không bị bệt phẳng.
 */
let _sharedToonGradientMap: THREE.DataTexture | null = null;
function getSharedToonGradientMap(): THREE.DataTexture {
  if (_sharedToonGradientMap) return _sharedToonGradientMap;
  const data = new Uint8Array([
    198, 198, 198, 255,
    222, 222, 222, 255,
    242, 242, 242, 255,
    255, 255, 255, 255,
  ]);
  const tex = new THREE.DataTexture(data, 4, 1, THREE.RGBAFormat);
  tex.minFilter = THREE.LinearFilter;
  tex.magFilter = THREE.LinearFilter;
  tex.generateMipmaps = false;
  tex.needsUpdate = true;
  _sharedToonGradientMap = tex;
  return tex;
}

/**
 * Tạo Texture má hồng elip mềm (radial alpha falloff) dùng chung, không tạo lại mỗi frame.
 */
let _sharedBlushTexture: THREE.CanvasTexture | null = null;
function getSharedBlushTexture(blushHex: string): THREE.CanvasTexture {
  if (_sharedBlushTexture) return _sharedBlushTexture;
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    const c = new THREE.Color(blushHex);
    const r = Math.round(c.r * 255);
    const g = Math.round(c.g * 255);
    const b = Math.round(c.b * 255);
    const grad = ctx.createRadialGradient(64, 64, 6, 64, 64, 60);
    grad.addColorStop(0, `rgba(${r}, ${g}, ${b}, 1.0)`);
    grad.addColorStop(0.55, `rgba(${r}, ${g}, ${b}, 0.65)`);
    grad.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0.0)`);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 128, 128);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
  _sharedBlushTexture = tex;
  return tex;
}

/**
 * Tạo hình học đầu Chibi bầu bĩnh, má phúng phính nhẹ, hàm nhỏ gọn và gán sắc độ màu da
 * tự nhiên giữa trán (sáng ấm), má (hồng đào nhẹ) và cằm (ấm đậm hơn một chút).
 */
function createChibiHeadGeometry(
  skinHex: string,
  shadowHex: string,
  blushHex: string
): THREE.BufferGeometry {
  const geo = new THREE.SphereGeometry(1, 44, 36);
  const pos = geo.attributes.position;
  const colors = new Float32Array(pos.count * 3);

  const baseColor = new THREE.Color(skinHex);
  const foreheadColor = baseColor.clone().offsetHSL(0, -0.02, 0.03);
  const shadowColor = new THREE.Color(shadowHex);
  const cheekTint = baseColor.clone().lerp(new THREE.Color(blushHex), 0.14);
  const tmpColor = new THREE.Color();

  // Kích thước cơ sở trong không gian cục bộ của xương đầu `spine.006`
  const rx = 0.124;
  const ry = 0.106;
  const rz = 0.118;

  for (let i = 0; i < pos.count; i++) {
    const nx = pos.getX(i);
    const ny = pos.getY(i);
    const nz = pos.getZ(i);

    let x = nx * rx;
    let y = ny * ry;
    let z = nz * rz;

    // Tạo dáng Chibi: má bầu phúng phính ở nửa dưới mặt, hàm và cằm thu nhỏ gọn gàng
    if (ny < 0.15) {
      const cheekFactor = Math.exp(-Math.pow((ny + 0.18) / 0.36, 2));
      const frontFactor = Math.max(0, nz);
      x *= 1 + 0.075 * cheekFactor * (0.4 + 0.6 * frontFactor);
      z *= 1 + 0.045 * cheekFactor * frontFactor;
    }
    if (ny < -0.25) {
      const jawTaper = Math.min(1, (-ny - 0.25) / 0.75);
      x *= 1 - 0.18 * jawTaper * jawTaper;
      z *= 1 - 0.10 * jawTaper * jawTaper;
    }

    // Làm phẳng rất nhẹ vùng mặt trước để đôi mắt to và miệng chibi nằm êm đẹp trên bề mặt
    if (nz > 0.35 && Math.abs(ny) < 0.65) {
      z = THREE.MathUtils.lerp(z, 0.116, 0.14 * (nz - 0.35));
    }

    pos.setXYZ(i, x, y, z);

    // Phối sắc độ da mềm mại giữa trán, má và cằm
    tmpColor.copy(baseColor);
    if (ny > 0.18 && nz > 0) {
      const t = Math.min(1, (ny - 0.18) / 0.6) * Math.max(0, nz);
      tmpColor.lerp(foreheadColor, t * 0.75);
    } else if (ny >= -0.35 && ny <= 0.12 && nz > 0.35 && Math.abs(nx) > 0.22) {
      const cheekGlow =
        Math.exp(-Math.pow((ny + 0.12) / 0.22, 2)) *
        Math.exp(-Math.pow((Math.abs(nx) - 0.46) / 0.25, 2));
      tmpColor.lerp(cheekTint, cheekGlow * 0.65);
    }

    // Bóng ấm nhẹ dưới cằm, viền hàm và phía sau gáy
    const rimShadow = Math.max(
      0,
      Math.min(1, (-ny - 0.28) * 1.15 + (0.25 - nz) * 0.45)
    );
    tmpColor.lerp(shadowColor, rimShadow * 0.72);

    colors[i * 3] = tmpColor.r;
    colors[i * 3 + 1] = tmpColor.g;
    colors[i * 3 + 2] = tmpColor.b;
  }

  geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  geo.computeVertexNormals();
  return geo;
}

// Pre-allocated math helpers at module scope to prevent GC in the render loop
const _tmpEuler = new THREE.Euler(0, 0, 0, 'XYZ');
const _tmpQuat = new THREE.Quaternion();
const _tmpTargetQuat = new THREE.Quaternion();

interface HighlightBoxRect {
  top: number;
  left: number;
  width: number;
  height: number;
  borderRadius: string;
}

interface GuideCharacterProps {
  isPeekingBackground?: boolean;
  activeTab?: string;
  onNavigateTab?: (tab: string) => void;
  language?: string;
}

const ENGLISH_GREETING_MESSAGES = [
  'Hello and welcome to Hồn Đất Việt! Touch any province on the map or scroll through our 7 heritage features to listen to my tour narration!',
  'Warm greetings! I am your 3D Little Dragon Guide. Let us explore 34 provinces, Hoang Sa, Truong Sa, and 4,000 years of Vietnamese heritage together!',
  'Welcome! You can drag me anywhere on the screen, tap me to say hello, or open the Map to hear stories about every province of Vietnam!'
];

const ENGLISH_DOUBLE_TAP_GREETINGS = [
  'I respectfully bow to welcome you! Wishing you an inspiring journey through Vietnam’s thousand-year cultural heritage!',
  'Thank you for visiting Hồn Đất Việt! May your exploration of Vietnamese history, ancient costumes, craft villages, and cuisine be filled with joy!'
];

export const GuideCharacter: React.FC<GuideCharacterProps> = ({
  isPeekingBackground = false,
  activeTab = 'home',
  onNavigateTab,
  language = 'vi',
}) => {
  const isEn = language === 'en';
  const [prefs, setPrefs] = useState<StoredPrefs>(() => loadStoredPrefs());
  const [guideMode, setGuideModeState] = useState<GuideInteractionMode>(() =>
    loadStoredGuideMode()
  );
  const [seenCount, setSeenCount] = useState<number>(() => loadStoredSeenGuideIds().size);
  const [showControlMenu, setShowControlMenu] = useState<boolean>(false);
  const [highlightRect, setHighlightRect] = useState<HighlightBoxRect | null>(null);
  const [hasPendingGuideAction, setHasPendingGuideAction] = useState<boolean>(false);
  const [tourStepIndex, setTourStepIndex] = useState<number | null>(null);
  const [showWelcomeTourPrompt, setShowWelcomeTourPrompt] = useState<boolean>(false);

  const [isMobileView, setIsMobileView] = useState<boolean>(() =>
    typeof window !== 'undefined' ? window.innerWidth < 768 : true
  );
  const [prefersReducedMotion, setPrefersReducedMotion] = useState<boolean>(() =>
    typeof window !== 'undefined' && window.matchMedia
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false
  );

  // Lazy load & WebGL fallback state
  const [isSceneReady, setIsSceneReady] = useState<boolean>(false);
  const [use2DFallback, setUse2DFallback] = useState<boolean>(false);

  // Máy trạng thái (State Machine): idle, greeting, speaking, reacting, dragged
  const [characterState, setCharacterState] = useState<GuideCharacterStateMode>('idle');
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [activeNarration, setActiveNarration] = useState<GuideNarrationPayload | null>(null);
  const [revealedCharCount, setRevealedCharCount] = useState<number>(0);
  const [showSubtitle, setShowSubtitle] = useState<boolean>(false);
  const [isNarrationFinished, setIsNarrationFinished] = useState<boolean>(false);
  const [voiceNotice, setVoiceNotice] = useState<string | null>(null);
  const [selectedMaleVoice, setSelectedMaleVoice] = useState<VieNeuMaleVoiceId>(() =>
    guideVoiceService.getMaleVoice()
  );

  // Vị trí kéo & né bottom sheet
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragPos, setDragPos] = useState<{ x: number; y: number } | null>(null);
  const [mapSheetState, setMapSheetState] = useState<{
    sheetState: 'collapsed' | 'half' | 'full';
    sheetHeightVh: number;
  }>({ sheetState: 'collapsed', sheetHeightVh: 0 });

  const canvasContainerRef = useRef<HTMLDivElement | null>(null);
  const subtitleHideTimeoutRef = useRef<number | null>(null);
  const stateTransitionTimeoutRef = useRef<number | null>(null);
  const highlightHideTimeoutRef = useRef<number | null>(null);
  const lastTapTimestampRef = useRef<number>(0);

  // Contextual Guide refs
  const seenGuideIdsRef = useRef<Set<string>>(loadStoredSeenGuideIds());
  const guideModeRef = useRef<GuideInteractionMode>(guideMode);
  const highlightedElementRef = useRef<HTMLElement | null>(null);
  const pendingActionElementRef = useRef<HTMLElement | null>(null);
  const isBypassingGuideClickRef = useRef<boolean>(false);
  const lastGuideTriggerRef = useRef<{ id: string; timestamp: number }>({
    id: '',
    timestamp: 0,
  });
  const lastContentNarrationTimestampRef = useRef<number>(0);
  const globalPointerStartRef = useRef<{
    x: number;
    y: number;
    timestamp: number;
  } | null>(null);
  const hasUserInteractedWithAppRef = useRef<boolean>(false);
  const prevActiveTabRef = useRef<string>(activeTab);
  const prevLanguageRef = useRef<string>(language);
  const languageRef = useRef<'vi' | 'en'>(isEn ? 'en' : 'vi');
  languageRef.current = isEn ? 'en' : 'vi';

  // Pointer drag tracking refs
  const pointerDownInfoRef = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    originX: number;
    originY: number;
    hasMovedBeyondThreshold: boolean;
  } | null>(null);

  // Mutable animation & expression state read directly by the 60fps Three.js loop
  const runtimeRef = useRef<{
    mode: GuideCharacterStateMode;
    isPaused: boolean;
    isDragging: boolean;
    reducedMotion: boolean;
    rate: GuideSpeechRate;
    speechVowelOpenness: number;
    speechPulseTimestamp: number;
    clauseNodPulse: number;
    greetingGesture: 'wave' | 'bow';
    greetingEndTimestamp: number;
    warmSmileUntil: number;
    headNodUntil: number;
    lookTargetYaw: number;
    lookTargetPitch: number;
    lastLookInputTime: number;
    isMapInteracting: boolean;
    charScreenCenterX: number;
    charScreenCenterY: number;
    pointingActive: boolean;
    pointingSide: 'left' | 'right';
    pointingPitch: number;
  }>({
    mode: 'idle',
    isPaused: false,
    isDragging: false,
    reducedMotion: prefersReducedMotion,
    rate: prefs.rate,
    speechVowelOpenness: 0,
    speechPulseTimestamp: 0,
    clauseNodPulse: 0,
    greetingGesture: 'wave',
    greetingEndTimestamp: 0,
    warmSmileUntil: 0,
    headNodUntil: 0,
    lookTargetYaw: 0,
    lookTargetPitch: 0,
    lastLookInputTime: 0,
    isMapInteracting: false,
    charScreenCenterX: 300,
    charScreenCenterY: 500,
    pointingActive: false,
    pointingSide: 'left',
    pointingPitch: 0,
  });

  useEffect(() => {
    runtimeRef.current.mode = isDragging ? 'dragged' : characterState;
    runtimeRef.current.isPaused = isPaused;
    runtimeRef.current.isDragging = isDragging;
    runtimeRef.current.reducedMotion = prefersReducedMotion;
    runtimeRef.current.rate = prefs.rate;
  }, [characterState, isPaused, isDragging, prefersReducedMotion, prefs.rate]);

  useEffect(() => {
    guideModeRef.current = guideMode;
  }, [guideMode]);

  const setGuideMode = useCallback((nextMode: GuideInteractionMode) => {
    guideModeRef.current = nextMode;
    setGuideModeState(nextMode);
    saveStoredGuideMode(nextMode);
    if (nextMode !== 'guide') {
      pendingActionElementRef.current = null;
      setHasPendingGuideAction(false);
    }
  }, []);

  const markGuideIdSeen = useCallback((guideId: string) => {
    if (!seenGuideIdsRef.current.has(guideId)) {
      seenGuideIdsRef.current.add(guideId);
      saveStoredSeenGuideIds(seenGuideIdsRef.current);
      setSeenCount(seenGuideIdsRef.current.size);
    }
  }, []);

  const handleResetSeenGuides = useCallback(() => {
    seenGuideIdsRef.current.clear();
    saveStoredSeenGuideIds(seenGuideIdsRef.current);
    setSeenCount(0);
    try {
      localStorage.removeItem(GUIDE_WELCOME_PROMPTED_KEY);
    } catch {
      // ignore
    }
  }, []);

  const updatePrefs = useCallback((updater: (prev: StoredPrefs) => StoredPrefs) => {
    setPrefs((prev) => {
      const next = updater(prev);
      saveStoredPrefs(next);
      return next;
    });
  }, []);

  // Hướng ánh mắt & đầu của nhân vật về một tọa độ màn hình (x, y) trong giới hạn ±25°
  const aimCharacterGazeAtScreenPoint = useCallback((clientX: number, clientY: number) => {
    const rt = runtimeRef.current;
    const dx = clientX - rt.charScreenCenterX;
    const dy = clientY - rt.charScreenCenterY;
    const vw = Math.max(320, window.innerWidth);
    const vh = Math.max(480, window.innerHeight);

    const maxRad = THREE.MathUtils.degToRad(GUIDE_CHARACTER_CONFIG.MAX_LOOK_ANGLE_DEG);
    const normX = Math.max(-1, Math.min(1, dx / (vw * 0.45)));
    const normY = Math.max(-1, Math.min(1, dy / (vh * 0.45)));

    rt.lookTargetYaw = normX * maxRad;
    rt.lookTargetPitch = normY * maxRad * 0.72;
    rt.lastLookInputTime = performance.now();
  }, []);

  // Lắng nghe con trỏ chuột / chạm trên toàn trang để nhân vật dõi theo nhẹ nhàng
  useEffect(() => {
    const handleGlobalPointerMove = (e: PointerEvent) => {
      if (runtimeRef.current.reducedMotion) return;
      aimCharacterGazeAtScreenPoint(e.clientX, e.clientY);
    };
    const handleGlobalPointerDown = (e: PointerEvent) => {
      if (runtimeRef.current.reducedMotion) return;
      aimCharacterGazeAtScreenPoint(e.clientX, e.clientY);
    };

    window.addEventListener('pointermove', handleGlobalPointerMove, { passive: true });
    window.addEventListener('pointerdown', handleGlobalPointerDown, { passive: true });
    return () => {
      window.removeEventListener('pointermove', handleGlobalPointerMove);
      window.removeEventListener('pointerdown', handleGlobalPointerDown);
    };
  }, [aimCharacterGazeAtScreenPoint]);

  // Lắng nghe kích thước màn hình và prefers-reduced-motion
  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);

    const mediaQuery = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    const handleMotionChange = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery?.addEventListener?.('change', handleMotionChange);

    return () => {
      window.removeEventListener('resize', handleResize);
      mediaQuery?.removeEventListener?.('change', handleMotionChange);
    };
  }, []);

  // Tải trễ (Lazy-load) 3D sau khi trang hiển thị xong
  useEffect(() => {
    let timerId: number | null = null;
    const initLazy = () => {
      const canUseWebGL = checkWebGLAndDeviceSupport();
      setUse2DFallback(!canUseWebGL);
      setIsSceneReady(true);
    };

    const win = window as Window & {
      requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
      cancelIdleCallback?: (id: number) => void;
    };

    if (typeof win.requestIdleCallback === 'function') {
      const idleId = win.requestIdleCallback(initLazy, { timeout: 800 });
      return () => win.cancelIdleCallback?.(idleId);
    } else {
      timerId = window.setTimeout(initLazy, 300);
      return () => {
        if (timerId !== null) window.clearTimeout(timerId);
      };
    }
  }, []);

  // Đồng bộ tốc độ đọc, ngôn ngữ và trạng thái tắt tiếng với guideVoiceService
  useEffect(() => {
    guideVoiceService.setLanguage(isEn ? 'en' : 'vi');
    guideVoiceService.setRate(prefs.rate);
    guideVoiceService.setMuted(prefs.muted);
    window.dispatchEvent(
      new CustomEvent('hdv_guide_mute_synced', { detail: { muted: prefs.muted } })
    );
  }, [isEn, prefs.rate, prefs.muted]);

  // Lắng nghe sự kiện bật/tắt tiếng từ trang Home Feed
  useEffect(() => {
    const handleExternalMuteToggle = (e: Event) => {
      const custom = e as CustomEvent<{ muted?: boolean }>;
      updatePrefs((prev) => ({
        ...prev,
        muted:
          typeof custom.detail?.muted === 'boolean' ? custom.detail.muted : !prev.muted,
      }));
    };
    window.addEventListener('hdv_guide_toggle_mute', handleExternalMuteToggle);
    return () => window.removeEventListener('hdv_guide_toggle_mute', handleExternalMuteToggle);
  }, [updatePrefs]);

  // Mở khóa âm thanh iOS/Safari ở tương tác chạm đầu tiên của người dùng
  useEffect(() => {
    const unlockOnce = () => {
      guideVoiceService.unlockAudioOnUserGesture();
    };
    window.addEventListener('pointerdown', unlockOnce, { once: true, passive: true });
    return () => window.removeEventListener('pointerdown', unlockOnce);
  }, []);

  // Xóa khung sáng viền vàng và hạ tay chỉ của nhân vật
  const clearHighlightAndPointing = useCallback(() => {
    if (highlightHideTimeoutRef.current !== null) {
      window.clearTimeout(highlightHideTimeoutRef.current);
      highlightHideTimeoutRef.current = null;
    }
    highlightedElementRef.current = null;
    setHighlightRect(null);
    runtimeRef.current.pointingActive = false;
  }, []);

  // Cập nhật khung viền sáng vàng quanh phần tử đang giải thích và hướng tay chỉ về đó
  const updateHighlightRectFromElement = useCallback(
    (el: HTMLElement | null) => {
      if (!el || !document.body.contains(el)) {
        clearHighlightAndPointing();
        return;
      }
      const rect = el.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) {
        clearHighlightAndPointing();
        return;
      }
      let radius = '12px';
      try {
        const computed = window.getComputedStyle(el);
        if (computed.borderRadius && computed.borderRadius !== '0px') {
          radius = computed.borderRadius;
        }
      } catch {
        // ignore
      }

      setHighlightRect({
        top: Math.max(2, rect.top - 3),
        left: Math.max(2, rect.left - 3),
        width: rect.width + 6,
        height: rect.height + 6,
        borderRadius: radius,
      });

      const targetCenterX = rect.left + rect.width / 2;
      const targetCenterY = rect.top + rect.height / 2;
      aimCharacterGazeAtScreenPoint(targetCenterX, targetCenterY);

      const rt = runtimeRef.current;
      rt.pointingActive = true;
      rt.pointingSide = targetCenterX < rt.charScreenCenterX ? 'left' : 'right';
      const dy = rt.charScreenCenterY - targetCenterY;
      rt.pointingPitch = Math.max(-0.45, Math.min(0.55, dy / 320));
    },
    [aimCharacterGazeAtScreenPoint, clearHighlightAndPointing]
  );

  // Theo dõi cuộn trang / đổi kích thước màn hình để viền sáng luôn bám sát phần tử
  useEffect(() => {
    if (!highlightRect) return;
    const handleSyncRect = () => {
      if (highlightedElementRef.current) {
        updateHighlightRectFromElement(highlightedElementRef.current);
      }
    };
    window.addEventListener('scroll', handleSyncRect, { capture: true, passive: true });
    window.addEventListener('resize', handleSyncRect, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleSyncRect, { capture: true });
      window.removeEventListener('resize', handleSyncRect);
    };
  }, [highlightRect, updateHighlightRectFromElement]);

  // Hàm bắt đầu đọc một payload (có chuyển qua trạng thái reacting -> speaking)
  const startNarrationWithReaction = useCallback(
    (payload: GuideNarrationPayload, skipReactionDelay: boolean = false) => {
      if (!payload || !payload.introText) return;

      if (subtitleHideTimeoutRef.current !== null) {
        window.clearTimeout(subtitleHideTimeoutRef.current);
        subtitleHideTimeoutRef.current = null;
      }
      if (stateTransitionTimeoutRef.current !== null) {
        window.clearTimeout(stateTransitionTimeoutRef.current);
        stateTransitionTimeoutRef.current = null;
      }

      if (payload.targetType !== 'ui_guide') {
        clearHighlightAndPointing();
        pendingActionElementRef.current = null;
        setHasPendingGuideAction(false);
      }

      if (typeof payload.screenX === 'number' && typeof payload.screenY === 'number') {
        aimCharacterGazeAtScreenPoint(payload.screenX, payload.screenY);
      }

      setShowWelcomeTourPrompt(false);
      setVoiceNotice(null);
      setActiveNarration(payload);
      setRevealedCharCount(0);
      setIsNarrationFinished(false);
      setShowSubtitle(true);
      setIsPaused(false);

      if (!skipReactionDelay && payload.targetType !== 'greeting') {
        setCharacterState('reacting');
        runtimeRef.current.mode = 'reacting';
        stateTransitionTimeoutRef.current = window.setTimeout(() => {
          setCharacterState('speaking');
          runtimeRef.current.mode = 'speaking';
        }, 420);
      } else {
        setCharacterState(payload.targetType === 'greeting' ? 'greeting' : 'speaking');
        runtimeRef.current.mode = payload.targetType === 'greeting' ? 'greeting' : 'speaking';
      }

      const targetSpeechLang: 'vi' | 'en' = payload.lang || languageRef.current;
      guideVoiceService.setLanguage(targetSpeechLang);

      guideVoiceService.speak(payload.introText, {
        onStart: () => {
          setIsPaused(false);
        },
        onProgress: (charIndex) => {
          setRevealedCharCount(charIndex);
        },
        onWordBoundary: (pulse) => {
          runtimeRef.current.speechVowelOpenness = pulse.vowelOpenness;
          runtimeRef.current.speechPulseTimestamp = performance.now();
          if (pulse.isClauseBreak) {
            runtimeRef.current.clauseNodPulse = performance.now();
          }
        },
        onPause: () => {
          setIsPaused(true);
          runtimeRef.current.speechVowelOpenness = 0;
        },
        onResume: () => {
          setIsPaused(false);
        },
        onError: (notice) => {
          setVoiceNotice(notice);
        },
        onEnd: () => {
          const now = performance.now();
          runtimeRef.current.speechVowelOpenness = 0;
          runtimeRef.current.pointingActive = false;
          // Cười tươi 1.8 giây sau khi đọc xong rồi mới về cười nhẹ
          runtimeRef.current.warmSmileUntil = now + 1850;
          runtimeRef.current.headNodUntil = now + 900;
          runtimeRef.current.mode = 'idle';

          setCharacterState('idle');
          setIsPaused(false);
          setRevealedCharCount(payload.introText.length);
          setIsNarrationFinished(true);

          if (highlightHideTimeoutRef.current !== null) {
            window.clearTimeout(highlightHideTimeoutRef.current);
          }
          highlightHideTimeoutRef.current = window.setTimeout(() => {
            clearHighlightAndPointing();
          }, 900);

          subtitleHideTimeoutRef.current = window.setTimeout(
            () => {
              setShowSubtitle(false);
            },
            payload.targetType === 'food_recommendation'
              ? 22000
              : GUIDE_CHARACTER_CONFIG.SUBTITLE_AUTO_HIDE_MS
          );
        },
      }, targetSpeechLang);
    },
    [aimCharacterGazeAtScreenPoint, clearHighlightAndPointing]
  );

  // Khi người dùng chuyển đổi ngôn ngữ (VN <-> EN): đổi ngay ngôn ngữ giọng nói của nhân vật 3D
  useEffect(() => {
    if (prevLanguageRef.current === language) return;
    prevLanguageRef.current = language;
    const nextLang: 'vi' | 'en' = language === 'en' ? 'en' : 'vi';
    guideVoiceService.setLanguage(nextLang);
    guideVoiceService.stop();

    if (hasUserInteractedWithAppRef.current && !prefs.muted) {
      const switchGreeting =
        nextLang === 'en'
          ? 'Hello! I have switched to English. Touch any province on the map or tap any feature to hear my English narration!'
          : 'Xin chào! Mình đã chuyển sang giọng thuyết minh Tiếng Việt. Hãy chạm vào bản đồ hoặc các tính năng để nghe mình giới thiệu nhé!';
      startNarrationWithReaction(
        {
          id: `lang-switched-${nextLang}-${Date.now()}`,
          title: nextLang === 'en' ? '3D Guide · English Mode' : 'HDV 3D · Chế độ Tiếng Việt',
          introText: switchGreeting,
          targetType: 'greeting',
          lang: nextLang,
        },
        true
      );
    }
  }, [language, prefs.muted, startNarrationWithReaction]);

  // Hàm phát lời giải thích cách dùng giao diện (UI Guide) kèm làm nổi bật phần tử và chỉ tay
  const triggerUiGuideExplanation = useCallback(
    (
      guideId: string,
      item: GuideContentEntry,
      targetElement: HTMLElement | null,
      saveForUseThisButton: boolean = false
    ) => {
      const now = performance.now();
      // Chống bấm liên tục: không kích hoạt lại cùng một guideId trong vòng 1.5 giây
      if (
        lastGuideTriggerRef.current.id === guideId &&
        now - lastGuideTriggerRef.current.timestamp < 1500
      ) {
        return;
      }
      lastGuideTriggerRef.current = { id: guideId, timestamp: now };

      if (saveForUseThisButton && targetElement) {
        pendingActionElementRef.current = targetElement;
        setHasPendingGuideAction(true);
      } else {
        pendingActionElementRef.current = null;
        setHasPendingGuideAction(false);
      }

      let screenX: number | undefined;
      let screenY: number | undefined;

      if (targetElement) {
        highlightedElementRef.current = targetElement;
        updateHighlightRectFromElement(targetElement);
        const rect = targetElement.getBoundingClientRect();
        screenX = rect.left + rect.width / 2;
        screenY = rect.top + rect.height / 2;

        if (highlightHideTimeoutRef.current !== null) {
          window.clearTimeout(highlightHideTimeoutRef.current);
        }
        // Tự tắt khung sáng sau tối đa 8 giây
        highlightHideTimeoutRef.current = window.setTimeout(() => {
          clearHighlightAndPointing();
        }, 8000);
      } else {
        clearHighlightAndPointing();
      }

      const localizedItem = localizeGuideEntry(item, languageRef.current);
      startNarrationWithReaction(
        {
          id: `ui-guide-${guideId}`,
          guideId,
          title: localizedItem.title,
          introText: localizedItem.say,
          tip: localizedItem.tip,
          targetType: 'ui_guide',
          lang: languageRef.current,
          screenX,
          screenY,
        },
        true
      );
    },
    [clearHighlightAndPointing, startNarrationWithReaction, updateHighlightRectFromElement]
  );

  // Danh sách các bước "Tham quan app" được sắp xếp theo thứ tự `order` và ngôn ngữ hiện tại
  const orderedTourSteps = React.useMemo(() => getOrderedAppTourSteps(language), [language]);

  const runTourStepAtIndex = useCallback(
    (index: number) => {
      if (index < 0 || index >= orderedTourSteps.length) {
        setTourStepIndex(null);
        clearHighlightAndPointing();
        return;
      }
      setTourStepIndex(index);
      setShowControlMenu(false);
      setShowWelcomeTourPrompt(false);

      const step = orderedTourSteps[index];
      if (step.entry.tab && onNavigateTab && activeTab !== step.entry.tab) {
        onNavigateTab(step.entry.tab);
      }

      window.setTimeout(() => {
        const el = document.querySelector<HTMLElement>(`[data-guide-id="${step.guideId}"]`);
        if (el) {
          try {
            el.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
          } catch {
            // ignore
          }
        }
        window.setTimeout(() => {
          const refreshedEl = document.querySelector<HTMLElement>(
            `[data-guide-id="${step.guideId}"]`
          );
          markGuideIdSeen(step.guideId);
          lastGuideTriggerRef.current = { id: '', timestamp: 0 };
          triggerUiGuideExplanation(step.guideId, step.entry, refreshedEl, false);
        }, 180);
      }, 140);
    },
    [
      activeTab,
      clearHighlightAndPointing,
      markGuideIdSeen,
      onNavigateTab,
      orderedTourSteps,
      triggerUiGuideExplanation,
    ]
  );

  // Lắng nghe sự kiện đọc thuyết minh từ bản đồ (Ưu tiên cao hơn giải thích giao diện)
  useEffect(() => {
    const handleNarrate = (event: Event) => {
      const custom = event as CustomEvent<GuideNarrationPayload>;
      if (custom.detail) {
        lastContentNarrationTimestampRef.current = performance.now();
        setTourStepIndex(null);
        startNarrationWithReaction(custom.detail, false);
      }
    };

    window.addEventListener(GUIDE_NARRATE_EVENT, handleNarrate);
    const handleStartTour = () => {
      guideVoiceService.unlockAudioOnUserGesture();
      runTourStepAtIndex(0);
    };
    window.addEventListener('hdv_start_app_tour', handleStartTour);
    return () => {
      window.removeEventListener(GUIDE_NARRATE_EVENT, handleNarrate);
      window.removeEventListener('hdv_start_app_tour', handleStartTour);
    };
  }, [runTourStepAtIndex, startNarrationWithReaction]);

  // Lắng nghe sự kiện click ở giai đoạn Capture trên document cho Hệ thống Hướng dẫn theo ngữ cảnh
  useEffect(() => {
    const handleCapturePointerDown = (e: PointerEvent) => {
      hasUserInteractedWithAppRef.current = true;
      guideVoiceService.unlockAudioOnUserGesture();
      globalPointerStartRef.current = {
        x: e.clientX,
        y: e.clientY,
        timestamp: performance.now(),
      };
    };

    const handleCaptureClick = (e: MouseEvent) => {
      guideVoiceService.unlockAudioOnUserGesture();
      if (isBypassingGuideClickRef.current) return;

      const target = e.target as HTMLElement | null;
      if (!target || typeof target.closest !== 'function') return;

      // Bỏ qua các cú bấm vào chính nhân vật 3D, bong bóng phụ đề hoặc menu điều khiển
      if (target.closest('[data-guide-ignore="true"]')) return;

      // Bỏ qua nếu người dùng đang kéo bản đồ hoặc cử chỉ kéo (> 8px) hoặc nhấn giữ (> 600ms)
      if (runtimeRef.current.isMapInteracting) return;
      const pStart = globalPointerStartRef.current;
      if (pStart && e.isTrusted) {
        const moveDist = Math.hypot(e.clientX - pStart.x, e.clientY - pStart.y);
        const pressDuration = performance.now() - pStart.timestamp;
        if (moveDist > 8 || pressDuration > 600) {
          return;
        }
      }

      const mode = guideModeRef.current;
      if (mode === 'off') return;

      // Kiểm tra nếu bấm vào nội dung di sản / tỉnh thành (data-guide-type="content") -> Giữ nguyên hành vi thuyết minh văn hóa
      const closestContent = target.closest('[data-guide-type="content"]');
      const closestGuideEl = target.closest('[data-guide-id]') as HTMLElement | null;

      if (!closestGuideEl) return;
      if (
        closestGuideEl.getAttribute('data-guide-type') === 'content' ||
        (closestContent && closestGuideEl.contains(closestContent))
      ) {
        return;
      }

      // Ở chế độ "Lần đầu", không làm phiền khi người dùng đang gõ chữ trực tiếp trong input/textarea
      const tagName = target.tagName.toLowerCase();
      const isTextInput =
        tagName === 'input' ||
        tagName === 'textarea' ||
        tagName === 'select' ||
        target.isContentEditable;
      if (mode === 'first_time' && isTextInput && document.activeElement === target) {
        return;
      }

      const guideId = closestGuideEl.getAttribute('data-guide-id');
      if (!guideId) return;

      const contentItem = getGuideContentOrFallback(guideId, closestGuideEl, languageRef.current);

      if (mode === 'guide') {
        // Chế độ "Hướng dẫn": chặn hành động gốc để giải thích trước và hiện nút "Dùng phần này"
        e.preventDefault();
        e.stopPropagation();
        markGuideIdSeen(guideId);
        triggerUiGuideExplanation(guideId, contentItem, closestGuideEl, true);
      } else if (mode === 'first_time') {
        // Khi người dùng bấm vào các nút chuyển trang (thanh điều hướng trên/dưới, logo hoặc nút tắt mở trang):
        // nhường cho sự kiện chuyển trang (activeTab) tự động thuyết minh cách sử dụng trang vừa mở!
        const isPageNavigationTrigger =
          (guideId.startsWith('nav.') &&
            guideId !== 'nav.more' &&
            guideId !== 'nav.language') ||
          guideId === 'home.heroRecognize' ||
          guideId === 'home.heroStory' ||
          guideId === 'home.openFullscreenMap' ||
          guideId === 'home.toolsDashboard';

        if (isPageNavigationTrigger) {
          markGuideIdSeen(guideId);
          // Nếu bấm lại đúng tab của trang đang mở sẵn -> nhắc lại ngay cách sử dụng trang hiện tại
          const targetTabFromNav = contentItem.tab;
          const currentScreenId = SCREEN_ID_BY_TAB[activeTab];
          const targetScreenId = targetTabFromNav ? SCREEN_ID_BY_TAB[targetTabFromNav] : null;
          if (targetScreenId && targetScreenId === currentScreenId) {
            const rawScreenGuide = GUIDE_CONTENT[currentScreenId];
            if (rawScreenGuide) {
              const screenGuide = localizeGuideEntry(rawScreenGuide, languageRef.current);
              const primaryGuideId = PRIMARY_GUIDE_ID_BY_TAB[activeTab];
              const primaryEl = primaryGuideId
                ? document.querySelector<HTMLElement>(`[data-guide-id="${primaryGuideId}"]`)
                : null;
              window.setTimeout(() => {
                triggerUiGuideExplanation(currentScreenId, screenGuide, primaryEl, false);
              }, 120);
            }
          }
          return;
        }

        // Chế độ "Lần đầu": KHÔNG chặn hành động gốc; giải thích phần tử điều khiển trên trang
        if (seenGuideIdsRef.current.has(guideId)) return;
        // Nhường quyền ưu tiên nếu vừa bấm vào tỉnh/di sản trên bản đồ
        if (performance.now() - lastContentNarrationTimestampRef.current < 350) return;

        markGuideIdSeen(guideId);
        triggerUiGuideExplanation(guideId, contentItem, closestGuideEl, false);
      }
    };

    document.addEventListener('pointerdown', handleCapturePointerDown, {
      capture: true,
      passive: true,
    });
    document.addEventListener('click', handleCaptureClick, { capture: true });

    return () => {
      document.removeEventListener('pointerdown', handleCapturePointerDown, {
        capture: true,
      });
      document.removeEventListener('click', handleCaptureClick, { capture: true });
    };
  }, [activeTab, markGuideIdSeen, triggerUiGuideExplanation]);

  // Khi người dùng bấm chuyển sang bất kỳ trang/màn hình nào -> nhân vật 3D tự động bày cách sử dụng trang đó
  useEffect(() => {
    const isTabSwitch = prevActiveTabRef.current !== activeTab;
    prevActiveTabRef.current = activeTab;

    // Nếu đang chạy "Tham quan app" tự động thì để bộ điều khiển tour xử lý
    if (tourStepIndex !== null) return;

    const screenId = SCREEN_ID_BY_TAB[activeTab];
    if (!screenId) return;

    // Lần đầu tiên mở app (chưa có tương tác người dùng): hiển thị lời mời "Tham quan app" không tự phát âm thanh
    if (activeTab === 'home' && !hasUserInteractedWithAppRef.current && !isTabSwitch) {
      let alreadyPrompted = false;
      try {
        alreadyPrompted = localStorage.getItem(GUIDE_WELCOME_PROMPTED_KEY) === '1';
      } catch {
        // ignore
      }
      if (!alreadyPrompted && seenGuideIdsRef.current.size === 0) {
        const rawHomeGuide = GUIDE_CONTENT['screen.home'];
        if (rawHomeGuide) {
          const homeGuide = localizeGuideEntry(rawHomeGuide, languageRef.current);
          setActiveNarration({
            id: 'welcome-tour-offer',
            guideId: 'screen.home',
            title: homeGuide.title,
            introText: homeGuide.say,
            tip: homeGuide.tip,
            targetType: 'ui_guide',
            lang: languageRef.current,
          });
          setRevealedCharCount(homeGuide.say.length);
          setIsNarrationFinished(true);
          setShowSubtitle(true);
          setShowWelcomeTourPrompt(true);
          try {
            localStorage.setItem(GUIDE_WELCOME_PROMPTED_KEY, '1');
          } catch {
            // ignore
          }
        }
      }
      return;
    }

    if (guideModeRef.current === 'off') return;
    if (performance.now() - lastContentNarrationTimestampRef.current < 2500) return;

    const rawScreenGuide = GUIDE_CONTENT[screenId];
    if (!rawScreenGuide) return;
    const screenGuide = localizeGuideEntry(rawScreenGuide, languageRef.current);

    const timer = window.setTimeout(() => {
      if (performance.now() - lastContentNarrationTimestampRef.current < 2500) return;
      markGuideIdSeen(screenId);

      // Tìm phần tử điều khiển chính trên trang vừa mở để tô vòng sáng vàng và cho rồng 3D chỉ tay hướng dẫn
      const primaryGuideId = PRIMARY_GUIDE_ID_BY_TAB[activeTab];
      const primaryEl = primaryGuideId
        ? document.querySelector<HTMLElement>(`[data-guide-id="${primaryGuideId}"]`)
        : null;

      triggerUiGuideExplanation(screenId, screenGuide, primaryEl, false);
    }, 240);

    return () => window.clearTimeout(timer);
  }, [activeTab, markGuideIdSeen, tourStepIndex, triggerUiGuideExplanation]);

  // Lắng nghe sự kiện đóng/mở Bottom Sheet và trạng thái kéo/zoom của Bản đồ
  useEffect(() => {
    const handleSheetState = (event: Event) => {
      const custom = event as CustomEvent<{
        sheetState: 'collapsed' | 'half' | 'full';
        sheetHeightVh: number;
      }>;
      if (custom.detail) {
        setMapSheetState(custom.detail);
      }
    };

    const handleMapInteraction = (event: Event) => {
      const custom = event as CustomEvent<{ active: boolean }>;
      if (custom.detail) {
        runtimeRef.current.isMapInteracting = Boolean(custom.detail.active);
      }
    };

    window.addEventListener(GUIDE_MAP_SHEET_EVENT, handleSheetState);
    window.addEventListener(GUIDE_MAP_INTERACTION_EVENT, handleMapInteraction);
    return () => {
      window.removeEventListener(GUIDE_MAP_SHEET_EVENT, handleSheetState);
      window.removeEventListener(GUIDE_MAP_INTERACTION_EVENT, handleMapInteraction);
    };
  }, []);

  // ============================================================================
  // KHỞI TẠO SCENE THREE.JS, KHUÔN MẶT CHIBI DỄ THƯƠNG & BỘ XƯƠNG RIGIFY
  // ============================================================================
  useEffect(() => {
    if (!isSceneReady || use2DFallback || prefs.isHidden || !canvasContainerRef.current) return;

    const container = canvasContainerRef.current;
    const width = container.clientWidth || GUIDE_CHARACTER_CONFIG.MOBILE_WIDTH_PX;
    const height =
      container.clientHeight || Math.round(width * GUIDE_CHARACTER_CONFIG.ASPECT_RATIO);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(27, width / height, 0.05, 30);
    camera.position.set(0, 1.46, 1.38);
    camera.lookAt(0, 1.42, 0);

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
        powerPreference: 'high-performance',
      });
    } catch {
      setUse2DFallback(true);
      return;
    }

    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(
      Math.min(window.devicePixelRatio || 1, GUIDE_CHARACTER_CONFIG.MAX_PIXEL_RATIO)
    );
    renderer.setSize(width, height);
    renderer.shadowMap.enabled = false;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.08;

    const handleContextLost = (e: Event) => {
      e.preventDefault();
      setUse2DFallback(true);
    };
    renderer.domElement.addEventListener('webglcontextlost', handleContextLost, false);

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // Bản đồ phản xạ môi trường Studio giúp vật liệu PBR (rong.glb) sắc nét, tươi sáng trên mọi thiết bị
    try {
      const pmremGenerator = new THREE.PMREMGenerator(renderer);
      scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
      pmremGenerator.dispose();
    } catch {
      // ignore if PMREM fails on legacy context
    }

    // ------------------------------------------------------------------------
    // HỆ THỐNG ÁNH SÁNG MỀM MẠI, TÔN NHÂN VẬT RÕ NÉT TRÊN NỀN TỐI
    // ------------------------------------------------------------------------
    // Đèn môi trường ấm áp giúp vùng tối dưới nón vẫn sáng rõ
    const hemiLight = new THREE.HemisphereLight(0xfff7ed, 0x334155, 1.75);
    hemiLight.position.set(0, 3.5, 1.5);
    scene.add(hemiLight);

    // Đèn chính (Key Light) chiếu từ phía trước hơi lệch lên trên để nhân vật có khối mềm và mắt sáng
    const frontKeyLight = new THREE.DirectionalLight(0xfffaf0, 1.75);
    frontKeyLight.position.set(0.65, 2.15, 2.9);
    scene.add(frontKeyLight);

    // Đèn phụ (Fill Light) làm dịu bóng bên đối diện
    const softFillLight = new THREE.DirectionalLight(0xe0f2fe, 0.85);
    softFillLight.position.set(-1.6, 1.5, 2.2);
    scene.add(softFillLight);

    // Đèn viền màu vàng nhẹ phía sau (Warm Gold Rim Light) tách nhân vật khỏi nền tối
    const backGoldRimLight = new THREE.PointLight(0xfbbf24, 2.4, 6);
    backGoldRimLight.position.set(0, 1.25, -1.45);
    scene.add(backGoldRimLight);

    const rootGroup = new THREE.Group();
    scene.add(rootGroup);

    // Nhóm xoay trung tâm cho mô hình nguyên khối (như rong.glb từ tin1511/tour-guide-3d)
    const characterPivotGroup = new THREE.Group();
    rootGroup.add(characterPivotGroup);

    let propStaffMesh: THREE.Object3D | null = null;
    const propStaffRestPos = new THREE.Vector3();
    const propStaffRestQuat = new THREE.Quaternion();
    const propStaffShoulderPivot = new THREE.Vector3(0.155, 0.49377, 0.125);
    const _tmpVec3 = new THREE.Vector3();
    let vietnamFlagGroup: THREE.Group | null = null;
    const vietnamFlagRestQuat = new THREE.Quaternion();
    let vietnamFlagGeo: THREE.BufferGeometry | null = null;
    let vietnamFlagBaseX: Float32Array | null = null;
    let vietnamFlagBaseY: Float32Array | null = null;
    const VIET_FLAG_WIDTH = 0.146;
    const VIET_FLAG_HEIGHT = 0.098;
    let rongBodyMesh: THREE.Mesh | null = null;
    let rongTongueMesh: THREE.Mesh | null = null;
    const rongMorphCurrent = {
      mouthOpen: 0,
      mouthClose: 0.85,
      leftArmRaise: 0,
      leftArmWave: 0,
      rightArmRaise: 0,
      rightArmWave: 0,
    };
    let gltfMixer: THREE.AnimationMixer | null = null;

    // Cấu trúc lưu trữ xương Rigify tìm theo tiền tố
    interface RigifyBones {
      spine?: THREE.Bone;
      spine001?: THREE.Bone;
      spine002?: THREE.Bone;
      spine003?: THREE.Bone;
      spine004?: THREE.Bone;
      spine005?: THREE.Bone;
      spine006?: THREE.Bone; // Xương đầu (Head)
      shoulderL?: THREE.Bone;
      upperArmL?: THREE.Bone;
      forearmL?: THREE.Bone;
      handL?: THREE.Bone;
      shoulderR?: THREE.Bone;
      upperArmR?: THREE.Bone;
      forearmR?: THREE.Bone;
      handR?: THREE.Bone;
    }

    const rigBones: RigifyBones = {};
    const restQuats = new Map<THREE.Bone, THREE.Quaternion>();

    // Cấu trúc lưu Morph Targets (nếu mô hình ngoài có sẵn)
    interface MorphBinding {
      mesh: THREE.Mesh;
      smileIdx: number;
      mouthOpenIdx: number;
      blinkIdx: number;
      browRaiseIdx: number;
    }
    const morphBindings: MorphBinding[] = [];

    // Cấu trúc điều khiển Khuôn Mặt Chibi gắn trực tiếp vào xương đầu `spine.006`
    interface ChibiFaceRig {
      root: THREE.Group;
      leftEyeSocket: THREE.Group;
      rightEyeSocket: THREE.Group;
      leftIrisGroup: THREE.Group;
      rightIrisGroup: THREE.Group;
      leftEyelid: THREE.Mesh;
      rightEyelid: THREE.Mesh;
      leftUpperLash: THREE.Mesh;
      rightUpperLash: THREE.Mesh;
      leftBrow: THREE.Mesh;
      rightBrow: THREE.Mesh;
      mouthGroup: THREE.Group;
      mouthCavity: THREE.Mesh;
      mouthTeeth: THREE.Mesh;
      mouthTongue: THREE.Mesh;
      upperLipSmileArc: THREE.Mesh;
      lowerLipSmileArc: THREE.Mesh;
      leftBlush: THREE.Mesh;
      rightBlush: THREE.Mesh;
      baseEyeY: number;
      baseBrowY: number;
      baseMouthY: number;
    }
    let chibiFaceRig: ChibiFaceRig | null = null;

    /**
     * Khởi tạo toàn bộ Khuôn Mặt Chibi dễ thương gắn vào `parentGroup` (xương đầu `spine.006`
     * hoặc nhóm đầu của nhân vật dự phòng), tái sử dụng toàn bộ geometry và material.
     */
    const createChibiFaceRig = (parentGroup: THREE.Object3D): ChibiFaceRig => {
      const rigRoot = new THREE.Group();
      rigRoot.name = 'ChibiFaceRig_HDV3D';
      // Đặt tâm khối đầu khớp tự nhiên dưới vành mũ khăn đóng (y = +0.075) và trên cổ (y = -0.085)
      rigRoot.position.set(0, 0.016, 0.008);
      parentGroup.add(rigRoot);

      const toonGradient = getSharedToonGradientMap();

      // 1. ĐẦU TRÒN BẦU CHIBI + ĐƯỜNG VIỀN MẢNH QUANH MẶT + ĐÔI TAI NHỎ GỌN
      const headGeo = createChibiHeadGeometry(
        GUIDE_CHARACTER_CONFIG.SKIN_COLOR,
        GUIDE_CHARACTER_CONFIG.SKIN_SHADOW_COLOR,
        GUIDE_CHARACTER_CONFIG.BLUSH_COLOR
      );
      const headSkinMat = new THREE.MeshToonMaterial({
        color: 0xffffff,
        vertexColors: true,
        gradientMap: toonGradient,
      });
      const headMesh = new THREE.Mesh(headGeo, headSkinMat);
      headMesh.renderOrder = 1;
      rigRoot.add(headMesh);

      // Đường viền mảnh (Toon Inverted-Hull Outline) bao quanh khuôn mặt để nổi bật ở cỡ 120-190px
      const outlineMat = new THREE.MeshBasicMaterial({
        color: GUIDE_CHARACTER_CONFIG.FACE_OUTLINE_COLOR,
        side: THREE.BackSide,
      });
      const headOutlineMesh = new THREE.Mesh(headGeo, outlineMat);
      headOutlineMesh.scale.set(1.03, 1.028, 1.022);
      headOutlineMesh.renderOrder = 0;
      rigRoot.add(headOutlineMesh);

      // Hai tai nhỏ gọn hai bên (kèm viền mảnh và hõm tai ấm)
      const earGeo = new THREE.SphereGeometry(0.017, 16, 14);
      earGeo.scale(0.72, 1.18, 0.55);
      const earMat = new THREE.MeshToonMaterial({
        color: GUIDE_CHARACTER_CONFIG.SKIN_COLOR,
        gradientMap: toonGradient,
      });
      const innerEarGeo = new THREE.SphereGeometry(0.0095, 12, 10);
      innerEarGeo.scale(0.65, 1.05, 0.4);
      const innerEarMat = new THREE.MeshBasicMaterial({
        color: GUIDE_CHARACTER_CONFIG.SKIN_SHADOW_COLOR,
      });

      const buildEar = (side: -1 | 1) => {
        const earGroup = new THREE.Group();
        earGroup.position.set(side * 0.121, -0.006, -0.004);
        earGroup.rotation.y = side * -0.18;
        earGroup.rotation.z = side * 0.08;

        const earMain = new THREE.Mesh(earGeo, earMat);
        const earOutline = new THREE.Mesh(earGeo, outlineMat);
        earOutline.scale.setScalar(1.08);
        const earInner = new THREE.Mesh(innerEarGeo, innerEarMat);
        earInner.position.set(side * 0.002, 0, 0.006);

        earGroup.add(earOutline, earMain, earInner);
        rigRoot.add(earGroup);
      };
      buildEar(-1);
      buildEar(1);

      // 2. ĐÔI MẮT CHIBI TO TRÒN ELIP DỌC (50-55% chiều cao mặt, cách nhau ~1 chiều rộng mắt)
      const eyeScale = GUIDE_CHARACTER_CONFIG.EYE_SIZE;
      const eyeRadiusX = 0.0185 * eyeScale; // Chiều rộng 1 mắt ~ 0.037
      const eyeRadiusY = 0.0230 * eyeScale; // Chiều cao 1 mắt ~ 0.046 (hình elip dọc dễ thương)
      const eyeSpacingHalfX = 0.0385;       // Hai mắt đặt tại x = ±0.0385 -> cách nhau ~1 chiều rộng mắt
      const baseEyeY = -0.004;              // Tương ứng ~53% tính từ đỉnh đầu xuống cằm
      const eyeFrontZ = 0.115;

      const scleraGeo = new THREE.CircleGeometry(1, 28);
      const scleraMat = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        polygonOffset: true,
        polygonOffsetFactor: -1,
        polygonOffsetUnits: -1,
      });

      const irisGeo = new THREE.CircleGeometry(1, 28);
      const irisMat = new THREE.MeshBasicMaterial({
        color: GUIDE_CHARACTER_CONFIG.EYE_COLOR,
        polygonOffset: true,
        polygonOffsetFactor: -2,
        polygonOffsetUnits: -2,
      });

      // Ánh nâu hạt dẻ sáng ấm ở nửa dưới tròng mắt
      const irisWarmArcGeo = new THREE.RingGeometry(0.42, 0.86, 20, 1, Math.PI * 1.15, Math.PI * 0.7);
      const irisWarmArcMat = new THREE.MeshBasicMaterial({
        color: GUIDE_CHARACTER_CONFIG.EYE_LOWER_WARM_COLOR,
        side: THREE.DoubleSide,
        polygonOffset: true,
        polygonOffsetFactor: -3,
        polygonOffsetUnits: -3,
      });

      const pupilGeo = new THREE.CircleGeometry(1, 24);
      const pupilMat = new THREE.MeshBasicMaterial({
        color: 0x0b0604,
        polygonOffset: true,
        polygonOffsetFactor: -4,
        polygonOffsetUnits: -4,
      });

      const catchlightGeo = new THREE.CircleGeometry(1, 20);
      const catchlightMat = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        polygonOffset: true,
        polygonOffsetFactor: -5,
        polygonOffsetUnits: -5,
      });

      // Mi trên mảnh màu nâu đen ôm sát mí trên
      const upperLashGeo = new THREE.TorusGeometry(1, 0.095, 10, 28, Math.PI * 0.92);
      const browAndLashMat = new THREE.MeshBasicMaterial({
        color: GUIDE_CHARACTER_CONFIG.EYEBROW_COLOR,
      });

      // Nắp mi (eyelid) cùng màu da để chớp mắt từ trên xuống
      const eyelidGeo = new THREE.CircleGeometry(1.06, 24, 0, Math.PI);
      // Dịch đỉnh nắp mi lên trên để khi scale.y từ 0 -> 1 nắp mi hạ từ trên xuống che kín mắt
      eyelidGeo.translate(0, -1.0, 0);
      const eyelidMat = new THREE.MeshBasicMaterial({
        color: GUIDE_CHARACTER_CONFIG.SKIN_COLOR,
        side: THREE.DoubleSide,
        polygonOffset: true,
        polygonOffsetFactor: -6,
        polygonOffsetUnits: -6,
      });

      const buildChibiEye = (side: -1 | 1) => {
        const socket = new THREE.Group();
        socket.position.set(side * eyeSpacingHalfX, baseEyeY, eyeFrontZ);
        // Nghiêng nhẹ theo độ cong của gò má nhưng hướng ánh nhìn chính diện về người dùng
        socket.rotation.y = side * 0.14;
        socket.rotation.x = -0.03;

        // Tròng trắng (elip dọc)
        const sclera = new THREE.Mesh(scleraGeo, scleraMat);
        sclera.scale.set(eyeRadiusX, eyeRadiusY, 1);
        sclera.renderOrder = 2;
        socket.add(sclera);

        // Nhóm Tròng mắt nâu hạt dẻ + Đồng tử đen + 2 Điểm sáng trắng (di chuyển mượt theo ánh nhìn)
        const irisGroup = new THREE.Group();
        // Ánh nhìn mặc định hướng nhẹ vào trung tâm / người dùng
        irisGroup.position.set(-side * 0.0012, 0, 0.0008);
        socket.add(irisGroup);

        const iris = new THREE.Mesh(irisGeo, irisMat);
        iris.scale.set(eyeRadiusX * 0.78, eyeRadiusY * 0.80, 1);
        iris.renderOrder = 3;
        irisGroup.add(iris);

        const irisWarm = new THREE.Mesh(irisWarmArcGeo, irisWarmArcMat);
        irisWarm.scale.set(eyeRadiusX * 0.76, eyeRadiusY * 0.78, 1);
        irisWarm.position.z = 0.0002;
        irisWarm.renderOrder = 4;
        irisGroup.add(irisWarm);

        const pupil = new THREE.Mesh(pupilGeo, pupilMat);
        pupil.scale.set(eyeRadiusX * 0.46, eyeRadiusY * 0.49, 1);
        pupil.position.z = 0.0004;
        pupil.renderOrder = 5;
        irisGroup.add(pupil);

        // Điểm sáng trắng TO ở góc trên
        const bigHighlight = new THREE.Mesh(catchlightGeo, catchlightMat);
        bigHighlight.scale.set(eyeRadiusX * 0.27, eyeRadiusX * 0.29, 1);
        bigHighlight.position.set(
          eyeRadiusX * 0.26,
          eyeRadiusY * 0.30,
          0.0007
        );
        bigHighlight.renderOrder = 6;
        irisGroup.add(bigHighlight);

        // Điểm sáng trắng NHỎ ở góc dưới đối diện
        const smallHighlight = new THREE.Mesh(catchlightGeo, catchlightMat);
        smallHighlight.scale.set(eyeRadiusX * 0.14, eyeRadiusX * 0.14, 1);
        smallHighlight.position.set(
          -eyeRadiusX * 0.25,
          -eyeRadiusY * 0.26,
          0.0007
        );
        smallHighlight.renderOrder = 6;
        irisGroup.add(smallHighlight);

        // Nắp mi cùng màu da (hạ từ mí trên xuống khi chớp mắt)
        const eyelid = new THREE.Mesh(eyelidGeo, eyelidMat);
        eyelid.position.set(0, eyeRadiusY * 1.02, 0.0012);
        eyelid.scale.set(eyeRadiusX * 1.04, 0.001, 1);
        eyelid.visible = false;
        eyelid.renderOrder = 7;
        socket.add(eyelid);

        // Mi trên mảnh màu nâu đen
        const upperLash = new THREE.Mesh(upperLashGeo, browAndLashMat);
        upperLash.scale.set(eyeRadiusX * 1.02, eyeRadiusY * 0.98, 0.4);
        upperLash.rotation.z = Math.PI * 0.04;
        upperLash.position.set(0, 0.001, 0.0015);
        upperLash.renderOrder = 8;
        socket.add(upperLash);

        rigRoot.add(socket);
        return { socket, irisGroup, eyelid, upperLash };
      };

      const leftEye = buildChibiEye(-1);
      const rightEye = buildChibiEye(1);

      // 3. CHÂN MÀY MẢNH, CONG NHẸ, MÀU NÂU ĐEN (Đặt cao hơn mắt vừa phải, không che mắt)
      const baseBrowY = baseEyeY + eyeRadiusY + 0.012;
      const browGeo = new THREE.TorusGeometry(0.019 * eyeScale, 0.0024, 8, 20, Math.PI * 0.68);

      const leftBrow = new THREE.Mesh(browGeo, browAndLashMat);
      leftBrow.position.set(-eyeSpacingHalfX, baseBrowY, eyeFrontZ - 0.001);
      leftBrow.rotation.set(-0.08, -0.14, Math.PI * 0.16);
      leftBrow.scale.set(1, 0.62, 0.55);
      leftBrow.renderOrder = 8;
      rigRoot.add(leftBrow);

      const rightBrow = new THREE.Mesh(browGeo, browAndLashMat);
      rightBrow.position.set(eyeSpacingHalfX, baseBrowY, eyeFrontZ - 0.001);
      rightBrow.rotation.set(-0.08, 0.14, Math.PI * 0.16);
      rightBrow.scale.set(1, 0.62, 0.55);
      rightBrow.renderOrder = 8;
      rigRoot.add(rightBrow);

      // 4. MŨI NHỎ XINH NẰM GIỮA (Khối giọt nước nhỏ nhắn có bóng ấm nhẹ, không to/đậm)
      const noseGeo = new THREE.SphereGeometry(0.0052, 14, 12);
      noseGeo.scale(0.88, 0.78, 0.72);
      const noseMat = new THREE.MeshToonMaterial({
        color: new THREE.Color(GUIDE_CHARACTER_CONFIG.SKIN_SHADOW_COLOR).offsetHSL(
          -0.01,
          0.08,
          -0.04
        ),
        gradientMap: toonGradient,
      });
      const noseMesh = new THREE.Mesh(noseGeo, noseMat);
      noseMesh.position.set(0, -0.021, 0.121);
      noseMesh.renderOrder = 6;
      rigRoot.add(noseMesh);

      // 5. HAI MÁ HỒNG ELIP DỊU DÀNG (Độ trong suốt 35-50%)
      const blushTex = getSharedBlushTexture(GUIDE_CHARACTER_CONFIG.BLUSH_COLOR);
      const blushGeo = new THREE.PlaneGeometry(0.036, 0.022);
      const blushMat = new THREE.MeshBasicMaterial({
        map: blushTex,
        transparent: true,
        opacity: GUIDE_CHARACTER_CONFIG.BLUSH_OPACITY,
        depthWrite: false,
        polygonOffset: true,
        polygonOffsetFactor: -2,
        polygonOffsetUnits: -2,
      });

      const leftBlush = new THREE.Mesh(blushGeo, blushMat);
      leftBlush.position.set(-0.058, -0.024, 0.111);
      leftBlush.rotation.set(0.06, -0.26, -0.05);
      leftBlush.renderOrder = 5;
      rigRoot.add(leftBlush);

      const rightBlush = new THREE.Mesh(blushGeo, blushMat);
      rightBlush.position.set(0.058, -0.024, 0.111);
      rightBlush.rotation.set(0.06, 0.26, 0.05);
      rightBlush.renderOrder = 5;
      rigRoot.add(rightBlush);

      // 6. MIỆNG NHỎ CHIBI 3 TRẠNG THÁI (Cười nhẹ, Cười tươi lộ chút răng trắng, Mở miệng khi nói)
      const baseMouthY = -0.048;
      const mouthGroup = new THREE.Group();
      mouthGroup.position.set(0, baseMouthY, 0.114);
      mouthGroup.rotation.x = 0.08;
      rigRoot.add(mouthGroup);

      const mouthHalfW = 0.0165;

      // Khoang miệng tối bên trong khi mở miệng hoặc cười tươi
      const cavityGeo = new THREE.CircleGeometry(mouthHalfW, 24);
      const cavityMat = new THREE.MeshBasicMaterial({
        color: 0x380812,
        side: THREE.DoubleSide,
        polygonOffset: true,
        polygonOffsetFactor: -2,
        polygonOffsetUnits: -2,
      });
      const mouthCavity = new THREE.Mesh(cavityGeo, cavityMat);
      mouthCavity.scale.set(1, 0.05, 1);
      mouthCavity.visible = false;
      mouthCavity.renderOrder = 6;
      mouthGroup.add(mouthCavity);

      // Hàng răng trắng nhỏ xinh ở mép trên khi cười tươi hoặc vừa cười vừa nói
      const teethGeo = new THREE.PlaneGeometry(mouthHalfW * 1.32, 0.0052);
      const teethMat = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        side: THREE.DoubleSide,
        polygonOffset: true,
        polygonOffsetFactor: -4,
        polygonOffsetUnits: -4,
      });
      const mouthTeeth = new THREE.Mesh(teethGeo, teethMat);
      mouthTeeth.position.set(0, 0.0024, 0.0005);
      mouthTeeth.visible = false;
      mouthTeeth.renderOrder = 7;
      mouthGroup.add(mouthTeeth);

      // Lưỡi hồng dịu bên dưới khoang miệng
      const tongueGeo = new THREE.CircleGeometry(mouthHalfW * 0.62, 18, Math.PI, Math.PI);
      const tongueMat = new THREE.MeshBasicMaterial({
        color: 0xf47986,
        side: THREE.DoubleSide,
        polygonOffset: true,
        polygonOffsetFactor: -3,
        polygonOffsetUnits: -3,
      });
      const mouthTongue = new THREE.Mesh(tongueGeo, tongueMat);
      mouthTongue.position.set(0, -0.0012, 0.0003);
      mouthTongue.scale.set(1, 0.05, 1);
      mouthTongue.visible = false;
      mouthTongue.renderOrder = 7;
      mouthGroup.add(mouthTongue);

      // Đôi môi màu hồng đỏ dịu (mặc định mỉm cười nhẹ, cong tươi khi vui)
      const lipMat = new THREE.MeshBasicMaterial({
        color: GUIDE_CHARACTER_CONFIG.MOUTH_LIP_COLOR,
      });
      const upperLipGeo = new THREE.TorusGeometry(
        mouthHalfW * 0.96,
        0.0022,
        10,
        24,
        Math.PI * 0.84
      );
      const upperLipSmileArc = new THREE.Mesh(upperLipGeo, lipMat);
      upperLipSmileArc.rotation.z = Math.PI + Math.PI * 0.08;
      upperLipSmileArc.scale.set(1, 0.25, 0.6);
      upperLipSmileArc.position.set(0, 0.001, 0.0009);
      upperLipSmileArc.renderOrder = 8;
      mouthGroup.add(upperLipSmileArc);

      const lowerLipGeo = new THREE.TorusGeometry(
        mouthHalfW,
        0.0025,
        10,
        24,
        Math.PI * 0.86
      );
      const lowerLipSmileArc = new THREE.Mesh(lowerLipGeo, lipMat);
      lowerLipSmileArc.rotation.z = Math.PI + Math.PI * 0.07;
      lowerLipSmileArc.scale.set(1, 0.42, 0.6);
      lowerLipSmileArc.position.set(0, 0.0012, 0.001);
      lowerLipSmileArc.renderOrder = 8;
      mouthGroup.add(lowerLipSmileArc);

      return {
        root: rigRoot,
        leftEyeSocket: leftEye.socket,
        rightEyeSocket: rightEye.socket,
        leftIrisGroup: leftEye.irisGroup,
        rightIrisGroup: rightEye.irisGroup,
        leftEyelid: leftEye.eyelid,
        rightEyelid: rightEye.eyelid,
        leftUpperLash: leftEye.upperLash,
        rightUpperLash: rightEye.upperLash,
        leftBrow,
        rightBrow,
        mouthGroup,
        mouthCavity,
        mouthTeeth,
        mouthTongue,
        upperLipSmileArc,
        lowerLipSmileArc,
        leftBlush,
        rightBlush,
        baseEyeY,
        baseBrowY,
        baseMouthY,
      };
    };

    /**
     * Thiết lập mô hình GLB từ repository `tin1511/tour-guide-3d` (`rong.glb`):
     * - Hỗ trợ đầy đủ cả mô hình nguyên khối có texture (`rong.glb` gồm `geometry_0` + gậy `Hình Trụ`)
     *   lẫn mô hình có bộ xương Rigify hoặc AnimationClip có sẵn.
     */
    const setupGLTFCharacter = (
      model: THREE.Group,
      animations: THREE.AnimationClip[] = []
    ) => {
      if (animations.length > 0) {
        gltfMixer = new THREE.AnimationMixer(model);
        const clipAction = gltfMixer.clipAction(animations[0]);
        clipAction.play();
      }

      // 1. Tìm xương theo tiền tố Rigify (nếu mô hình có bộ xương) và tìm phụ kiện gậy (`Hình Trụ`)
      let mainBodyMesh: THREE.Mesh | null = null;
      model.traverse((obj) => {
        if ((obj as THREE.Bone).isBone) {
          const bone = obj as THREE.Bone;
          restQuats.set(bone, bone.quaternion.clone());

          if (matchesBonePrefix(bone.name, 'spine.006')) rigBones.spine006 = bone;
          else if (matchesBonePrefix(bone.name, 'spine.005')) rigBones.spine005 = bone;
          else if (matchesBonePrefix(bone.name, 'spine.004')) rigBones.spine004 = bone;
          else if (matchesBonePrefix(bone.name, 'spine.003')) rigBones.spine003 = bone;
          else if (matchesBonePrefix(bone.name, 'spine.002')) rigBones.spine002 = bone;
          else if (matchesBonePrefix(bone.name, 'spine.001')) rigBones.spine001 = bone;
          else if (matchesBonePrefix(bone.name, 'spine_')) rigBones.spine = bone;
          else if (matchesBonePrefix(bone.name, 'shoulder.L')) rigBones.shoulderL = bone;
          else if (matchesBonePrefix(bone.name, 'upper_arm.L')) rigBones.upperArmL = bone;
          else if (matchesBonePrefix(bone.name, 'forearm.L')) rigBones.forearmL = bone;
          else if (matchesBonePrefix(bone.name, 'hand.L')) rigBones.handL = bone;
          else if (matchesBonePrefix(bone.name, 'shoulder.R')) rigBones.shoulderR = bone;
          else if (matchesBonePrefix(bone.name, 'upper_arm.R')) rigBones.upperArmR = bone;
          else if (matchesBonePrefix(bone.name, 'forearm.R')) rigBones.forearmR = bone;
          else if (matchesBonePrefix(bone.name, 'hand.R')) rigBones.handR = bone;
        }

        if ((obj as THREE.Mesh).isMesh) {
          const mesh = obj as THREE.Mesh;
          if (
            mesh.name.includes('Hình Trụ') ||
            mesh.name.toLowerCase().includes('cylinder')
          ) {
            propStaffMesh = mesh;
            propStaffRestPos.copy(mesh.position);
            propStaffRestQuat.copy(mesh.quaternion);
          } else if (!mainBodyMesh || mesh.name === 'geometry_0') {
            mainBodyMesh = mesh;
          }
        }
      });

      const hasRigifySkeleton = Boolean(rigBones.spine006);

      if (!hasRigifySkeleton) {
        // --- CẤU HÌNH CHO MÔ HÌNH `rong.glb` (https://github.com/tin1511/tour-guide-3d) ---
        model.updateMatrixWorld(true);

        const maxAnisotropy = renderer.capabilities.getMaxAnisotropy();
        model.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            const mesh = child as THREE.Mesh;
            mesh.castShadow = false;
            mesh.receiveShadow = false;
            mesh.frustumCulled = false;

            const materials = Array.isArray(mesh.material)
              ? mesh.material
              : [mesh.material];
            for (const mat of materials) {
              const stdMat = mat as THREE.MeshStandardMaterial;
              if (stdMat && stdMat.map) {
                stdMat.map.colorSpace = THREE.SRGBColorSpace;
                stdMat.map.anisotropy = maxAnisotropy;
                stdMat.map.needsUpdate = true;
              }
              if (stdMat && typeof stdMat.roughness === 'number') {
                stdMat.roughness = Math.min(stdMat.roughness, 0.65);
                stdMat.envMapIntensity = 0.9;
                stdMat.needsUpdate = true;
              }
            }
          }
        });

        // Tạo GPU Morph Targets cho miệng (nhép miệng khi nói) và 2 tay (vẫy tay chào khi bấm vào) trên `geometry_0`
        if (mainBodyMesh && (mainBodyMesh as THREE.Mesh).geometry) {
          const bodyMesh = mainBodyMesh as THREE.Mesh;
          const geo = bodyMesh.geometry as THREE.BufferGeometry;
          const posAttr = geo.attributes.position as THREE.BufferAttribute | undefined;

          if (posAttr && posAttr.count > 1000 && !geo.morphAttributes.position) {
            const vCount = posAttr.count;
            const mouthOpenArr = new Float32Array(vCount * 3);
            const mouthCloseArr = new Float32Array(vCount * 3);
            const leftArmRaiseArr = new Float32Array(vCount * 3);
            const leftArmWaveArr = new Float32Array(vCount * 3);
            const rightArmRaiseArr = new Float32Array(vCount * 3);
            const rightArmWaveArr = new Float32Array(vCount * 3);

            const smoothstep = (edge0: number, edge1: number, x: number) => {
              const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
              return t * t * (3 - 2 * t);
            };

            const jawPivotX = 0.02;
            const jawPivotY = 0.018;
            const jawPivotZ = 0.165;

            const shoulderLX = -0.145;
            const shoulderLY = -0.045;
            const shoulderLZ = 0.105;

            const shoulderRX = 0.155;
            const shoulderRY = -0.065;
            const shoulderRZ = 0.125;

            // Đồng bộ tâm khớp vai phải trong hệ tọa độ cha của `model` cho cây gậy `Hình Trụ`
            propStaffShoulderPivot.set(
              bodyMesh.position.x + shoulderRX,
              bodyMesh.position.y + shoulderRY,
              bodyMesh.position.z + shoulderRZ
            );

            const rotVec = new THREE.Vector3();
            const qJawOpen = new THREE.Quaternion().setFromEuler(
              new THREE.Euler(0.48, 0, 0, 'XYZ')
            );
            const qJawClose = new THREE.Quaternion().setFromEuler(
              new THREE.Euler(-0.19, 0, 0, 'XYZ')
            );
            const qLeftRaise = new THREE.Quaternion().setFromEuler(
              new THREE.Euler(-0.26, 0.12, -0.68, 'XYZ')
            );
            const qLeftWave = new THREE.Quaternion().setFromEuler(
              new THREE.Euler(-0.08, 0.24, -0.36, 'XYZ')
            );
            const qRightRaise = new THREE.Quaternion().setFromEuler(
              new THREE.Euler(-0.24, -0.10, 0.52, 'XYZ')
            );
            const qRightWave = new THREE.Quaternion().setFromEuler(
              new THREE.Euler(-0.06, -0.20, 0.30, 'XYZ')
            );

            for (let i = 0; i < vCount; i++) {
              const idx = i * 3;
              const vx = posAttr.getX(i);
              const vy = posAttr.getY(i);
              const vz = posAttr.getZ(i);

              // Mặc định giữ nguyên vị trí gốc
              mouthOpenArr[idx] = vx;
              mouthOpenArr[idx + 1] = vy;
              mouthOpenArr[idx + 2] = vz;

              mouthCloseArr[idx] = vx;
              mouthCloseArr[idx + 1] = vy;
              mouthCloseArr[idx + 2] = vz;

              leftArmRaiseArr[idx] = vx;
              leftArmRaiseArr[idx + 1] = vy;
              leftArmRaiseArr[idx + 2] = vz;

              leftArmWaveArr[idx] = vx;
              leftArmWaveArr[idx + 1] = vy;
              leftArmWaveArr[idx + 2] = vz;

              rightArmRaiseArr[idx] = vx;
              rightArmRaiseArr[idx + 1] = vy;
              rightArmRaiseArr[idx + 2] = vz;

              rightArmWaveArr[idx] = vx;
              rightArmWaveArr[idx + 1] = vy;
              rightArmWaveArr[idx + 2] = vz;

              // 1. VÙNG MIỆNG & HÀM DƯỚI (`mouthOpen` & `mouthClose`)
              if (vz > 0.14 && Math.abs(vx - 0.015) < 0.135 && vy > -0.068 && vy < 0.074) {
                const wx = 1 - smoothstep(0.085, 0.135, Math.abs(vx - 0.015));
                const wz = smoothstep(0.145, 0.225, vz);

                if (vy <= 0.019) {
                  // Hàm dưới / cằm: hạ xuống khi mở miệng, khép nhẹ lên khi nghỉ
                  const wyBottom = smoothstep(-0.066, -0.040, vy);
                  const wyTop = 1 - smoothstep(0.012, 0.020, vy);
                  const wJaw = wx * wz * wyBottom * wyTop;

                  if (wJaw > 0.001) {
                    rotVec.set(vx - jawPivotX, vy - jawPivotY, vz - jawPivotZ);
                    rotVec.applyQuaternion(qJawOpen);
                    const targetOpenX = jawPivotX + rotVec.x;
                    const targetOpenY = jawPivotY + rotVec.y - 0.024;
                    const targetOpenZ = jawPivotZ + rotVec.z;

                    mouthOpenArr[idx] = vx + (targetOpenX - vx) * wJaw;
                    mouthOpenArr[idx + 1] = vy + (targetOpenY - vy) * wJaw;
                    mouthOpenArr[idx + 2] = vz + (targetOpenZ - vz) * wJaw;

                    rotVec.set(vx - jawPivotX, vy - jawPivotY, vz - jawPivotZ);
                    rotVec.applyQuaternion(qJawClose);
                    const targetCloseX = jawPivotX + rotVec.x;
                    const targetCloseY = jawPivotY + rotVec.y + 0.014;
                    const targetCloseZ = jawPivotZ + rotVec.z;

                    mouthCloseArr[idx] = vx + (targetCloseX - vx) * wJaw;
                    mouthCloseArr[idx + 1] = vy + (targetCloseY - vy) * wJaw;
                    mouthCloseArr[idx + 2] = vz + (targetCloseZ - vz) * wJaw;
                  }
                } else {
                  // Môi trên / mõm trên: nhấc nhẹ lên khi phát âm mở khẩu hình
                  const wyLower = smoothstep(0.018, 0.030, vy);
                  const wyUpper = 1 - smoothstep(0.052, 0.072, vy);
                  const wUpper = wx * smoothstep(0.19, 0.26, vz) * wyLower * wyUpper;

                  if (wUpper > 0.001) {
                    mouthOpenArr[idx + 1] = vy + 0.019 * wUpper;
                    mouthOpenArr[idx + 2] = vz + 0.005 * wUpper;
                  }
                }
              }

              // 2. CÁNH TAY & BÀN TAY TRÁI (`x < -0.130`, tay tự do vẫy chào)
              if (vx < -0.125 && vy > -0.20 && vy < 0.065 && vz > -0.035) {
                const wx = smoothstep(-0.128, -0.168, vx);
                const wy =
                  smoothstep(-0.195, -0.160, vy) * (1 - smoothstep(0.035, 0.065, vy));
                const wz = smoothstep(-0.035, 0.015, vz);
                const wArmL = wx * wy * wz;

                if (wArmL > 0.001) {
                  rotVec.set(vx - shoulderLX, vy - shoulderLY, vz - shoulderLZ);
                  rotVec.applyQuaternion(qLeftRaise);
                  leftArmRaiseArr[idx] = vx + (shoulderLX + rotVec.x - vx) * wArmL;
                  leftArmRaiseArr[idx + 1] =
                    vy + (shoulderLY + rotVec.y + 0.032 - vy) * wArmL;
                  leftArmRaiseArr[idx + 2] =
                    vz + (shoulderLZ + rotVec.z + 0.018 - vz) * wArmL;

                  rotVec.set(vx - shoulderLX, vy - shoulderLY, vz - shoulderLZ);
                  rotVec.applyQuaternion(qLeftWave);
                  leftArmWaveArr[idx] = vx + (shoulderLX + rotVec.x - vx) * wArmL;
                  leftArmWaveArr[idx + 1] = vy + (shoulderLY + rotVec.y - vy) * wArmL;
                  leftArmWaveArr[idx + 2] = vz + (shoulderLZ + rotVec.z - vz) * wArmL;
                }
              }

              // 3. CÁNH TAY & BÀN TAY PHẢI (`x > 0.135`, tay cầm gậy `Hình Trụ`)
              if (vx > 0.135 && vy > -0.22 && vy < 0.065 && vz > -0.035) {
                const wx = smoothstep(0.138, 0.180, vx);
                const wy =
                  smoothstep(-0.215, -0.175, vy) * (1 - smoothstep(0.035, 0.065, vy));
                const wz = smoothstep(-0.035, 0.015, vz);
                const wArmR = wx * wy * wz;

                if (wArmR > 0.001) {
                  rotVec.set(vx - shoulderRX, vy - shoulderRY, vz - shoulderRZ);
                  rotVec.applyQuaternion(qRightRaise);
                  rightArmRaiseArr[idx] = vx + (shoulderRX + rotVec.x - vx) * wArmR;
                  rightArmRaiseArr[idx + 1] = vy + (shoulderRY + rotVec.y - vy) * wArmR;
                  rightArmRaiseArr[idx + 2] = vz + (shoulderRZ + rotVec.z - vz) * wArmR;

                  rotVec.set(vx - shoulderRX, vy - shoulderRY, vz - shoulderRZ);
                  rotVec.applyQuaternion(qRightWave);
                  rightArmWaveArr[idx] = vx + (shoulderRX + rotVec.x - vx) * wArmR;
                  rightArmWaveArr[idx + 1] = vy + (shoulderRY + rotVec.y - vy) * wArmR;
                  rightArmWaveArr[idx + 2] = vz + (shoulderRZ + rotVec.z - vz) * wArmR;
                }
              }
            }

            geo.morphAttributes.position = [
              new THREE.BufferAttribute(mouthOpenArr, 3),
              new THREE.BufferAttribute(mouthCloseArr, 3),
              new THREE.BufferAttribute(leftArmRaiseArr, 3),
              new THREE.BufferAttribute(leftArmWaveArr, 3),
              new THREE.BufferAttribute(rightArmRaiseArr, 3),
              new THREE.BufferAttribute(rightArmWaveArr, 3),
            ];
            bodyMesh.morphTargetInfluences = [0, 0.85, 0, 0, 0, 0];
            bodyMesh.morphTargetDictionary = {
              mouthOpen: 0,
              mouthClose: 1,
              leftArmRaise: 2,
              leftArmWave: 3,
              rightArmRaise: 4,
              rightArmWave: 5,
            };
            rongBodyMesh = bodyMesh;

            // Thêm chiếc lưỡi hồng 3D bên trong khoang miệng của `rong.glb` cử động theo nhịp nói
            const tongueGeo = new THREE.SphereGeometry(0.022, 14, 10);
            tongueGeo.scale(1.15, 0.42, 0.95);
            const tongueMat = new THREE.MeshStandardMaterial({
              color: 0xf43f5e,
              roughness: 0.45,
              metalness: 0.05,
            });
            rongTongueMesh = new THREE.Mesh(tongueGeo, tongueMat);
            rongTongueMesh.position.set(0.026, 0.012, 0.258);
            rongTongueMesh.visible = false;
            bodyMesh.add(rongTongueMesh);
          }
        }

        // 4. GẮN LÁ CỜ VIỆT NAM (CỜ ĐỎ SAO VÀNG) TUNG BAY TRÊN ĐẦU GẬY (`Hình Trụ`)
        if (propStaffMesh) {
          const poleUpDir = new THREE.Vector3(0, 1, 0)
            .applyQuaternion(propStaffRestQuat)
            .normalize();
          vietnamFlagRestQuat.setFromUnitVectors(new THREE.Vector3(0, 1, 0), poleUpDir);

          vietnamFlagGroup = new THREE.Group();
          vietnamFlagGroup.name = 'VietnamFlagOnStaff';
          vietnamFlagGroup.position.copy(propStaffRestPos);
          vietnamFlagGroup.quaternion.copy(vietnamFlagRestQuat);

          const poleHalfLen = Math.max(0.12, propStaffMesh.scale.y || 0.16888);

          // Vẽ Texture Lá Cờ Đỏ Sao Vàng sắc nét (tỉ lệ chuẩn 3:2)
          const flagCanvas = document.createElement('canvas');
          flagCanvas.width = 512;
          flagCanvas.height = 340;
          const fCtx = flagCanvas.getContext('2d');
          if (fCtx) {
            // Nền đỏ tươi Quốc kỳ Việt Nam (#da251d) kèm hiệu ứng ánh lụa nhẹ
            const bgGrad = fCtx.createLinearGradient(0, 0, 512, 340);
            bgGrad.addColorStop(0, '#e1271e');
            bgGrad.addColorStop(0.5, '#da251d');
            bgGrad.addColorStop(1, '#c41e17');
            fCtx.fillStyle = bgGrad;
            fCtx.fillRect(0, 0, 512, 340);

            // Đường viền kim tuyến vàng mảnh dọc mép cờ
            fCtx.strokeStyle = 'rgba(255, 222, 0, 0.55)';
            fCtx.lineWidth = 5;
            fCtx.strokeRect(2.5, 2.5, 507, 335);

            // Ngôi sao vàng 5 cánh chính giữa (#ffff00)
            const cx = 256;
            const cy = 170;
            const outerR = 102;
            const innerR = outerR * 0.381966;

            fCtx.save();
            fCtx.beginPath();
            for (let i = 0; i < 10; i++) {
              const r = i % 2 === 0 ? outerR : innerR;
              const angle = -Math.PI / 2 + (i * Math.PI) / 5;
              const sx = cx + Math.cos(angle) * r;
              const sy = cy + Math.sin(angle) * r;
              if (i === 0) fCtx.moveTo(sx, sy);
              else fCtx.lineTo(sx, sy);
            }
            fCtx.closePath();
            fCtx.shadowColor = 'rgba(56, 189, 248, 0.45)';
            fCtx.shadowBlur = 10;
            fCtx.fillStyle = '#ffde00';
            fCtx.fill();
            fCtx.lineWidth = 2;
            fCtx.strokeStyle = '#fffbeb';
            fCtx.stroke();
            fCtx.restore();
          }

          const flagTex = new THREE.CanvasTexture(flagCanvas);
          flagTex.colorSpace = THREE.SRGBColorSpace;
          flagTex.anisotropy = maxAnisotropy;
          flagTex.needsUpdate = true;

          const flagTopY = poleHalfLen - 0.003;
          const flagCenterY = flagTopY - VIET_FLAG_HEIGHT / 2;

          // Ống vải đỏ buộc ôm sát thân cán cờ
          const sleeveGeo = new THREE.CylinderGeometry(
            0.0085,
            0.0085,
            VIET_FLAG_HEIGHT + 0.004,
            14
          );
          const sleeveMat = new THREE.MeshStandardMaterial({
            color: 0xda251d,
            roughness: 0.45,
            metalness: 0.08,
          });
          const sleeveMesh = new THREE.Mesh(sleeveGeo, sleeveMat);
          sleeveMesh.position.set(0, flagCenterY, 0);
          vietnamFlagGroup.add(sleeveMesh);

          // Quả cầu vàng trên đỉnh cán cờ
          const finialGeo = new THREE.SphereGeometry(0.0115, 16, 12);
          const finialMat = new THREE.MeshStandardMaterial({
            color: 0xfbbf24,
            roughness: 0.25,
            metalness: 0.55,
            emissive: new THREE.Color(0x78350f),
            emissiveIntensity: 0.25,
          });
          const finialMesh = new THREE.Mesh(finialGeo, finialMat);
          finialMesh.position.set(0, poleHalfLen + 0.005, 0);
          vietnamFlagGroup.add(finialMesh);

          // Lưới lá cờ 3D chia lưới mịn để uốn lượn mềm mại trong gió
          const fGeo = new THREE.PlaneGeometry(VIET_FLAG_WIDTH, VIET_FLAG_HEIGHT, 24, 14);
          fGeo.translate(VIET_FLAG_WIDTH / 2 + 0.0055, flagCenterY, 0);

          const fPos = fGeo.attributes.position as THREE.BufferAttribute;
          vietnamFlagBaseX = new Float32Array(fPos.count);
          vietnamFlagBaseY = new Float32Array(fPos.count);
          for (let i = 0; i < fPos.count; i++) {
            const bx = fPos.getX(i);
            const by = fPos.getY(i);
            vietnamFlagBaseX[i] = bx;
            vietnamFlagBaseY[i] = by;
            const u = Math.max(0, (bx - 0.0055) / VIET_FLAG_WIDTH);
            fPos.setZ(i, Math.sin(u * 4.8) * 0.012 * u);
          }
          fGeo.computeVertexNormals();
          vietnamFlagGeo = fGeo;

          const flagMat = new THREE.MeshStandardMaterial({
            map: flagTex,
            side: THREE.DoubleSide,
            roughness: 0.42,
            metalness: 0.04,
            emissive: new THREE.Color(0xffffff),
            emissiveMap: flagTex,
            emissiveIntensity: 0.24,
          });
          const flagMesh = new THREE.Mesh(fGeo, flagMat);
          flagMesh.frustumCulled = false;
          vietnamFlagGroup.add(flagMesh);

          const staffParent = propStaffMesh.parent || model;
          staffParent.add(vietnamFlagGroup);
        }

        // Tính khung bao (Bounding Box) chuẩn trên các Mesh để không bị lệch bởi Empty node trong Blender
        model.updateMatrixWorld(true);
        const fullMeshBox = new THREE.Box3();
        model.traverse((child) => {
          if ((child as THREE.Mesh).isMesh && child !== rongTongueMesh) {
            fullMeshBox.expandByObject(child);
          }
        });
        if (fullMeshBox.isEmpty()) {
          fullMeshBox.setFromObject(model);
        }

        const rawSize = fullMeshBox.getSize(new THREE.Vector3());
        const fullCenter = fullMeshBox.getCenter(new THREE.Vector3());

        // Căn tâm ngang hài hòa giữa thân chính (`geometry_0`) và lá cờ bên phải để không bị khuất cờ
        let centerX = 0.085;
        let centerZ = fullCenter.z;
        let bodyHeight = rawSize.y;
        let bodyMinY = fullMeshBox.min.y;
        if (mainBodyMesh) {
          const bodyBox = new THREE.Box3().setFromObject(mainBodyMesh);
          if (!bodyBox.isEmpty()) {
            const bodyCenter = bodyBox.getCenter(new THREE.Vector3());
            const bodySize = bodyBox.getSize(new THREE.Vector3());
            centerX = bodyCenter.x + 0.085;
            centerZ = bodyCenter.z;
            bodyHeight = bodySize.y;
            bodyMinY = bodyBox.min.y;
          }
        }

        const scale = 0.96 / Math.max(bodyHeight, 0.001);

        model.scale.setScalar(scale);
        model.position.set(
          -centerX * scale,
          -bodyMinY * scale + 0.02,
          -centerZ * scale
        );
        model.updateMatrixWorld(true);

        const scaledHeight = bodyHeight * scale;
        const lookY = scaledHeight * 0.52 + 0.02;

        camera.fov = 36;
        camera.updateProjectionMatrix();
        camera.position.set(0, lookY + 0.04, 2.55);
        camera.lookAt(0, lookY, 0);

        characterPivotGroup.add(model);
        return;
      }

      // 2. Hạ hai cánh tay từ T-pose về tư thế đứng tự nhiên hai bên thân (nếu là mô hình Rigify)
      if (rigBones.upperArmL) {
        const rest = restQuats.get(rigBones.upperArmL)!;
        _tmpEuler.set(0.07, -0.26, -1.47, 'XYZ');
        rigBones.upperArmL.quaternion.copy(rest).multiply(_tmpQuat.setFromEuler(_tmpEuler));
      }
      if (rigBones.forearmL) {
        const rest = restQuats.get(rigBones.forearmL)!;
        _tmpEuler.set(0.34, 0.08, -0.16, 'XYZ');
        rigBones.forearmL.quaternion.copy(rest).multiply(_tmpQuat.setFromEuler(_tmpEuler));
      }
      if (rigBones.upperArmR) {
        const rest = restQuats.get(rigBones.upperArmR)!;
        _tmpEuler.set(0.07, 0.26, 1.47, 'XYZ');
        rigBones.upperArmR.quaternion.copy(rest).multiply(_tmpQuat.setFromEuler(_tmpEuler));
      }
      if (rigBones.forearmR) {
        const rest = restQuats.get(rigBones.forearmR)!;
        _tmpEuler.set(0.34, -0.08, 0.16, 'XYZ');
        rigBones.forearmR.quaternion.copy(rest).multiply(_tmpQuat.setFromEuler(_tmpEuler));
      }

      model.updateMatrixWorld(true);

      // 3. Căn chỉnh tỷ lệ mô hình Rigify
      const rawBox = new THREE.Box3().setFromObject(model);
      const rawSize = rawBox.getSize(new THREE.Vector3());
      const rawCenter = rawBox.getCenter(new THREE.Vector3());
      const targetHeight = 1.68;
      const scale = targetHeight / (rawSize.y || 1);
      model.scale.setScalar(scale);
      model.position.set(-rawCenter.x * scale, -rawBox.min.y * scale + 0.04, -rawCenter.z * scale);
      model.updateMatrixWorld(true);

      const toonGradient = getSharedToonGradientMap();
      const warmBodySkinMat = new THREE.MeshToonMaterial({
        color: GUIDE_CHARACTER_CONFIG.SKIN_COLOR,
        gradientMap: toonGradient,
      });

      // 4. Xử lý các mesh mặt cũ, ria/râu (FACIAL_HAIR) và nâng nhẹ vành mũ để không che mắt/chân mày
      model.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh;
          mesh.castShadow = false;
          mesh.receiveShadow = false;
          mesh.frustumCulled = false;

          const mat = Array.isArray(mesh.material) ? mesh.material[0] : mesh.material;
          const matName = mat?.name || '';

          if (
            /^Eyebrow\.000/i.test(matName) ||
            /^Eye_Single\.000/i.test(matName) ||
            /^Eye_Pupil\.000/i.test(matName) ||
            /^Mouth\.000/i.test(matName) ||
            /^Material\.(299|298|000|015|014)$/i.test(matName)
          ) {
            mesh.visible = false;
            return;
          }

          if (/^Material\.024$/i.test(matName)) {
            mesh.visible = Boolean(GUIDE_CHARACTER_CONFIG.FACIAL_HAIR);
            return;
          }

          if (/^Material\.249$/i.test(matName)) {
            if (!GUIDE_CHARACTER_CONFIG.FACIAL_HAIR) {
              const posAttr = mesh.geometry.attributes.position;
              for (let i = 0; i < posAttr.count; i++) {
                const ry = posAttr.getY(i);
                const rz = posAttr.getZ(i);
                if ((ry < 0.32 && rz > 0.22) || (ry >= 0.32 && rz > 0.55)) {
                  posAttr.setXYZ(i, 0, 0.2, 0);
                }
              }
              posAttr.needsUpdate = true;
            }
            return;
          }

          if (/^Material\.(006|005|004)$/i.test(matName)) {
            const posAttr = mesh.geometry.attributes.position;
            for (let i = 0; i < posAttr.count; i++) {
              posAttr.setY(i, posAttr.getY(i) + 0.085);
            }
            posAttr.needsUpdate = true;
            return;
          }

          if (/^Skin\.000/i.test(matName)) {
            mesh.material = warmBodySkinMat;
            const posAttr = mesh.geometry.attributes.position;
            for (let i = 0; i < posAttr.count; i++) {
              const rx = posAttr.getX(i);
              const ry = posAttr.getY(i);
              const rz = posAttr.getZ(i);
              if (ry > -0.82 && Math.abs(rx) < 1.35) {
                posAttr.setXYZ(i, rx * 0.35, Math.min(ry, 0.65), rz * 0.35);
              }
            }
            posAttr.needsUpdate = true;
          }
        }
      });

      // 5. Gắn Khuôn Mặt Chibi mới vào xương đầu `spine.006`
      if (rigBones.spine006) {
        chibiFaceRig = createChibiFaceRig(rigBones.spine006);

        const headWorldPos = rigBones.spine006.getWorldPosition(new THREE.Vector3());
        camera.position.set(0, headWorldPos.y - 0.085, 1.32);
        camera.lookAt(0, headWorldPos.y - 0.115, 0);
      }

      characterPivotGroup.add(model);
    };

    const buildPlaceholderCharacter = () => {
      const charGroup = new THREE.Group();
      const bodyGroup = new THREE.Group();
      bodyGroup.position.y = 0.42;
      charGroup.add(bodyGroup);

      const toonGradient = getSharedToonGradientMap();

      // Áo dài xanh truyền thống + dải trắng + mũ đen nút vàng
      const torsoGeo = new THREE.CylinderGeometry(0.2, 0.31, 0.82, 24);
      const torsoMat = new THREE.MeshToonMaterial({
        color: 0x1d4ed8,
        gradientMap: toonGradient,
      });
      const torsoMesh = new THREE.Mesh(torsoGeo, torsoMat);
      torsoMesh.position.y = 0.42;
      bodyGroup.add(torsoMesh);

      const sashGeo = new THREE.CylinderGeometry(0.205, 0.23, 0.12, 24);
      const sashMat = new THREE.MeshBasicMaterial({ color: 0xf8fafc });
      const sashMesh = new THREE.Mesh(sashGeo, sashMat);
      sashMesh.position.y = 0.52;
      bodyGroup.add(sashMesh);

      const headBone = new THREE.Bone();
      headBone.position.set(0, 0.98, 0);
      bodyGroup.add(headBone);
      rigBones.spine006 = headBone;
      restQuats.set(headBone, headBone.quaternion.clone());

      chibiFaceRig = createChibiFaceRig(headBone);

      // Mũ khăn đóng đen có nút vàng cho nhân vật dự phòng
      const hatGeo = new THREE.CylinderGeometry(0.155, 0.135, 0.11, 28);
      const hatMat = new THREE.MeshToonMaterial({
        color: 0x1e293b,
        gradientMap: toonGradient,
      });
      const hatMesh = new THREE.Mesh(hatGeo, hatMat);
      hatMesh.position.set(0, 0.115, 0.005);
      headBone.add(hatMesh);

      const goldBadgeGeo = new THREE.SphereGeometry(0.016, 14, 12);
      const goldBadgeMat = new THREE.MeshBasicMaterial({ color: 0xfbbf24 });
      const goldBadge = new THREE.Mesh(goldBadgeGeo, goldBadgeMat);
      goldBadge.position.set(0, 0.115, 0.145);
      headBone.add(goldBadge);

      rootGroup.add(charGroup);
    };

    let isDisposed = false;
    const loader = new GLTFLoader();
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath(GUIDE_CHARACTER_CONFIG.DRACO_DECODER_PATH);
    loader.setDRACOLoader(dracoLoader);
    try {
      loader.setMeshoptDecoder(MeshoptDecoder);
    } catch {
      // ignore
    }

    const loadModelWithFallback = (url: string, allowRemoteRetry: boolean) => {
      loader.load(
        url,
        (gltf) => {
          if (isDisposed) return;
          setupGLTFCharacter(gltf.scene, gltf.animations || []);
          dracoLoader.dispose();
        },
        undefined,
        () => {
          if (isDisposed) return;
          if (allowRemoteRetry && FALLBACK_REMOTE_MODEL_URL && url !== FALLBACK_REMOTE_MODEL_URL) {
            loadModelWithFallback(FALLBACK_REMOTE_MODEL_URL, false);
          } else {
            buildPlaceholderCharacter();
            dracoLoader.dispose();
          }
        }
      );
    };

    if (MODEL_URL && MODEL_URL.trim().length > 0) {
      loadModelWithFallback(MODEL_URL.trim(), true);
    } else {
      buildPlaceholderCharacter();
    }

    // ========================================================================
    // VÒNG LẶP HOẠT ẢNH KHUÔN MẶT CHIBI & BỘ XƯƠNG RIGIFY (60FPS, KHÔNG TẠO RÁC GC)
    // ========================================================================
    const faceCurrent: FaceControllerValues = {
      smile: 0.3,
      mouthOpen: 0,
      blink: 0,
      browRaise: 0,
      surprise: 0,
    };
    const faceTarget: FaceControllerValues = {
      smile: 0.3,
      mouthOpen: 0,
      blink: 0,
      browRaise: 0,
      surprise: 0,
    };

    let nextBlinkTime =
      2.2 +
      Math.random() *
        (GUIDE_CHARACTER_CONFIG.BLINK_INTERVAL_MAX_SEC -
          GUIDE_CHARACTER_CONFIG.BLINK_INTERVAL_MIN_SEC);
    let blinkEndTime = 0;
    let secondBlinkStartTime = 0;
    let secondBlinkEndTime = 0;

    let nextIdleActionTime = 11.0 + Math.random() * 4.0;
    let currentIdleAction: IdleRandomActionType = 'none';
    let idleActionStartTime = 0;
    let idleActionEndTime = 0;

    let currentLookYaw = 0;
    let currentLookPitch = 0;

    let rafId: number | null = null;
    let lastFrameTime = performance.now();
    let elapsed = 0;

    const renderLoop = (now: number) => {
      rafId = window.requestAnimationFrame(renderLoop);

      if (document.hidden) {
        lastFrameTime = now;
        return;
      }

      const rt = runtimeRef.current;
      const isActiveSpeaking = rt.mode === 'speaking' && !rt.isPaused;
      const isGreeting = rt.mode === 'greeting' || now < rt.greetingEndTimestamp;
      const isReacting = rt.mode === 'reacting';
      const isDragged = rt.mode === 'dragged' || rt.isDragging;

      const deltaMs = now - lastFrameTime;
      const targetInterval = isActiveSpeaking || isDragged || isGreeting || isReacting ? 16 : 30;
      if (deltaMs < targetInterval) return;

      const dt = Math.min(deltaMs / 1000, 0.1);
      lastFrameTime = now;
      const motionScale = rt.reducedMotion ? 0.25 : 1.0;
      elapsed += dt;

      // 1. TÍNH TOÁN CHỚP MẮT TỰ ĐỘNG (2.2 - 4.8s, thỉnh thoảng chớp đôi)
      if (elapsed >= nextBlinkTime) {
        const dur = GUIDE_CHARACTER_CONFIG.BLINK_DURATION_SEC;
        blinkEndTime = elapsed + dur;
        if (Math.random() < GUIDE_CHARACTER_CONFIG.DOUBLE_BLINK_CHANCE) {
          secondBlinkStartTime = blinkEndTime + 0.09;
          secondBlinkEndTime = secondBlinkStartTime + dur;
        } else {
          secondBlinkStartTime = 0;
          secondBlinkEndTime = 0;
        }
        nextBlinkTime =
          elapsed +
          GUIDE_CHARACTER_CONFIG.BLINK_INTERVAL_MIN_SEC +
          Math.random() *
            (GUIDE_CHARACTER_CONFIG.BLINK_INTERVAL_MAX_SEC -
              GUIDE_CHARACTER_CONFIG.BLINK_INTERVAL_MIN_SEC);
      }

      const inFirstBlink = elapsed < blinkEndTime;
      const inSecondBlink =
        secondBlinkStartTime > 0 &&
        elapsed >= secondBlinkStartTime &&
        elapsed < secondBlinkEndTime;
      faceTarget.blink = isDragged ? 0.0 : inFirstBlink || inSecondBlink ? 1.0 : 0.0;

      // 2. CẬP NHẬT MỤC TIÊU BIỂU CẢM KHUÔN MẶT CHIBI (3 trạng thái miệng + ngạc nhiên khi kéo)
      const timeSinceSpeechPulse = now - rt.speechPulseTimestamp;
      const hasWarmSmile = now < rt.warmSmileUntil;

      if (isDragged) {
        // Khi đang bị kéo: mắt mở to hơn một chút, miệng hơi tròn (ngạc nhiên nhẹ), chân mày nhướn
        faceTarget.surprise = 1.0;
        faceTarget.smile = 0.05;
        faceTarget.mouthOpen = 0.42;
        faceTarget.browRaise = 0.85;
      } else if (isReacting) {
        // Khi bấm tỉnh/di sản: cười tươi rạng rỡ, nhướn mày
        faceTarget.surprise = 0.0;
        faceTarget.smile = 0.92;
        faceTarget.mouthOpen = 0.18;
        faceTarget.browRaise = 0.68;
      } else if (isGreeting) {
        // Khi người dùng chạm vào chào: cười tươi (lộ chút răng trắng) + nhép miệng nếu đang đọc câu chào
        faceTarget.surprise = 0.0;
        faceTarget.smile = 0.92;
        faceTarget.browRaise = 0.52;
        if (!rt.isPaused && timeSinceSpeechPulse < 260) {
          const osc = 0.65 + 0.35 * Math.sin(elapsed * 24);
          faceTarget.mouthOpen =
            rt.speechVowelOpenness * osc * GUIDE_CHARACTER_CONFIG.MAX_MOUTH_OPEN;
        } else {
          faceTarget.mouthOpen = 0.16;
        }
      } else if (isActiveSpeaking) {
        // Khi đọc giới thiệu: miệng mở/đóng theo nhịp nói, thỉnh thoảng nhướn chân mày
        faceTarget.surprise = 0.0;
        faceTarget.smile = 0.48;
        faceTarget.browRaise = 0.25 + 0.22 * Math.max(0, Math.sin(elapsed * 3.4));
        if (timeSinceSpeechPulse < 280) {
          const syllableWave = 0.58 + 0.42 * Math.sin(elapsed * 26);
          faceTarget.mouthOpen = Math.min(
            GUIDE_CHARACTER_CONFIG.MAX_MOUTH_OPEN,
            rt.speechVowelOpenness * syllableWave * GUIDE_CHARACTER_CONFIG.MAX_MOUTH_OPEN
          );
        } else {
          faceTarget.mouthOpen = 0.04;
        }
      } else {
        // Trạng thái nghỉ (Idle): nếu vừa đọc xong hoặc vừa thả tay sau khi kéo thì cười tươi 1-2s rồi về cười nhẹ
        faceTarget.surprise = 0.0;
        faceTarget. smile = hasWarmSmile ? 0.90 : 0.30;
        faceTarget.mouthOpen = hasWarmSmile ? 0.15 : 0.0;
        faceTarget.browRaise = hasWarmSmile ? 0.42 : 0.06;
      }

      const faceAlpha = Math.min(1, dt * GUIDE_CHARACTER_CONFIG.FACE_LERP_SPEED);
      const blinkAlpha = Math.min(1, dt * 30);
      faceCurrent.smile = THREE.MathUtils.lerp(faceCurrent.smile, faceTarget.smile, faceAlpha);
      faceCurrent.mouthOpen = THREE.MathUtils.lerp(
        faceCurrent.mouthOpen,
        faceTarget.mouthOpen,
        faceAlpha
      );
      faceCurrent.browRaise = THREE.MathUtils.lerp(
        faceCurrent.browRaise,
        faceTarget.browRaise,
        faceAlpha
      );
      faceCurrent.surprise = THREE.MathUtils.lerp(
        faceCurrent.surprise,
        faceTarget.surprise,
        faceAlpha
      );
      faceCurrent.blink = THREE.MathUtils.lerp(faceCurrent.blink, faceTarget.blink, blinkAlpha);

      // 3. TÍNH TOÁN ÁNH NHÌN & GÓC QUAY ĐẦU THEO CON TRỎ / ĐIỂM CHẠM
      const secondsSinceLookInput = (now - rt.lastLookInputTime) / 1000;
      const shouldReturnCenter =
        secondsSinceLookInput > GUIDE_CHARACTER_CONFIG.LOOK_RETURN_CENTER_SEC ||
        isActiveSpeaking;

      let desiredYaw = shouldReturnCenter ? 0 : rt.lookTargetYaw * motionScale;
      let desiredPitch = shouldReturnCenter ? 0 : rt.lookTargetPitch * motionScale;

      const canRunIdleAction =
        rt.mode === 'idle' &&
        !rt.isMapInteracting &&
        !rt.reducedMotion &&
        secondsSinceLookInput > 4.0;

      if (canRunIdleAction) {
        if (currentIdleAction === 'none' && elapsed >= nextIdleActionTime) {
          const actions: IdleRandomActionType[] = ['look_around', 'stretch', 'wave'];
          currentIdleAction = actions[Math.floor(Math.random() * actions.length)];
          idleActionStartTime = elapsed;
          idleActionEndTime = elapsed + 2.6;
        } else if (currentIdleAction !== 'none' && elapsed >= idleActionEndTime) {
          currentIdleAction = 'none';
          nextIdleActionTime =
            elapsed +
            GUIDE_CHARACTER_CONFIG.IDLE_ACTION_MIN_SEC +
            Math.random() *
              (GUIDE_CHARACTER_CONFIG.IDLE_ACTION_MAX_SEC -
                GUIDE_CHARACTER_CONFIG.IDLE_ACTION_MIN_SEC);
        }
      } else {
        currentIdleAction = 'none';
      }

      if (currentIdleAction === 'look_around') {
        const p = elapsed - idleActionStartTime;
        desiredYaw = Math.sin(p * 2.4) * 0.28;
        desiredPitch = Math.sin(p * 1.2) * -0.07;
      }

      const lookAlpha = Math.min(1, dt * 6.5);
      currentLookYaw = THREE.MathUtils.lerp(currentLookYaw, desiredYaw, lookAlpha);
      currentLookPitch = THREE.MathUtils.lerp(currentLookPitch, desiredPitch, lookAlpha);

      // 4. ÁP DỤNG BIỂU CẢM VÀO KHUÔN MẶT CHIBI (MẮT, NẮP MI, CHÂN MÀY, MIỆNG 3 TRẠNG THÁI, MÁ HỒNG)
      if (chibiFaceRig) {
        const eyeScale = GUIDE_CHARACTER_CONFIG.EYE_SIZE;
        const eyeRadiusY = 0.0230 * eyeScale;

        // 4A. Khi bị kéo: mắt mở to hơn một chút (~1.10x); khi cười tươi mắt hơi cong vui vẻ
        const surpriseEyeScale = 1 + faceCurrent.surprise * 0.11;
        const happySquintY =
          faceCurrent.smile > 0.65 && faceCurrent.surprise < 0.2
            ? 1 - (faceCurrent.smile - 0.65) * 0.14
            : 1;
        chibiFaceRig.leftEyeSocket.scale.set(
          surpriseEyeScale,
          surpriseEyeScale * happySquintY,
          1
        );
        chibiFaceRig.rightEyeSocket.scale.set(
          surpriseEyeScale,
          surpriseEyeScale * happySquintY,
          1
        );

        // 4B. Di chuyển nhẹ tròng mắt + đồng tử + 2 điểm sáng trắng hướng về người dùng / con trỏ
        const gazeOffsetX = currentLookYaw * 0.0085;
        const gazeOffsetY = -currentLookPitch * 0.0065;
        chibiFaceRig.leftIrisGroup.position.x = 0.0012 + gazeOffsetX;
        chibiFaceRig.leftIrisGroup.position.y = gazeOffsetY;
        chibiFaceRig.rightIrisGroup.position.x = -0.0012 + gazeOffsetX;
        chibiFaceRig.rightIrisGroup.position.y = gazeOffsetY;

        // 4C. Chớp mắt bằng cách hạ nắp mi cùng màu da từ trên xuống
        const isBlinking = faceCurrent.blink > 0.02;
        chibiFaceRig.leftEyelid.visible = isBlinking;
        chibiFaceRig.rightEyelid.visible = isBlinking;
        if (isBlinking) {
          const lidHeight = Math.max(0.001, faceCurrent.blink * eyeRadiusY * 2.08);
          chibiFaceRig.leftEyelid.scale.y = lidHeight;
          chibiFaceRig.rightEyelid.scale.y = lidHeight;
        }
        // Đường mi trên cũng hạ xuống theo nắp mi khi nhắm mắt
        const lashDropY = faceCurrent.blink * eyeRadiusY * 1.45;
        chibiFaceRig.leftUpperLash.position.y = 0.001 - lashDropY;
        chibiFaceRig.rightUpperLash.position.y = 0.001 - lashDropY;

        // 4D. Chân mày mảnh nhướn lên khi vui / thuyết minh / ngạc nhiên
        const browLiftY = faceCurrent.browRaise * 0.0068 * motionScale;
        const browTiltZ = faceCurrent.browRaise * 0.07;
        chibiFaceRig.leftBrow.position.y = chibiFaceRig.baseBrowY + browLiftY;
        chibiFaceRig.rightBrow.position.y = chibiFaceRig.baseBrowY + browLiftY;
        chibiFaceRig.leftBrow.rotation.z = Math.PI * 0.16 - browTiltZ;
        chibiFaceRig.rightBrow.rotation.z = Math.PI * 0.16 + browTiltZ;

        // 4E. Miệng nhỏ Chibi 3 trạng thái:
        // - Trạng thái 1: Cười nhẹ mặc định (smile ~0.3, mouthOpen ~0)
        // - Trạng thái 2: Cười tươi lộ chút răng trắng (smile > 0.65)
        // - Trạng thái 3: Mở miệng khi nói (mouthOpen theo giọng đọc) hoặc tròn nhẹ khi bị kéo (surprise)
        const openVal = faceCurrent.mouthOpen;
        const smileVal = faceCurrent.smile;
        const surpriseVal = faceCurrent.surprise;

        const effectiveOpen = Math.max(
          openVal,
          smileVal > 0.62 ? (smileVal - 0.55) * 0.52 : 0
        );
        // Khi bị kéo (surprise), miệng thu hẹp chiều ngang thành hình tròn chữ O nhỏ dễ thương
        const widthFactor = THREE.MathUtils.lerp(
          0.86 + smileVal * 0.30 - openVal * 0.08,
          0.54,
          surpriseVal
        );
        const cavityScaleY = Math.max(0.04, effectiveOpen * 0.88);

        const showInnerMouth = effectiveOpen > 0.045;
        chibiFaceRig.mouthCavity.visible = showInnerMouth;
        chibiFaceRig.mouthTongue.visible = effectiveOpen > 0.11;
        // Lộ chút răng trắng ở mép trên khi cười tươi hoặc vừa cười vừa thuyết minh (không hiện khi ngạc nhiên chữ O)
        const showTeeth =
          showInnerMouth && smileVal > 0.52 && surpriseVal < 0.35;
        chibiFaceRig.mouthTeeth.visible = showTeeth;

        if (showInnerMouth) {
          chibiFaceRig.mouthCavity.scale.set(widthFactor, cavityScaleY, 1);
          chibiFaceRig.mouthTongue.scale.set(
            widthFactor * 0.82,
            cavityScaleY * 0.62,
            1
          );
          if (showTeeth) {
            chibiFaceRig.mouthTeeth.scale.set(
              widthFactor * 0.86,
              Math.min(1, 0.55 + smileVal * 0.45),
              1
            );
            chibiFaceRig.mouthTeeth.position.y = 0.0018 + effectiveOpen * 0.0022;
          }
        }

        // Đường cong môi trên và môi dưới
        const smileArcCurve = THREE.MathUtils.lerp(
          0.22 + smileVal * 0.72,
          0.42,
          surpriseVal
        );
        chibiFaceRig.upperLipSmileArc.scale.set(
          widthFactor,
          0.18 + smileVal * 0.32,
          0.6
        );
        chibiFaceRig.upperLipSmileArc.position.y =
          0.001 + effectiveOpen * 0.0042 + smileVal * 0.0012;

        chibiFaceRig.lowerLipSmileArc.scale.set(
          widthFactor,
          smileArcCurve,
          0.6
        );
        chibiFaceRig.lowerLipSmileArc.position.y =
          0.0012 - effectiveOpen * 0.0058 + smileVal * 0.0015;
      } else if (morphBindings.length > 0) {
        for (const b of morphBindings) {
          const inf = b.mesh.morphTargetInfluences;
          if (!inf) continue;
          if (b.smileIdx >= 0) inf[b.smileIdx] = faceCurrent.smile;
          if (b.mouthOpenIdx >= 0) inf[b.mouthOpenIdx] = faceCurrent.mouthOpen;
          if (b.blinkIdx >= 0) inf[b.blinkIdx] = faceCurrent.blink;
          if (b.browRaiseIdx >= 0) inf[b.browRaiseIdx] = faceCurrent.browRaise;
        }
      }

      if (gltfMixer) {
        gltfMixer.update(dt);
      }

      // 5. ĐIỀU KHIỂN CHUYỂN ĐỘNG MÔ HÌNH NGUYÊN KHỐI (`rong.glb`) HOẶC BỘ XƯƠNG RIGIFY
      const boneSlerpAlpha = Math.min(1, dt * GUIDE_CHARACTER_CONFIG.BONE_LERP_SPEED);
      const applyBoneOffset = (
        bone: THREE.Bone | undefined,
        rx: number,
        ry: number,
        rz: number
      ) => {
        if (!bone) return;
        const rest = restQuats.get(bone);
        if (!rest) return;
        _tmpEuler.set(rx, ry, rz, 'XYZ');
        _tmpTargetQuat.copy(rest).multiply(_tmpQuat.setFromEuler(_tmpEuler));
        bone.quaternion.slerp(_tmpTargetQuat, boneSlerpAlpha);
      };

      const breathWave = Math.sin(elapsed * 2.2) * 0.022 * motionScale;
      const clauseNodAge = (now - rt.clauseNodPulse) / 1000;
      const clauseNodOffset =
        isActiveSpeaking && clauseNodAge >= 0 && clauseNodAge < 0.38
          ? Math.sin((clauseNodAge / 0.38) * Math.PI) * 0.11 * motionScale
          : 0;
      const finishNodOffset =
        now < rt.headNodUntil
          ? Math.sin(((rt.headNodUntil - now) / 900) * Math.PI * 2) * 0.11 * motionScale
          : 0;

      const isBowing =
        isGreeting && rt.greetingGesture === 'bow' && now < rt.greetingEndTimestamp;
      const bowAngle = isBowing ? 0.26 * motionScale : 0;

      const stretchOffset =
        currentIdleAction === 'stretch'
          ? Math.sin((elapsed - idleActionStartTime) * 2.5) * 0.07
          : 0;

      const speakHeadRhythmX = isActiveSpeaking
        ? Math.sin(elapsed * 5.2) * 0.042 * motionScale + clauseNodOffset
        : 0;
      const speakHeadRhythmZ = isActiveSpeaking
        ? Math.cos(elapsed * 2.8) * 0.034 * motionScale
        : 0;
      const browHeadLiftX = -faceCurrent.browRaise * 0.04 * motionScale;

      const totalPitchX =
        currentLookPitch +
        speakHeadRhythmX +
        finishNodOffset +
        bowAngle * 0.4 +
        browHeadLiftX;

      if (!rigBones.spine006) {
        // --- HOẠT ẢNH SỐNG ĐỘNG CHO MÔ HÌNH `rong.glb` (tin1511/tour-guide-3d) ---
        const isWaving =
          (isGreeting && rt.greetingGesture === 'wave') || currentIdleAction === 'wave';

        // 1. NHÉP MIỆNG KHI NÓI & VẪY TAY CHÀO BẰNG GPU MORPH TARGETS TRÊN `geometry_0`
        const isSpeakingNow = (isActiveSpeaking || isGreeting) && !rt.isPaused;
        const rawMouthOpen = isSpeakingNow
          ? Math.min(1.0, faceCurrent.mouthOpen * 1.45)
          : isDragged
          ? 0.45
          : 0.0;
        const targetMouthOpen = rawMouthOpen * motionScale;
        const targetMouthClose = isSpeakingNow
          ? Math.max(0, 0.75 - rawMouthOpen * 1.35)
          : isDragged
          ? 0.0
          : 0.82;

        // Cử động cánh tay trái (tay tự do) & cánh tay phải (tay cầm gậy) khi vẫy chào, chỉ tay hoặc thuyết minh
        let targetLeftRaise = 0;
        let targetLeftWave = 0;
        let targetRightRaise = 0;
        let targetRightWave = 0;

        if (isWaving) {
          // Khi người dùng bấm vào nhân vật để chào: giơ cao tay vẫy qua lại rõ ràng, thân thiện
          targetLeftRaise = 1.0 * motionScale;
          targetLeftWave = Math.sin(elapsed * 12.5) * 0.95 * motionScale;
          targetRightRaise = 0.55 * motionScale;
          targetRightWave = Math.sin(elapsed * 12.5 + 0.5) * 0.55 * motionScale;
        } else if (rt.pointingActive) {
          const pointPulse = (0.75 + 0.25 * Math.sin(elapsed * 6.0)) * motionScale;
          if (rt.pointingSide === 'right') {
            targetLeftRaise = 0.92 * pointPulse;
            targetLeftWave = Math.sin(elapsed * 5.5) * 0.35 * motionScale;
          } else {
            targetRightRaise = 0.85 * pointPulse;
            targetRightWave = Math.sin(elapsed * 5.5) * 0.35 * motionScale;
          }
        } else if (isSpeakingNow) {
          // Khi đang nói thuyết minh: hai tay nhịp nhàng diễn tả theo giọng đọc
          const gestureBeat =
            (0.35 + 0.65 * Math.min(1, faceCurrent.mouthOpen * 1.5)) * motionScale;
          targetLeftRaise = (0.38 + 0.24 * Math.sin(elapsed * 4.6)) * gestureBeat;
          targetLeftWave = Math.cos(elapsed * 5.8) * 0.38 * gestureBeat;
          targetRightRaise = (0.28 + 0.18 * Math.cos(elapsed * 4.2)) * gestureBeat;
          targetRightWave = Math.sin(elapsed * 5.2) * 0.28 * gestureBeat;
        } else if (isDragged) {
          targetLeftRaise = 0.75 * motionScale;
          targetLeftWave = Math.sin(elapsed * 15.0) * 0.55 * motionScale;
          targetRightRaise = 0.55 * motionScale;
          targetRightWave = -Math.sin(elapsed * 15.0) * 0.45 * motionScale;
        } else {
          // Nhịp thở nhẹ ở hai tay khi đứng nghỉ
          targetLeftRaise = (0.04 + Math.sin(elapsed * 2.2) * 0.03) * motionScale;
          targetRightRaise = (0.03 + Math.sin(elapsed * 2.2) * 0.025) * motionScale;
        }

        const morphLerp = Math.min(1, dt * 18);
        const mouthLerp = Math.min(1, dt * 26);
        rongMorphCurrent.mouthOpen = THREE.MathUtils.lerp(
          rongMorphCurrent.mouthOpen,
          targetMouthOpen,
          mouthLerp
        );
        rongMorphCurrent.mouthClose = THREE.MathUtils.lerp(
          rongMorphCurrent.mouthClose,
          targetMouthClose,
          mouthLerp
        );
        rongMorphCurrent.leftArmRaise = THREE.MathUtils.lerp(
          rongMorphCurrent.leftArmRaise,
          targetLeftRaise,
          morphLerp
        );
        rongMorphCurrent.leftArmWave = THREE.MathUtils.lerp(
          rongMorphCurrent.leftArmWave,
          targetLeftWave,
          morphLerp
        );
        rongMorphCurrent.rightArmRaise = THREE.MathUtils.lerp(
          rongMorphCurrent.rightArmRaise,
          targetRightRaise,
          morphLerp
        );
        rongMorphCurrent.rightArmWave = THREE.MathUtils.lerp(
          rongMorphCurrent.rightArmWave,
          targetRightWave,
          morphLerp
        );

        if (rongBodyMesh && rongBodyMesh.morphTargetInfluences) {
          const inf = rongBodyMesh.morphTargetInfluences;
          inf[0] = rongMorphCurrent.mouthOpen;
          inf[1] = rongMorphCurrent.mouthClose;
          inf[2] = rongMorphCurrent.leftArmRaise;
          inf[3] = rongMorphCurrent.leftArmWave;
          inf[4] = rongMorphCurrent.rightArmRaise;
          inf[5] = rongMorphCurrent.rightArmWave;
        }

        if (rongTongueMesh) {
          const showTongue = rongMorphCurrent.mouthOpen > 0.08;
          rongTongueMesh.visible = showTongue;
          if (showTongue) {
            const mOpen = rongMorphCurrent.mouthOpen;
            rongTongueMesh.position.y = 0.011 - mOpen * 0.016;
            rongTongueMesh.position.z = 0.256 + mOpen * 0.012;
            rongTongueMesh.scale.set(
              1.15,
              0.38 + mOpen * 0.45,
              0.92 + mOpen * 0.25
            );
          }
        }

        // 2. GÓC QUAY THÂN & NHỊP NHÚN THEO GIỌNG ĐỌC / VẪY CHÀO
        const pointYaw = rt.pointingActive
          ? (rt.pointingSide === 'left' ? -0.34 : 0.34) * motionScale
          : 0;
        const pointPitch = rt.pointingActive ? -rt.pointingPitch * 0.22 * motionScale : 0;

        const targetPivotYaw = rt.pointingActive
          ? pointYaw
          : currentLookYaw * 0.85;
        const targetPivotPitch =
          totalPitchX * 0.65 + bowAngle * 0.55 + pointPitch - stretchOffset * 0.6;
        const targetPivotRoll = isDragged
          ? Math.sin(elapsed * 14.0) * 0.08 * motionScale
          : isWaving
          ? Math.sin(elapsed * 9.0) * 0.065 * motionScale
          : speakHeadRhythmZ * 1.15 + Math.sin(elapsed * 1.6) * 0.018 * motionScale;

        _tmpEuler.set(targetPivotPitch, targetPivotYaw, targetPivotRoll, 'XYZ');
        _tmpTargetQuat.setFromEuler(_tmpEuler);
        characterPivotGroup.quaternion.slerp(_tmpTargetQuat, boneSlerpAlpha);

        const speechBounce = isActiveSpeaking || isGreeting
          ? faceCurrent.mouthOpen * 0.036 * motionScale
          : 0;
        const waveHop = isWaving
          ? Math.abs(Math.sin(elapsed * 7.5)) * 0.032 * motionScale
          : 0;
        const dragLift = isDragged ? 0.055 : 0;
        const idleBob = Math.sin(elapsed * 2.2) * 0.012 * motionScale;

        const targetPosY = idleBob + speechBounce + waveHop + dragLift;
        characterPivotGroup.position.y = THREE.MathUtils.lerp(
          characterPivotGroup.position.y,
          targetPosY,
          boneSlerpAlpha
        );

        const squashY =
          1 +
          breathWave * 0.75 +
          faceCurrent.mouthOpen * 0.025 * motionScale +
          stretchOffset * 0.45 -
          bowAngle * 0.06;
        const squashXZ =
          1 -
          breathWave * 0.35 -
          faceCurrent.mouthOpen * 0.012 * motionScale;
        characterPivotGroup.scale.set(squashXZ, squashY, squashXZ);

        // 3. ĐỒNG BỘ GẬY (`Hình Trụ`) & LÁ CỜ VIỆT NAM XOAY QUANH KHỚP VAI PHẢI CÙNG BÀN TAY PHẢI
        if (propStaffMesh) {
          const rRaise = rongMorphCurrent.rightArmRaise;
          const rWave = rongMorphCurrent.rightArmWave;
          const staffRx = -0.24 * rRaise - 0.06 * rWave;
          const staffRy = -0.10 * rRaise - 0.20 * rWave;
          const staffRz = 0.52 * rRaise + 0.30 * rWave;

          _tmpEuler.set(staffRx, staffRy, staffRz, 'XYZ');
          _tmpQuat.setFromEuler(_tmpEuler);

          // Xoay vị trí của gậy quanh đúng khớp vai phải để gậy luôn nằm gọn trong lòng bàn tay
          _tmpVec3
            .copy(propStaffRestPos)
            .sub(propStaffShoulderPivot)
            .applyQuaternion(_tmpQuat)
            .add(propStaffShoulderPivot);
          propStaffMesh.position.copy(_tmpVec3);

          _tmpTargetQuat.copy(_tmpQuat).multiply(propStaffRestQuat);
          propStaffMesh.quaternion.copy(_tmpTargetQuat);

          if (vietnamFlagGroup) {
            vietnamFlagGroup.position.copy(_tmpVec3);
            _tmpTargetQuat.copy(_tmpQuat).multiply(vietnamFlagRestQuat);
            vietnamFlagGroup.quaternion.copy(_tmpTargetQuat);

            // Hiệu ứng lá cờ Việt Nam tung bay mềm mại trong gió (mạnh hơn khi vẫy tay hoặc thuyết minh)
            if (vietnamFlagGeo && vietnamFlagBaseX && vietnamFlagBaseY) {
              const fPos = vietnamFlagGeo.attributes.position as THREE.BufferAttribute;
              const waveSpeed = isWaving ? 11.5 : isSpeakingNow ? 8.2 : 5.4;
              const waveAmp =
                (isWaving ? 0.022 : isSpeakingNow ? 0.017 : 0.013) *
                (0.35 + 0.65 * motionScale);
              const phase = elapsed * waveSpeed;

              for (let i = 0; i < fPos.count; i++) {
                const bx = vietnamFlagBaseX[i];
                const by = vietnamFlagBaseY[i];
                const u = Math.max(0, (bx - 0.0055) / VIET_FLAG_WIDTH);
                const waveZ =
                  (Math.sin(u * 5.2 - phase) * waveAmp +
                    Math.sin(u * 9.6 - phase * 1.35 + by * 12.0) * (waveAmp * 0.32)) *
                  u;
                const waveY = Math.cos(u * 4.6 - phase) * (waveAmp * 0.28) * u;
                fPos.setY(i, by + waveY);
                fPos.setZ(i, waveZ);
              }
              fPos.needsUpdate = true;
              vietnamFlagGeo.computeVertexNormals();
            }
          }
        }
      } else {
        // --- ĐIỀU KHIỂN BỘ XƯƠNG RIGIFY (NẾU DÙNG MÔ HÌNH CÓ XƯƠNG RIGIFY) ---
        applyBoneOffset(
          rigBones.spine002,
          breathWave * 0.5 + bowAngle * 0.45 - stretchOffset,
          currentLookYaw * 0.15,
          0
        );
        applyBoneOffset(
          rigBones.spine003,
          breathWave * 0.6 + bowAngle * 0.45,
          currentLookYaw * 0.2,
          Math.sin(elapsed * 1.5) * 0.016 * motionScale
        );

        applyBoneOffset(
          rigBones.spine004,
          totalPitchX * 0.28,
          currentLookYaw * 0.28,
          speakHeadRhythmZ * 0.3
        );
        applyBoneOffset(
          rigBones.spine005,
          totalPitchX * 0.32,
          currentLookYaw * 0.32,
          speakHeadRhythmZ * 0.3
        );
        applyBoneOffset(
          rigBones.spine006,
          totalPitchX * 0.45,
          currentLookYaw * 0.45,
          speakHeadRhythmZ * 0.4
        );

        // 6. TƯ THẾ TAY (Hạ tự nhiên hai bên thân; hỗ trợ động tác đưa tay chỉ hướng phần tử đang giải thích)
        if (isDragged) {
          applyBoneOffset(rigBones.upperArmL, 0.14, -0.18, -1.22);
          applyBoneOffset(rigBones.forearmL, 0.52, 0.1, -0.08);
          applyBoneOffset(rigBones.upperArmR, 0.14, 0.18, 1.22);
          applyBoneOffset(rigBones.forearmR, 0.52, -0.1, 0.08);
        } else if (rt.pointingActive) {
          const pointPulse = Math.sin(elapsed * 5.0) * 0.06 * motionScale;
          const pitchAdjust = rt.pointingPitch * 0.45;
          if (rt.pointingSide === 'left') {
            applyBoneOffset(
              rigBones.upperArmL,
              0.38 + pitchAdjust,
              -0.42,
              -0.92 + pointPulse
            );
            applyBoneOffset(
              rigBones.forearmL,
              1.18 + pitchAdjust * 0.5 + pointPulse,
              -0.25,
              -0.22
            );

            applyBoneOffset(rigBones.upperArmR, 0.07, 0.26, 1.47);
            applyBoneOffset(rigBones.forearmR, 0.34, -0.08, 0.16);
          } else {
            applyBoneOffset(
              rigBones.upperArmR,
              0.38 + pitchAdjust,
              0.42,
              0.92 - pointPulse
            );
            applyBoneOffset(
              rigBones.forearmR,
              1.18 + pitchAdjust * 0.5 + pointPulse,
              0.25,
              0.22
            );

            applyBoneOffset(rigBones.upperArmL, 0.07, -0.26, -1.47);
            applyBoneOffset(rigBones.forearmL, 0.34, 0.08, -0.16);
          }
        } else if (
          (isGreeting && rt.greetingGesture === 'wave') ||
          currentIdleAction === 'wave'
        ) {
          const waveSwing = Math.sin(elapsed * 11.0) * 0.26 * motionScale;
          applyBoneOffset(rigBones.upperArmR, 0.20, 0.48, 1.12);
          applyBoneOffset(rigBones.forearmR, 1.68, 0.35 + waveSwing, 0.18 + waveSwing * 0.5);

          applyBoneOffset(rigBones.upperArmL, 0.07, -0.26, -1.47);
          applyBoneOffset(rigBones.forearmL, 0.34, 0.08, -0.16);
        } else if (isActiveSpeaking) {
          const leftPhase = Math.max(0, Math.sin(elapsed * 3.2)) * motionScale;
          const rightPhase = Math.max(0, Math.sin(elapsed * 3.2 + Math.PI)) * motionScale;

          applyBoneOffset(
            rigBones.upperArmL,
            0.07 + leftPhase * 0.08,
            -0.26 - leftPhase * 0.08,
            -1.47 + leftPhase * 0.14
          );
          applyBoneOffset(
            rigBones.forearmL,
            0.34 + leftPhase * 0.48,
            0.08 + leftPhase * 0.08,
            -0.16 - leftPhase * 0.14
          );

          applyBoneOffset(
            rigBones.upperArmR,
            0.07 + rightPhase * 0.08,
            0.26 + rightPhase * 0.08,
            1.47 - rightPhase * 0.14
          );
          applyBoneOffset(
            rigBones.forearmR,
            0.34 + rightPhase * 0.48,
            -0.08 - rightPhase * 0.08,
            0.16 + rightPhase * 0.14
          );
        } else {
          const stretchArmZ =
            currentIdleAction === 'stretch'
              ? Math.sin((elapsed - idleActionStartTime) * 2.5) * 0.12
              : 0;
          const breathArmZ = Math.sin(elapsed * 2.2) * 0.016 * motionScale;

          applyBoneOffset(
            rigBones.upperArmL,
            0.07,
            -0.26,
            -1.47 + breathArmZ + stretchArmZ
          );
          applyBoneOffset(rigBones.forearmL, 0.34, 0.08, -0.16);

          applyBoneOffset(
            rigBones.upperArmR,
            0.07,
            0.26,
            1.47 - breathArmZ - stretchArmZ
          );
          applyBoneOffset(rigBones.forearmR, 0.34, -0.08, 0.16);
        }
      }

      renderer.render(scene, camera);
    };

    rafId = window.requestAnimationFrame(renderLoop);

    const handleResizeObserver = () => {
      if (!container) return;
      const newW = container.clientWidth || width;
      const newH = container.clientHeight || height;
      camera.aspect = newW / newH;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, newH);
    };

    const resizeObserver =
      typeof ResizeObserver !== 'undefined' ? new ResizeObserver(handleResizeObserver) : null;
    resizeObserver?.observe(container);

    return () => {
      isDisposed = true;
      if (rafId !== null) window.cancelAnimationFrame(rafId);
      resizeObserver?.disconnect();
      renderer.domElement.removeEventListener('webglcontextlost', handleContextLost);

      scene.traverse((obj) => {
        if ((obj as THREE.Mesh).isMesh) {
          const mesh = obj as THREE.Mesh;
          mesh.geometry?.dispose();
          if (Array.isArray(mesh.material)) {
            mesh.material.forEach((m) => m.dispose());
          } else {
            mesh.material?.dispose();
          }
        }
      });
      renderer.dispose();
    };
  }, [isSceneReady, use2DFallback, prefs.isHidden, prefs.isLargeSize, isMobileView]);

  // Kích thước hiển thị của nhân vật
  const baseWidth = isMobileView
    ? GUIDE_CHARACTER_CONFIG.MOBILE_WIDTH_PX
    : GUIDE_CHARACTER_CONFIG.DESKTOP_WIDTH_PX;
  const charWidth = Math.round(
    baseWidth * (prefs.isLargeSize ? GUIDE_CHARACTER_CONFIG.LARGE_SCALE_MULTIPLIER : 1)
  );
  const charHeight = Math.round(charWidth * GUIDE_CHARACTER_CONFIG.ASPECT_RATIO);

  // Tính toán tọa độ (x, y) trong khung nhìn, tự động dịch lên khi Bottom Sheet mở VÀ tự né phần tử đang được làm nổi bật
  const computeClampedPosition = useCallback(() => {
    if (typeof window === 'undefined') {
      return { x: 240, y: 520, effectiveDockSide: prefs.dockSide };
    }
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const margin = GUIDE_CHARACTER_CONFIG.EDGE_MARGIN_PX;

    const defaultBottomMargin = isMobileView
      ? GUIDE_CHARACTER_CONFIG.DEFAULT_BOTTOM_MOBILE_PX
      : GUIDE_CHARACTER_CONFIG.DEFAULT_BOTTOM_DESKTOP_PX;

    let sheetOffsetPx = 0;
    if (activeTab === 'map' && isMobileView && mapSheetState.sheetState === 'collapsed') {
      // Giữ Rồng 3D nằm ngay phía trên thanh tiêu đề thu gọn (76px) + thanh điều hướng dưới (56px)
      sheetOffsetPx = 140;
    } else if (activeTab === 'map' && mapSheetState.sheetState === 'half') {
      if (isMobileView) {
        const mapCanvasH = Math.max(340, vh - 108);
        const sheetPx = Math.round((mapCanvasH * Math.min(mapSheetState.sheetHeightVh || 46, 54)) / 100);
        sheetOffsetPx = 56 + sheetPx + 8;
      } else {
        sheetOffsetPx = Math.round((vh * Math.min(mapSheetState.sheetHeightVh || 46, 52)) / 100) + 12;
      }
    } else if (activeTab === 'map' && mapSheetState.sheetState === 'full') {
      // Khi mở toàn màn hình hồ sơ di sản trên mobile, giữ Rồng 3D gọn ở góc dưới bên phải (trên thanh điều hướng dưới)
      sheetOffsetPx = defaultBottomMargin + 6;
    }

    const minY = isMobileView ? (activeTab === 'map' ? 124 : 64) : 82;
    const maxY = Math.max(minY, vh - charHeight - Math.max(defaultBottomMargin, sheetOffsetPx));

    if (dragPos) {
      const clampedX = Math.max(margin, Math.min(vw - charWidth - margin, dragPos.x));
      return {
        x: clampedX,
        y: Math.max(minY, Math.min(vh - charHeight - 16, dragPos.y)),
        effectiveDockSide: clampedX + charWidth / 2 < vw / 2 ? ('left' as const) : ('right' as const),
      };
    }

    let effectiveDockSide: 'left' | 'right' = prefs.dockSide;
    let targetX =
      effectiveDockSide === 'left' ? margin : Math.max(margin, vw - charWidth - margin);
    const desiredY = Math.round(prefs.yRatio * vh);
    let targetY = Math.max(minY, Math.min(maxY, desiredY));

    // Tự né sang cạnh đối diện hoặc dịch lên/xuống nếu nhân vật đang đè lên phần tử được làm nổi bật
    if (highlightRect) {
      const pad = 12;
      const overlaps =
        targetX < highlightRect.left + highlightRect.width + pad &&
        targetX + charWidth + pad > highlightRect.left &&
        targetY < highlightRect.top + highlightRect.height + pad &&
        targetY + charHeight + pad > highlightRect.top;

      if (overlaps) {
        const oppositeSide: 'left' | 'right' = effectiveDockSide === 'left' ? 'right' : 'left';
        const oppositeX =
          oppositeSide === 'left' ? margin : Math.max(margin, vw - charWidth - margin);
        const oppositeOverlaps =
          oppositeX < highlightRect.left + highlightRect.width + pad &&
          oppositeX + charWidth + pad > highlightRect.left &&
          targetY < highlightRect.top + highlightRect.height + pad &&
          targetY + charHeight + pad > highlightRect.top;

        if (!oppositeOverlaps) {
          effectiveDockSide = oppositeSide;
          targetX = oppositeX;
        } else {
          // Nếu phần tử rộng ngang cả màn hình, ưu tiên dịch nhân vật lên trên hoặc xuống dưới phần tử đó
          const aboveY = highlightRect.top - charHeight - 16;
          const belowY = highlightRect.top + highlightRect.height + 16;
          if (aboveY >= minY) {
            targetY = aboveY;
          } else if (belowY <= maxY) {
            targetY = belowY;
          }
        }
      }
    }

    return { x: targetX, y: targetY, effectiveDockSide };
  }, [
    activeTab,
    charWidth,
    charHeight,
    dragPos,
    highlightRect,
    isMobileView,
    mapSheetState,
    prefs.dockSide,
    prefs.yRatio,
  ]);

  const currentPos = computeClampedPosition();

  // Cập nhật tâm màn hình của nhân vật để tính góc nhìn theo con trỏ
  useEffect(() => {
    runtimeRef.current.charScreenCenterX = currentPos.x + charWidth / 2;
    runtimeRef.current.charScreenCenterY = currentPos.y + charHeight * 0.35;
  }, [currentPos.x, currentPos.y, charWidth, charHeight]);

  // Kích hoạt câu chào khi chạm 1 lần hoặc chạm đúp (kèm cười tươi 1-2 giây)
  const triggerCharacterGreeting = useCallback(
    (isDoubleTap: boolean) => {
      const now = performance.now();
      runtimeRef.current.greetingGesture = isDoubleTap ? 'bow' : 'wave';
      runtimeRef.current.greetingEndTimestamp = now + 2400;
      runtimeRef.current.warmSmileUntil = now + 2000;

      if (characterState === 'speaking' && !isPaused) {
        return;
      }

      const pool = isEn
        ? isDoubleTap
          ? ENGLISH_DOUBLE_TAP_GREETINGS
          : ENGLISH_GREETING_MESSAGES
        : isDoubleTap
        ? DOUBLE_TAP_GREETINGS
        : GREETING_MESSAGES;
      const randomGreeting = pool[Math.floor(Math.random() * pool.length)];

      startNarrationWithReaction(
        {
          id: isDoubleTap ? 'greeting-double-tap' : 'greeting-single-tap',
          title: isEn
            ? isDoubleTap
              ? 'Respectful Bow'
              : 'Hồn Đất Việt 3D Guide'
            : isDoubleTap
            ? 'Cúi Chào Quý Khách'
            : 'Hướng Dẫn Viên Hồn Đất Việt',
          introText: randomGreeting,
          targetType: 'greeting',
        },
        true
      );
    },
    [characterState, isEn, isPaused, startNarrationWithReaction]
  );

  // Xử lý kéo thả & Chạm đơn / Chạm đúp bằng Pointer Events
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0 && e.pointerType === 'mouse') return;
    e.stopPropagation();

    guideVoiceService.unlockAudioOnUserGesture();

    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // ignore
    }

    pointerDownInfoRef.current = {
      pointerId: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      originX: currentPos.x,
      originY: currentPos.y,
      hasMovedBeyondThreshold: false,
    };
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const info = pointerDownInfoRef.current;
    if (!info || info.pointerId !== e.pointerId) return;

    const dx = e.clientX - info.startX;
    const dy = e.clientY - info.startY;
    const dist = Math.hypot(dx, dy);

    if (!info.hasMovedBeyondThreshold && dist >= GUIDE_CHARACTER_CONFIG.DRAG_THRESHOLD_PX) {
      info.hasMovedBeyondThreshold = true;
      setIsDragging(true);
      runtimeRef.current.mode = 'dragged';
    }

    if (info.hasMovedBeyondThreshold) {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const margin = GUIDE_CHARACTER_CONFIG.EDGE_MARGIN_PX;
      const nextX = Math.max(margin, Math.min(vw - charWidth - margin, info.originX + dx));
      const nextY = Math.max(64, Math.min(vh - charHeight - 16, info.originY + dy));
      setDragPos({ x: nextX, y: nextY });
    }
  };

  const handlePointerUpOrCancel = (e: React.PointerEvent<HTMLDivElement>) => {
    const info = pointerDownInfoRef.current;
    if (!info || info.pointerId !== e.pointerId) return;

    try {
      if (e.currentTarget.hasPointerCapture(e.pointerId)) {
        e.currentTarget.releasePointerCapture(e.pointerId);
      }
    } catch {
      // ignore
    }

    pointerDownInfoRef.current = null;

    if (!info.hasMovedBeyondThreshold) {
      setIsDragging(false);
      setDragPos(null);

      const now = performance.now();
      const isDoubleTap = now - lastTapTimestampRef.current < 320;
      lastTapTimestampRef.current = isDoubleTap ? 0 : now;

      if (isDoubleTap) {
        triggerCharacterGreeting(true);
      } else {
        triggerCharacterGreeting(false);
      }
      return;
    }

    // Khi thả tay sau khi kéo: nhân vật cười tươi 1.8 giây rồi về cười nhẹ và hít vào cạnh gần nhất
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const finalX = dragPos ? dragPos.x : info.originX;
    const finalY = dragPos ? dragPos.y : info.originY;
    const centerCharX = finalX + charWidth / 2;
    const snappedSide: 'left' | 'right' = centerCharX < vw / 2 ? 'left' : 'right';
    const nextYRatio = Math.max(0.12, Math.min(0.88, finalY / Math.max(1, vh)));

    runtimeRef.current.warmSmileUntil = performance.now() + 1850;
    runtimeRef.current.headNodUntil = performance.now() + 650;

    setIsDragging(false);
    setDragPos(null);
    updatePrefs((prev) => ({
      ...prev,
      dockSide: snappedSide,
      yRatio: nextYRatio,
    }));
  };

  const handleStopSpeech = () => {
    guideVoiceService.stop();
    runtimeRef.current.speechVowelOpenness = 0;
    runtimeRef.current.pointingActive = false;
    setCharacterState('idle');
    setIsPaused(false);
    setShowSubtitle(false);
    setShowWelcomeTourPrompt(false);
    setTourStepIndex(null);
    clearHighlightAndPointing();
  };

  // Thực thi hành động gốc của phần tử khi người dùng bấm "Dùng phần này" trong chế độ "Hướng dẫn"
  const handleExecutePendingElementAction = useCallback(() => {
    const el = pendingActionElementRef.current;
    pendingActionElementRef.current = null;
    setHasPendingGuideAction(false);
    clearHighlightAndPointing();

    if (!el || !document.body.contains(el)) return;

    isBypassingGuideClickRef.current = true;
    try {
      const focusableInput =
        el.tagName.toLowerCase() === 'input' || el.tagName.toLowerCase() === 'textarea'
          ? el
          : el.querySelector<HTMLElement>('input, textarea, select, button');

      el.click();
      if (
        focusableInput &&
        (focusableInput.tagName.toLowerCase() === 'input' ||
          focusableInput.tagName.toLowerCase() === 'textarea')
      ) {
        focusableInput.focus();
      }
    } finally {
      window.setTimeout(() => {
        isBypassingGuideClickRef.current = false;
      }, 60);
    }
  }, [clearHighlightAndPointing]);

  // Tạo danh sách các Chip gợi ý sau khi đọc xong ("Nghe lại", "Nghe tiếp", "Tỉnh lân cận", "Món ăn nổi tiếng")
  const followUpChips = React.useMemo<FollowUpChip[]>(() => {
    if (!activeNarration) return [];
    const chips: FollowUpChip[] = [];

    chips.push({
      id: 'replay',
      label: isEn ? 'Replay' : 'Nghe lại',
      icon: 'replay',
      onClick: () => {
        if (highlightedElementRef.current) {
          updateHighlightRectFromElement(highlightedElementRef.current);
        }
        startNarrationWithReaction(activeNarration, true);
      },
    });

    const allHeritages = storageService.getHeritages();
    const currentProv = activeNarration.provinceName;

    if (currentProv) {
      const sameProvHeritages = allHeritages.filter(
        (h) =>
          h.id !== activeNarration.heritageId &&
          h.province.toLowerCase().includes(currentProv.toLowerCase())
      );
      if (sameProvHeritages.length > 0) {
        const nextH =
          sameProvHeritages[Math.floor(Math.random() * sameProvHeritages.length)];
        chips.push({
          id: `next-${nextH.id}`,
          label: isEn ? 'Listen Next' : 'Nghe tiếp',
          icon: 'next',
          onClick: () => {
            triggerGuideNarration({
              id: `heritage-${nextH.id}`,
              title: isEn ? nextH.englishName || nextH.name : nextH.name,
              subtitleBadge: nextH.province,
              introText: getHeritageIntroText(nextH, isEn ? 'en' : 'vi'),
              targetType: 'heritage',
              provinceName: nextH.province,
              heritageId: nextH.id,
              lang: isEn ? 'en' : 'vi',
            });
          },
        });
      }

      const currentUnit = VIETNAM_34_ADMINISTRATIVE_UNITS.find(
        (u) => u.shortName.toLowerCase() === currentProv.toLowerCase()
      );
      if (currentUnit) {
        let nearestUnit = VIETNAM_34_ADMINISTRATIVE_UNITS[0];
        let minDist = Infinity;
        for (const u of VIETNAM_34_ADMINISTRATIVE_UNITS) {
          if (u.code === currentUnit.code) continue;
          const d = Math.hypot(
            u.center[0] - currentUnit.center[0],
            u.center[1] - currentUnit.center[1]
          );
          if (d < minDist) {
            minDist = d;
            nearestUnit = u;
          }
        }
        if (nearestUnit) {
          chips.push({
            id: `neighbor-${nearestUnit.code}`,
            label: isEn
              ? `Nearby Province (${nearestUnit.shortName})`
              : `Tỉnh lân cận (${nearestUnit.shortName})`,
            icon: 'neighbor',
            onClick: () => {
              triggerGuideNarration({
                id: `province-${nearestUnit.shortName}`,
                title: nearestUnit.name,
                introText: getProvinceIntroText(
                  nearestUnit.shortName,
                  nearestUnit.historicalNotes,
                  undefined,
                  isEn ? 'en' : 'vi'
                ),
                targetType: 'province',
                provinceName: nearestUnit.shortName,
                lang: isEn ? 'en' : 'vi',
              });
            },
          });
        }
      }

      const culinaryItem = allHeritages.find(
        (h) =>
          h.category === 'culinary' &&
          h.province.toLowerCase().includes(currentProv.toLowerCase())
      );
      if (culinaryItem && culinaryItem.id !== activeNarration.heritageId) {
        chips.push({
          id: `food-${culinaryItem.id}`,
          label: isEn ? 'Famous Local Dish' : 'Món ăn nổi tiếng',
          icon: 'food',
          onClick: () => {
            triggerGuideNarration({
              id: `heritage-${culinaryItem.id}`,
              title: isEn ? culinaryItem.englishName || culinaryItem.name : culinaryItem.name,
              subtitleBadge: culinaryItem.province,
              introText: getHeritageIntroText(culinaryItem, isEn ? 'en' : 'vi'),
              targetType: 'heritage',
              provinceName: culinaryItem.province,
              heritageId: culinaryItem.id,
              lang: isEn ? 'en' : 'vi',
            });
          },
        });
      }
    }

    // Khi đang giải thích giao diện / cách sử dụng trang: hiển thị các nút chỉ dẫn từng phần trên trang hiện tại
    if (activeNarration.targetType === 'ui_guide') {
      const featureSteps = SCREEN_FEATURE_GUIDE_IDS_BY_TAB[activeTab] || [];
      for (const step of featureSteps) {
        if (step.guideId === activeNarration.guideId) continue;
        const rawEntry = GUIDE_CONTENT[step.guideId];
        if (!rawEntry) continue;
        const entry = localizeGuideEntry(rawEntry, isEn ? 'en' : 'vi');
        chips.push({
          id: `ui-step-${step.guideId}`,
          label: isEn
            ? `Show: ${step.shortLabelEn || step.shortLabel}`
            : `Chỉ: ${step.shortLabel}`,
          icon: 'next',
          onClick: () => {
            const el = document.querySelector<HTMLElement>(`[data-guide-id="${step.guideId}"]`);
            if (el) {
              try {
                el.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
              } catch {
                // ignore
              }
            }
            markGuideIdSeen(step.guideId);
            triggerUiGuideExplanation(step.guideId, entry, el, false);
          },
        });
      }
    }

    return chips.slice(0, 3);
  }, [
    activeNarration,
    activeTab,
    isEn,
    markGuideIdSeen,
    startNarrationWithReaction,
    triggerUiGuideExplanation,
    updateHighlightRectFromElement,
  ]);

  if (isPeekingBackground) return null;

  const fullSubtitleText = activeNarration?.introText || '';
  const safeRevealIdx = isNarrationFinished
    ? fullSubtitleText.length
    : Math.max(28, Math.min(fullSubtitleText.length, revealedCharCount + 18));
  const visibleSubtitleText = fullSubtitleText.slice(0, safeRevealIdx);
  const isDockedLeft = currentPos.effectiveDockSide === 'left';
  const isActivelySpeaking =
    (characterState === 'speaking' || characterState === 'greeting') && !isPaused;

  return (
    <div
      data-guide-ignore="true"
      className="fixed inset-0 z-[80] pointer-events-none overflow-hidden select-none"
      aria-live="polite"
    >
      {/* KHUNG SÁNG VIỀN VÀNG ĐỒNG & ĐỎ SON LÀM NỔI BẬT PHẦN TỬ ĐANG GIẢI THÍCH (pointer-events: none) */}
      {highlightRect && (
        <div
          aria-hidden="true"
          style={{
            position: 'fixed',
            top: `${highlightRect.top}px`,
            left: `${highlightRect.left}px`,
            width: `${highlightRect.width}px`,
            height: `${highlightRect.height}px`,
            borderRadius: highlightRect.borderRadius,
            boxShadow:
              '0 0 0 3px rgba(200, 150, 62, 0.95), 0 0 22px rgba(179, 38, 30, 0.55), inset 0 0 12px rgba(200, 150, 62, 0.25)',
          }}
          className={`pointer-events-none z-[79] transition-all duration-200 ${
            prefersReducedMotion ? '' : 'animate-pulse'
          }`}
        />
      )}

      {/* NHÃN NỔI PHÍA TRÊN KHI ĐANG Ở CHẾ ĐỘ "HƯỚNG DẪN" */}
      {guideMode === 'guide' && (
        <div
          data-guide-ignore="true"
          style={{ top: 'max(0.75rem, env(safe-area-inset-top))' }}
          className="pointer-events-auto fixed inset-x-0 z-[85] flex justify-center px-3"
        >
          <div className="flex items-center gap-2.5 bg-[var(--surface)]/95 border border-[var(--gold)] rounded-full pl-3.5 pr-2 py-1.5 shadow-[0_8px_28px_rgba(59,42,32,0.18)] text-[var(--text)]">
            <HelpCircle className="w-4 h-4 text-[var(--primary)] shrink-0 animate-bounce" />
            <span className="text-xs sm:text-sm font-semibold text-[var(--text)]">
              {isEn
                ? 'Tap any element you want to learn how to use'
                : 'Chạm vào phần bạn muốn biết cách dùng'}
            </span>
            <button
              type="button"
              onClick={() => {
                setGuideMode('first_time');
                clearHighlightAndPointing();
              }}
              className="px-2.5 py-1 rounded-full bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-[#FFFDF8] text-xs font-extrabold transition-colors cursor-pointer"
            >
              {isEn ? 'Exit' : 'Thoát'}
            </button>
          </div>
        </div>
      )}

      <div
        style={{
          transform: `translate3d(${currentPos.x}px, ${currentPos.y}px, 0)`,
          width: `${charWidth}px`,
          height: `${charHeight}px`,
          transition:
            isDragging || prefersReducedMotion
              ? 'none'
              : 'transform 0.34s cubic-bezier(0.22, 1, 0.36, 1)',
        }}
        className="absolute top-0 left-0 pointer-events-none"
      >
        {/* 0. MENU ĐIỀU KHIỂN CHẾ ĐỘ HƯỚNG DẪN & GIỌNG ĐỌC */}
        {showControlMenu && (
          <div
            data-guide-ignore="true"
            style={{
              width: isMobileView ? 'min(264px, calc(100vw - 24px))' : '288px',
            }}
            className={`pointer-events-auto absolute bottom-full mb-2 ${
              isDockedLeft ? 'left-0' : 'right-0'
            } bg-[var(--surface)]/98 border border-[var(--gold)] rounded-2xl p-3.5 shadow-[0_12px_36px_rgba(59,42,32,0.22)] text-[var(--text)] z-30 animate-fadeIn`}
          >
            <div className="flex items-center justify-between pb-2 mb-2.5 border-b border-[var(--gold)]/35">
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-[var(--gold)]" />
                <span className="text-xs font-bold text-[var(--primary)] uppercase tracking-wider">
                  {isEn ? '3D Guide Assistant' : 'Trợ lý HDV 3D'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowControlMenu(false)}
                aria-label={isEn ? 'Close 3D Guide control panel' : 'Đóng bảng điều khiển HDV 3D'}
                className="w-6 h-6 flex items-center justify-center rounded-lg text-[var(--text-muted)] hover:text-[var(--primary)] cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* 3 Chế độ hướng dẫn sử dụng */}
            <div className="mb-3">
              <p className="text-[11px] font-semibold text-[var(--text)] mb-1.5">
                {isEn ? 'UI Guide Mode:' : 'Chế độ hướng dẫn giao diện:'}
              </p>
              <div className="grid grid-cols-3 gap-1 bg-[var(--bg)] p-1 rounded-xl border border-[var(--gold)]/50">
                {(
                  [
                    { id: 'off', label: isEn ? 'Off' : 'Tắt' },
                    { id: 'first_time', label: isEn ? 'First Time' : 'Lần đầu' },
                    { id: 'guide', label: isEn ? 'Guide' : 'Hướng dẫn' },
                  ] as const
                ).map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => {
                      guideVoiceService.unlockAudioOnUserGesture();
                      setGuideMode(m.id);
                    }}
                    className={`py-1.5 px-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                      guideMode === m.id
                        ? 'bg-[var(--primary)] text-[#FFFDF8] shadow-sm'
                        : 'text-[var(--text)] hover:text-[var(--primary)]'
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
              <p className="text-[10px] text-[var(--text-muted)] mt-1 leading-tight">
                {guideMode === 'off'
                  ? isEn
                    ? 'Only narrate provinces & heritage sites on the map.'
                    : 'Chỉ thuyết minh tỉnh/di sản trên bản đồ.'
                  : guideMode === 'first_time'
                  ? isEn
                    ? `Explain once when tapping a new item (seen ${seenCount}).`
                    : `Giải thích 1 lần khi chạm phần mới (đã xem ${seenCount} mục).`
                  : isEn
                  ? 'Tap any button to hear how to use it.'
                  : 'Chạm vào bất kỳ nút nào để nghe giải thích cách dùng.'}
              </p>
            </div>

            {/* Nút Tham quan app & Đặt lại hướng dẫn */}
            <div className="grid grid-cols-2 gap-1.5 mb-3">
              <button
                type="button"
                onClick={() => {
                  guideVoiceService.unlockAudioOnUserGesture();
                  runTourStepAtIndex(0);
                }}
                className="py-2 px-2.5 rounded-xl bg-[var(--primary)]/12 hover:bg-[var(--primary)]/20 border border-[var(--gold)] text-[var(--primary)] text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 text-[var(--primary)] fill-[var(--primary)]" />
                <span>{isEn ? 'App Tour' : 'Tham quan app'}</span>
              </button>
              <button
                type="button"
                onClick={handleResetSeenGuides}
                className="py-2 px-2.5 rounded-xl bg-[var(--bg)] hover:bg-[#F3E5CE] border border-[var(--gold)]/60 text-[var(--text)] text-[11px] font-semibold flex items-center justify-center gap-1 transition-all cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5 text-[var(--gold)]" />
                <span>{isEn ? 'Reset Guide' : 'Đặt lại hướng dẫn'}</span>
              </button>
            </div>

            {/* Chọn Giọng Nam Tiếng Việt (VieNeu-TTS) cho Rồng 3D */}
            <div className="mb-3 pt-2 border-t border-[var(--gold)]/35">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-semibold text-[var(--text)]">
                  {isEn ? 'Voice Accent (VieNeu):' : 'Giọng Nam Tiếng Việt (VieNeu):'}
                </span>
                <span className="text-[9.5px] font-bold px-1.5 py-0.5 rounded bg-[var(--primary)]/12 text-[var(--primary)] border border-[var(--gold)]/60">
                  {selectedMaleVoice}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-1">
                {VIENEU_MALE_VOICES.map((voiceOpt) => {
                  const isSelected = selectedMaleVoice === voiceOpt.id;
                  return (
                    <button
                      key={voiceOpt.id}
                      type="button"
                      onClick={() => {
                        guideVoiceService.unlockAudioOnUserGesture();
                        guideVoiceService.setMaleVoice(voiceOpt.id);
                        setSelectedMaleVoice(voiceOpt.id);
                        startNarrationWithReaction(
                          {
                            id: `vieneu-voice-${voiceOpt.id}`,
                            title: isEn
                              ? `VieNeu · ${voiceOpt.label} Voice`
                              : `VieNeu · Giọng Nam ${voiceOpt.label}`,
                            introText: isEn
                              ? `Hello! I am the 3D Little Dragon Guide of Hồn Đất Việt speaking with the ${voiceOpt.label} voice.`
                              : `Xin chào quý khách! Mình là Rồng nhỏ hướng dẫn viên Hồn Đất Việt với giọng đọc ${voiceOpt.label}.`,
                            targetType: 'greeting',
                          },
                          true
                        );
                      }}
                      className={`py-1.5 px-2 rounded-lg text-left transition-all border cursor-pointer ${
                        isSelected
                          ? 'bg-[var(--primary)] text-[#FFFDF8] border-[var(--gold)] shadow-sm'
                          : 'bg-[var(--bg)] border-[var(--gold)]/50 text-[var(--text)] hover:border-[var(--primary)]'
                      }`}
                    >
                      <div className="text-[11px] font-bold leading-tight truncate">
                        {voiceOpt.label}
                      </div>
                      <div
                        className={`text-[9.5px] leading-tight truncate ${
                          isSelected ? 'text-[#FFFDF8]/85' : 'text-[var(--text-muted)]'
                        }`}
                      >
                        {voiceOpt.region}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Tốc độ giọng đọc & Âm thanh */}
            <div className="flex items-center justify-between pt-2 border-t border-[var(--gold)]/35">
              <div className="flex items-center gap-1">
                {([0.8, 1, 1.2] as const).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => updatePrefs((prev) => ({ ...prev, rate: r }))}
                    className={`px-2 py-1 rounded-lg text-[11px] font-bold cursor-pointer ${
                      prefs.rate === r
                        ? 'bg-[var(--primary)] text-[#FFFDF8]'
                        : 'bg-[var(--bg)] text-[var(--text)] border border-[var(--gold)]/45 hover:text-[var(--primary)]'
                    }`}
                  >
                    {r}x
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={() => updatePrefs((prev) => ({ ...prev, muted: !prev.muted }))}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold flex items-center gap-1 border cursor-pointer ${
                  prefs.muted
                    ? 'bg-[var(--primary)]/15 border-[var(--primary)] text-[var(--primary)]'
                    : 'bg-[var(--jade)]/15 border-[var(--jade)] text-[var(--jade)]'
                }`}
              >
                {prefs.muted ? (
                  <>
                    <VolumeX className="w-3.5 h-3.5" />
                    <span>{isEn ? 'Muted' : 'Tắt tiếng'}</span>
                  </>
                ) : (
                  <>
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>{isEn ? 'Sound On' : 'Bật tiếng'}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* 1. CHỈ HIỆN CÁC NÚT ĐIỀU KHIỂN GỌN KHI NGƯỜI DÙNG ĐANG BẬT CHẾ ĐỘ "THAM QUAN APP" HOẶC "HƯỚNG DẪN" (KHÔNG HIỆN KHUNG CHỮ CHE GIAO DIỆN) */}
        {showSubtitle &&
          activeNarration &&
          (tourStepIndex !== null || (guideMode === 'guide' && hasPendingGuideAction)) && (
            <div
              data-guide-ignore="true"
              className={`pointer-events-auto absolute bottom-2 ${
                isDockedLeft ? 'left-full ml-2' : 'right-full mr-2'
              } bg-[var(--surface)]/95 border border-[var(--gold)] rounded-2xl px-2.5 py-2 shadow-lg flex items-center gap-1.5 whitespace-nowrap animate-fadeIn`}
            >
              {tourStepIndex !== null && (
                <>
                  <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-[var(--primary)]/12 text-[var(--primary)] border border-[var(--gold)]/60">
                    {tourStepIndex + 1}/{orderedTourSteps.length}
                  </span>
                  <button
                    type="button"
                    disabled={tourStepIndex <= 0}
                    onClick={() => runTourStepAtIndex(tourStepIndex - 1)}
                    className="min-h-[28px] px-2 py-1 rounded-xl bg-[var(--bg)] hover:bg-[#F3E5CE] disabled:opacity-40 border border-[var(--gold)]/60 text-[var(--text)] text-[11px] font-semibold flex items-center gap-0.5 cursor-pointer"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => startNarrationWithReaction(activeNarration, true)}
                    title={isEn ? 'Replay' : 'Nghe lại'}
                    className="min-h-[28px] px-2 py-1 rounded-xl bg-[var(--bg)] hover:bg-[#F3E5CE] border border-[var(--gold)]/60 text-[var(--primary)] text-[11px] font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" />
                  </button>
                  {tourStepIndex < orderedTourSteps.length - 1 ? (
                    <button
                      type="button"
                      onClick={() => runTourStepAtIndex(tourStepIndex + 1)}
                      className="min-h-[28px] px-2.5 py-1 rounded-xl bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-[#FFFDF8] text-[11px] font-extrabold flex items-center gap-0.5 cursor-pointer"
                    >
                      <span>{isEn ? 'Next' : 'Tiếp'}</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setTourStepIndex(null);
                        clearHighlightAndPointing();
                      }}
                      className="min-h-[28px] px-2.5 py-1 rounded-xl bg-[var(--jade)] hover:opacity-95 text-[#FFFDF8] text-[11px] font-extrabold cursor-pointer"
                    >
                      {isEn ? 'Done' : 'Xong'}
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      setTourStepIndex(null);
                      handleStopSpeech();
                    }}
                    title={isEn ? 'Exit tour' : 'Thoát tham quan'}
                    className="min-h-[28px] px-1.5 py-1 rounded-xl bg-[var(--bg)] hover:bg-[var(--primary)]/15 text-[var(--text-muted)] hover:text-[var(--primary)] text-[11px] font-semibold cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </>
              )}

              {tourStepIndex === null && guideMode === 'guide' && hasPendingGuideAction && (
                <>
                  <button
                    type="button"
                    onClick={handleExecutePendingElementAction}
                    className="min-h-[30px] px-3 py-1 rounded-xl bg-[var(--primary)] hover:bg-[var(--primary-hover)] active:scale-95 text-[#FFFDF8] text-[11px] font-extrabold flex items-center gap-1 shadow-sm transition-all cursor-pointer"
                  >
                    <Play className="w-3 h-3 fill-[#FFFDF8]" />
                    <span>{isEn ? 'Use This' : 'Dùng phần này'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleStopSpeech}
                    className="min-h-[28px] px-1.5 py-1 rounded-xl bg-[var(--bg)] text-[var(--text-muted)] hover:text-[var(--primary)] cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </>
              )}
            </div>
          )}

        {/* 1B. BONG BÓNG ĐỀ XUẤT ẨM THỰC & QUÁN ĂN GẦN DI SẢN TỪ NHÂN VẬT 3D
             - Trên Mobile ở tab Bản đồ (activeTab === 'map'): ẩn bong bóng nổi vì Banner trên đỉnh + Bottom Sheet + nút mini dưới chân Rồng 3D đã hiển thị đầy đủ, tránh tuyệt đối chồng chéo */}
        {showSubtitle &&
          activeNarration &&
          activeNarration.targetType === 'food_recommendation' &&
          !showControlMenu &&
          !(isMobileView && activeTab === 'map') && (
            <div
              data-guide-ignore="true"
              className={`pointer-events-auto absolute bottom-full mb-2.5 ${
                isDockedLeft ? 'left-0' : 'right-0'
              } w-[min(310px,calc(100vw-20px))] sm:w-[345px] bg-[var(--surface)]/98 border-2 border-[var(--gold)] rounded-2xl p-3 shadow-[0_14px_36px_rgba(36,18,11,0.32)] text-[var(--text)] animate-fadeIn z-50`}
            >
              <div className="flex items-start justify-between gap-2 pb-2 border-b border-[var(--gold)]/45">
                <div className="min-w-0">
                  <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[var(--jade)]/15 text-[var(--jade)] border border-[var(--jade)]/35 text-[10px] font-extrabold uppercase tracking-wider">
                    <Utensils className="w-3 h-3 shrink-0" />
                    <span>
                      {isEn ? '3D Guide Dining Picks' : 'Rồng 3D Đề Xuất Quán Ngon'}
                    </span>
                  </div>
                  <h4 className="font-serif font-bold text-xs sm:text-sm text-[var(--primary)] mt-1 truncate">
                    {activeNarration.title}
                  </h4>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => startNarrationWithReaction(activeNarration, true)}
                    title={isEn ? 'Replay recommendation' : 'Nghe lại đề xuất'}
                    className="w-6 h-6 rounded-lg bg-[var(--bg)] hover:bg-[#F3E5CE] border border-[var(--gold)]/60 text-[var(--primary)] flex items-center justify-center cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowSubtitle(false);
                      handleStopSpeech();
                    }}
                    title={isEn ? 'Close' : 'Đóng'}
                    className="w-6 h-6 rounded-lg bg-[var(--bg)] hover:bg-[var(--primary)]/15 border border-[var(--gold)]/60 text-[var(--text-muted)] hover:text-[var(--primary)] flex items-center justify-center cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <p className="text-[11px] sm:text-xs text-[var(--text)] leading-relaxed mt-2 line-clamp-2 sm:line-clamp-3">
                “{activeNarration.introText}”
              </p>

              {activeNarration.recommendedPlaces &&
                activeNarration.recommendedPlaces.length > 0 && (
                  <div className="mt-2 space-y-1.5 max-h-[155px] sm:max-h-[195px] overflow-y-auto pr-0.5">
                    {activeNarration.recommendedPlaces.map((place, idx) => (
                      <div
                        key={place.id || idx}
                        onClick={() => {
                          onNavigateTab?.('map');
                          triggerInAppMapRoute({
                            heritageId: activeNarration.heritageId || 'ngu-hanh-son-da-nang',
                            placeId: place.id,
                            placeName: place.name,
                          });
                        }}
                        className="p-2 rounded-xl bg-[var(--bg)] hover:bg-[#F3E5CE]/70 border border-[var(--gold)]/55 transition-colors cursor-pointer flex items-start justify-between gap-2"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1">
                            <span className="w-4 h-4 rounded-full bg-[var(--primary)] text-[#FFFDF8] text-[9px] font-extrabold flex items-center justify-center shrink-0">
                              {idx + 1}
                            </span>
                            <span className="font-bold text-[11px] text-[var(--text)] truncate">
                              {place.name}
                            </span>
                          </div>
                          <div className="flex flex-wrap items-center gap-1.5 mt-0.5 text-[10px] text-[var(--text-muted)]">
                            <span className="inline-flex items-center gap-0.5 text-amber-600 font-bold">
                              <Star className="w-2.5 h-2.5 fill-amber-500 text-amber-500" />
                              {place.rating}
                            </span>
                            {place.distanceKm !== undefined && (
                              <span>• {place.distanceKm} km</span>
                            )}
                            {place.specialties && place.specialties[0] && (
                              <span className="text-[var(--jade)] font-semibold truncate max-w-[140px]">
                                • {place.specialties[0]}
                              </span>
                            )}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onNavigateTab?.('map');
                            triggerInAppMapRoute({
                              heritageId: activeNarration.heritageId || 'ngu-hanh-son-da-nang',
                              placeId: place.id,
                              placeName: place.name,
                            });
                          }}
                          className="px-2 py-1 rounded-lg bg-[var(--jade)] text-[#FFFDF8] text-[10px] font-bold flex items-center gap-1 shrink-0 hover:opacity-95 cursor-pointer"
                          title={isEn ? 'Route on Web Map' : 'Chỉ đường trực tiếp trên Bản đồ Web'}
                        >
                          <MapPin className="w-2.5 h-2.5" />
                          <span>{isEn ? 'Route' : 'Chỉ đường'}</span>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
            </div>
          )}

        {/* 2. VÙNG CHẠM & CANVAS NHÂN VẬT 3D NỀN TRONG SUỐT THỰC SỰ */}
        <div
          role="button"
          tabIndex={0}
          aria-label="Nhân vật hướng dẫn viên 3D Hồn Đất Việt. Chạm một lần để chào, chạm đúp để cúi chào, kéo để di chuyển."
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUpOrCancel}
          onPointerCancel={handlePointerUpOrCancel}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              triggerCharacterGreeting(false);
            }
          }}
          style={{
            touchAction: 'none',
            filter: isActivelySpeaking
              ? 'drop-shadow(0 0 10px rgba(200, 150, 62, 0.85))'
              : 'drop-shadow(0 4px 10px rgba(59, 42, 32, 0.25)) drop-shadow(0 0 5px rgba(200, 150, 62, 0.45))',
          }}
          className="pointer-events-auto relative w-full h-full flex items-center justify-center cursor-grab active:cursor-grabbing bg-transparent"
        >
          {/* Dự phòng 2D Chibi đồng bộ nếu thiết bị không có WebGL */}
          {!isSceneReady || use2DFallback ? (
            <div className="w-full h-full flex flex-col items-center justify-center p-1 pointer-events-none">
              <svg
                viewBox="0 0 120 145"
                className={`w-full h-full ${
                  isActivelySpeaking && !prefersReducedMotion ? 'animate-bounce' : ''
                }`}
              >
                {/* Mũ khăn đóng nâu mực có nút vàng đồng */}
                <path
                  d="M 35 42 C 35 22, 85 22, 85 42 L 88 50 L 32 50 Z"
                  fill="#3B2A20"
                  stroke="#24120b"
                  strokeWidth="2"
                />
                <circle cx="60" cy="38" r="3.5" fill="#C8963E" />
                {/* Tai nhỏ gọn hai bên */}
                <ellipse cx="36" cy="64" rx="4" ry="6" fill={SKIN_COLOR} stroke="#2d1810" strokeWidth="1.5" />
                <ellipse cx="84" cy="64" rx="4" ry="6" fill={SKIN_COLOR} stroke="#2d1810" strokeWidth="1.5" />
                {/* Khuôn mặt chibi tròn bầu, viền mảnh */}
                <ellipse
                  cx="60"
                  cy="63"
                  rx="24"
                  ry="21"
                  fill={SKIN_COLOR}
                  stroke="#2d1810"
                  strokeWidth="1.8"
                />
                {/* Chân mày mảnh nâu đen */}
                <path
                  d={
                    isDragging || characterState === 'reacting'
                      ? 'M 44 52 Q 49 48 54 52 M 66 52 Q 71 48 76 52'
                      : 'M 44 54 Q 49 51 54 54 M 66 54 Q 71 51 76 54'
                  }
                  fill="none"
                  stroke="#24120b"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                />
                {/* Đôi mắt chibi elip dọc + tròng nâu + đồng tử + 2 điểm sáng trắng */}
                <ellipse cx="49" cy="62" rx="4.8" ry="6.2" fill="#ffffff" />
                <ellipse cx="71" cy="62" rx="4.8" ry="6.2" fill="#ffffff" />
                <ellipse cx="49.5" cy="62" rx="3.7" ry="4.9" fill={EYE_COLOR} />
                <ellipse cx="70.5" cy="62" rx="3.7" ry="4.9" fill={EYE_COLOR} />
                <ellipse cx="49.5" cy="62" rx="2.1" ry="2.8" fill="#0b0604" />
                <ellipse cx="70.5" cy="62" rx="2.1" ry="2.8" fill="#0b0604" />
                <circle cx="51" cy="59.5" r="1.4" fill="#ffffff" />
                <circle cx="48" cy="64" r="0.75" fill="#ffffff" />
                <circle cx="72" cy="59.5" r="1.4" fill="#ffffff" />
                <circle cx="69" cy="64" r="0.75" fill="#ffffff" />
                {/* Má hồng elip */}
                <ellipse cx="42" cy="68" rx="4.5" ry="2.6" fill={BLUSH_COLOR} fillOpacity={BLUSH_OPACITY} />
                <ellipse cx="78" cy="68" rx="4.5" ry="2.6" fill={BLUSH_COLOR} fillOpacity={BLUSH_OPACITY} />
                {/* Mũi nhỏ ở giữa */}
                <ellipse cx="60" cy="66.5" rx="1.3" ry="1" fill="#d99b78" />
                {/* Miệng nhỏ 3 trạng thái */}
                {isDragging ? (
                  <ellipse cx="60" cy="73" rx="3" ry="3.8" fill="#380812" stroke="#df5b68" strokeWidth="1.2" />
                ) : isActivelySpeaking || characterState === 'greeting' ? (
                  <g>
                    <path
                      d="M 54 71 Q 60 79 66 71 Z"
                      fill="#380812"
                      stroke="#df5b68"
                      strokeWidth="1.4"
                    />
                    <path d="M 55.5 71.5 L 64.5 71.5 L 64 73.2 L 56 73.2 Z" fill="#ffffff" />
                  </g>
                ) : (
                  <path
                    d="M 55 72 Q 60 76.5 65 72"
                    fill="none"
                    stroke="#df5b68"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                )}
                {/* Áo đỏ son truyền thống + viền vàng đồng */}
                <path
                  d="M 38 84 L 82 84 L 88 132 L 32 132 Z"
                  fill="#B3261E"
                  stroke="#C8963E"
                  strokeWidth="1.8"
                />
                <path d="M 46 84 L 60 98 L 74 84" fill="none" stroke="#FFFDF8" strokeWidth="3.5" />
                {/* Cán cờ & Lá Cờ Tổ Quốc trên tay hướng dẫn viên */}
                <line x1="84" y1="98" x2="96" y2="54" stroke="#C8963E" strokeWidth="2.4" strokeLinecap="round" />
                <circle cx="96.5" cy="53" r="2.2" fill="#C8963E" />
                <path
                  d="M 96 55 L 116 59 Q 112 67 115 73 L 92 69 Z"
                  fill="#B3261E"
                  stroke="#C8963E"
                  strokeWidth="0.8"
                />
                <polygon
                  points="105,60.5 106.1,63.2 109,63.4 106.7,65.2 107.5,68 105,66.4 102.5,68 103.3,65.2 101,63.4 103.9,63.2"
                  fill="#C8963E"
                />
              </svg>
            </div>
          ) : (
            <div ref={canvasContainerRef} className="w-full h-full pointer-events-none" />
          )}

          {/* Nhãn gọn dưới chân nhân vật + Các nút điều khiển nhanh (Neo vào cạnh trong màn hình để không bao giờ bị tràn/cắt mất nút ở mép phải điện thoại) */}
          <div
            className={`pointer-events-auto absolute -bottom-1.5 ${
              isDockedLeft ? 'left-0 justify-start' : 'right-0 justify-end'
            } flex items-center gap-1 whitespace-nowrap`}
          >
            <span className="px-2 py-0.5 rounded-full bg-[var(--surface)]/95 border border-[var(--gold)] text-[10px] font-bold text-[var(--primary)] whitespace-nowrap shadow-sm">
              {isDragging
                ? isEn
                  ? '😮 Dragging'
                  : '😮 Đang kéo'
                : isActivelySpeaking
                ? isEn
                  ? '🔊 Speaking'
                  : '🔊 Đang đọc'
                : guideMode === 'guide'
                ? isEn
                  ? '👆 Guide'
                  : '👆 Hướng dẫn'
                : characterState === 'reacting'
                ? isEn
                  ? '😊 Exploring'
                  : '😊 Khám phá'
                : isEn
                ? '3D Guide'
                : 'HDV 3D'}
            </span>
            {activeNarration && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  guideVoiceService.unlockAudioOnUserGesture();
                  if (isActivelySpeaking) {
                    handleStopSpeech();
                  } else {
                    startNarrationWithReaction(activeNarration, true);
                  }
                }}
                aria-label={
                  isActivelySpeaking
                    ? isEn
                      ? 'Stop speaking'
                      : 'Dừng đọc'
                    : isEn
                    ? 'Replay'
                    : 'Nghe lại'
                }
                title={
                  isActivelySpeaking
                    ? isEn
                      ? 'Stop speaking'
                      : 'Dừng đọc'
                    : isEn
                    ? 'Replay last narration'
                    : 'Nghe lại câu vừa thuyết minh'
                }
                className="w-6 h-6 rounded-full flex items-center justify-center border bg-[var(--surface)]/95 border-[var(--gold)] text-[var(--primary)] hover:bg-[var(--bg)] shadow-sm transition-colors cursor-pointer"
              >
                {isActivelySpeaking ? (
                  <X className="w-3 h-3" />
                ) : (
                  <RotateCcw className="w-3 h-3" />
                )}
              </button>
            )}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                guideVoiceService.unlockAudioOnUserGesture();
                updatePrefs((prev) => ({ ...prev, muted: !prev.muted }));
              }}
              aria-label={
                prefs.muted
                  ? isEn
                    ? 'Unmute 3D Guide'
                    : 'Bật tiếng HDV 3D'
                  : isEn
                  ? 'Mute 3D Guide'
                  : 'Tắt tiếng HDV 3D'
              }
              title={
                prefs.muted
                  ? isEn
                    ? 'Muted (click to unmute)'
                    : 'Đang tắt tiếng (bấm để bật)'
                  : isEn
                  ? 'Mute 3D Guide'
                  : 'Tắt tiếng HDV 3D'
              }
              className={`w-6 h-6 rounded-full flex items-center justify-center border shadow-sm transition-colors cursor-pointer ${
                prefs.muted
                  ? 'bg-[var(--primary)] border-[var(--gold)] text-[#FFFDF8]'
                  : 'bg-[var(--surface)]/95 border-[var(--gold)] text-[var(--primary)] hover:bg-[var(--bg)]'
              }`}
            >
              {prefs.muted ? (
                <VolumeX className="w-3 h-3" />
              ) : (
                <Volume2 className="w-3 h-3" />
              )}
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                guideVoiceService.unlockAudioOnUserGesture();
                setShowControlMenu((prev) => !prev);
              }}
              aria-label={
                isEn ? 'Open 3D Guide settings' : 'Mở cài đặt chế độ hướng dẫn của HDV 3D'
              }
              title={isEn ? 'Guide settings & App Tour' : 'Cài đặt hướng dẫn & Tham quan app'}
              className={`w-6 h-6 rounded-full flex items-center justify-center border shadow-sm transition-colors cursor-pointer ${
                showControlMenu || guideMode === 'guide'
                  ? 'bg-[var(--primary)] border-[var(--gold)] text-[#FFFDF8]'
                  : 'bg-[var(--surface)]/95 border-[var(--gold)] text-[var(--primary)] hover:bg-[var(--bg)]'
              }`}
            >
              <SlidersHorizontal className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
