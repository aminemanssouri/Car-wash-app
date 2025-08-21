import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Alert } from 'react-native';
import {
  ArrowLeft,
  User,
  Bell,
  Globe,
  MapPin,
  CreditCard,
  Shield,
  HelpCircle,
  LogOut,
  ChevronRight,
  Moon,
  Sun,
  Smartphone,
} from 'lucide-react-native';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Switch } from '../components/ui/Switch';
import { Separator } from '../components/ui/Separator';
import { useNavigation } from '@react-navigation/native';

export const SettingsScreen: React.FC = () => {
  const navigation = useNavigation();
  const [notifications, setNotifications] = useState({
    bookingUpdates: true,
    workerMessages: true,
    promotions: false,
    reminders: true,
  });
  const [language, setLanguage] = useState('en');
  const [theme, setTheme] = useState('light');

  const handleNotificationChange = (key: keyof typeof notifications) => {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleLanguagePress = () => {
    Alert.alert('Language', 'Language selection coming soon');
  };

  const handleThemePress = () => {
    Alert.alert('Theme', 'Theme selection coming soon');
  };

  interface SettingItem {
    icon: any;
    label: string;
    description: string;
    action?: () => void;
    showArrow?: boolean;
    component?: React.ReactElement;
    value?: string;
  }

  const settingSections: { title: string; items: SettingItem[] }[] = [
    {
      title: 'Account',
      items: [
        {
          icon: User,
          label: 'Edit Profile',
          description: 'Update your personal information',
          action: () => Alert.alert('Edit Profile', 'Profile editing coming soon'),
          showArrow: true,
        },
        {
          icon: MapPin,
          label: 'Manage Addresses',
          description: 'Add or edit your saved locations',
          action: () => (navigation as any).navigate('Addresses'),
          showArrow: true,
        },
        {
          icon: CreditCard,
          label: 'Payment Methods',
          description: 'Manage your payment options',
          action: () => Alert.alert('Payment', 'Payment methods coming soon'),
          showArrow: true,
        },
      ],
    },
    {
      title: 'Preferences',
      items: [
        {
          icon: Globe,
          label: 'Language',
          description: 'Choose your preferred language',
          action: handleLanguagePress,
          value: 'English',
          showArrow: true,
        },
        {
          icon: theme === 'light' ? Sun : Moon,
          label: 'Theme',
          description: 'Choose your app appearance',
          action: handleThemePress,
          value: 'Light',
          showArrow: true,
        },
      ],
    },
    {
      title: 'Notifications',
      items: [
        {
          icon: Bell,
          label: 'Booking Updates',
          description: 'Get notified about booking status changes',
          component: (
            <Switch
              checked={notifications.bookingUpdates}
              onCheckedChange={() => handleNotificationChange('bookingUpdates')}
            />
          ),
        },
        {
          icon: Bell,
          label: 'Worker Messages',
          description: 'Receive messages from car washers',
          component: (
            <Switch
              checked={notifications.workerMessages}
              onCheckedChange={() => handleNotificationChange('workerMessages')}
            />
          ),
        },
        {
          icon: Bell,
          label: 'Promotions',
          description: 'Get notified about special offers',
          component: (
            <Switch
              checked={notifications.promotions}
              onCheckedChange={() => handleNotificationChange('promotions')}
            />
          ),
        },
        {
          icon: Bell,
          label: 'Reminders',
          description: 'Receive booking reminders',
          component: (
            <Switch
              checked={notifications.reminders}
              onCheckedChange={() => handleNotificationChange('reminders')}
            />
          ),
        },
      ],
    },
    {
      title: 'Support & Legal',
      items: [
        {
          icon: HelpCircle,
          label: 'Help Center',
          description: 'Get help and support',
          action: () => Alert.alert('Help', 'Help center coming soon'),
          showArrow: true,
        },
        {
          icon: Shield,
          label: 'Privacy Policy',
          description: 'Read our privacy policy',
          action: () => Alert.alert('Privacy', 'Privacy policy coming soon'),
          showArrow: true,
        },
        {
          icon: Shield,
          label: 'Terms of Service',
          description: 'Read our terms of service',
          action: () => Alert.alert('Terms', 'Terms of service coming soon'),
          showArrow: true,
        },
        {
          icon: Smartphone,
          label: 'About',
          description: 'App version and information',
          action: () => Alert.alert('About', 'Car Wash App v1.0.0'),
          showArrow: true,
        },
      ],
    },
  ];

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: () => console.log('Sign out') },
    ]);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Button
          variant="ghost"
          size="icon"
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <ArrowLeft size={20} color="#374151" />
        </Button>
        <Text style={styles.headerTitle}>Settings</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {settingSections.map((section, sectionIndex) => (
          <View key={sectionIndex} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <Card style={styles.sectionCard}>
              {section.items.map((item, itemIndex) => (
                <View key={itemIndex}>
                  <Pressable
                    style={[styles.settingItem, item.action && styles.pressableItem]}
                    onPress={item.action}
                  >
                    <View style={styles.settingIcon}>
                      <item.icon size={20} color="#3b82f6" />
                    </View>
                    <View style={styles.settingContent}>
                      <Text style={styles.settingLabel}>{item.label}</Text>
                      <Text style={styles.settingDescription}>{item.description}</Text>
                      {item.value && (
                        <Text style={styles.settingValue}>{item.value}</Text>
                      )}
                    </View>
                    {item.component && <View style={styles.settingComponent}>{item.component}</View>}
                    {item.showArrow && <ChevronRight size={20} color="#6b7280" style={styles.arrow} />}
                  </Pressable>
                  {itemIndex < section.items.length - 1 && <Separator />}
                </View>
              ))}
            </Card>
          </View>
        ))}

        {/* Sign Out Button */}
        <Card style={styles.signOutCard}>
          <Button
            variant="ghost"
            style={styles.signOutButton}
            onPress={handleSignOut}
          >
            <LogOut size={20} color="#ef4444" />
            <Text style={styles.signOutText}>Sign Out</Text>
          </Button>
        </Card>

        {/* App Version */}
        <View style={styles.appVersion}>
          <Text style={styles.appVersionText}>Car Wash App</Text>
          <Text style={styles.appVersionText}>Version 1.0.0</Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingTop: 50,
  },
  backButton: {
    width: 40,
    height: 40,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  sectionCard: {
    padding: 0,
    overflow: 'hidden',
  },
  settingItem: {
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  pressableItem: {
    backgroundColor: 'transparent',
  },
  settingIcon: {
    width: 40,
    height: 40,
    backgroundColor: '#eff6ff',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingContent: {
    flex: 1,
    minWidth: 0,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 14,
    color: '#6b7280',
  },
  settingValue: {
    fontSize: 14,
    color: '#3b82f6',
    marginTop: 2,
  },
  settingComponent: {
    marginLeft: 'auto',
  },
  arrow: {
    marginLeft: 'auto',
  },
  signOutCard: {
    padding: 16,
    marginBottom: 24,
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 12,
    paddingHorizontal: 0,
  },
  signOutText: {
    fontSize: 16,
    color: '#ef4444',
    fontWeight: '500',
  },
  appVersion: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  appVersionText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
});

export default SettingsScreen;
