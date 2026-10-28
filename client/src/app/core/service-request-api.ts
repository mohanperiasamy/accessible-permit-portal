import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { CreateServiceRequest, RequestStatus, ServiceRequest } from './models';

@Injectable({ providedIn: 'root' })
export class ServiceRequestApi {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/service-requests';

  list(status?: RequestStatus | null): Observable<ServiceRequest[]> {
    const params = status ? new HttpParams().set('status', status) : undefined;
    return this.http.get<ServiceRequest[]>(this.baseUrl, { params });
  }

  get(id: number): Observable<ServiceRequest> {
    return this.http.get<ServiceRequest>(`${this.baseUrl}/${id}`);
  }

  create(input: CreateServiceRequest): Observable<ServiceRequest> {
    return this.http.post<ServiceRequest>(this.baseUrl, input);
  }

  updateStatus(id: number, status: RequestStatus): Observable<ServiceRequest> {
    return this.http.patch<ServiceRequest>(`${this.baseUrl}/${id}/status`, { status });
  }
}
