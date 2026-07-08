import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Branch, BRANCHES_DATA } from '../branches.data';
import { haversineDistanceKm } from '../pricing.util';

@Component({
  selector: 'app-branches',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './branches.component.html',
  styleUrls: ['./branches.component.css']
})
export class BranchesComponent {
  branches: Branch[] = JSON.parse(JSON.stringify(BRANCHES_DATA));
  selectedBranch: Branch;
  locationError = signal('');
  locationSuccess = signal(false);

  constructor(private sanitizer: DomSanitizer) {
    this.branches.forEach(branch => {
      branch.safeMapUrl = this.sanitizer.bypassSecurityTrustResourceUrl(branch.mapUrl);
    });
    this.selectedBranch = this.branches[0];

    // Check if geolocation was already stored in sessionStorage
    try {
      const stored = sessionStorage.getItem('userGeoLocation');
      if (stored) {
        const coords = JSON.parse(stored);
        this.calculateDistances(coords.lat, coords.lng);
      }
    } catch (_) {}
  }

  selectBranch(branch: Branch) {
    this.selectedBranch = branch;
  }

  detectLocation() {
    this.locationError.set('');
    this.locationSuccess.set(false);

    if (!navigator.geolocation) {
      this.locationError.set('Trình duyệt của bạn không hỗ trợ định vị.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        
        // Save to sessionStorage
        try {
          sessionStorage.setItem('userGeoLocation', JSON.stringify({ lat, lng }));
        } catch (_) {}

        this.calculateDistances(lat, lng);
        this.locationSuccess.set(true);
      },
      (error) => {
        console.error('Geolocation error:', error);
        this.locationError.set('Không lấy được vị trí. Bạn hãy xem danh sách chi nhánh bên dưới nhé.');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  private calculateDistances(lat: number, lng: number) {
    let nearestBranch = this.branches[0];
    let minDistance = Infinity;

    this.branches.forEach(branch => {
      const dist = haversineDistanceKm(lat, lng, branch.lat, branch.lng);
      branch.distance = dist;
      if (dist < minDistance) {
        minDistance = dist;
        nearestBranch = branch;
      }
    });

    // Sort branches by distance
    this.branches.sort((a, b) => (a.distance || 0) - (b.distance || 0));
    this.selectedBranch = nearestBranch;
  }

  getDirectionsUrl(branch: Branch): string {
    return `https://www.google.com/maps/dir/?api=1&destination=${branch.lat},${branch.lng}`;
  }
}
