import { Component, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { ApiClientService } from '../../core/api/api-client.service';
import { toHttpState, HttpState } from '../../core/api/http-state';

@Component({
  selector: 'app-login-page',
  imports: [],
  templateUrl: './login-page.component.html',
  styleUrl: './login-page.component.css',
})
export class LoginPageComponent {
  protected readonly apiState = signal<HttpState<unknown>>({ loading: false });
  protected readonly loginState = signal<HttpState<void>>({ loading: false });

  // Minimal default for demo/preview (can be edited in UI)
  protected email = signal<string>('engineer@example.com');
  protected password = signal<string>('password');

  constructor(
    private readonly auth: AuthService,
    private readonly router: Router,
    private readonly api: ApiClientService,
  ) {}

  protected login(): void {
    const stateSetter = (patch: Partial<HttpState<void>>) =>
      this.loginState.update((s) => ({ ...s, ...patch }));

    toHttpState(this.auth.login(this.email(), this.password()), stateSetter).subscribe({
      next: () => this.router.navigateByUrl('/'),
    });
  }

  protected checkBackend(): void {
    const stateSetter = (patch: Partial<HttpState<unknown>>) =>
      this.apiState.update((s) => ({ ...s, ...patch }));

    toHttpState(this.api.health(), stateSetter).subscribe();
  }
}
