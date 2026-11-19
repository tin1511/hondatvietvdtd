/**
 * ============================================================================
 * LỚP TRỪU TƯỢNG GIỌNG ĐỌC VIENEU-TTS (GIỌNG NAM TIẾNG VIỆT) & NHỊP NHÉP MIỆNG 3D
 * ============================================================================
 * Tích hợp công nghệ tổng hợp giọng nói tiếng Việt tự nhiên **VieNeu-TTS**
 * (phiên bản v3 Turbo / Cloud API) với các preset **Giọng Nam** truyền cảm
 * ("Hải Đăng", "Thiện Minh", "Quang Sơn", "Thiền Tâm Đức", "Adam bựa") dành riêng
 * cho nhân vật Rồng 3D Hướng Dẫn Viên.
 *
 * Kết hợp phân tích biên độ âm thanh thời gian thực (Web Audio API `AnalyserNode`)
 * và bộ ước lượng khẩu hình nguyên âm tiếng Việt để điều khiển miệng Rồng 3D
 * đóng/mở khớp từng âm tiết, kèm bộ đệm âm thanh (Audio Cache) và dự phòng
 * Web Speech API (`vi-VN` giọng trầm nam) khi ngoại tuyến.
 */

export type GuideSpeechRate = 0.8 | 1 | 1.2;

export type VieNeuMaleVoiceId =
  | 'Hải Đăng'
  | 'Thiện Minh'
  | 'Quang Sơn'
  | 'Thái Sơn'
  | 'Thiền Tâm Đức';

export interface VieNeuMaleVoiceOption {
  id: VieNeuMaleVoiceId;
  label: string;
  region: string;
  description: string;
}

export const VIENEU_MALE_VOICES: VieNeuMaleVoiceOption[] = [
  {
    id: 'Hải Đăng',
    label: 'Hải Đăng',
    region: 'Nam · Bắc',
    description: 'Giọng Nam miền Bắc tự nhiên, ấm áp (Mặc định)',
  },
  {
    id: 'Thiện Minh',
    label: 'Thiện Minh',
    region: 'Nam · Bắc',
    description: 'Giọng Nam kể chuyện truyền cảm, rõ ràng',
  },
  {
    id: 'Quang Sơn',
    label: 'Quang Sơn',
    region: 'Nam · Trung',
    description: 'Giọng Nam miền Trung tự nhiên, mộc mạc',
  },
  {
    id: 'Thái Sơn',
    label: 'Thái Sơn',
    region: 'Nam · Nam',
    description: 'Giọng Nam miền Nam ấm áp, kể chuyện',
  },
  {
    id: 'Thiền Tâm Đức',
    label: 'Thiền Tâm Đức',
    region: 'Nam · Trầm',
    description: 'Giọng Nam trầm ấm, điềm đạm sâu lắng',
  },
];

export interface WordBoundaryPulse {
  word: string;
  charIndex: number;
  vowelOpenness: number; // 0..1 (độ mở miệng kết hợp nguyên âm tiếng Việt & biên độ âm thanh VieNeu)
  isClauseBreak: boolean; // Có dấu chấm/phẩy để nhân vật gật đầu nhẹ
}

export interface GuideVoiceCallbacks {
  onStart?: () => void;
  onProgress?: (charIndex: number, totalLength: number) => void;
  onWordBoundary?: (pulse: WordBoundaryPulse) => void;
  onEnd?: () => void;
  onPause?: () => void;
  onResume?: () => void;
  onError?: (reason: string) => void;
}

export interface IGuideVoiceProvider {
  speak(text: string, callbacks?: GuideVoiceCallbacks, lang?: 'vi' | 'en'): void;
  pause(): void;
  resume(): void;
  stop(): void;
  setRate(rate: GuideSpeechRate): void;
  setMuted(muted: boolean): void;
  getRate(): GuideSpeechRate;
  isMuted(): boolean;
  setLanguage(lang: 'vi' | 'en'): void;
  getLanguage(): 'vi' | 'en';
  setMaleVoice(voice: VieNeuMaleVoiceId): void;
  getMaleVoice(): VieNeuMaleVoiceId;
  getAvailableMaleVoices(): VieNeuMaleVoiceOption[];
  isSupported(): boolean;
  hasVietnameseVoice(): boolean;
  unlockAudioOnUserGesture(): void;
}

export interface GuideRecommendedPlaceSummary {
  id: string;
  name: string;
  categoryLabel: string;
  rating: number;
  distanceKm?: number;
  priceText?: string;
  specialties?: string[];
  googleMapsUri?: string;
  address?: string;
}

