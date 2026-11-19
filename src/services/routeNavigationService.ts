import { PlaceItem } from '../types';

export type TravelModeType = 'driving' | 'walking';

export interface RouteStepInstruction {
  index: number;
  instructionVi: string;
  instructionEn: string;
  streetName: string;
  distanceMeters: number;
  distanceText: string;
  durationSeconds: number;
  maneuverType: string;
  maneuverModifier?: string;
  location: [number, number]; // [lat, lng]
}

export interface RoadRouteResult {
  coordinates: [number, number][]; // Array of [lat, lng] following actual roads
  distanceKm: number;
  distanceTextVi: string;
  distanceTextEn: string;
  durationMinutes: number;
  durationTextVi: string;
  durationTextEn: string;
  mainStreets: string[];
  steps: RouteStepInstruction[];
  travelMode: TravelModeType;
  isRealRoadGeometry: boolean;
}

export interface MapRouteRequestPayload {
  heritageId: string;
  placeId?: string;
  placeName?: string;
  travelMode?: TravelModeType;
  useUserGps?: boolean;
}

export const MAP_OPEN_ROUTE_EVENT = 'hdv:open-map-route';

export function triggerInAppMapRoute(payload: MapRouteRequestPayload): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(
    new CustomEvent<MapRouteRequestPayload>(MAP_OPEN_ROUTE_EVENT, {
      detail: payload,
    })
  );
}

const routeMemoryCache = new Map<string, RoadRouteResult>();

function formatMeters(meters: number): string {
  if (meters < 1000) {
    return `${Math.max(10, Math.round(meters / 10) * 10)} m`;
  }
  return `${(meters / 1000).toFixed(2)} km`;
}

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function translateManeuverVi(type: string, modifier?: string, streetName?: string): string {
  const road = streetName && streetName.trim() ? ` vào ${streetName.trim()}` : ' theo tuyến đường chính';
  const onRoad = streetName && streetName.trim() ? ` trên ${streetName.trim()}` : ' trên đường hiện tại';

  if (type === 'depart') {
    return `Xuất phát và di chuyển${onRoad}`;
  }
  if (type === 'arrive') {
    return 'Đến điểm đích ở phía trước';
  }
  if (type === 'roundabout' || type === 'rotary') {
    return `Đi vào vòng xuyến rồi rẽ ra${road}`;
  }

  switch (modifier) {
    case 'left':
    case 'sharp left':
      return `Rẽ trái${road}`;
    case 'slight left':
      return `Chếch nhẹ sang trái${road}`;
    case 'right':
    case 'sharp right':
      return `Rẽ phải${road}`;
    case 'slight right':
      return `Chếch nhẹ sang phải${road}`;
    case 'uturn':
      return `Quay đầu xe${onRoad}`;
    case 'straight':
    default:
      return `Đi thẳng tiếp tục${onRoad}`;
  }
}

function translateManeuverEn(type: string, modifier?: string, streetName?: string): string {
  const road = streetName && streetName.trim() ? ` onto ${streetName.trim()}` : ' onto the main road';
  const onRoad = streetName && streetName.trim() ? ` along ${streetName.trim()}` : ' along the current street';

  if (type === 'depart') {
    return `Depart and head${onRoad}`;
  }
  if (type === 'arrive') {
    return 'Arrive at your destination';
  }
  if (type === 'roundabout' || type === 'rotary') {
    return `Enter the roundabout and exit${road}`;
  }

  switch (modifier) {
    case 'left':
    case 'sharp left':
      return `Turn left${road}`;
    case 'slight left':
      return `Keep slight left${road}`;
    case 'right':
    case 'sharp right':
      return `Turn right${road}`;
    case 'slight right':
      return `Keep slight right${road}`;
    case 'uturn':
      return `Make a U-turn${onRoad}`;
    case 'straight':
    default:
      return `Continue straight${onRoad}`;
  }
}

