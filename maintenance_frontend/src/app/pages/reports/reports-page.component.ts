import { Component, signal } from '@angular/core';
import { ApiClientService } from '../../core/api/api-client.service';
import { HttpState, toHttpState } from '../../core/api/http-state';
import { ReportKpi } from '../../core/api/api-types';

@Component({
  selector: 'app-reports-page',
  imports: [],
  templateUrl: './reports-page.component.html',
  styleUrl: './reports-page.component.css',
})
export class ReportsPageComponent {
  protected readonly healthState = signal<HttpState<unknown>>({ loading: false });

  protected readonly kpis = signal<ReportKpi[]>([
    { label: 'Assets tracked', value: '—', hint: 'Count of registered equipment' },
    { label: 'Open alerts', value: '—', hint: 'Unacknowledged alerts' },
    { label: 'Open work orders', value: '—', hint: 'Maintenance tickets in progress' },
  ]);

  constructor(private readonly api: ApiClientService) {}

  protected checkBackend(): void {
    const setState = (patch: Partial<HttpState<unknown>>) => this.healthState.update((s) => ({ ...s, ...patch }));
    toHttpState(this.api.health(), setState).subscribe();
  }
}
