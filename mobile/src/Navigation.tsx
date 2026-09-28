// VelaiConnect – navigation: role-based tabs + stacks
import React from 'react';
import { View, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { colors } from './theme';
import { useApp } from './context';
import { Loading } from './components';

import {
  LoginScreen, OtpScreen, AccountTypeScreen, RegisterSeekerScreen, RegisterEmployerScreen,
} from './screens/AuthScreens';
import {
  HomeScreen, JobsScreen, JobDetailsScreen, SavedScreen, ApplicationsScreen,
} from './screens/SeekerScreens';
import {
  EmployerDashboardScreen, PostJobScreen, MyJobsScreen, ApplicantsScreen,
} from './screens/EmployerScreens';
import {
  ProfileScreen, EditProfileScreen, NotificationsScreen, JobAlertsScreen, VerifyEmployerScreen,
} from './screens/ProfileScreen';

const Stack = createNativeStackNavigator();
const Tabs = createBottomTabNavigator();

// ---------- tab icons ----------
const iconFor: Record<string, string> = {
  Home: '🏠', Jobs: '🔍', Saved: '❤️', Applications: '📄', Profile: '👤',
  EmpHome: '🏠', PostJob: '➕', MyJobs: '💼', Applicants: '👥',
};

function TabIcon({ label, focused }: { label: string; focused: boolean }) {
  return (
    <View style={{ alignItems: 'center', paddingTop: 6 }}>
      <Text style={{ fontSize: 20, opacity: focused ? 1 : 0.55 }}>{iconFor[label] ?? '•'}</Text>
      <Text style={{ fontSize: 10, fontWeight: focused ? '800' : '500', color: focused ? colors.primary : colors.textLight }}>
        {label}
      </Text>
    </View>
  );
}

// ---------- SEEKER TABS ----------
function SeekerTabs() {
  const { t } = useApp();
  return (
    <Tabs.Navigator screenOptions={({ route }) => ({
      headerShown: false,
      tabBarActiveTintColor: colors.primary,
      tabBarInactiveTintColor: colors.textLight,
      tabBarStyle: { height: 62, paddingBottom: 6 },
    })}>
      <Tabs.Screen name="Home" component={HomeScreen} options={{ tabBarLabel: t('tabs.home') }} />
      <Tabs.Screen name="Jobs" component={JobsScreen} options={{ tabBarLabel: t('tabs.jobs') }} />
      <Tabs.Screen name="Saved" component={SavedScreen} options={{ tabBarLabel: t('tabs.saved') }} />
      <Tabs.Screen name="Applications" component={ApplicationsScreen} options={{ tabBarLabel: t('tabs.applications') }} />
      <Tabs.Screen name="Profile" component={ProfileScreen} options={{ tabBarLabel: t('tabs.profile') }} />
    </Tabs.Navigator>
  );
}

// ---------- EMPLOYER TABS ----------
function EmployerTabs() {
  const { t } = useApp();
  return (
    <Tabs.Navigator screenOptions={{
      headerShown: false,
      tabBarActiveTintColor: colors.primary,
      tabBarInactiveTintColor: colors.textLight,
      tabBarStyle: { height: 62, paddingBottom: 6 },
    }}>
      <Tabs.Screen name="EmpHome" component={EmployerDashboardScreen} options={{ tabBarLabel: t('tabs.dashboard') }} />
      <Tabs.Screen name="PostJob" component={PostJobScreen} options={{ tabBarLabel: t('tabs.postJob') }} />
      <Tabs.Screen name="MyJobs" component={MyJobsScreen} options={{ tabBarLabel: t('tabs.myJobs') }} />
      <Tabs.Screen name="Applicants" component={ApplicantsScreen} options={{ tabBarLabel: t('tabs.applicants') }} />
      <Tabs.Screen name="Profile" component={ProfileScreen} options={{ tabBarLabel: t('tabs.profile') }} />
    </Tabs.Navigator>
  );
}

// ---------- ROOT ----------
export function RootNavigator() {
  const { role, profileComplete, authLoading, lang } = useApp();

  if (authLoading) return <Loading />;

  const authScreens = (
    <Stack.Group>
      <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Otp" component={OtpScreen} options={{ headerShown: false }} />
      <Stack.Screen name="AccountType" component={AccountTypeScreen} options={{ headerShown: false }} />
      <Stack.Screen name="RegisterSeeker" component={RegisterSeekerScreen} options={{ headerShown: false }} />
      <Stack.Screen name="RegisterEmployer" component={RegisterEmployerScreen} options={{ headerShown: false }} />
    </Stack.Group>
  );

  return (
    <NavigationContainer key={lang}>
      {role === null ? (
        <Stack.Navigator>
          {authScreens}
        </Stack.Navigator>
      ) : role === 'EMPLOYER' ? (
        <Stack.Navigator>
          <Stack.Screen name="Main" component={EmployerTabs} options={{ headerShown: false }} />
          <Stack.Screen name="EditProfile" component={EditProfileScreen}
            options={{ title: 'Edit Profile', headerBackTitle: ' ' }} />
          <Stack.Screen name="Notifications" component={NotificationsScreen} options={{ title: 'Notifications' }} />
          <Stack.Screen name="VerifyEmployer" component={VerifyEmployerScreen}
            options={{ title: 'Verify Company' }} />
          <Stack.Screen name="ApplicantsDetail" component={ApplicantsScreen} options={{ title: 'Applicants' }} />
        </Stack.Navigator>
      ) : role === 'ADMIN' ? (
        <Stack.Navigator>
          <Stack.Screen name="AdminLanding" component={AdminLanding} options={{ headerShown: false }} />
          <Stack.Screen name="Notifications" component={NotificationsScreen} options={{ title: 'Notifications' }} />
        </Stack.Navigator>
      ) : (
        <Stack.Navigator>
          <Stack.Screen name="Main" component={profileComplete ? SeekerTabs : RegisterSeekerScreen}
            options={{ headerShown: false }} />
          <Stack.Screen name="JobDetails" component={JobDetailsScreen} options={{ title: 'Job Details' }} />
          <Stack.Screen name="EditProfile" component={EditProfileScreen} options={{ title: 'Edit Profile' }} />
          <Stack.Screen name="Notifications" component={NotificationsScreen} options={{ title: 'Notifications' }} />
          <Stack.Screen name="JobAlerts" component={JobAlertsScreen} options={{ title: 'Job Alerts' }} />
        </Stack.Navigator>
      )}
    </NavigationContainer>
  );
}

// simple admin placeholder (admins use the web panel)
import { View as V, Text as T, StyleSheet } from 'react-native';
import { PrimaryButton } from './components';
function AdminLanding({ navigation }: any) {
  const { t, signOut } = useApp();
  return (
    <View style={{ flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center', padding: 32 }}>
      <Text style={{ fontSize: 48 }}>🛡️</Text>
      <Text style={{ fontSize: 18, fontWeight: '800', color: colors.text, textAlign: 'center', marginTop: 16 }}>
        {t('admin.useWeb')}
      </Text>
      <Text style={{ color: colors.textSecondary, textAlign: 'center', marginTop: 8 }}>
        https://your-admin-panel-url.com
      </Text>
      <PrimaryButton title={t('btn.logout')} onPress={signOut} style={{ marginTop: 32, minWidth: 200 }} />
    </View>
  );
}
