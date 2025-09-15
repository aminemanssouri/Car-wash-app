import React, { useMemo } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeColors } from '../lib/theme';
import { useRoute, useNavigation } from '@react-navigation/native';
import type { RouteProp, NavigationProp } from '@react-navigation/native';
import type { RootStackParamList } from '../types/navigation';
import { getServiceByKey, iconFor } from '../data/services';
import { mockWorkers, Worker } from '../data/workers';
import { Button } from '../components/ui/Button';
import { Header } from '../components/ui/Header';
import { useLanguage } from '../contexts/LanguageContext';

export default function ServiceWorkersScreen() {
  const theme = useThemeColors();
  const route = useRoute<RouteProp<RootStackParamList, 'ServiceWorkers'>>();
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { serviceKey } = route.params || ({} as any);
  const { t } = useLanguage();

  const service = useMemo(() => getServiceByKey(serviceKey), [serviceKey]);
  const Icon = service ? iconFor(service.icon) : undefined;

  const filtered = useMemo<Worker[]>(() => {
    if (!service) return [];
    const title = service.title.toLowerCase();
    // Basic heuristic: include workers whose service label contains the selected service title keyword
    return mockWorkers.filter(w => (w.services || []).some(s => s.toLowerCase().includes(title.split(' ')[0])));
  }, [service]);

  return (
    <SafeAreaView edges={['bottom']} style={{ flex: 1, backgroundColor: theme.bg }}>
      <Header 
        title={service ? `${t('providers')} - ${service.title}` : t('providers')} 
        onBack={() => navigation.goBack()} 
      />

      <FlatList
        data={filtered}
        keyExtractor={(w) => w.id}
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 24 }}
        ListEmptyComponent={<Text style={{ color: theme.textSecondary, textAlign: 'center', marginTop: 24 }}>{t('no_workers_found')}</Text>}
        renderItem={({ item: w }) => (
          <View style={{ backgroundColor: theme.card, borderWidth: 1, borderColor: theme.cardBorder, borderRadius: 12, padding: 12, marginBottom: 12 }}>
            <View style={{ flexDirection: 'row' }}>
              <View style={{ width: 56, height: 56, borderRadius: 28, overflow: 'hidden', backgroundColor: theme.overlay, marginRight: 12 }}>
                <Image source={w.avatar} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: theme.textPrimary, fontWeight: '700' }}>{w.name}</Text>
                <Text style={{ color: theme.textSecondary, marginTop: 2 }}>{w.services?.join(' • ')}</Text>
                <View style={{ flexDirection: 'row', marginTop: 8, alignItems: 'center', justifyContent: 'space-between' }}>
                  <Text style={{ color: theme.textSecondary }}>⭐ {w.rating} ({w.reviewCount})</Text>
                  <Text style={{ color: theme.accent, fontWeight: '700' }}>{w.price} MAD</Text>
                </View>
              </View>
            </View>
            <View style={{ flexDirection: 'row', marginTop: 12, gap: 8 }}>
              <Button size="sm" onPress={() => navigation.navigate('WorkerDetail', { workerId: w.id })}>View details</Button>
              <Button size="sm" variant="outline" onPress={() => navigation.navigate('Booking', { workerId: w.id })}>Book</Button>
            </View>
          </View>
        )}
      />
    </SafeAreaView>
  );
}
