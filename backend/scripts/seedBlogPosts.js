require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const BlogPost = require('../models/BlogPost');

const posts = [
  {
    id: 'august-menu',
    title: 'AUGUST MENU - KHỞI ĐẦU MÙA THU NGỌT NGÀO',
    date: '26.08.2025',
    mainImage: 'blog_august-menu.jpg',
    detailImages: ['blog_august-menu-1.jpg'],
    content: 'Tháng 8 ùa về mang theo những đợt gió heo may dịu mát đầu mùa và cả một rổ hương vị mới ngập tràn niềm vui từ LỊM. Những chiếc donut được các nghệ nhân của Lịm nướng mới mỗi sáng sớm, lớp vỏ bánh vàng ươm thơm lừng mùi bơ sữa luôn sẵn sàng chờ bạn ghé lấy một chiếc thật ngon để bắt đầu một ngày mới ngập tràn năng lượng và cảm xúc.\n\nTừ vị ngọt thanh của những trái cây mùa thu quen thuộc cho tới các công thức fusion độc đáo đầy sáng tạo "lạ mà ghiền" – tháng này Lịm mang đến cho bạn nhiều sự lựa chọn bất ngờ chưa từng có. Chúng tôi tin rằng mỗi hương vị không chỉ là một món ăn, mà còn là một câu chuyện riêng mang dấu ấn của những buổi sáng Hà Nội thanh bình.\n\nĐừng để những ngày tháng 8 trôi qua một cách tẻ nhạt mà chưa thử hết thực đơn đặc biệt này nhé. Lịm luôn ở đây, đốt lò nướng bánh nóng hổi mỗi ngày để đón chào bạn ghé thăm chi nhánh và cùng nhau thưởng thức những chiếc bánh tuyệt hảo nhất!',
    excerpt: 'Tháng 8 ùa về mang theo cả một rổ hương vị mới từ LỊM – những chiếc donut nướng mới mỗi sáng chờ bạn ghé thử ngay!',
    tags: ['#LimDonut', '#MenuThang8', '#DonutMoiNgay', '#ThangTamNayAnGi', '#NuongMoiSang']
  },
  {
    id: 'khung-gio-hoat-dong',
    title: 'KHUNG GIỜ HOẠT ĐỘNG & HỆ THỐNG CỬA HÀNG',
    date: '15.08.2025',
    mainImage: 'blog_khung-giờ-hđ.jpg',
    detailImages: ['blog_khung-giờ-hđ-1.jpg', 'blog_khung-giờ-hđ-2.jpg'],
    content: 'Bạn đang tìm kiếm địa chỉ cửa hàng hoặc thắc móc Lịm mở cửa đón khách lúc mấy giờ hàng ngày? Để Lịm nhắc nhỏ và hướng dẫn chi tiết một chút cho bạn tiện ghé qua nhé. Hiện tại, cả hai chi nhánh của Lịm tại Tô Hiệu và Thợ Nhuộm đều hoạt động liên tục từ 10:00 sáng đến 22:00 tối mỗi ngày, kể cả ngày cuối tuần lẫn các dịp lễ tết.\n\nLịm hiểu rằng những cơn thèm bánh ngọt đột ngột hay những buổi hẹn hò ngẫu hứng của bạn không bao giờ hẹn trước. Đó là lý do tại sao đội ngũ nhân viên cửa hàng luôn chuẩn bị chu đáo từ khâu sắp đặt bàn ghế, quầy bánh cho đến pha chế những tách trà thanh mát để đón bạn trong suốt khung giờ hoạt động này.\n\nNếu muốn lựa chọn những hương vị bánh đặc biệt nhất hoặc mua số lượng lớn làm quà tặng, bạn nên ghé qua sớm vào đầu giờ chiều khi bánh vừa ra lò mẻ tiếp theo. Hoặc đơn giản hơn, bạn có thể sử dụng dịch vụ đặt online ngay trên website để Lịm đóng gói và ship đến tận tay bạn nhanh chóng. Dù ở bất kỳ thời điểm nào trong ngày, Lịm cũng luôn sẵn sàng phục vụ!',
    excerpt: 'Lịm mở cửa từ 10:00 – 22:00 mỗi ngày kể cả cuối tuần – vì cơn thèm donut không bao giờ hỏi trước!',
    tags: ['#LimDonut', '#GioMoCua', '#DonutMoiNgay', '#DatHangOnline', '#LimLuonSanSang']
  },
  {
    id: 'october-menu',
    title: 'OCTOBER MENU - LỄ HỘI HƯƠNG VỊ',
    date: '01.10.2025',
    mainImage: 'blog_october-menu.jpg',
    detailImages: ['blog_october-1-menu.jpg'],
    content: 'Mùa thu Hà Nội đã thực sự chạm ngõ với những buổi chiều se lạnh đặc trưng, tiếng lá rụng xào xạc trên những con phố cổ. Đây chính là thời điểm hoàn hảo nhất trong năm để LỊM gửi đến bạn bộ sưu tập thực đơn tháng 10 – một lễ hội hương vị mùa thu ấm áp để bạn có thêm lý do ngồi lại trò chuyện thật lâu cùng những người thân yêu.\n\nNhững chiếc donut tháng này được Lịm tinh tuyển và phát triển dựa trên cảm hứng về sự ấm áp. Chúng tôi kết hợp các nguyên liệu truyền thống như hạt dẻ bùi bùi, mật ong ngọt lịm cùng các loại trà gừng, quế cay nhẹ để tạo ra những mẻ bánh nướng vừa đủ ngọt, vừa đủ nồng ấm, xoa dịu đi cái hanh hao của những ngày chớm đông.\n\nTháng 10 này, hãy tạm gác lại những bộn bề công việc thường nhật, ghé Lịm chọn một góc ngồi nhỏ bên cửa sổ, thưởng thức chiếc donut thơm phức cùng ly trà ấm. Hãy để LỊM trở thành một phần ngọt ngào và đáng nhớ nhất trong một ngày của bạn nhé!',
    excerpt: 'Thu về, LỊM ra menu mới với những hương vị vừa đủ ngọt vừa đủ ấm – để tháng 10 của bạn thêm phần trọn vẹn!',
    tags: ['#LimDonut', '#MenuThang10', '#ThuVeRoi', '#DonutMuaThu', '#HuongViThang10']
  },
  {
    id: 'cruller-series',
    title: 'DÒNG BÁNH CRULLER - NGHỆ THUẬT VỎ BÁNH GIÒN TAN',
    date: '20.09.2025',
    mainImage: 'blog_new-flavor.jpg',
    detailImages: ['blog_new-flavor-1.jpg'],
    content: 'Nếu bạn đã quá quen thuộc với những chiếc donut tròn truyền thống hay donut dạng bánh mì vòng dai mềm, dòng bánh French Cruller mới toanh của Lịm chắc chắn sẽ làm bạn bất ngờ ngay từ lần cắn thử đầu tiên. Đây là kết quả của nhiều tháng thử nghiệm công thức bột choux nguyên bản từ Pháp để tạo nên lớp vỏ bánh xốp nhẹ, giòn tan ở bên ngoài nhưng vẫn giữ được độ ẩm mềm đặc trưng ở bên trong.\n\nĐiểm đặc biệt của dòng Cruller tại Lịm là lớp men glaze mỏng phủ trên bề mặt bánh được biến tấu đa dạng từ vị trà xanh Uji Matcha thanh đắng, vị dâu tây ngọt mát cho tới lớp sốt caramel muối mặn dịu hấp dẫn. Quy trình tạo hình xoắn ốc độc đáo giúp bánh giữ được độ phồng tối đa và hấp thụ tốt nhất lớp sốt phủ, mang lại sự bùng nổ hương vị đầy thú vị.\n\nDo quy trình chế biến bột bánh choux vô cùng phức tạp và đòi hỏi nhiệt độ nướng chuẩn xác, Lịm chỉ sản xuất một số lượng rất hạn chế bánh Cruller mỗi ngày tại các chi nhánh. Hãy tranh thủ đặt hàng sớm hoặc ghé cửa hàng vào buổi sáng để không bỏ lỡ cơ hội thưởng thức kiệt tác bánh ngọt này nhé!',
    excerpt: 'LỊM vừa ra lò công thức mới hoàn toàn – một kết hợp bất ngờ khiến miếng đầu tiên là nhớ mãi. Số lượng có hạn!',
    tags: ['#LimDonut', '#NewFlavor', '#HuongViMoi', '#LimRaLo', '#ThuNgayKhongTiec']
  },
  {
    id: 'lim-locket',
    title: 'L!M LOCKET - QUÀ TẶNG KỶ NIỆM NGỌT NGÀO',
    date: '10.09.2025',
    mainImage: 'blog_locket.jpg',
    detailImages: ['blog_locket-1.jpg'],
    content: 'Bạn đang băn khoăn tìm kiếm một món quà tặng vừa xinh xắn, vừa độc đáo lại mang đầy sự ngọt ngào để dành tặng bạn bè hoặc người thương trong ngày sinh nhật, ngày kỷ niệm? LỊM Locket chính là câu trả lời trọn vẹn nhất cho bạn. Đây là chiếc hộp quà tặng được thiết kế tỉ mỉ, sang trọng, sẵn sàng chứa đựng những thông điệp yêu thương ý nghĩa nhất.\n\nBên trong mỗi hộp LỊM Locket là những chiếc donut thủ công được lựa chọn kỹ lưỡng theo sở thích của người nhận, trang trí đẹp mắt với các hình vẽ icing đầy nghệ thuật. Tất cả bánh đều được nướng mới tinh ngay trong ngày giao hàng để đảm bảo khi nhận được quà, người thương của bạn sẽ cảm nhận được hương thơm bơ sữa nguyên bản nguyên vẹn nhất.\n\nHộp quà LỊM Locket không chỉ đơn thuần là một hộp bánh ngọt, mà nó còn là chiếc cầu nối gửi trao sự tận tâm và những cảm xúc trân quý nhất từ bạn. Hãy để Lịm đồng hành cùng bạn viết nên những khoảnh khắc kỷ niệm thật lung linh và trọn vẹn nhé!',
    excerpt: 'Không biết tặng gì? LỊM Locket – hộp donut thủ công xinh xắn, đẹp từ hộp đến miếng cuối cùng – là câu trả lời!',
    tags: ['#LimDonut', '#LimLocket', '#QuaNgotNgao', '#HopDonut', '#TangNguoiThuong']
  },
  {
    id: 'huong-vi-viet-nam',
    title: 'HƯƠNG VỊ VIỆT NAM - DI SẢN TRONG TỪNG CHIẾC BÁNH',
    date: '02.09.2025',
    mainImage: 'blog_vietnam.jpg',
    detailImages: ['blog_vietnam-1.jpg'],
    content: 'LỊM tự hào là một thương hiệu donut được sáng lập và phát triển bởi người Việt, dành cho người Việt. Chúng tôi luôn mang trong mình sứ mệnh thổi hồn văn hóa bản địa vào trong những chiếc bánh ngọt phương Tây hiện đại, để mỗi chiếc donut khi cầm trên tay không chỉ ngon miệng mà còn mang lại cảm giác thân thuộc, gần gũi đến kỳ lạ.\n\nChúng tôi không ngừng tìm kiếm và đưa các nguyên liệu thuần Việt cao cấp vào trong công thức làm bánh như: hương thơm dịu mát của cốm vòng Hà Nội, vị bùi thơm của khoai môn, vị béo ngậy của dừa xiêm hay chút đắng nhẹ đậm đà của hạt cà phê Tây Nguyên. Sự kết hợp độc đáo này tạo nên những chiếc bánh donut mang phong cách Fusion vừa mới mẻ, hiện đại lại vừa lưu giữ vẹn nguyên những nét di sản ẩm thực truyền thống Việt Nam.\n\nSự ủng hộ và yêu thích của quý khách hàng chính là động lực to lớn nhất để đội ngũ thợ bánh tại Lịm tiếp tục sáng tạo, đốt lò và trao gửi những chiếc bánh tươi ngon mỗi ngày. Hãy cùng Lịm thưởng thức và tự hào về hương vị Việt Nam nhé!',
    excerpt: 'LỊM sinh ra ở Việt Nam, lớn lên cùng người Việt mỗi chiếc donut đều mang theo một chút hồn của mảnh đất này.',
    tags: ['#LimDonut', '#DonutVietNam', '#ThuongHieuViet', '#MadeInVietnam', '#LimTuHaoLam']
  },
  {
    id: 'delivery-service',
    title: 'DỊCH VỤ DELIVERY - NGỌT NGÀO TẬN CỬA',
    date: '25.08.2025',
    mainImage: 'blog_delivery.jpg',
    detailImages: ['blog_delivery-1.jpg'],
    content: 'Bạn thèm một chiếc donut dâu ngọt lịm hay chiếc bánh chocolate hạnh nhân béo ngậy nhưng ngoài trời lại quá nắng nóng, hoặc công việc văn phòng bận rộn không thể rời bàn làm việc? Đừng lo lắng, dịch vụ giao hàng nhanh chóng (Delivery) của Lịm đã sẵn sàng để mang những khoảnh khắc ngọt ngào đến gõ cửa nhà bạn chỉ trong tích tắc.\n\nLịm hiện đã liên kết toàn diện với các đối tác giao hàng uy tín cũng như sở hữu đội ngũ ship riêng tận tâm. Hộp bánh của bạn sẽ được đóng gói cẩn thiện, bọc lớp chống sốc chuyên dụng để đảm bảo bánh khi đến tay bạn vẫn giữ được hình dáng nguyên vẹn, đẹp mắt như vừa mới lấy ra từ tủ kính tại cửa hàng.\n\nChỉ với vài thao tác click chuột đơn giản trên website LỊM Donut, bạn đã có ngay những mẻ bánh donut tươi ngon nóng hổi sẵn sàng để thưởng thức cùng đồng nghiệp hoặc người thân. Việc của bạn là thư giãn và tận hưởng, giao donut thơm ngon cứ để Lịm lo!',
    excerpt: 'Không cần ra đường LỊM đã có mặt trên app giao hàng, mang donut tươi mới đến tận tay bạn chỉ trong tích tắc!',
    tags: ['#LimDonut', '#LimGiaoHang', '#OpenDelivery', '#DonutTanNha', '#DatHangNgay']
  },
  {
    id: 'pride-bite',
    title: 'PRIDE BITE - LAN TỎA SỰ TỰ TIN VÀ YÊU THƯƠNG',
    date: '15.06.2025',
    mainImage: 'blog_pride-donut.jpg',
    detailImages: ['blog_pride-donut-1.jpg'],
    content: 'Lịm tin rằng tình yêu là không có giới hạn, sự đa dạng là điều tuyệt vời nhất tạo nên vẻ đẹp của cuộc sống này, và mỗi người đều có quyền tự hào về bản ngã của mình. Đó chính là nguồn cảm hứng lớn nhất để bộ sưu tập giới hạn "Pride Bite" ra đời – những chiếc donut sắc màu rực rỡ tượng trưng cho chiếc cờ lục sắc kiêu hãnh của cộng đồng LGBT+.\n\nMỗi chiếc bánh trong bộ sưu tập này được phủ lớp kem icing đa sắc cầu kỳ hoàn toàn bằng tay, trang trí thêm những hạt cốm lấp lánh như lời khẳng định về vẻ đẹp của sự tự do và tình yêu thương. Thưởng thức một chiếc Pride Bite, bạn không chỉ thưởng vị ngọt mát dễ chịu mà còn đang cùng Lịm lan tỏa thông điệp mạnh mẽ về sự tôn trọng và bình đẳng.\n\nHãy để Lịm là người đồng hành đáng yêu, cùng bạn kỷ niệm những ngày tháng rực rỡ nhất của tuổi trẻ, sống thật tự tin và lan tỏa tình yêu thương đến thế giới xung quanh mình nhé!',
    excerpt: 'Pride Bite bộ sưu tập donut cầu vồng tôn vinh sự đa dạng và lan toả thông điệp: hãy tự hào được là chính mình.',
    tags: ['#LimDonut', '#PrideDonuts', '#Rainbow', '#YeuThuongKhongGioiHan', '#BeSelf']
  },
  {
    id: 'mochi-don-thu',
    title: 'MOCHI ĐÓN THU - DẺO DAI VỊ TRĂNG TRÒN',
    date: '01.09.2025',
    mainImage: 'blog_mochi-đón-thu.jpg',
    detailImages: ['blog_mochi-đón-thu-1.jpg'],
    content: 'Khi những đợt gió heo may dịu mát luồn qua từng tán lá rụng phố cổ, Lịm biết rằng mùa thu đã chính thức gõ cửa. Đây cũng là thời điểm thích hợp nhất để chúng tôi giới thiệu đến bạn một siêu phẩm cực kỳ được mong đợi: dòng bánh Mochi Donut "Mochi Đón Thu" với độ dẻo dai nguyên bản đặc trưng đầy cuốn hút.\n\nSự kết hợp hoàn hảo giữa công thức bột nếp Mochi truyền thống Nhật Bản và kỹ thuật nướng donut phương Tây đã tạo nên những vòng bánh tròn múi như những bông hoa cúc mùa thu vàng ươm. Lớp vỏ bánh dai dai mềm dẻo nhè nhẹ quyện cùng lớp kem tươi béo ngậy vị trà ô long hoặc vị hạt dẻ nướng tạo nên một bản hòa tấu hương vị cực kỳ ăn ý.\n\nHãy ghé Lịm vào một buổi chiều thu lộng gió, chọn cho mình một chiếc Mochi Đón Thu, nhâm nhi cùng một tách trà sen ấm áp và ngắm nhìn phố phường chuyển mình. Chắc chắn bạn sẽ thấy mùa thu Hà Nội chưa bao giờ ngọt ngào và yên bình đến thế!',
    excerpt: 'Mochi Đón Thu dẻo mềm, thơm dịu, tan ngay khi chạm đầu lưỡi. Món quà ngọt ngào LỊM gửi tặng mùa thu này.',
    tags: ['#LimDonut', '#MochiDonut', '#DonThu', '#MuaThu', '#MochiDonThu']
  },
  {
    id: 'its-her-day',
    title: "IT'S HER DAY - TÔN VINH PHÁI ĐẸP",
    date: '20.10.2025',
    mainImage: 'blog_her-day.jpg',
    detailImages: ['blog_her-day-1.jpg'],
    content: 'Hôm nay là một ngày vô cùng đặc biệt để tôn vinh một nửa thế giới – những người phụ nữ tuyệt vời, dịu dàng nhưng đầy kiên cường xung quanh chúng ta. Lịm muốn gửi tới bạn một chiếc donut được trang trí lộng lẫy và ngọt ngào nhất, như một lời nhắc nhở dễ thương rằng: bạn luôn xứng đáng được trân trọng, được nâng niu và được chiều chuộng mỗi ngày.\n\nĐội ngũ thợ bánh tại Lịm đã dành trọn vẹn cả ngày để thiết kế những mẫu bánh donut hình trái tim phủ kem dâu hồng pastel xinh xắn, rắc thêm những đóa hoa icing nhỏ xíu tinh tế để dành riêng cho ngày lễ này. Chúng tôi hy vọng mỗi chiếc bánh trao đi sẽ mang lại nụ cười rạng rỡ nhất trên môi các bà, các mẹ, các chị và các bạn gái.\n\nHãy dành thời gian tự thưởng cho bản thân một buổi chiều thư giãn bên người thân yêu, thưởng thức hương vị bánh ngọt ngào và cảm nhận tình yêu lan tỏa xung quanh. Chúc cho phái đẹp luôn rực rỡ và hạnh phúc như những chiếc bánh của Lịm nhé!',
    excerpt: 'Hôm nay là ngày của bạn. LỊM muốn nhắc nhỏ: bạn xứng đáng được yêu thương và được ăn ngon mỗi ngày!',
    tags: ['#LimDonut', '#HerDay', '#NgayPhuNu', '#TuThuongBanThan', '#LimYeuBan']
  },
  {
    id: 'november-menu',
    title: 'NOVEMBER MENU - ẤM ÁP NHỮNG NGÀY ĐÔNG CHỚM',
    date: '01.11.2025',
    mainImage: 'blog_november-menu.jpg',
    detailImages: ['blog_november-menu-1.jpg'],
    content: 'Tháng 11 tràn về mang theo những đợt gió mùa đông bắc đầu tiên lạnh buốt và những buổi chiều chập choạng tối nhanh khiến con người ta chỉ muốn cuộn tròn ấm áp trong góc quán quen thuộc. Hiểu được tâm tư đó của bạn, Lịm đã chính thức cho ra lò thực đơn tháng 11 với những hương vị mang hơi ấm nồng nàn để sưởi ấm những ngày đông chớm lạnh.\n\nCác món bánh chủ đạo của tháng 11 sử dụng nhiều nguyên liệu ấm nóng như sốt sô-cô-la đen gừng, bánh donut phủ kem bơ quế thơm nồng hay donut nhân custard khoai lang tím bùi ngậy. Khi ăn kèm với những ly cà phê sữa nóng hay cốc trà cam quế ấm áp, cái lạnh bên ngoài dường như đều bị xua tan hoàn toàn bởi vị ngọt ngào len lỏi trong từng thớ bánh.\n\nHãy rủ ngay hội bạn thân hoặc người thương ghé Lịm để cùng sưởi ấm những buổi chiều đông chớm lạnh, chia sẻ những câu chuyện vui bên mẻ bánh nóng hổi vừa mới ra lò của chúng tôi nhé!',
    excerpt: 'Tháng 11 lạnh rồi LỊM ra menu mới với những hương vị ấm áp, ngọt dịu để sưởi ấm những buổi chiều đông chớm.',
    tags: ['#LimDonut', '#MenuThang11', '#November', '#LanhRoiAnDonutThoi', '#LimThang11']
  },
  {
    id: 'valentine-series',
    title: 'VALENTINE SERIES - GÓI TRỌN YÊU THƯƠNG',
    date: '14.02.2025',
    mainImage: 'blog_valentine.jpg',
    detailImages: ['blog_valentine-1.jpg', 'blog_valentine-2.jpg'],
    content: 'Ngày lễ Tình nhân Valentine chính là dịp tuyệt vời nhất để bày tỏ những tình cảm giấu kín bấy lâu hoặc hâm nóng lại ngọn lửa tình yêu đôi lứa. Lịm tin rằng đôi khi những lời nói hoa mỹ không thể ngọt ngào và đong đầy yêu thương bằng một hộp bánh donut đặc biệt được chuẩn bị chỉn chu từ LỊM gửi đến tận tay người thương.\n\nBộ sưu tập Valentine Series của Lịm năm nay bao gồm những cặp đôi donut ghép đôi tinh xảo, sử dụng các nguyên liệu lãng mạn như dâu tây đỏ mọng, chocolate đắng ngọt đan xen cùng lớp sốt kem phô mai béo mịn nồng nàn. Dù bạn muốn dành tặng cho người ấy, nhóm bạn thân hay chỉ đơn giản tự thưởng cho bản thân một ngày ngọt ngào, Lịm đều sẵn lòng phục vụ.\n\nValentine này, hãy để Lịm cùng bạn dệt nên câu chuyện tình yêu thật đẹp và ngọt ngào qua từng lớp bánh nướng thơm lừng nhé. Chúc tình yêu của các bạn luôn nồng nàn và ngọt ngào!',
    excerpt: 'Tình yêu ngọt ngào nhất không cần lời nói nhiều chỉ cần một hộp donut LỊM gửi đến người bạn thương.',
    tags: ['#LimDonut', '#Valentine', '#LoveIsSweet', '#TangNguoiThuong', '#DonutTinhYeu']
  },
  {
    id: 'april-menu',
    title: 'APRIL MENU - SỰ TRỖI DẬY CỦA HƯƠNG VỊ TƯƠI MỚI',
    date: '01.04.2025',
    mainImage: 'blog_april-menu.jpg',
    detailImages: ['blog_april-menu-1.jpg'],
    content: 'Tháng 4 gõ cửa mang theo những tia nắng vàng ấm áp rực rỡ và bầu không khí tràn ngập nhựa sống mới của những ngày giao mùa cuối xuân đầu hạ. Lịm cũng bắt kịp nhịp thở tươi mới đó bằng bộ sưu tập thực đơn tháng 4 với những hương vị tươi sáng, nhẹ dịu và thanh mát như chính một buổi sớm mai trong trẻo.\n\nChúng tôi ưu tiên đưa vào thực đơn những chiếc bánh donut sử dụng sốt trái cây thanh mát như sốt chanh leo vàng chua ngọt bùng nổ, kem bơ bạc hạ mát lạnh hay donut vỏ giòn rắc vụn bánh quy dừa nướng. Mỗi mẻ bánh đều được nướng chín tới vừa phải, giữ độ ẩm mượt nhẹ nhàng giúp bạn thưởng thức mà không hề có cảm giác ngấy béo hay nặng bụng.\n\nHãy bắt đầu tháng 4 tràn đầy niềm vui và hứng khởi bằng việc ghé thăm chi nhánh Lịm gần nhất, chọn cho mình một mẻ bánh nướng nóng hổi và cảm nhận hương xuân đọng lại trên từng miếng bánh ngọt ngào nhé!',
    excerpt: 'Tháng 4 xuân về LỊM ra menu mới với hương vị tươi sáng, nhẹ nhàng như chính mùa xuân đang gõ cửa.',
    tags: ['#LimDonut', '#MenuThang4', '#April', '#XuanVe', '#DonutMuaXuan']
  }
];

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);
  for (const p of posts) {
    await BlogPost.findOneAndUpdate({ id: p.id }, p, { upsert: true });
  }
  console.log('Seeded', posts.length, 'blog posts');
  await mongoose.connection.close();
}

seed().catch(err => { console.error(err); process.exit(1); });
