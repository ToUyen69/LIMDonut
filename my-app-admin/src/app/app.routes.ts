import { Routes } from '@angular/router';
import { OrderBoardComponent } from './order-board/order-board.component';
import { ContactMessagesComponent } from './contact-messages/contact-messages.component';
import { ComplaintsComponent } from './complaints/complaints.component';
import { ProductsComponent } from './products/products.component';
import { AdminLoginComponent } from './login/login.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { VouchersComponent } from './vouchers/vouchers.component';
import { BlogComponent } from './blog/blog.component';
import { CustomersComponent } from './customers/customers.component';
import { BranchesComponent } from './branches/branches.component';
import { adminGuard } from './admin.guard';

export const routes: Routes = [
  { path: 'login', component: AdminLoginComponent },
  { path: '', component: DashboardComponent, canActivate: [adminGuard] },
  { path: 'orders', component: OrderBoardComponent, canActivate: [adminGuard] },
  { path: 'contacts', component: ContactMessagesComponent, canActivate: [adminGuard] },
  { path: 'complaints', component: ComplaintsComponent, canActivate: [adminGuard] },
  { path: 'products', component: ProductsComponent, canActivate: [adminGuard] },
  { path: 'vouchers', component: VouchersComponent, canActivate: [adminGuard] },
  { path: 'blog', component: BlogComponent, canActivate: [adminGuard] },
  { path: 'customers', component: CustomersComponent, canActivate: [adminGuard] },
  { path: 'branches', component: BranchesComponent, canActivate: [adminGuard] },
];
