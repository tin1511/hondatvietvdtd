import React, { useState, useEffect, useMemo } from 'react';
import { HeritageAmbienceMode } from '../types';

export interface DynamicHeritageBackgroundProps {
  imageUrl: string;
  videoUrl?: string;
  alt: string;
  overlayOpacity?: number;
  isPeeking?: boolean;
  shouldLoad?: boolean;
  isActiveTab?: boolean;
  priority?: 'high' | 'low';
  ambienceMode?: HeritageAmbienceMode;
  enableDynamicEffects?: boolean;
  onImageLoaded?: () => void;
  fallbackImageUrl?: string;
}

/**
 * Extracts YouTube Video ID if the URL is a YouTube link (watch, youtu.be, shorts, embed)
 */
export function extractYouTubeId(url?: string): string | null {
  if (!url) return null;
  const trimmed = url.trim();
  const regExp = /(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?|shorts)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/i;
  const match = trimmed.match(regExp);
  return match && match[1] ? match[1] : null;
}

/**
 * Detects whether a URL is a video (MP4, WebM, MOV, data:video/*, or YouTube)
 */
export function isVideoSourceUrl(url?: string): boolean {
  if (!url) return false;
  const u = url.trim().toLowerCase();
  if (u.startsWith('data:video/')) return true;
  if (extractYouTubeId(u)) return true;
  return /\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(u);
}

const PARTICLE_SEEDS = [
  { id: 1, left: '8%', bottom: '10%', size: 6, delay: '0s', duration: '12s', isLantern: true },
  { id: 2, left: '16%', bottom: '18%', size: 4, delay: '2.2s', duration: '10s', isLantern: false },
  { id: 3, left: '25%', bottom: '8%', size: 5, delay: '4.1s', duration: '13s', isLantern: false },
  { id: 4, left: '34%', bottom: '22%', size: 7, delay: '1.5s', duration: '14s', isLantern: true },
  { id: 5, left: '46%', bottom: '12%', size: 4, delay: '3.4s', duration: '11s', isLantern: false },
  { id: 6, left: '57%', bottom: '16%', size: 6, delay: '0.8s', duration: '12.5s', isLantern: true },
  { id: 7, left: '68%', bottom: '9%', size: 4, delay: '5.0s', duration: '10.5s', isLantern: false },
  { id: 8, left: '78%', bottom: '20%', size: 7, delay: '2.8s', duration: '13.5s', isLantern: true },
  { id: 9, left: '86%', bottom: '14%', size: 5, delay: '1.1s', duration: '11.5s', isLantern: false },
  { id: 10, left: '93%', bottom: '11%', size: 4, delay: '3.9s', duration: '12s', isLantern: false },
];

export function resolveEffectiveAmbience(mode: HeritageAmbienceMode = 'auto'): 'dawn' | 'sunset' | 'lantern' {
  if (mode !== 'auto') return mode;
  const hour = new Date().getHours();
  if (hour >= 6 && hour < 15) return 'dawn';
  if (hour >= 15 && hour < 18) return 'sunset';
  return 'lantern';
}

/**
 * Họa tiết Trống Đồng Đông Sơn xoay chậm đa lớp ở hậu cảnh Giấy Dó (cho cả trang chủ và các tab tính năng)
 */
