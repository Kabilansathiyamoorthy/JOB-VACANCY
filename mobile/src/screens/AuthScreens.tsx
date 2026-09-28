// VelaiConnect – Auth screens (extremely simple first screen)
import React, { useEffect, useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import { colors, spacing, radius, type } from '../theme';
import { useApp, LanguageSwitcher } from '../context';
import { api, ApiError, SendOtpResponse, AuthResponse } from '../api';
import { PrimaryButton, Input, PickerSheet, Toast } from '../components';

// =============== FIRST SCREEN / LOGIN ===============
export function LoginScreen({ navigation }: any) {
  const { t, lang, setLang } = useApp();
  const [mobile, setMobile] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState<{ show: boolean; msg: string; type: 'success' | 'error' | 'info' }>({
    show: false, msg: '', type: 'info',
  });

  const valid = /^[6-9]\d{9}$/.test(mobile);

  const sendOtp = async (purpose: 'LOGIN' | 'REGISTRATION') => {
    if (!valid) {
      setError(t('misc.invalidMobile'));
      return;
    }
    setError('');
    setLoading(true);
    try {
      const resp: SendOtpResponse = await api.sendOtp(mobile, purpose);
      setLoading(false);
      navigation.navigate('Otp', {
        mobile, purpose, maskedMobile: resp.maskedMobile, devOtp: resp.devOtp,
      });
    } catch (e: any) {
      setLoading(false);
      const msg = e instanceof ApiError ? (lang === 'ta' && e.messageTa ? e.messageTa : e.message) : t('misc.error');
      setToast({ show: true, msg, type: 'error' });
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: colors.primary }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.loginWrap} keyboardShouldPersistTaps="handled">
        {/* Brand */}
        <Text style={styles.brandEn}>{t('brand.en')}</Text>
        <Text style={styles.brandTa}>{t('brand.ta')}</Text>
        <Text style={styles.tagline}>{t('tagline')}</Text>

        <LanguageSwitcher style={{ marginVertical: spacing.xl }} />

        {/* Card */}
        <View style={styles.loginCard}>
          <Text style={styles.enterMobile}>{t('login.enterMobile')}</Text>
          <View style={styles.mobileRow}>
            <Text style={styles.flag}>🇮🇳</Text>
            <Text style={styles.dialCode}>+91</Text>
            <TextInput
              style={styles.mobileInput}
              value={mobile}
              onChangeText={(v) => { setMobile(v.replace(/[^0-9]/g, '').slice(0, 10)); setError(''); }}
              placeholder="98765 43210"
              placeholderTextColor={colors.textLight}
              keyboardType="phone-pad"
              maxLength={10}
            />
          </View>
          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <PrimaryButton title={t('login.sendOtp')} onPress={() => sendOtp('LOGIN')}
            loading={loading} disabled={!valid} style={{ marginTop: spacing.lg }} />

          <View style={{ alignItems: 'center', marginTop: spacing.xl }}>
            <Text style={{ color: colors.textSecondary, fontSize: 14 }}>{t('login.newTo')}</Text>
            <TouchableOpacity onPress={() => sendOtp('REGISTRATION')} style={{ marginTop: spacing.md }}>
              <Text style={{ color: colors.primary, fontWeight: '800', fontSize: 15, letterSpacing: 0.4 }}>
                {t('login.registerNow')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Safety note */}
        <Text style={styles.safetyNote}>{t('safety.warning')}</Text>
      </ScrollView>
      <Toast visible={toast.show} message={toast.msg} type={toast.type} onHide={() => setToast(s => ({ ...s, show: false }))} />
    </KeyboardAvoidingView>
  );
}

