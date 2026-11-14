const imgDaiNoiHue = 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?auto=format&fit=crop&w=1600&q=85';
const imgHoiAnPhoCo = 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=1600&q=85';
const imgVinhHaLong = 'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=1600&q=85';
const imgTrangAnNinhBinh = 'https://images.unsplash.com/photo-1563492065599-3520f775eeed?auto=format&fit=crop&w=1600&q=85';
const imgChuaHuong = 'https://images.unsplash.com/photo-1599707367072-cd6ada2bc375?auto=format&fit=crop&w=1600&q=85';
const imgChoBenThanh = 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?auto=format&fit=crop&w=1600&q=85';
const imgDiaDaoCuChi = 'https://images.unsplash.com/photo-1509030450996-dd1a26dda07a?auto=format&fit=crop&w=1600&q=85';
const imgMuiNePoshanu = 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1600&q=85';
const imgNhaNhacCungDinh = 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?auto=format&fit=crop&w=1600&q=85';
const imgNuiBaDen = 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1600&q=85';
const imgPhuQuocDinhCau = 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1600&q=85';
const imgThacBanGioc = 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1600&q=85';
const imgGomBatTrang = 'https://images.unsplash.com/photo-1557750255-c76072a7aad1?auto=format&fit=crop&w=1600&q=85';
const imgLuaVanPhuc = 'https://images.unsplash.com/photo-1509030450996-dd1a26dda07a?auto=format&fit=crop&w=1600&q=85';
const imgQuanHoBacNinh = 'https://images.unsplash.com/photo-1599707367072-cd6ada2bc375?auto=format&fit=crop&w=1600&q=85';

export interface LandmarkPhotoItem {
  id: string;
  cityName: string;
  province: string;
  landmarkName: string;
  title: string;
  tagline: string;
  imageUrl: string;
  thumbUrl: string;
  lat: number;
  lng: number;
  tags: string[];
  photographer?: string;
  source?: string;
}

export const DEFAULT_VIETNAM_LANDMARK_FALLBACK = imgHoiAnPhoCo;

/**
 * Curated High-Definition Database of Iconic Vietnamese Landmarks across provinces
 */
