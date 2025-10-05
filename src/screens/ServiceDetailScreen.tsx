import React, { useMemo } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useThemeColors } from '../lib/theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation } from '@react-navigation/native';
import type { RouteProp, NavigationProp } from '@react-navigation/native';
import type { RootStackParamList } from '../types/navigation';
import { iconFor, getServiceByKey } from '../data/services';
import { Button } from '../components/ui/Button';
import { Header } from '../components/ui/Header';
import { useLanguage } from '../contexts/LanguageContext';

export default function ServiceDetailScreen() {
  const theme = useThemeColors();
  const route = useRoute<RouteProp<RootStackParamList, 'ServiceDetail'>>();
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { serviceKey } = route.params || ({} as any);
  const { t } = useLanguage();

  const service = useMemo(() => getServiceByKey(serviceKey), [serviceKey]);
  const Icon = service ? iconFor(service.icon) : undefined;

  if (!service) {
    return (
      <SafeAreaView edges={["bottom"]} style={{ flex: 1, backgroundColor: theme.bg }}>
        <Header 
          title={t('service details')} 
          onBack={() => navigation.goBack()} 
        />
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <Text style={{ fontSize: 16, color: theme.textPrimary, marginBottom: 12 }}>{t('service not found')}</Text>
          <Button onPress={() => navigation.goBack()}>{t('go_back')}</Button>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={["bottom"]} style={{ flex: 1, backgroundColor: theme.bg }}>
      <Header 
        title={t('service details')} 
        onBack={() => navigation.goBack()} 
      />
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 24 }}>
        {/* Header */}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
          <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: theme.surface, alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
            {Icon ? <Icon size={24} color={theme.accent} /> : null}
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 22, fontWeight: '700', color: theme.textPrimary }}>{t(`service_${service.key}_title`)}</Text>
            <Text style={{ marginTop: 4, color: theme.textSecondary }}>{t(`service_${service.key}_desc`)}</Text>
          </View>
          <Text style={{ fontWeight: '700', color: theme.accent }}>{service.price} MAD</Text>
        </View>

        {/* Details */}
        <View style={{ backgroundColor: theme.card, borderRadius: 12, padding: 14, borderWidth: 1, borderColor: theme.cardBorder, marginBottom: 12 }}>
          <Text style={{ fontSize: 16, fontWeight: '600', color: theme.textPrimary, marginBottom: 8 }}>{t('whats_included')}</Text>
          <Text style={{ color: theme.textSecondary, lineHeight: 20 }}>
            {t('include_line_1')}{"\n"}
            {t('include_line_2')}{"\n"}
            {t('include_line_3')}{"\n"}
            {t('include_line_4')}{"\n"}
            {t('include_line_5')}
          </Text>
        </View>

        <View style={{ backgroundColor: theme.card, borderRadius: 12, padding: 14, borderWidth: 1, borderColor: theme.cardBorder }}>
          <Text style={{ fontSize: 16, fontWeight: '600', color: theme.textPrimary, marginBottom: 8 }}>{t('notes')}</Text>
          <Text style={{ color: theme.textSecondary, lineHeight: 20 }}>
            {t('notes_body')}
          </Text>
        </View>

        {/* Actions */}
        <View style={styles.actionsContainer}>
          <Button 
            style={styles.actionButton} 
            onPress={() => navigation.navigate('ServiceWorkers', { serviceKey })}
          >
            <Text style={styles.actionButtonText}>{t('view_providers_for_service')}</Text>
          </Button>
          <Button 
            style={styles.actionButton} 
            onPress={() => (navigation as any).navigate('MainTabs', { screen: 'Home' })}
          >
            <Text style={styles.actionButtonText}>{t('find_nearby_providers')}</Text>
          </Button>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  actionsContainer: {
    marginTop: 16,
    gap: 12,
  },
  actionButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    minHeight: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 16,
    lineHeight: 20,
    textAlign: 'center',
    includeFontPadding: false,
  },
});
