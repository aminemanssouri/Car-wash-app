import React, { useMemo } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { useThemeColors } from '../lib/theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation } from '@react-navigation/native';
import type { RouteProp, NavigationProp } from '@react-navigation/native';
import type { RootStackParamList } from '../types/navigation';
import { iconFor, getServiceByKey } from '../data/services';
import { Button } from '../components/ui/Button';

export default function ServiceDetailScreen() {
  const theme = useThemeColors();
  const route = useRoute<RouteProp<RootStackParamList, 'ServiceDetail'>>();
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { serviceKey } = route.params || ({} as any);

  const service = useMemo(() => getServiceByKey(serviceKey), [serviceKey]);
  const Icon = service ? iconFor(service.icon) : undefined;

  if (!service) {
    return (
      <SafeAreaView edges={["top", "bottom"]} style={{ flex: 1, backgroundColor: theme.bg, alignItems: 'center', justifyContent: 'center', padding: 16 }}>
        <Text style={{ fontSize: 16, color: theme.textPrimary, marginBottom: 12 }}>Service not found.</Text>
        <Button onPress={() => navigation.goBack()}>Go back</Button>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={["top", "bottom"]} style={{ flex: 1, backgroundColor: theme.bg }}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 24 }}>
        {/* Header */}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
          <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: theme.surface, alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
            {Icon ? <Icon size={24} color={theme.accent} /> : null}
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 22, fontWeight: '700', color: theme.textPrimary }}>{service.title}</Text>
            <Text style={{ marginTop: 4, color: theme.textSecondary }}>{service.desc}</Text>
          </View>
          <Text style={{ fontWeight: '700', color: theme.accent }}>{service.price} MAD</Text>
        </View>

        {/* Details */}
        <View style={{ backgroundColor: theme.card, borderRadius: 12, padding: 14, borderWidth: 1, borderColor: theme.cardBorder, marginBottom: 12 }}>
          <Text style={{ fontSize: 16, fontWeight: '600', color: theme.textPrimary, marginBottom: 8 }}>What’s included</Text>
          <Text style={{ color: theme.textSecondary, lineHeight: 20 }}>
            • High-pressure rinse{"\n"}
            • pH-neutral shampoo{ "\n" }
            • Soft microfiber hand wash and dry{"\n"}
            • Windows and mirrors cleaning{"\n"}
            • Tyre shine and exterior finishing
          </Text>
        </View>

        <View style={{ backgroundColor: theme.card, borderRadius: 12, padding: 14, borderWidth: 1, borderColor: theme.cardBorder }}>
          <Text style={{ fontSize: 16, fontWeight: '600', color: theme.textPrimary, marginBottom: 8 }}>Notes</Text>
          <Text style={{ color: theme.textSecondary, lineHeight: 20 }}>
            Duration depends on vehicle size and condition. Prices may vary by provider. You can select a worker from the Home map and proceed to booking.
          </Text>
        </View>

        {/* Actions */}
        <View style={{ marginTop: 16 }}>
          <Button onPress={() => navigation.navigate('ServiceWorkers', { serviceKey })}>View providers for this service</Button>
          <Button onPress={() => (navigation as any).navigate('MainTabs', { screen: 'Home' })}>Find nearby providers</Button>
          <Button variant="outline" onPress={() => navigation.goBack()}>Back</Button>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
