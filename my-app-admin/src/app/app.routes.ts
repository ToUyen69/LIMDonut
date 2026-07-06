import { Routes } from '@angular/router';
import { OrderBoardComponent } from './order-board/order-board.component';
import { ContactMessagesComponent } from './contact-messages/contact-messages.component';
import { ComplaintsComponent } from './complaints/complaints.component';
import { ProductsComponent } from './products/products.component';
import { AdminLoginComponent } from './login/login.component';
import { adminGuard } from './admin.guard';

export const routes: Routes = [
  { path: 'login', component: AdminLoginComponent },
  { path: '', component: OrderBoardComponent, canActivate: [adminGuard] },
  { path: 'contacts', component: ContactMessagesComponent, canActivate: [adminGuard] },
  { path: 'complaints', component: ComplaintsComponent, canActivate: [adminGuard] },
  { path: 'products', component: ProductsComponent, canActivate: [adminGuard] },
];
