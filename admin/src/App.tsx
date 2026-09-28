// VelaiConnect Admin Panel
import React, { useCallback, useEffect, useState } from 'react';

const API = '/api/v1';

type Stats = {
  totalUsers: number; jobSeekers: number; employers: number; totalJobs: number;
  activeJobs: number; pendingJobs: number; totalApplications: number;
  openReports: number; pendingVerifications: number;
};
type UserRow = { id: string; mobileNumber: string; role: string; active: boolean; displayName?: string; createdAt?: string };
type JobRow = { id: string; title: string; companyName: string; city: string; status: string; employerName?: string; createdAt?: string };
type VerifRow = { id: string; companyName: string; contactPerson: string; mobileNumber: string; gstNumber?: string; companyRegNumber?: string; status: string };
type ReportRow = { id: string; jobId?: string; jobTitle?: string; reason: string; details?: string; reporterMobile: string; status: string };
type CategoryRow = { id: string; code: string; nameEn: string; nameTa: string; icon: string; sortOrder: number };

let accessToken = localStorage.getItem('vc_admin_token') ?? '';

async function call<T>(path: string, options: { method?: string; body?: any } = {}): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    method: options.method ?? (options.body ? 'POST' : 'GET'),
    headers: {
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      Authorization: `Bearer ${accessToken}`,
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
  const json = await res.json();
  if (!res.ok || json.success === false) throw new Error(json.message ?? 'Request failed');
  return (json.data !== undefined ? json.data : json) as T;
}

// ---------------- login ----------------
function Login({ onOk }: { onOk: () => void }) {
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [devOtp, setDevOtp] = useState('');
  const [err, setErr] = useState('');

  const send = async () => {
    setErr('');
    try {
      const r = await fetch(`${API}/auth/send-otp?purpose=LOGIN`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobileNumber: mobile }),
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j.message ?? 'Failed');
      setOtpSent(true);
      if (j.data?.devOtp) setDevOtp(j.data.devOtp);
    } catch (e: any) { setErr(e.message); }
  };

  const verify = async () => {
    setErr('');
    try {
      const r = await fetch(`${API}/auth/verify-otp`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobileNumber: mobile, otp, purpose: 'LOGIN' }),
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j.message ?? 'Failed');
      const data = j.data;
      if (data.role !== 'ADMIN') throw new Error('This account is not an admin');
      accessToken = data.accessToken;
      localStorage.setItem('vc_admin_token', accessToken);
      onOk();
    } catch (e: any) { setErr(e.message); }
  };

  return (
    <div className="wrap">
      <div className="card" style={{ maxWidth: 420, margin: '0 auto' }}>
        <h1 className="brand">VelaiConnect <span className="ta">வேலைConnect</span></h1>
        <p className="muted">🛡️ Admin Panel</p>
        <input placeholder="+91 Mobile number" value={mobile} className="inp"
          onChange={e => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))} />
        {!otpSent ? (
          <button className="btn" onClick={send} disabled={mobile.length !== 10}>SEND OTP</button>
        ) : (
          <>
            {devOtp && <p className="muted">Dev OTP: <b>{devOtp}</b></p>}
            <input placeholder="6-digit OTP" value={otp} className="inp"
              onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))} />
            <button className="btn" onClick={verify} disabled={otp.length !== 6}>VERIFY</button>
          </>
        )}
        {err && <p className="err">{err}</p>}
      </div>
    </div>
  );
}

// ---------------- helpers ----------------
function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="stat">
      <div className="statNum">{value}</div>
      <div className="statLabel">{label}</div>
    </div>
  );
}

function Tabs({ active, onChange, tabs }: { active: string; onChange: (t: string) => void; tabs: [string, string][] }) {
  return (
    <div className="tabs">
      {tabs.map(([id, label]) => (
        <button key={id} className={`tab ${active === id ? 'on' : ''}`} onClick={() => onChange(id)}>{label}</button>
      ))}
    </div>
  );
}