export interface GuideNarrationPayload {
  id: string;
  title: string;
  subtitleBadge?: string;
  introText: string;
  tip?: string;
  guideId?: string;
  targetType:
    | 'province'
    | 'heritage'
    | 'sovereignty'
    | 'greeting'
    | 'ui_guide'
    | 'food_recommendation';
  provinceName?: string;
  heritageId?: string;
  lang?: 'vi' | 'en';
  recommendedPlaces?: GuideRecommendedPlaceSummary[];
  /** Tọa độ màn hình nơi người dùng vừa bấm để nhân vật quay đầu nhìn về hướng đó */
  screenX?: number;
  screenY?: number;
}

export const GUIDE_NARRATE_EVENT = 'hdv:guide-narrate';
export const GUIDE_MAP_SHEET_EVENT = 'hdv:map-sheet-state';
export const GUIDE_MAP_INTERACTION_EVENT = 'hdv:map-interaction-active';

const VIENEU_VOICE_STORAGE_KEY = 'hdv_vieneu_male_voice_v1';

// Nhóm nguyên âm mở rộng (a, ă, â, o, ô, ơ và các dấu thanh)
const WIDE_VOWEL_REGEX = /[aăâoôơáàảãạắằẳẵặấầẩẫậóòỏõọốồổỗộớờởỡợ]/i;
// Nhóm nguyên âm tròn môi / vừa (u, ư, y và các dấu thanh)
const ROUND_VOWEL_REGEX = /[uưyúùủũụứừửữựýỳỷỹỵ]/i;
// Nhóm nguyên âm hẹp (e, ê, i và các dấu thanh)
const NARROW_VOWEL_REGEX = /[eêiéèẻẽẹếềểễệíìỉĩị]/i;

/**
 * Ước lượng độ mở miệng (0..1) dựa trên nguyên âm chính của từ tiếng Việt:
 * - a, ă, â, o, ô, ơ: mở rộng (0.76 - 0.94)
 * - u, ư, y: tròn chúm vừa (0.46 - 0.62)
 * - e, ê, i: mở nhỏ (0.30 - 0.46)
 */
export function estimateVietnameseVowelOpenness(rawWord: string): number {
  const clean = (rawWord || '').trim();
  if (!clean) return 0.15;

  const jitter = (Math.random() - 0.5) * 0.12;

  if (WIDE_VOWEL_REGEX.test(clean)) {
    return Math.min(1, Math.max(0.65, 0.84 + jitter));
  }
  if (ROUND_VOWEL_REGEX.test(clean)) {
    return Math.min(0.75, Math.max(0.38, 0.54 + jitter));
  }
  if (NARROW_VOWEL_REGEX.test(clean)) {
    return Math.min(0.58, Math.max(0.24, 0.38 + jitter));
  }
  return Math.min(0.65, Math.max(0.25, 0.45 + jitter));
}

/**
 * Trích xuất từ tại vị trí charIndex trong chuỗi văn bản và kiểm tra dấu ngắt câu.
 */
export function extractWordAtCharIndex(
  text: string,
  charIndex: number
): { word: string; isPunctuationPause: boolean; isClauseBreak: boolean } {
  if (!text || charIndex < 0 || charIndex >= text.length) {
    return { word: '', isPunctuationPause: false, isClauseBreak: false };
  }

  const sliceAround = text.slice(
    Math.max(0, charIndex - 2),
    Math.min(text.length, charIndex + 18)
  );
  const currentChar = text[charIndex] || '';
  const isPunctuationPause = /[.,;:!?…—\-()]/.test(currentChar);

  const rest = text.slice(charIndex).trimStart();
  const match = rest.match(/^([^\s.,;:!?…—\-()]+)([.,;:!?…—\-]?)/);
  const word = match ? match[1] : '';
  const trailingPunct = match ? Boolean(match[2]) : /[.,;:!?…]/.test(sliceAround);

  return {
    word,
    isPunctuationPause,
    isClauseBreak: isPunctuationPause || trailingPunct,
  };
}

/**
 * Phát sự kiện để nhân vật 3D `<GuideCharacter />` đọc lời giới thiệu ngay lập tức.
 */
export function triggerGuideNarration(payload: GuideNarrationPayload): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(
    new CustomEvent<GuideNarrationPayload>(GUIDE_NARRATE_EVENT, { detail: payload })
  );
}

/**
 * Phát sự kiện khi bottom sheet của bản đồ thay đổi trạng thái để `<GuideCharacter />`
 * tự động dịch chuyển lên trên mép sheet, không che nội dung.
 */
export function notifyMapSheetState(
  sheetState: 'collapsed' | 'half' | 'full',
  sheetHeightVh: number
): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(
    new CustomEvent<{ sheetState: 'collapsed' | 'half' | 'full'; sheetHeightVh: number }>(
      GUIDE_MAP_SHEET_EVENT,
      {
        detail: { sheetState, sheetHeightVh },
      }
    )
  );
}

/**
 * Báo cho `<GuideCharacter />` biết người dùng đang kéo/zoom bản đồ để tạm tắt hành động rảnh.
 */
