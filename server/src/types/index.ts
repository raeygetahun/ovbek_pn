import { Request, Response } from "express";
import { Timestamp } from "firebase-admin/firestore";

// Application Status Types
export type ApplicationStatus =
  | "Pending"
  | "Approved"
  | "Rejected"
  | "CancellationRequested";
export type AccountStatus = "Pending" | "Approved" | "Rejected";

// Slot Interface
export interface ISlot {
  slotId: string;
  name: string;
  startTime: string; // "HH:mm" format
  endTime: string; // "HH:mm" format
  main?: boolean;
}

export interface ISlotWithDisplay extends ISlot {
  displayText: string;
}

// Volunteer Interface
export interface IVolunteer {
  volunteerId: string;
  email: string;
  firstName: string;
  lastName: string;
  accountStatus: AccountStatus | null;
}

// Admin Interface
export interface IAdmin {
  adminId: string;
  email: string;
  firstName: string;
  lastName: string;
}

// Application Interface
export interface IApplication {
  applicationId: string;
  date: Date;
  slotId: string;
  volunteerId: string;
  status: ApplicationStatus;
  note: string | null;
  volunteerName?: string | null;
  startTime?: Date | null;
  endTime?: Date | null;
  slotName?: string | null;
  cancellationReason?: string;
  cancellationRequestedAt?: Date;
}

// Coverage Gap
export interface ICoverageGap {
  date: string;
  slotId: string;
  slotName: string;
  slotDisplay: string;
  dayOfWeek: string;
}

// Volunteer Stats
export interface ISlotBreakdown {
  slotId: string;
  slotName: string;
  count: number;
}

export interface IPreferredDay {
  day: string;
  total: number;
  slots: ISlotBreakdown[];
}

export interface IVolunteerStats {
  totalShifts: number;
  preferredDays: IPreferredDay[];
  lastVolunteered: Date | null;
}

export interface IVolunteerWithStats {
  name: string;
  email: string;
  volunteerId: string;
  stats: IVolunteerStats;
  score?: number;
}

// AI Recommendation Types
export interface IRecommendation {
  date: string;
  slotId: string;
  slotName: string;
  slotDisplay: string;
}

export interface IVolunteerRecommendation {
  name: string;
  email: string;
  reason: string;
}

export interface ISlotRecommendation {
  date: string;
  slotId: string;
  slotName: string;
  slotDisplay: string;
  dayOfWeek?: string;
  volunteers: IVolunteerRecommendation[];
}

// Firestore Types
export interface IFirestoreTimestamp {
  toDate(): Date;
}

export type FirestoreDateField = Date | IFirestoreTimestamp | Timestamp;

// API Response Types
export interface IApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  cached?: boolean;
  fallback?: boolean;
  limitReached?: boolean;
}

// Express Types with typed body
export interface ITypedRequest<T = unknown> extends Request {
  body: T;
}

export interface ITypedRequestParams<P = unknown> extends Request {
  params: P & Request["params"];
}

// Request Body Types
export interface IApplyTimeSlotBody {
  email: string;
  applicationDate: string;
  slotId: string;
}

export interface IVerifyApplicationBody {
  applicationId: string;
  status: ApplicationStatus;
  note?: string;
}

export interface IVerifyVolunteerBody {
  volunteerId: string;
  status: string;
}

export interface IUpdateApplicationBody {
  applicationId: string;
  slotId: string;
}

export interface ICancellationRequestBody {
  applicationId: string;
  reason: string;
}

export interface IRegisterBody {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface ISlotBody {
  name: string;
  startTime: string;
  endTime: string;
}

// Config Types
export interface IFirebaseConfig {
  projectId: string;
  privateKey: object;
  clientEmail: string;
}

export interface IAppConfig {
  firebaseConfig: IFirebaseConfig;
}

// Cache Item
export interface ICacheItem<T> {
  value: T;
  expiry: number;
}

// Holiday Cache Item
export interface IHolidayCacheItem {
  holidays: Set<string>;
  fetchedAt: number;
}

// Email Data Types
export interface IEmailData {
  name?: string;
  reason?: string;
  date?: string;
  time?: string;
}

export type EmailMessageKey =
  | "New TimeSlot"
  | "New Assignment"
  | "New Volunteer"
  | "TimeSlot Approved"
  | "TimeSlot Rejected"
  | "Account Approved"
  | "Account Rejected"
  | "New Admin"
  | "Cancellation Request"
  | "Cancellation Approved"
  | "Cancellation Rejected";

export type SupportedLanguage = "en" | "de";