// ---------------- app ----------------
export default function App() {
  const [loggedIn, setLoggedIn] = useState(!!accessToken);
  const [tab, setTab] = useState('stats');
  const [stats, setStats] = useState<Stats | null>(null);
  const [users, setUsers] = useState<UserRow[]>([]);
  const [jobs, setJobs] = useState<JobRow[]>([]);
  const [jobStatus, setJobStatus] = useState('PENDING_APPROVAL');
  const [verifs, setVerifs] = useState<VerifRow[]>([]);
  const [reports, setReports] = useState<ReportRow[]>([]);
  const [cats, setCats] = useState<CategoryRow[]>([]);
  const [msg, setMsg] = useState('');

  const flash = (m: string) => { setMsg(m); setTimeout(() => setMsg(''), 2500); };

  const loadAll = useCallback(async () => {
    try {
      setStats(await call<Stats>('/admin/stats'));
      setUsers((await call<{ content: UserRow[] }>('/admin/users?size=50')).content);
      setJobs((await call<{ content: JobRow[] }>(`/admin/jobs?status=${jobStatus}&size=50`)).content);
      setVerifs(await call<VerifRow[]>('/admin/verifications'));
      setReports(await call<ReportRow[]>('/admin/reports'));
      setCats(await call<CategoryRow[]>('/categories'));
    } catch (e: any) {
      if (String(e.message).includes('permission') || String(e.message).includes('401')) {
        accessToken = ''; localStorage.removeItem('vc_admin_token'); setLoggedIn(false);
      }
    }
  }, [jobStatus]);

  useEffect(() => { if (loggedIn) loadAll(); }, [loggedIn, loadAll]);

  if (!loggedIn) return <Login onOk={() => setLoggedIn(true)} />;

  const act = async (fn: () => Promise<any>, ok: string) => {
    try { await fn(); flash(ok); loadAll(); } catch (e: any) { flash(e.message); }
  };

  return (
    <div className="wrap">
      <header className="topbar">
        <h1>VelaiConnect Admin 🛡️</h1>
        <button className="btn small outline" onClick={() => {
          accessToken = ''; localStorage.removeItem('vc_admin_token'); setLoggedIn(false);
        }}>Logout</button>
      </header>

      {msg && <div className="flash">{msg}</div>}

      <Tabs active={tab} onChange={setTab} tabs={[
        ['stats', '📊 Stats'], ['jobs', '💼 Jobs'], ['users', '👤 Users'],
        ['verifs', '✅ Verifications'], ['reports', '⚠️ Reports'], ['cats', '🗂 Categories'], ['broadcast', '📣 Notify'],
      ]} />

      {tab === 'stats' && stats && (
        <div className="grid">
          <Stat label="Users" value={stats.totalUsers} />
          <Stat label="Job Seekers" value={stats.jobSeekers} />
          <Stat label="Employers" value={stats.employers} />
          <Stat label="Jobs" value={stats.totalJobs} />
          <Stat label="Active Jobs" value={stats.activeJobs} />
          <Stat label="Pending Jobs" value={stats.pendingJobs} />
          <Stat label="Applications" value={stats.totalApplications} />
          <Stat label="Open Reports" value={stats.openReports} />
          <Stat label="Pending Verifications" value={stats.pendingVerifications} />
        </div>
      )}

      {tab === 'jobs' && (
        <>
          <div className="row">
            {['PENDING_APPROVAL', 'ACTIVE', 'REJECTED', 'CLOSED', 'REMOVED'].map(s => (
              <button key={s} className={`tab ${jobStatus === s ? 'on' : ''}`} onClick={() => setJobStatus(s)}>{s}</button>
            ))}
          </div>
          <table>
            <thead><tr><th>Job</th><th>Company</th><th>City</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {jobs.map(j => (
                <tr key={j.id}>
                  <td>{j.title}</td><td>{j.companyName}</td><td>{j.city}</td><td>{j.status}</td>
                  <td>
                    {j.status !== 'ACTIVE' && (
                      <button className="btn small" onClick={() => act(() => call(`/admin/jobs/${j.id}/approve`, { method: 'PATCH' }), 'Approved')}>Approve</button>
                    )}{' '}
                    <button className="btn small danger" onClick={() => act(() => call(`/admin/jobs/${j.id}/reject`, { method: 'PATCH', body: {} }), 'Rejected')}>Reject</button>{' '}
                    <button className="btn small danger" onClick={() => act(() => call(`/admin/jobs/${j.id}`, { method: 'DELETE' }), 'Removed')}>Remove</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      {tab === 'users' && (
        <table>
          <thead><tr><th>Name</th><th>Mobile</th><th>Role</th><th>Status</th><th>Action</th></tr></thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id}>
                <td>{u.displayName ?? '—'}</td><td>{u.mobileNumber}</td><td>{u.role}</td>
                <td>{u.active ? 'Active' : 'Blocked'}</td>
                <td>
                  <button className={`btn small ${u.active ? 'danger' : ''}`} onClick={() =>
                    act(() => call(`/admin/users/${u.id}/block`, { method: 'PATCH', body: { active: !u.active } }),
                      u.active ? 'Blocked' : 'Unblocked')}>
                    {u.active ? 'Block' : 'Unblock'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {tab === 'verifs' && (
        <table>
          <thead><tr><th>Company</th><th>Contact</th><th>Mobile</th><th>GST</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            {verifs.map(v => (
              <tr key={v.id}>
                <td>{v.companyName}</td><td>{v.contactPerson}</td><td>{v.mobileNumber}</td>
                <td>{v.gstNumber ?? '—'}</td><td>{v.status}</td>
                <td>
                  <button className="btn small" onClick={() =>
                    act(() => call(`/admin/verifications/${v.id}/review`, { method: 'PATCH', body: { approve: true } }), 'Verified')}>Approve</button>{' '}
                  <button className="btn small danger" onClick={() =>
                    act(() => call(`/admin/verifications/${v.id}/review`, { method: 'PATCH', body: { approve: false } }), 'Rejected')}>Reject</button>
                </td>
              </tr>
            ))}
            {verifs.length === 0 && <tr><td colSpan={6} className="muted">No verification requests</td></tr>}
          </tbody>
        </table>
      )}

      {tab === 'reports' && (
        <table>
          <thead><tr><th>Job</th><th>Reason</th><th>Details</th><th>Reporter</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            {reports.map(r => (
              <tr key={r.id}>
                <td>{r.jobTitle ?? '—'}</td><td>{r.reason}</td><td>{r.details ?? '—'}</td>
                <td>{r.reporterMobile}</td><td>{r.status}</td>
                <td>
                  {r.jobId && (
                    <button className="btn small danger" onClick={() =>
                      act(() => call(`/admin/reports/${r.id}`, { method: 'PATCH', body: { status: 'RESOLVED', action: 'REMOVE_JOB' } }), 'Job removed & report resolved')}>Remove Job</button>
                  )}{' '}
                  <button className="btn small" onClick={() =>
                    act(() => call(`/admin/reports/${r.id}`, { method: 'PATCH', body: { status: 'DISMISSED' } }), 'Dismissed')}>Dismiss</button>
                </td>
              </tr>
            ))}
            {reports.length === 0 && <tr><td colSpan={6} className="muted">No reports 🎉</td></tr>}
          </tbody>
        </table>
      )}

      {tab === 'cats' && <Categories cats={cats} reload={loadAll} flash={flash} />}
      {tab === 'broadcast' && <Broadcast flash={flash} />}
    </div>
  );
}

function Categories({ cats, reload, flash }: { cats: CategoryRow[]; reload: () => void; flash: (m: string) => void }) {
  const [code, setCode] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [nameTa, setNameTa] = useState('');
  const [icon, setIcon] = useState('💼');

  const create = async () => {
    try {
      await call('/admin/categories', { body: { code, nameEn, nameTa, icon } });
      flash('Category created'); setCode(''); setNameEn(''); setNameTa(''); reload();
    } catch (e: any) { flash(e.message); }
  };

  return (
    <>
      <div className="card row wrap">
        <input className="inp" placeholder="CODE" value={code} onChange={e => setCode(e.target.value.toUpperCase())} />
        <input className="inp" placeholder="English name" value={nameEn} onChange={e => setNameEn(e.target.value)} />
        <input className="inp" placeholder="தமிழ் பெயர்" value={nameTa} onChange={e => setNameTa(e.target.value)} />
        <input className="inp" style={{ width: 60 }} value={icon} onChange={e => setIcon(e.target.value)} />
        <button className="btn" onClick={create} disabled={!code || !nameEn || !nameTa}>Add Category</button>
      </div>
      <table>
        <thead><tr><th>Icon</th><th>Code</th><th>English</th><th>தமிழ்</th></tr></thead>
        <tbody>{cats.map(c => (
          <tr key={c.id}><td>{c.icon}</td><td>{c.code}</td><td>{c.nameEn}</td><td>{c.nameTa}</td></tr>
        ))}</tbody>
      </table>
    </>
  );
}

function Broadcast({ flash }: { flash: (m: string) => void }) {
  const [f, setF] = useState({ titleEn: '', titleTa: '', bodyEn: '', bodyTa: '' });
  const send = async () => {
    try {
      await call('/admin/broadcast', { body: f });
      flash('Notification sent to all users');
      setF({ titleEn: '', titleTa: '', bodyEn: '', bodyTa: '' });
    } catch (e: any) { flash(e.message); }
  };
  return (
    <div className="card" style={{ maxWidth: 560 }}>
      <h3>📣 Send Notification (bilingual)</h3>
      <input className="inp" placeholder="Title (English)" value={f.titleEn}
        onChange={e => setF({ ...f, titleEn: e.target.value })} />
      <input className="inp" placeholder="Title (தமிழ்)" value={f.titleTa}
        onChange={e => setF({ ...f, titleTa: e.target.value })} />
      <textarea className="inp" placeholder="Body (English)" value={f.bodyEn}
        onChange={e => setF({ ...f, bodyEn: e.target.value })} />
      <textarea className="inp" placeholder="Body (தமிழ்)" value={f.bodyTa}
        onChange={e => setF({ ...f, bodyTa: e.target.value })} />
      <button className="btn" onClick={send}
        disabled={!f.titleEn || !f.titleTa || !f.bodyEn || !f.bodyTa}>SEND</button>
    </div>
  );
}
