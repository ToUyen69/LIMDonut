import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const adminGuard: CanActivateFn = () => {
  const token = sessionStorage.getItem('admin_token');
  if (token) return true;
  inject(Router).navigate(['/login']);
  return false;
};
