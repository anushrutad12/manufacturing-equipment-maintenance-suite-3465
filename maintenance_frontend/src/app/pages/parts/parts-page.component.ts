import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiClientService } from '../../core/api/api-client.service';
import { HttpState, toHttpState } from '../../core/api/http-state';
import { Id, Part } from '../../core/api/api-types';

type PartForm = {
  id?: Id;
  name: string;
  sku: string;
  stockQty: number;
  reorderPoint: number;
  unitCost?: number;
};

@Component({
  selector: 'app-parts-page',
  imports: [FormsModule],
  templateUrl: './parts-page.component.html',
  styleUrl: './parts-page.component.css',
})
export class PartsPageComponent {
  protected readonly partsState = signal<HttpState<Part[]>>({ loading: false, data: [] });

  protected readonly isModalOpen = signal(false);

  protected form: PartForm = {
    name: '',
    sku: '',
    stockQty: 0,
    reorderPoint: 0,
    unitCost: undefined,
  };

  constructor(private readonly api: ApiClientService) {
    this.refresh();
  }

  protected refresh(): void {
    const setState = (patch: Partial<HttpState<Part[]>>) => this.partsState.update((s) => ({ ...s, ...patch }));
    toHttpState(this.api.listParts(), setState).subscribe();
  }

  protected openCreate(): void {
    this.form = { name: '', sku: '', stockQty: 0, reorderPoint: 0, unitCost: undefined };
    this.isModalOpen.set(true);
  }

  protected openEdit(row: Part): void {
    this.form = {
      id: row.id,
      name: row.name,
      sku: row.sku ?? '',
      stockQty: row.stockQty,
      reorderPoint: row.reorderPoint,
      unitCost: row.unitCost,
    };
    this.isModalOpen.set(true);
  }

  protected closeModal(): void {
    this.isModalOpen.set(false);
  }

  protected save(): void {
    const payload = {
      id: this.form.id,
      name: this.form.name.trim(),
      sku: this.form.sku.trim() || undefined,
      stockQty: Number(this.form.stockQty ?? 0),
      reorderPoint: Number(this.form.reorderPoint ?? 0),
      unitCost: this.form.unitCost === undefined ? undefined : Number(this.form.unitCost),
    };
    if (!payload.name) {
      this.partsState.update((s) => ({ ...s, error: 'Name is required.' }));
      return;
    }
    toHttpState(this.api.upsertPart(payload as any), () => {}).subscribe(() => {
      this.closeModal();
      this.refresh();
    });
  }

  protected remove(id: Id): void {
    toHttpState(this.api.deletePart(id), () => {}).subscribe(() => this.refresh());
  }

  protected lowStock(row: Part): boolean {
    return row.stockQty <= row.reorderPoint;
  }
}
