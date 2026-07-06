import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { BlogService, BlogPost } from './blog.service';
import { ImgUrlPipe } from '../img-url.pipe';

@Component({
  selector: 'app-forum',
  standalone: true,
  imports: [CommonModule, RouterModule, ImgUrlPipe],
  templateUrl: './forum.component.html',
  styleUrls: ['./forum.component.css']
})
export class ForumComponent implements OnInit {
  allPosts: BlogPost[] = [];
  pagedPosts: BlogPost[] = [];
  currentPage = 1;
  pageSize = 8;
  totalPages = 1;
  pages: number[] = [];

  private blogService = inject(BlogService);
  private cdr = inject(ChangeDetectorRef);

  ngOnInit(): void {
    this.blogService.fetchPosts().subscribe({
      next: posts => {
        this.allPosts = posts;
        this.totalPages = Math.ceil(this.allPosts.length / this.pageSize);
        this.pages = Array.from({ length: this.totalPages }, (_, i) => i + 1);
        this.setPage(1);
        this.cdr.detectChanges();
      },
      error: () => { this.allPosts = []; }
    });
  }

  setPage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    const startIndex = (page - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.pagedPosts = this.allPosts.slice(startIndex, endIndex);
    window.scrollTo({ top: 400, behavior: 'smooth' });
  }
}
