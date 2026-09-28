-- =============================================================
-- VelaiConnect – வேலைConnect  |  Supabase PostgreSQL schema
-- Run this in Supabase Dashboard → SQL Editor → New query
-- =============================================================

create extension if not exists "pgcrypto";

-- ---------- ENUM TYPES ----------
do $$ begin
  create type user_role      as enum ('JOB_SEEKER','EMPLOYER','ADMIN');
  create type job_type       as enum ('FULL_TIME','PART_TIME','WORK_FROM_HOME','DAILY_WAGE','CONTRACT','INTERNSHIP');
  create type salary_period  as enum ('HOURLY','DAILY','WEEKLY','MONTHLY','YEARLY');
  create type job_status     as enum ('PENDING_APPROVAL','ACTIVE','REJECTED','CLOSED','REMOVED');
  create type application_status as enum ('APPLIED','UNDER_REVIEW','SHORTLISTED','REJECTED','SELECTED','WITHDRAWN');
  create type report_reason  as enum ('FAKE_JOB','ASKING_FOR_MONEY','WRONG_INFORMATION','SCAM','OTHER');
  create type report_status  as enum ('OPEN','REVIEWING','RESOLVED','DISMISSED');
  create type verification_status as enum ('PENDING','APPROVED','REJECTED');
exception when duplicate_object then null; end $$;

