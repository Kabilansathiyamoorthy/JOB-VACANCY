// VelaiConnect – Auth + Language state with persistence
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api, setTokens, setSessionExpiredHandler, AuthResponse } from './api';
import { Lang, t } from './i18n';

type Role = 'JOB_SEEKER' | 'EMPLOYER' | 'ADMIN' | null;

type AppContextType = {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: string) => string;
  role: Role;
  userId: string | null;
  displayName: string | null;
  profileComplete: boolean;
  authLoading: boolean;
  signIn: (auth: AuthResponse) => Promise<void>;
  signOut: () => Promise<void>;
  setProfileComplete: (v: boolean) => void;
  setDisplayName: (v: string) => void;
};

const AppContext = createContext<AppContextType>(null as any);

export const useApp = () => useContext(AppContext);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>('en');
  const [role, setRole] = useState<Role>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [displayName, setDisplayNameState] = useState<string | null>(null);
  const [profileComplete, setProfileCompleteState] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);

  // load persisted state
  useEffect(() => {
    (async () => {
      try {
        const [savedLang, access, refresh, savedRole, savedName, savedComplete] = await Promise.all([
          AsyncStorage.getItem('vc_lang'),
          AsyncStorage.getItem('vc_access'),
          AsyncStorage.getItem('vc_refresh'),
          AsyncStorage.getItem('vc_role'),
          AsyncStorage.getItem('vc_name'),
          AsyncStorage.getItem('vc_complete'),
        ]);
        if (savedLang === 'ta' || savedLang === 'en') setLangState(savedLang);
        if (access && refresh && savedRole) {
          setTokens(access, refresh);
          setRole(savedRole as Role);
          setUserId(savedRole ? await AsyncStorage.getItem('vc_userId') : null);
          setDisplayNameState(savedName);
          setProfileCompleteState(savedComplete === '1');
        }
      } finally {
        setAuthLoading(false);
      }
    })();

    setSessionExpiredHandler(() => {
      (async () => {
        await AsyncStorage.multiRemove(['vc_access', 'vc_refresh', 'vc_role', 'vc_userId', 'vc_name', 'vc_complete']);
        setTokens(null, null);
        setRole(null);
        setUserId(null);
        setDisplayNameState(null);
        setProfileCompleteState(false);
      })();
    });
  }, []);

  const setLang = (l: Lang) => {
    setLangState(l);
    AsyncStorage.setItem('vc_lang', l);
  };

  const signIn = async (auth: AuthResponse) => {
    setTokens(auth.accessToken, auth.refreshToken);
    setRole(auth.role);
    setUserId(auth.userId);
    setDisplayNameState(auth.displayName ?? null);
    setProfileCompleteState(auth.profileComplete);
    await Promise.all([
      AsyncStorage.setItem('vc_access', auth.accessToken),
      AsyncStorage.setItem('vc_refresh', auth.refreshToken),
      AsyncStorage.setItem('vc_role', auth.role),
      AsyncStorage.setItem('vc_userId', auth.userId),
      AsyncStorage.setItem('vc_name', auth.displayName ?? ''),
      AsyncStorage.setItem('vc_complete', auth.profileComplete ? '1' : '0'),
    ]);
  };

  const signOut = async () => {
    await AsyncStorage.multiRemove(['vc_access', 'vc_refresh', 'vc_role', 'vc_userId', 'vc_name', 'vc_complete']);
    setTokens(null, null);
    setRole(null);
    setUserId(null);
    setDisplayNameState(null);
    setProfileCompleteState(false);
  };

  const value = useMemo<AppContextType>(() => ({
    lang,
    setLang,
    t: (key: string) => t(key, lang),
    role,
    userId,
    displayName,
    profileComplete,
    authLoading,
    signIn,
    signOut,
    setProfileComplete: (v) => {
      setProfileCompleteState(v);
      AsyncStorage.setItem('vc_complete', v ? '1' : '0');
    },
    setDisplayName: (v) => {
      setDisplayNameState(v);
      AsyncStorage.setItem('vc_name', v ?? '');
    },
  }), [lang, role, userId, displayName, profileComplete, authLoading]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

/** Language switcher used on the first screen and in Profile. */
export function LanguageSwitcher({ style }: { style?: any }) {
  const { lang, setLang } = useApp();
  return (
    <View style={[{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }, style]}>
      {(['en', 'ta'] as Lang[]).map((l, i) => (
        <React.Fragment key={l}>
          {i > 0 && <Text style={{ color: '#98A2B3', paddingHorizontal: 8, fontSize: 15 }}>|</Text>}
          <TouchableOpacity onPress={() => setLang(l)}>
            <Text style={{
              fontSize: 16, fontWeight: lang === l ? '800' : '400',
              color: lang === l ? '#0B5FFF' : '#98A2B3',
            }}>
              {l === 'en' ? 'English' : 'தமிழ்'}
            </Text>
          </TouchableOpacity>
        </React.Fragment>
      ))}
    </View>
  );
}