export function notifyMapInteractionActive(active: boolean): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(
    new CustomEvent<{ active: boolean }>(GUIDE_MAP_INTERACTION_EVENT, {
      detail: { active },
    })
  );
}

/**
 * Bộ cung cấp giọng đọc tiếng Việt Nam **VieNeu-TTS** cho nhân vật Rồng 3D:
 * - Gọi `/api/tts/vieneu` để tổng hợp giọng Nam tiếng Việt tự nhiên 48kHz (`Hải Đăng`,
 *   `Thiện Minh`, `Quang Sơn`, `Thiền Tâm Đức`, `Adam bựa`).
 * - Dùng `AudioContext` + `AnalyserNode` đo năng lượng âm thanh dải tần giọng nói
 *   kết hợp phân tích nguyên âm tiếng Việt để điều khiển miệng Rồng 3D đóng/mở cực nhạy.
 * - Lưu cache âm thanh trên trình duyệt để phát tức thì các câu đã đọc.
 * - Dự phòng mượt sang Web Speech API (`vi-VN`, pitch trầm nam `0.86`) nếu mất kết nối mạng.
 */
const SILENT_WAV_DATA_URI =
  'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA';

export class VieNeuGuideVoiceProvider implements IGuideVoiceProvider {
  private rate: GuideSpeechRate = 1;
  private muted: boolean = false;
  private language: 'vi' | 'en' = 'vi';
  private maleVoice: VieNeuMaleVoiceId = 'Hải Đăng';
  private currentText: string = '';
  private currentCallbacks?: GuideVoiceCallbacks;
  private progressTimer: number | null = null;
  private simulatedCharIndex: number = 0;
  private isPausedState: boolean = false;
  private isSpeakingState: boolean = false;
  private cachedVoices: SpeechSynthesisVoice[] = [];
  private unlocked: boolean = false;
  private lastBoundaryTimeMs: number = 0;
  private pauseTicksRemaining: number = 0;

  // Quản lý phát âm thanh VieNeu-TTS dùng phần tử HTMLAudioElement tái sử dụng đã mở khóa Autoplay
  private sharedAudio: HTMLAudioElement | null = null;
  private activeAudio: HTMLAudioElement | null = null;
  private activeAbortController: AbortController | null = null;
  private speechSessionId: number = 0;
  private clientAudioUrlCache = new Map<string, string>();

  constructor() {
    if (typeof window !== 'undefined') {
      try {
        const savedLang = window.localStorage.getItem('heritage_app_language');
        if (savedLang === 'en' || savedLang === 'vi') {
          this.language = savedLang;
        }
        const savedVoice = window.localStorage.getItem(
          VIENEU_VOICE_STORAGE_KEY
        ) as VieNeuMaleVoiceId | null;
        if (
          savedVoice &&
          VIENEU_MALE_VOICES.some((v) => v.id === savedVoice)
        ) {
          this.maleVoice = savedVoice;
        }
      } catch {
        // ignore storage errors
      }

      if (typeof Audio !== 'undefined') {
        try {
          this.sharedAudio = new Audio();
          this.sharedAudio.preload = 'auto';
        } catch {
          // ignore
        }
      }

      // Tự động mở khóa âm thanh ngay ở cú chạm/click/bấm phím đầu tiên của người dùng trên trang
      const unlockOnce = () => {
        this.unlockAudioOnUserGesture();
      };
      window.addEventListener('pointerdown', unlockOnce, { capture: true, passive: true });
      window.addEventListener('click', unlockOnce, { capture: true, passive: true });
      window.addEventListener('keydown', unlockOnce, { capture: true, passive: true });

      if ('speechSynthesis' in window) {
        this.loadVoices();
        try {
          window.speechSynthesis.addEventListener?.('voiceschanged', () =>
            this.loadVoices()
          );
        } catch {
          window.speechSynthesis.onvoiceschanged = () => this.loadVoices();
        }
      }
    }
  }

