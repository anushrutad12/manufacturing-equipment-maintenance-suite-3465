import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiClientService } from '../../core/api/api-client.service';
import { Equipment, Id } from '../../core/api/api-types';
import { HttpState, toHttpState } from '../../core/api/http-state';

type EquipmentForm = {
  name: string;
  location: string;
  model: string;
  serialNumber: string;
  isActive: boolean;
};

@Component({
  selector: 'app-equipment-page',
  imports: [FormsModule],
  templateUrl: './equipment-page.component.html',
  styleUrl: './equipment-page.component.css',
})
export class EquipmentPageComponent {
  protected readonly listState = signal<HttpState<Equipment[]>>({ loading: false, data: [] });

  protected readonly isModalOpen = signal(false);
  protected readonly editingId = signal<Id | null>(null);

  protected form: EquipmentForm = {
    name: '',
    location: '',
    model: '',
    serialNumber: '',
    isActive: true,
  };

  constructor(private readonly api: ApiClientService) {
    this.refresh();
  }

  protected refresh(): void {
    const setState = (patch: Partial<HttpState<Equipment[]>>) =>
      this.listState.update((s) => ({ ...s, ...patch }));
    toHttpState(this.api.listEquipment(), setState).subscribe();
  }

  protected openCreate(): void {
    this.editingId.set(null);
    this.form = { name: '', location: '', model: '', serialNumber: '', isActive: true };
    this.isModalOpen.set(true);
  }

  protected openEdit(row: Equipment): void {
    this.editingId.set(row.id);
    this.form = {
      name: row.name,
      location: row.location ?? '',
      model: row.model ?? '',
      serialNumber: row.serialNumber ?? '',
      isActive: row.isActive,
    };
    this.isModalOpen.set(true);
  }

  protected closeModal(): void {
    this.isModalOpen.set(false);
  }

  protected save(): void {
    const editing = this.editingId();
    const payload = {
      name: this.form.name.trim(),
      location: this.form.location.trim() || undefined,
      model: this.form.model.trim() || undefined,
      serialNumber: this.form.serialNumber.trim() || undefined,
      isActive: this.form.isActive,
    };

    if (!payload.name) {
      this.listState.update((s) => ({ ...s, error: 'Name is required.' }));
      return;
    }

    if (!editing) {
      toHttpState(this.api.createEquipment(payload), () => {}).subscribe(() => {
        this.closeModal();
        this.refresh();
      });
      return;
    }

    toHttpState(this.api.updateEquipment(editing, payload), () => {}).subscribe(() => {
      this.closeModal();
      this.refresh();
    });
  }

  protected remove(id: Id): void {
    toHttpState(this.api.deleteEquipment(id), () => {}).subscribe(() => this.refresh());
  }
}
