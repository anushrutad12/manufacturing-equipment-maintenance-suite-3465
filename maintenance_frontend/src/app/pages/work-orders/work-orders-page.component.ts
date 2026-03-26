import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiClientService } from '../../core/api/api-client.service';
import { Equipment, Id, Priority, WorkOrder, WorkOrderStatus } from '../../core/api/api-types';
import { HttpState, toHttpState } from '../../core/api/http-state';

type WorkOrderForm = {
  equipmentId: Id;
  title: string;
  description: string;
  priority: Priority;
  status: WorkOrderStatus;
  assignedTo: string;
};

@Component({
  selector: 'app-work-orders-page',
  imports: [FormsModule],
  templateUrl: './work-orders-page.component.html',
  styleUrl: './work-orders-page.component.css',
})
export class WorkOrdersPageComponent {
  protected readonly equipmentState = signal<HttpState<Equipment[]>>({ loading: false, data: [] });
  protected readonly workOrdersState = signal<HttpState<WorkOrder[]>>({ loading: false, data: [] });

  protected readonly isModalOpen = signal(false);
  protected readonly editingId = signal<Id | null>(null);

  protected form: WorkOrderForm = {
    equipmentId: '',
    title: '',
    description: '',
    priority: 'Medium',
    status: 'Open',
    assignedTo: '',
  };

  constructor(private readonly api: ApiClientService) {
    this.loadEquipment();
    this.refresh();
  }

  private loadEquipment(): void {
    const setState = (patch: Partial<HttpState<Equipment[]>>) =>
      this.equipmentState.update((s) => ({ ...s, ...patch }));
    toHttpState(this.api.listEquipment(), setState).subscribe((eq) => {
      const rows = eq ?? [];
      if (!this.form.equipmentId && rows.length) this.form.equipmentId = rows[0].id;
    });
  }

  protected refresh(): void {
    const setState = (patch: Partial<HttpState<WorkOrder[]>>) =>
      this.workOrdersState.update((s) => ({ ...s, ...patch }));
    toHttpState(this.api.listWorkOrders(), setState).subscribe();
  }

  protected openCreate(): void {
    this.editingId.set(null);
    this.form = {
      equipmentId: this.form.equipmentId,
      title: '',
      description: '',
      priority: 'Medium',
      status: 'Open',
      assignedTo: '',
    };
    this.isModalOpen.set(true);
  }

  protected openEdit(row: WorkOrder): void {
    this.editingId.set(row.id);
    this.form = {
      equipmentId: row.equipmentId,
      title: row.title,
      description: row.description ?? '',
      priority: row.priority,
      status: row.status,
      assignedTo: row.assignedTo ?? '',
    };
    this.isModalOpen.set(true);
  }

  protected closeModal(): void {
    this.isModalOpen.set(false);
  }

  protected save(): void {
    const payload: Omit<WorkOrder, 'id' | 'createdAt'> = {
      equipmentId: this.form.equipmentId,
      title: this.form.title.trim(),
      description: this.form.description.trim() || undefined,
      priority: this.form.priority,
      status: this.form.status,
      assignedTo: this.form.assignedTo.trim() || undefined,
      closedAt: this.form.status === 'Closed' ? new Date().toISOString() : undefined,
      resolutionNotes: undefined,
    };

    if (!payload.equipmentId || !payload.title) {
      this.workOrdersState.update((s) => ({ ...s, error: 'Equipment and title are required.' }));
      return;
    }

    const editing = this.editingId();
    if (!editing) {
      toHttpState(this.api.createWorkOrder(payload), () => {}).subscribe(() => {
        this.closeModal();
        this.refresh();
      });
      return;
    }

    toHttpState(this.api.updateWorkOrder(editing, payload), () => {}).subscribe(() => {
      this.closeModal();
      this.refresh();
    });
  }

  protected setStatus(row: WorkOrder, status: WorkOrderStatus): void {
    toHttpState(
      this.api.updateWorkOrder(row.id, {
        status,
        closedAt: status === 'Closed' ? new Date().toISOString() : undefined,
      }),
      () => {},
    ).subscribe(() => this.refresh());
  }

  protected statusPill(status: WorkOrderStatus): string {
    if (status === 'Closed') return 'primary';
    if (status === 'In Progress') return 'amber';
    return '';
  }
}
