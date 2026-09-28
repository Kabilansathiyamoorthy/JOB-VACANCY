// VelaiConnect – Job Seeker screens
import React, { useState } from 'react';
import {
  View, Text, ScrollView, FlatList, TextInput, TouchableOpacity, StyleSheet, RefreshControl, Modal,
} from 'react-native';
import { colors, spacing, radius, type } from '../theme';
import { useApp } from '../context';
import { api, ApiError, Job, ApplicationView } from '../api';
import {
  PrimaryButton, Card, Chip, SectionHeader, Loading, EmptyState, ErrorState,
  Toast, PickerSheet, salaryText,
} from '../components';
import { JobCard } from './JobCard';

// =============== HOME ===============
export function HomeScreen({ navigation }: any) {
  const { t, lang, displayName } = useApp();
  const [search, setSearch] = React.useState('');
  const [latest, setLatest] = React.useState<Job[]>([]);
  const [quick, setQuick] = React.useState<Job[]>([]);
  const [recommended, setRecommended] = React.useState<Job[]>([]);
  const [nearby, setNearby] = React.useState<Job[] | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);
  const [error, setError] = React.useState('');

  const load = React.useCallback(async () => {
    setError('');
    try {
      const [l, q, r] = await Promise.all([
        api.latestJobs(10), api.quickJobs(), api.recommendedJobs().catch(() => []),
      ]);
      setLatest(l); setQuick(q); setRecommended(r);
    } catch (e) {
      setError(e instanceof ApiError && lang === 'ta' && e.messageTa ? e.messageTa : t('misc.networkError'));
    }
    setLoading(false);
  }, [lang]);

  React.useEffect(() => { load(); }, [load]);

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const findNearby = async () => {
    try {
      const { requestPermissionsAsync, getCurrentPositionAsync } = require('expo-location');
      const { status } = await requestPermissionsAsync();
      if (status !== 'granted') {
        setToast({ show: true, msg: t('misc.locationPermission'), type: 'error' });
        return;
      }
      const pos = await getCurrentPositionAsync({});
      const jobs = await api.nearbyJobs(pos.coords.latitude, pos.coords.longitude, 25);
      setNearby(jobs);
      navigation.navigate('JobsTab', { screen: 'Jobs' });
    } catch {
      setToast({ show: true, msg: t('misc.locationPermission'), type: 'error' });
    }
  };

  const [toast, setToast] = React.useState<{ show: boolean; msg: string; type: 'success' | 'error' | 'info' }>({
    show: false, msg: '', type: 'info',
  });

  const goSearch = (q?: string, categoryCode?: string) =>
    navigation.navigate('JobsTab', { screen: 'Jobs', params: { q, categoryCode } });

  const showNearby = nearby && nearby.length > 0;

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.bg }}
      contentContainerStyle={{ paddingBottom: 32 }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
      {/* header */}
      <View style={styles.homeHeader}>
        <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: 14 }}>{t('home.welcome')}</Text>
        <Text style={{ color: '#fff', fontSize: 20, fontWeight: '800' }}>
          {displayName ?? t('profile.myProfile')} 👋
        </Text>
        <View style={styles.searchBox}>
          <TextInput
            style={{ flex: 1, fontSize: 15, color: colors.text }}
            placeholder={t('home.searchPlaceholder')}
            placeholderTextColor={colors.textLight}
            value={search}
            onChangeText={setSearch}
            onSubmitEditing={() => goSearch(search)}
            returnKeyType="search"
          />
          <TouchableOpacity onPress={() => goSearch(search)}>
            <Text style={{ fontSize: 18 }}>🔍</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.nearMeBtn} onPress={findNearby}>
          <Text style={{ color: '#fff', fontWeight: '700', fontSize: 13 }}>{t('home.useMyLocation')}</Text>
        </TouchableOpacity>
      </View>

      {error ? <ErrorState message={error} onRetry={load} /> : null}

      {/* QUICK JOBS */}
      {quick.length > 0 && (
        <View style={{ paddingHorizontal: spacing.lg }}>
          <SectionHeader title={`⚡ ${t('home.needJobToday')}`} actionTitle={t('home.viewAll')}
            onAction={() => goSearch('', '')} />
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {quick.map(j => (
              <TouchableOpacity key={j.id} style={styles.quickCard} activeOpacity={0.9}
                onPress={() => navigation.navigate('JobDetails', { jobId: j.id })}>
                <Text style={{ fontSize: 26 }}>{j.categoryIcon}</Text>
                <Text style={{ fontWeight: '800', color: colors.text, marginTop: 6, fontSize: 14 }} numberOfLines={1}>
                  {lang === 'ta' && j.titleTa ? j.titleTa : j.title}
                </Text>
                <Text style={{ color: colors.success, fontWeight: '800', marginTop: 2 }}>
                  {salaryText(j, t)}
                </Text>
                <Text style={{ color: colors.textSecondary, fontSize: 11, marginTop: 2 }}>📍 {j.locationCity}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {loading ? <Loading /> : (
        <>
          {/* RECOMMENDED */}
          {recommended.length > 0 && (
            <View style={{ paddingHorizontal: spacing.lg }}>
              <SectionHeader title={t('home.recommended')} actionTitle={t('home.viewAll')}
                onAction={() => goSearch('', '')} />
              {recommended.slice(0, 4).map(j => (
                <JobCard key={j.id} job={j} onPress={() => navigation.navigate('JobDetails', { jobId: j.id })} />
              ))}
            </View>
          )}

          {/* NEARBY */}
          {showNearby && (
            <View style={{ paddingHorizontal: spacing.lg }}>
              <SectionHeader title={`📍 ${t('home.nearYou')}`} />
              {nearby!.slice(0, 4).map(j => (
                <JobCard key={j.id} job={j} onPress={() => navigation.navigate('JobDetails', { jobId: j.id })} />
              ))}
            </View>
          )}

          {/* LATEST */}
          <View style={{ paddingHorizontal: spacing.lg }}>
            <SectionHeader title={t('home.latest')} actionTitle={t('home.viewAll')}
              onAction={() => goSearch('', '')} />
            {latest.length === 0 && !error ? (
              <EmptyState emoji="🔍" title={t('jobs.noResults')} subtitle={t('jobs.noResultsDesc')} />
            ) : (
              latest.slice(0, 6).map(j => (
                <JobCard key={j.id} job={j} onPress={() => navigation.navigate('JobDetails', { jobId: j.id })} />
              ))
            )}
          </View>
        </>
      )}

      <Toast visible={toast.show} message={toast.msg} type={toast.type} onHide={() => setToast(s => ({ ...s, show: false }))} />
    </ScrollView>
  );
}

// =============== JOBS (search + categories + filters) ===============
const RADIUS_OPTIONS = [5, 10, 25, 50];

export function JobsScreen({ navigation, route }: any) {
  const { t, lang } = useApp();
  const [q, setQ] = React.useState(route.params?.q ?? '');
  const [categoryCode, setCategoryCode] = React.useState(route.params?.categoryCode ?? '');
  const [jobType, setJobType] = React.useState('');
  const [minSalary, setMinSalary] = useState('');
  const [fresherOnly, setFresherOnly] = React.useState(false);
  const [wfh, setWfh] = React.useState(false);
  const [quickOnly, setQuickOnly] = React.useState(false);
  const [radiusKm, setRadiusKm] = useState<number | null>(null);
  const [showFilters, setShowFilters] = React.useState(false);
  const [categories, setCategories] = React.useState<any[]>([]);
  const [jobs, setJobs] = React.useState<Job[]>([]);
  const [page, setPage] = React.useState(0);
  const [total, setTotal] = React.useState(0);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');

  React.useEffect(() => {
    if (route.params?.q !== undefined) setQ(route.params.q);
    if (route.params?.categoryCode !== undefined) setCategoryCode(route.params.categoryCode);
  }, [route.params]);

  React.useEffect(() => {
    api.categories().then(setCategories).catch(() => {});
  }, []);

  const load = React.useCallback(async (reset = false) => {
    setLoading(true);
    setError('');
    try {
      const p = reset ? 0 : page;
      const params: Record<string, any> = { page: p, size: 10 };
      if (q) params.search = q;
      if (categoryCode) params.categoryCode = categoryCode;
      if (jobType) params.jobType = jobType;
      if (minSalary) params.minSalary = minSalary;
      if (fresherOnly) params.fresherOnly = true;
      if (wfh) params.workFromHome = true;
      if (quickOnly) params.quickJobsOnly = true;
      const resp = await api.searchJobs(params);
      setJobs(prev => reset ? resp.content : [...prev, ...resp.content]);
      setTotal(resp.totalElements);
      setPage(p);
    } catch (e) {
      setError(e instanceof ApiError && lang === 'ta' && e.messageTa ? e.messageTa : t('misc.networkError'));
    }
    setLoading(false);
  }, [q, categoryCode, jobType, minSalary, fresherOnly, wfh, quickOnly, page, lang]);

  React.useEffect(() => { load(true); }, [q, categoryCode, jobType, minSalary, fresherOnly, wfh, quickOnly]);

  const activeFilterCount =
    (jobType ? 1 : 0) + (minSalary ? 1 : 0) + (fresherOnly ? 1 : 0) + (wfh ? 1 : 0) + (quickOnly ? 1 : 0);

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      {/* search bar */}
      <View style={{ padding: spacing.lg, paddingBottom: spacing.sm }}>
        <View style={styles.searchRow}>
          <TextInput
            style={{ flex: 1, fontSize: 15, color: colors.text }}
            placeholder={t('home.searchPlaceholder')}
            placeholderTextColor={colors.textLight}
            value={q}
            onChangeText={setQ}
            returnKeyType="search"
          />
          <TouchableOpacity onPress={() => setShowFilters(true)} style={styles.filterBtn}>
            <Text style={{ fontSize: 15 }}>⚙️</Text>
            {activeFilterCount > 0 && (
              <View style={styles.filterDot}><Text style={{ color: '#fff', fontSize: 9 }}>{activeFilterCount}</Text></View>
            )}
          </TouchableOpacity>
        </View>

        {/* categories row */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: spacing.md }}
          contentContainerStyle={{ paddingRight: spacing.lg }}>
          <Chip label={t('jobs.allCategories')} selected={!categoryCode} onPress={() => setCategoryCode('')} />
          {categories.map(c => (
            <Chip key={c.code} label={`${c.icon} ${lang === 'ta' ? c.nameTa : c.nameEn}`}
              selected={categoryCode === c.code} onPress={() => setCategoryCode(c.code)} />
          ))}
        </ScrollView>
      </View>

      {error ? <ErrorState message={error} onRetry={() => load(true)} /> : null}
      {loading && jobs.length === 0 ? <Loading /> : (
        <FlatList
          data={jobs}
          keyExtractor={j => j.id}
          contentContainerStyle={{ paddingHorizontal: spacing.lg, paddingBottom: 24 }}
          renderItem={({ item }) => (
            <JobCard job={item} onPress={() => navigation.navigate('JobDetails', { jobId: item.id })} />
          )}
          onEndReached={() => { if (jobs.length < total) load(false); }}
          onEndReachedThreshold={0.4}
          ListEmptyComponent={!loading ? <EmptyState emoji="🔍" title={t('jobs.noResults')}
            subtitle={t('jobs.noResultsDesc')} /> : null}
          ListFooterComponent={loading && jobs.length > 0 ? <Loading /> : null}
        />
      )}

      {/* Filter sheet */}
      <Modal visible={showFilters} transparent animationType="slide" onRequestClose={() => setShowFilters(false)}>
        <View style={styles.modalWrap}>
          <View style={styles.modalCard}>
            <Text style={[type.h3, { color: colors.text, marginBottom: spacing.lg }]}>{t('btn.filters')}</Text>

            <Text style={styles.filterLabel}>{t('field.jobType')}</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
              {['FULL_TIME', 'PART_TIME', 'DAILY_WAGE', 'WORK_FROM_HOME'].map(jt => (
                <Chip key={jt} label={t('jt.' + jt)} selected={jobType === jt} onPress={() => setJobType(jobType === jt ? '' : jt)} />
              ))}
            </View>

            <Text style={styles.filterLabel}>{t('field.expectedSalary')} (₹{t('sp.MONTHLY')})</Text>
            <TextInput
              style={styles.filterInput}
              value={minSalary}
              onChangeText={setMinSalary}
              keyboardType="number-pad"
              placeholder="20000"
              placeholderTextColor={colors.textLight}
            />

            <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: spacing.md }}>
              <Chip label={t('detail.experience') + ': Fresher'} selected={fresherOnly} onPress={() => setFresherOnly(!fresherOnly)} />
              <Chip label="🏠 WFH" selected={wfh} onPress={() => setWfh(!wfh)} />
              <Chip label="⚡ Quick" selected={quickOnly} onPress={() => setQuickOnly(!quickOnly)} />
            </View>

            <Text style={styles.filterLabel}>{t('home.nearYou')} (km)</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
              {RADIUS_OPTIONS.map(r => (
                <Chip key={r} label={`${r} km`} selected={radiusKm === r}
                  onPress={() => setRadiusKm(radiusKm === r ? null : r)} />
              ))}
            </View>

            <View style={{ flexDirection: 'row', marginTop: spacing.xl, gap: spacing.md }}>
              <View style={{ flex: 1 }}>
                <PrimaryButton variant="outline" title={t('btn.clearFilters')} onPress={() => {
                  setJobType(''); setMinSalary(''); setFresherOnly(false); setWfh(false); setQuickOnly(false); setRadiusKm(null);
                }} />
              </View>
              <View style={{ flex: 1 }}>
                <PrimaryButton title={t('btn.applyFilters')} onPress={() => setShowFilters(false)} />
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// =============== JOB DETAILS ===============
export function JobDetailsScreen({ navigation, route }: any) {
  const { t, lang, role } = useApp();
  const { jobId } = route.params;
  const [job, setJob] = React.useState<Job | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');
  const [applying, setApplying] = React.useState(false);
  const [showReport, setShowReport] = React.useState(false);
  const [toast, setToast] = React.useState<{ show: boolean; msg: string; type: 'success' | 'error' | 'info' }>({
    show: false, msg: '', type: 'info',
  });

  const load = React.useCallback(async () => {
    try {
      const j = await api.jobDetails(jobId);
      setJob(j);
      setError('');
    } catch (e) {
      setError(e instanceof ApiError && lang === 'ta' && e.messageTa ? e.messageTa : t('misc.error'));
    }
    setLoading(false);
  }, [jobId, lang]);

  React.useEffect(() => { load(); }, [load]);

  const apply = async () => {
    if (!job) return;
    setApplying(true);
    try {
      await api.apply(job.id);
      setApplying(false);
      setToast({ show: true, msg: t('apps.submitted'), type: 'success' });
      load();
    } catch (e: any) {
      setApplying(false);
      const msg = e instanceof ApiError ? (lang === 'ta' && e.messageTa ? e.messageTa : e.message) : t('misc.error');
      setToast({ show: true, msg, type: 'error' });
    }
  };

  if (loading) return <Loading />;
  if (error || !job) return <ErrorState message={error || t('misc.error')} onRetry={load} />;

  const reportReasons = [
    { key: 'FAKE_JOB', label: t('report.fake') },
    { key: 'ASKING_FOR_MONEY', label: t('report.money') },
    { key: 'WRONG_INFORMATION', label: t('report.wrong') },
    { key: 'SCAM', label: t('report.scam') },
    { key: 'OTHER', label: t('report.other') },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: 120 }}>
        <Card>
          <Text style={[type.title, { fontSize: 22, color: colors.text }]}>
            {lang === 'ta' && job.titleTa ? job.titleTa : job.title}
          </Text>
          <Text style={{ color: colors.textSecondary, marginTop: 4, fontSize: 15 }}>
            {job.companyName} {job.verifiedEmployer ? '🟢' : ''}
          </Text>
          {job.verifiedEmployer && (
            <Text style={{ color: colors.verifiedGreen, fontWeight: '700', marginTop: 4, fontSize: 13 }}>
              {t('detail.verifiedEmployer')}
            </Text>
          )}

          <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: spacing.lg, gap: 8 }}>
            <View style={styles.detailBadge}>
              <Text style={styles.detailBadgeText}>💰 {salaryText(job, t)}</Text>
            </View>
            <View style={styles.detailBadge}>
              <Text style={styles.detailBadgeText}>{t('jt.' + job.jobType)}</Text>
            </View>
            <View style={styles.detailBadge}>
              <Text style={styles.detailBadgeText}>📍 {job.locationCity}{job.locationArea ? `, ${job.locationArea}` : ''}</Text>
            </View>
            {job.distanceKm != null && (
              <View style={styles.detailBadge}>
                <Text style={styles.detailBadgeText}>📏 {job.distanceKm} km</Text>
              </View>
            )}
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>{t('detail.experience')}</Text>
            <Text style={styles.detailValue}>{job.experienceRequired}</Text>
          </View>
          {job.qualification ? (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>{t('detail.qualification')}</Text>
              <Text style={styles.detailValue}>{job.qualification}</Text>
            </View>
          ) : null}
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>{t('detail.vacancies')}</Text>
            <Text style={styles.detailValue}>{job.vacancies}</Text>
          </View>
          {job.applicationDeadline ? (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>{t('jobs.deadline')}</Text>
              <Text style={styles.detailValue}>{job.applicationDeadline}</Text>
            </View>
          ) : null}

          {job.skills?.length > 0 && (
            <View style={{ marginTop: spacing.lg }}>
              <Text style={[type.h3, { color: colors.text, marginBottom: spacing.sm }]}>{t('detail.skills')}</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                {job.skills.map(s => <Chip key={s} label={s} />)}
              </View>
            </View>
          )}

          <View style={{ marginTop: spacing.lg }}>
            <Text style={[type.h3, { color: colors.text, marginBottom: spacing.sm }]}>{t('detail.description')}</Text>
            <Text style={{ color: colors.text, lineHeight: 22, fontSize: 14 }}>
              {lang === 'ta' && job.descriptionTa ? job.descriptionTa : job.description}
            </Text>
          </View>

          {/* Safety warning */}
          <View style={styles.warningBox}>
            <Text style={{ color: colors.warning, fontWeight: '800', fontSize: 14 }}>{t('safety.warning')}</Text>
            <Text style={{ color: colors.textSecondary, fontSize: 12, marginTop: 4 }}>{t('safety.warningDesc')}</Text>
          </View>

          <TouchableOpacity onPress={() => setShowReport(true)} style={{ alignSelf: 'center', marginTop: spacing.lg }}>
            <Text style={{ color: colors.danger, fontWeight: '700', fontSize: 14 }}>{t('btn.report')}</Text>
          </TouchableOpacity>
        </Card>
      </ScrollView>

      {/* APPLY bar */}
      {role === 'JOB_SEEKER' && (
        <View style={styles.applyBar}>
          <View style={{ flex: 1 }}>
            <PrimaryButton
              title={job.applied ? t('btn.applied') : t('btn.applyNow')}
              onPress={apply}
              loading={applying}
              disabled={!!job.applied}
              variant={job.applied ? 'success' : 'primary'}
            />
          </View>
        </View>
      )}

      {/* Report sheet */}
      <Modal transparent visible={showReport} animationType="slide" onRequestClose={() => setShowReport(false)}>
        <View style={styles.modalWrap}>
          <View style={styles.modalCard}>
            <Text style={[type.h3, { color: colors.text }]}>{t('report.title')}</Text>
            <Text style={{ color: colors.textSecondary, marginTop: 6, fontSize: 13 }}>{t('safety.warningDesc')}</Text>
            {reportReasons.map(r => (
              <TouchableOpacity key={r.key} style={styles.reportOption}
                onPress={async () => {
                  setShowReport(false);
                  try {
                    await api.reportJob(job.id, r.key);
                    setToast({ show: true, msg: t('report.submitted'), type: 'success' });
                  } catch {
                    setToast({ show: true, msg: t('misc.error'), type: 'error' });
                  }
                }}>
                <Text style={{ fontSize: 15, color: colors.text }}>{r.label}</Text>
                <Text style={{ color: colors.textLight }}>›</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity onPress={() => setShowReport(false)} style={{ alignItems: 'center', padding: spacing.md }}>
              <Text style={{ color: colors.textSecondary }}>{t('btn.close')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Toast visible={toast.show} message={toast.msg} type={toast.type} onHide={() => setToast(s => ({ ...s, show: false }))} />
    </View>
  );
}

// =============== SAVED JOBS ===============
export function SavedScreen({ navigation }: any) {
  const { t, lang } = useApp();
  const [jobs, setJobs] = React.useState<Job[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');

  const load = React.useCallback(async () => {
    try {
      setJobs(await api.savedJobs());
      setError('');
    } catch (e) {
      setError(e instanceof ApiError && lang === 'ta' && e.messageTa ? e.messageTa : t('misc.error'));
    }
    setLoading(false);
  }, [lang]);

  React.useEffect(() => {
    const unsub = navigation.addListener('focus', load);
    return unsub;
  }, [load, navigation]);

  if (loading) return <Loading />;
  if (error) return <ErrorState message={error} onRetry={load} />;

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <Text style={styles.screenTitle}>❤️ {t('saved.title')}</Text>
      {jobs.length === 0 ? (
        <EmptyState emoji="❤️" title={t('saved.empty')} subtitle={t('saved.emptyDesc')} />
      ) : (
        <FlatList
          data={jobs}
          keyExtractor={j => j.id}
          contentContainerStyle={{ padding: spacing.lg }}
          renderItem={({ item }) => (
            <JobCard job={item} onPress={() => navigation.navigate('JobDetails', { jobId: item.id })}
              onSavedChange={(id, saved) => { if (!saved) setJobs(prev => prev.filter(j => j.id !== id)); }} />
          )}
        />
      )}
    </View>
  );
}

// =============== MY APPLICATIONS ===============
export function ApplicationsScreen({ navigation }: any) {
  const { t, lang } = useApp();
  const [apps, setApps] = React.useState<ApplicationView[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');

  const load = React.useCallback(async () => {
    try {
      const resp = await api.myApplications();
      setApps(resp.content);
      setError('');
    } catch (e) {
      setError(e instanceof ApiError && lang === 'ta' && e.messageTa ? e.messageTa : t('misc.error'));
    }
    setLoading(false);
  }, [lang]);

  React.useEffect(() => {
    const unsub = navigation.addListener('focus', load);
    return unsub;
  }, [load, navigation]);

  if (loading) return <Loading />;
  if (error) return <ErrorState message={error} onRetry={load} />;

  const statusColor: Record<string, string> = {
    APPLIED: colors.primary, UNDER_REVIEW: colors.warning,
    SHORTLISTED: colors.accent, REJECTED: colors.danger,
    SELECTED: colors.success, WITHDRAWN: colors.textLight,
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <Text style={styles.screenTitle}>📄 {t('apps.title')}</Text>
      {apps.length === 0 ? (
        <EmptyState emoji="📄" title={t('apps.empty')} subtitle={t('apps.emptyDesc')} />
      ) : (
        <FlatList
          data={apps}
          keyExtractor={a => a.id}
          contentContainerStyle={{ padding: spacing.lg }}
          renderItem={({ item }) => (
            <Card style={{ marginBottom: spacing.md }}
              onPress={() => navigation.navigate('JobDetails', { jobId: item.jobId })}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <View style={{ flex: 1, paddingRight: spacing.sm }}>
                  <Text style={{ fontWeight: '800', color: colors.text, fontSize: 15 }}>{item.jobTitle}</Text>
                  <Text style={{ color: colors.textSecondary, fontSize: 13, marginTop: 2 }}>{item.companyName}</Text>
                  <Text style={{ color: colors.textLight, fontSize: 11, marginTop: 4 }}>
                    {t('jobs.posted')}: {item.appliedAt?.slice(0, 10)}
                  </Text>
                </View>
                <View style={[styles.statusChip, { backgroundColor: (statusColor[item.status] ?? colors.primary) + '22' }]}>
                  <Text style={{ color: statusColor[item.status] ?? colors.primary, fontWeight: '800', fontSize: 11 }}>
                    {t('status.' + item.status)}
                  </Text>
                </View>
              </View>
            </Card>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  homeHeader: {
    backgroundColor: colors.primary, borderBottomLeftRadius: radius.xl, borderBottomRightRadius: radius.xl,
    padding: spacing.lg, paddingTop: spacing.xl,
  },
  searchBox: {
    backgroundColor: '#fff', borderRadius: radius.md, flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 12, marginTop: spacing.lg, height: 48,
  },
  nearMeBtn: {
    alignSelf: 'flex-start', backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: radius.pill,
    paddingHorizontal: 12, paddingVertical: 6, marginTop: spacing.md,
  },
  quickCard: {
    backgroundColor: colors.card, borderRadius: radius.lg, padding: spacing.md, width: 130, marginRight: spacing.md,
    borderWidth: 1, borderColor: colors.border,
  },
  searchRow: {
    flexDirection: 'row', backgroundColor: colors.card, borderRadius: radius.md,
    borderWidth: 1, borderColor: colors.border, alignItems: 'center', paddingLeft: 12, height: 48,
  },
  filterBtn: { paddingHorizontal: 14, height: '100%', justifyContent: 'center' },
  filterDot: {
    position: 'absolute', top: 8, right: 8, backgroundColor: colors.danger,
    borderRadius: 8, minWidth: 16, height: 16, alignItems: 'center', justifyContent: 'center',
  },
  modalWrap: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  modalCard: {
    backgroundColor: colors.card, borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl,
    padding: spacing.xl, maxHeight: '85%',
  },
  filterLabel: { fontWeight: '700', color: colors.text, marginBottom: spacing.sm, marginTop: spacing.md, fontSize: 13 },
  filterInput: {
    backgroundColor: colors.bg, borderWidth: 1, borderColor: colors.border, borderRadius: radius.sm,
    paddingHorizontal: 12, paddingVertical: 10, color: colors.text,
  },
  detailBadge: {
    backgroundColor: colors.bg, borderRadius: radius.pill, paddingHorizontal: 12, paddingVertical: 6,
    borderWidth: 1, borderColor: colors.border,
  },
  detailBadgeText: { fontSize: 13, fontWeight: '600', color: colors.text },
  detailRow: {
    flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border, paddingBottom: spacing.sm,
  },
  detailLabel: { color: colors.textSecondary, fontSize: 14 },
  detailValue: { color: colors.text, fontWeight: '700', fontSize: 14 },
  warningBox: {
    backgroundColor: colors.warningLight, borderRadius: radius.md, padding: spacing.md, marginTop: spacing.xl,
    borderWidth: 1, borderColor: colors.warning + '44',
  },
  applyBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0, padding: spacing.lg,
    backgroundColor: colors.card, borderTopWidth: 1, borderTopColor: colors.border,
  },
  reportOption: {
    flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border,
  },
  statusChip: { borderRadius: radius.pill, paddingHorizontal: 12, paddingVertical: 6 },
  screenTitle: { fontSize: 22, fontWeight: '800', color: colors.text, padding: spacing.lg },
});
