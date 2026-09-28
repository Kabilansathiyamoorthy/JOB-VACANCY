# VelaiConnect – வேலைConnect

**A universal job vacancy platform for Tamil Nadu & India** — find jobs and hire workers across every domain: IT, construction, factory, driver, delivery, hotel, sales, teaching, healthcare, agriculture, housekeeping, electrician, plumber, office, security, marketing, finance and more.

🇮🇳 **Mobile OTP login** (no passwords) • 🌐 **Full English | தமிழ் support** • ⚡ **Quick Jobs (daily wage)** • 🟢 **Verified Employers** • ⚠️ **Anti-scam reporting**

---

## Project Structure

```
velaiconnect/
├── mobile/          → React Native (Expo) app  — job seekers + employers
├── backend/         → Java Spring Boot REST API (Controller → Service → Repository)
├── admin/           → Admin web dashboard (React + Vite)
├── supabase/        → PostgreSQL schema for Supabase (run once in SQL editor)
└── .github/         → CI: APK build + backend/admin builds
```

## Tech Stack

| Layer | Technology |
|---|---|
| Mobile app | React Native (Expo), React Navigation |
| Backend | Java 17, Spring Boot 3.3, Spring Security + JWT, Spring Data JPA |
| Database | **Supabase PostgreSQL** |
| Files | **Supabase Storage** (resumes, photos, logos, verification docs) |
| Push (optional) | Firebase Cloud Messaging |
| Auth | Mobile number + OTP (Twilio / MSG91 / Fast2SMS / dev mode) |
| Admin panel | React + Vite |

---

## Quick Start

### 1. Create the database (5 minutes)

1. Create a free project at [supabase.com](https://supabase.com).
2. Open **SQL Editor → New query**, paste all of [`supabase/schema.sql`](supabase/schema.sql), click **Run**.
3. Note down: Project URL, `service_role` key (Settings → API), DB password (Settings → Database), and S3 access keys (Settings → Storage → S3 access keys).

### 2. Run the backend

```bash
cd backend
cp .env.example .env            # fill in your Supabase values
# set SUPABASE_DB_URL, SUPABASE_DB_PASSWORD, SUPABASE_URL, SUPABASE_SERVICE_KEY,
# SUPABASE_S3_ACCESS_KEY, SUPABASE_S3_SECRET_KEY, JWT_SECRET (openssl rand -base64 64)
./mvnw spring-boot:run          # (Windows: mvnw.cmd spring-boot:run) → http://localhost:8080
```

> **Dev OTP mode:** with `SMS_PROVIDER=none` and `OTP_DEV_MODE=true`, the OTP is printed in the
> backend console **and returned in the API response** so you can test without an SMS provider.
> Set a real provider + `OTP_DEV_MODE=false` before going live.

### 3. Run the mobile app

```bash
cd mobile
npm install
npm start                       # Expo dev server → press 'a' for Android emulator
```

The app connects to `http://10.0.2.2:8080` (Android emulator → localhost) by default.
For a real device, set your PC's LAN IP in `mobile/app.json → extra.apiBaseUrl`,
e.g. `http://192.168.1.5:8080/api/v1`.

### 4. Run the admin panel

```bash
cd admin
npm install
npm run dev                     # http://localhost:5173 (proxies /api to :8080)
```

Create the first admin (Supabase SQL editor):

```sql
insert into users (mobile_number, role, mobile_verified) values ('91XXXXXXXXXX','ADMIN',true);
```

---

## Build the APK

### Easiest: GitHub Actions (free, no local Android setup)

1. Push this repository to GitHub.
2. The **Build Android APK** workflow runs automatically on push (or trigger it from
   *Actions → Build Android APK → Run workflow*).
3. Download `velaiconnect-debug-apk` from the run's **Artifacts** and install it on any Android phone.

### Locally with EAS

```bash
cd mobile
npm i -g eas-cli
eas build -p android --profile preview --local   # or without --local using Expo's cloud
```

---

## Roles & Security

- `JOB_SEEKER` — search/apply/save jobs, job alerts, applications tracking
- `EMPLOYER` — post/manage jobs, review applicants, verification badge
- `ADMIN` — web panel: approve jobs, verify employers, handle reports, block users, broadcast notices

JWT access tokens (1 h) + rotating refresh tokens (30 d), OTP hashed with SHA-256,
5-minute expiry, 5 wrong-attempt limit, per-number hourly rate limiting,
role checks on every protected endpoint, file-type/size validation on uploads.

## ⚠️ Safety first

The app shows a permanent warning: **never pay money to get a job**. Every job has a
⚠️ Report button (Fake job / Asking for money / Wrong info / Scam / Other) feeding the
admin moderation queue. Unverified employers' jobs wait in `PENDING_APPROVAL` until an
admin approves them.

## Language

Everything — buttons, labels, navigation, forms, validation errors, job categories,
statuses, notifications — is available in **English and தமிழ்**. The selection is saved
on the device and restored on next launch.