function buildFallbackStreetRoute(
  startLat: number,
  startLng: number,
  endLat: number,
  endLng: number,
  travelMode: TravelModeType,
  addressHint?: string
): RoadRouteResult {
  const straightKm = Math.max(0.15, haversineKm(startLat, startLng, endLat, endLng));
  const roadFactor = 1.28;
  const distanceKm = Number((straightKm * roadFactor).toFixed(2));
  const speedKmh = travelMode === 'walking' ? 4.8 : 26;
  const durationMinutes = Math.max(2, Math.round((distanceKm / speedKmh) * 60));

  // Generate realistic intermediate street-grid waypoints so the polyline follows urban road angles
  const dLat = endLat - startLat;
  const dLng = endLng - startLng;
  const p1: [number, number] = [startLat, startLng];
  const p2: [number, number] = [startLat + dLat * 0.25, startLng + dLng * 0.08];
  const p3: [number, number] = [startLat + dLat * 0.48, startLng + dLng * 0.52];
  const p4: [number, number] = [startLat + dLat * 0.82, startLng + dLng * 0.78];
  const p5: [number, number] = [endLat, endLng];

  const streetFromAddress =
    addressHint
      ?.split(',')[0]
      ?.replace(/^\d+[A-Za-z/-]*\s*/, '')
      .trim() || 'Tuyến đường chính quanh di sản';

  const totalMeters = Math.round(distanceKm * 1000);
  const s1Meters = Math.round(totalMeters * 0.3);
  const s2Meters = Math.round(totalMeters * 0.45);
  const s3Meters = Math.max(30, totalMeters - s1Meters - s2Meters);

  const steps: RouteStepInstruction[] = [
    {
      index: 1,
      instructionVi: 'Xuất phát từ cổng di sản ra trục đường chính',
      instructionEn: 'Depart from the heritage entrance onto the main road',
      streetName: 'Đường kết nối Di sản',
      distanceMeters: s1Meters,
      distanceText: formatMeters(s1Meters),
      durationSeconds: Math.round(durationMinutes * 60 * 0.3),
      maneuverType: 'depart',
      maneuverModifier: 'straight',
      location: p1,
    },
    {
      index: 2,
      instructionVi: `Rẽ theo hướng tuyến đường ${streetFromAddress}`,
      instructionEn: `Turn onto ${streetFromAddress}`,
      streetName: streetFromAddress,
      distanceMeters: s2Meters,
      distanceText: formatMeters(s2Meters),
      durationSeconds: Math.round(durationMinutes * 60 * 0.5),
      maneuverType: 'turn',
      maneuverModifier: dLng >= 0 ? 'right' : 'left',
      location: p3,
    },
    {
      index: 3,
      instructionVi: `Đi thẳng trên ${streetFromAddress} là tới quán ở phía trước`,
      instructionEn: `Continue along ${streetFromAddress} to arrive at the restaurant`,
      streetName: streetFromAddress,
      distanceMeters: s3Meters,
      distanceText: formatMeters(s3Meters),
      durationSeconds: Math.round(durationMinutes * 60 * 0.2),
      maneuverType: 'arrive',
      maneuverModifier: 'straight',
      location: p5,
    },
  ];

  return {
    coordinates: [p1, p2, p3, p4, p5],
    distanceKm,
    distanceTextVi: formatMeters(totalMeters),
    distanceTextEn: formatMeters(totalMeters),
    durationMinutes,
    durationTextVi: `${durationMinutes} phút (${travelMode === 'walking' ? 'đi bộ' : 'xe máy/ô tô'})`,
    durationTextEn: `${durationMinutes} min (${travelMode === 'walking' ? 'walking' : 'driving'})`,
    mainStreets: [streetFromAddress],
    steps,
    travelMode,
    isRealRoadGeometry: false,
  };
}

/**
 * Tìm tuyến đường giao thông thực tế (theo các con đường trên bản đồ) giữa 2 tọa độ
 * sử dụng OSRM Routing API kèm bộ nhớ đệm và dự phòng ngoại tuyến.
 */
