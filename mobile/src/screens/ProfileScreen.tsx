// VelaiConnect – Profile (seeker + employer variants)
import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { colors, spacing, radius, type } from '../theme';
import { useApp, LanguageSwitcher } from '../context';
import { api, ApiError, SeekerProfile, EmployerProfile, NotificationItem } from '../api';
import { PrimaryButton, Input, Card, Chip, Loading, EmptyState, ErrorState, Toast, PickerSheet } from '../components';

// =============== PROFILE (role-aware) ===============
export function ProfileScreen({ navigation }: any) {
  const { t, lang, setLang, role, displayName, signOut } = useApp();
  const [profile, setProfile] = useState<SeekerProfile | EmployerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [unread, setUnread] = useState(0);

  const load = React.useCallback(async () => {
    try {
      if (role === 'JOB_SEEKER') setProfile(await api.seekerProfile());
      else if (role === 'EMPLOYER') setProfile(await api.employerProfile());
      const n = await api.notifications(0, 1);
      // quick unread count via list length hint (kept simple)
    } catch {
      // profile may not exist for freshly-registered users
    }
    try {
      const notifs = await api.notifications(0, 50);
      setUnread(notifs.content.filter(n => !n.read).length);
    } catch {}
    setLoading(false);
  }, [role, lang]);

  React.useEffect(() => {
    const unsub = navigation.addListener('focus', load);
    return unsub;
  }, [load, navigation]);

  if (loading) return <Loading />;

  const seeker = role === 'JOB_SEEKER' ? (profile as SeekerProfile | null) : null;
  const employer = role === 'EMPLOYER' ? (profile as EmployerProfile | null) : null;

  const menu = [
    { icon: '✏️', label: t('profile.editProfile'), onPress: () => navigation.navigate('EditProfile') },
    { icon: '🔔', label: t('profile.notifications') + (unread ? ` (${unread})` : ''), onPress: () => navigation.navigate('Notifications') },
    ...(role === 'JOB_SEEKER' ? [
      { icon: '🔔', label: t('profile.jobAlerts'), onPress: () => navigation.navigate('JobAlerts') },
      { icon: '📄', label: t('apps.title'), onPress: () => navigation.navigate('ApplicationsTab') },
    ] : []),
    ...(role === 'EMPLOYER' ? [
      { icon: '✅', label: t('profile.verifyEmployer'), onPress: () => navigation.navigate('VerifyEmployer') },
      { icon: '💼', label: t('emp.myJobs'), onPress: () => navigation.navigate('MyJobs') },
    ] : []),
  ];

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.bg }} contentContainerStyle={{ paddingBottom: 40 }}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={{ fontSize: 40 }}>{role === 'EMPLOYER' ? '🏢' : '👨‍💼'}</Text>
        </View>
        <Text style={{ color: '#fff', fontSize: 20, fontWeight: '800', marginTop: spacing.md }}>
          {displayName ?? '—'}
        </Text>
        {employer?.verified && (
          <View style={{ backgroundColor: colors.verifiedGreen, borderRadius: radius.pill,
            paddingHorizontal: 12, paddingVertical: 4, marginTop: spacing.sm }}>
            <Text style={{ color: '#fff', fontSize: 12, fontWeight: '800' }}>{t('profile.verified')}</Text>
          </View>
        )}
      </View>

      {/* info card */}
      {profile && (
        <Card style={{ margin: spacing.lg }}>
          {seeker && (
            <>
              <Text style={styles.infoLine}>📞 {seeker.mobileNumber}</Text>
              {seeker.city ? <Text style={styles.infoLine}>📍 {seeker.city}</Text> : null}
              {seeker.education ? <Text style={styles.infoLine}>🎓 {seeker.education}</Text> : null}
              {seeker.skills ? <Text style={styles.infoLine}>🛠 {seeker.skills}</Text> : null}
              <Text style={styles.infoLine}>💼 {t('detail.experience')}: {seeker.experienceYears} {t('app.years')}</Text>
            </>
          )}
          {employer && (
            <>
              <Text style={styles.infoLine}>📞 {employer.mobileNumber}</Text>
              {employer.city ? <Text style={styles.infoLine}>📍 {employer.city}</Text> : null}
              {employer.companyType ? <Text style={styles.infoLine}>🏷 {employer.companyType}</Text> : null}
              <Text style={styles.infoLine}>👤 {t('field.contactPerson')}: {employer.contactPerson}</Text>
            </>
          )}
        </Card>
      )}

      {/* menu */}
      <View style={{ paddingHorizontal: spacing.lg }}>
        {menu.map((m, i) => (
          <TouchableOpacity key={i} style={styles.menuItem} onPress={m.onPress}>
            <Text style={{ fontSize: 18, marginRight: spacing.md }}>{m.icon}</Text>
            <Text style={{ flex: 1, fontSize: 15, color: colors.text, fontWeight: '600' }}>{m.label}</Text>
            <Text style={{ color: colors.textLight }}>›</Text>
          </TouchableOpacity>
        ))}

        {/* language */}
        <View style={[styles.menuItem, { flexDirection: 'column', alignItems: 'flex-start' }]}>
          <Text style={{ fontSize: 15, color: colors.text, fontWeight: '600', marginBottom: spacing.md }}>
            {t('profile.language')}
          </Text>
          <LanguageSwitcher />
        </View>

        <PrimaryButton variant="danger" title={t('btn.logout')} onPress={() =>
          Alert.alert(
            t('btn.logout'),
            t('btn.logout'),
            [
              { text: t('btn.close'), style: 'cancel' },
              { text: 'OK', style: 'destructive', onPress: signOut },
            ]
          )} style={{ marginTop: spacing.xl }} />
      </View>
    </ScrollView>
  );
}

