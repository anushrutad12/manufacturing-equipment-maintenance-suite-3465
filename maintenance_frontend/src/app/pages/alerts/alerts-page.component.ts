import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiClientService } from '../../core/api/api-client.service';
import { Alert, Equipment, Id, Priority } from '../../core/api/api-types';
import { HttpState, toHttpState } from '../../core/api/http-state';

type AlertForm = {
  equipmentId: Id;
  title: string;
  description: string;
  priority: Priority;
};

@Component({
  selector: 'app-alerts-page',
  imports: [FormsModule],
  templateUrl: './alerts-page.component.html',
  styleUrl: './alerts-page.component.css',
})
export class AlertsPageComponent {
  protected readonly equipmentState = signal<HttpState<Equipment[]>>({ loading: false, data: [] });
  protected readonly alertsState = signal<HttpState<Alert[]>>({ loading: false, data: [] });

  protected readonly isModalOpen = signal(false);

  protected form: AlertForm = {
    equipmentId: '',
    title: '',
    description: '',
    priority: 'Medium',
  };

  constructor(private readonly api: ApiClientService) {
    this.loadEquipment();
    this.refresh();
  }

  protected refresh(): void {
    const setState = (patch: Partial<HttpState<Alert[]>>) => this.alertsState.update((s) => ({ ...s, ...patch }));
    toHttpState(this.api.listAlerts(), setState).subscribe();
  }

  private loadEquipment(): void {
    const setState = (patch: Partial<HttpState<Equipment[]>>) =>
      this.equipmentState.update((s) => ({ ...s, ...patch }));
    toHttpState(this.api.listEquipment(), setState).subscribe((eq: Equipment[] | undefined) => {
      const rows = eq ?? [];
      if (!this.form.equipmentId && rows.length) this.form.equipmentId = rows[0].id;
    });
  }

  protected openCreate(): void {
    this.isModalOpen.set(true);
    this.form = { equipmentId: this.form.equipmentId, title: '', description: '', priority: 'Medium' };
  }

  protected closeModal(): void {
    this.isModalOpen.set(false);
  }

  protected create(): void {
    const payload = {
      equipmentId: this.form.equipmentId,
      title: this.form.title.trim(),
      description: this.form.description.trim() || undefined,
      priority: this.form.priority,
      isAcknowledged: false,
    };
    if (!payload.equipmentId || !payload.title) {
      this.alertsState.update((s) => ({ ...s, error: 'Equipment and title are required.' }));
      return;
    }
    toHttpState(this.api.createAlert(payload), () => {}).subscribe(() => {
      this.closeModal();
      this.refresh();
    });
  }

  protected toggleAck(row: Alert): void {
    toHttpState(this.api.acknowledgeAlert(row.id, !row.isAcknowledged), () => {}).subscribe(() => this.refresh());
  }

  protected pillClass(priority: Priority): string {
    if (priority === 'Critical') return 'red';
    if (priority === 'High') return 'amber';
    if (priority === 'Medium') return 'primary';
    return '';
  }
}
