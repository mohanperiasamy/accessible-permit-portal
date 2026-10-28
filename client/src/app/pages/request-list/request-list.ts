import { DatePipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { RouterLink } from '@angular/router';
import { REQUEST_TYPE_LABELS, RequestStatus, RequestType, STATUS_LABELS, ServiceRequest } from '../../core/models';
import { ServiceRequestApi } from '../../core/service-request-api';
import { StatusBadge } from '../../shared/status-badge';

@Component({
  selector: 'app-request-list',
  imports: [DatePipe, FormsModule, RouterLink, MatButtonModule, MatFormFieldModule, MatSelectModule, StatusBadge],
  templateUrl: './request-list.html',
  styleUrl: './request-list.scss',
})
export class RequestList {
  private readonly api = inject(ServiceRequestApi);

  protected readonly statusOptions = Object.entries(STATUS_LABELS) as [RequestStatus, string][];
  protected readonly statusFilter = signal<RequestStatus | null>(null);
  protected readonly requests = signal<ServiceRequest[]>([]);
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);
  /** Text for the polite live region, e.g. "3 requests shown". */
  protected readonly resultMessage = signal('');

  constructor() {
    this.load();
  }

  typeLabel(type: RequestType): string {
    return REQUEST_TYPE_LABELS[type];
  }

  onFilterChange(status: RequestStatus | null): void {
    this.statusFilter.set(status);
    this.load();
  }

  private load(): void {
    this.loading.set(true);
    this.error.set(null);
    this.api.list(this.statusFilter()).subscribe({
      next: (items) => {
        this.requests.set(items);
        this.loading.set(false);
        this.resultMessage.set(`${items.length} ${items.length === 1 ? 'request' : 'requests'} shown`);
      },
      error: () => {
        this.loading.set(false);
        this.error.set('Requests could not be loaded. Please try again.');
      },
    });
  }
}
