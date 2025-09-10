import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Alert } from 'react-native';
import AnimatedModal from '../components/ui/AnimatedModal';
import {
  ArrowLeft,
  User,
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
import { Separator } from '../components/ui/Separator';
import { useNavigation } from '@react-navigation/native';
import { useThemeColors, useThemeMode } from '../lib/theme';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';

export const SettingsScreen: React.FC = () => {
  const navigation = useNavigation();
  const theme = useThemeColors();
  const { mode, setMode } = useThemeMode();
  const { signOut, user } = useAuth();
  const { t, setLanguage, languageLabel } = useLanguage();

  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState<'success' | 'info' | 'warning'>('info');
  const [modalTitle, setModalTitle] = useState('');
  const [modalMessage, setModalMessage] = useState('');

  const handleLanguagePress = () => {
    (navigation as any).navigate('Language');
  };

  const handleThemePress = () => {
    // Cycle through modes: system -> light -> dark -> system
    const next = mode === 'system' ? 'light' : mode === 'light' ? 'dark' : 'system';
    setMode(next as any);
  };

  const currentThemeLabel = useMemo(() => {
    if (mode === 'system') return 'System';
    if (mode === 'light') return 'Light';
    return 'Dark';
  }, [mode]);

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
    // Only show account section if user is authenticated
    ...(user ? [{
      title: t('account'),
      items: [
        {
          icon: User,
          label: t('edit_profile'),
          description: t('update_personal_info'),
          action: () => (navigation as any).navigate('EditProfile' as never),
          showArrow: true,
        },
        {
          icon: MapPin,
          label: t('manage_addresses'),
          description: t('add_edit_locations'),
          action: () => (navigation as any).navigate('Addresses' as never),
          showArrow: true,
        },
        {
          icon: CreditCard,
          label: t('payment_methods'),
          description: t('manage_payment_options'),
          action: () => {
            setModalType('info');
            setModalTitle(t('payment_methods'));
            setModalMessage(`${t('payment_methods')} ${t('is_coming_soon')}.`);
            setModalVisible(true);
          },
          showArrow: true,
        },
      ],
    }] : []),
    {
      title: t('preferences'),
      items: [
        {
          icon: Globe,
          label: t('language'),
          description: t('choose_language'),
          action: handleLanguagePress,
          value: languageLabel,
          showArrow: true,
        },
        {
          icon: theme.isDark ? Moon : Sun,
          label: t('theme'),
          description: t('choose_app_appearance'),
          action: handleThemePress,
          value: currentThemeLabel,
          showArrow: true,
        },
      ],
    },
    // Notifications section removed
    {
      title: t('support_legal'),
      items: [
        {
          icon: Shield,
          label: t('support_legal'),
          description: t('help_privacy_terms_about'),
          action: () => (navigation as any).navigate('SupportLegal'),
          showArrow: true,
        },
      ],
    },
  ];

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { 
        text: 'Sign Out', 
        style: 'destructive', 
        onPress: async () => {
          try {
            await signOut();
          } catch (e) {
            Alert.alert('Error', 'Failed to sign out. Please try again.');
          }
        }
      },
    ]);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.card, borderBottomColor: theme.cardBorder }]}>
        <Button
          variant="ghost"
          size="icon"
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <ArrowLeft size={20} color={theme.textPrimary} />
        </Button>
        <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>{t('settings')}</Text>
      {/* Animated Modal */}
    <AnimatedModal
      visible={modalVisible}
      type={modalType}
      title={modalTitle}
      message={modalMessage}
      onClose={() => setModalVisible(false)}
    />
    </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {settingSections.map((section, sectionIndex) => (
          <View key={sectionIndex} style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>{section.title}</Text>
            <Card style={[styles.sectionCard, { backgroundColor: theme.card }]}>
              {section.items.map((item, itemIndex) => (
                <View key={itemIndex}>
                  <Pressable
                    style={[styles.settingItem, item.action && styles.pressableItem]}
                    onPress={item.action}
                  >
                    <View style={styles.settingIcon}>
                      <item.icon size={20} color={theme.accent} />
                    </View>
                    <View style={styles.settingContent}>
                      <Text style={[styles.settingLabel, { color: theme.textPrimary }]}>{item.label}</Text>
                      <Text style={[styles.settingDescription, { color: theme.textSecondary }]}>{item.description}</Text>
                      {item.value && (
                        <Text style={[styles.settingValue, { color: theme.accent }]}>{item.value}</Text>
                      )}
                    </View>
                    {item.component && <View style={styles.settingComponent}>{item.component}</View>}
                    {item.showArrow && <ChevronRight size={20} color={theme.textSecondary} style={styles.arrow} />}
                  </Pressable>
                  {itemIndex < section.items.length - 1 && <Separator />}
                </View>
              ))}
            </Card>
          </View>
        ))}

        {/* Sign Out Button - Only show if user is authenticated */}
        {user && (
          <Card style={[styles.signOutCard, { backgroundColor: theme.card }]}>
            <Button
              variant="ghost"
              style={styles.signOutButton}
              onPress={handleSignOut}
            >
              <LogOut size={20} color="#ef4444" />
              <Text style={[styles.signOutText, { color: '#ef4444' }]}>Sign Out</Text>
            </Button>
          </Card>
        )}

        {/* App Version */}
        <View style={styles.appVersion}>
          <Text style={[styles.appVersionText, { color: theme.textSecondary }]}>Car Wash App</Text>
          <Text style={[styles.appVersionText, { color: theme.textSecondary }]}>Version 1.0.0</Text>
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