// =============== OTP SCREEN ===============
export function OtpScreen({ navigation, route }: any) {
  const { t, lang, signIn, role } = useApp();
  const { mobile, purpose, maskedMobile, devOtp } = route.params;
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(30);
  const [toast, setToast] = useState<{ show: boolean; msg: string; type: 'success' | 'error' | 'info' }>({
    show: false, msg: '', type: 'info',
  });

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  const verify = async () => {
    if (otp.length !== 6) return;
    setLoading(true);
    setError('');
    try {
      const auth = await api.verifyOtp(mobile, otp, purpose);
      setLoading(false);
      await signIn(auth);
      if (purpose === 'REGISTRATION') {
        navigation.replace('AccountType', { mobile });
      } else if (!auth.profileComplete) {
        navigation.replace('AccountType', { mobile });
      } else {
        // logged in → root navigator decides the dashboard
        navigation.replace('Main');
      }
    } catch (e: any) {
      setLoading(false);
      const msg = e instanceof ApiError ? (lang === 'ta' && e.messageTa ? e.messageTa : e.message) : t('misc.error');
      setError(msg);
    }
  };

  const resend = async () => {
    setCountdown(30);
    try {
      const resp = await api.sendOtp(mobile, purpose);
      if (resp.devOtp) setToast({ show: true, msg: `${t('otp.devHint')} ${resp.devOtp}`, type: 'info' });
    } catch (e: any) {
      const msg = e instanceof ApiError ? (lang === 'ta' && e.messageTa ? e.messageTa : e.message) : t('misc.error');
      setToast({ show: true, msg, type: 'error' });
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: colors.bg }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: spacing.xl }}
        keyboardShouldPersistTaps="handled">
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={{ fontSize: 28, marginBottom: spacing.lg }}>←</Text>
        </TouchableOpacity>
        <Text style={[type.title, { color: colors.text }]}>{t('otp.title')}</Text>
        <Text style={{ color: colors.textSecondary, marginTop: spacing.sm, fontSize: 15 }}>
          {t('otp.sentTo')} <Text style={{ fontWeight: '700', color: colors.text }}>{maskedMobile}</Text>
        </Text>

        <TextInput
          style={styles.otpInput}
          value={otp}
          onChangeText={(v) => setOtp(v.replace(/[^0-9]/g, '').slice(0, 6))}
          placeholder="••••••"
          placeholderTextColor={colors.textLight}
          keyboardType="number-pad"
          maxLength={6}
        />
        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <PrimaryButton title={t('otp.verify')} onPress={verify} loading={loading} disabled={otp.length !== 6}
          style={{ marginTop: spacing.xl }} />

        {devOtp ? (
          <Text style={{ textAlign: 'center', marginTop: spacing.md, color: colors.warning, fontWeight: '600' }}>
            {t('otp.devHint')} {devOtp}
          </Text>
        ) : null}

        <TouchableOpacity disabled={countdown > 0} onPress={resend} style={{ marginTop: spacing.xl, alignItems: 'center' }}>
          <Text style={{ color: countdown > 0 ? colors.textLight : colors.primary, fontWeight: '700', fontSize: 15 }}>
            {countdown > 0
              ? `${t('otp.resendIn')} ${countdown}${t('otp.seconds')}`
              : t('otp.resend')}
          </Text>
        </TouchableOpacity>
      </ScrollView>
      <Toast visible={toast.show} message={toast.msg} type={toast.type} onHide={() => setToast(s => ({ ...s, show: false }))} />
    </KeyboardAvoidingView>
  );
}

// =============== ACCOUNT TYPE ===============
export function AccountTypeScreen({ navigation, route }: any) {
  const { t, lang } = useApp();
  const { mobile } = route.params;
  const [selected, setSelected] = useState<'JOB_SEEKER' | 'EMPLOYER' | null>(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ show: boolean; msg: string; type: 'success' | 'error' | 'info' }>({
    show: false, msg: '', type: 'info',
  });

  const proceed = async () => {
    if (!selected) return;
    setLoading(true);
    try {
      await api.setAccountType(mobile, selected);
      setLoading(false);
      navigation.replace(selected === 'JOB_SEEKER' ? 'RegisterSeeker' : 'RegisterEmployer');
    } catch (e: any) {
      setLoading(false);
      const msg = e instanceof ApiError ? (lang === 'ta' && e.messageTa ? e.messageTa : e.message) : t('misc.error');
      setToast({ show: true, msg, type: 'error' });
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg, padding: spacing.xl, justifyContent: 'center' }}>
      <Text style={[type.h2, { color: colors.text, textAlign: 'center', marginBottom: spacing.xxl }]}>
        {t('reg.chooseType')}
      </Text>

      {/* JOB SEEKER */}
      <TouchableOpacity
        onPress={() => setSelected('JOB_SEEKER')}
        activeOpacity={0.9}
        style={[styles.typeCard, selected === 'JOB_SEEKER' && styles.typeCardSelected]}>
        <Text style={{ fontSize: 40 }}>👨‍💼</Text>
        <Text style={[type.h3, { color: colors.text, marginTop: spacing.md }]}>{t('reg.jobSeeker')}</Text>
        <Text style={{ color: colors.textSecondary, marginTop: 4, textAlign: 'center' }}>{t('reg.jobSeekerDesc')}</Text>
      </TouchableOpacity>

      {/* EMPLOYER */}
      <TouchableOpacity
        onPress={() => setSelected('EMPLOYER')}
        activeOpacity={0.9}
        style={[styles.typeCard, selected === 'EMPLOYER' && styles.typeCardSelected, { marginTop: spacing.lg }]}>
        <Text style={{ fontSize: 40 }}>🏢</Text>
        <Text style={[type.h3, { color: colors.text, marginTop: spacing.md }]}>{t('reg.employer')}</Text>
        <Text style={{ color: colors.textSecondary, marginTop: 4, textAlign: 'center' }}>{t('reg.employerDesc')}</Text>
      </TouchableOpacity>

      <PrimaryButton title={t('reg.continue')} onPress={proceed} loading={loading} disabled={!selected}
        style={{ marginTop: spacing.xxl }} />
      <Toast visible={toast.show} message={toast.msg} type={toast.type} onHide={() => setToast(s => ({ ...s, show: false }))} />
    </View>
  );
}