export async function fetchRoadRoute(
  startLat: number,
  startLng: number,
  endLat: number,
  endLng: number,
  travelMode: TravelModeType = 'driving',
  addressHint?: string
): Promise<RoadRouteResult> {
  const cacheKey = `${startLat.toFixed(4)},${startLng.toFixed(4)}->${endLat.toFixed(4)},${endLng.toFixed(4)}:${travelMode}`;
  const cached = routeMemoryCache.get(cacheKey);
  if (cached) return cached;

  const osrmProfile = travelMode === 'walking' ? 'foot' : 'driving';
  const url = `https://router.project-osrm.org/route/v1/${osrmProfile}/${startLng},${startLat};${endLng},${endLat}?overview=full&geometries=geojson&steps=true`;

  try {
    const controller = new AbortController();
    const timer = window.setTimeout(() => controller.abort(), 3800);
    const res = await fetch(url, { signal: controller.signal });
    window.clearTimeout(timer);

    if (res.ok) {
      const data = await res.json();
      const route = data?.routes?.[0];
      const rawCoords: [number, number][] | undefined = route?.geometry?.coordinates;

      if (route && Array.isArray(rawCoords) && rawCoords.length >= 2) {
        // OSRM returns [lng, lat], convert to Leaflet [lat, lng]
        const coordinates: [number, number][] = rawCoords.map((pt) => [pt[1], pt[0]]);
        const totalMeters = Number(route.distance) || 500;
        const distanceKm = Number((totalMeters / 1000).toFixed(2));

        // Adjust duration realistically for Vietnam urban motorbike/car or walking speed
        const speedKmh = travelMode === 'walking' ? 4.8 : 25;
        const durationMinutes = Math.max(
          1,
          Math.round(
            travelMode === 'walking'
              ? (distanceKm / speedKmh) * 60
              : Math.max((Number(route.duration) || 120) / 60, (distanceKm / speedKmh) * 60)
          )
        );

        const rawSteps: any[] = route.legs?.[0]?.steps || [];
        const streetSet = new Set<string>();
        const steps: RouteStepInstruction[] = [];

        rawSteps.forEach((st, idx) => {
          const streetName = String(st.name || st.ref || '').trim();
          if (streetName && streetName.length > 1) {
            streetSet.add(streetName);
          }
          const maneuver = st.maneuver || {};
          const mType = String(maneuver.type || 'continue');
          const mMod = maneuver.modifier ? String(maneuver.modifier) : undefined;
          const distM = Math.round(Number(st.distance) || 0);
          if (distM < 8 && mType !== 'depart' && mType !== 'arrive') {
            return;
          }
          const loc: [number, number] = Array.isArray(maneuver.location)
            ? [maneuver.location[1], maneuver.location[0]]
            : coordinates[Math.min(idx, coordinates.length - 1)];

          steps.push({
            index: steps.length + 1,
            instructionVi: translateManeuverVi(mType, mMod, streetName),
            instructionEn: translateManeuverEn(mType, mMod, streetName),
            streetName: streetName || 'Đường nội khu',
            distanceMeters: distM,
            distanceText: formatMeters(distM),
            durationSeconds: Math.round(Number(st.duration) || 15),
            maneuverType: mType,
            maneuverModifier: mMod,
            location: loc,
          });
        });

        const mainStreets = Array.from(streetSet).slice(0, 4);
        if (mainStreets.length === 0 && addressHint) {
          mainStreets.push(addressHint.split(',')[0].trim());
        }

        const result: RoadRouteResult = {
          coordinates,
          distanceKm,
          distanceTextVi: formatMeters(totalMeters),
          distanceTextEn: formatMeters(totalMeters),
          durationMinutes,
          durationTextVi: `${durationMinutes} phút (${travelMode === 'walking' ? 'đi bộ' : 'xe máy/ô tô'})`,
          durationTextEn: `${durationMinutes} min (${travelMode === 'walking' ? 'walking' : 'driving'})`,
          mainStreets,
          steps:
            steps.length > 0
              ? steps
              : buildFallbackStreetRoute(startLat, startLng, endLat, endLng, travelMode, addressHint).steps,
          travelMode,
          isRealRoadGeometry: true,
        };

        routeMemoryCache.set(cacheKey, result);
        return result;
      }
    }
  } catch {
    // Fallback below if offline or timeout
  }

  const fallback = buildFallbackStreetRoute(startLat, startLng, endLat, endLng, travelMode, addressHint);
  routeMemoryCache.set(cacheKey, fallback);
  return fallback;
}

/**
 * Tạo câu thuyết minh chỉ đường chi tiết theo các tuyến đường cho nhân vật 3D (<GuideCharacter />)
 */
export function buildRouteVoiceNarration(
  originName: string,
  place: PlaceItem,
  route: RoadRouteResult,
  language: string = 'vi'
): string {
  const isEn = language === 'en';
  const streetsText =
    route.mainStreets.length > 0
      ? route.mainStreets.join(', ')
      : place.address?.split(',')[0] || (isEn ? 'the main street' : 'tuyến đường chính');
  const dishTextVi =
    place.specialties && place.specialties.length > 0
      ? ` Quán nổi tiếng với món ${place.specialties.slice(0, 2).join(' và ')}.`
      : '';
  const dishTextEn =
    place.specialties && place.specialties.length > 0
      ? ` This spot is famous for ${place.specialties.slice(0, 2).join(' and ')}.`
      : '';

  if (isEn) {
    return `I have plotted the road route from ${originName} to ${place.name} right on the map! The route is ${route.distanceTextEn} and takes about ${route.durationMinutes} minutes via ${streetsText}.${dishTextEn} Follow the highlighted route line and turn-by-turn street instructions on the map!`;
  }

  return `Mình đã bật chỉ đường trực tiếp trên bản đồ từ ${originName} đến ${place.name}! Quãng đường dài ${route.distanceTextVi}, di chuyển khoảng ${route.durationMinutes} phút đi qua tuyến đường ${streetsText}.${dishTextVi} Bạn hãy nhìn theo đường kẻ dẫn hướng màu xanh ngọc trên bản đồ và các bước rẽ chi tiết bên dưới nhé!`;
}