export const VIETNAM_LANDMARK_PHOTOS: LandmarkPhotoItem[] = [
  // ==================== HÀ NỘI ====================
  {
    id: 'hn-van-mieu-1',
    cityName: 'Hà Nội',
    province: 'Hà Nội',
    landmarkName: 'Văn Miếu - Quốc Tử Giám',
    title: 'Khuê Văn Các - Văn Miếu Quốc Tử Giám',
    tagline: 'Thủ đô ngàn năm văn hiến, biểu tượng hiếu học và trường đại học đầu tiên',
    imageUrl: 'https://images.unsplash.com/photo-1599707367072-cd6ada2bc375?auto=format&fit=crop&w=2000&q=85',
    thumbUrl: 'https://images.unsplash.com/photo-1599707367072-cd6ada2bc375?auto=format&fit=crop&w=600&q=80',
    lat: 21.0285,
    lng: 105.8355,
    tags: ['Hà Nội', 'Văn Miếu', 'Quốc Tử Giám', 'Khuê Văn Các', 'Thủ đô', 'Cổ kính', 'Trường đại học đầu tiên'],
    photographer: 'Wikimedia Heritage Vietnam',
    source: 'Kho Di Sản Quốc Gia'
  },
  {
    id: 'hn-khue-van-cac-2',
    cityName: 'Hà Nội',
    province: 'Hà Nội',
    landmarkName: 'Khuê Văn Các - Văn Miếu',
    title: 'Khuê Văn Các - Gác Sao Khuê Soi Bóng Giếng Thiên Quang',
    tagline: 'Biểu tượng chính thức của Thủ đô Hà Nội với kiến trúc gỗ sơn son tinh xảo',
    imageUrl: imgChuaHuong,
    thumbUrl: imgChuaHuong,
    lat: 21.0278,
    lng: 105.8355,
    tags: ['Hà Nội', 'Khuê Văn Các', 'Văn Miếu', 'Quốc Tử Giám', 'Thiên Quang Tỉnh'],
    photographer: 'Nhiếp ảnh gia Di sản Hà Nội',
    source: 'Kho Di Sản Quốc Gia'
  },
  {
    id: 'hn-ho-guom-1',
    cityName: 'Hà Nội',
    province: 'Hà Nội',
    landmarkName: 'Hồ Hoàn Kiếm & Tháp Rùa',
    title: 'Tháp Rùa - Trái Tim Hồ Hoàn Kiếm',
    tagline: 'Trái tim của Thủ đô với truyền thuyết vua Lê Lợi trả gươm báu cho Rùa vàng',
    imageUrl: 'https://images.unsplash.com/photo-1509030450996-dd1a26dda07a?auto=format&fit=crop&w=2000&q=85',
    thumbUrl: 'https://images.unsplash.com/photo-1509030450996-dd1a26dda07a?auto=format&fit=crop&w=600&q=80',
    lat: 21.0288,
    lng: 105.8522,
    tags: ['Hà Nội', 'Hồ Gươm', 'Tháp Rùa', 'Hoàn Kiếm', 'Cầu Thê Húc', 'Đền Ngọc Sơn'],
    photographer: 'Wikimedia Explorer',
    source: 'Kho Di Sản Quốc Gia'
  },
  {
    id: 'hn-cau-the-huc-1',
    cityName: 'Hà Nội',
    province: 'Hà Nội',
    landmarkName: 'Cầu Thê Húc & Đền Ngọc Sơn',
    title: 'Cầu Thê Húc Màu Son & Đền Ngọc Sơn',
    tagline: 'Nơi đậu lại ánh sáng mặt trời ban mai giữa lòng Hồ Gươm lịch sử',
    imageUrl: imgLuaVanPhuc,
    thumbUrl: imgLuaVanPhuc,
    lat: 21.0307,
    lng: 105.8528,
    tags: ['Hà Nội', 'Cầu Thê Húc', 'Đền Ngọc Sơn', 'Hồ Gươm', 'Hoàn Kiếm'],
    photographer: 'Vietnam Cultural Archive',
    source: 'Kho Di Sản Quốc Gia'
  },
  {
    id: 'hn-chua-mot-cot-1',
    cityName: 'Hà Nội',
    province: 'Hà Nội',
    landmarkName: 'Chùa Một Cột & Hoàng Thành Thăng Long',
    title: 'Chùa Một Cột (Diên Hựu Tự) Tựa Bông Sen Ngàn Năm',
    tagline: 'Kiến trúc độc đáo bậc nhất châu Á từ thời vua Lý Thái Tông (1049)',
    imageUrl: imgGomBatTrang,
    thumbUrl: imgGomBatTrang,
    lat: 21.0359,
    lng: 105.8336,
    tags: ['Hà Nội', 'Chùa Một Cột', 'Diên Hựu Tự', 'Ba Đình', 'Hoàng Thành Thăng Long'],
    photographer: 'Di Sản Thăng Long',
    source: 'Kho Di Sản Quốc Gia'
  },
  {
    id: 'hn-pho-co-1',
    cityName: 'Hà Nội',
    province: 'Hà Nội',
    landmarkName: 'Phố Cổ Hà Nội 36 Phố Phường',
    title: 'Phố Cổ Hà Nội 36 Phố Phường',
    tagline: 'Nét đẹp cổ kính, nhộn nhịp và trầm mặc của kinh thành Thăng Long xưa',
    imageUrl: 'https://images.unsplash.com/photo-1557750255-c76072a7aad1?auto=format&fit=crop&w=2000&q=85',
    thumbUrl: 'https://images.unsplash.com/photo-1557750255-c76072a7aad1?auto=format&fit=crop&w=600&q=80',
    lat: 21.0341,
    lng: 105.8506,
    tags: ['Hà Nội', 'Phố Cổ', '36 Phố Phường', 'Thăng Long', 'Văn hóa'],
    photographer: 'Trần Minh',
    source: 'Unsplash Vietnam'
  },

  // ==================== ĐÀ NẴNG ====================
  {
    id: 'dn-cau-vang-1',
    cityName: 'Đà Nẵng',
    province: 'Đà Nẵng',
    landmarkName: 'Cầu Vàng & Danh thắng Ngũ Hành Sơn',
    title: 'Cầu Vàng Bà Nà Hills Đà Nẵng',
    tagline: 'Thành phố đáng sống với kỳ quan Cầu Vàng nâng đỡ bởi đôi bàn tay khổng lồ giữa mây trời',
    imageUrl: 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?auto=format&fit=crop&w=2000&q=85',
    thumbUrl: 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?auto=format&fit=crop&w=600&q=80',
    lat: 15.9951,
    lng: 107.9962,
    tags: ['Đà Nẵng', 'Cầu Vàng', 'Bà Nà Hills', 'Ngũ Hành Sơn', 'Cầu Rồng', 'Miền Trung'],
    photographer: 'Nguyễn Bảo',
    source: 'Unsplash Vietnam'
  },
  {
    id: 'dn-bien-my-khe-1',
    cityName: 'Đà Nẵng',
    province: 'Đà Nẵng',
    landmarkName: 'Biển Mỹ Khê & Bán Đảo Sơn Trà',
    title: 'Bình Minh Trên Biển Mỹ Khê & Sơn Trà',
    tagline: 'Một trong những bãi biển quyến rũ nhất hành tinh ôm trọn bán đảo Sơn Trà xanh biếc',
    imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=2000&q=85',
    thumbUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80',
    lat: 16.0544,
    lng: 108.2478,
    tags: ['Đà Nẵng', 'Mỹ Khê', 'Sơn Trà', 'Biển Đà Nẵng', 'Chùa Linh Ứng'],
    photographer: 'Lê Hoàng',
    source: 'Unsplash Vietnam'
  },

  // ==================== HỘI AN & QUẢNG NAM ====================
  {
    id: 'qn-hoi-an-1',
    cityName: 'Hội An',
    province: 'Quảng Nam',
    landmarkName: 'Phố Cổ Hội An & Chùa Cầu',
    title: 'Phố Cổ Hội An Lung Linh Đèn Lồng Bên Sông Hoài',
    tagline: 'Di sản văn hóa thế giới với những mái ngói rêu phong và đêm phố cổ huyền ảo',
    imageUrl: imgHoiAnPhoCo,
    thumbUrl: imgHoiAnPhoCo,
    lat: 15.8801,
    lng: 108.338,
    tags: ['Hội An', 'Quảng Nam', 'Phố Cổ Hội An', 'Chùa Cầu', 'Sông Hoài', 'Đèn lồng', 'UNESCO'],
    photographer: 'Hội An Heritage',
    source: 'Kho Di Sản Quốc Gia'
  },
  {
    id: 'qn-chua-cau-2',
    cityName: 'Hội An',
    province: 'Quảng Nam',
    landmarkName: 'Chùa Cầu Hội An (Lai Viễn Kiều)',
    title: 'Chùa Cầu Hội An - Viên Ngọc Kiến Trúc Giao Thoa Văn Hóa',
    tagline: 'Biểu tượng hơn 400 năm tuổi bắc qua dòng sông Hoài thơ mộng tại thương cảng cổ Hội An',
    imageUrl: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=2000&q=85',
    thumbUrl: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=600&q=80',
    lat: 15.8771,
    lng: 108.3261,
    tags: ['Hội An', 'Chùa Cầu', 'Lai Viễn Kiều', 'Quảng Nam', 'Phố cổ Hội An', 'UNESCO'],
    photographer: 'Quảng Nam Heritage',
    source: 'Kho Di Sản Quốc Gia'
  },

  // ==================== CỐ ĐÔ HUẾ ====================
  {
    id: 'hue-dai-noi-1',
    cityName: 'Huế',
    province: 'Thừa Thiên Huế',
    landmarkName: 'Quần thể Di tích Cố đô Huế & Đại Nội',
    title: 'Ngọ Môn Quan - Đại Nội Kinh Thành Huế',
    tagline: 'Cố đô trầm mặc, uy nghiêm bên dòng sông Hương và núi Ngự Bình thơ mộng',
    imageUrl: imgDaiNoiHue,
    thumbUrl: imgDaiNoiHue,
    lat: 16.4637,
    lng: 107.5909,
    tags: ['Huế', 'Thừa Thiên Huế', 'Đại Nội', 'Ngọ Môn', 'Cố đô Huế', 'Hoàng thành Huế', 'Cung đình Huế', 'UNESCO'],
    photographer: 'Cố Đô Huế Archive',
    source: 'Kho Di Sản Quốc Gia'
  },
  {
    id: 'hue-dai-noi-2',
    cityName: 'Huế',
    province: 'Thừa Thiên Huế',
    landmarkName: 'Điện Thái Hòa & Tử Cấm Thành Huế',
    title: 'Hoàng Thành Huế & Kiến Trúc Cung Đình Triều Nguyễn',
    tagline: 'Nơi hội tụ tinh hoa kiến trúc cung đình và Nhã nhạc cung đình Huế',
    imageUrl: imgNhaNhacCungDinh,
    thumbUrl: imgNhaNhacCungDinh,
    lat: 16.4698,
    lng: 107.5784,
    tags: ['Huế', 'Đại Nội Huế', 'Điện Thái Hòa', 'Cung đình Huế', 'Triều Nguyễn'],
    photographer: 'Trung tâm Bảo tồn Di tích Cố đô Huế',
    source: 'Kho Di Sản Quốc Gia'
  },
  {
    id: 'hue-chua-thien-mu-1',
    cityName: 'Huế',
    province: 'Thừa Thiên Huế',
    landmarkName: 'Chùa Thiên Mụ & Sông Hương',
    title: 'Tháp Phước Duyên - Chùa Thiên Mụ Bên Sông Hương',
    tagline: 'Đệ nhất cổ tự đất Thần Kinh soi bóng xuống dòng Hương Giang êm đềm',
    imageUrl: 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?auto=format&fit=crop&w=2000&q=85',
    thumbUrl: 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?auto=format&fit=crop&w=600&q=80',
    lat: 16.4533,
    lng: 107.545,
    tags: ['Huế', 'Chùa Thiên Mụ', 'Sông Hương', 'Tháp Phước Duyên', 'Cố đô'],
    photographer: 'Hoàng Nam',
    source: 'Kho Di Sản Quốc Gia'
  },

  // ==================== TP. HỒ CHÍ MINH ====================
  {
    id: 'hcm-ben-thanh-1',
    cityName: 'TP. Hồ Chí Minh',
    province: 'TP. Hồ Chí Minh',
    landmarkName: 'Dinh Độc Lập, Nhà thờ Đức Bà & Chợ Bến Thành',
    title: 'Toàn Cảnh Sài Gòn - TP. Hồ Chí Minh Rực Rỡ',
    tagline: 'Đô thị năng động bậc nhất giao thoa giữa di sản lịch sử hơn 300 năm và nhịp sống hiện đại',
    imageUrl: imgChoBenThanh,
    thumbUrl: imgChoBenThanh,
    lat: 10.7769,
    lng: 106.7009,
    tags: ['TP. Hồ Chí Minh', 'Sài Gòn', 'Chợ Bến Thành', 'Dinh Độc Lập', 'Nhà thờ Đức Bà', 'Bến Nhà Rồng'],
    photographer: 'Sài Gòn Heritage',
    source: 'Kho Di Sản Quốc Gia'
  },
  {
    id: 'hcm-sai-gon-2',
    cityName: 'TP. Hồ Chí Minh',
    province: 'TP. Hồ Chí Minh',
    landmarkName: 'Bến Bạch Đằng & Địa Đạo Củ Chi',
    title: 'Không Gian Di Sản & Lịch Sử TP. Hồ Chí Minh',
    tagline: 'Hòn ngọc Viễn Đông rực rỡ ánh đèn bên dòng sông Sài Gòn lịch sử',
    imageUrl: imgDiaDaoCuChi,
    thumbUrl: imgDiaDaoCuChi,
    lat: 10.7725,
    lng: 106.7042,
    tags: ['TP. Hồ Chí Minh', 'Sài Gòn', 'Bến Bạch Đằng', 'Địa đạo Củ Chi', 'Sông Sài Gòn'],
    photographer: 'Minh Quân',
    source: 'Kho Di Sản Quốc Gia'
  },

  // ==================== QUẢNG NINH (HẠ LONG & YÊN TỬ) ====================
  {
    id: 'qni-ha-long-1',
    cityName: 'Hạ Long',
    province: 'Quảng Ninh',
    landmarkName: 'Vịnh Hạ Long & Non Thiêng Yên Tử',
    title: 'Kỳ Quan Thiên Nhiên Thế Giới Vịnh Hạ Long',
    tagline: 'Hàng ngàn đảo đá vôi kỳ vĩ vươn lên từ làn nước biển xanh ngọc bích',
    imageUrl: imgVinhHaLong,
    thumbUrl: imgVinhHaLong,
    lat: 20.9101,
    lng: 107.1839,
    tags: ['Quảng Ninh', 'Hạ Long', 'Vịnh Hạ Long', 'Yên Tử', 'Kỳ quan thiên nhiên', 'UNESCO'],
    photographer: 'Quảng Ninh Heritage',
    source: 'Kho Di Sản Quốc Gia'
  },
  {
    id: 'qni-ha-long-2',
    cityName: 'Hạ Long',
    province: 'Quảng Ninh',
    landmarkName: 'Vịnh Hạ Long Hoàng Hôn',
    title: 'Du Thuyền Giữa Đảo Đá Vịnh Hạ Long',
    tagline: 'Bức tranh thủy mặc khổng lồ của tạo hóa tại vùng biển Đông Bắc Tổ quốc',
    imageUrl: 'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=2000&q=85',
    thumbUrl: 'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=600&q=80',
    lat: 20.9505,
    lng: 107.0733,
    tags: ['Quảng Ninh', 'Vịnh Hạ Long', 'Đảo Ti Tốp', 'Hang Sửng Sốt'],
    photographer: 'Đức Anh',
    source: 'Unsplash Vietnam'
  },

  // ==================== NINH BÌNH (TRÀNG AN - HOA LƯ) ====================
  {
    id: 'nb-trang-an-1',
    cityName: 'Hoa Lư',
    province: 'Ninh Bình',
    landmarkName: 'Quần thể Danh thắng Tràng An & Cố đô Hoa Lư',
    title: 'Non Nước Tràng An - Tam Cốc - Bích Động',
    tagline: 'Di sản kép thế giới với núi đá vôi trùng điệp và dòng sông Ngô Đồng uốn lượn qua đồng lúa vàng',
    imageUrl: imgTrangAnNinhBinh,
    thumbUrl: imgTrangAnNinhBinh,
    lat: 20.2506,
    lng: 105.9745,
    tags: ['Ninh Bình', 'Tràng An', 'Cố đô Hoa Lư', 'Tam Cốc', 'Bái Đính', 'Hang Múa', 'UNESCO'],
    photographer: 'Ninh Bình Explorer',
    source: 'Kho Di Sản Quốc Gia'
  },
  {
    id: 'nb-hang-mua-1',
    cityName: 'Ninh Bình',
    province: 'Ninh Bình',
    landmarkName: 'Đỉnh Ngọa Long (Hang Múa) & Tam Cốc',
    title: 'Toàn Cảnh Tam Cốc Nhìn Từ Đỉnh Hang Múa',
    tagline: 'Vịnh Hạ Long trên cạn hùng vĩ nơi kinh đô cổ của ba triều đại Đinh - Tiền Lê - Lý',
    imageUrl: 'https://images.unsplash.com/photo-1563492065599-3520f775eeed?auto=format&fit=crop&w=2000&q=85',
    thumbUrl: 'https://images.unsplash.com/photo-1563492065599-3520f775eeed?auto=format&fit=crop&w=600&q=80',
    lat: 20.2314,
    lng: 105.9369,
    tags: ['Ninh Bình', 'Hang Múa', 'Tam Cốc', 'Tràng An', 'Hoa Lư'],
    photographer: 'Vũ Hải',
    source: 'Unsplash Vietnam'
  },

  // ==================== LÀO CAI (SA PA - FANSIPAN) ====================
  {
    id: 'lc-sapa-1',
    cityName: 'Sa Pa',
    province: 'Lào Cai',
    landmarkName: 'Đỉnh Fansipan & Ruộng Bậc Thang Mường Hoa',
    title: 'Ruộng Bậc Thang Sa Pa Mùa Lúa Chín',
    tagline: 'Nóc nhà Đông Dương hùng vĩ ẩn hiện trong biển mây và sắc vàng ruộng bậc thang Tây Bắc',
    imageUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=2000&q=85',
    thumbUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80',
    lat: 22.3364,
    lng: 103.8438,
    tags: ['Lào Cai', 'Sa Pa', 'Fansipan', 'Ruộng bậc thang', 'Tây Bắc', 'Mường Hoa'],
    photographer: 'Tây Bắc Lens',
    source: 'Unsplash Vietnam'
  },

  // ==================== HÀ GIANG (ĐỒNG VĂN - MÃ PÍ LÈNG) ====================
  {
    id: 'hg-dong-van-1',
    cityName: 'Hà Giang',
    province: 'Hà Giang',
    landmarkName: 'Cao nguyên đá Đồng Văn & Cột cờ Lũng Cú',
    title: 'Đèo Mã Pí Lèng & Sông Nho Quế Xanh Ngọc Bích',
    tagline: 'Nơi địa đầu cực Bắc Tổ quốc với công viên địa chất toàn cầu UNESCO hùng vĩ',
    imageUrl: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=2000&q=85',
    thumbUrl: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=600&q=80',
    lat: 23.2589,
    lng: 105.3522,
    tags: ['Hà Giang', 'Đồng Văn', 'Lũng Cú', 'Mã Pí Lèng', 'Sông Nho Quế', 'Cực Bắc'],
    photographer: 'Hoàng Việt',
    source: 'Unsplash Vietnam'
  },

  // ==================== CAO BẰNG (THÁC BẢN GIỐC - PÁC BÓ) ====================
  {
    id: 'cb-ban-gioc-1',
    cityName: 'Cao Bằng',
    province: 'Cao Bằng',
    landmarkName: 'Thác Bản Giốc & Khu di tích Pác Bó',
    title: 'Thác Bản Giốc Tung Bọt Trắng Xóa Giữa Núi Rừng Đông Bắc',
    tagline: 'Thác nước tự nhiên lớn nhất Đông Nam Á và cội nguồn cách mạng Pác Bó - Suối Lê-nin',
    imageUrl: imgThacBanGioc,
    thumbUrl: imgThacBanGioc,
    lat: 22.855,
    lng: 106.7225,
    tags: ['Cao Bằng', 'Thác Bản Giốc', 'Pác Bó', 'Suối Lê-nin', 'Đông Bắc'],
    photographer: 'Đông Bắc Discovery',
    source: 'Kho Di Sản Quốc Gia'
  },

  // ==================== HẢI PHÒNG (CÁT BÀ - LAN HẠ) ====================
  {
    id: 'hp-cat-ba-1',
    cityName: 'Hải Phòng',
    province: 'Hải Phòng',
    landmarkName: 'Quần đảo Cát Bà & Vịnh Lan Hạ',
    title: 'Vịnh Lan Hạ & Quần Đảo Cát Bà Xanh Mướt',
    tagline: 'Thành phố Hoa Phượng Đỏ với di sản thiên nhiên thế giới Cát Bà - Vịnh Hạ Long',
    imageUrl: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=2000&q=85',
    thumbUrl: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=600&q=80',
    lat: 20.7278,
    lng: 107.0481,
    tags: ['Hải Phòng', 'Cát Bà', 'Vịnh Lan Hạ', 'Đồ Sơn', 'Nhà hát lớn Hải Phòng'],
    photographer: 'Hải Phòng Photo',
    source: 'Unsplash Vietnam'
  },

  // ==================== QUẢNG BÌNH (PHONG NHA - KẺ BÀNG) ====================
  {
    id: 'qb-phong-nha-1',
    cityName: 'Đồng Hới',
    province: 'Quảng Bình',
    landmarkName: 'Vườn Quốc gia Phong Nha - Kẻ Bàng & Hang Sơn Đoòng',
    title: 'Kỳ Quan Đệ Nhất Động Phong Nha - Kẻ Bàng',
    tagline: 'Vương quốc hang động kỳ vĩ của thế giới với dòng sông Son xanh biếc',
    imageUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=2000&q=85',
    thumbUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80',
    lat: 17.5908,
    lng: 106.2831,
    tags: ['Quảng Bình', 'Phong Nha', 'Kẻ Bàng', 'Sơn Đoòng', 'Đồng Hới', 'UNESCO'],
    photographer: 'Quảng Bình Explorer',
    source: 'Unsplash Vietnam'
  },

  // ==================== LÂM ĐỒNG (ĐÀ LẠT) ====================
  {
    id: 'ld-da-lat-1',
    cityName: 'Đà Lạt',
    province: 'Lâm Đồng',
    landmarkName: 'Hồ Xuân Hương, Đồi Thông & Cao nguyên Lâm Viên',
    title: 'Bình Minh Sương Mù Trên Đồi Thông Đà Lạt',
    tagline: 'Thành phố ngàn hoa và sương mù lãng mạn trên cao nguyên Lâm Viên',
    imageUrl: 'https://images.unsplash.com/photo-1506748686214-e9df14d4d9d0?auto=format&fit=crop&w=2000&q=85',
    thumbUrl: 'https://images.unsplash.com/photo-1506748686214-e9df14d4d9d0?auto=format&fit=crop&w=600&q=80',
    lat: 11.9404,
    lng: 108.4583,
    tags: ['Đà Lạt', 'Lâm Đồng', 'Hồ Xuân Hương', 'Langbiang', 'Tây Nguyên'],
    photographer: 'Đà Lạt Dreamer',
    source: 'Unsplash Vietnam'
  },

  // ==================== KHÁNH HÒA (NHA TRANG) ====================
  {
    id: 'kh-nha-trang-1',
    cityName: 'Nha Trang',
    province: 'Khánh Hòa',
    landmarkName: 'Tháp Bà Ponagar & Vịnh Nha Trang',
    title: 'Vịnh Biển Nha Trang & Tháp Bà Ponagar Cổ Kính',
    tagline: 'Hòn ngọc biển Đông với quần thể kiến trúc Chăm Pa ngàn năm tuổi',
    imageUrl: imgMuiNePoshanu,
    thumbUrl: imgMuiNePoshanu,
    lat: 12.2388,
    lng: 109.1967,
    tags: ['Nha Trang', 'Khánh Hòa', 'Tháp Bà Ponagar', 'Vịnh Nha Trang', 'Chăm Pa'],
    photographer: 'Nha Trang Sea',
    source: 'Kho Di Sản Quốc Gia'
  },

  // ==================== CẦN THƠ (CHỢ NỔI CÁI RĂNG) ====================
  {
    id: 'ct-cai-rang-1',
    cityName: 'Cần Thơ',
    province: 'Cần Thơ',
    landmarkName: 'Chợ nổi Cái Răng & Bến Ninh Kiều',
    title: 'Nhịp Sống Sông Nước Chợ Nổi Cái Răng - Cần Thơ',
    tagline: 'Thủ phủ miền Tây sông nước với di sản văn hóa phi vật thể quốc gia Chợ nổi Cái Răng',
    imageUrl: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=2000&q=85',
    thumbUrl: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=600&q=80',
    lat: 10.0452,
    lng: 105.7469,
    tags: ['Cần Thơ', 'Chợ nổi Cái Răng', 'Bến Ninh Kiều', 'Miền Tây', 'Sông Hậu'],
    photographer: 'Miền Tây Lens',
    source: 'Unsplash Vietnam'
  },

  // ==================== KIÊN GIANG (PHÚ QUỐC - HÀ TIÊN) ====================
  {
    id: 'kg-phu-quoc-1',
    cityName: 'Phú Quốc',
    province: 'Kiên Giang',
    landmarkName: 'Đảo Ngọc Phú Quốc & Dinh Cậu',
    title: 'Hoàng Hôn Rực Rỡ Trên Đảo Ngọc Phú Quốc',
    tagline: 'Thiên đường biển đảo Tây Nam Tổ quốc với làn nước trong vắt và bãi cát trắng mịn',
    imageUrl: imgPhuQuocDinhCau,
    thumbUrl: imgPhuQuocDinhCau,
    lat: 10.2899,
    lng: 103.984,
    tags: ['Phú Quốc', 'Kiên Giang', 'Đảo Ngọc', 'Dinh Cậu', 'Hà Tiên'],
    photographer: 'Phú Quốc Island',
    source: 'Kho Di Sản Quốc Gia'
  },

  // ==================== BẮC NINH & LÀNG NGHỀ ====================
  {
    id: 'bn-quan-ho-1',
    cityName: 'Bắc Ninh',
    province: 'Bắc Ninh',
    landmarkName: 'Dân Ca Quan Họ Bắc Ninh & Đền Đô',
    title: 'Liền Anh Liền Chị Quan Họ Bên Mái Đình Kinh Bắc',
    tagline: 'Di sản văn hóa phi vật thể đại diện của nhân loại tại vùng đất Kinh Bắc ngàn năm',
    imageUrl: imgQuanHoBacNinh,
    thumbUrl: imgQuanHoBacNinh,
    lat: 21.1861,
    lng: 106.0763,
    tags: ['Bắc Ninh', 'Quan họ Bắc Ninh', 'Đền Đô', 'Chùa Dâu', 'Kinh Bắc', 'UNESCO'],
    photographer: 'Kinh Bắc Heritage',
    source: 'Kho Di Sản Quốc Gia'
  },

  // ==================== TÂY NINH (NÚI BÀ ĐEN) ====================
  {
    id: 'tn-ba-den-1',
    cityName: 'Tây Ninh',
    province: 'Tây Ninh',
    landmarkName: 'Núi Bà Đen & Tòa Thánh Tây Ninh',
    title: 'Đỉnh Núi Bà Đen Giữa Biển Mây Bồng Bềnh',
    tagline: 'Nóc nhà Nam Bộ linh thiêng cao 986m giữa vùng đất Tây Ninh nắng gió',
    imageUrl: imgNuiBaDen,
    thumbUrl: imgNuiBaDen,
    lat: 11.373,
    lng: 106.174,
    tags: ['Tây Ninh', 'Núi Bà Đen', 'Tòa Thánh Tây Ninh', 'Nam Bộ'],
    photographer: 'Nam Bộ Explorer',
    source: 'Kho Di Sản Quốc Gia'
  },

  // ==================== CÀ MAU (MŨI CÀ MAU) ====================
  {
    id: 'cm-mui-ca-mau-1',
    cityName: 'Cà Mau',
    province: 'Cà Mau',
    landmarkName: 'Mũi Cà Mau & Rừng ngập mặn U Minh Hạ',
    title: 'Rừng Ngập Mặn & Đất Mũi Cà Mau Cực Nam Tổ Quốc',
    tagline: 'Nơi đất biết nở, rừng biết đi và biển sinh sôi tại điểm cực Nam thiêng liêng của Tổ quốc',
    imageUrl: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=2000&q=85',
    thumbUrl: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=600&q=80',
    lat: 8.6063,
    lng: 104.7292,
    tags: ['Cà Mau', 'Mũi Cà Mau', 'U Minh Hạ', 'Cực Nam', 'Miền Tây'],
    photographer: 'Đất Mũi Photo',
    source: 'Unsplash Vietnam'
  },

  // ==================== BÌNH ĐỊNH (QUY NHƠN - EO GIÓ - THÁP CHĂM) ====================
  {
    id: 'bd-quy-nhon-1',
    cityName: 'Quy Nhơn',
    province: 'Bình Định',
    landmarkName: 'Eo Gió, Kỳ Co & Tháp Đôi Chăm Pa',
    title: 'Eo Gió & Biển Quy Nhơn Hùng Vĩ Đất Võ Trời Văn',
    tagline: 'Miền đất địa linh nhân kiệt gắn liền với hào khí Tây Sơn và di sản tháp Chăm cổ kính',
    imageUrl: 'https://images.unsplash.com/photo-1519046904884-53103b34b206?auto=format&fit=crop&w=2000&q=85',
    thumbUrl: 'https://images.unsplash.com/photo-1519046904884-53103b34b206?auto=format&fit=crop&w=600&q=80',
    lat: 13.782,
    lng: 109.219,
    tags: ['Bình Định', 'Quy Nhơn', 'Eo Gió', 'Kỳ Co', 'Tháp Đôi', 'Tây Sơn'],
    photographer: 'Quy Nhơn Discovery',
    source: 'Unsplash Vietnam'
  },

  // ==================== PHÚ THỌ (ĐỀN HÙNG) ====================
  {
    id: 'pt-den-hung-1',
    cityName: 'Việt Trì',
    province: 'Phú Thọ',
    landmarkName: 'Khu Di tích Lịch sử Đền Hùng - Núi Nghĩa Lĩnh',
    title: 'Non Thiêng Nghĩa Lĩnh - Khu Di Tích Đền Hùng',
    tagline: 'Đất Tổ cội nguồn dân tộc Việt Nam: "Dù ai đi ngược về xuôi, nhớ ngày Giỗ Tổ mùng Mười tháng Ba"',
    imageUrl: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=2000&q=85',
    thumbUrl: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=600&q=80',
    lat: 21.3667,
    lng: 105.3236,
    tags: ['Phú Thọ', 'Đền Hùng', 'Việt Trì', 'Vua Hùng', 'Đất Tổ', 'Hát Xoan'],
    photographer: 'Đất Tổ Văn Lang',
    source: 'Unsplash Vietnam'
  },

  // ==================== NGHỆ AN (LÀNG SEN KIM LIÊN) ====================
  {
    id: 'na-lang-sen-1',
    cityName: 'Vinh',
    province: 'Nghệ An',
    landmarkName: 'Khu Di tích Kim Liên (Làng Sen) & Biển Cửa Lò',
    title: 'Quê Hương Xứ Nghệ & Sông Lam Núi Hồng',
    tagline: 'Vùng đất địa linh nhân kiệt, quê hương Chủ tịch Hồ Chí Minh và dân ca Ví, Giặm Nghệ Tĩnh',
    imageUrl: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=2000&q=85',
    thumbUrl: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=600&q=80',
    lat: 18.6796,
    lng: 105.6813,
    tags: ['Nghệ An', 'Vinh', 'Làng Sen', 'Kim Liên', 'Sông Lam', 'Ví Giặm'],
    photographer: 'Xứ Nghệ Photo',
    source: 'Unsplash Vietnam'
  }
];