// =============== SEEKER REGISTRATION ===============
export function RegisterSeekerScreen({ navigation }: any) {
  const { t, lang, setDisplayName, setProfileComplete } = useApp();
  const [fullName, setFullName] = useState('');
  const [city, setCity] = useState('');
  const [education, setEducation] = useState('');
  const [skills, setSkills] = useState('');
  const [experience, setExperience] = useState('');
  const [categoryCode, setCategoryCode] = useState('');
  const [categoryName, setCategoryName] = useState('');
  const [salaryMin, setSalaryMin] = useState('');
  const [salaryMax, setSalaryMax] = useState('');
  const [jobType, setJobType] = useState('');
  const [jobTypeName, setJobTypeName] = useState('');
  const [categories, setCategories] = useState<any[]>([]);
  const [showCat, setShowCat] = useState(false);
  const [showType, setShowType] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [toast, setToast] = useState<{ show: boolean; msg: string; type: 'success' | 'error' | 'info' }>({
    show: false, msg: '', type: 'info',
  });

  React.useEffect(() => {
    api.categories().then(setCategories).catch(() => {});
  }, []);

  const jobTypeOptions = [
    { value: 'FULL_TIME', en: 'Full Time', ta: 'முழு நேரம்' },
    { value: 'PART_TIME', en: 'Part Time', ta: 'பகுதி நேரம்' },
    { value: 'DAILY_WAGE', en: 'Daily Wage', ta: 'தினசரி கூலி' },
    { value: 'WORK_FROM_HOME', en: 'Work From Home', ta: 'வீட்டிலிருந்து' },
    { value: 'ANY', en: 'Any', ta: 'எதுவும்' },
  ];

  const submit = async () => {
    const errs: Record<string, string> = {};
    if (!fullName.trim()) errs.fullName = t('misc.required');
    if (!city.trim()) errs.city = t('misc.required');
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setLoading(true);
    try {
      await api.registerJobSeeker({
        fullName, city, education,
        skills: skills.split(',').map(s => s.trim()).filter(Boolean).join(','),
        experienceYears: parseFloat(experience) || 0,
        preferredCategoryCode: categoryCode || undefined,
        expectedSalaryMin: salaryMin ? parseInt(salaryMin) : undefined,
        expectedSalaryMax: salaryMax ? parseInt(salaryMax) : undefined,
        preferredJobType: jobType === 'ANY' ? undefined : jobType || undefined,
      });
      setLoading(false);
      setDisplayName(fullName);
      setProfileComplete(true);
      navigation.replace('Main');
    } catch (e: any) {
      setLoading(false);
      const msg = e instanceof ApiError ? (lang === 'ta' && e.messageTa ? e.messageTa : e.message) : t('misc.error');
      setToast({ show: true, msg, type: 'error' });
    }
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.bg }} contentContainerStyle={{ padding: spacing.xl }}>
      <Text style={[type.h2, { color: colors.text, marginBottom: spacing.xl }]}>{t('reg.jobSeeker')} 👨‍💼</Text>

      <Input label={t('field.fullName')} value={fullName} onChangeText={setFullName}
        error={errors.fullName} placeholder="Rajesh Kumar" />
      <Input label={t('field.city')} value={city} onChangeText={setCity} error={errors.city}
        placeholder="Chennai / சென்னை" />

      <TouchableOpacity onPress={() => setShowCat(true)}>
        <Input label={t('field.preferredCategory')} value={categoryName} editable={false}
          placeholder={t('jobs.allCategories')} />
      </TouchableOpacity>

      <Input label={t('field.education')} value={education} onChangeText={setEducation}
        placeholder="10th / 12th / Diploma / B.E." />
      <Input label={t('field.skills')} value={skills} onChangeText={setSkills}
        placeholder="Driving, Cooking, MS Office…" />

      <Input label={t('field.experience')} value={experience} onChangeText={setExperience}
        keyboardType="decimal-pad" placeholder="0" />

      <View style={{ flexDirection: 'row' }}>
        <View style={{ flex: 1, marginRight: spacing.sm }}>
          <Input label={t('field.min')} value={salaryMin} onChangeText={setSalaryMin} keyboardType="number-pad" />
        </View>
        <View style={{ flex: 1, marginLeft: spacing.sm }}>
          <Input label={t('field.max')} value={salaryMax} onChangeText={setSalaryMax} keyboardType="number-pad" />
        </View>
      </View>

      <TouchableOpacity onPress={() => setShowType(true)}>
        <Input label={t('field.jobType')} value={jobTypeName} editable={false} />
      </TouchableOpacity>

      <PrimaryButton title={t('btn.submit')} onPress={submit} loading={loading} style={{ marginTop: spacing.md }} />
      <TouchableOpacity onPress={() => navigation.replace('Main')} style={{ alignItems: 'center', padding: spacing.lg }}>
        <Text style={{ color: colors.textSecondary }}>{t('btn.skip')}</Text>
      </TouchableOpacity>

      <PickerSheet
        visible={showCat}
        title={t('field.preferredCategory')}
        options={categories.map(c => ({ label: `${c.icon} ${lang === 'ta' ? c.nameTa : c.nameEn}`, value: c.code }))}
        selectedValue={categoryCode}
        onSelect={(v) => {
          setCategoryCode(v);
          const c = categories.find(x => x.code === v);
          setCategoryName(c ? `${c.icon} ${lang === 'ta' ? c.nameTa : c.nameEn}` : '');
        }}
        onClose={() => setShowCat(false)}
      />
      <PickerSheet
        visible={showType}
        title={t('field.jobType')}
        options={jobTypeOptions.map(o => ({ label: lang === 'ta' ? o.ta : o.en, value: o.value }))}
        selectedValue={jobType}
        onSelect={(v) => {
          setJobType(v);
          const o = jobTypeOptions.find(x => x.value === v);
          setJobTypeName(o ? (lang === 'ta' ? o.ta : o.en) : '');
        }}
        onClose={() => setShowType(false)}
      />
      <Toast visible={toast.show} message={toast.msg} type={toast.type} onHide={() => setToast(s => ({ ...s, show: false }))} />
    </ScrollView>
  );
}

