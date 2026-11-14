/**
 * ============================================================================
 * TỪ ĐIỂN NỘI DUNG HƯỚNG DẪN SỬ DỤNG THEO NGỮ CẢNH (CONTEXTUAL USAGE GUIDE)
 * DÀNH CHO NHÂN VẬT HƯỚNG DẪN VIÊN 3D ("HDV 3D") - HỒN ĐẤT VIỆT
 * ============================================================================
 *
 * Tất cả lời thoại giải thích giao diện của ứng dụng được quản lý tập trung tại
 * một file duy nhất này để dễ dàng biên tập, dịch thuật hoặc mở rộng.
 *
 * CÁCH THÊM MỘT MỤC HƯỚNG DẪN MỚI:
 * 1. Trên phần tử JSX cần giải thích, gắn thuộc tính:
 *      data-guide-id="ten.nhom.chucNang"
 *      data-guide-type="ui"
 *    (Nếu là thẻ di sản / tỉnh thành mang tính nội dung, gắn data-guide-type="content"
 *     để giữ nguyên hành vi đọc thuyết minh văn hóa, không kích hoạt hướng dẫn giao diện).
 * 2. Thêm khóa `"ten.nhom.chucNang"` vào đối tượng `GUIDE_CONTENT` bên dưới với:
 *      - title: Tên ngắn gọn (hiển thị in đậm trên đầu bong bóng phụ đề)
 *      - say: 2–4 câu tiếng Việt tự nhiên, dùng động từ cụ thể (bấm, chạm, gõ, kéo, vuốt...)
 *      - tip: (Tuỳ chọn) 1 câu mẹo nhỏ hiển thị bên dưới lời thoại
 *      - order: (Tuỳ chọn) Thứ tự xuất hiện trong chế độ "Tham quan app" tự động
 *      - tab: (Tuỳ chọn) Tên tab màn hình chứa phần tử này để "Tham quan app" tự chuyển tới
 */

export interface GuideContentEntry {
  title: string;
  say: string;
  tip?: string;
  order?: number;
  tab?: string;
}

export const SCREEN_ID_BY_TAB: Record<string, string> = {
  home: 'screen.home',
  map: 'screen.map',
  recognize: 'screen.recognize',
  recognizer: 'screen.recognize',
  story: 'screen.story',
  storyteller: 'screen.story',
  itinerary: 'screen.itinerary',
  food: 'screen.food',
  crafts: 'screen.crafts',
  quiz: 'screen.quiz',
  learning: 'screen.quiz',
  community: 'screen.community',
  favorites: 'screen.favorites',
  profile: 'screen.profile',
  badges: 'screen.profile',
  admin: 'screen.admin',
};

/**
 * Phần tử điều khiển chính cần tô sáng (vòng sáng vàng + nhân vật 3D chỉ tay/nhìn vào)
 * ngay khi người dùng bấm chuyển sang một trang/màn hình bất kỳ.
 */
export const PRIMARY_GUIDE_ID_BY_TAB: Record<string, string> = {
  home: 'home.toolsDashboard',
  map: 'map.search',
  recognize: 'recognize.viewfinder',
  recognizer: 'recognize.viewfinder',
  story: 'story.audienceModes',
  storyteller: 'story.audienceModes',
  itinerary: 'itinerary.form',
  food: 'food.heritagePicker',
  crafts: 'crafts.tabSwitcher',
  quiz: 'quiz.tabSwitcher',
  learning: 'quiz.tabSwitcher',
  community: 'community.openFormBtn',
  favorites: 'favorites.sectionTabs',
  profile: 'profile.subTabs',
  badges: 'profile.subTabs',
};

/**
 * Danh sách các bước / nút điều khiển tiêu biểu trên từng trang để hiển thị
 * thành các chip gợi ý nhanh ("Chỉ dẫn từng phần") ngay trong bong bóng phụ đề.
 */
export const SCREEN_FEATURE_GUIDE_IDS_BY_TAB: Record<
  string,
  Array<{ guideId: string; shortLabel: string }>