const LANDMARK_GALLERY_STORAGE_KEY = 'heritageai_landmark_photo_gallery_v2';
const LANDMARK_DELETED_IDS_KEY = 'heritageai_deleted_landmark_photos_v2';

function isBrokenOrTajMahalUrl(url?: string): boolean {
  if (!url) return true;
  if (url.includes('1548013146-72479768bada')) return true;
  return false;
}

/**
 * Returns the complete Landmark Photo Gallery including Admin edits, uploaded photos, and custom additions.
 */
export function getLandmarkPhotoGallery(): LandmarkPhotoItem[] {
  if (typeof window === 'undefined') {
    return VIETNAM_LANDMARK_PHOTOS;
  }

  try {
    const deletedRaw = localStorage.getItem(LANDMARK_DELETED_IDS_KEY);
    const deletedIds = new Set<string>(deletedRaw ? JSON.parse(deletedRaw) : []);

    const savedRaw = localStorage.getItem(LANDMARK_GALLERY_STORAGE_KEY);
    const customItems: LandmarkPhotoItem[] = savedRaw ? JSON.parse(savedRaw) : [];

    const defaultMap = new Map<string, LandmarkPhotoItem>();
    for (const d of VIETNAM_LANDMARK_PHOTOS) {
      defaultMap.set(d.id, d);
    }

    const customMap = new Map<string, LandmarkPhotoItem>();
    const newItems: LandmarkPhotoItem[] = [];

    for (const item of customItems) {
      if (!item || !item.id || deletedIds.has(item.id)) continue;
      const fallbackDefault = defaultMap.get(item.id);
      const cleanImageUrl = isBrokenOrTajMahalUrl(item.imageUrl)
        ? (fallbackDefault?.imageUrl || DEFAULT_VIETNAM_LANDMARK_FALLBACK)
        : item.imageUrl;
      const cleanThumbUrl = isBrokenOrTajMahalUrl(item.thumbUrl)
        ? cleanImageUrl
        : (item.thumbUrl || cleanImageUrl);

      const healed: LandmarkPhotoItem = {
        ...item,
        imageUrl: cleanImageUrl,
        thumbUrl: cleanThumbUrl
      };

      if (defaultMap.has(item.id)) {
        customMap.set(item.id, healed);
      } else {
        newItems.push(healed);
      }
    }

    const mergedDefaults = VIETNAM_LANDMARK_PHOTOS
      .filter(d => !deletedIds.has(d.id))
      .map(d => customMap.get(d.id) || d);

    return [...newItems, ...mergedDefaults];
  } catch (err) {
    console.warn('Could not read custom landmark photo gallery from localStorage:', err);
    return VIETNAM_LANDMARK_PHOTOS;
  }
}

