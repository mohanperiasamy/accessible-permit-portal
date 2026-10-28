import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { axeViolations, describeViolations } from '../../../testing/axe';
import { RequestForm } from './request-form';

describe('RequestForm', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RequestForm],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();
  });

  function render() {
    const fixture = TestBed.createComponent(RequestForm);
    fixture.detectChanges();
    return { fixture, el: fixture.nativeElement as HTMLElement };
  }

  it('gives every input a programmatic label', () => {
    const { el } = render();
    for (const input of Array.from(el.querySelectorAll('input, textarea'))) {
      const labelled = el.querySelector(`label[for="${input.id}"]`) || input.getAttribute('aria-labelledby');
      expect(labelled, `#${input.id} has no label`).toBeTruthy();
    }
  });

  it('shows an error summary with a link to each invalid field when submitted empty', async () => {
    const { fixture, el } = render();

    el.querySelector<HTMLButtonElement>('button[type="submit"]')!.click();
    fixture.detectChanges();
    await fixture.whenStable();

    const summary = el.querySelector('.error-summary')!;
    expect(summary.getAttribute('role')).toBe('alert');
    const links = Array.from(summary.querySelectorAll('a'));
    expect(links.length).toBe(6);
    expect(links.map((a) => a.getAttribute('href'))).toContain('#field-email');
    TestBed.inject(HttpTestingController).expectNone('/api/service-requests');
  });

  it('maps server validation errors onto the matching fields', async () => {
    const { fixture, el } = render();
    const form = (fixture.componentInstance as any).form;
    form.setValue({
      type: 'Other', applicantName: 'Sam Doe', applicantEmail: 'sam@example.com',
      phone: '555-010-0000', address: '1 Test Road', description: 'Something needs fixing.',
    });

    el.querySelector<HTMLButtonElement>('button[type="submit"]')!.click();
    TestBed.inject(HttpTestingController)
      .expectOne('/api/service-requests')
      .flush({ errors: { ApplicantEmail: ['That email domain is not accepted.'] } }, { status: 400, statusText: 'Bad Request' });
    fixture.detectChanges();
    await fixture.whenStable();

    expect(el.querySelector('.error-summary')?.textContent).toContain('That email domain is not accepted.');
  });

  it('has no axe violations, before and after showing errors', async () => {
    const { fixture, el } = render();
    let violations = await axeViolations(el);
    expect(violations, describeViolations(violations)).toEqual([]);

    el.querySelector<HTMLButtonElement>('button[type="submit"]')!.click();
    fixture.detectChanges();
    await fixture.whenStable();
    violations = await axeViolations(el);
    expect(violations, describeViolations(violations)).toEqual([]);
  });
});
