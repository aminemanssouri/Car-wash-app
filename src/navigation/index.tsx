import React from 'react';
import { NavigationContainer, DarkTheme as NavigationDarkTheme, DefaultTheme as NavigationLightTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Home, Calendar, Settings, Wrench, Briefcase, MessageCircle, Store } from 'lucide-react-native';
import { useThemeColors } from '../lib/theme';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';

import HomeScreen from '../screens/HomeScreen';
import BookingsScreen from '../screens/BookingsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import SettingsScreen from '../screens/SettingsScreen';
import LanguageScreen from '../screens/LanguageScreen';
import ServicesScreen from '../screens/ServicesScreen';
import LoginScreen from '../screens/LoginScreen';
import SignupScreen from '../screens/SignupScreen';
import WorkerDetailScreen from '../screens/WorkerDetailScreen';
import BookingScreen from '../screens/BookingScreen';
import BookingConfirmationScreen from '../screens/BookingConfirmationScreen';
import ServiceDetailScreen from '../screens/ServiceDetailScreen';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';
import HelpScreen from '../screens/HelpScreen';
import AddressesScreen from '../screens/AddressesScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import ServiceWorkersScreen from '../screens/ServiceWorkersScreen';
import WorkerDashboardScreen from '../screens/WorkerDashboardScreen';
import ComingSoonScreen from '../screens/ComingSoonScreen';
import SupportLegalScreen from '../screens/SupportLegalScreen';
import EditProfileScreen from '../screens/EditProfileScreen';
import AddAddressScreen from '../screens/AddAddressScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function TabNavigator() {
  const theme = useThemeColors();
  const { user } = useAuth();
  const { t } = useLanguage();
  const userRole = user?.profile?.role || 'customer';

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let IconComponent;

          if (route.name === 'Home') {
            IconComponent = Home;
          } else if (route.name === 'Bookings') {
            IconComponent = Calendar;
          } else if (route.name === 'Services') {
            IconComponent = Wrench;
          } else if (route.name === 'Dashboard') {
            IconComponent = Briefcase;
          } else if (route.name === 'Messaging') {
            IconComponent = MessageCircle;
          } else if (route.name === 'Store') {
            IconComponent = Store;
          } else if (route.name === 'Settings') {
            IconComponent = Settings;
          }

          return IconComponent ? <IconComponent size={size} color={color} /> : null;
        },
        tabBarLabel: (() => {
          switch (route.name) {
            case 'Home':
              return t('home') || 'Home';
            case 'Services':
              return t('services_title') || 'Services';
            case 'Bookings':
              return t('my_bookings') || 'Bookings';
            case 'Dashboard':
              return t('dashboard') || 'Dashboard';
            case 'Messaging':
              return t('messaging') || 'Messaging';
            case 'Store':
              return t('store') || 'Store';
            case 'Settings':
              return t('settings') || 'Settings';
            default:
              return route.name;
          }
        })(),
        tabBarActiveTintColor: theme.accent,
        tabBarInactiveTintColor: theme.textSecondary,
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.card,
          borderTopColor: theme.cardBorder,
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
        },
      })}
    >
      {userRole === 'worker' ? (
        <>
          <Tab.Screen name="Dashboard" component={WorkerDashboardScreen} />
          <Tab.Screen name="Settings" component={SettingsScreen} />
        </>
      ) : (
        <>
          <Tab.Screen name="Home" component={HomeScreen} />
          <Tab.Screen name="Services" component={ServicesScreen} />
          <Tab.Screen name="Bookings" component={BookingsScreen} />
          <Tab.Screen 
            name="Messaging" 
            component={ComingSoonScreen}
            listeners={({ navigation }) => ({
              tabPress: (e) => {
                e.preventDefault();
                navigation.navigate('ComingSoon', { feature: 'Messaging' });
              },
            })}
          />
          <Tab.Screen 
            name="Store" 
            component={ComingSoonScreen}
            listeners={({ navigation }) => ({
              tabPress: (e) => {
                e.preventDefault();
                navigation.navigate('ComingSoon', { feature: 'Store' });
              },
            })}
          />
          <Tab.Screen name="Settings" component={SettingsScreen} />
        </>
      )}
    </Tab.Navigator>
  );
}

export default function Navigation() {
  const theme = useThemeColors();
  return (
    <NavigationContainer theme={theme.isDark ? NavigationDarkTheme : NavigationLightTheme}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="MainTabs" component={TabNavigator} />
        <Stack.Screen name="Language" component={LanguageScreen} />
        <Stack.Screen name="Profile" component={ProfileScreen} />
        <Stack.Screen name="Login" component={LoginScreen} options={{ presentation: 'modal' }} />
        <Stack.Screen name="Signup" component={SignupScreen} options={{ presentation: 'modal' }} />
        <Stack.Screen name="WorkerDetail" component={WorkerDetailScreen} />
        <Stack.Screen name="Booking" component={BookingScreen} />
        <Stack.Screen name="BookingConfirmation" component={BookingConfirmationScreen} />
        <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} options={{ presentation: 'modal' }} />
        <Stack.Screen name="Help" component={HelpScreen} />
        <Stack.Screen name="Addresses" component={AddressesScreen} />
        <Stack.Screen name="ServiceDetail" component={ServiceDetailScreen} />
        <Stack.Screen name="Notifications" component={NotificationsScreen} options={{ presentation: 'modal' }} />
        <Stack.Screen name="ComingSoon" component={ComingSoonScreen} options={{ presentation: 'modal' }} />
        <Stack.Screen name="SupportLegal" component={SupportLegalScreen} />
        <Stack.Screen name="ServiceWorkers" component={ServiceWorkersScreen} />
        <Stack.Screen name="WorkerDashboard" component={WorkerDashboardScreen} />
        <Stack.Screen name="EditProfile" component={EditProfileScreen} options={{ presentation: 'modal' }} />
        <Stack.Screen name="AddAddress" component={AddAddressScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
