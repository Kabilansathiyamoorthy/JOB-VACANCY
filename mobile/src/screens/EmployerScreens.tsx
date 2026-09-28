// VelaiConnect – Employer screens
import React, { useState } from 'react';
import {
  View, Text, ScrollView, FlatList, TextInput, TouchableOpacity, StyleSheet, Modal,
} from 'react-native';
import { colors, spacing, radius, type } from '../theme';
import { useApp } from '../context';
import { api, ApiError, Job, ApplicationView, EmployerProfile } from '../api';
import {
  PrimaryButton, Input, Card, Chip, SectionHeader, Loading, EmptyState, ErrorState,
  Toast, PickerSheet, salaryText,
} from '../components';

// =============== EMPLOYER DASHBOARD ===============
export function EmployerDashboardScreen({ navigation }: any) {
  const { t, lang, displayName } = useApp();
  const [stats, setStats] = useState<Record<string, number>>({});
  const [jobs, setJobs] = useState<Job[]>([]);
  const [profile, setProfile] = useState<EmployerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = React.useCallback(async () => {
    try {
      const [s, j, p] = await Promise.all([
        api.employerStats().catch(() => ({})),
        api.myJobs().catch(() => []),
        api.employerProfile().catch(() => null),
      ]);
      setStats(s); setJobs(j); setProfile(p);
      setError('');
    } catch (e) {
      setError(t('misc.networkError'));
    }
    setLoading(false);
  }, [lang]);

  React.useEffect(() => {
    const unsub = navigation.addListener('focus', load);
    return unsub;
  }, [load, navigation]);

  if (loading) return <Loading />;
  if (error) return <ErrorState message={error} onRetry={load} />;

  const totalApplicants = Object.values(stats).reduce((a, b) => a + b, 0);
  const activeJobs = jobs.filter(j => j.status === 'ACTIVE').length;
  const pending = jobs.filter(j => j.status === 'PENDING_APPROVAL').length;

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.bg }} contentContainerStyle={{ paddingBottom: 32 }}>
      <View style={styles.header}>
        <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: 14 }}>{t('home.welcome')}</Text>
        <Text style={{ color: '#fff', fontSize: 20, fontWeight: '800' }}>{displayName ?? ''}</Text>
        {profile?.verified && (
          <View style={styles.verifiedBadge}>
            <Text style={{ color: '#fff', fontSize: 12, fontWeight: '800' }}>{t('profile.verified')}</Text>
          </View>
        )}
      </View>

      {/* stats */}
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Text style={styles.statNum}>{jobs.length}</Text>
          <Text style={styles.statLabel}>{t('emp.totalJobs')}</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNum}>{activeJobs}</Text>
          <Text style={styles.statLabel}>{t('emp.activeJobs')}</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNum}>{pending}</Text>
          <Text style={styles.statLabel}>{t('emp.pendingJobs')}</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNum}>{totalApplicants}</Text>
          <Text style={styles.statLabel}>{t('emp.totalApplicants')}</Text>
        </View>
      </View>

      {/* post job CTA */}
      <TouchableOpacity style={styles.postCta} activeOpacity={0.9}
        onPress={() => navigation.navigate('PostJob')}>
        <Text style={{ color: '#fff', fontWeight: '800', fontSize: 16 }}>➕ {t('btn.postJob')}</Text>
      </TouchableOpacity>

      {/* recent jobs */}
      <View style={{ paddingHorizontal: spacing.lg }}>
        <SectionHeader title={t('emp.myJobs')} actionTitle={t('home.viewAll')}
          onAction={() => navigation.navigate('MyJobs')} />
        {jobs.slice(0, 3).map(j => (
          <Card key={j.id} style={{ marginBottom: spacing.md }}>
            <Text style={{ fontWeight: '800', color: colors.text }}>{j.title}</Text>
            <Text style={{ color: colors.textSecondary, fontSize: 12, marginTop: 2 }}>
              {t('status.' + j.status)} · {j.locationCity}
            </Text>
          </Card>
        ))}
      </View>
    </ScrollView>
  );
}

