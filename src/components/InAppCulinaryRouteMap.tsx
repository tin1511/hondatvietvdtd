import React, { useEffect, useRef, useState, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  Navigation,
  MapPin,
  Volume2,
  LocateFixed,
  Compass,
  RefreshCw,
  Maximize2,
  Star,
} from 'lucide-react';
import { HeritageItem, PlaceItem, UserLocation } from '../types';
import {
  fetchRoadRoute,
  buildRouteVoiceNarration,
  RoadRouteResult,
  TravelModeType,
} from '../services/routeNavigationService';
import { geolocationService } from '../services/geolocationService';
import { guideVoiceService, triggerGuideNarration } from '../services/guideVoiceService';

interface InAppCulinaryRouteMapProps {
  heritage: HeritageItem | undefined;
  places: PlaceItem[];
  selectedPlace: PlaceItem | null;
  onSelectPlace: (place: PlaceItem) => void;
  onOpenFullscreenMap?: () => void;
  language?: string;
}

export const InAppCulinaryRouteMap: React.FC<InAppCulinaryRouteMapProps> = ({
  heritage,
  places,
  selectedPlace,
  onSelectPlace,
  onOpenFullscreenMap,
  language = 'vi',
}) => {
  const isEn = language === 'en';
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const routeLayerRef = useRef<L.LayerGroup | null>(null);

  const [travelMode, setTravelMode] = useState<TravelModeType>('driving');
  const [useUserGps, setUseUserGps] = useState<boolean>(true);
  const [userLocation, setUserLocation] = useState<UserLocation | null>(() => {
    const saved = geolocationService.getLastKnownLocation();
    return saved && saved.source === 'gps' ? saved : null;
  });
  const userLocationRef = useRef<UserLocation | null>(userLocation);
  userLocationRef.current = userLocation;
  const [isLocatingGps, setIsLocatingGps] = useState<boolean>(false);
  const [roadRoute, setRoadRoute] = useState<RoadRouteResult | null>(null);
  const [isCalculating, setIsCalculating] = useState<boolean>(false);
  const [activeStepIndex, setActiveStepIndex] = useState<number | null>(null);

  const originLat =
    useUserGps && userLocation ? userLocation.lat : heritage?.lat ?? 16.0044;
  const originLng =
    useUserGps && userLocation ? userLocation.lng : heritage?.lng ?? 108.2633;
  const originLabel =
    useUserGps && userLocation
      ? isEn
        ? `Your GPS (${userLocation.cityName || 'Current Location'})`
        : `GPS của bạn (${userLocation.cityName || 'Hiện tại'})`
      : heritage?.name || (isEn ? 'Heritage Site' : 'Điểm Di sản');

  // Initialize Leaflet map once
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [originLat, originLng],
      zoom: 15,
      minZoom: 5,
      maxZoom: 19,
      zoomControl: true,
      attributionControl: false,
    });

    const primaryTile = L.tileLayer('https://tile.openstreetmap.de/{z}/{x}/{y}.png', {
      maxZoom: 19,
      maxNativeZoom: 18,
      keepBuffer: 4,
      updateWhenIdle: false,
      attribution: '&copy; OpenStreetMap contributors',
    });
    let fallbackAdded = false;
    let errorCount = 0;
    primaryTile.on('tileerror', () => {
      errorCount += 1;
      if (fallbackAdded || errorCount < 2 || !mapInstanceRef.current) return;
      fallbackAdded = true;
      mapInstanceRef.current.removeLayer(primaryTile);
      L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}',
        {
          maxZoom: 19,
          maxNativeZoom: 18,
          attribution: '&copy; Esri World Street Map',
        }
      ).addTo(mapInstanceRef.current);
    });
    primaryTile.addTo(map);

    const routeGroup = L.layerGroup().addTo(map);
    routeLayerRef.current = routeGroup;
    mapInstanceRef.current = map;

    const resizeObserver = new ResizeObserver(() => {
      map.invalidateSize();
    });
    resizeObserver.observe(mapContainerRef.current);

    return () => {
      resizeObserver.disconnect();
      map.remove();
      mapInstanceRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Calculate road route whenever heritage, selectedPlace, travelMode, or origin changes
  const computeAndNarrateRoute = useCallback(
    async (
      targetPlace: PlaceItem | null,
      mode: TravelModeType,
      fromGps: boolean,
      shouldNarrate: boolean,
      overrideLocation?: UserLocation | null
    ) => {
      if (!targetPlace) {
        setRoadRoute(null);
        return;
      }

      let activeLoc = overrideLocation !== undefined ? overrideLocation : userLocationRef.current;
      const isGpsFresh =
        activeLoc &&
        activeLoc.source === 'gps' &&
        typeof activeLoc.timestamp === 'number' &&
        Date.now() - activeLoc.timestamp < 45000;

      if (fromGps && !isGpsFresh) {
        setIsLocatingGps(true);
        const gpsRes = await geolocationService.requestLiveGpsForNavigation(true);
        setIsLocatingGps(false);
        if (gpsRes.success && gpsRes.location) {
          activeLoc = gpsRes.location;
          userLocationRef.current = activeLoc;
          setUserLocation(activeLoc);
        }
      }

      const hasValidGps = Boolean(fromGps && activeLoc);
      const startLat =
        hasValidGps && activeLoc ? activeLoc.lat : heritage?.lat ?? targetPlace.lat - 0.005;
      const startLng =
        hasValidGps && activeLoc ? activeLoc.lng : heritage?.lng ?? targetPlace.lng - 0.005;
      const startName =
        hasValidGps && activeLoc
          ? isEn
            ? `Your GPS (${activeLoc.cityName || 'Current Location'})`
            : `Vị trí GPS của bạn (${activeLoc.cityName || 'Hiện tại'})`
          : heritage?.name || (isEn ? 'Heritage' : 'Di sản');

      setIsCalculating(true);
      setActiveStepIndex(null);
      const result = await fetchRoadRoute(
        startLat,
        startLng,
        targetPlace.lat,
        targetPlace.lng,
        mode,
        targetPlace.address
      );
      setRoadRoute(result);
      setIsCalculating(false);

      if (shouldNarrate) {
        guideVoiceService.unlockAudioOnUserGesture();
        const currentLang = isEn ? 'en' : 'vi';
        const voiceText = buildRouteVoiceNarration(
          startName,
          targetPlace,
          result,
          currentLang
        );

        triggerGuideNarration({
          id: `inapp-food-route-${targetPlace.id}-${Date.now()}`,
          title: isEn
            ? `GPS Route: ${targetPlace.name}`
            : `Chỉ đường GPS: ${targetPlace.name}`,
          subtitleBadge: `${result.distanceTextVi} · ${result.durationMinutes} ${
            isEn ? 'min' : 'phút'
          }`,
          introText: voiceText,
          targetType: 'food_recommendation',
          heritageId: heritage?.id,
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
      }
    },
    [heritage, isEn, places]
  );

  useEffect(() => {
    computeAndNarrateRoute(selectedPlace, travelMode, useUserGps, false);
  }, [selectedPlace, travelMode, useUserGps, computeAndNarrateRoute]);

  // Watch live GPS position updates while useUserGps is enabled
  useEffect(() => {
    if (!useUserGps) return;
    const stopWatch = geolocationService.watchLivePosition((liveLoc) => {
      userLocationRef.current = liveLoc;
      setUserLocation(liveLoc);
    });
    return () => {
      stopWatch();
    };
  }, [useUserGps]);

  // Render origin marker, restaurant pins, and road polyline on the map
  useEffect(() => {
    const map = mapInstanceRef.current;
    const routeGroup = routeLayerRef.current;
    if (!map || !routeGroup) return;

    routeGroup.clearLayers();

    // 1. Road Polyline following actual streets
    if (roadRoute && roadRoute.coordinates.length >= 2) {
      const outerCasing = L.polyline(roadRoute.coordinates, {
        color: '#064E3B',
        weight: 10,
        opacity: 0.6,
        lineCap: 'round',
        lineJoin: 'round',
      });
      const mainRoadLine = L.polyline(roadRoute.coordinates, {
        color: '#0D9488',
        weight: 6,
        opacity: 0.98,
        lineCap: 'round',
        lineJoin: 'round',
      });
      const directionalDash = L.polyline(roadRoute.coordinates, {
        color: '#FFFDF8',
        weight: 2.2,
        opacity: 0.92,
        dashArray: '8, 12',
        lineCap: 'round',
        lineJoin: 'round',
      });

      routeGroup.addLayer(outerCasing);
      routeGroup.addLayer(mainRoadLine);
      routeGroup.addLayer(directionalDash);

      const midIdx = Math.floor(roadRoute.coordinates.length / 2);
      const midPt = roadRoute.coordinates[midIdx];
      if (midPt) {
        const midBadge = L.marker(midPt, {
          interactive: false,
          icon: L.divIcon({
            className: 'hdv-inapp-route-mid',
            html: `<div style="transform:translate(-50%,-125%);white-space:nowrap;background:#0F766E;color:#FFFDF8;border:1.5px solid #FDE68A;border-radius:999px;padding:2px 9px;font-size:11px;font-weight:800;box-shadow:0 4px 12px rgba(0,0,0,0.38);display:inline-flex;align-items:center;gap:4px;">
              <span>${travelMode === 'walking' ? '🚶' : '🛵'}</span>
              <span>${isEn ? roadRoute.distanceTextEn : roadRoute.distanceTextVi} · ${roadRoute.durationMinutes} ${isEn ? 'min' : 'phút'}</span>
            </div>`,
            iconSize: [0, 0],
          }),
        });
        routeGroup.addLayer(midBadge);
      }
    }

    // 2. Origin Marker (Heritage or User GPS)
    const originMarker = L.marker([originLat, originLng], {
      icon: L.divIcon({
        className: 'hdv-inapp-origin-pin',
        html: `<div style="transform:translate(-50%,-50%);display:flex;flex-direction:column;align-items:center;">
          <div style="background:#B3261E;color:#FFFDF8;border:2px solid #FDE68A;border-radius:999px;padding:3px 10px;font-size:11px;font-weight:800;white-space:nowrap;box-shadow:0 4px 12px rgba(179,38,30,0.45);">
            ${useUserGps && userLocation ? '📍 GPS của bạn' : `🏛️ ${heritage?.name || 'Di sản'}`}
          </div>
          <div style="width:12px;height:12px;border-radius:999px;background:#B3261E;border:2.5px solid #FFFDF8;margin-top:2px;box-shadow:0 2px 6px rgba(0,0,0,0.4);"></div>
        </div>`,
        iconSize: [0, 0],
      }),
    });
    routeGroup.addLayer(originMarker);

    // 3. Nearby Restaurant Pins (1..N)
    places.forEach((place, idx) => {
      const isSelected = selectedPlace?.id === place.id;
      const bg = isSelected ? '#0D9488' : '#3B2A20';
      const border = isSelected ? '#FDE68A' : '#C8963E';
      const scale = isSelected ? 'scale(1.06)' : 'scale(0.95)';

      const placeMarker = L.marker([place.lat, place.lng], {
        zIndexOffset: isSelected ? 900 : 200,
        icon: L.divIcon({
          className: 'hdv-inapp-culinary-pin',
          html: `<div style="transform:translate(-50%,-100%) ${scale};display:flex;flex-direction:column;align-items:center;cursor:pointer;transition:transform 0.2s;">
            <div style="background:${bg};color:#FFFDF8;border:2px solid ${border};border-radius:12px;padding:3px 8px;font-size:11px;font-weight:800;white-space:nowrap;box-shadow:0 6px 16px rgba(0,0,0,0.38);display:flex;align-items:center;gap:4px;">
              <span style="background:#F59E0B;color:#FFFDF8;border-radius:999px;width:16px;height:16px;display:inline-flex;align-items:center;justify-content:center;font-size:10px;font-weight:900;">${idx + 1}</span>
              <span>🍴 ${place.name.length > 24 ? place.name.slice(0, 22) + '…' : place.name}</span>
              <span style="color:#FDE68A;font-size:10px;">★${place.rating}</span>
            </div>
            <div style="width:0;height:0;border-left:6px solid transparent;border-right:6px solid transparent;border-top:7px solid ${border};"></div>
          </div>`,
          iconSize: [0, 0],
        }),
      });

      placeMarker.on('click', (e) => {
        L.DomEvent.stopPropagation(e);
        onSelectPlace(place);
        computeAndNarrateRoute(place, travelMode, useUserGps, true);
      });

      routeGroup.addLayer(placeMarker);
    });

    // 4. Fit bounds around origin, route, and pins
    const pts: [number, number][] = [[originLat, originLng]];
    if (roadRoute && roadRoute.coordinates.length >= 2) {
      pts.push(...roadRoute.coordinates);
    } else if (selectedPlace) {
      pts.push([selectedPlace.lat, selectedPlace.lng]);
    }
    places.forEach((p) => pts.push([p.lat, p.lng]));

    if (pts.length >= 2) {
      map.flyToBounds(pts, {
        padding: [42, 42],
        maxZoom: 16,
        duration: 0.65,
      });
    }
  }, [
    originLat,
    originLng,
    heritage,
    places,
    selectedPlace,
    roadRoute,
    travelMode,
    useUserGps,
    userLocation,
    isEn,
    onSelectPlace,
    computeAndNarrateRoute,
  ]);

  const handleRequestGpsOrigin = async () => {
    setIsLocatingGps(true);
    const res = await geolocationService.requestLiveGpsForNavigation(true);
    setIsLocatingGps(false);
    if (res.success && res.location) {
      userLocationRef.current = res.location;
      setUserLocation(res.location);
      setUseUserGps(true);
      computeAndNarrateRoute(selectedPlace, travelMode, true, true, res.location);
    } else {
      setUseUserGps(true);
      computeAndNarrateRoute(selectedPlace, travelMode, true, true);
    }
  };

  return (
    <div
      id="in-app-culinary-route-map"
      className="bg-stone-900 border-2 border-amber-500/45 rounded-3xl overflow-hidden shadow-2xl mb-8"
    >
      {/* Top Control Header */}
      <div className="p-4 sm:p-5 bg-stone-950/90 border-b border-stone-800 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[11px] font-extrabold uppercase tracking-wider flex items-center gap-1">
              <Navigation className="w-3 h-3" />
              <span>
                {isEn
                  ? 'Live GPS In-Web Street Route Map'
                  : 'Bản Đồ Chỉ Đường GPS Trực Tiếp Trên Web'}
              </span>
            </span>
            {selectedPlace && (
              <span className="text-xs font-bold text-amber-300">
                {originLabel} → {selectedPlace.name}
              </span>
            )}
          </div>
          <p className="text-xs text-stone-400">
            {useUserGps && userLocation
              ? `🛰️ Đang định vị từ GPS của bạn: ${userLocation.cityName || `${userLocation.lat.toFixed(4)}°B, ${userLocation.lng.toFixed(4)}°Đ`}${
                  userLocation.accuracy ? ` (Độ chính xác ±${userLocation.accuracy}m)` : ''
                }`
              : isEn
              ? 'Click any numbered pin on the map or restaurant card below to draw the real street route and hear 3D Guide directions.'
              : 'Chạm vào ghim số thứ tự trên bản đồ hoặc bấm "Chỉ đường trên Map" ở từng quán để vẽ tuyến đường thực tế và nghe nhân vật 3D dẫn đường.'}
          </p>
        </div>

        {/* Origin & Mode Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex rounded-xl bg-stone-900 p-1 border border-stone-800">
            <button
              type="button"
              onClick={handleRequestGpsOrigin}
              disabled={isLocatingGps}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer ${
                useUserGps
                  ? 'bg-emerald-600 text-[#FFFDF8]'
                  : 'text-stone-300 hover:text-emerald-300'
              }`}
            >
              <LocateFixed className={`w-3 h-3 ${isLocatingGps ? 'animate-spin' : ''}`} />
              <span>{isEn ? 'From My GPS' : '🛰️ Từ GPS của tôi'}</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setUseUserGps(false);
                computeAndNarrateRoute(selectedPlace, travelMode, false, true);
              }}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                !useUserGps
                  ? 'bg-amber-500 text-[#FFFDF8]'
                  : 'text-stone-300 hover:text-amber-300'
              }`}
            >
              🏛️ {isEn ? 'From Heritage' : 'Từ Di sản'}
            </button>
          </div>

          <div className="inline-flex rounded-xl bg-stone-900 p-1 border border-stone-800">
            <button
              type="button"
              onClick={() => {
                setTravelMode('driving');
                computeAndNarrateRoute(selectedPlace, 'driving', useUserGps, true);
              }}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                travelMode === 'driving'
                  ? 'bg-emerald-600 text-[#FFFDF8]'
                  : 'text-stone-300 hover:text-emerald-300'
              }`}
            >
              🛵 {isEn ? 'Drive' : 'Đi xe'}
            </button>
            <button
              type="button"
              onClick={() => {
                setTravelMode('walking');
                computeAndNarrateRoute(selectedPlace, 'walking', useUserGps, true);
              }}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                travelMode === 'walking'
                  ? 'bg-emerald-600 text-[#FFFDF8]'
                  : 'text-stone-300 hover:text-emerald-300'
              }`}
            >
              🚶 {isEn ? 'Walk' : 'Đi bộ'}
            </button>
          </div>

          {selectedPlace && (
            <button
              type="button"
              onClick={() =>
                computeAndNarrateRoute(selectedPlace, travelMode, useUserGps, true)
              }
              className="px-3 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-[#FFFDF8] text-xs font-extrabold flex items-center gap-1.5 shadow cursor-pointer"
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span>{isEn ? '3D Voice Guide' : 'Rồng 3D Đọc Đường Đi'}</span>
            </button>
          )}

          {onOpenFullscreenMap && (
            <button
              type="button"
              onClick={onOpenFullscreenMap}
              className="px-3 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
              title={isEn ? 'Open in Full Cultural Map' : 'Mở trên Bản đồ Văn hóa lớn'}
            >
              <Maximize2 className="w-3.5 h-3.5 text-amber-400" />
              <span>{isEn ? 'Full Map' : 'Bản đồ lớn'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Split Grid: Interactive Leaflet Street Map (Left) + Turn-by-Turn Street Directions (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12">
        {/* Interactive Leaflet Map Canvas */}
        <div className="lg:col-span-8 relative h-[360px] sm:h-[430px] w-full bg-stone-950">
          <div ref={mapContainerRef} className="w-full h-full z-0" />

          {/* Quick Place Selector Strip overlaid at bottom of map */}
          {places.length > 0 && (
            <div className="absolute bottom-3 left-3 right-3 z-[400] flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1 px-1.5 rounded-2xl bg-stone-950/90 backdrop-blur-md border border-amber-500/40 shadow-lg">
              {places.map((p, idx) => {
                const active = selectedPlace?.id === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => {
                      onSelectPlace(p);
                      computeAndNarrateRoute(p, travelMode, useUserGps, true);
                    }}
                    className={`px-2.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap flex items-center gap-1.5 shrink-0 transition-all cursor-pointer ${
                      active
                        ? 'bg-emerald-600 text-[#FFFDF8] shadow'
                        : 'bg-stone-900 text-stone-200 hover:bg-stone-800 border border-stone-800'
                    }`}
                  >
                    <span className="w-4 h-4 rounded-full bg-amber-500 text-[#FFFDF8] text-[10px] font-black flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <span>{p.name}</span>
                    <span className="text-[10px] opacity-90 flex items-center gap-0.5">
                      <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                      {p.rating}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Turn-by-Turn Street Directions Panel */}
        <div className="lg:col-span-4 border-t lg:border-t-0 lg:border-l border-stone-800 bg-stone-950/75 p-4 flex flex-col justify-between max-h-[430px] overflow-y-auto">
          {selectedPlace ? (
            <div className="space-y-3">
              <div className="p-3 rounded-2xl bg-stone-900 border border-stone-800 space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-500/20 text-amber-300">
                    {selectedPlace.categoryLabel}
                  </span>
                  {roadRoute && (
                    <span className="text-xs font-extrabold text-emerald-400">
                      {isEn ? roadRoute.distanceTextEn : roadRoute.distanceTextVi} ·{' '}
                      {roadRoute.durationMinutes} {isEn ? 'min' : 'phút'}
                    </span>
                  )}
                </div>
                <h4 className="font-serif font-bold text-stone-100 text-sm">
                  {selectedPlace.name}
                </h4>
                <p className="text-[11px] text-stone-400 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-red-400 shrink-0" />
                  <span>{selectedPlace.address}</span>
                </p>
                {roadRoute && roadRoute.mainStreets.length > 0 && (
                  <p className="text-[11px] text-emerald-300 font-semibold pt-1 border-t border-stone-800">
                    🛣️ {isEn ? 'Main streets:' : 'Tuyến đường chính:'}{' '}
                    {roadRoute.mainStreets.join(' → ')}
                  </p>
                )}
              </div>

              {isCalculating ? (
                <div className="py-8 text-center text-xs text-stone-400 flex items-center justify-center gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin text-emerald-400" />
                  <span>
                    {isEn
                      ? 'Calculating street route...'
                      : 'Đang tính toán lộ trình các tuyến đường...'}
                  </span>
                </div>
              ) : roadRoute ? (
                <div className="space-y-1.5">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-stone-400">
                    {isEn
                      ? 'Turn-by-Turn Street Directions'
                      : 'Lộ trình di chuyển theo các tuyến đường'}
                  </div>
                  {roadRoute.steps.map((step, sIdx) => (
                    <div
                      key={sIdx}
                      onClick={() => {
                        setActiveStepIndex(sIdx);
                        if (mapInstanceRef.current && step.location) {
                          mapInstanceRef.current.flyTo(step.location, 17, {
                            duration: 0.45,
                          });
                        }
                      }}
                      className={`p-2.5 rounded-xl border text-xs flex items-start justify-between gap-2 cursor-pointer transition-colors ${
                        activeStepIndex === sIdx
                          ? 'bg-emerald-950/60 border-emerald-400 text-stone-100 font-semibold'
                          : 'bg-stone-900/90 hover:bg-stone-900 border-stone-800 text-stone-300'
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        <span className="w-5 h-5 rounded-full bg-emerald-600 text-[#FFFDF8] text-[10px] font-extrabold flex items-center justify-center shrink-0 mt-0.5">
                          {sIdx + 1}
                        </span>
                        <span className="leading-snug">
                          {isEn ? step.instructionEn : step.instructionVi}
                        </span>
                      </div>
                      {step.distanceMeters > 0 && (
                        <span className="text-[10px] font-mono text-emerald-400 shrink-0">
                          {step.distanceText}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          ) : (
            <div className="py-12 text-center text-stone-400 text-xs space-y-2">
              <Compass className="w-8 h-8 mx-auto text-stone-600" />
              <p>
                {isEn
                  ? 'Select a restaurant to view the street route.'
                  : 'Hãy chọn một quán ăn để xem lộ trình chỉ đường trên bản đồ.'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