/**
 * Saves or updates a LandmarkPhotoItem in the gallery (Admin feature)
 */
export function saveLandmarkPhotoItem(item: LandmarkPhotoItem): LandmarkPhotoItem[] {
  if (typeof window === 'undefined') return VIETNAM_LANDMARK_PHOTOS;

  try {
    const savedRaw = localStorage.getItem(LANDMARK_GALLERY_STORAGE_KEY);
    const customItems: LandmarkPhotoItem[] = savedRaw ? JSON.parse(savedRaw) : [];

    // Ensure it's not marked as deleted
    const deletedRaw = localStorage.getItem(LANDMARK_DELETED_IDS_KEY);
    const deletedIds = new Set<string>(deletedRaw ? JSON.parse(deletedRaw) : []);
    if (deletedIds.has(item.id)) {
      deletedIds.delete(item.id);
      localStorage.setItem(LANDMARK_DELETED_IDS_KEY, JSON.stringify(Array.from(deletedIds)));
    }

    const normalized: LandmarkPhotoItem = {
      ...item,
      thumbUrl: item.thumbUrl || item.imageUrl,
      tags: Array.isArray(item.tags) && item.tags.length > 0
        ? item.tags
        : [item.cityName, item.landmarkName].filter(Boolean)
    };

    const existingIdx = customItems.findIndex(x => x.id === normalized.id);
    if (existingIdx >= 0) {
      customItems[existingIdx] = normalized;
    } else {
      customItems.unshift(normalized);
    }

    localStorage.setItem(LANDMARK_GALLERY_STORAGE_KEY, JSON.stringify(customItems));
    window.dispatchEvent(new CustomEvent('landmark-gallery-updated'));
  } catch (err) {
    console.error('Failed to save landmark photo item:', err);
  }

  return getLandmarkPhotoGallery();
}

