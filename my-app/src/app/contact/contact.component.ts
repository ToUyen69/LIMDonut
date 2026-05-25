import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.css'
})
export class ContactComponent {
  formData = {
    fullName: '',
    email: '',
    phone: '',
    branch: '',
    subject: 'Khen ngợi',
    message: ''
  };

  branches = [
    'Chi nhánh 1: 107-B9 P. Tô Hiệu, Nghĩa Tân, Cầu Giấy, Hà Nội',
    'Chi nhánh 2: 44 P. Thợ Nhuộm, Cửa Nam, Hoàn Kiếm, Hà Nội'
  ];

  submitForm() {
    console.log('Form Submitted:', this.formData);
    alert('Cảm ơn bạn đã gửi phản hồi! Chúng tôi sẽ liên hệ lại sớm nhất.');
    // Reset form
    this.formData = {
      fullName: '',
      email: '',
      phone: '',
      branch: '',
      subject: 'Khen ngợi',
      message: ''
    };
  }
}
