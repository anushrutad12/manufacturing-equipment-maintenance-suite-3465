import { Component, computed, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';

type NavItem = { label: string; path: string };

@Component({
  selector: 'app-dashboard-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './dashboard-layout.component.html',
  styleUrl: './dashboard-layout.component.css',
})
export class DashboardLayoutComponent {
  protected readonly isCollapsed = signal(false);

  protected readonly navItems: NavItem[] = [
    { label: 'Equipment', path: '/equipment' },
    { label: 'Readings', path: '/readings' },
    { label: 'Alerts', path: '/alerts' },
    { label: 'Work Orders', path: '/work-orders' },
    { label: 'Parts', path: '/parts' },
    { label: 'Reports', path: '/reports' },
  ];

  protected readonly initials = computed(() => 'EN');

  constructor(
    protected readonly auth: AuthService,
    private readonly router: Router,
  ) {}

  protected toggleCollapse(): void {
    this.isCollapsed.update((v) => !v);
  }

  protected logout(): void {
    this.auth.logout();

    // Prefer Router navigation; if running in a real browser, also update location.
    this.router.navigateByUrl('/login');
    const g = globalThis as unknown as { location?: unknown };
    const loc = g?.location as { href?: string } | undefined;
    if (loc && typeof loc.href === 'string') loc.href = '/login';
  }
}