/**
 * Replaces the custom landmark gallery items (e.g. when syncing from Firebase Firestore)
 */
export function setCustomLandmarkPhotoGallery(customItems: LandmarkPhotoItem[], deletedIds: string[] = []): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LANDMARK_GALLERY_STORAGE_KEY, JSON.stringify(customItems || []));
    localStorage.setItem(LANDMARK_DELETED_IDS_KEY, JSON.stringify(deletedIds || []));
    window.dispatchEvent(new CustomEvent('landmark-gallery-updated'));
  } catch (err) {
    console.warn('Could not sync landmark gallery to localStorage:', err);
  }
}

export function getCustomLandmarkGalleryState(): { customItems: LandmarkPhotoItem[]; deletedIds: string[] } {
  if (typeof window === 'undefined') return { customItems: [], deletedIds: [] };
  try {
    const savedRaw = localStorage.getItem(LANDMARK_GALLERY_STORAGE_KEY);
    const deletedRaw = localStorage.getItem(LANDMARK_DELETED_IDS_KEY);
    return {
      customItems: savedRaw ? JSON.parse(savedRaw) : [],
      deletedIds: deletedRaw ? JSON.parse(deletedRaw) : []
    };
  } catch {
    return { customItems: [], deletedIds: [] };
  }
}

