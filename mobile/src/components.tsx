// VelaiConnect – shared UI components
import React from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ActivityIndicator,
  StyleSheet, ScrollView, Modal, Pressable,
} from 'react-native';
import { colors, spacing, radius, type } from './theme';
import { useApp } from './context';

// ---------- PrimaryButton ----------
export function PrimaryButton({
  title, onPress, loading, disabled, variant = 'primary', style,
}: {
  title: string; onPress: () => void; loading?: boolean; disabled?: boolean;
  variant?: 'primary' | 'outline' | 'danger' | 'success'; style?: any;
}) {
  const bg = {
    primary: colors.primary, outline: 'transparent',
    danger: colors.danger, success: colors.success,
  }[variant];
  const fg = variant === 'outline' ? colors.primary : '#fff';
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.85}
      style={[{
        backgroundColor: bg,
        borderWidth: variant === 'outline' ? 2 : 0,
        borderColor: colors.primary,
        borderRadius: radius.md,
        paddingVertical: 16,
        alignItems: 'center',
        justifyContent: 'center',
        opacity: disabled || loading ? 0.6 : 1,
      }, style]}
    >
      {loading ? (
        <ActivityIndicator color={fg} />
      ) : (
        <Text style={{ color: fg, fontSize: 16, fontWeight: '800', letterSpacing: 0.5 }}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

// ---------- Input ----------
export function Input({
  label, value, onChangeText, placeholder, error, multiline, keyboardType, secureTextEntry, editable, style,
}: {
  label?: string; value: string; onChangeText?: (v: string) => void; placeholder?: string;
  error?: string; multiline?: boolean; keyboardType?: any; secureTextEntry?: boolean;
  editable?: boolean; style?: any;
}) {
  onChangeText = onChangeText ?? (() => {});
  return (
    <View style={[{ marginBottom: spacing.lg }, style]}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textLight}
        multiline={multiline}
        keyboardType={keyboardType}
        secureTextEntry={secureTextEntry}
        editable={editable}
        style={[styles.input, multiline && { height: 100, textAlignVertical: 'top' },
          error ? { borderColor: colors.danger } : null]}
      />
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

// ---------- Card ----------
export function Card({ children, style, onPress }: { children: React.ReactNode; style?: any; onPress?: () => void }) {
  if (onPress) {
    return (
      <TouchableOpacity activeOpacity={0.9} onPress={onPress} style={[styles.card, style]}>
        {children}
      </TouchableOpacity>
    );
  }
  return <View style={[styles.card, style]}>{children}</View>;
}

// ---------- Chip ----------
export function Chip({
  label, selected, onPress, style,
}: { label: string; selected?: boolean; onPress?: () => void; style?: any }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={[{
        paddingHorizontal: 14, paddingVertical: 8, borderRadius: radius.pill,
        backgroundColor: selected ? colors.primary : colors.bg,
        borderWidth: 1, borderColor: selected ? colors.primary : colors.border,
        marginRight: spacing.sm, marginBottom: spacing.sm,
      }, style]}
    >
      <Text style={{ color: selected ? '#fff' : colors.text, fontSize: 13, fontWeight: '600' }}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

// ---------- SectionHeader ----------
export function SectionHeader({ title, actionTitle, onAction }: { title: string; actionTitle?: string; onAction?: () => void }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
      marginTop: spacing.xl, marginBottom: spacing.md }}>
      <Text style={[type.h3, { color: colors.text }]}>{title}</Text>
      {actionTitle ? (
        <TouchableOpacity onPress={onAction}>
          <Text style={{ color: colors.primary, fontWeight: '700', fontSize: 13 }}>{actionTitle}</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

// ---------- Loading ----------
export function Loading({ label }: { label?: string }) {
  const { t } = useApp();
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg }}>
      <ActivityIndicator size="large" color={colors.primary} />
      <Text style={{ marginTop: spacing.md, color: colors.textSecondary }}>{label ?? t('misc.loading')}</Text>
    </View>
  );
}

// ---------- EmptyState ----------
export function EmptyState({ emoji, title, subtitle }: { emoji: string; title: string; subtitle?: string }) {
  return (
    <View style={{ alignItems: 'center', paddingVertical: 48, paddingHorizontal: 32 }}>
      <Text style={{ fontSize: 52, marginBottom: spacing.md }}>{emoji}</Text>
      <Text style={[type.h3, { color: colors.text, textAlign: 'center' }]}>{title}</Text>
      {subtitle ? (
        <Text style={{ color: colors.textSecondary, textAlign: 'center', marginTop: spacing.sm, fontSize: 14 }}>
          {subtitle}
        </Text>
      ) : null}
    </View>
  );
}

// ---------- ErrorState ----------
export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  const { t } = useApp();
  return (
    <View style={{ alignItems: 'center', paddingVertical: 40, paddingHorizontal: 32 }}>
      <Text style={{ fontSize: 44, marginBottom: spacing.md }}>😕</Text>
      <Text style={{ color: colors.textSecondary, textAlign: 'center', fontSize: 15 }}>{message}</Text>
      {onRetry ? (
        <TouchableOpacity onPress={onRetry} style={{ marginTop: spacing.lg }}>
          <Text style={{ color: colors.primary, fontWeight: '700' }}>{t('btn.retry')}</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

// ---------- Toast ----------
export function Toast({ visible, message, type: toastType, onHide }: {
  visible: boolean; message: string; type: 'success' | 'error' | 'info'; onHide: () => void;
}) {
  React.useEffect(() => {
    if (visible) {
      const timer = setTimeout(onHide, 3000);
      return () => clearTimeout(timer);
    }
  }, [visible]);
  const bg = toastType === 'success' ? colors.success : toastType === 'error' ? colors.danger : colors.primary;
  return (
    <Modal transparent visible={visible} animationType="fade">
      <Pressable style={{ flex: 1, justifyContent: 'flex-start', alignItems: 'center', marginTop: 64 }} onPress={onHide}>
        <View style={{ backgroundColor: bg, borderRadius: radius.md, paddingVertical: 12, paddingHorizontal: 20,
          maxWidth: '88%', shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 8, elevation: 4 }}>
          <Text style={{ color: '#fff', fontSize: 14, fontWeight: '600', textAlign: 'center' }}>{message}</Text>
        </View>
      </Pressable>
    </Modal>
  );
}

// ---------- Modal picker (bottom sheet) ----------
export function PickerSheet({
  visible, title, options, selectedValue, onSelect, onClose,
}: {
  visible: boolean; title: string;
  options: { label: string; value: string }[];
  selectedValue?: string; onSelect: (value: string) => void; onClose: () => void;
}) {
  return (
    <Modal transparent visible={visible} animationType="slide" onRequestClose={onClose}>
      <Pressable style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' }} onPress={onClose}>
        <Pressable style={{ backgroundColor: colors.card, borderTopLeftRadius: radius.xl,
          borderTopRightRadius: radius.xl, maxHeight: '70%' }} onPress={(e) => e.stopPropagation()}>
          <View style={{ padding: spacing.lg, borderBottomWidth: 1, borderBottomColor: colors.border }}>
            <Text style={[type.h3, { color: colors.text }]}>{title}</Text>
          </View>
          <ScrollView style={{ maxHeight: 400 }}>
            {options.map((opt) => (
              <TouchableOpacity
                key={opt.value}
                onPress={() => { onSelect(opt.value); onClose(); }}
                style={{
                  flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
                  paddingVertical: 14, paddingHorizontal: spacing.lg,
                  borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border,
                  backgroundColor: selectedValue === opt.value ? colors.primaryLight : undefined,
                }}
              >
                <Text style={{ fontSize: 15, color: selectedValue === opt.value ? colors.primary : colors.text,
                  fontWeight: selectedValue === opt.value ? '700' : '400' }}>
                  {opt.label}
                </Text>
                {selectedValue === opt.value ? <Text style={{ color: colors.primary }}>✓</Text> : null}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

// ---------- Bilingual salary text ----------
export function salaryText(job: { salaryMin?: number; salaryMax?: number; salaryPeriod: string }, t: (k: string) => string) {
  if (!job.salaryMin && !job.salaryMax) return '—';
  if (job.salaryMin && job.salaryMax) {
    return `₹${job.salaryMin.toLocaleString('en-IN')} - ₹${job.salaryMax.toLocaleString('en-IN')} ${t('sp.' + job.salaryPeriod)}`;
  }
  const v = job.salaryMin ?? job.salaryMax!;
  return `₹${v.toLocaleString('en-IN')} ${t('sp.' + job.salaryPeriod)}`;
}

const styles = StyleSheet.create({
  label: { fontSize: 14, fontWeight: '600', color: colors.text, marginBottom: 6 },
  input: {
    backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border,
    borderRadius: radius.md, paddingHorizontal: 14, paddingVertical: 12,
    fontSize: 15, color: colors.text,
  },
  card: {
    backgroundColor: colors.card, borderRadius: radius.lg, padding: spacing.lg,
    borderWidth: 1, borderColor: colors.border,
    shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8, shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  errorText: { color: colors.danger, fontSize: 12, marginTop: 4 },
});