-- ---------- USERS (auth root, no passwords – OTP only) ----------
create table if not exists users (
  id              uuid primary key default gen_random_uuid(),
  mobile_number   varchar(15) not null unique,
  role            user_role   not null default 'JOB_SEEKER',
  is_active       boolean     not null default true,
  mobile_verified boolean     not null default false,
  last_login_at   timestamptz,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
create index if not exists idx_users_role on users(role);
create index if not exists idx_users_active on users(is_active);

-- ---------- PROFILES (shared display info) ----------
create table if not exists profiles (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null unique references users(id) on delete cascade,
  display_name  varchar(120),
  profile_image_url text,
  language      varchar(5) not null default 'en',          -- 'en' | 'ta'
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- ---------- JOB CATEGORIES ----------
create table if not exists job_categories (
  id          uuid primary key default gen_random_uuid(),
  code        varchar(50)  not null unique,               -- IT_SOFTWARE, CONSTRUCTION ...
  name_en     varchar(120) not null,
  name_ta     varchar(120) not null,
  icon        varchar(10)  not null default '💼',
  sort_order  integer      not null default 100,
  is_active   boolean      not null default true,
  created_at  timestamptz  not null default now()
);

-- ---------- JOB SEEKERS ----------
create table if not exists job_seekers (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid not null unique references users(id) on delete cascade,
  full_name           varchar(120) not null,
  location_city       varchar(120),
  location_state      varchar(120) default 'Tamil Nadu',
  latitude            double precision,
  longitude           double precision,
  education           varchar(160),
  skills              text,                                  -- comma separated
  experience_years    numeric(4,1) not null default 0,
  preferred_category_id uuid references job_categories(id),
  expected_salary_min integer check (expected_salary_min >= 0),
  expected_salary_max integer check (expected_salary_max >= 0),
  preferred_job_type  job_type,
  resume_url          text,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);
create index if not exists idx_seekers_city   on job_seekers(location_city);
create index if not exists idx_seekers_cat    on job_seekers(preferred_category_id);

-- ---------- COMPANIES ----------
create table if not exists companies (
  id            uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references users(id) on delete cascade,
  name          varchar(160) not null,
  company_type  varchar(80),
  description   text,
  location_city varchar(120),
  logo_url      text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index if not exists idx_companies_owner on companies(owner_user_id);

-- ---------- EMPLOYERS ----------
create table if not exists employers (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null unique references users(id) on delete cascade,
  company_id      uuid not null references companies(id) on delete cascade,
  contact_person  varchar(120) not null,
  is_verified     boolean not null default false,            -- 🟢 Verified Employer badge
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- ---------- EMPLOYER VERIFICATIONS ----------
create table if not exists employer_verifications (
  id                uuid primary key default gen_random_uuid(),
  employer_id       uuid not null references employers(id) on delete cascade,
  gst_number        varchar(20),
  company_reg_number varchar(60),
  document_urls     text,                                   -- comma separated storage paths
  mobile_verified   boolean not null default false,
  company_verified  boolean not null default false,
  admin_verified    boolean not null default false,
  status            verification_status not null default 'PENDING',
  admin_notes       text,
  reviewed_by       uuid references users(id),
  reviewed_at       timestamptz,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);
create index if not exists idx_verif_employer on employer_verifications(employer_id);
create index if not exists idx_verif_status   on employer_verifications(status);

-- ---------- JOBS ----------
create table if not exists jobs (
  id                  uuid primary key default gen_random_uuid(),
  employer_id         uuid not null references employers(id) on delete cascade,
  category_id         uuid not null references job_categories(id),
  title               varchar(160) not null,
  title_ta            varchar(160),
  description         text not null,
  description_ta      text,
  company_name        varchar(160) not null,
  location_city       varchar(120) not null,
  location_area       varchar(120),
  latitude            double precision,
  longitude           double precision,
  salary_min          integer,
  salary_max          integer,
  salary_period       salary_period not null default 'MONTHLY',
  job_type            job_type not null default 'FULL_TIME',
  experience_required varchar(80) not null default 'FRESHER',  -- FRESHER, 0-1, 1-3, 3-5, 5+
  qualification       varchar(120),
  vacancies           integer not null default 1 check (vacancies > 0),
  contact_phone       varchar(15),
  is_work_from_home   boolean not null default false,
  is_quick_job        boolean not null default false,           -- "Need a job today?" section
  status              job_status not null default 'PENDING_APPROVAL',
  application_deadline date,
  view_count          integer not null default 0,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);
create index if not exists idx_jobs_status    on jobs(status);
create index if not exists idx_jobs_category  on jobs(category_id);
create index if not exists idx_jobs_city      on jobs(location_city);
create index if not exists idx_jobs_type      on jobs(job_type);
create index if not exists idx_jobs_quick     on jobs(is_quick_job) where is_quick_job;
create index if not exists idx_jobs_employer  on jobs(employer_id);
create index if not exists idx_jobs_created   on jobs(created_at desc);

-- ---------- JOB SKILLS ----------
create table if not exists job_skills (
  id       uuid primary key default gen_random_uuid(),
  job_id   uuid not null references jobs(id) on delete cascade,
  skill    varchar(80) not null,
  unique (job_id, skill)
);
create index if not exists idx_job_skills_job on job_skills(job_id);

-- ---------- APPLICATIONS ----------
create table if not exists applications (
  id              uuid primary key default gen_random_uuid(),
  job_id          uuid not null references jobs(id) on delete cascade,
  job_seeker_id   uuid not null references job_seekers(id) on delete cascade,
  resume_url      text,
  cover_note      text,
  status          application_status not null default 'APPLIED',
  applied_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  unique (job_id, job_seeker_id)                            -- one application per job
);
create index if not exists idx_app_job     on applications(job_id);
create index if not exists idx_app_seeker  on applications(job_seeker_id);
create index if not exists idx_app_status  on applications(status);

-- application status history (track Applied → Under Review → …)
create table if not exists application_status_history (
  id            uuid primary key default gen_random_uuid(),
  application_id uuid not null references applications(id) on delete cascade,
  old_status    application_status,
  new_status    application_status not null,
  changed_by    uuid references users(id),
  changed_at    timestamptz not null default now()
);

-- ---------- SAVED JOBS ----------
create table if not exists saved_jobs (
  id          uuid primary key default gen_random_uuid(),
  job_seeker_id uuid not null references job_seekers(id) on delete cascade,
  job_id      uuid not null references jobs(id) on delete cascade,
  saved_at    timestamptz not null default now(),
  unique (job_seeker_id, job_id)
);

-- ---------- NOTIFICATIONS ----------
create table if not exists notifications (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references users(id) on delete cascade,
  title_en    varchar(160) not null,
  title_ta    varchar(160) not null,
  body_en     text not null,
  body_ta     text not null,
  data        jsonb,
  is_read     boolean not null default false,
  created_at  timestamptz not null default now()
);
create index if not exists idx_notif_user on notifications(user_id, created_at desc);

-- device tokens for Firebase Cloud Messaging
create table if not exists device_tokens (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references users(id) on delete cascade,
  fcm_token  text not null unique,
  platform   varchar(10) not null default 'android',
  created_at timestamptz not null default now()
);

-- ---------- JOB ALERTS ----------
create table if not exists job_alerts (
  id              uuid primary key default gen_random_uuid(),
  job_seeker_id   uuid not null references job_seekers(id) on delete cascade,
  category_id     uuid references job_categories(id),
  location_city   varchar(120),
  min_salary      integer,
  job_type        job_type,
  is_active       boolean not null default true,
  created_at      timestamptz not null default now(),
  unique (job_seeker_id, category_id, location_city, job_type)
);

-- ---------- REPORTS (safety: fake jobs / money scams) ----------
create table if not exists reports (
  id           uuid primary key default gen_random_uuid(),
  job_id       uuid references jobs(id) on delete set null,
  reported_by  uuid not null references users(id) on delete cascade,
  reason       report_reason not null,
  details      text,
  status       report_status not null default 'OPEN',
  created_at   timestamptz not null default now(),
  resolved_at  timestamptz,
  resolved_by  uuid references users(id)
);
create index if not exists idx_reports_status on reports(status);
create index if not exists idx_reports_job    on reports(job_id);

-- ---------- OTP CODES (hashed, short lived) ----------
create table if not exists otp_codes (
  id            uuid primary key default gen_random_uuid(),
  mobile_number varchar(15) not null,
  code_hash     varchar(255) not null,                       -- SHA-256 of the 6-digit code
  purpose       varchar(20) not null default 'LOGIN',        -- LOGIN | REGISTRATION
  attempts      integer not null default 0,
  consumed      boolean not null default false,
  expires_at    timestamptz not null,
  created_at    timestamptz not null default now()
);
create index if not exists idx_otp_mobile on otp_codes(mobile_number, created_at desc);

-- simple per-number rate limiting for OTP sends
create table if not exists otp_rate_limit (
  mobile_number varchar(15) primary key,
  window_start  timestamptz not null,
  send_count    integer not null default 0
);

-- ---------- REFRESH TOKENS (JWT rotation) ----------
create table if not exists refresh_tokens (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references users(id) on delete cascade,
  token_hash  varchar(255) not null unique,
  expires_at  timestamptz not null,
  revoked     boolean not null default false,
  created_at  timestamptz not null default now()
);
create index if not exists idx_rt_user on refresh_tokens(user_id);

-- ---------- ADMIN USERS ----------
create table if not exists admin_users (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null unique references users(id) on delete cascade,
  admin_name varchar(120) not null,
  is_super   boolean not null default false,
  created_at timestamptz not null default now()
);

-- ---------- TRANSLATIONS (admin-managed UI strings) ----------
create table if not exists translations (
  id         uuid primary key default gen_random_uuid(),
  key        varchar(160) not null,
  locale     varchar(5)  not null,                            -- 'en' | 'ta'
  value      text not null,
  updated_at timestamptz not null default now(),
  unique (key, locale)
);

-- ---------- SEED: JOB CATEGORIES (English + Tamil) ----------
insert into job_categories (code, name_en, name_ta, icon, sort_order) values
  ('IT_SOFTWARE',    'IT / Software',        'ஐடி / மென்பொருள்',        '💻',  1),
  ('CONSTRUCTION',   'Construction',         'கட்டுமானம்',               '🏗️',  2),
  ('FACTORY',        'Factory',              'தொழிற்சாலை',              '🏭',  3),
  ('DRIVER',         'Driver',               'ஓட்டுநர்',                 '🚗',  4),
  ('DELIVERY',       'Delivery',             'டெலிவரி',                  '📦',  5),
  ('HOTEL_RESTAURANT','Hotel / Restaurant',  'விடுதி / உணவகம்',          '🍽️',  6),
  ('SALES',          'Sales',                'விற்பனை',                  '🤝',  7),
  ('RETAIL',         'Retail',               'சில்லறை விற்பனை',          '🛒',  8),
  ('TEACHING',       'Teaching',             'ஆசிரியர்',                 '👩‍🏫', 9),
  ('HEALTHCARE',     'Healthcare',           'சுகாதாரம்',                '🏥', 10),
  ('AGRICULTURE',    'Agriculture',          'விவசாயம்',                 '🌾', 11),
  ('HOUSEKEEPING',   'Housekeeping',         'வீட்டு வேலை',              '🧹', 12),
  ('ELECTRICIAN',    'Electrician',          'மின்சாரம் / எலக்ட்ரீஷியன்', '⚡', 13),
  ('PLUMBER',        'Plumber',              'குழாய் வேலை / பிளம்பர்',   '🔧', 14),
  ('OFFICE_ADMIN',   'Office / Administration','அலுவலகம் / நிர்வாகம்',   '🗂️', 15),
  ('SECURITY',       'Security',             'பாதுகாப்பு',               '🛡️', 16),
  ('MARKETING',      'Marketing',            'சந்தைப்படுத்தல்',           '📣', 17),
  ('FINANCE',        'Finance',              'நிதி',                     '💰', 18),
  ('OTHER',          'Other',                'மற்றவை',                   '💼', 19)
on conflict (code) do nothing;

-- ---------- UPDATED_AT triggers ----------
create or replace function set_updated_at() returns trigger as $$
begin new.updated_at = now(); return new; end $$ language plpgsql;

do $$
declare t text;
begin
  foreach t in array array['users','profiles','job_seekers','companies','employers',
                           'employer_verifications','jobs','applications'] loop
    execute format('drop trigger if exists trg_%s_updated on %I', t, t);
    execute format('create trigger trg_%s_updated before update on %I
                    for each row execute function set_updated_at()', t, t);
  end loop;
end $$;

-- ---------- STORAGE BUCKETS ----------
insert into storage.buckets (id, name, public) values
  ('resumes',            'resumes',            true),
  ('profile-images',     'profile-images',     true),
  ('company-logos',      'company-logos',      true),
  ('verification-docs',  'verification-docs',  false)
on conflict (id) do nothing;

-- =============================================================
-- Done. Next steps:
--  1. Create an admin user: insert into users (mobile_number, role, mobile_verified)
--     values ('91XXXXXXXXXX','ADMIN',true);
--  2. Copy .env.example → .env in backend/ and fill your Supabase + SMS keys.
-- =============================================================