> = {
  home: [
    { guideId: 'home.toolsDashboard', shortLabel: '7 Công cụ AI' },
    { guideId: 'home.heritageSearch', shortLabel: 'Tìm di sản' },
    { guideId: 'home.openFullscreenMap', shortLabel: 'Mở bản đồ lớn' },
  ],
  map: [
    { guideId: 'map.search', shortLabel: 'Ô tìm kiếm' },
    { guideId: 'map.provinceListBtn', shortLabel: 'Nút 34 Tỉnh' },
    { guideId: 'map.bottomSheet', shortLabel: 'Khay di sản' },
  ],
  recognize: [
    { guideId: 'recognize.samples', shortLabel: 'Chọn ảnh mẫu' },
    { guideId: 'recognize.viewfinder', shortLabel: 'Khung ngắm' },
    { guideId: 'recognize.shutter', shortLabel: 'Nút bấm chụp' },
  ],
  recognizer: [
    { guideId: 'recognize.samples', shortLabel: 'Chọn ảnh mẫu' },
    { guideId: 'recognize.viewfinder', shortLabel: 'Khung ngắm' },
    { guideId: 'recognize.shutter', shortLabel: 'Nút bấm chụp' },
  ],
  story: [
    { guideId: 'story.heritageSelector', shortLabel: 'Chọn di sản' },
    { guideId: 'story.audienceModes', shortLabel: '5 Phong cách kể' },
    { guideId: 'story.audioPlayer', shortLabel: 'Nút Play nghe' },
  ],
  storyteller: [
    { guideId: 'story.heritageSelector', shortLabel: 'Chọn di sản' },
    { guideId: 'story.audienceModes', shortLabel: '5 Phong cách kể' },
    { guideId: 'story.audioPlayer', shortLabel: 'Nút Play nghe' },
  ],
  itinerary: [
    { guideId: 'itinerary.form', shortLabel: 'Chọn điểm đến' },
    { guideId: 'itinerary.weatherCard', shortLabel: 'Xem thời tiết' },
    { guideId: 'itinerary.generateBtn', shortLabel: 'Nút tạo lịch trình' },
  ],
  food: [
    { guideId: 'food.heritagePicker', shortLabel: 'Chọn khu di sản' },
    { guideId: 'food.personalMatcher', shortLabel: 'Gợi ý theo gu' },
    { guideId: 'food.filters', shortLabel: 'Bộ lọc quán' },
  ],
  crafts: [
    { guideId: 'crafts.tabSwitcher', shortLabel: 'Làng nghề / Nghệ thuật' },
    { guideId: 'crafts.itemsGrid', shortLabel: 'Xem quy trình' },
    { guideId: 'crafts.proposeBtn', shortLabel: 'Đề xuất mới' },
  ],
  quiz: [
    { guideId: 'quiz.tabSwitcher', shortLabel: '3 Chế độ học' },
    { guideId: 'quiz.topicSelector', shortLabel: 'Chọn chủ đề Quiz' },
  ],
  learning: [
    { guideId: 'quiz.tabSwitcher', shortLabel: '3 Chế độ học' },
    { guideId: 'quiz.topicSelector', shortLabel: 'Chọn chủ đề Quiz' },
  ],
  community: [
    { guideId: 'community.openFormBtn', shortLabel: 'Gửi đóng góp' },
    { guideId: 'community.feed', shortLabel: 'Bảng tin cộng đồng' },
  ],
  favorites: [
    { guideId: 'favorites.sectionTabs', shortLabel: 'Lọc mục đã lưu' },
  ],
  profile: [
    { guideId: 'profile.subTabs', shortLabel: 'Danh hiệu & Hồ sơ' },
  ],
  badges: [
    { guideId: 'profile.subTabs', shortLabel: 'Danh hiệu & Hồ sơ' },
  ],
};