  private loadVoices(): void {
    try {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        const list = window.speechSynthesis.getVoices();
        if (list && list.length > 0) {
          this.cachedVoices = list;
        }
      }
    } catch {
      // ignore
    }
  }

  public isSupported(): boolean {
    return typeof window !== 'undefined';
  }

  public hasVietnameseVoice(): boolean {
    return true;
  }

  public setMaleVoice(voice: VieNeuMaleVoiceId): void {
    if (!VIENEU_MALE_VOICES.some((v) => v.id === voice)) return;
    this.maleVoice = voice;
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.setItem(VIENEU_VOICE_STORAGE_KEY, voice);
      } catch {
        // ignore
      }
    }
  }

  public getMaleVoice(): VieNeuMaleVoiceId {
    return this.maleVoice;
  }

  public setLanguage(lang: 'vi' | 'en'): void {
    this.language = lang === 'en' ? 'en' : 'vi';
  }

  public getLanguage(): 'vi' | 'en' {
    return this.language;
  }

  public getAvailableMaleVoices(): VieNeuMaleVoiceOption[] {
    return VIENEU_MALE_VOICES;
  }

  private pickBestEnglishMaleWebSpeechVoice(): SpeechSynthesisVoice | null {
    this.loadVoices();
    if (!this.cachedVoices.length) return null;

    const enVoices = this.cachedVoices.filter((v) => {
      const lang = (v.lang || '').toLowerCase();
      return lang.startsWith('en');
    });

    if (enVoices.length === 0) return null;

    const malePreferred = enVoices.find((v) => {
      const name = (v.name || '').toLowerCase();
      return (
        name.includes('guy') ||
        name.includes('christopher') ||
        name.includes('andrew') ||
        name.includes('daniel') ||
        name.includes('david') ||
        name.includes('alex') ||
        name.includes('google us english') ||
        name.includes('male')
      );
    });
    if (malePreferred) return malePreferred;

    const naturalPreferred = enVoices.find(
      (v) => v.name.includes('Natural') || v.name.includes('Google') || v.localService
    );
    return naturalPreferred || enVoices[0];
  }

  private pickBestVietnameseMaleWebSpeechVoice(): SpeechSynthesisVoice | null {
    this.loadVoices();
    if (!this.cachedVoices.length) return null;

    // Chỉ khớp các giọng thực sự là Tiếng Việt (vi-VN), tuyệt đối không khớp nhầm giọng tiếng Anh như Samantha/Daniel
    const viVoices = this.cachedVoices.filter((v) => {
      const lang = (v.lang || '').toLowerCase();
      const name = (v.name || '').toLowerCase();
      return (
        lang.startsWith('vi') ||
        name.includes('vietnam') ||
        name.includes('tiếng việt') ||
        name.includes('namminh') ||
        name.includes('hoaimy')
      );
    });

    if (viVoices.length === 0) return null;

    // Ưu tiên giọng Nam tiếng Việt nếu có trên thiết bị (ví dụ Microsoft NamMinh, Google Tiếng Việt)
    const malePreferred = viVoices.find((v) => {
      const name = v.name.toLowerCase();
      return (
        name.includes('namminh') ||
        name.includes('nam minh') ||
        name.includes('male')
      );
    });
    if (malePreferred) return malePreferred;

    const naturalPreferred = viVoices.find(
      (v) => v.name.includes('Natural') || v.name.includes('Google') || v.localService
    );
    return naturalPreferred || viVoices[0];
  }

  public unlockAudioOnUserGesture(): void {
    if (this.unlocked) return;
    this.unlocked = true;

    // Mở khóa phần tử HTMLAudioElement dùng chung ngay trong sự kiện tương tác của người dùng
    // để khi phản hồi từ /api/tts/vieneu trả về sau vài giây, trình duyệt luôn cho phép phát tiếng
    try {
      if (!this.sharedAudio && typeof Audio !== 'undefined') {
        this.sharedAudio = new Audio();
      }
      if (this.sharedAudio && !this.isSpeakingState) {
        this.sharedAudio.src = SILENT_WAV_DATA_URI;
        this.sharedAudio.volume = 0.01;
        const p = this.sharedAudio.play();
        if (p && typeof p.then === 'function') {
          p.then(() => {
            if (!this.isSpeakingState && this.sharedAudio) {
              this.sharedAudio.pause();
              this.sharedAudio.currentTime = 0;
              this.sharedAudio.volume = this.muted ? 0 : 1;
            }
          }).catch(() => {
            this.unlocked = false;
          });
        }
      }
    } catch {
      // ignore
    }

    try {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        const silent = new SpeechSynthesisUtterance('');
        silent.volume = 0;
        silent.lang = 'vi-VN';
        window.speechSynthesis.speak(silent);
      }
    } catch {
      // ignore
    }
  }

  private async fetchOrGetCachedVieNeuBlobUrl(
    chunkText: string,
    signal?: AbortSignal,
    lang: 'vi' | 'en' = this.language
  ): Promise<string | null> {
    const clean = (chunkText || '').trim();
    if (!clean) return null;
    const cacheKey = `${lang}::${this.maleVoice}::${clean}`;
    const existing = this.clientAudioUrlCache.get(cacheKey);
    if (existing) return existing;

    try {
      const res = await fetch('/api/tts/vieneu', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: clean,
          voice: this.maleVoice,
          lang,
        }),
        signal,
      });
      if (!res.ok) return null;
      const data = await res.json();
      if (data?.success && data?.audioBase64) {
        const blobUrl = this.base64ToBlobUrl(
          data.audioBase64,
          data.mimeType || 'audio/wav'
        );
        this.storeInClientCache(cacheKey, blobUrl);
        return blobUrl;
      }
      return null;
    } catch {
      return null;
    }
  }

  private splitTextIntoSentenceChunks(
    fullText: string,
    maxChunkLen: number = 145
  ): Array<{ text: string; startOffset: number; endOffset: number }> {
    const totalLen = fullText.length;
    if (totalLen <= maxChunkLen) {
      return [{ text: fullText, startOffset: 0, endOffset: totalLen }];
    }

    const chunks: Array<{ text: string; startOffset: number; endOffset: number }> = [];
    let cursor = 0;

    while (cursor < totalLen) {
      if (totalLen - cursor <= maxChunkLen) {
        const tail = fullText.slice(cursor).trim();
        if (tail) {
          chunks.push({ text: tail, startOffset: cursor, endOffset: totalLen });
        }
        break;
      }

      const slice = fullText.slice(cursor, cursor + maxChunkLen);
      // Ưu tiên ngắt tại dấu chấm câu (. ! ? ;), nếu không có thì ngắt tại dấu phẩy hoặc khoảng trắng
      let splitRel = -1;
      for (let i = slice.length - 1; i >= Math.floor(maxChunkLen * 0.42); i--) {
        const ch = slice[i];
        if (ch === '.' || ch === '!' || ch === '?' || ch === '…' || ch === ';') {
          splitRel = i + 1;
          break;
        }
      }
      if (splitRel === -1) {
        for (let i = slice.length - 1; i >= Math.floor(maxChunkLen * 0.5); i--) {
          if (slice[i] === ',' || slice[i] === ':') {
            splitRel = i + 1;
            break;
          }
        }
      }
      if (splitRel === -1) {
        splitRel = slice.lastIndexOf(' ');
      }
      if (splitRel <= 0) {
        splitRel = maxChunkLen;
      }

      const nextEnd = cursor + splitRel;
      const piece = fullText.slice(cursor, nextEnd).trim();
      if (piece) {
        chunks.push({ text: piece, startOffset: cursor, endOffset: nextEnd });
      }
      cursor = nextEnd;
      while (cursor < totalLen && fullText[cursor] === ' ') {
        cursor++;
      }
    }

    return chunks.length > 0
      ? chunks
      : [{ text: fullText, startOffset: 0, endOffset: totalLen }];
  }

  private base64ToBlobUrl(base64: string, mimeType: string): string {
    const binary = window.atob(base64);
    const len = binary.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    const blob = new Blob([bytes], { type: mimeType });
    return URL.createObjectURL(blob);
  }

  private storeInClientCache(key: string, blobUrl: string): void {
    if (this.clientAudioUrlCache.size >= 60) {
      const oldestKey = this.clientAudioUrlCache.keys().next().value;
      if (oldestKey) {
        const oldUrl = this.clientAudioUrlCache.get(oldestKey);
        if (oldUrl) URL.revokeObjectURL(oldUrl);
        this.clientAudioUrlCache.delete(oldestKey);
      }
    }
    this.clientAudioUrlCache.set(key, blobUrl);
  }

  private clearProgressTimer(): void {
    if (this.progressTimer !== null && typeof window !== 'undefined') {
      window.clearInterval(this.progressTimer);
      this.progressTimer = null;
    }
  }

  /**
   * Đồng bộ phụ đề và nhép miệng Rồng 3D theo thời gian thực của file âm thanh VieNeu-TTS.
   */
  private startAudioElementSyncLoop(
    audio: HTMLAudioElement,
    fullText: string,
    chunkStartOffset: number,
    chunkEndOffset: number,
    sessionId: number,
    callbacks?: GuideVoiceCallbacks
  ): void {
    this.clearProgressTimer();
    const totalLen = fullText.length;
    const chunkLen = Math.max(1, chunkEndOffset - chunkStartOffset);
    if (totalLen === 0) return;

    let lastWordCharIdx = -1;

    this.progressTimer = window.setInterval(() => {
      if (
        this.speechSessionId !== sessionId ||
        this.isPausedState ||
        !this.isSpeakingState
      ) {
        return;
      }

      const duration = audio.duration;
      const currentTime = audio.currentTime;

      if (Number.isFinite(duration) && duration > 0.05) {
        const ratio = Math.min(1, Math.max(0, currentTime / duration));
        const targetIdx = chunkStartOffset + Math.floor(ratio * chunkLen);
        this.simulatedCharIndex = Math.min(
          chunkEndOffset,
          Math.max(this.simulatedCharIndex, targetIdx)
        );
      } else {
        const charsPerStep = Math.max(1, Math.round(1.6 * this.rate));
        this.simulatedCharIndex = Math.min(
          chunkEndOffset,
          this.simulatedCharIndex + charsPerStep
        );
      }

      callbacks?.onProgress?.(this.simulatedCharIndex, totalLen);

      const { word, isPunctuationPause, isClauseBreak } = extractWordAtCharIndex(
        fullText,
        Math.min(totalLen - 1, this.simulatedCharIndex)
      );

      const vowelEst = isPunctuationPause
        ? 0.05
        : estimateVietnameseVowelOpenness(word);

      // Tạo nhịp dao động âm tiết tự nhiên (11Hz) đồng bộ với nguyên âm tiếng Việt đang phát
      const syllableWave = 0.78 + 0.22 * Math.sin(performance.now() * 0.068);
      const combinedOpenness = isPunctuationPause
        ? 0.04
        : Math.min(1.0, Math.max(0.12, vowelEst * syllableWave));

      const shouldPulseClause =
        isClauseBreak && Math.abs(this.simulatedCharIndex - lastWordCharIdx) >= 3;
      if (shouldPulseClause) {
        lastWordCharIdx = this.simulatedCharIndex;
      }

      callbacks?.onWordBoundary?.({
        word,
        charIndex: this.simulatedCharIndex,
        vowelOpenness: combinedOpenness,
        isClauseBreak: shouldPulseClause,
      });
    }, 65);
  }

  /**
   * Bộ tạo nhịp mô phỏng 5-8 nhịp/giây (dùng khi tắt tiếng hoặc đang chờ / dự phòng WebSpeech)
   */
  private startSimulatedProgress(
    text: string,
    callbacks?: GuideVoiceCallbacks,
    finishOnTimerEnd: boolean = false
  ): void {
    this.clearProgressTimer();
    const totalLen = text.length;
    if (totalLen === 0) return;

    const intervalMs = Math.round(150 / this.rate);
    const charsPerStep = Math.max(2, Math.round(2.3 * this.rate));

    this.progressTimer = window.setInterval(() => {
      if (this.isPausedState || !this.isSpeakingState) return;

      const now = performance.now();
      const nativeBoundaryActive = now - this.lastBoundaryTimeMs < 420;

      if (this.pauseTicksRemaining > 0) {
        this.pauseTicksRemaining -= 1;
        if (!nativeBoundaryActive) {
          callbacks?.onWordBoundary?.({
            word: '',
            charIndex: this.simulatedCharIndex,
            vowelOpenness: 0.04,
            isClauseBreak: true,
          });
        }
        return;
      }

      const prevIdx = this.simulatedCharIndex;
      this.simulatedCharIndex = Math.min(totalLen, this.simulatedCharIndex + charsPerStep);
      callbacks?.onProgress?.(this.simulatedCharIndex, totalLen);

      const segment = text.slice(prevIdx, this.simulatedCharIndex);
      if (/[.!?…]/.test(segment)) {
        this.pauseTicksRemaining = 2;
      } else if (/[,;:]/.test(segment)) {
        this.pauseTicksRemaining = 1;
      }

      if (!nativeBoundaryActive) {
        const { word, isPunctuationPause, isClauseBreak } = extractWordAtCharIndex(
          text,
          prevIdx
        );
        const rateScale = this.rate === 0.8 ? 0.82 : this.rate === 1.2 ? 1.05 : 1.0;
        const openness = isPunctuationPause
          ? 0.05
          : estimateVietnameseVowelOpenness(word) * rateScale;

        callbacks?.onWordBoundary?.({
          word,
          charIndex: prevIdx,
          vowelOpenness: openness,
          isClauseBreak,
        });
      }

      if (this.simulatedCharIndex >= totalLen && finishOnTimerEnd) {
        this.clearProgressTimer();
        this.isSpeakingState = false;
        callbacks?.onEnd?.();
      }
    }, intervalMs);
  }

  /**
   * Dự phòng đọc bằng Web Speech API (hỗ trợ cả Tiếng Việt vi-VN và Tiếng Anh en-US)
   */
  private speakWithWebSpeechMaleFallback(
    cleanText: string,
    sessionId: number,
    callbacks?: GuideVoiceCallbacks,
    targetLang: 'vi' | 'en' = this.language
  ): void {
    if (this.speechSessionId !== sessionId) return;

    const hasWebSpeech =
      typeof window !== 'undefined' &&
      'speechSynthesis' in window &&
      typeof SpeechSynthesisUtterance !== 'undefined';

    if (!hasWebSpeech || this.muted) {
      this.startSimulatedProgress(cleanText, callbacks, true);
      return;
    }

    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.lang = targetLang === 'en' ? 'en-US' : 'vi-VN';
      utterance.rate = this.rate;
      // Hạ pitch xuống 0.92 cho tiếng Anh hoặc 0.86 cho tiếng Việt để tạo âm sắc giọng Nam ấm áp
      utterance.pitch = targetLang === 'en' ? 0.94 : 0.86;
      utterance.volume = this.muted ? 0 : 1;

      const selectedVoice =
        targetLang === 'en'
          ? this.pickBestEnglishMaleWebSpeechVoice()
          : this.pickBestVietnameseMaleWebSpeechVoice();
      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }

      utterance.onboundary = (event: SpeechSynthesisEvent) => {
        if (this.speechSessionId !== sessionId) return;
        if (typeof event.charIndex === 'number') {
          this.lastBoundaryTimeMs = performance.now();
          this.simulatedCharIndex = Math.max(this.simulatedCharIndex, event.charIndex);
          callbacks?.onProgress?.(this.simulatedCharIndex, cleanText.length);

          const { word, isPunctuationPause, isClauseBreak } = extractWordAtCharIndex(
            cleanText,
            event.charIndex
          );
          const openness = isPunctuationPause
            ? 0.06
            : estimateVietnameseVowelOpenness(word);

          callbacks?.onWordBoundary?.({
            word,
            charIndex: event.charIndex,
            vowelOpenness: openness,
            isClauseBreak,
          });
        }
      };

      utterance.onend = () => {
        if (this.speechSessionId !== sessionId) return;
        this.clearProgressTimer();
        this.isSpeakingState = false;
        this.isPausedState = false;
        callbacks?.onProgress?.(cleanText.length, cleanText.length);
        callbacks?.onEnd?.();
      };

      utterance.onerror = () => {
        if (this.speechSessionId !== sessionId) return;
        if (this.isSpeakingState) {
          this.startSimulatedProgress(cleanText, callbacks, true);
        }
      };

      this.startSimulatedProgress(cleanText, callbacks, true);
      window.speechSynthesis.speak(utterance);
    } catch {
      this.startSimulatedProgress(cleanText, callbacks, true);
    }
  }

  public speak(text: string, callbacks?: GuideVoiceCallbacks, lang?: 'vi' | 'en'): void {
    this.stop();

    const cleanText = (text || '').trim();
    if (!cleanText) return;

    const activeLang: 'vi' | 'en' = lang ? (lang === 'en' ? 'en' : 'vi') : this.language;

    this.speechSessionId += 1;
    const sessionId = this.speechSessionId;

    this.currentText = cleanText;
    this.currentCallbacks = callbacks;
    this.simulatedCharIndex = 0;
    this.isPausedState = false;
    this.isSpeakingState = true;
    this.lastBoundaryTimeMs = 0;
    this.pauseTicksRemaining = 0;

    callbacks?.onStart?.();

    // Nếu đang ở chế độ tắt tiếng (Muted), chỉ chạy phụ đề và hoạt ảnh nhép miệng mô phỏng
    if (this.muted) {
      this.startSimulatedProgress(cleanText, callbacks, true);
      return;
    }

    const chunks = this.splitTextIntoSentenceChunks(cleanText, 145);
    const abortController = new AbortController();
    this.activeAbortController = abortController;

    const playChunkAtIndex = async (chunkIndex: number) => {
      if (this.speechSessionId !== sessionId || !this.isSpeakingState) return;
      if (chunkIndex >= chunks.length) {
        this.clearProgressTimer();
        this.isSpeakingState = false;
        this.isPausedState = false;
        this.activeAudio = null;
        callbacks?.onProgress?.(cleanText.length, cleanText.length);
        callbacks?.onEnd?.();
        return;
      }

      const currentChunk = chunks[chunkIndex];
      const blobUrl = await this.fetchOrGetCachedVieNeuBlobUrl(
        currentChunk.text,
        abortController.signal,
        activeLang
      );

      if (this.speechSessionId !== sessionId || !this.isSpeakingState) return;

      if (!blobUrl) {
        // Nếu câu đầu tiên không tải được từ server TTS thì chuyển mượt sang WebSpeech theo đúng ngôn ngữ
        if (chunkIndex === 0) {
          this.speakWithWebSpeechMaleFallback(cleanText, sessionId, callbacks, activeLang);
        } else {
          const remainingText = cleanText.slice(currentChunk.startOffset).trim();
          if (remainingText) {
            this.speakWithWebSpeechMaleFallback(remainingText, sessionId, callbacks, activeLang);
          } else {
            this.clearProgressTimer();
            this.isSpeakingState = false;
            callbacks?.onEnd?.();
          }
        }
        return;
      }

      // Trong lúc đang phát câu hiện tại, tải trước câu tiếp theo trong nền để nối câu liền mạch
      if (chunkIndex + 1 < chunks.length) {
        void this.fetchOrGetCachedVieNeuBlobUrl(
          chunks[chunkIndex + 1].text,
          abortController.signal,
          activeLang
        );
      }

      this.playVieNeuBlobUrl(
        blobUrl,
        cleanText,
        currentChunk.startOffset,
        currentChunk.endOffset,
        sessionId,
        callbacks,
        () => {
          void playChunkAtIndex(chunkIndex + 1);
        }
      );
    };

    void playChunkAtIndex(0);
  }

  private playVieNeuBlobUrl(
    blobUrl: string,
    fullText: string,
    chunkStartOffset: number,
    chunkEndOffset: number,
    sessionId: number,
    callbacks?: GuideVoiceCallbacks,
    onChunkEnded?: () => void
  ): void {
    if (this.speechSessionId !== sessionId || !this.isSpeakingState) return;

    try {
      if (!this.sharedAudio) {
        this.sharedAudio = new Audio();
      }
      const audio = this.sharedAudio;
      audio.onended = null;
      audio.onerror = null;
      audio.onplay = null;
      audio.pause();

      audio.src = blobUrl;
      audio.preload = 'auto';
      audio.playbackRate = this.rate;
      audio.volume = this.muted ? 0 : 1;
      this.activeAudio = audio;

      audio.onplay = () => {
        if (this.speechSessionId !== sessionId) return;
        this.isSpeakingState = true;
        this.startAudioElementSyncLoop(
          audio,
          fullText,
          chunkStartOffset,
          chunkEndOffset,
          sessionId,
          callbacks
        );
      };

      audio.onended = () => {
        if (this.speechSessionId !== sessionId) return;
        this.clearProgressTimer();
        this.activeAudio = null;
        this.simulatedCharIndex = Math.max(this.simulatedCharIndex, chunkEndOffset);
        callbacks?.onProgress?.(this.simulatedCharIndex, fullText.length);
        if (onChunkEnded) {
          onChunkEnded();
        } else {
          this.isSpeakingState = false;
          this.isPausedState = false;
          callbacks?.onEnd?.();
        }
      };

      audio.onerror = () => {
        if (this.speechSessionId !== sessionId) return;
        this.activeAudio = null;
        this.speakWithWebSpeechMaleFallback(
          fullText.slice(chunkStartOffset).trim() || fullText,
          sessionId,
          callbacks
        );
      };

      if (this.isPausedState) {
        this.startAudioElementSyncLoop(
          audio,
          fullText,
          chunkStartOffset,
          chunkEndOffset,
          sessionId,
          callbacks
        );
        return;
      }

      const playPromise = audio.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(() => {
          if (this.speechSessionId !== sessionId) return;
          this.activeAudio = null;
          this.speakWithWebSpeechMaleFallback(
            fullText.slice(chunkStartOffset).trim() || fullText,
            sessionId,
            callbacks
          );
        });
      }
    } catch {
      this.speakWithWebSpeechMaleFallback(
        fullText.slice(chunkStartOffset).trim() || fullText,
        sessionId,
        callbacks
      );
    }
  }

  public pause(): void {
    if (!this.isSpeakingState || this.isPausedState) return;
    this.isPausedState = true;
    try {
      if (this.activeAudio && !this.activeAudio.paused) {
        this.activeAudio.pause();
      }
      if (typeof window !== 'undefined' && 'speechSynthesis' in window && window.speechSynthesis.speaking) {
        window.speechSynthesis.pause();
      }
    } catch {
      // ignore
    }
    this.currentCallbacks?.onPause?.();
  }

  public resume(): void {
    if (!this.isSpeakingState || !this.isPausedState) return;
    this.isPausedState = false;
    try {
      if (this.activeAudio && this.activeAudio.paused) {
        this.activeAudio.playbackRate = this.rate;
        this.activeAudio.play().catch(() => {});
      }
      if (typeof window !== 'undefined' && 'speechSynthesis' in window && window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }
    } catch {
      // ignore
    }
    this.currentCallbacks?.onResume?.();
  }

  public stop(): void {
    this.speechSessionId += 1;
    this.clearProgressTimer();
    this.isSpeakingState = false;
    this.isPausedState = false;
    this.simulatedCharIndex = 0;
    this.pauseTicksRemaining = 0;

    if (this.activeAbortController) {
      try {
        this.activeAbortController.abort();
      } catch {
        // ignore
      }
      this.activeAbortController = null;
    }

    if (this.activeAudio) {
      try {
        this.activeAudio.onended = null;
        this.activeAudio.onerror = null;
        this.activeAudio.onplay = null;
        this.activeAudio.pause();
        this.activeAudio.currentTime = 0;
      } catch {
        // ignore
      }
      this.activeAudio = null;
    }

    try {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    } catch {
      // ignore
    }
  }

  public setRate(rate: GuideSpeechRate): void {
    this.rate = rate;
    if (this.activeAudio) {
      try {
        this.activeAudio.playbackRate = rate;
      } catch {
        // ignore
      }
    }
  }

  public getRate(): GuideSpeechRate {
    return this.rate;
  }

  public setMuted(muted: boolean): void {
    this.muted = muted;
    if (this.activeAudio) {
      try {
        this.activeAudio.volume = muted ? 0 : 1;
      } catch {
        // ignore
      }
    }
    if (muted && typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch {
        // ignore
      }
      if (this.isSpeakingState && !this.activeAudio && this.currentText) {
        this.startSimulatedProgress(this.currentText, this.currentCallbacks, true);
      }
    }
  }

  public isMuted(): boolean {
    return this.muted;
  }
}

export const guideVoiceService: IGuideVoiceProvider = new VieNeuGuideVoiceProvider();

