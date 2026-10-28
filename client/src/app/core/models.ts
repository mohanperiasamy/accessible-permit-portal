export type RequestType = 'BuildingPermit' | 'StreetRepair' | 'SignPermit' | 'Other';
export type RequestStatus = 'Submitted' | 'InReview' | 'Approved' | 'Rejected' | 'Closed';

export interface ServiceRequest {
  id: number;
  referenceNumber: string;
  type: RequestType;
  status: RequestStatus;
  applicantName: string;
  applicantEmail: string;
  maskedPhone: string;
  address: string;
  description: string;
  createdUtc: string;
  updatedUtc: string;
}

export interface CreateServiceRequest {
  type: RequestType | null;
  applicantName: string;
  applicantEmail: string;
  phone: string;
  address: string;
  description: string;
}

export const REQUEST_TYPE_LABELS: Record<RequestType, string> = {
  BuildingPermit: 'Building permit',
  StreetRepair: 'Street or sidewalk repair',
  SignPermit: 'Sign permit',
  Other: 'Other request',
};

export const STATUS_LABELS: Record<RequestStatus, string> = {
  Submitted: 'Submitted',
  InReview: 'In review',
  Approved: 'Approved',
  Rejected: 'Rejected',
  Closed: 'Closed',
};

/** Mirrors the transitions enforced by the API's service layer. */
export const NEXT_STATUSES: Record<RequestStatus, RequestStatus[]> = {
  Submitted: ['InReview', 'Rejected'],
  InReview: ['Approved', 'Rejected'],
  Approved: ['Closed'],
  Rejected: ['Closed'],
  Closed: [],
};
