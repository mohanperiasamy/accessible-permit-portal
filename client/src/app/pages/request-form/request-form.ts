import { HttpErrorResponse } from '@angular/common/http';
import { Component, ElementRef, inject, signal, viewChild } from '@angular/core';
import { FormBuilder, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { Router } from '@angular/router';
import { CreateServiceRequest, REQUEST_TYPE_LABELS, RequestType } from '../../core/models';
import { ServiceRequestApi } from '../../core/service-request-api';

interface FieldError {
  id: string;
  message: string;
}

/** Field ids, labels and messages in one place so the error summary and inline errors always match. */
const FIELDS: Record<string, { id: string; label: string; messages: Record<string, string> }> = {
  type: { id: 'field-type', label: 'Request type', messages: { required: 'Choose a request type.' } },
  applicantName: {
    id: 'field-name', label: 'Full name',
    messages: { required: 'Enter your full name.', minlength: 'Name must be at least 2 characters.' },
  },
  applicantEmail: {
    id: 'field-email', label: 'Email address',
    messages: { required: 'Enter your email address.', email: 'Enter a valid email address, like name@example.com.' },
  },
  phone: {
    id: 'field-phone', label: 'Phone number',
    messages: { required: 'Enter a phone number.', pattern: 'Enter a phone number with at least 10 digits.' },
  },
  address: {
    id: 'field-address', label: 'Street address',
    messages: { required: 'Enter the street address for this request.', minlength: 'Address must be at least 5 characters.' },
  },
  description: {
    id: 'field-description', label: 'Description',
    messages: { required: 'Describe the request.', minlength: 'Description must be at least 10 characters.' },
  },
};

@Component({
  selector: 'app-request-form',
  imports: [ReactiveFormsModule, MatButtonModule, MatFormFieldModule, MatInputModule, MatSelectModule],
  templateUrl: './request-form.html',
  styleUrl: './request-form.scss',
})
export class RequestForm {
  private readonly api = inject(ServiceRequestApi);
  private readonly router = inject(Router);
  private readonly errorSummary = viewChild<ElementRef<HTMLElement>>('errorSummary');

  protected readonly fields = FIELDS;
  protected readonly typeOptions = Object.entries(REQUEST_TYPE_LABELS) as [RequestType, string][];
  protected readonly summaryErrors = signal<FieldError[]>([]);
  protected readonly submitting = signal(false);
  protected readonly serverError = signal<string | null>(null);

  protected readonly form = inject(FormBuilder).nonNullable.group({
    type: new FormControl<RequestType | null>(null, Validators.required),
    applicantName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
    applicantEmail: ['', [Validators.required, Validators.email, Validators.maxLength(254)]],
    phone: ['', [Validators.required, Validators.pattern(/^\+?[0-9 ().-]{10,20}$/)]],
    address: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(200)]],
    description: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(2000)]],
  });

  /** First error message for a field, or null. Used by the inline mat-error and the summary. */
  errorFor(name: string): string | null {
    const control = this.form.get(name);
    if (!control?.errors) return null;
    if (control.errors['server']) return control.errors['server'];
    const key = Object.keys(control.errors)[0];
    return FIELDS[name].messages[key] ?? 'Check this field.';
  }

  submit(): void {
    this.serverError.set(null);
    this.form.markAllAsTouched();
    if (this.form.invalid) {
      this.showSummary();
      return;
    }
    this.submitting.set(true);
    this.api.create(this.form.getRawValue() as CreateServiceRequest).subscribe({
      next: (created) =>
        this.router.navigate(['/requests', created.id], { state: { justSubmitted: true } }),
      error: (err: HttpErrorResponse) => {
        this.submitting.set(false);
        this.applyServerErrors(err);
      },
    });
  }

  /** Move focus to the summary so keyboard and screen-reader users hear what to fix. */
  focusField(event: Event, id: string): void {
    event.preventDefault();
    document.getElementById(id)?.focus();
  }

  private showSummary(): void {
    const errors = Object.keys(FIELDS)
      .map((name) => ({ id: FIELDS[name].id, message: this.errorFor(name) }))
      .filter((e): e is FieldError => e.message !== null);
    this.summaryErrors.set(errors);
    setTimeout(() => this.errorSummary()?.nativeElement.focus());
  }

  /** Map ASP.NET Core ValidationProblemDetails back onto the matching form controls. */
  private applyServerErrors(err: HttpErrorResponse): void {
    const errors = err.status === 400 ? (err.error?.errors as Record<string, string[]> | undefined) : undefined;
    if (!errors) {
      this.serverError.set('Your request could not be submitted. Please try again.');
      return;
    }
    for (const [key, messages] of Object.entries(errors)) {
      const name = key.charAt(0).toLowerCase() + key.slice(1);
      this.form.get(name)?.setErrors({ server: messages[0] });
    }
    this.showSummary();
  }
}