// =============== POST JOB ===============
export function PostJobScreen({ navigation, route }: any) {
  const { t, lang } = useApp();
  const editId: string | undefined = route.params?.jobId;
  const [categories, setCategories] = useState<any[]>([]);
  const [title, setTitle] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [categoryLabel, setCategoryLabel] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [description, setDescription] = useState('');
  const [city, setCity] = useState('');
  const [area, setArea] = useState('');
  const [salaryMin, setSalaryMin] = useState('');
  const [salaryMax, setSalaryMax] = useState('');
  const [salaryPeriod, setSalaryPeriod] = useState('MONTHLY');
  const [salaryPeriodLabel, setSalaryPeriodLabel] = useState('');
  const [jobType, setJobType] = useState('FULL_TIME');
  const [jobTypeLabel, setJobTypeLabel] = useState('');
  const [experience, setExperience] = useState('FRESHER');
  const [experienceLabel, setExperienceLabel] = useState('');
  const [qualification, setQualification] = useState('');
  const [skills, setSkills] = useState('');
  const [vacancies, setVacancies] = useState('1');
  const [deadline, setDeadline] = useState('');
  const [contact, setContact] = useState('');
  const [quickJob, setQuickJob] = useState(false);
  const [wfh, setWfh] = useState(false);
  const [showCat, setShowCat] = useState(false);
  const [showPeriod, setShowPeriod] = useState(false);
  const [showType, setShowType] = useState(false);
  const [showExp, setShowExp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [toast, setToast] = useState<{ show: boolean; msg: string; type: 'success' | 'error' | 'info' }>({
    show: false, msg: '', type: 'info',
  });

  React.useEffect(() => {
    api.categories().then(setCategories).catch(() => {});
    api.employerProfile().then(p => {
      setCompanyName(p.companyName);
      setContact(p.mobileNumber);
      setCity(p.city ?? '');
    }).catch(() => {});
    if (editId) {
      api.myJobs().then(jobs => {
        const j = jobs.find(x => x.id === editId);
        if (j) {
          setTitle(j.title); setCategoryId(j.categoryCode);
          const c = categories.find(c => c.code === j.categoryCode);
          setCategoryLabel(c ? `${c.icon} ${lang === 'ta' ? c.nameTa : c.nameEn}` : j.categoryCode);
          setCompanyName(j.companyName); setDescription(j.description);
          setCity(j.locationCity); setArea(j.locationArea ?? '');
          setSalaryMin(j.salaryMin?.toString() ?? ''); setSalaryMax(j.salaryMax?.toString() ?? '');
          setSalaryPeriod(j.salaryPeriod); setSalaryPeriodLabel(t('sp.' + j.salaryPeriod));
          setJobType(j.jobType); setJobTypeLabel(t('jt.' + j.jobType));
          setExperience(j.experienceRequired); setExperienceLabel(j.experienceRequired);
          setQualification(j.qualification ?? ''); setSkills(j.skills.join(', '));
          setVacancies(j.vacancies.toString()); setDeadline(j.applicationDeadline ?? '');
          setContact(j.contactPhone ?? '');
          setQuickJob(j.quickJob); setWfh(j.workFromHome);
        }
      }).catch(() => {});
    }
  }, [editId]);

  const periodOptions = ['HOURLY', 'DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY'];
  const typeOptions = ['FULL_TIME', 'PART_TIME', 'WORK_FROM_HOME', 'DAILY_WAGE', 'CONTRACT', 'INTERNSHIP'];
  const expOptions = ['FRESHER', '0-1', '1-3', '3-5', '5+'];

  const submit = async () => {
    const errs: Record<string, string> = {};
    if (!title.trim()) errs.title = t('misc.required');
    if (!categoryLabel) errs.category = t('misc.required');
    if (!companyName.trim()) errs.companyName = t('misc.required');
    if (!description.trim()) errs.description = t('misc.required');
    if (!city.trim()) errs.city = t('misc.required');
    if (!skills.trim()) errs.skills = t('misc.required');
    setErrors(errs);
    if (Object.keys(errs).length) return;

    setLoading(true);
    try {
      const body = {
        title,
        categoryId: categories.find(c => c.code === categoryId)?.id ?? '',
        companyName, description,
        locationCity: city, locationArea: area || undefined,
        salaryMin: salaryMin ? parseInt(salaryMin) : undefined,
        salaryMax: salaryMax ? parseInt(salaryMax) : undefined,
        salaryPeriod, jobType,
        experienceRequired: experience,
        qualification: qualification || undefined,
        skills: skills.split(',').map(s => s.trim()).filter(Boolean),
        vacancies: parseInt(vacancies) || 1,
        applicationDeadline: deadline || undefined,
        contactPhone: contact || undefined,
        quickJob, workFromHome: wfh,
      };
      if (editId) {
        await api.editJob(editId, body);
      } else {
        await api.postJob(body);
      }
      setLoading(false);
      setToast({ show: true, msg: t('post.posted'), type: 'success' });
      setTimeout(() => navigation.goBack(), 1200);
    } catch (e: any) {
      setLoading(false);
      const msg = e instanceof ApiError ? (lang === 'ta' && e.messageTa ? e.messageTa : e.message) : t('misc.error');
      setToast({ show: true, msg, type: 'error' });
    }
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.bg }} contentContainerStyle={{ padding: spacing.lg }}>
      <Text style={[type.h2, { color: colors.text, marginBottom: spacing.lg }]}>
        {editId ? t('btn.edit') : t('post.title')}
      </Text>

      <Input label={t('post.jobTitle')} value={title} onChangeText={setTitle} error={errors.title}
        placeholder="Construction Helper / கட்டுமான உதவியாளர்" />
      <TouchableOpacity onPress={() => setShowCat(true)}>
        <Input label={t('post.category')} value={categoryLabel} editable={false} error={errors.category} />
      </TouchableOpacity>
      <Input label={t('post.company')} value={companyName} onChangeText={setCompanyName} error={errors.companyName} />
      <Input label={t('post.description')} value={description} onChangeText={setDescription} multiline error={errors.description} />
      <View style={{ flexDirection: 'row' }}>
        <View style={{ flex: 1, marginRight: spacing.sm }}>
          <Input label={t('post.city')} value={city} onChangeText={setCity} error={errors.city} />
        </View>
        <View style={{ flex: 1, marginLeft: spacing.sm }}>
          <Input label={t('post.area')} value={area} onChangeText={setArea} />
        </View>
      </View>

      <View style={{ flexDirection: 'row' }}>
        <View style={{ flex: 1, marginRight: spacing.sm }}>
          <Input label={t('post.salaryMin')} value={salaryMin} onChangeText={setSalaryMin} keyboardType="number-pad" />
        </View>
        <View style={{ flex: 1, marginLeft: spacing.sm }}>
          <Input label={t('post.salaryMax')} value={salaryMax} onChangeText={setSalaryMax} keyboardType="number-pad" />
        </View>
      </View>

      <TouchableOpacity onPress={() => setShowPeriod(true)}>
        <Input label={t('post.salaryPeriod')} value={salaryPeriodLabel || t('sp.MONTHLY')} editable={false} />
      </TouchableOpacity>
      <TouchableOpacity onPress={() => setShowType(true)}>
        <Input label={t('field.jobType')} value={jobTypeLabel || t('jt.FULL_TIME')} editable={false} />
      </TouchableOpacity>
      <TouchableOpacity onPress={() => setShowExp(true)}>
        <Input label={t('post.experience')} value={experienceLabel || 'FRESHER'} editable={false} />
      </TouchableOpacity>
      <Input label={t('post.qualification')} value={qualification} onChangeText={setQualification} />

      <Input label={t('post.skills')} value={skills} onChangeText={setSkills} error={errors.skills}
        placeholder="Masonry, Painting…" />

      <View style={{ flexDirection: 'row' }}>
        <View style={{ flex: 1, marginRight: spacing.sm }}>
          <Input label={t('post.vacancies')} value={vacancies} onChangeText={setVacancies} keyboardType="number-pad" />
        </View>
        <View style={{ flex: 1, marginLeft: spacing.sm }}>
          <Input label={t('post.deadline')} value={deadline} onChangeText={setDeadline} placeholder="2026-12-31" />
        </View>
      </View>

      <Input label={t('post.contact')} value={contact} onChangeText={setContact} keyboardType="phone-pad" />

      <View style={{ flexDirection: 'row', marginBottom: spacing.lg }}>
        <Chip label={t('post.quickJob')} selected={quickJob} onPress={() => setQuickJob(!quickJob)} />
        <Chip label={t('post.wfh')} selected={wfh} onPress={() => setWfh(!wfh)} />
      </View>

      <PrimaryButton title={t('btn.submit')} onPress={submit} loading={loading} />

      <PickerSheet visible={showCat} title={t('post.category')}
        options={categories.map(c => ({ label: `${c.icon} ${lang === 'ta' ? c.nameTa : c.nameEn}`, value: c.code }))}
        selectedValue={categoryId}
        onSelect={v => {
          setCategoryId(v);
          const c = categories.find(x => x.code === v);
          setCategoryLabel(c ? `${c.icon} ${lang === 'ta' ? c.nameTa : c.nameEn}` : '');
        }}
        onClose={() => setShowCat(false)} />
      <PickerSheet visible={showPeriod} title={t('post.salaryPeriod')}
        options={periodOptions.map(p => ({ label: t('sp.' + p), value: p }))}
        selectedValue={salaryPeriod} onSelect={v => { setSalaryPeriod(v); setSalaryPeriodLabel(t('sp.' + v)); }}
        onClose={() => setShowPeriod(false)} />
      <PickerSheet visible={showType} title={t('field.jobType')}
        options={typeOptions.map(p => ({ label: t('jt.' + p), value: p }))}
        selectedValue={jobType} onSelect={v => { setJobType(v); setJobTypeLabel(t('jt.' + v)); }}
        onClose={() => setShowType(false)} />
      <PickerSheet visible={showExp} title={t('post.experience')}
        options={expOptions.map(p => ({ label: p, value: p }))}
        selectedValue={experience} onSelect={v => { setExperience(v); setExperienceLabel(v); }}
        onClose={() => setShowExp(false)} />
      <Toast visible={toast.show} message={toast.msg} type={toast.type} onHide={() => setToast(s => ({ ...s, show: false }))} />
    </ScrollView>
  );
}