export const DongSonWatermarkSvg: React.FC<{ className?: string; opacityClass?: string }> = ({
  className = 'w-[340px] h-[340px] sm:w-[540px] sm:h-[540px]',
  opacityClass = 'opacity-[0.11]',
}) => (
  <div
    aria-hidden="true"
    className={`pointer-events-none select-none flex items-center justify-center ${className} ${opacityClass}`}
  >
    {/* Vòng ngoài xoay thuận chiều kim đồng hồ */}
    <svg
      viewBox="0 0 200 200"
      className="w-full h-full text-[#C8963E] animate-hdv-dongson-slow"
    >
      <circle cx="100" cy="100" r="95" fill="none" stroke="currentColor" strokeWidth="1.2" strokeDasharray="4 3" />
      <circle cx="100" cy="100" r="88" fill="none" stroke="currentColor" strokeWidth="0.9" />
      <circle cx="100" cy="100" r="74" fill="none" stroke="currentColor" strokeWidth="1.1" strokeDasharray="8 4" />
      <circle cx="100" cy="100" r="58" fill="none" stroke="currentColor" strokeWidth="0.8" />
      {/* Các tia họa tiết hình học Đông Sơn */}
      {Array.from({ length: 16 }).map((_, idx) => {
        const angle = (idx * 360) / 16;
        return (
          <g key={idx} transform={`rotate(${angle} 100 100)`}>
            <line x1="100" y1="6" x2="100" y2="12" stroke="currentColor" strokeWidth="1.1" />
            <circle cx="100" cy="19" r="1.8" fill="currentColor" />
            <path d="M97 30 L100 24 L103 30 Z" fill="currentColor" opacity="0.75" />
          </g>
        );
      })}
      {/* Ngôi sao 12 cánh trung tâm mặt trống đồng */}
      {Array.from({ length: 12 }).map((_, idx) => {
        const angle = (idx * 360) / 12;
        return (
          <polygon
            key={idx}
            points="100,66 96,94 104,94"
            fill="currentColor"
            transform={`rotate(${angle} 100 100)`}
          />
        );
      })}
      <circle cx="100" cy="100" r="10" fill="currentColor" />
    </svg>
  </div>
);

