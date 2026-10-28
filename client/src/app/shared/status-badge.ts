import { Component, computed, input } from '@angular/core';
import { RequestStatus, STATUS_LABELS } from '../core/models';

/** Design-system badge. Status is always shown as text, never by color alone (WCAG 1.4.1). */
@Component({
  selector: 'app-status-badge',
  template: `<span class="badge" [class]="'badge badge--' + status().toLowerCase()">{{ label() }}</span>`,
  styles: `
    @use '../../styles/tokens' as ds;
    .badge {
      display: inline-block;
      padding: ds.token(space-1) ds.token(space-2);
      border: 1px solid currentColor;
      border-radius: ds.token(radius-sm);
      font-size: ds.token(font-size-small);
      font-weight: 600;
      white-space: nowrap;
      background: ds.token(color-bg);
    }
    .badge--submitted, .badge--inreview { color: ds.token(color-primary); }
    .badge--approved { color: ds.token(color-success); }
    .badge--rejected { color: ds.token(color-error); }
    .badge--closed { color: ds.token(color-text-muted); }
  `,
})
export class StatusBadge {
  readonly status = input.required<RequestStatus>();
  protected readonly label = computed(() => STATUS_LABELS[this.status()]);
}