// =============== MY JOBS ===============
export function MyJobsScreen({ navigation }: any) {
  const { t, lang } = useApp();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ show: boolean; msg: string; type: 'success' | 'error' | 'info' }>({
    show: false, msg: '', type: 'info',
  });

  const load = React.useCallback(async () => {
    try {
      setJobs(await api.myJobs());
      setError('');
    } catch {
      setError(t('misc.networkError'));
    }
    setLoading(false);
  }, [lang]);

  React.useEffect(() => {
    const unsub = navigation.addListener('focus', load);
    return unsub;
  }, [load, navigation]);

  const closeJob = async (id: string) => {
    try {
      await api.closeJob(id);
      setToast({ show: true, msg: t('emp.closedJob'), type: 'success' });
      load();
    } catch {
      setToast({ show: true, msg: t('misc.error'), type: 'error' });
    }
  };

  const deleteJob = async (id: string) => {
    setConfirmId(null);
    try {
      await api.deleteJob(id);
      setToast({ show: true, msg: t('emp.deletedJob'), type: 'success' });
      load();
    } catch {
      setToast({ show: true, msg: t('misc.error'), type: 'error' });
    }
  };

  if (loading) return <Loading />;
  if (error) return <ErrorState message={error} onRetry={load} />;

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <Text style={styles.screenTitle}>💼 {t('emp.myJobs')}</Text>
      {jobs.length === 0 ? (
        <EmptyState emoji="💼" title={t('emp.noJobs')} subtitle={t('emp.noJobsDesc')} />
      ) : (
        <FlatList
          data={jobs}
          keyExtractor={j => j.id}
          contentContainerStyle={{ padding: spacing.lg }}
          renderItem={({ item }) => (
            <Card style={{ marginBottom: spacing.md }}>
              <Text style={{ fontWeight: '800', color: colors.text, fontSize: 16 }}>{item.title}</Text>
              <Text style={{ color: colors.textSecondary, fontSize: 13, marginTop: 2 }}>
                📍 {item.locationCity} · {salaryText(item, t)}
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: spacing.sm, gap: 8 }}>
                <View style={[styles.statusChip,
                  { backgroundColor: item.status === 'ACTIVE' ? colors.successLight
                    : item.status === 'PENDING_APPROVAL' ? colors.warningLight : colors.dangerLight }]}>
                  <Text style={{ fontSize: 11, fontWeight: '800',
                    color: item.status === 'ACTIVE' ? colors.success
                      : item.status === 'PENDING_APPROVAL' ? colors.warning : colors.danger }}>
                    {t('status.' + item.status)}
                  </Text>
                </View>
                <Text style={{ color: colors.textLight, fontSize: 12 }}>👁 {item.viewCount ?? 0}</Text>
              </View>

              <View style={{ flexDirection: 'row', marginTop: spacing.lg, gap: 8 }}>
                <TouchableOpacity style={styles.jobAction} onPress={() =>
                  navigation.navigate('Applicants', { jobId: item.id, jobTitle: item.title })}>
                  <Text style={{ color: colors.primary, fontWeight: '700', fontSize: 13 }}>👥 {t('emp.applicants')}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.jobAction} onPress={() =>
                  navigation.navigate('PostJob', { jobId: item.id })}>
                  <Text style={{ color: colors.primary, fontWeight: '700', fontSize: 13 }}>✏️ {t('btn.edit')}</Text>
                </TouchableOpacity>
                {item.status === 'ACTIVE' && (
                  <TouchableOpacity style={styles.jobAction} onPress={() => closeJob(item.id)}>
                    <Text style={{ color: colors.warning, fontWeight: '700', fontSize: 13 }}>🔒 {t('emp.closeJob')}</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity style={styles.jobAction} onPress={() => setConfirmId(item.id)}>
                  <Text style={{ color: colors.danger, fontWeight: '700', fontSize: 13 }}>🗑 {t('btn.delete')}</Text>
                </TouchableOpacity>
              </View>
            </Card>
          )}
        />
      )}

      <Modal transparent visible={!!confirmId} animationType="fade">
        <View style={styles.confirmWrap}>
          <View style={styles.confirmCard}>
            <Text style={[type.h3, { color: colors.text, textAlign: 'center' }]}>{t('emp.confirmDelete')}</Text>
            <View style={{ flexDirection: 'row', gap: spacing.md, marginTop: spacing.xl }}>
              <View style={{ flex: 1 }}>
                <PrimaryButton variant="outline" title={t('btn.close')} onPress={() => setConfirmId(null)} />
              </View>
              <View style={{ flex: 1 }}>
                <PrimaryButton variant="danger" title={t('btn.delete')} onPress={() => confirmId && deleteJob(confirmId)} />
              </View>
            </View>
          </View>
        </View>
      </Modal>

      <Toast visible={toast.show} message={toast.msg} type={toast.type} onHide={() => setToast(s => ({ ...s, show: false }))} />
    </View>
  );
}

