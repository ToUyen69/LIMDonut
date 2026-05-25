import { Injectable } from '@angular/core';

export interface BlogPost {
  id: string;
  title: string;
  date: string;
  mainImage: string;
  detailImages: string[];
  content: string;
  excerpt: string;
  tags: string[];
}

@Injectable({
  providedIn: 'root'
})
export class BlogService {
  private posts: BlogPost[] = [
    {
      id: 'august-menu',
      title: 'AUGUST MENU - KHỞI ĐẦU MÙA THU NGỌT NGÀO',
      date: '26.08.2025',
      mainImage: 'blog_august-menu.jpg',
      detailImages: ['blog_august-menu-1.jpg'],
      content: 'Tháng 8 ùa về mang theo cả một rổ hương vị mới từ LỊM. Những chiếc donut được nướng mới mỗi sáng, chờ bạn ghé lấy một chiếc thật ngon để bắt đầu tháng mới thật trọn vẹn.\n\nTừ vị ngọt thanh quen thuộc đến những công thức "lạ mà ghiền" – tháng này Lịm mang đến nhiều điều bất ngờ lắm đó.\n\nĐừng để tháng 8 trôi qua mà chưa thử hết menu nhé. Lịm luôn ở đây, nướng bánh chờ bạn.',
      excerpt: 'Tháng 8 ùa về mang theo cả một rổ hương vị mới từ LỊM – những chiếc donut nướng mới mỗi sáng chờ bạn ghé thử ngay!',
      tags: ['#LimDonut', '#MenuThang8', '#DonutMoiNgay', '#ThangTamNayAnGi', '#NuongMoiSang']
    },
    {
      id: 'khung-gio-hoat-dong',
      title: 'KHUNG GIỜ HOẠT ĐỘNG & HỆ THỐNG CỬA HÀNG',
      date: '15.08.2025',
      mainImage: 'blog_khung-giờ-hđ.jpg',
      detailImages: ['blog_khung-giờ-hđ-1.jpg', 'blog_khung-giờ-hđ-2.jpg'],
      content: 'Bạn đang thắc mắc Lịm mở cửa lúc mấy giờ? Để Lịm nhắc nhỏ một chút nha.\n\nLịm hoạt động từ 10:00 – 22:00 mỗi ngày, kể cả cuối tuần – vì Lịm biết cơn thèm donut không bao giờ hỏi trước.\n\nGhé sớm để chọn được những chiếc bánh còn tươi nhất, hoặc đặt online để Lịm mang đến tận tay bạn nhé. Dù giờ nào, Lịm cũng sẵn sàng!',
      excerpt: 'Lịm mở cửa từ 10:00 – 22:00 mỗi ngày kể cả cuối tuần – vì cơn thèm donut không bao giờ hỏi trước!',
      tags: ['#LimDonut', '#GioMoCua', '#DonutMoiNgay', '#DatHangOnline', '#LimLuonSanSang']
    },
    {
      id: 'october-menu',
      title: 'OCTOBER MENU - LỄ HỘI HƯƠNG VỊ',
      date: '01.10.2025',
      mainImage: 'blog_october-menu.jpg',
      detailImages: ['blog_october-1-menu.jpg'],
      content: 'Thu về rồi, trời se se lạnh – và LỊM cũng vừa ra menu mới để bạn có thêm lý do ngồi lại thật lâu.\n\nNhững hương vị tháng 10 được Lịm chọn lọc kỹ càng: vừa đủ ngọt, vừa đủ ấm, vừa đủ để bạn muốn chia sẻ với một người mình thương.\n\nTháng 10 này, hãy để LỊM là phần ngon nhất trong ngày của bạn nhé!',
      excerpt: 'Thu về, LỊM ra menu mới với những hương vị vừa đủ ngọt vừa đủ ấm – để tháng 10 của bạn thêm phần trọn vẹn!',
      tags: ['#LimDonut', '#MenuThang10', '#ThuVeRoi', '#DonutMuaThu', '#HuongViThang10']
    },
    {
      id: 'cruller-series',
      title: 'DÒNG BÁNH CRULLER - NGHỆ THUẬT VỎ BÁNH GIÒN TAN',
      date: '20.09.2025',
      mainImage: 'blog_new-flavor.jpg',
      detailImages: ['blog_new-flavor-1.jpg'],
      content: 'LỊM vừa ra lò một công thức hoàn toàn mới – và chúng tôi không thể chờ thêm để chia sẻ với bạn nữa rồi!\n\nMột hương vị chưa ai nghĩ đến, một kết hợp bất ngờ khiến miếng đầu tiên là nhớ mãi – đó chính là cách Lịm làm bánh.\n\nSố lượng có hạn mỗi ngày – đặt sớm bạn nhé, kẻo hết rồi lại tiếc!',
      excerpt: 'LỊM vừa ra lò công thức mới hoàn toàn – một kết hợp bất ngờ khiến miếng đầu tiên là nhớ mãi. Số lượng có hạn!',
      tags: ['#LimDonut', '#NewFlavor', '#HuongViMoi', '#LimRaLo', '#ThuNgayKhongTiec']
    },
    {
      id: 'lim-locket',
      title: 'L!M LOCKET - QUÀ TẶNG KỶ NIỆM NGỌT NGÀO',
      date: '10.09.2025',
      mainImage: 'blog_locket.jpg',
      detailImages: ['blog_locket-1.jpg'],
      content: 'Không biết tặng gì? Tặng Lịm đi. LỊM Locket là hộp donut được đóng gói xinh xắn, sẵn sàng trở thành món quà ý nghĩa nhất trong ngày đặc biệt của ai đó.\n\nMỗi chiếc bánh bên trong đều được làm thủ công, nướng mới trong ngày – bởi vì quà của bạn xứng đáng được trao đi khi còn thơm nhất.\n\nĐặt Lịm Locket ngay hôm nay – giao tận tay, đẹp từ hộp đến miếng cuối cùng.',
      excerpt: 'Không biết tặng gì? LỊM Locket – hộp donut thủ công xinh xắn, đẹp từ hộp đến miếng cuối cùng – là câu trả lời!',
      tags: ['#LimDonut', '#LimLocket', '#QuaNgotNgao', '#HopDonut', '#TangNguoiThuong']
    },
    {
      id: 'huong-vi-viet-nam',
      title: 'HƯƠNG VỊ VIỆT NAM - DI SẢN TRONG TỪNG CHIẾC BÁNH',
      date: '02.09.2025',
      mainImage: 'blog_vietnam.jpg',
      detailImages: ['blog_vietnam-1.jpg'],
      content: 'LỊM sinh ra ở Việt Nam, lớn lên cùng người Việt Nam và mỗi chiếc donut đều mang theo một chút hồn của mảnh đất này.\n\nTừ những nguyên liệu quen thuộc đến những công thức sáng tạo, Lịm luôn muốn tạo ra thứ gì đó vừa mới lạ vừa gần gũi – để bạn cầm lên là thấy ấm lòng liền.\n\nTự hào là thương hiệu donut Việt – Lịm sẽ tiếp tục nướng bánh, ngày này qua ngày khác, chỉ để phục vụ bạn thôi!',
      excerpt: 'LỊM sinh ra ở Việt Nam, lớn lên cùng người Việt mỗi chiếc donut đều mang theo một chút hồn của mảnh đất này.',
      tags: ['#LimDonut', '#DonutVietNam', '#ThuongHieuViet', '#MadeInVietnam', '#LimTuHaoLam']
    },
    {
      id: 'delivery-service',
      title: 'DỊCH VỤ DELIVERY - NGỌT NGÀO TẬN CỬA',
      date: '25.08.2025',
      mainImage: 'blog_delivery.jpg',
      detailImages: ['blog_delivery-1.jpg'],
      content: 'Không cần ra đường, không cần chờ lâu LỊM đã có mặt trên các ứng dụng giao hàng để phục vụ bạn tận nơi.\n\nDù bạn đang ở nhà làm việc, đang chill cuối tuần hay chỉ đơn giản là không muốn đi ra ngoài – Lịm vẫn đến được.\n\nĐặt ngay, chờ một chút – và mở hộp ra là thơm liền. Donut tươi, giao nhanh, yêu bạn lắm!',
      excerpt: 'Không cần ra đường LỊM đã có mặt trên app giao hàng, mang donut tươi mới đến tận tay bạn chỉ trong tích tắc!',
      tags: ['#LimDonut', '#LimGiaoHang', '#OpenDelivery', '#DonutTanNha', '#DatHangNgay']
    },
    {
      id: 'pride-bite',
      title: 'PRIDE BITE - LAN TỎA SỰ TỰ TIN VÀ YÊU THƯƠNG',
      date: '15.06.2025',
      mainImage: 'blog_pride-donut.jpg',
      detailImages: ['blog_pride-donut-1.jpg'],
      content: 'Yêu thương không có giới hạn và donut của Lịm cũng vậy. Bộ sưu tập Pride Donuts ra đời để cùng bạn tôn vinh điều đẹp đẽ nhất: được là chính mình.\n\nMỗi chiếc bánh là một màu sắc, mỗi màu sắc là một câu chuyện. Cầm trên tay chiếc donut rainbow, bạn không chỉ ăn bánh – bạn đang nói "Tôi ở đây, và tôi tự hào về điều đó".\n\nHãy để Lịm đồng hành cùng bạn trong những ngày tháng rực rỡ nhất nhé!',
      excerpt: 'Pride Bite bộ sưu tập donut cầu vồng tôn vinh sự đa dạng và lan toả thông điệp: hãy tự hào được là chính mình.',
      tags: ['#LimDonut', '#PrideDonuts', '#Rainbow', '#YeuThuongKhongGioiHan', '#BeSelf']
    },
    {
      id: 'mochi-don-thu',
      title: 'MOCHI ĐÓN THU - DẺO DAI VỊ TRĂNG TRÒN',
      date: '01.09.2025',
      mainImage: 'blog_mochi-đón-thu.jpg',
      detailImages: ['blog_mochi-đón-thu-1.jpg'],
      content: 'Thu về, Lịm ra mắt dòng Mochi Donut mới dẻo mềm, thơm dịu, tan ngay khi chạm đầu lưỡi.\n\nCái lạnh đầu mùa làm người ta muốn ăn gì đó vừa mềm vừa ấm – và Mochi Đón Thu của Lịm sinh ra đúng để lấp đầy khoảng trống đó.\n\nGhé Lịm trong những ngày thu này, chọn một chiếc Mochi, ngồi xuống và tận hưởng. Đơn giản vậy thôi mà hạnh phúc lắm bạn ơi.',
      excerpt: 'Mochi Đón Thu dẻo mềm, thơm dịu, tan ngay khi chạm đầu lưỡi. Món quà ngọt ngào LỊM gửi tặng mùa thu này.',
      tags: ['#LimDonut', '#MochiDonut', '#DonThu', '#MuaThu', '#MochiDonThu']
    },
    {
      id: 'its-her-day',
      title: 'IT\'S HER DAY - TÔN VINH PHÁI ĐẸP',
      date: '20.10.2025',
      mainImage: 'blog_her-day.jpg',
      detailImages: ['blog_her-day-1.jpg'],
      content: 'Hôm nay là ngày của những người phụ nữ tuyệt vời nhất thế giới và bạn chính là một trong số đó.\n\nLỊM muốn gửi đến bạn một chiếc donut thật ngon, thật đẹp – như một lời nhắc nhỏ rằng: bạn xứng đáng được yêu thương, được chiều chuộng, và được ăn ngon mỗi ngày.\n\nHãy tự thưởng cho mình hôm nay nhé. Bạn làm được nhiều lắm rồi đó.',
      excerpt: 'Hôm nay là ngày của bạn. LỊM muốn nhắc nhỏ: bạn xứng đáng được yêu thương và được ăn ngon mỗi ngày!',
      tags: ['#LimDonut', '#HerDay', '#NgayPhuNu', '#TuThuongBanThan', '#LimYeuBan']
    },
    {
      id: 'november-menu',
      title: 'NOVEMBER MENU - ẤM ÁP NHỮNG NGÀY ĐÔNG CHỚM',
      date: '01.11.2025',
      mainImage: 'blog_november-menu.jpg',
      detailImages: ['blog_november-menu-1.jpg'],
      content: 'Tháng 11 ùa đến mang theo gió lạnh và những buổi chiều muốn ở nhà mãi. Lịm cũng vừa cập nhật menu mới để bạn có thêm lý do nhâm nhi một mình hoặc rủ thêm người thương.\n\nNhững hương vị tháng 11 ấm áp, ngọt dịu vừa đủ để bạn cảm thấy được quan tâm giữa tiết trời se lạnh này.\n\nĐặt ngay hoặc ghé Lịm để cùng Lịm chào tháng 11 thật ngon nhé!',
      excerpt: 'Tháng 11 lạnh rồi LỊM ra menu mới với những hương vị ấm áp, ngọt dịu để sưởi ấm những buổi chiều đông chớm.',
      tags: ['#LimDonut', '#MenuThang11', '#November', '#LanhRoiAnDonutThoi', '#LimThang11']
    },
    {
      id: 'valentine-series',
      title: 'VALENTINE SERIES - GÓI TRỌN YÊU THƯƠNG',
      date: '14.02.2025',
      mainImage: 'blog_valentine.jpg',
      detailImages: ['blog_valentine-1.jpg', 'blog_valentine-2.jpg'],
      content: 'Tình yêu ngọt ngào nhất không cần lời nói nhiều chỉ cần một hộp donut từ LỊM là đủ rồi.\n\nDù bạn đang muốn tặng người ấy, tặng bạn bè, hay đơn giản tự tặng bản thân vì "yêu mình trước đã" Lịm đều có một chiếc donut đúng nghĩa dành cho bạn.\n\nValentine này, hãy để vị ngọt đầu tiên trong ngày là từ LỊM nhé. Yêu bạn nhiều lắm.',
      excerpt: 'Tình yêu ngọt ngào nhất không cần lời nói nhiều chỉ cần một hộp donut LỊM gửi đến người bạn thương.',
      tags: ['#LimDonut', '#Valentine', '#LoveIsSweet', '#TangNguoiThuong', '#DonutTinhYeu']
    },
    {
      id: 'april-menu',
      title: 'APRIL MENU - SỰ TRỖI DẬY CỦA HƯƠNG VỊ TƯƠI MỚI',
      date: '01.04.2025',
      mainImage: 'blog_april-menu.jpg',
      detailImages: ['blog_april-menu-1.jpg'],
      content: 'Tháng 4 mang theo nắng ấm và những điều mới mẻ LỊM cũng không ngoại lệ khi ra mắt menu tháng 4 với những hương vị tươi sáng, nhẹ nhàng như chính mùa xuân.\n\nMỗi chiếc donut tháng này đều được Lịm nướng với cả sự chăm chút và yêu thương – bởi vì tháng 4 xứng đáng được bắt đầu thật ngon lành.\n\nGhé Lịm hoặc đặt online để thử ngay menu mới nhé. Lịm đang chờ bạn đó!',
      excerpt: 'Tháng 4 xuân về LỊM ra menu mới với hương vị tươi sáng, nhẹ nhàng như chính mùa xuân đang gõ cửa.',
      tags: ['#LimDonut', '#MenuThang4', '#April', '#XuanVe', '#DonutMuaXuan']
    }
  ];

  constructor() { }

  getPosts(): BlogPost[] {
    return this.posts;
  }

  getPostById(id: string): BlogPost | undefined {
    return this.posts.find(p => p.id === id);
  }
}