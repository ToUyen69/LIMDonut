import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'imgUrl', standalone: true })
export class ImgUrlPipe implements PipeTransform {
  transform(value: string | undefined): string {
    if (!value) return '';
    if (value.startsWith('http://') || value.startsWith('https://') || value.startsWith('assets/')) {
      return value;
    }
    return value.replace(/^uploads\//, '');
  }
}
