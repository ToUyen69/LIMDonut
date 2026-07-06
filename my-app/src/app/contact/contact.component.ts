import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ContactService } from '../contact.service';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.css'
})
export class ContactComponent {
  private contactService = inject(ContactService);

  formData = {
    fullName: '',
    email: '',
    phone: '',
    branch: '',
    subject: 'Khen ngợi',
    message: ''
  };

  sending = signal(false);

  branches = [
    'Chi nhánh 1: 107-B9 P. Tô Hiệu, Nghĩa Tân, Cầu Giấy, Hà Nội',
    'Chi nhánh 2: 44 P. Thợ Nhuộm, Cửa Nam, Hoàn Kiếm, Hà Nội'
  ];

  // FAQ — nội dung lấy đúng theo chính sách/con số đang áp dụng trong hệ thống
  faqs: { question: string; answer: string; open: boolean }[] = [
    {
      question: 'Cửa hàng mở cửa lúc mấy giờ?',
      answer: 'LỊM DONUT mở cửa từ 10:00 đến 22:00 hằng ngày ở cả 2 chi nhánh (Tô Hiệu - Cầu Giấy và Thợ Nhuộm - Hoàn Kiếm). Bánh được nướng mới mỗi ngày nên tới sớm sẽ có nhiều vị nhất nhé!',
      open: false
    },
    {
      question: 'Phí giao hàng tính như thế nào?',
      answer: 'Phí ship tính theo khoảng cách và giá trị đơn: trong 5km là 20.000đ (đơn từ 500.000đ chỉ còn 10.000đ, đơn trên 2 triệu miễn phí); 5-10km là 30.000đ (đơn trên 2 triệu còn 10.000đ); 10-15km là 40.000đ (đơn trên 2 triệu còn 20.000đ). Ngoài 15km cửa hàng chưa nhận giao.',
      open: false
    },
    {
      question: 'Khi nào tôi phải đặt cọc?',
      answer: 'Đơn dưới 500.000đ không cần cọc. Đơn từ 500.000đ đến dưới 1 triệu cọc 30%, từ 1 đến dưới 2 triệu cọc 40%, từ 2 triệu trở lên cọc 50%. Đơn Custom Party luôn phải đặt cọc theo cùng mức trên.',
      open: false
    },
    {
      question: 'Tôi có thể hủy đơn không? Có được hoàn cọc không?',
      answer: 'Đơn thường chỉ hủy được khi còn ở trạng thái "Đã đặt" (cửa hàng chưa xác nhận). Đơn Custom Party hủy được tới trước mốc khóa hủy (12-24h trước giờ nhận tùy bậc). Lưu ý: tiền cọc sẽ KHÔNG được hoàn khi bạn chủ động hủy đơn.',
      open: false
    },
    {
      question: 'Nhận hàng bị lỗi (thiếu bánh, sai vị, móp vỡ) thì làm sao?',
      answer: 'Bạn vào trang "Đơn hàng", bấm nút "Báo lỗi đơn" trong vòng 2 giờ kể từ khi nhận hàng, chọn lý do và đính kèm ảnh chụp sản phẩm lỗi. Quá 2 giờ hệ thống sẽ không nhận khiếu nại nữa theo chính sách dịch vụ.',
      open: false
    },
    {
      question: 'Lịm Star là gì và dùng như thế nào?',
      answer: 'Mỗi đơn hoàn thành bạn được cộng Lịm Star theo giá trị đơn (1.000đ = 100 Star). Đơn Custom Party được x2, đơn hoàn thành trong tháng sinh nhật của bạn được x3. Khi thanh toán, Star trừ thẳng vào tiền đơn (1 Star = 1đ), tối đa 30% giá trị tạm tính của đơn.',
      open: false
    },
    {
      question: 'Custom Party cần đặt trước bao lâu?',
      answer: 'Party S (12 bánh) đặt trước tối thiểu 1 ngày, Party M (24 bánh) trước 2 ngày, Party L (36 bánh) trước 3 ngày. Party L được báo giá riêng 1-1 và không giới hạn lựa chọn hình dáng/vị/sốt/topping.',
      open: false
    },
    {
      question: 'Có ưu đãi gì khi giới thiệu bạn bè không?',
      answer: 'Có! Mỗi tài khoản có một mã giới thiệu riêng (xem trong trang Hồ sơ). Khi bạn bè đăng ký bằng mã của bạn, bạn được cộng ngay 5.000 Star, còn bạn của bạn được giảm 15% cho đơn hàng đầu tiên.',
      open: false
    }
  ];

  toggleFaq(index: number) {
    this.faqs[index].open = !this.faqs[index].open;
  }

  submitForm() {
    this.sending.set(true);
    this.contactService.send(this.formData).subscribe({
      next: () => {
        this.sending.set(false);
        alert('Cảm ơn bạn đã gửi phản hồi! Chúng tôi sẽ liên hệ lại sớm nhất.');
        this.formData = {
          fullName: '',
          email: '',
          phone: '',
          branch: '',
          subject: 'Khen ngợi',
          message: ''
        };
      },
      error: (err) => {
        this.sending.set(false);
        alert('Gửi phản hồi thất bại: ' + (err.error?.message || err.message || 'Lỗi server'));
      }
    });
  }
}