// =============== EMPLOYER REGISTRATION ===============
export function RegisterEmployerScreen({ navigation }: any) {
  const { t, lang, setDisplayName, setProfileComplete } = useApp();
  const [companyName, setCompanyName] = useState('');
  const [companyType, setCompanyType] = useState('');
  const [companyTypeLabel, setCompanyTypeLabel] = useState('');
  const [description, setDescription] = useState('');
  const [city, setCity] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [showType, setShowType] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [toast, setToast] = useState<{ show: boolean; msg: string; type: 'success' | 'error' | 'info' }>({
    show: false, msg: '', type: 'info',
  });

  const typeOptions = [
    { value: 'INDIVIDUAL', en: 'Individual / தனிநபர்', ta: 'தனிநபர்' },
    { value: 'SMALL_BUSINESS', en: 'Small Business', ta: 'சிறு வணிகம்' },
    { value: 'COMPANY', en: 'Company / Pvt Ltd', ta: 'நிறுவனம்' },
    { value: 'CONTRACTOR', en: 'Contractor', ta: 'ஒப்பந்ததாரர்' },
    { value: 'AGENT', en: 'Agent / Consultant', ta: 'முகவர்' },
  ];

  const submit = async () => {
    const errs: Record<string, string> = {};
    if (!companyName.trim()) errs.companyName = t('misc.required');
    if (!contactPerson.trim()) errs.contactPerson = t('misc.required');
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setLoading(true);
    try {
      await api.registerEmployer({
        companyName, city,
        companyType: companyTypeLabel || undefined,
        companyDescription: description || undefined,
        contactPerson,
      });
      setLoading(false);
      setDisplayName(companyName);
      setProfileComplete(true);
      navigation.replace('Main');
    } catch (e: any) {
      setLoading(false);
      const msg = e instanceof ApiError ? (lang === 'ta' && e.messageTa ? e.messageTa : e.message) : t('misc.error');
      setToast({ show: true, msg, type: 'error' });
    }
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.bg }} contentContainerStyle={{ padding: spacing.xl }}>
      <Text style={[type.h2, { color: colors.text, marginBottom: spacing.xl }]}>{t('reg.employer')} 🏢</Text>

      <Input label={t('field.companyName')} value={companyName} onChangeText={setCompanyName}
        error={errors.companyName} placeholder="Sri Balaji Constructions" />
      <TouchableOpacity onPress={() => setShowType(true)}>
        <Input label={t('field.companyType')} value={companyTypeLabel} editable={false} />
      </TouchableOpacity>
      <Input label={t('field.city')} value={city} onChangeText={setCity} placeholder="Coimbatore / கோயம்புத்தூர்" />
      <Input label={t('field.contactPerson')} value={contactPerson} onChangeText={setContactPerson}
        error={errors.contactPerson} />
      <Input label={t('field.companyDesc')} value={description} onChangeText={setDescription} multiline
        placeholder="We are hiring…" />

      <PrimaryButton title={t('btn.submit')} onPress={submit} loading={loading} style={{ marginTop: spacing.md }} />
      <TouchableOpacity onPress={() => navigation.replace('Main')} style={{ alignItems: 'center', padding: spacing.lg }}>
        <Text style={{ color: colors.textSecondary }}>{t('btn.skip')}</Text>
      </TouchableOpacity>

      <PickerSheet
        visible={showType}
        title={t('field.companyType')}
        options={typeOptions.map(o => ({ label: lang === 'ta' ? o.ta : o.en, value: o.value }))}
        selectedValue={companyType}
        onSelect={(v) => {
          setCompanyType(v);
          const o = typeOptions.find(x => x.value === v);
          setCompanyTypeLabel(o ? (lang === 'ta' ? o.ta : o.en) : '');
        }}
        onClose={() => setShowType(false)}
      />
      <Toast visible={toast.show} message={toast.msg} type={toast.type} onHide={() => setToast(s => ({ ...s, show: false }))} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  loginWrap: { flexGrow: 1, justifyContent: 'center', padding: spacing.xl, paddingTop: 80 },
  brandEn: { fontSize: 36, fontWeight: '900', color: '#fff', textAlign: 'center', letterSpacing: 0.5 },
  brandTa: { fontSize: 30, fontWeight: '800', color: colors.accent, textAlign: 'center', marginTop: 2 },
  tagline: { color: 'rgba(255,255,255,0.85)', textAlign: 'center', marginTop: spacing.sm, fontSize: 15 },
  loginCard: {
    backgroundColor: colors.card, borderRadius: radius.xl, padding: spacing.xl,
    shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 16, elevation: 6,
  },
  enterMobile: { fontSize: 16, fontWeight: '700', color: colors.text, marginBottom: spacing.md },
  mobileRow: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: colors.bg,
    borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, paddingHorizontal: 12,
  },
  flag: { fontSize: 22, marginRight: 8 },
  dialCode: { fontSize: 16, fontWeight: '700', color: colors.text, marginRight: 8 },
  mobileInput: { flex: 1, fontSize: 18, paddingVertical: 14, color: colors.text, fontWeight: '600' },
  errorText: { color: colors.danger, fontSize: 13, marginTop: 8 },
  safetyNote: { color: 'rgba(255,255,255,0.75)', textAlign: 'center', marginTop: spacing.xl, fontSize: 13 },
  otpInput: {
    backgroundColor: colors.card, borderWidth: 2, borderColor: colors.primary,
    borderRadius: radius.md, fontSize: 30, letterSpacing: 14, textAlign: 'center',
    paddingVertical: 14, marginTop: spacing.xl, color: colors.text, fontWeight: '800',
  },
  typeCard: {
    backgroundColor: colors.card, borderRadius: radius.xl, padding: spacing.xl, alignItems: 'center',
    borderWidth: 2, borderColor: colors.border,
  },
  typeCardSelected: { borderColor: colors.primary, backgroundColor: colors.primaryLight },
});
