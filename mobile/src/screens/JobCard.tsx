// VelaiConnect – Job card used across feeds
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, spacing, radius } from '../theme';
import { useApp } from '../context';
import { api, Job } from '../api';
import { salaryText } from '../components';

export function JobCard({ job, onPress, onSavedChange }: {
  job: Job; onPress: () => void; onSavedChange?: (jobId: string, saved: boolean) => void;
}) {
  const { t, lang, role } = useApp();
  const [saved, setSaved] = React.useState(!!job.saved);
  const [busy, setBusy] = React.useState(false);

  const toggleSave = async () => {
    if (role !== 'JOB_SEEKER' || busy) return;
    setBusy(true);
    try {
      const resp = await api.toggleSaved(job.id);
      setSaved(resp.saved);
      onSavedChange?.(job.id, resp.saved);
    } catch {
      // ignore
    }
    setBusy(false);
  };

  return (
    <TouchableOpacity activeOpacity={0.9} onPress={onPress} style={styles.card}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <View style={{ flex: 1, paddingRight: spacing.sm }}>
          <Text style={styles.title} numberOfLines={2}>
            {lang === 'ta' && job.titleTa ? job.titleTa : job.title}
          </Text>
          <Text style={styles.company} numberOfLines={1}>
            {job.companyName}
            {job.verifiedEmployer ? ' 🟢' : ''}
          </Text>
        </View>
        {role === 'JOB_SEEKER' && (
          <TouchableOpacity onPress={toggleSave} hitSlop={10}>
            <Text style={{ fontSize: 22 }}>{saved ? '❤️' : '🤍'}</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: spacing.sm, gap: 6 }}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{job.categoryIcon} {lang === 'ta' ? job.categoryNameTa : job.categoryNameEn}</Text>
        </View>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{t('jt.' + job.jobType)}</Text>
        </View>
        {job.quickJob && (
          <View style={[styles.badge, { backgroundColor: colors.warningLight }]}>
            <Text style={[styles.badgeText, { color: colors.warning }]}>⚡ {t('home.quickJobs')}</Text>
          </View>
        )}
        {job.workFromHome && (
          <View style={[styles.badge, { backgroundColor: colors.successLight }]}>
            <Text style={[styles.badgeText, { color: colors.success }]}>🏠 {t('jt.WORK_FROM_HOME')}</Text>
          </View>
        )}
      </View>

      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: spacing.md }}>
        <Text style={styles.salary}>{salaryText(job, t)}</Text>
        <Text style={styles.location}>📍 {job.locationCity}{job.distanceKm != null ? ` · ${job.distanceKm} km` : ''}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card, borderRadius: radius.lg, padding: spacing.lg,
    borderWidth: 1, borderColor: colors.border, marginBottom: spacing.md,
    shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8, shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  title: { fontSize: 16, fontWeight: '800', color: colors.text },
  company: { fontSize: 13, color: colors.textSecondary, marginTop: 2 },
  badge: {
    backgroundColor: colors.primaryLight, borderRadius: radius.pill,
    paddingHorizontal: 10, paddingVertical: 4,
  },
  badgeText: { fontSize: 11, fontWeight: '700', color: colors.primary },
  salary: { fontSize: 15, fontWeight: '800', color: colors.success },
  location: { fontSize: 12, color: colors.textSecondary },
});
