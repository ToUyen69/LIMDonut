import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BlogService, BlogPost } from './blog.service';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-blog',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './blog.component.html',
  styleUrl: './blog.component.css'
})
export class BlogComponent implements OnInit {
  service = inject(BlogService);
  imageBase = environment.apiBase + '/';

  showForm = signal(false);
  editing = signal<BlogPost | null>(null);
  uploading = signal(false);
  searchTerm = '';
  pageSize = 8;
  currentPage = 1;

  form: Partial<BlogPost> = this.emptyForm();

  ngOnInit() { this.service.fetchAll(); }

  emptyForm(): Partial<BlogPost> {
    return { id: '', title: '', date: '', mainImage: '', detailImages: [], content: '', excerpt: '', tags: [] };
  }

  get filteredPosts(): BlogPost[] {
    const term = this.searchTerm.trim().toLowerCase();
    if (!term) return this.service.posts();
    return this.service.posts().filter(p => p.title.toLowerCase().includes(term));
  }

  get totalPages(): number { return Math.ceil(this.filteredPosts.length / this.pageSize); }
  get pagesArray(): number[] { return Array.from({ length: this.totalPages }, (_, i) => i + 1); }
  get pagedPosts(): BlogPost[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredPosts.slice(start, start + this.pageSize);
  }

  openNew() { this.form = this.emptyForm(); this.editing.set(null); this.showForm.set(true); }
  openEdit(post: BlogPost) { this.form = JSON.parse(JSON.stringify(post)); this.editing.set(post); this.showForm.set(true); }
  close() { this.showForm.set(false); this.editing.set(null); }

  onMainImage(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    this.uploading.set(true);
    this.service.uploadImage(file).subscribe({
      next: res => { this.form.mainImage = res.url; this.uploading.set(false); },
      error: () => { alert('Lỗi upload'); this.uploading.set(false); }
    });
  }

  onDetailImage(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    this.uploading.set(true);
    this.service.uploadImage(file).subscribe({
      next: res => { this.form.detailImages!.push(res.url); this.uploading.set(false); },
      error: () => { alert('Lỗi upload'); this.uploading.set(false); }
    });
  }

  removeDetailImage(i: number) { this.form.detailImages!.splice(i, 1); }

  get tagsString(): string { return this.form.tags?.join(', ') || ''; }
  set tagsString(v: string) { this.form.tags = v.split(',').map(t => t.trim()).filter(Boolean); }

  save() {
    if (!this.form.title?.trim()) { alert('Thiếu tiêu đề.'); return; }
    const obs = this.editing()
      ? this.service.update(this.editing()!.id, this.form)
      : this.service.create(this.form);
    obs.subscribe({
      next: () => { this.close(); this.service.fetchAll(); },
      error: err => alert(err.error?.message || 'Lỗi')
    });
  }

  remove(post: BlogPost) {
    if (!confirm(`Xoá bài "${post.title}"?`)) return;
    this.service.remove(post.id).subscribe({
      next: () => this.service.fetchAll(),
      error: err => alert(err.error?.message || 'Lỗi')
    });
  }
}
