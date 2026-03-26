import { Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiClientService } from '../../core/api/api-client.service';
import { Equipment, Id, Reading } from '../../core/api/api-types';
import { HttpState, toHttpState } from '../../core/api/http-state';

type ReadingForm = {
  equipmentId: Id;
  timestamp: string;
  temperatureC?: number;
  vibrationMmS?: number;
  cycleCount?: number;
  runtimeHours?: number;
  notes?: string;
};

@Component({
  selector: 'app-readings-page',
  imports: [FormsModule],
  templateUrl: './readings-page.component.html',
  styleUrl: './readings-page.component.css',
})
export class ReadingsPageComponent {
  protected readonly equipmentState = signal<HttpState<Equipment[]>>({ loading: false, data: [] });
  protected readonly readingsState = signal<HttpState<Reading[]>>({ loading: false, data: [] });

  protected readonly selectedEquipmentId = signal<Id | 'all'>('all');

  protected readonly form = signal<ReadingForm>({
    equipmentId: '',
    timestamp: new Date().toISOString().slice(0, 16),
    temperatureC: undefined,
    vibrationMmS: undefined,
    cycleCount: undefined,
    runtimeHours: undefined,
    notes: '',
  });

  protected readonly canSubmit = computed(() => !!this.form().equipmentId && !!this.form().timestamp);

  constructor(private readonly api: ApiClientService) {
    this.loadEquipment();
    this.refreshReadings();
  }

  private loadEquipment(): void {
    const setState = (patch: Partial<HttpState<Equipment[]>>) =>
      this.equipmentState.update((s) => ({ ...s, ...patch }));
    toHttpState(this.api.listEquipment(), setState).subscribe((rows: Equipment[] | undefined) => {
      const eq = rows ?? [];
      if (!this.form().equipmentId && eq.length) {
        this.form.update((f) => ({ ...f, equipmentId: eq[0].id }));
      }
    });
  }

  protected refreshReadings(): void {
    const filter = this.selectedEquipmentId();
    const eqId = filter === 'all' ? undefined : (filter as Id);

    const setState = (patch: Partial<HttpState<Reading[]>>) =>
      this.readingsState.update((s) => ({ ...s, ...patch }));
    toHttpState(this.api.listReadings(eqId), setState).subscribe();
  }

  protected parseOptionalNumber(raw: unknown): number | undefined {
    // Angular template emits string for number inputs; normalize to number|undefined
    if (raw === '' || raw === null || raw === undefined) return undefined;
    const n = Number(raw);
    return Number.isFinite(n) ? n : undefined;
  }

  protected onEquipmentChange(equipmentId: Id): void {
    this.form.update((f) => ({ ...f, equipmentId }));
  }

  protected onTimestampChange(timestamp: string): void {
    this.form.update((f) => ({ ...f, timestamp }));
  }

  protected onNotesChange(notes: string): void {
    this.form.update((f) => ({ ...f, notes }));
  }

  protected onTemperatureChange(value: unknown): void {
    this.form.update((f) => ({ ...f, temperatureC: this.parseOptionalNumber(value) }));
  }

  protected onVibrationChange(value: unknown): void {
    this.form.update((f) => ({ ...f, vibrationMmS: this.parseOptionalNumber(value) }));
  }

  protected onRuntimeChange(value: unknown): void {
    this.form.update((f) => ({ ...f, runtimeHours: this.parseOptionalNumber(value) }));
  }

  protected submit(): void {
    if (!this.canSubmit()) return;

    const f = this.form();
    toHttpState(
      this.api.createReading({
        equipmentId: f.equipmentId,
        timestamp: new Date(f.timestamp).toISOString(),
        temperatureC: f.temperatureC,
        vibrationMmS: f.vibrationMmS,
        cycleCount: f.cycleCount,
        runtimeHours: f.runtimeHours,
        notes: (f.notes ?? '').trim() || undefined,
      }),
      () => {},
    ).subscribe(() => {
      this.form.update((old) => ({
        ...old,
        timestamp: new Date().toISOString().slice(0, 16),
        notes: '',
      }));
      this.refreshReadings();
    });
  }
}
