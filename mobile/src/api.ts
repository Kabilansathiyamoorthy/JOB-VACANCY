// VelaiConnect API client – talks to the Java Spring Boot backend
import Constants from 'expo-constants';

const BASE_URL: string =
  (Constants.expoConfig?.extra as any)?.apiBaseUrl || 'http://10.0.2.2:8080/api/v1';

let accessToken: string | null = null;
let refreshToken: string | null = null;
let onSessionExpired: (() => void) | null = null;

export function setTokens(access: string | null, refresh: string | null) {
  accessToken = access;
  refreshToken = refresh;
}

export function setSessionExpiredHandler(fn: () => void) {
  onSessionExpired = fn;
}

export class ApiError extends Error {
  messageTa?: string;
  fieldErrors?: Record<string, string>;
  status?: number;
  constructor(message: string, messageTa?: string, status?: number, fieldErrors?: Record<string, string>) {
    super(message);
    this.messageTa = messageTa;
    this.status = status;
    this.fieldErrors = fieldErrors;
  }
}

async function request<T>(
  path: string,
  options: { method?: string; body?: any; form?: FormData } = {}
): Promise<T> {
  const headers: Record<string, string> = {};
  if (accessToken) headers['Authorization'] = `Bearer ${accessToken}`;
  if (!options.form && options.body !== undefined) headers['Content-Type'] = 'application/json';

  let res: Response;
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      method: options.method || (options.body !== undefined || options.form ? 'POST' : 'GET'),
      headers,
      body: options.form ? options.form : options.body !== undefined ? JSON.stringify(options.body) : undefined,
    });
  } catch (e) {
    throw new ApiError('Cannot reach server. Check your connection.', 'சர்வரை அணுக முடியவில்லை. இணைப்பை சரிபார்க்கவும்.');
  }

  if (res.status === 401 && refreshToken && onSessionExpired) {
    // try one refresh
    try {
      const r = await fetch(`${BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });
      const data = await r.json();
      if (r.ok && data?.data?.accessToken) {
        accessToken = data.data.accessToken;
        refreshToken = data.data.refreshToken;
        headers['Authorization'] = `Bearer ${accessToken}`;
        res = await fetch(`${BASE_URL}${path}`, {
          method: options.method || (options.body !== undefined || options.form ? 'POST' : 'GET'),
          headers,
          body: options.form ? options.form : options.body !== undefined ? JSON.stringify(options.body) : undefined,
        });
      } else {
        onSessionExpired();
        throw new ApiError('Session expired. Please login again.', 'அமர்வு காலாவதியாகிவிட்டது. மீண்டும் உள்நுழையவும்.');
      }
    } catch (err) {
      if (err instanceof ApiError) throw err;
      throw new ApiError('Session expired. Please login again.', 'அமர்வு காலாவதியாகிவிட்டது. மீண்டும் உள்நுழையவும்.');
    }
  }

  let json: any = null;
  try {
    json = await res.json();
  } catch {
    json = null;
  }

  if (!res.ok || json?.success === false) {
    throw new ApiError(
      json?.message || 'Something went wrong',
      json?.messageTa || 'ஏதோ தவறு ஏற்பட்டது',
      res.status,
      json?.data && typeof json.data === 'object' && !Array.isArray(json.data) ? json.data : undefined
    );
  }

  return (json?.data !== undefined ? json.data : json) as T;
}

// ---------- types ----------
export type Job = {
  id: string; title: string; titleTa?: string; description: string; descriptionTa?: string;
  companyName: string; verifiedEmployer: boolean; categoryCode: string;
  categoryNameEn: string; categoryNameTa: string; categoryIcon: string;
  locationCity: string; locationArea?: string; distanceKm?: number;
  salaryMin?: number; salaryMax?: number; salaryPeriod: string; jobType: string;
  experienceRequired: string; qualification?: string; skills: string[];
  vacancies: number; workFromHome: boolean; quickJob: boolean; status: string;
  applicationDeadline?: string; contactPhone?: string; postedAt?: string;
  viewCount?: number; saved?: boolean; applied?: boolean;
};

export type Category = { id: string; code: string; nameEn: string; nameTa: string; icon: string };

export type ApplicationView = {
  id: string; jobId: string; jobTitle: string; companyName: string;
  seekerName?: string; seekerMobile?: string; seekerCity?: string; seekerSkills?: string;
  seekerExperienceYears?: number; resumeUrl?: string; coverNote?: string;
  status: string; appliedAt: string;
};

export type NotificationItem = {
  id: string; titleEn: string; titleTa: string; bodyEn: string; bodyTa: string;
  read: boolean; createdAt: string;
};

export type SeekerProfile = {
  userId: string; fullName: string; mobileNumber: string; city?: string; education?: string;
  skills?: string; experienceYears: number; preferredCategoryCode?: string;
  expectedSalaryMin?: number; expectedSalaryMax?: number; preferredJobType?: string;
  resumeUrl?: string; profileImageUrl?: string; profileComplete: boolean;
};

export type EmployerProfile = {
  userId: string; companyName: string; companyType?: string; companyDescription?: string;
  city?: string; contactPerson: string; logoUrl?: string; verified: boolean; mobileNumber: string;
};

export type SendOtpResponse = {
  success: boolean; existingUser: boolean; maskedMobile: string;
  devOtp?: string; resendAfterSeconds: number;
};

export type AuthResponse = {
  accessToken: string; refreshToken: string; role: 'JOB_SEEKER' | 'EMPLOYER' | 'ADMIN';
  userId: string; displayName?: string; profileComplete: boolean;
};

// ---------- API ----------
export const api = {
  // auth
  sendOtp: (mobileNumber: string, purpose: 'LOGIN' | 'REGISTRATION') =>
    request<SendOtpResponse>(`/auth/send-otp?purpose=${purpose}`, {
      method: 'POST', body: { mobileNumber },
    }),
  verifyOtp: (mobileNumber: string, otp: string, purpose: 'LOGIN' | 'REGISTRATION') =>
    request<AuthResponse>(`/auth/verify-otp`, { method: 'POST', body: { mobileNumber, otp, purpose } }),
  setAccountType: (mobileNumber: string, role: 'JOB_SEEKER' | 'EMPLOYER') =>
    request<AuthResponse>(`/auth/register/type`, { method: 'POST', body: { mobileNumber, role } }),

  // categories
  categories: () => request<Category[]>(`/categories`),

  // jobs
  searchJobs: (params: Record<string, any>) => {
    const qs = Object.entries(params)
      .filter(([, v]) => v !== undefined && v !== null && v !== '')
      .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
      .join('&');
    return request<{ content: Job[]; totalElements: number; totalPages: number; page: number }>(
      `/jobs?${qs}`);
  },
  latestJobs: (limit = 10) => request<Job[]>(`/jobs/latest?limit=${limit}`),
  quickJobs: () => request<Job[]>(`/jobs/quick`),
  recommendedJobs: () => request<Job[]>(`/jobs/recommended`),
  nearbyJobs: (lat: number, lng: number, radiusKm: number) =>
    request<Job[]>(`/jobs/nearby?lat=${lat}&lng=${lng}&radiusKm=${radiusKm}`),
  jobDetails: (id: string) => request<Job>(`/jobs/${id}`),

  // applications
  apply: (jobId: string, coverNote?: string) =>
    request<void>(`/jobs/${jobId}/apply-json`, { method: 'POST', body: { coverNote } }),
  myApplications: (page = 0, size = 20) =>
    request<{ content: ApplicationView[]; totalElements: number }>(`/applications/my?page=${page}&size=${size}`),
  applicants: (params: { jobId?: string; status?: string; page?: number; size?: number }) => {
    const qs = Object.entries(params)
      .filter(([, v]) => v !== undefined && v !== null && v !== '')
      .map(([k, v]) => `${k}=${v}`).join('&');
    return request<{ content: ApplicationView[]; totalElements: number }>(`/employer/applicants?${qs}`);
  },
  updateApplicationStatus: (id: string, status: string) =>
    request<ApplicationView>(`/employer/applications/${id}/status`, { method: 'PATCH', body: { status } }),
  employerStats: () => request<Record<string, number>>(`/employer/stats`),

  // saved jobs
  toggleSaved: (jobId: string) =>
    request<{ saved: boolean }>(`/users/saved-jobs/${jobId}/toggle`, { method: 'POST' }),
  savedJobs: () => request<Job[]>(`/users/saved-jobs`),

  // job alerts
  myAlerts: () => request<any[]>(`/users/job-alerts`),
  createAlert: (body: { categoryCode?: string; locationCity?: string; minSalary?: number; jobType?: string }) =>
    request<any>(`/users/job-alerts`, { method: 'POST', body }),
  deleteAlert: (id: string) => request<void>(`/users/job-alerts/${id}`, { method: 'DELETE' }),

  // notifications
  notifications: (page = 0, size = 20) =>
    request<{ content: NotificationItem[]; totalElements: number }>(`/notifications?page=${page}&size=${size}`),
  markNotificationRead: (id: string) => request<void>(`/notifications/${id}/read`, { method: 'PATCH' }),

  // reports
  reportJob: (jobId: string, reason: string, details?: string) =>
    request<void>(`/users/reports`, { method: 'POST', body: { jobId, reason, details } }),

  // registration completion
  registerJobSeeker: (body: any) => request<SeekerProfile>(`/users/register/job-seeker`, { method: 'POST', body }),
  registerEmployer: (body: any) => request<EmployerProfile>(`/users/register/employer`, { method: 'POST', body }),

  // profiles
  seekerProfile: () => request<SeekerProfile>(`/users/me/job-seeker`),
  employerProfile: () => request<EmployerProfile>(`/users/me/employer`),
  updateSeekerProfile: (body: any) => request<SeekerProfile>(`/users/me/job-seeker`, { method: 'PUT', body }),
  updateEmployerProfile: (body: any) => request<EmployerProfile>(`/users/me/employer`, { method: 'PUT', body }),

  // uploads
  uploadFile: async (uri: string, kind: 'resume' | 'profile-image' | 'company-logo' | 'verification'): Promise<string> => {
    const form = new FormData();
    const name = uri.split('/').pop() || 'file';
    const ext = name.includes('.') ? name.split('.').pop()!.toLowerCase() : '';
    const mime =
      kind !== 'resume' && ['jpg', 'jpeg', 'png', 'webp'].includes(ext)
        ? ext === 'png' ? 'image/png' : ext === 'webp' ? 'image/webp' : 'image/jpeg'
        : kind === 'resume' ? 'application/pdf' : 'application/octet-stream';
    form.append('file', { uri, name, type: mime } as any);
    const path =
      kind === 'resume' ? '/users/me/resume'
      : kind === 'profile-image' ? '/users/me/profile-image'
      : kind === 'company-logo' ? '/users/me/company-logo'
      : '/employer/verification';
    if (kind === 'verification') {
      // documents go through the verification endpoint
      const res = await fetch(`${BASE_URL}${path}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${accessToken}` },
        body: form,
      });
      if (!res.ok) throw new ApiError('Upload failed', 'பதிவேற்றம் தோல்வியடைந்தது');
      return name;
    }
    const data = await request<{ url: string }>(path, { method: 'POST', form });
    return data.url;
  },

  // employer jobs
  myJobs: () => request<Job[]>(`/employer/jobs`),
  postJob: (body: any) => request<Job>(`/employer/jobs`, { method: 'POST', body }),
  editJob: (id: string, body: any) => request<Job>(`/employer/jobs/${id}`, { method: 'PUT', body }),
  closeJob: (id: string) => request<void>(`/employer/jobs/${id}/close`, { method: 'PATCH' }),
  deleteJob: (id: string) => request<void>(`/employer/jobs/${id}`, { method: 'DELETE' }),

  // device token
  registerDeviceToken: (fcmToken: string) =>
    request<void>(`/users/device-token`, { method: 'POST', body: { fcmToken, platform: 'android' } }),

  // employer verification (text fields only; document upload handled separately)
  submitVerification: (body: { gstNumber?: string; companyRegNumber?: string }) =>
    request<void>(`/employer/verification`, { method: 'POST', body }),
  myVerification: () => request<any>(`/employer/verification`),
};

export { BASE_URL };
