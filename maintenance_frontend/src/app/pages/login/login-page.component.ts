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

  constructor(
    private readonly auth: AuthService,
    private readonly router: Router,
    private readonly api: ApiClientService,
  ) {}

  protected login(): void {
    this.auth.loginWithDemoUser();
    this.router.navigateByUrl('/');
  }

  protected checkBackend(): void {
    const stateSetter = (patch: Partial<HttpState<unknown>>) =>
      this.apiState.update((s) => ({ ...s, ...patch }));

    toHttpState(this.api.health(), stateSetter).subscribe();
  }
}
