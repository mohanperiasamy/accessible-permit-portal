import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, inject, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { Router, RouterLink } from '@angular/router';
import { NEXT_STATUSES, REQUEST_TYPE_LABELS, RequestStatus, STATUS_LABELS, ServiceRequest } from '../../core/models';
import { ServiceRequestApi } from '../../core/service-request-api';
import { StatusBadge } from '../../shared/status-badge';

@Component({
  selector: 'app-request-detail',
  imports: [DatePipe, FormsModule, RouterLink, MatButtonModule, MatFormFieldModule, MatSelectModule, StatusBadge],
  templateUrl: './request-detail.html',
  styleUrl: './request-detail.scss',
})
export class RequestDetail implements OnInit {
  private readonly api = inject(ServiceRequestApi);

  /** Bound from the :id route parameter (withComponentInputBinding). */
  readonly id = input.required<string>();

  protected readonly typeLabels = REQUEST_TYPE_LABELS;
  protected readonly statusLabels = STATUS_LABELS;
  protected readonly request = signal<ServiceRequest | null>(null);
  protected readonly notFound = signal(false);
  protected readonly newStatus = signal<RequestStatus | null>(null);
  /** Polite live-region message for confirmations; errors use role="alert". */
  protected readonly statusMessage = signal('');
  protected readonly statusError = signal<string | null>(null);
  protected readonly justSubmitted = !!inject(Router).currentNavigation()?.extras.state?.['justSubmitted'];

  ngOnInit(): void {
    this.api.get(Number(this.id())).subscribe({
      next: (r) => this.request.set(r),
      error: () => this.notFound.set(true),
    });
  }

  nextStatuses(): RequestStatus[] {
    const r = this.request();
    return r ? NEXT_STATUSES[r.status] : [];
  }

  updateStatus(): void {
    const r = this.request();
    const status = this.newStatus();
    this.statusError.set(null);
    if (!r || !status) {
      this.statusError.set('Choose a new status first.');
      return;
    }
    this.api.updateStatus(r.id, status).subscribe({
      next: (updated) => {
        this.request.set(updated);
        this.newStatus.set(null);
        this.statusMessage.set(`Status changed to ${STATUS_LABELS[updated.status]}.`);
      },
      error: (err: HttpErrorResponse) =>
        this.statusError.set(err.error?.detail ?? 'The status could not be changed. Please try again.'),
    });
  }
}
