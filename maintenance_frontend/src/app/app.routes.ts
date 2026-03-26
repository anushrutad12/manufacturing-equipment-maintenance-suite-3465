import { Routes } from '@angular/router';
import { authGuard } from './core/auth/auth.guard';

import { LoginPageComponent } from './pages/login/login-page.component';
import { DashboardLayoutComponent } from './shell/dashboard-layout/dashboard-layout.component';
import { EquipmentPageComponent } from './pages/equipment/equipment-page.component';
import { ReadingsPageComponent } from './pages/readings/readings-page.component';
import { AlertsPageComponent } from './pages/alerts/alerts-page.component';
import { WorkOrdersPageComponent } from './pages/work-orders/work-orders-page.component';
import { PartsPageComponent } from './pages/parts/parts-page.component';
import { ReportsPageComponent } from './pages/reports/reports-page.component';

export const routes: Routes = [
  { path: 'login', component: LoginPageComponent },
  {
    path: '',
    component: DashboardLayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'equipment' },
      { path: 'equipment', component: EquipmentPageComponent },
      { path: 'readings', component: ReadingsPageComponent },
      { path: 'alerts', component: AlertsPageComponent },
      { path: 'work-orders', component: WorkOrdersPageComponent },
      { path: 'parts', component: PartsPageComponent },
      { path: 'reports', component: ReportsPageComponent },
    ],
  },
  { path: '**', redirectTo: '' },
];