export const GUIDE_CONTENT: Record<string, GuideContentEntry> = {
  // ==========================================================================
  // 1. GIỚI THIỆU TỔNG QUAN TỪNG MÀN HÌNH (KHI BẤM VÀO TRANG BẤT KỲ)
  // ==========================================================================
  'screen.home': {
    title: 'Cách Sử Dụng Trang Chủ Khám Phá',
    say: 'Chào mừng bạn đến với trang chủ Hồn Đất Việt! Để sử dụng trang này, bạn có thể chạm vào 1 trong 7 công cụ thông minh bên dưới, xem nhanh bản đồ 34 tỉnh thành, hoặc cuộn xuống gõ tên di tích vào ô tìm kiếm 3 miền Bắc - Trung - Nam nhé.',
    tip: 'Bấm vào các nút gợi ý bên dưới phụ đề để mình chỉ từng phần trên trang này.',
  },
  'screen.map': {
    title: 'Cách Sử Dụng Bản Đồ Di Sản 34 Tỉnh Thành',
    say: 'Để sử dụng trang Bản đồ, bạn hãy dùng ngón tay kéo hoặc phóng to bản đồ rồi chạm vào chấm tròn của tỉnh thành bất kỳ để nghe thuyết minh. Bạn cũng có thể gõ tên tỉnh vào ô tìm kiếm phía trên, bấm nút "34 Tỉnh" ở góc phải, hoặc vuốt khay thông tin dưới đáy lên để xem chi tiết di sản.',
    tip: 'Nếu không tiện chạm bản đồ, hãy bấm nút "34 Tỉnh" ở góc trên bên phải để chọn từ danh sách.',
  },
  'screen.recognize': {
    title: 'Cách Sử Dụng Ống Kính Nhận Diện Di Sản AI',
    say: 'Để sử dụng trang Nhận diện AI, cách nhanh nhất là bạn chạm vào một trong các bức ảnh mẫu ở hàng trên cùng để xem kết quả phân tích ngay. Nếu muốn tra cứu ảnh của bạn, hãy bấm mở Camera chụp trực tiếp hoặc bấm Tải tệp ảnh từ máy lên khung ngắm màu vàng.',
    tip: 'Chụp ở nơi đủ sáng và giữ rõ nét hoa văn để kết quả nhận diện chính xác nhất.',
  },
  'screen.story': {
    title: 'Cách Sử Dụng Phòng Nghe Kể Chuyện Di Sản',
    say: 'Để sử dụng trang Kể chuyện rất đơn giản: Bước 1, bạn chạm chọn một di sản ở danh sách bên trái. Bước 2, bấm chọn 1 trong 5 phong cách người nghe như Trẻ em, Học sinh hay Sinh viên. Bước 3, bấm nút Play màu đỏ trên thanh âm thanh để lắng nghe câu chuyện.',
    tip: 'Bạn có thể đổi tốc độ giọng đọc 0.8x, 1x hoặc 1.2x ngay trên thanh điều khiển âm thanh.',
  },
  'screen.itinerary': {
    title: 'Cách Sử Dụng Thiết Kế Lịch Trình Văn Hóa',
    say: 'Để tạo lịch trình du lịch tại trang này: trước tiên bạn chọn Điểm đến, Ngày khởi hành, Thời lượng và Ngân sách ở bảng bên trái. Tiếp theo hãy chạm chọn các thẻ Sở thích văn hóa hoặc ẩm thực, rồi bấm nút Tạo lịch trình màu vàng để hệ thống sắp xếp cung đường tối ưu theo từng khung giờ.',
    tip: 'Lịch trình có kèm dự báo thời tiết thực tế để bạn chủ động sắp xếp trang phục và điểm đến.',
  },
  'screen.food': {
    title: 'Cách Sử Dụng Trang Ẩm Thực & Trải Nghiệm',
    say: 'Để tìm quán ngon quanh di sản: đầu tiên bạn chạm chọn một khu di sản ở thanh trên cùng hoặc bấm nút định vị GPS. Sau đó bạn dùng bộ lọc Nhà hàng, Cà phê, khoảng cách hoặc gõ mong muốn vào ô Gợi ý phù hợp để tìm địa điểm ưng ý.',
    tip: 'Bạn có thể bấm nút "+ So sánh" trên tối đa 3 quán để đặt lên bàn cân đối chiếu trực tiếp.',
  },
  'screen.crafts': {
    title: 'Cách Sử Dụng Trang Làng Nghề & Nghệ Thuật Cổ Truyền',
    say: 'Tại trang này, bạn hãy bấm hai nút lớn phía trên để chuyển đổi giữa Làng nghề thủ công và Nghệ thuật âm nhạc cổ truyền. Khi chạm vào một thẻ làng nghề bất kỳ, hồ sơ chi tiết sẽ mở ra bên dưới để bạn xem các bước chế tác của nghệ nhân và bản đồ chỉ đường.',
    tip: 'Bấm nút "Đề xuất mới" nếu bạn muốn đóng góp thêm làng nghề truyền thống của quê hương mình.',
  },
  'screen.quiz': {
    title: 'Cách Sử Dụng Trang Học Tập, Đố Vui Quiz & Lịch Sử',
    say: 'Để sử dụng trang Học tập, bạn hãy nhìn lên thanh 3 chế độ ở đầu trang: chọn "Thử thách Quiz" rồi bấm vào một chủ đề để trả lời câu hỏi trắc nghiệm nhận điểm XP; chọn "Dòng thời gian" để tra cứu các triều đại; hoặc chọn "Di sản Xưa & Nay" để kéo thanh trượt so sánh ảnh lịch sử.',
    tip: 'Hoàn thành các bài Quiz sẽ giúp bạn tích lũy điểm XP và mở khóa danh hiệu văn hóa mới.',
  },
  'screen.community': {
    title: 'Cách Sử Dụng Trang Cộng Đồng Đóng Góp Di Sản',
    say: 'Tại trang Cộng đồng, bạn có thể cuộn xem các bài viết, hình ảnh di tích do thành viên chia sẻ, bấm thả tim hoặc viết bình luận trao đổi. Nếu muốn đăng bài mới, bạn hãy bấm vào nút màu vàng "Gửi đóng góp mới" ở góc trên để mở phiếu chia sẻ tư liệu.',
    tip: 'Mọi tư liệu đóng góp đều được ghi nhận tên tác giả và nguồn tham khảo rõ ràng.',
  },
  'screen.favorites': {
    title: 'Cách Sử Dụng Trang Bộ Sưu Tập Yêu Thích',
    say: 'Trang này lưu giữ mọi địa danh và lịch trình bạn đã đánh dấu. Bạn hãy bấm vào 3 nút chuyển đổi ở đầu trang để lọc xem riêng danh sách Di sản yêu thích, Lịch trình đã lưu hoặc Ký ức văn hóa, rồi chạm vào thẻ bất kỳ để mở lại thông tin chi tiết.',
    tip: 'Bấm biểu tượng trái tim trên bất kỳ thẻ di sản nào để thêm nhanh vào bộ sưu tập này.',
  },
  'screen.profile': {
    title: 'Cách Sử Dụng Trang Hồ Sơ & Bảng Danh Hiệu',
    say: 'Để sử dụng trang Hồ sơ cá nhân, bạn hãy bấm vào 4 thẻ điều hướng ở thanh trên cùng: chọn "Bảng danh hiệu" để xem các huy hiệu văn hóa đã mở khóa, chọn "Hồ sơ" để đổi ảnh đại diện, chọn "Hoạt động" để xem lịch sử nhận điểm XP, hoặc chọn "Bảo mật" để đổi mật khẩu.',
    tip: 'Bấm vào từng huy hiệu chưa mở khóa để biết nhiệm vụ cần hoàn thành tiếp theo.',
  },
  'screen.admin': {
    title: 'Cách Sử Dụng Trung Tâm Quản Trị Hệ Thống (Admin)',
    say: 'Đây là bảng điều khiển dành riêng cho quản trị viên để duyệt bài đóng góp cộng đồng, cập nhật dữ liệu di sản và quản lý tài khoản. Bạn hãy chọn từng phân mục quản trị để kiểm duyệt và lưu thay đổi.',
  },

  // ==========================================================================
  // 2. THANH ĐIỀU HƯỚNG TRÊN CÙNG (NAVBAR) & THANH DƯỚI ĐÁY (MOBILE BOTTOM NAV)
  // ==========================================================================
  'nav.logo': {
    title: 'Biểu Tượng Hồn Đất Việt (Về Trang Chủ)',
    say: 'Nút biểu tượng này giúp bạn quay về màn hình Trang chủ ngay lập tức từ bất kỳ đâu trong ứng dụng. Bạn chỉ cần chạm nhẹ vào logo là trang chủ sẽ hiện ra.',
    tip: 'Dùng khi bạn muốn về lại màn hình tổng quan nhanh nhất.',
    order: 1,
    tab: 'home',
  },
  'nav.home': {
    title: 'Tab Khám Phá Trang Chủ',
    say: 'Nút này đưa bạn về màn hình Khám phá chính của Hồn Đất Việt, nơi tập hợp bản đồ thu nhỏ, bộ lọc di sản 3 miền và các điểm đến nổi bật. Hãy chạm vào đây khi bạn muốn bắt đầu hành trình mới.',
    order: 2,
    tab: 'home',
  },
  'nav.recognize': {
    title: 'Tab Nhận Diện Ảnh Di Sản AI',
    say: 'Chạm vào nút này để mở ống kính nhận diện di sản bằng hình ảnh. Bạn có thể chụp trực tiếp kiến trúc, cổ vật, trang phục truyền thống hoặc tải ảnh từ máy lên để xem hồ sơ lịch sử chi tiết.',
    tip: 'Có sẵn 6 ảnh mẫu để bạn bấm thử nghiệm ngay chỉ với một chạm.',
    order: 9,
    tab: 'recognize',
  },
  'nav.story': {
    title: 'Tab Kể Chuyện Di Sản',
    say: 'Nút này mở phòng nghe kể chuyện văn hóa với giọng đọc truyền cảm. Sau khi bấm vào, bạn chọn một di sản và phong cách nghe phù hợp với lứa tuổi để thưởng thức câu chuyện lịch sử.',
    order: 11,
    tab: 'story',
  },
  'nav.map': {
    title: 'Tab Bản Đồ Di Sản 34 Tỉnh Thành',
    say: 'Nút này mở bản đồ tương tác toàn màn hình của 34 tỉnh thành và quần đảo Việt Nam. Hãy chạm vào đây để phóng to từng vùng, chọn tỉnh thành và nghe mình thuyết minh trực tiếp trên bản đồ.',
    order: 3,
    tab: 'map',
  },
  'nav.itinerary': {
    title: 'Tab Lập Lịch Trình Thông Minh',
    say: 'Chạm vào nút này để mở công cụ thiết kế lịch trình tham quan văn hóa tự động. Bạn chỉ cần chọn tỉnh thành, số ngày đi và sở thích, hệ thống sẽ sắp xếp thứ tự điểm đến hợp lý nhất.',
    order: 13,
    tab: 'itinerary',
  },
  'nav.quiz': {
    title: 'Tab Học Tập, Quiz & Dòng Thời Gian Lịch Sử',
    say: 'Chạm vào nút này để mở góc học tập lịch sử tương tác với 3 chế độ: Đố vui Quiz nhận điểm XP, Dòng thời gian 4.000 năm văn hiến và So sánh ảnh Di sản Xưa & Nay.',
    tab: 'quiz',
  },
  'nav.profile': {
    title: 'Tab Hồ Sơ & Bảng Danh Hiệu Văn Hóa',
    say: 'Chạm vào nút này để mở trang Hồ sơ cá nhân, theo dõi điểm XP tích lũy, xem bộ sưu tập huy hiệu văn hóa và lịch sử khám phá của bạn.',
    tab: 'profile',
  },
  'nav.community': {
    title: 'Tab Cộng Đồng Di Sản Việt Nam',
    say: 'Chạm vào nút này để vào không gian Cộng đồng, nơi bạn cùng mọi người chia sẻ hình ảnh, câu chuyện di tích và gửi bài đóng góp văn hóa mới.',
    tab: 'community',
  },
  'nav.more': {
    title: 'Menu Mở Rộng Các Tiện Ích Văn Hóa',
    say: 'Nút này mở bảng menu chứa toàn bộ các chuyên mục sâu hơn như Ẩm thực quanh di sản, Làng nghề cổ truyền, Thử thách Quiz, Cộng đồng và Cài đặt ngôn ngữ. Hãy chạm vào để chọn tính năng bạn muốn khám phá.',
    tip: 'Trên điện thoại, nút Thêm ở góc dưới bên phải giúp bạn truy cập mọi tính năng chỉ bằng một ngón cái.',
  },
  'nav.language': {
    title: 'Chuyển Đổi Ngôn Ngữ Hiển Thị (VN / EN)',
    say: 'Menu chọn ngôn ngữ này cho phép bạn chuyển đổi nhanh ngôn ngữ hiển thị toàn bộ ứng dụng giữa Tiếng Việt (VN) và Tiếng Anh (EN).',
    tip: 'Rất hữu ích khi bạn giới thiệu di sản Việt Nam cho bạn bè quốc tế.',
  },
  'nav.favorites': {
    title: 'Mở Danh Sách Yêu Thích Đã Lưu',
    say: 'Chạm vào biểu tượng trái tim này để mở nhanh kho lưu trữ các di sản và lịch trình bạn đã đánh dấu yêu thích. Con số màu vàng cho biết số lượng di sản bạn đang lưu.',
  },
  'nav.user': {
    title: 'Tài Khoản, Điểm XP & Huy Hiệu Cá Nhân',
    say: 'Nút này mở trang hồ sơ cá nhân hoặc cửa sổ đăng nhập thành viên. Tại đó bạn có thể xem số điểm XP văn hóa đã tích lũy, mở khóa huy hiệu và quản lý lịch sử khám phá của mình.',
  },
  'nav.admin': {
    title: 'Nút Quản Trị Hệ Thống (Admin)',
    say: 'Nút này dành cho Quản trị viên để mở bảng kiểm duyệt bài đóng góp cộng đồng, chỉnh sửa thông tin di sản và quản lý người dùng.',
  },

  // ==========================================================================
  // 3. MÀN HÌNH TRANG CHỦ (HERO, BỘ LỌC DI SẢN 3 MIỀN, CẨM NANG)
  // ==========================================================================
  'home.heroExplore': {
    title: 'Nút Bắt Đầu Khám Phá Kho Tàng Di Sản',
    say: 'Khi bấm vào nút này, màn hình sẽ tự động cuộn mượt xuống khu vực danh sách di sản văn hóa Việt Nam để bạn bắt đầu tra cứu. Hãy chạm vào để xem ngay các di tích nổi tiếng nhé.',
    tip: 'Bạn cũng có thể mở nhanh ống kính nhận diện ảnh hoặc phòng kể chuyện ở các nút bên cạnh.',
  },
  'home.heroRecognize': {
    title: 'Mở Nhanh Ống Kính Nhận Diện Ảnh',
    say: 'Nút tắt này đưa bạn thẳng tới màn hình chụp và nhận diện di sản bằng hình ảnh. Hãy bấm vào đây nếu bạn đang đứng trước một công trình cổ hoặc muốn tra cứu nhanh một bức ảnh.',
  },
  'home.heroStory': {
    title: 'Mở Nhanh Phòng Nghe Kể Chuyện',
    say: 'Chạm vào nút này để chuyển ngay sang phòng nghe kể chuyện lịch sử và huyền tích Việt Nam bằng giọng đọc truyền cảm.',
  },
  'home.toolsDashboard': {
    title: 'Bảng Điều Khiển Công Cụ Văn Hóa Thông Minh',
    say: 'Khu vực này quy tụ 7 công cụ đặc sắc nhất của Hồn Đất Việt như Nhận diện ảnh, Kể chuyện đa đối tượng, Bản đồ số, Lập lịch trình và Đố vui Quiz. Bạn hãy chạm vào bất kỳ thẻ nào để mở trực tiếp công cụ đó.',
  },
  'home.openFullscreenMap': {
    title: 'Mở Bản Đồ Di Sản Toàn Màn Hình',
    say: 'Nút màu vàng này giúp bạn phóng rộng bản đồ tương tác ra toàn bộ màn hình điện thoại hoặc máy tính. Hãy bấm vào đây để có không gian quan sát 34 tỉnh thành và biển đảo rộng rãi, dễ thao tác bằng một tay.',
    tip: 'Ở chế độ toàn màn hình, bạn có thêm thanh kéo thông tin di sản 3 nấc rất tiện lợi.',
  },
  'home.heritageSearch': {
    title: 'Ô Tìm Kiếm & Bộ Lọc Di Sản Ba Miền',
    say: 'Khu vực này giúp bạn tìm nhanh bất kỳ di tích, hoàng thành, chùa cổ hay danh thắng nào trên khắp Việt Nam. Bạn hãy gõ từ khóa vào ô tìm kiếm, chọn vùng miền hoặc bấm nút định vị GPS để lọc các di sản gần bạn nhất.',
    tip: 'Bạn có thể kết hợp lọc theo Tỉnh thành và Loại hình di sản như Hoàng thành, Đền chùa hay Làng nghề.',
  },
  'home.gpsNearby': {
    title: 'Tìm Di Sản Gần Vị Trí GPS Của Bạn',
    say: 'Khi bấm vào nút này, ứng dụng sẽ xác định tọa độ hiện tại của bạn và tự động sắp xếp các di sản từ gần đến xa kèm số ki-lô-mét cụ thể. Hãy chạm vào để biết xung quanh mình có di tích lịch sử nào đáng ghé thăm nhé.',
    tip: 'Nếu trình duyệt chưa cấp quyền vị trí, bạn vẫn có thể chọn nhanh tọa độ mẫu Hà Nội, Huế hoặc TP.HCM.',
  },
  'home.regionTabs': {
    title: 'Bộ Lọc Di Sản Theo Ba Miền Bắc - Trung - Nam',
    say: 'Dãy nút này giúp bạn lọc nhanh danh sách di sản theo Miền Bắc, Miền Trung, Miền Nam hoặc xem Tất cả. Hãy chạm vào miền bạn muốn khám phá để danh sách bên dưới cập nhật ngay lập tức.',
  },
  'home.categoryChips': {
    title: 'Lọc Theo Loại Hình Di Sản Văn Hóa',
    say: 'Hàng nút cuộn ngang này phân loại di sản theo từng chủ đề như Hoàng thành, Đền chùa, Phố cổ, Làng nghề hay Biển đảo. Bạn hãy vuốt ngang và chạm vào chủ đề yêu thích để thu hẹp danh sách.',
  },
  'home.handbook': {
    title: 'Cẩm Nang Văn Hóa & Lịch Sử Bốn Ngàn Năm',
    say: 'Góc cẩm nang này tổng hợp những kiến thức cốt lõi về lịch sử dựng nước, kiến trúc cổ và các di sản thế giới tại Việt Nam. Bạn có thể đọc nhanh hoặc bấm vào các nút hành động để làm bài Quiz và xem dòng thời gian lịch sử.',
  },

  // ==========================================================================
  // 4. BẢN ĐỒ DI SẢN (CULTURAL MAP - MOBILE FIRST)
  // ==========================================================================
  'map.search': {
    title: 'Ô Tìm Kiếm Nhanh Tỉnh Thành & Di Sản Trên Bản Đồ',
    say: 'Bạn hãy chạm vào ô này và gõ tên tỉnh thành hoặc tên di sản muốn tìm, ví dụ như Huế, Hà Nội hay Vịnh Hạ Long. Danh sách gợi ý sẽ hiện ra ngay bên dưới; khi bạn bấm chọn một kết quả, bản đồ sẽ tự động bay tới đúng vị trí đó.',
    tip: 'Hỗ trợ tìm kiếm cả tên tỉnh mới sau sáp nhập lẫn tên tỉnh lịch sử quen thuộc.',
    order: 4,
    tab: 'map',
  },
  'map.provinceListBtn': {
    title: 'Nút Mở Danh Sách 34 Tỉnh Thành Phố',
    say: 'Nếu bạn không muốn tìm trên bản đồ, hãy bấm vào nút "34 Tỉnh" này để mở bảng danh sách đầy đủ 34 tỉnh thành phố Việt Nam. Bạn chỉ cần gõ lọc hoặc chạm vào tên tỉnh trong danh sách là bản đồ sẽ phóng tới tỉnh đó ngay.',
    tip: 'Mỗi tỉnh đều hiển thị rõ số lượng điểm di sản văn hóa hiện có.',
    order: 5,
    tab: 'map',
  },
  'map.regionChips': {
    title: 'Thanh Chip Lọc Nhanh Theo Vùng Miền & Biển Đảo',
    say: 'Hàng nút cuộn ngang này giúp bạn chuyển góc nhìn bản đồ về Toàn quốc, Miền Bắc, Miền Trung, Miền Nam hoặc vùng Biển đảo. Hãy vuốt ngang và chạm vào một vùng, bản đồ sẽ tự động căn chỉnh khung hình vừa vặn với vùng đó.',
    tip: 'Chọn chip "Biển đảo" để làm nổi bật các tỉnh ven biển cùng hai quần đảo Hoàng Sa và Trường Sa.',
    order: 6,
    tab: 'map',
  },
  'map.zoomControls': {
    title: 'Cụm Nút Phóng To, Thu Nhỏ & Về Toàn Quốc',
    say: 'Các nút nằm gọn ở cạnh phải trong tầm ngón cái giúp bạn phóng to (+), thu nhỏ (-), quay về toàn cảnh chữ S Việt Nam hoặc định vị GPS bằng một tay. Khi phóng to sâu hơn, các cụm số sẽ tự tách thành từng ghim di sản chi tiết.',
    tip: 'Bấm nút mũi tên xoay tròn bất kỳ lúc nào để đưa bản đồ về lại góc nhìn toàn quốc ban đầu.',
    order: 7,
    tab: 'map',
  },
  'map.legend': {
    title: 'Nút (i) Mở Bảng Chú Giải & Đổi Nền Bản Đồ',
    say: 'Chạm vào nút chữ (i) này để xem ý nghĩa của các ký hiệu chấm tròn tỉnh thành, cụm di sản và dấu sao chủ quyền trên bản đồ. Tại đây bạn cũng có thể chuyển đổi qua lại giữa nền Chữ S Hoàng gia, nền Vệ tinh hoặc nền Giao thông.',
    tip: 'Chạm ra ngoài vùng tối hoặc bấm nút X để đóng bảng chú giải.',
  },
  'map.bottomSheet': {
    title: 'Khay Thông Tin Di Sản Kéo 3 Nấc (Bottom Sheet)',
    say: 'Khay thông tin dưới đáy màn hình có tay nắm để bạn vuốt lên hoặc vuốt xuống theo 3 mức: thu gọn, mở nửa màn hình xem danh sách di sản, và mở toàn màn hình xem chi tiết. Hãy chạm vào một di sản trong danh sách để xem lịch sử, giờ mở cửa và nghe thuyết minh nhé.',
    tip: 'Bạn cũng có thể chạm trực tiếp vào thanh tiêu đề của khay để chuyển nhanh giữa 3 nấc độ cao.',
    order: 8,
    tab: 'map',
  },

  // ==========================================================================
  // 5. NHẬN DIỆN DI SẢN QUA ẢNH (IMAGE RECOGNIZER)
  // ==========================================================================
  'recognize.samples': {
    title: 'Bộ Ảnh Mẫu Di Sản Thử Nghiệm Một Chạm',
    say: 'Nếu bạn chưa có sẵn ảnh chụp, hãy chạm vào một trong các bức ảnh mẫu ở hàng này như Chùa Một Cột, Ngọ Môn Huế hay Trống đồng Đông Sơn. Hệ thống sẽ lập tức chạy phân tích mẫu để bạn trải nghiệm cách hoạt động.',
    tip: 'Rất tiện để kiểm tra nhanh tốc độ phân tích hình ảnh của ứng dụng.',
  },
  'recognize.modeSwitch': {
    title: 'Chuyển Đổi Chế Độ Chụp Trực Tiếp Hoặc Tải Tệp Ảnh',
    say: 'Hai nút này giúp bạn chọn cách đưa hình ảnh vào ứng dụng: bấm "Chụp trực tiếp" để mở camera ngay trên màn hình, hoặc bấm "Tải tệp" để chọn ảnh có sẵn trong thư viện điện thoại.',
  },
  'recognize.viewfinder': {
    title: 'Khung Ngắm Camera & Khu Vực Tải Ảnh Di Sản',
    say: 'Đây là khung hiển thị hình ảnh trực tiếp từ camera hoặc vùng chọn tệp ảnh từ thiết bị. Bạn hãy căn chỉnh di tích, hoa văn hoặc cổ vật nằm gọn trong khung ngắm nét đứt màu vàng rồi bấm nút chụp bên dưới.',
    tip: 'Nếu trình duyệt chặn camera trực tiếp, bạn có thể bấm nút "Mở Camera máy" để chụp bằng ứng dụng máy ảnh gốc của điện thoại.',
    order: 10,
    tab: 'recognize',
  },
  'recognize.shutter': {
    title: 'Nút Bấm Chụp & Nhận Diện Ngay Một Chạm',
    say: 'Khi hình ảnh trong khung ngắm đã rõ nét, bạn hãy chạm vào nút màu vàng này để chụp lại. Hệ thống sẽ tự động bắt đầu đối chiếu dữ liệu và hiển thị hồ sơ lịch sử, kiến trúc của di sản ngay bên cạnh.',
  },
  'recognize.noteInput': {
    title: 'Ô Nhập Ghi Chú Bối Cảnh Bổ Sung',
    say: 'Bạn có thể gõ thêm thông tin gợi ý vào ô này, ví dụ như nơi bạn chụp bức ảnh hoặc tên địa phương, để giúp quá trình đối chiếu và nhận diện di sản chính xác hơn.',
  },

  // ==========================================================================
  // 6. KỂ CHUYỆN DI SẢN (STORY PLAYER)
  // ==========================================================================
  'story.heritageSelector': {
    title: 'Danh Sách Chọn Di Sản Để Nghe Kể Chuyện',
    say: 'Khu vực này liệt kê toàn bộ các di sản văn hóa để bạn chọn nghe kể chuyện. Bạn có thể gõ tên di sản vào ô tìm kiếm nhỏ ở góc phải hoặc chạm trực tiếp vào một thẻ di sản bất kỳ để tải câu chuyện mới.',
  },
  'story.audienceModes': {
    title: 'Chọn Phong Cách Kể Theo 5 Nhóm Đối Tượng',
    say: 'Năm nút này thay đổi cách kể chuyện cho phù hợp với từng người nghe: giọng cổ tích ấm áp cho Trẻ em, hào hứng cho Học sinh, phân tích sâu cho Sinh viên, lắng đọng cho Người lớn hoặc bản Tiếng Anh cho Khách quốc tế. Hãy chạm vào một đối tượng để trải nghiệm sự khác biệt nhé.',
    tip: 'Mỗi câu chuyện đều tách bạch rõ phần Chính sử đã xác minh và phần Huyền tích dân gian.',
    order: 12,
    tab: 'story',
  },
  'story.audioPlayer': {
    title: 'Thanh Điều Khiển Giọng Đọc & Tốc Độ Phát',
    say: 'Bạn hãy bấm nút Play hình tròn để bắt đầu nghe giọng đọc câu chuyện di sản, hoặc bấm Tạm dừng và Dừng hẳn khi cần. Ở phía bên phải, bạn có thể chạm vào các mức 0.8x, 1x, 1.2x để điều chỉnh tốc độ đọc chậm hoặc nhanh hơn.',
  },

  // ==========================================================================
  // 7. LẬP LỊCH TRÌNH VĂN HÓA THÔNG MINH (ITINERARY PLANNER)
  // ==========================================================================
  'itinerary.form': {
    title: 'Bảng Thiết Lập Điểm Đến, Ngày Đi & Sở Thích',
    say: 'Tại bảng này, bạn lần lượt chọn Điểm đến, Ngày khởi hành, Thời lượng chuyến đi, Người đồng hành và Ngân sách dự kiến. Đừng quên chạm vào các thẻ Sở thích bên dưới như Di tích cung đình hay Ẩm thực địa phương để lịch trình sát với mong muốn của bạn nhất.',
    order: 14,
    tab: 'itinerary',
  },
  'itinerary.weatherCard': {
    title: 'Thẻ Dự Báo Thời Tiết Thực Tế Tại Điểm Đến',
    say: 'Thẻ này hiển thị nhiệt độ, độ ẩm và tình trạng thời tiết tại thành phố bạn chọn trong những ngày sắp tới. Bạn có thể dựa vào thông tin này để chọn khung giờ tham quan ngoài trời hoặc trong nhà cho hợp lý.',
  },
  'itinerary.generateBtn': {
    title: 'Nút Tạo Lịch Trình Tối Ưu Tự Động',
    say: 'Sau khi chọn xong thông tin chuyến đi, bạn hãy bấm vào nút màu vàng này. Hệ thống sẽ tính toán cung đường di chuyển ngắn nhất, kết hợp giờ mở cửa di tích và quán ăn để lập thành bảng lịch trình chi tiết từng giờ cho bạn.',
    tip: 'Sau khi tạo xong, bạn có thể bấm nút "Lưu lịch trình này" để xem lại trong mục Yêu thích.',
  },

  // ==========================================================================
  // 8. ẨM THỰC & TRẢI NGHIỆM QUANH DI SẢN (FOOD & ENTERTAINMENT)
  // ==========================================================================
  'food.heritagePicker': {
    title: 'Chọn Khu Vực Di Sản Cần Tìm Quán Ngon',
    say: 'Hàng nút này giúp bạn chọn di sản làm tâm điểm để tìm các nhà hàng, quán cà phê và điểm vui chơi xung quanh. Bạn cũng có thể bấm nút màu xanh "Chọn di sản gần GPS của tôi" để tự động tìm quanh vị trí hiện tại.',
  },
  'food.personalMatcher': {
    title: 'Gợi Ý Địa Điểm "Phù Hợp Với Tôi"',
    say: 'Bạn hãy gõ mong muốn cụ thể vào ô này, ví dụ như "quán yên tĩnh, giá bình dân, có món bún bò chuẩn vị", rồi bấm nút Đề xuất. Hệ thống sẽ lọc và giải thích rõ vì sao từng quán phù hợp với yêu cầu của bạn.',
  },
  'food.filters': {
    title: 'Bộ Lọc Loại Hình Quán, Điểm Đánh Giá & Khoảng Cách',
    say: 'Thanh công cụ này cho phép bạn lọc địa điểm theo danh mục như Nhà hàng, Cà phê, Đặc sản, kết hợp lọc theo mức sao đánh giá và bán kính từ 1 đến 5 ki-lô-mét. Bạn cũng có thể tích chọn "Chỉ quán đang mở cửa" để tránh đến nơi quán nghỉ.',
    tip: 'Bấm nút "+ So sánh" trên các thẻ quán để đối chiếu giá cả và ưu nhược điểm của tối đa 3 quán.',
  },

  // ==========================================================================
  // 9. LÀNG NGHỀ & NGHỆ THUẬT CỔ TRUYỀN (CRAFTS & ARTS)
  // ==========================================================================
  'crafts.tabSwitcher': {
    title: 'Chuyển Đổi Giữa Làng Nghề Thủ Công & Nghệ Thuật Cổ Truyền',
    say: 'Hai nút lớn này giúp bạn chuyển qua lại giữa danh mục các Làng nghề thủ công truyền thống như Gốm Bát Tràng, Tranh Đông Hồ và các Di sản nghệ thuật âm nhạc như Nhã nhạc cung đình Huế, Dân ca Quan họ.',
  },
  'crafts.proposeBtn': {
    title: 'Đề Xuất Thêm Làng Nghề Hoặc Nghệ Thuật Mới',
    say: 'Nếu quê hương bạn có một làng nghề truyền thống hay loại hình diễn xướng dân gian đặc sắc, hãy bấm nút này để mở biểu mẫu gửi thông tin đóng góp vào kho dữ liệu văn hóa.',
  },
  'crafts.itemsGrid': {
    title: 'Danh Sách Các Làng Nghề & Di Sản Nghệ Thuật',
    say: 'Chạm vào bất kỳ thẻ làng nghề hoặc nghệ thuật nào trong lưới này để mở hồ sơ chi tiết bên dưới, bao gồm lịch sử hình thành, các bước chế tác thủ công và địa chỉ tham quan thực tế.',
  },

  // ==========================================================================
  // 10. HỌC TẬP, QUIZ & DÒNG THỜI GIAN (HERITAGE LEARNING)
  // ==========================================================================
  'quiz.tabSwitcher': {
    title: 'Chuyển Đổi 3 Chế Độ Học Tập Lịch Sử Tương Tác',
    say: 'Thanh chuyển đổi này gồm 3 phần: "Thử thách Quiz" để trả lời câu hỏi trắc nghiệm nhận điểm XP, "Dòng thời gian lịch sử" để theo dõi các triều đại Việt Nam, và "Di sản Xưa & Nay" để so sánh hình ảnh tư liệu lịch sử với hiện tại.',
  },
  'quiz.topicSelector': {
    title: 'Chọn Chủ Đề Bộ Câu Hỏi Đố Vui Di Sản',
    say: 'Bạn hãy chạm vào một chủ đề như Cố đô Huế hay Ngàn năm Thăng Long - Hà Nội để bắt đầu bài trắc nghiệm mới. Mỗi câu trả lời đều có lời giải thích lịch sử và ý nghĩa văn hóa chi tiết ngay bên dưới.',
  },

  // ==========================================================================
  // 11. CỘNG ĐỒNG ĐÓNG GÓP (COMMUNITY CONTRIBUTION)
  // ==========================================================================
  'community.openFormBtn': {
    title: 'Nút Mở Phiếu Đóng Góp Tư Liệu Văn Hóa Mới',
    say: 'Chạm vào nút màu vàng này để mở biểu mẫu gửi câu chuyện dân gian, món ăn gia truyền hoặc bức ảnh di tích của bạn lên hệ thống. Sau khi điền thông tin và bấm gửi, bài viết sẽ xuất hiện trong bảng tin cộng đồng.',
  },
  'community.feed': {
    title: 'Bảng Tin Các Tư Liệu Đóng Góp Từ Cộng Đồng',
    say: 'Khu vực này hiển thị các bài viết, hình ảnh và tư liệu văn hóa do cộng đồng chia sẻ. Bạn có thể bấm nút Yêu thích hình trái tim để cổ vũ tác giả hoặc bấm nút Bình luận để cùng trò chuyện, trao đổi thêm.',
  },

  // ==========================================================================
  // 12. YÊU THÍCH & HỒ SƠ CÁ NHÂN (FAVORITES & PROFILE)
  // ==========================================================================
  'favorites.sectionTabs': {
    title: 'Chuyển Đổi Giữa Di Sản, Lịch Trình & Ký Ức Đã Lưu',
    say: 'Ba nút này giúp bạn lọc xem riêng danh sách các Di sản yêu thích, các Lịch trình du lịch đã tạo hoặc các bản ghi Ký ức văn hóa. Hãy chạm vào từng thẻ để quản lý bộ sưu tập cá nhân của bạn.',
  },
  'profile.subTabs': {
    title: 'Thanh Chuyển Đổi Danh Hiệu, Hồ Sơ, Hoạt Động & Bảo Mật',
    say: 'Thanh điều hướng này giúp bạn chuyển nhanh giữa 4 mục: xem bộ sưu tập Bảng danh hiệu văn hóa, cập nhật thông tin Hồ sơ cá nhân, tra cứu Nhật ký hoạt động tích điểm XP và cài đặt Bảo mật mật khẩu.',
  },
};