// =============== EDIT PROFILE ===============
export function EditProfileScreen({ navigation }: any) {
  const { t, lang, setDisplayName } = useApp();
  const isSeeker = useApp().role === 'JOB_SEEKER';
  const [fullName, setFullName] = useState('');
  const [city, setCity] = useState('');
  const [education, setEducation] = useState('');
  const [skills, setSkills] = useState('');
  const [experience, setExperience] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [companyType, setCompanyType] = useState('');
  const [description, setDescription] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ show: boolean; msg: string; type: 'success' | 'error' | 'info' }>({
    show: false, msg: '', type: 'info',
  });

  React.useEffect(() => {
    (async () => {
      try {
        if (isSeeker) {
          const p = await api.seekerProfile();
          setFullName(p.fullName); setCity(p.city ?? ''); setEducation(p.education ?? '');
          setSkills(p.skills ?? ''); setExperience(String(p.experienceYears ?? 0));
        } else {
          const p = await api.employerProfile();
          setCompanyName(p.companyName); setCompanyType(p.companyType ?? '');
          setDescription(p.companyDescription ?? ''); setContactPerson(p.contactPerson);
          setCity(p.city ?? '');
        }
      } catch {}
      setLoading(false);
    })();
  }, []);

  const save = async () => {
    setSaving(true);
    try {
      if (isSeeker) {
        const p = await api.updateSeekerProfile({
          fullName, city, education, skills,
          experienceYears: parseFloat(experience) || 0,
        });
        setDisplayName(p.fullName);
      } else {
        const p = await api.updateEmployerProfile({
          companyName, companyType, companyDescription: description, city, contactPerson,
        });
        setDisplayName(p.companyName);
      }
      setSaving(false);
      setToast({ show: true, msg: t('profile.updated'), type: 'success' });
      setTimeout(() => navigation.goBack(), 900);
    } catch (e: any) {
      setSaving(false);
      const msg = e instanceof ApiError ? (lang === 'ta' && e.messageTa ? e.messageTa : e.message) : t('misc.error');
      setToast({ show: true, msg, type: 'error' });
    }
  };

  if (loading) return <Loading />;

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.bg }} contentContainerStyle={{ padding: spacing.lg }}>
      <Text style={[type.h2, { color: colors.text, marginBottom: spacing.lg }]}>{t('profile.editProfile')}</Text>

      {isSeeker ? (
        <>
          <Input label={t('field.fullName')} value={fullName} onChangeText={setFullName} />
          <Input label={t('field.city')} value={city} onChangeText={setCity} />
          <Input label={t('field.education')} value={education} onChangeText={setEducation} />
          <Input label={t('field.skills')} value={skills} onChangeText={setSkills} />
          <Input label={t('field.experience')} value={experience} onChangeText={setExperience} keyboardType="decimal-pad" />
        </>
      ) : (
        <>
          <Input label={t('field.companyName')} value={companyName} onChangeText={setCompanyName} />
          <Input label={t('field.companyType')} value={companyType} onChangeText={setCompanyType} />
          <Input label={t('field.companyDesc')} value={description} onChangeText={setDescription} multiline />
          <Input label={t('field.contactPerson')} value={contactPerson} onChangeText={setContactPerson} />
          <Input label={t('field.city')} value={city} onChangeText={setCity} />
        </>
      )}

      <PrimaryButton title={t('btn.saveChanges')} onPress={save} loading={saving} />
      <Toast visible={toast.show} message={toast.msg} type={toast.type} onHide={() => setToast(s => ({ ...s, show: false }))} />
    </ScrollView>
  );
}

