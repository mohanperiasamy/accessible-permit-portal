import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import type { ServiceRequest } from '../../core/models';
import { axeViolations, describeViolations } from '../../../testing/axe';
import { RequestList } from './request-list';

const SAMPLE: ServiceRequest[] = [
  {
    id: 1, referenceNumber: 'SR-20261027-0001', type: 'BuildingPermit', status: 'Submitted',
    applicantName: 'Alex Rivera', applicantEmail: 'alex@example.com', maskedPhone: '***-***-1234',
    address: '100 Sample Street', description: 'Shed permit.', createdUtc: '2026-10-27T15:00:00Z', updatedUtc: '2026-10-27T15:00:00Z',
  },
];

describe('RequestList', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RequestList],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();
  });

  async function renderWith(data: ServiceRequest[]) {
    const fixture = TestBed.createComponent(RequestList);
    fixture.detectChanges();
    TestBed.inject(HttpTestingController).expectOne('/api/service-requests').flush(data);
    fixture.detectChanges();
    await fixture.whenStable();
    return fixture.nativeElement as HTMLElement;
  }

  it('renders a captioned table with column and row headers', async () => {
    const el = await renderWith(SAMPLE);
    expect(el.querySelector('caption')?.textContent).toContain('Service requests');
    expect(el.querySelectorAll('thead th[scope="col"]').length).toBe(5);
    expect(el.querySelector('tbody th[scope="row"]')?.textContent).toContain('SR-20261027-0001');
  });

  it('announces the result count in a polite live region', async () => {
    const el = await renderWith(SAMPLE);
    expect(el.querySelector('.result-count[aria-live="polite"]')?.textContent).toContain('1 request shown');
  });

  it('has no axe violations', async () => {
    const el = await renderWith(SAMPLE);
    const violations = await axeViolations(el);
    expect(violations, describeViolations(violations)).toEqual([]);
  });
});