export const DynamicHeritageBackground: React.FC<DynamicHeritageBackgroundProps> = ({
  imageUrl,
  videoUrl,
  alt,
  overlayOpacity = 0.36,
  isPeeking = false,
  shouldLoad = true,
  isActiveTab = true,
  priority = 'low',
  ambienceMode = 'auto',
  enableDynamicEffects = true,
  onImageLoaded,
  fallbackImageUrl = '/assets/aistudio/hue_imperial_poster_hd.jpg',
}) => {
  const [imgSrc, setImgSrc] = useState<string>(imageUrl);
  const [videoFailed, setVideoFailed] = useState<boolean>(false);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const videoRef = React.useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    setImgSrc(imageUrl);
    setVideoFailed(false);
  }, [imageUrl, videoUrl]);

  const effectiveVideoUrl = useMemo(() => {
    if (videoFailed) return '';
    if (videoUrl && videoUrl.trim()) return videoUrl.trim();
    if (isVideoSourceUrl(imageUrl)) return imageUrl.trim();
    return '';
  }, [videoUrl, imageUrl, videoFailed]);

  const youtubeId = useMemo(() => extractYouTubeId(effectiveVideoUrl), [effectiveVideoUrl]);
  const hasActiveVideo = Boolean(effectiveVideoUrl);
  const effectiveAmbience = resolveEffectiveAmbience(ambienceMode);

  // Ensure smooth auto-play & infinite continuous looping on active tab, pause when hidden tab to save GPU
  useEffect(() => {
    const vid = videoRef.current;
    if (!vid || !shouldLoad || !hasActiveVideo || youtubeId) return;

    vid.muted = true;
    vid.defaultMuted = true;
    vid.loop = true;
    vid.playsInline = true;

    if (!isActiveTab) {
      if (!vid.paused) {
        vid.pause();
      }
      return;
    }

    const playSafely = () => {
      if (!vid || !isActiveTab) return;
      vid.muted = true;
      vid.loop = true;
      if (vid.paused) {
        vid.play().catch(() => {});
      }
    };

    playSafely();

    const handleVisibility = () => {
      if (!document.hidden && isActiveTab) {
        playSafely();
      }
    };
    const handleUserGesture = () => {
      if (isActiveTab) {
        playSafely();
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('pointerdown', handleUserGesture, { passive: true });
    window.addEventListener('touchstart', handleUserGesture, { passive: true });
    window.addEventListener('wheel', handleUserGesture, { passive: true });
    window.addEventListener('keydown', handleUserGesture, { passive: true });

    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('pointerdown', handleUserGesture);
      window.removeEventListener('touchstart', handleUserGesture);
      window.removeEventListener('wheel', handleUserGesture);
      window.removeEventListener('keydown', handleUserGesture);
    };
  }, [effectiveVideoUrl, shouldLoad, hasActiveVideo, youtubeId, isActiveTab]);

  // Scrim gradient tailored to the selected time-of-day ambience
  const overlayBackground = useMemo(() => {
    const baseOp = typeof overlayOpacity === 'number' ? overlayOpacity : 0.36;
    if (effectiveAmbience === 'sunset') {
      return `linear-gradient(180deg, rgba(248,220,184,${Math.max(0.10, baseOp - 0.16)}) 0%, rgba(212,118,58,0.14) 44%, rgba(59,34,22,${Math.min(0.72, baseOp + 0.04)}) 100%)`;
    }
    if (effectiveAmbience === 'lantern') {
      return `linear-gradient(180deg, rgba(38,26,20,${Math.max(0.18, baseOp - 0.10)}) 0%, rgba(59,42,32,0.18) 45%, rgba(36,22,16,${Math.min(0.78, baseOp + 0.12)}) 100%)`;
    }
    // Dawn / Daytime (Giấy Dó tươi sáng — giữ độ trong trẻo để video & hình ảnh sắc nét tối đa)
    return `linear-gradient(180deg, rgba(251,243,228,${Math.max(0.08, baseOp - 0.18)}) 0%, rgba(251,243,228,0.06) 44%, rgba(59,42,32,${baseOp}) 100%)`;
  }, [overlayOpacity, effectiveAmbience]);

  return (
    <div className="absolute inset-0 w-full h-full bg-[var(--bg)] pointer-events-none overflow-hidden select-none">
      {/* 1. Static Image Layer (Only rendered when no active video is playing) */}
      {shouldLoad && !youtubeId && !hasActiveVideo && (
        <img
          src={isVideoSourceUrl(imgSrc) ? fallbackImageUrl : imgSrc}
          alt={alt}
          width={1920}
          height={1080}
          fetchPriority={priority}
          loading={priority === 'high' ? 'eager' : 'lazy'}
          decoding="async"
          onLoad={() => {
            setIsLoaded(true);
            if (onImageLoaded) onImageLoaded();
          }}
          onError={() => {
            if (imgSrc !== fallbackImageUrl) {
              setImgSrc(fallbackImageUrl);
            }
          }}
          className={`hdv-crisp-media w-full h-full object-cover object-center transition-opacity duration-700 ease-out ${
            enableDynamicEffects && !isPeeking ? 'animate-hdv-kenburns' : ''
          } ${
            isPeeking
              ? 'opacity-100 scale-100'
              : isLoaded || priority === 'high'
              ? 'opacity-100 scale-100'
              : 'opacity-0'
          }`}
        />
      )}

      {/* 2A. Direct HTML5 Video Layer (HD 1280x720 Lanczos + CAS sharpened, fits screen 100% & loops infinitely) */}
      {shouldLoad && hasActiveVideo && !youtubeId && (
        <video
          ref={videoRef}
          key={effectiveVideoUrl}
          src={effectiveVideoUrl}
          poster={isVideoSourceUrl(imgSrc) ? fallbackImageUrl : imgSrc || fallbackImageUrl}
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          onLoadedMetadata={(e) => {
            const v = e.currentTarget;
            v.muted = true;
            v.loop = true;
            if (isActiveTab) {
              v.play().catch(() => {});
            }
          }}
          onLoadedData={(e) => {
            setIsLoaded(true);
            if (onImageLoaded) onImageLoaded();
            if (isActiveTab) {
              e.currentTarget.play().catch(() => {});
            }
          }}
          onCanPlay={(e) => {
            if (isActiveTab) {
              e.currentTarget.play().catch(() => {});
            }
          }}
          onEnded={(e) => {
            const v = e.currentTarget;
            v.currentTime = 0;
            if (isActiveTab) {
              v.play().catch(() => {});
            }
          }}
          onPause={(e) => {
            const v = e.currentTarget;
            if (!document.hidden && isActiveTab) {
              v.play().catch(() => {});
            }
          }}
          onError={() => setVideoFailed(true)}
          className="hdv-crisp-media absolute inset-0 w-full h-full object-cover object-center scale-100 opacity-100 transition-opacity duration-500 ease-out"
        />
      )}

      {/* 2B. YouTube Background Embed Layer */}
      {shouldLoad && youtubeId && (
        <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none">
          <iframe
            title={alt}
            src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&mute=1&loop=1&playlist=${youtubeId}&controls=0&showinfo=0&rel=0&modestbranding=1&playsinline=1&iv_load_policy=3&vq=hd1080`}
            allow="autoplay; encrypted-media"
            className="absolute top-1/2 left-1/2 w-[177.78vh] min-w-full min-h-full h-[56.25vw] -translate-x-1/2 -translate-y-1/2 object-cover pointer-events-none"
          />
        </div>
      )}

      {/* 3. Ambient Sunbeam / Golden Hour / Lantern Glow Layer */}
      {enableDynamicEffects && !isPeeking && (
        <div
          className="absolute inset-0 transition-opacity duration-700"
          style={{
            background:
              effectiveAmbience === 'sunset'
                ? 'radial-gradient(circle at 78% 18%, rgba(235, 138, 68, 0.28) 0%, rgba(200, 150, 62, 0.10) 42%, transparent 72%)'
                : effectiveAmbience === 'lantern'
                ? 'radial-gradient(circle at 50% 25%, rgba(228, 155, 58, 0.24) 0%, rgba(179, 38, 30, 0.10) 48%, transparent 75%)'
                : 'radial-gradient(circle at 22% 16%, rgba(255, 236, 179, 0.30) 0%, rgba(200, 150, 62, 0.08) 45%, transparent 70%)',
          }}
        />
      )}

      {/* 4. Subtle Rotating Dong Son Drum Mandala in the upper sky corner */}
      {enableDynamicEffects && !isPeeking && (
        <DongSonWatermarkSvg
          className="absolute -top-24 -right-24 w-[300px] h-[300px] sm:w-[460px] sm:h-[460px]"
          opacityClass={effectiveAmbience === 'lantern' ? 'opacity-[0.18]' : 'opacity-[0.13]'}
        />
      )}

      {/* 5. Floating Heritage Golden Dust & Hoi An Lantern Sparks (GPU Compositor Only) */}
      {enableDynamicEffects && !isPeeking && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {PARTICLE_SEEDS.map((p) => (
            <span
              key={p.id}
              className="absolute rounded-full animate-hdv-particle"
              style={{
                left: p.left,
                bottom: p.bottom,
                width: `${p.size}px`,
                height: `${p.size}px`,
                animationDelay: p.delay,
                animationDuration: p.duration,
                backgroundColor: p.isLantern
                  ? effectiveAmbience === 'lantern'
                    ? '#FFA726'
                    : '#E5A93C'
                  : '#FFF3D1',
                boxShadow: p.isLantern
                  ? '0 0 10px 2px rgba(229, 169, 60, 0.65)'
                  : '0 0 6px 1px rgba(255, 243, 209, 0.45)',
              }}
            />
          ))}
        </div>
      )}

      {/* 6. Measured Contrast Scrim Overlay (Hidden when user clicks "Ngắm ảnh/video nền") */}
      <div
        className={`absolute inset-0 transition-opacity duration-500 ${
          isPeeking ? 'opacity-0' : 'opacity-100'
        }`}
        style={{ background: overlayBackground }}
      />
    </div>
  );
};