/**
 * Tra cứu nội dung hướng dẫn theo `guideId`.
 * Nếu một phần tử có gắn `data-guide-id` nhưng chưa có mục tương ứng trong `GUIDE_CONTENT`,
 * hàm này sẽ cảnh báo nhẹ trong console (chỉ ở môi trường DEV) và trả về lời giải thích
 * mặc định thân thiện dựa trên nhãn của phần tử, đảm bảo ứng dụng không bao giờ bị lỗi.
 */
export function getGuideContentOrFallback(
  guideId: string,
  element?: HTMLElement | null
): GuideContentEntry {
  const existing = GUIDE_CONTENT[guideId];
  if (existing) {
    return existing;
  }

  if (import.meta.env.DEV) {
    console.warn(
      `[HDV 3D Guide] Phần tử có data-guide-id="${guideId}" chưa được khai báo trong src/guideContent.ts. Đang dùng lời thoại dự phòng.`
    );
  }

  const label =
    element?.getAttribute('aria-label')?.trim() ||
    element?.getAttribute('title')?.trim() ||
    element?.textContent?.replace(/\s+/g, ' ').trim().slice(0, 60) ||
    'Tính năng giao diện';

  return {
    title: label.length > 48 ? `${label.slice(0, 48)}…` : label,
    say: `Đây là mục "${label}". Bạn có thể chạm hoặc bấm vào phần này để thực hiện thao tác tương ứng trên màn hình.`,
    tip: 'Bạn có thể mở menu của HDV 3D để chuyển đổi chế độ hướng dẫn bất kỳ lúc nào.',
  };
}

/**
 * Trả về danh sách các bước dùng cho tính năng "Tham quan app" tự động,
 * được sắp xếp tăng dần theo thuộc tính `order`.
 */
export function getOrderedAppTourSteps(): Array<{ guideId: string; entry: GuideContentEntry }> {
  return Object.entries(GUIDE_CONTENT)
    .filter(([, entry]) => typeof entry.order === 'number')
    .sort((a, b) => (a[1].order ?? 999) - (b[1].order ?? 999))
    .map(([guideId, entry]) => ({ guideId, entry }));
}
