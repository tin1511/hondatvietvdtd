/**
 * Utility functions and fallback image resolvers for Vietnam Heritage App
 */
import choBenThanh from '../assets/images/cho_ben_thanh_ai_1790222984463.jpg';
import thacBanGioc from '../assets/images/thac_ban_gioc_ai_1790223003025.jpg';
import nuiBaDen from '../assets/images/nui_ba_den_ai_1790223018722.jpg';
import chuaHuong from '../assets/images/chua_huong_ai_1790223034956.jpg';
import diaDaoCuChi from '../assets/images/dia_dao_cu_chi_ai_1790223048774.jpg';
import muiNePoshanu from '../assets/images/mui_ne_poshanu_ai_1790253193961.jpg';
import phuQuocDinhCau from '../assets/images/phu_quoc_dinh_cau_ai_1790223080472.jpg';
import daiNoiHueAi from '../assets/images/dai_noi_hue_ai_1790253207610.jpg';
import vinhHaLongAi from '../assets/images/vinh_ha_long_ai_1790253180514.jpg';
import trangAnNinhBinhAi from '../assets/images/trang_an_ninh_binh_ai_1790253218816.jpg';
import hoiAnPhoCoAi from '../assets/images/hoi_an_pho_co_ai_1790253393382.jpg';

// Traditional Crafts & Arts AI Images
import gomBatTrang from '../assets/images/gom_bat_trang_ai_1790223652469.jpg';
import tranhDongHo from '../assets/images/tranh_dong_ho_ai_1790223668903.jpg';
import nonLaTayHo from '../assets/images/non_la_tay_ho_ai_1790223686482.jpg';
import luaVanPhuc from '../assets/images/lua_van_phuc_ai_1790223704738.jpg';
import nhaNhacCungDinh from '../assets/images/nha_nhac_cung_dinh_ai_1790223720926.jpg';
import quanHoBacNinh from '../assets/images/quan_ho_bac_ninh_ai_1790223735263.jpg';
import donCaTaiTu from '../assets/images/don_ca_tai_tu_ai_1790223749341.jpg';

export const DEFAULT_HERITAGE_FALLBACK = '/images/heritages/dai-noi-hue.jpg';

export const HERITAGE_PHOTO_MAP: Record<string, string> = {
  'ngu-hanh-son-da-nang': '/images/heritages/ngu-hanh-son-da-nang.jpg',
  'ma-nhai-ngu-hanh-son': '/images/heritages/ma-nhai-ngu-hanh-son.jpg',
  'bien-my-khe-da-nang': '/images/heritages/bien-my-khe-da-nang.jpg',
  'dai-noi-hue': '/images/heritages/dai-noi-hue.jpg',
  'van-mieu-quoc-tu-giam': '/images/heritages/van-mieu-quoc-tu-giam.jpg',
  'pho-co-hoi-an': '/images/heritages/pho-co-hoi-an.jpg',
  'trang-an-ninh-binh': '/images/heritages/trang-an-ninh-binh.jpg',
  'chua-thien-mu': '/images/heritages/chua-thien-mu.jpg',
  'dinh-doc-lap': '/images/heritages/dinh-doc-lap.jpg',
  'thanh-dia-my-son': '/images/heritages/thanh-dia-my-son.jpg',
  'vinh-ha-long': '/images/heritages/vinh-ha-long.jpg',
  'phong-nha-ke-bang': '/images/heritages/phong-nha-ke-bang.jpg',
  'chua-bai-dinh': '/images/heritages/chua-bai-dinh.jpg',
  'thap-ba-ponagar': '/images/heritages/thap-ba-ponagar.jpg',
  'fansipan-sapa': '/images/heritages/fansipan-sapa.jpg',
  'cau-vang-bana-hills': '/images/heritages/cau-vang-bana-hills.jpg',
  'cho-ben-thanh': '/images/heritages/cho-ben-thanh.jpg',
  'thac-ban-gioc': '/images/heritages/thac-ban-gioc.jpg',
  'nui-ba-den': '/images/heritages/nui-ba-den.png',
  'chua-huong': '/images/heritages/chua-huong.jpg',
  'dia-dao-cu-chi': '/images/heritages/dia-dao-cu-chi.jpg',
  'mui-ne-poshanu': '/images/heritages/mui-ne-poshanu.jpg',
  'phu-quoc-dinh-cau': '/images/heritages/phu-quoc-dinh-cau.jpg'
};

export const CRAFTS_ARTS_PHOTO_MAP: Record<string, string> = {
  'gom-bat-trang': gomBatTrang,
  'gom-bat-trang-ai-image': gomBatTrang,
  'tranh-dong-ho': tranhDongHo,
  'tranh-dong-ho-ai-image': tranhDongHo,
  'non-la-tay-ho': nonLaTayHo,
  'non-la-tay-ho-ai-image': nonLaTayHo,
  'lua-van-phuc': luaVanPhuc,
  'lua-van-phuc-ai-image': luaVanPhuc,
  'nha-nhac-cung-dinh': nhaNhacCungDinh,
  'nha-nhac-cung-dinh-ai-image': nhaNhacCungDinh,
  'quan-ho-bac-ninh': quanHoBacNinh,
  'quan-ho-bac-ninh-ai-image': quanHoBacNinh,
  'don-ca-tai-tu': donCaTaiTu,
  'don-ca-tai-tu-ai-image': donCaTaiTu
};

/**
 * Ensures a reliable, verified image URL for a heritage site.
 * Always prioritizes updated/local `/images/...` or explicit custom URLs first,
 * falling back to HERITAGE_PHOTO_MAP only if url is empty or legacy broken/duplicated.
 */
export function getSafeHeritageImageUrl(url?: string, heritageId?: string): string {
  const trimmed = (url || '').trim();

  // Always respect verified local assets (/images/..., data:image/..., or bundled Vite assets)
  if (trimmed.startsWith('/images/') || trimmed.startsWith('data:image/') || trimmed.startsWith('/assets/')) {
    return trimmed;
  }

  // If url is missing or uses the old generic duplicated Unsplash Ha Long photo, use curated map if available
  const isGenericDuplicate =
    !trimmed ||
    trimmed.includes('photo-1528127269322-539801943592') ||
    trimmed.includes('photo-1509042239860-f550ce710b93') ||
    trimmed.includes('undefined');

  if (!isGenericDuplicate) {
    return trimmed;
  }

  if (heritageId && HERITAGE_PHOTO_MAP[heritageId]) {
    return HERITAGE_PHOTO_MAP[heritageId];
  }

  return trimmed || DEFAULT_HERITAGE_FALLBACK;
}

/**
 * Ensures a reliable image URL for traditional crafts and arts, mapping placeholder strings
 * to high-fidelity AI-generated local images.
 */
export function getSafeCraftOrArtImageUrl(url?: string, itemId?: string): string {
  if (itemId && CRAFTS_ARTS_PHOTO_MAP[itemId]) {
    return CRAFTS_ARTS_PHOTO_MAP[itemId];
  }
  if (url && CRAFTS_ARTS_PHOTO_MAP[url]) {
    return CRAFTS_ARTS_PHOTO_MAP[url];
  }
  return url || DEFAULT_HERITAGE_FALLBACK;
}

/**
 * Standard error handler for HTML img tags
 */
export function handleImageError(
  event: React.SyntheticEvent<HTMLImageElement, Event>,
  fallbackUrl: string = DEFAULT_HERITAGE_FALLBACK
): void {
  const target = event.currentTarget;
  if (target.src !== fallbackUrl) {
    target.src = fallbackUrl;
  }
}