// =============== APPLICANTS ===============
const APPLICANT_STATUSES = ['APPLIED', 'UNDER_REVIEW', 'SHORTLISTED', 'REJECTED', 'SELECTED'];

export function ApplicantsScreen({ navigation, route }: any) {
  const { t, lang } = useApp();
  const jobId: string | undefined = route.params?.jobId;
  const [status, setStatus] = useState('');
  const [apps, setApps] = useState<ApplicationView[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState<{ show: boolean; msg: string; type: 'success' | 'error' | 'info' }>({
    show: false, msg: '', type: 'info',
  });

  const load = React.useCallback(async () => {
    try {
      const resp = await api.applicants({ jobId, status: status || undefined, size: 50 });
      setApps(resp.content);
      setError('');
    } catch {
      setError(t('misc.networkError'));
    }
    setLoading(false);
  }, [jobId, status, lang]);

  React.useEffect(() => { load(); }, [load]);
  React.useEffect(() => {
    const unsub = navigation.addListener('focus', load);
    return unsub;
  }, [load, navigation]);

  const setStatusFor = async (id: string, s: string) => {
    try {
      await api.updateApplicationStatus(id, s);
      setToast({ show: true, msg: t('emp.statusUpdated'), type: 'success' });
      load();
    } catch {
      setToast({ show: true, msg: t('misc.error'), type: 'error' });
    }
  };

  if (loading) return <Loading />;
  if (error) return <ErrorState message={error} onRetry={load} />;

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <Text style={styles.screenTitle}>👥 {route.params?.jobTitle ?? t('emp.applicants')}</Text>

      <ScrollView horizontal showsHorizontalScrollIndicator={false}
        style={{ paddingHorizontal: spacing.lg }} contentContainerStyle={{ paddingRight: spacing.lg }}>
        <Chip label={t('jobs.allCategories')} selected={!status} onPress={() => setStatus('')} />
        {APPLICANT_STATUSES.map(s => (
          <Chip key={s} label={t('status.' + s)} selected={status === s} onPress={() => setStatus(s)} />
        ))}
      </ScrollView>

      {apps.length === 0 ? (
        <EmptyState emoji="👥" title={t('app.noApplicants')} />
      ) : (
        <FlatList
          data={apps}
          keyExtractor={a => a.id}
          contentContainerStyle={{ padding: spacing.lg }}
          renderItem={({ item }) => (
            <Card style={{ marginBottom: spacing.md }}>
              <Text style={{ fontWeight: '800', color: colors.text, fontSize: 16 }}>{item.seekerName}</Text>
              <Text style={{ color: colors.textSecondary, fontSize: 13, marginTop: 2 }}>
                📞 {item.seekerMobile} · 📍 {item.seekerCity ?? '—'}
              </Text>
              <Text style={{ color: colors.textSecondary, fontSize: 13, marginTop: 2 }}>
                {t('app.skills')}: {item.seekerSkills ?? '—'}
              </Text>
              <Text style={{ color: colors.textSecondary, fontSize: 13, marginTop: 2 }}>
                {t('app.exp')}: {item.seekerExperienceYears ?? 0} {t('app.years')} · {item.jobTitle}
              </Text>
              <View style={[styles.statusChip, { alignSelf: 'flex-start', marginTop: spacing.sm,
                backgroundColor: colors.primaryLight }]}>
                <Text style={{ color: colors.primary, fontWeight: '800', fontSize: 11 }}>
                  {t('status.' + item.status)}
                </Text>
              </View>

              <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: spacing.md, gap: 8 }}>
                <TouchableOpacity style={styles.actionBtn} onPress={() => setStatusFor(item.id, 'UNDER_REVIEW')}>
                  <Text style={styles.actionText}>{t('app.underReview')}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.actionBtn, { borderColor: colors.success }]}
                  onPress={() => setStatusFor(item.id, 'SHORTLISTED')}>
                  <Text style={[styles.actionText, { color: colors.success }]}>{t('app.shortlist')}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.actionBtn, { borderColor: colors.success }]}
                  onPress={() => setStatusFor(item.id, 'SELECTED')}>
                  <Text style={[styles.actionText, { color: colors.success }]}>{t('app.select')}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.actionBtn, { borderColor: colors.danger }]}
                  onPress={() => setStatusFor(item.id, 'REJECTED')}>
                  <Text style={[styles.actionText, { color: colors.danger }]}>{t('app.reject')}</Text>
                </TouchableOpacity>
              </View>
            </Card>
          )}
        />
      )}
      <Toast visible={toast.show} message={toast.msg} type={toast.type} onHide={() => setToast(s => ({ ...s, show: false }))} />
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: colors.primary, borderBottomLeftRadius: radius.xl, borderBottomRightRadius: radius.xl,
    padding: spacing.xl, paddingTop: spacing.xl,
  },
  verifiedBadge: {
    backgroundColor: colors.verifiedGreen, alignSelf: 'flex-start',
    borderRadius: radius.pill, paddingHorizontal: 10, paddingVertical: 4, marginTop: spacing.sm,
  },
  statsGrid: {
    flexDirection: 'row', flexWrap: 'wrap', padding: spacing.lg, gap: spacing.md,
  },
  statCard: {
    backgroundColor: colors.card, borderRadius: radius.lg, padding: spacing.md,
    width: '47%', borderWidth: 1, borderColor: colors.border, alignItems: 'center',
  },
  statNum: { fontSize: 26, fontWeight: '900', color: colors.primary },
  statLabel: { fontSize: 12, color: colors.textSecondary, marginTop: 4, textAlign: 'center' },
  postCta: {
    backgroundColor: colors.accent, marginHorizontal: spacing.lg, borderRadius: radius.lg,
    padding: spacing.lg, alignItems: 'center', marginBottom: spacing.md,
  },
  statusChip: { borderRadius: radius.pill, paddingHorizontal: 10, paddingVertical: 5 },
  jobAction: {
    borderWidth: 1, borderColor: colors.border, borderRadius: radius.sm,
    paddingHorizontal: 10, paddingVertical: 8,
  },
  actionBtn: {
    borderWidth: 1, borderColor: colors.border, borderRadius: radius.sm,
    paddingHorizontal: 12, paddingVertical: 8,
  },
  actionText: { fontSize: 13, fontWeight: '700', color: colors.warning },
  confirmWrap: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', alignItems: 'center', justifyContent: 'center' },
  confirmCard: {
    backgroundColor: colors.card, borderRadius: radius.lg, padding: spacing.xl, width: '85%',
  },
  screenTitle: { fontSize: 22, fontWeight: '800', color: colors.text, padding: spacing.lg },
});
