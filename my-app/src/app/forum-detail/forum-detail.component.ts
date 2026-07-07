import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { BlogService, BlogPost } from '../forum/blog.service';
import { ImgUrlPipe } from '../img-url.pipe';

@Component({
  selector: 'app-forum-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, ImgUrlPipe],
  templateUrl: './forum-detail.component.html',
  styleUrls: ['./forum-detail.component.css']
})
export class ForumDetailComponent implements OnInit {
  post = signal<BlogPost | undefined>(undefined);

  constructor(
    private route: ActivatedRoute,
    private blogService: BlogService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.blogService.fetchPostById(id).subscribe({
          next: post => this.post.set(post),
          error: () => this.post.set(undefined)
        });
      }
    });
  }
}
