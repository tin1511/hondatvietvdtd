export interface DaNangBackgroundAsset {
  id: string;
  landmarkLabel: string;
  desktopWebp: string;
  mobileWebp: string;
  fileNameHint: string;
  altText: string;
  fallbackColor: string;
}

/**
 * 9. HỆ THỐNG ẢNH NỀN ĐÀ NẴNG TĨNH (ĐỊNH DẠNG WEBP < 300KB, CÓ BẢN MOBILE RIÊNG)
 * - Đặt tại thư mục dự án: /public/images/danang/
 * - Không tự ý lấy ảnh có bản quyền từ internet; nếu người dùng muốn thay ảnh chụp thực tế,
 *   chỉ cần chép đè đúng tên file trong /public/images/danang/
 * - Xen kẽ giữa Ngũ Hành Sơn -> Ma Nhai -> Biển Mỹ Khê -> Sơn Trà -> Non Nước -> Ma Nhai -> Mỹ Khê & Cầu Rồng
 */
export const DANANG_HERO_BACKGROUND: DaNangBackgroundAsset = {
  id: 'bg-hero-danang',
  landmarkLabel: 'Toàn cảnh Danh thắng Ngũ Hành Sơn – Ma Nhai – Biển Mỹ Khê Đà Nẵng',
  desktopWebp: '/images/danang/hero-ngu-hanh-son-toan-canh.webp',
  mobileWebp: '/images/danang/hero-ngu-hanh-son-toan-canh-mobile.webp',
  fileNameHint: 'public/images/danang/hero-ngu-hanh-son-toan-canh.webp',
  altText: 'Toàn cảnh danh thắng Quốc gia đặc biệt Ngũ Hành Sơn và vùng biển Non Nước Đà Nẵng',
  fallbackColor: '#061224',
};

export const DANANG_FEATURE_BACKGROUNDS: Record<number, DaNangBackgroundAsset> = {
  1: {
    id: 'bg-01-ngu-hanh-son',
    landmarkLabel: 'Danh thắng Ngũ Hành Sơn (Ngọn Thủy Sơn & Vọng Hải Đài)',
    desktopWebp: '/images/danang/01-ngu-hanh-son-thuy-son.webp',
    mobileWebp: '/images/danang/01-ngu-hanh-son-thuy-son-mobile.webp',
    fileNameHint: 'public/images/danang/01-ngu-hanh-son-thuy-son.webp',
    altText: 'Ngọn Thủy Sơn, Vọng Hải Đài và quần thể danh thắng Ngũ Hành Sơn Đà Nẵng',
    fallbackColor: '#071629',
  },
  2: {
    id: 'bg-02-ma-nhai',
    landmarkLabel: 'Văn khắc Ma Nhai Ngũ Hành Sơn (Động Huyền Không)',
    desktopWebp: '/images/danang/02-ma-nhai-dong-huyen-khong.webp',
    mobileWebp: '/images/danang/02-ma-nhai-dong-huyen-khong-mobile.webp',
    fileNameHint: 'public/images/danang/02-ma-nhai-dong-huyen-khong.webp',
    altText: 'Vách đá khắc chữ Hán Nôm Ma Nhai tại động Huyền Không, Ngũ Hành Sơn Đà Nẵng',
    fallbackColor: '#0c131f',
  },
  3: {
    id: 'bg-03-bien-my-khe',
    landmarkLabel: 'Biển Mỹ Khê Đà Nẵng lúc bình minh',
    desktopWebp: '/images/danang/03-bien-my-khe-binh-minh.webp',
    mobileWebp: '/images/danang/03-bien-my-khe-binh-minh-mobile.webp',
    fileNameHint: 'public/images/danang/03-bien-my-khe-binh-minh.webp',
    altText: 'Bãi biển Mỹ Khê Đà Nẵng lúc bình minh nhìn về bán đảo Sơn Trà',
    fallbackColor: '#081c30',
  },
  4: {
    id: 'bg-04-son-tra-my-khe',
    landmarkLabel: 'Bán đảo Sơn Trà – Cung đường biển Mỹ Khê – Ngũ Hành Sơn',
    desktopWebp: '/images/danang/04-ban-dao-son-tra-my-khe.webp',
    mobileWebp: '/images/danang/04-ban-dao-son-tra-my-khe-mobile.webp',
    fileNameHint: 'public/images/danang/04-ban-dao-son-tra-my-khe.webp',
    altText: 'Cung đường biển từ bán đảo Sơn Trà qua biển Mỹ Khê tới danh thắng Ngũ Hành Sơn Đà Nẵng',
    fallbackColor: '#061b26',
  },
  5: {
    id: 'bg-05-non-nuoc-ngu-hanh-son',
    landmarkLabel: 'Làng đá mỹ nghệ Non Nước & Chùa Tam Thai – Ngũ Hành Sơn',
    desktopWebp: '/images/danang/05-lang-da-non-nuoc-ngu-hanh-son.webp',
    mobileWebp: '/images/danang/05-lang-da-non-nuoc-ngu-hanh-son-mobile.webp',
    fileNameHint: 'public/images/danang/05-lang-da-non-nuoc-ngu-hanh-son.webp',
    altText: 'Làng nghề điêu khắc đá mỹ nghệ Non Nước dưới chân danh thắng Ngũ Hành Sơn Đà Nẵng',
    fallbackColor: '#111624',
  },
  6: {
    id: 'bg-06-ma-nhai-minh-mang',
    landmarkLabel: 'Bia Ma Nhai Ngự bút vua Minh Mạng (UNESCO Ký ức Thế giới)',
    desktopWebp: '/images/danang/06-ma-nhai-ngu-but-minh-mang.webp',
    mobileWebp: '/images/danang/06-ma-nhai-ngu-but-minh-mang-mobile.webp',
    fileNameHint: 'public/images/danang/06-ma-nhai-ngu-but-minh-mang.webp',
    altText: 'Bia Ma Nhai ngự bút vua Minh Mạng trên vách đá Ngũ Hành Sơn Đà Nẵng - Di sản tư liệu UNESCO',
    fallbackColor: '#14111c',
  },
  7: {
    id: 'bg-07-cau-rong-my-khe',
    landmarkLabel: 'Hoàng hôn Biển Mỹ Khê & Cầu Rồng sông Hàn Đà Nẵng',
    desktopWebp: '/images/danang/07-cau-rong-hoang-hon-my-khe.webp',
    mobileWebp: '/images/danang/07-cau-rong-hoang-hon-my-khe-mobile.webp',
    fileNameHint: 'public/images/danang/07-cau-rong-hoang-hon-my-khe.webp',
    altText: 'Hoàng hôn trên biển Mỹ Khê và Cầu Rồng bên bờ sông Hàn thành phố Đà Nẵng',
    fallbackColor: '#130d21',
  },
};