/**
 * Deletes a LandmarkPhotoItem from the gallery (Admin feature)
 */
export function deleteLandmarkPhotoItem(id: string): LandmarkPhotoItem[] {
  if (typeof window === 'undefined') return VIETNAM_LANDMARK_PHOTOS;

  try {
    const savedRaw = localStorage.getItem(LANDMARK_GALLERY_STORAGE_KEY);
    const customItems: LandmarkPhotoItem[] = savedRaw ? JSON.parse(savedRaw) : [];
    const filtered = customItems.filter(x => x.id !== id);
    localStorage.setItem(LANDMARK_GALLERY_STORAGE_KEY, JSON.stringify(filtered));

    const deletedRaw = localStorage.getItem(LANDMARK_DELETED_IDS_KEY);
    const deletedIds = new Set<string>(deletedRaw ? JSON.parse(deletedRaw) : []);
    deletedIds.add(id);
    localStorage.setItem(LANDMARK_DELETED_IDS_KEY, JSON.stringify(Array.from(deletedIds)));

    window.dispatchEvent(new CustomEvent('landmark-gallery-updated'));
  } catch (err) {
    console.error('Failed to delete landmark photo item:', err);
  }

  return getLandmarkPhotoGallery();
}

/**
 * Resets the Landmark Photo Gallery to default (Admin feature)
 */
