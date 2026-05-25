import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { BlogService, BlogPost } from './blog.service';

@Component({
  selector: 'app-forum',
  standalone: true,
  imports: [CommonModule, RouterModule],
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

  constructor(private blogService: BlogService) {}

  ngOnInit(): void {
    this.allPosts = this.blogService.getPosts();
    this.totalPages = Math.ceil(this.allPosts.length / this.pageSize);
    this.pages = Array.from({ length: this.totalPages }, (_, i) => i + 1);
    this.setPage(1);
  }

  setPage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    const startIndex = (page - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.pagedPosts = this.allPosts.slice(startIndex, endIndex);
    
    // Scroll to top of content area when changing page
    window.scrollTo({ top: 400, behavior: 'smooth' });
  }
}
