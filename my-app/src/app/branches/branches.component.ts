import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

interface Branch {
  id: number;
  name: string;
  address: string;
  phone: string;
  image: string;
  mapUrl: string;
  safeMapUrl?: SafeResourceUrl;
}

@Component({
  selector: 'app-branches',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './branches.component.html',
  styleUrls: ['./branches.component.css']
})
export class BranchesComponent {
  branches: Branch[] = [
    {
      id: 1,
      name: 'Chi nhánh Tô Hiệu',
      address: '107-B9 P. Tô Hiệu, Nghĩa Tân, Cầu Giấy, Hà Nội',
      phone: '0999.888.777',
      image: 'chinhanh1.jpg',
      mapUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3723.7528117047605!2d105.7959545!3d21.042574400000003!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3135ab0029a3e6bd%3A0x266455f5d6e2d774!2sL%25E1%25BB%258AM%2520Donuts%2520Hanoi%25202!5e0!3m2!1sen!2s!4v1778781807352!5m2!1sen!2s'
    },
    {
      id: 2,
      name: 'Chi nhánh Thợ Nhuộm',
      address: '44 P. Thợ Nhuộm, Cửa Nam, Hoàn Kiếm, Hà Nội',
      phone: '0999.888.777',
      image: 'chinhanh2.jpg',
      mapUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3724.162600299627!2d105.8451822!3d21.026179!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3135ab0062e8c8a9%3A0x168a3a2ad72217c4!2zTOG7ik0gRE9OVVRTIC0gVEjhu6IgTkhV4buYTQ!5e0!3m2!1sen!2s!4v1778781757824!5m2!1sen!2s'
    }
  ];

  selectedBranch: Branch;

  constructor(private sanitizer: DomSanitizer) {
    // Sanitize all map URLs
    this.branches.forEach(branch => {
      branch.safeMapUrl = this.sanitizer.bypassSecurityTrustResourceUrl(branch.mapUrl);
    });
    this.selectedBranch = this.branches[0];
  }

  selectBranch(branch: Branch) {
    this.selectedBranch = branch;
  }
}
