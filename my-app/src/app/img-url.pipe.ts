import { Pipe, PipeTransform } from '@angular/core';
import { environment } from '../environments/environment';

@Pipe({ name: 'imgUrl', standalone: true })
export class ImgUrlPipe implements PipeTransform {
  transform(value: string | undefined): string {
    if (!value) return '';
    if (value.startsWith('http://') || value.startsWith('https://') || value.startsWith('assets/')) {
      return value;
    }
    if (value.startsWith('uploads/')) {
      return `${environment.apiBase}/${value}`;
    }
    return `${environment.apiBase}/uploads/${value}`;
  }
}