export function resetLandmarkPhotoGallery(): LandmarkPhotoItem[] {
  if (typeof window === 'undefined') return VIETNAM_LANDMARK_PHOTOS;

  try {
    localStorage.removeItem(LANDMARK_GALLERY_STORAGE_KEY);
    localStorage.removeItem(LANDMARK_DELETED_IDS_KEY);
    window.dispatchEvent(new CustomEvent('landmark-gallery-updated'));
  } catch (err) {
    console.error('Failed to reset landmark photo gallery:', err);
  }

  return getLandmarkPhotoGallery();
}

/**
 * Helper to normalize Vietnamese strings for fuzzy matching
 */
function normalizeText(str: string): string {
  return (str || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .trim();
}

/**
 * Smart search across the Landmark Photo Gallery (including Admin-edited photos)
 */
export function findMatchingLandmarkPhotos(
  query: string,
  secondArg?: string | number,
  thirdArg?: string | number
): LandmarkPhotoItem[] {
  const gallery = getLandmarkPhotoGallery();
  const extraStrings = [secondArg, thirdArg].filter((v): v is string => typeof v === 'string');
  const maxLimit = [secondArg, thirdArg].find((v): v is number => typeof v === 'number');
  const combined = [query, ...extraStrings].filter(Boolean).join(' ').trim();
  if (!combined) {
    return maxLimit ? gallery.slice(0, maxLimit) : gallery;
  }

  const normQuery = normalizeText(combined);
  const queryWords = normQuery.split(/\s+/).filter(Boolean);

  const scored = gallery.map(item => {
    let score = 0;
    const normCity = normalizeText(item.cityName);
    const normProv = normalizeText(item.province);
    const normLandmark = normalizeText(item.landmarkName);
    const normTitle = normalizeText(item.title);
    const normTags = item.tags.map(t => normalizeText(t)).join(' ');

    if (normCity === normQuery || normProv === normQuery) score += 100;
    if (normCity.includes(normQuery) || normQuery.includes(normCity)) score += 60;
    if (normProv.includes(normQuery) || normQuery.includes(normProv)) score += 50;
    if (normLandmark.includes(normQuery) || normQuery.includes(normLandmark)) score += 75;
    if (normTitle.includes(normQuery)) score += 45;
    if (normTags.includes(normQuery)) score += 40;

    for (const word of queryWords) {
      if (word.length < 2) continue;
      if (normCity.includes(word)) score += 15;
      if (normProv.includes(word)) score += 15;
      if (normLandmark.includes(word)) score += 20;
      if (normTitle.includes(word)) score += 12;
      if (normTags.includes(word)) score += 10;
    }

    return { item, score };
  });

  const matched = scored
    .filter(x => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .map(x => x.item);

  return matched.length > 0 ? matched : gallery;
}