// =============== NOTIFICATIONS ===============
export function NotificationsScreen({ navigation }: any) {
  const { t, lang } = useApp();
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    api.notifications(0, 50)
      .then(r => setItems(r.content))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loading />;

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <Text style={styles.screenTitle}>🔔 {t('notif.title')}</Text>
      {items.length === 0 ? (
        <EmptyState emoji="🔔" title={t('notif.empty')} />
      ) : (
        <ScrollView contentContainerStyle={{ padding: spacing.lg }}>
          {items.map(n => (
            <Card key={n.id} style={{ marginBottom: spacing.md,
              borderColor: n.read ? colors.border : colors.primary }}>
              <Text style={{ fontWeight: '800', color: colors.text }}>
                {lang === 'ta' ? n.titleTa : n.titleEn}
              </Text>
              <Text style={{ color: colors.textSecondary, marginTop: 4, fontSize: 13 }}>
                {lang === 'ta' ? n.bodyTa : n.bodyEn}
              </Text>
              <Text style={{ color: colors.textLight, fontSize: 11, marginTop: 6 }}>
                {n.createdAt?.slice(0, 16).replace('T', ' ')}
              </Text>
            </Card>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

// =============== JOB ALERTS ===============
export function JobAlertsScreen({ navigation }: any) {
  const { t, lang } = useApp();
  const [alerts, setAlerts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [categoryCode, setCategoryCode] = useState('');
  const [categoryLabel, setCategoryLabel] = useState('');
  const [city, setCity] = useState('');
  const [minSalary, setMinSalary] = useState('');
  const [jobType, setJobType] = useState('');
  const [showCat, setShowCat] = useState(false);
  const [showType, setShowType] = useState(false);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ show: boolean; msg: string; type: 'success' | 'error' | 'info' }>({
    show: false, msg: '', type: 'info',
  });

  const load = React.useCallback(async () => {
    try { setAlerts(await api.myAlerts()); } catch {}
    setLoading(false);
  }, []);

  React.useEffect(() => {
    load();
    api.categories().then(setCategories).catch(() => {});
  }, []);

  const create = async () => {
    try {
      await api.createAlert({
        categoryCode: categoryCode || undefined,
        locationCity: city || undefined,
        minSalary: minSalary ? parseInt(minSalary) : undefined,
        jobType: jobType || undefined,
      });
      setToast({ show: true, msg: t('alert.created'), type: 'success' });
      setCategoryCode(''); setCategoryLabel(''); setCity(''); setMinSalary(''); setJobType('');
      load();
    } catch (e: any) {
      setToast({ show: true, msg: t('misc.error'), type: 'error' });
    }
  };

  if (loading) return <Loading />;

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.bg }} contentContainerStyle={{ padding: spacing.lg }}>
      <Text style={[type.h2, { color: colors.text }]}>{t('alert.title')}</Text>

      {alerts.length === 0 ? (
        <Text style={{ color: colors.textSecondary, marginTop: spacing.md }}>{t('alert.empty')}</Text>
      ) : (
        alerts.map(a => (
          <Card key={a.id} style={{ marginTop: spacing.md }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View>
                <Text style={{ fontWeight: '700', color: colors.text }}>
                  {a.category ? `${a.category.icon} ${lang === 'ta' ? a.category.nameTa : a.category.nameEn}` : t('jobs.allCategories')}
                </Text>
                <Text style={{ color: colors.textSecondary, fontSize: 12, marginTop: 2 }}>
                  {[a.locationCity, a.jobType ? t('jt.' + a.jobType) : null, a.minSalary ? `₹${a.minSalary}+` : null]
                    .filter(Boolean).join(' · ') || '—'}
                </Text>
              </View>
              <TouchableOpacity onPress={async () => { await api.deleteAlert(a.id); load(); }}>
                <Text style={{ color: colors.danger, fontWeight: '700' }}>🗑</Text>
              </TouchableOpacity>
            </View>
          </Card>
        ))
      )}

      <Card style={{ marginTop: spacing.xl }}>
        <Text style={[type.h3, { color: colors.text, marginBottom: spacing.lg }]}>{t('alert.create')}</Text>
        <TouchableOpacity onPress={() => setShowCat(true)}>
          <Input label={t('field.preferredCategory')} value={categoryLabel} editable={false} />
        </TouchableOpacity>
        <Input label={t('field.city')} value={city} onChangeText={setCity} />
        <Input label={t('alert.minSalary')} value={minSalary} onChangeText={setMinSalary} keyboardType="number-pad" />
        <TouchableOpacity onPress={() => setShowType(true)}>
          <Input label={t('field.jobType')} value={jobType ? t('jt.' + jobType) : ''} editable={false} />
        </TouchableOpacity>
        <PrimaryButton title={t('alert.create')} onPress={create} />
      </Card>

      <PickerSheet visible={showCat} title={t('field.preferredCategory')}
        options={[{ label: t('jobs.allCategories'), value: '' },
          ...categories.map(c => ({ label: `${c.icon} ${lang === 'ta' ? c.nameTa : c.nameEn}`, value: c.code }))]}
        selectedValue={categoryCode}
        onSelect={v => {
          setCategoryCode(v);
          const c = categories.find(x => x.code === v);
          setCategoryLabel(c ? `${c.icon} ${lang === 'ta' ? c.nameTa : c.nameEn}` : '');
        }}
        onClose={() => setShowCat(false)} />
      <PickerSheet visible={showType} title={t('field.jobType')}
        options={['FULL_TIME', 'PART_TIME', 'DAILY_WAGE', 'WORK_FROM_HOME'].map(p => ({ label: t('jt.' + p), value: p }))}
        selectedValue={jobType} onSelect={v => setJobType(v)} onClose={() => setShowType(false)} />
      <Toast visible={toast.show} message={toast.msg} type={toast.type} onHide={() => setToast(s => ({ ...s, show: false }))} />
    </ScrollView>
  );
}

// =============== EMPLOYER VERIFICATION ===============
export function VerifyEmployerScreen({ navigation }: any) {
  const { t, lang } = useApp();
  const [gst, setGst] = useState('');
  const [regNo, setRegNo] = useState('');
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [toast, setToast] = useState<{ show: boolean; msg: string; type: 'success' | 'error' | 'info' }>({
    show: false, msg: '', type: 'info',
  });

  React.useEffect(() => {
    api.myVerification().then(v => setStatus(v?.status ?? null)).catch(() => {});
  }, []);

  const submit = async () => {
    setSaving(true);
    try {
      await api.submitVerification({ gstNumber: gst || undefined, companyRegNumber: regNo || undefined });
      setSaving(false);
      setToast({ show: true, msg: t('verify.submitted'), type: 'success' });
    } catch (e: any) {
      setSaving(false);
      const msg = e instanceof ApiError ? (lang === 'ta' && e.messageTa ? e.messageTa : e.message) : t('misc.error');
      setToast({ show: true, msg, type: 'error' });
    }
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.bg }} contentContainerStyle={{ padding: spacing.lg }}>
      <Text style={[type.h2, { color: colors.text, marginBottom: spacing.lg }]}>{t('profile.verifyEmployer')}</Text>
      <Text style={{ color: colors.textSecondary, marginBottom: spacing.lg, fontSize: 13 }}>
        {t('verify.desc')}
      </Text>

      <Input label={t('field.gst')} value={gst} onChangeText={setGst} />
      <Input label={t('field.regNumber')} value={regNo} onChangeText={setRegNo} />

      <PrimaryButton title={t('btn.submit')} onPress={submit} loading={saving} />
      <Toast visible={toast.show} message={toast.msg} type={toast.type} onHide={() => setToast(s => ({ ...s, show: false }))} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: colors.primary, borderBottomLeftRadius: radius.xl, borderBottomRightRadius: radius.xl,
    padding: spacing.xl, alignItems: 'center', paddingBottom: spacing.xxl,
  },
  avatar: {
    width: 84, height: 84, borderRadius: 42, backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center', justifyContent: 'center',
  },
  infoLine: { fontSize: 14, color: colors.text, marginBottom: 8 },
  menuItem: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: colors.card,
    borderRadius: radius.md, padding: spacing.lg, marginBottom: spacing.md,
    borderWidth: 1, borderColor: colors.border,
  },
  screenTitle: { fontSize: 22, fontWeight: '800', color: colors.text, padding: spacing.lg },
});
