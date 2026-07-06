import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BranchesService, Branch } from './branches.service';

@Component({
  selector: 'app-branches',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './branches.component.html',
  styleUrl: './branches.component.css'
})
export class BranchesComponent implements OnInit {
  service = inject(BranchesService);
  showForm = signal(false);
  editing = signal<Branch | null>(null);
  form: Partial<Branch> = this.emptyForm();

  ngOnInit() { this.service.fetchAll(); }

  emptyForm(): Partial<Branch> {
    return { name: '', address: '', phone: '', openHours: '10:00 - 22:00', active: true };
  }

  openNew() { this.form = this.emptyForm(); this.editing.set(null); this.showForm.set(true); }

  openEdit(b: Branch) { this.form = { ...b }; this.editing.set(b); this.showForm.set(true); }

  close() { this.showForm.set(false); this.editing.set(null); }

  save() {
    if (!this.form.name?.trim() || !this.form.address?.trim()) { alert('Nhập tên và địa chỉ.'); return; }
    const obs = this.editing()
      ? this.service.update(this.editing()!._id!, this.form)
      : this.service.create(this.form);
    obs.subscribe({
      next: () => { this.close(); this.service.fetchAll(); },
      error: err => alert(err.error?.message || 'Lỗi')
    });
  }

  remove(b: Branch) {
    if (!confirm(`Xoá chi nhánh "${b.name}"?`)) return;
    this.service.remove(b._id!).subscribe({
      next: () => this.service.fetchAll(),
      error: err => alert(err.error?.message || 'Lỗi')
    });
  }
}
