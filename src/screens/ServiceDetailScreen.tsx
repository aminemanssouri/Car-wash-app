import React, { useMemo } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation } from '@react-navigation/native';
import type { RouteProp, NavigationProp } from '@react-navigation/native';
import type { RootStackParamList } from '../types/navigation';
import { iconFor, getServiceByKey } from '../data/services';
import { Button } from '../components/ui/Button';

export default function ServiceDetailScreen() {
  const route = useRoute<RouteProp<RootStackParamList, 'ServiceDetail'>>();
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { serviceKey } = route.params || ({} as any);

  const service = useMemo(() => getServiceByKey(serviceKey), [serviceKey]);
  const Icon = service ? iconFor(service.icon) : undefined;

  if (!service) {
    return (
      <SafeAreaView edges={["top", "bottom"]} style={{ flex: 1, backgroundColor: '#f8fafc', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
        <Text style={{ fontSize: 16, color: '#111827', marginBottom: 12 }}>Service not found.</Text>
        <Button onPress={() => navigation.goBack()}>Go back</Button>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={["top", "bottom"]} style={{ flex: 1, backgroundColor: '#f8fafc' }}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 24 }}>
        {/* Header */}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
          <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: '#eff6ff', alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
            {Icon ? <Icon size={24} color="#2563eb" /> : null}
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 22, fontWeight: '700', color: '#111827' }}>{service.title}</Text>
            <Text style={{ marginTop: 4, color: '#6b7280' }}>{service.desc}</Text>
          </View>
          <Text style={{ fontWeight: '700', color: '#2563eb' }}>{service.price} MAD</Text>
        </View>

        {/* Details */}
        <View style={{ backgroundColor: '#ffffff', borderRadius: 12, padding: 14, borderWidth: 1, borderColor: '#e5e7eb', marginBottom: 12 }}>
          <Text style={{ fontSize: 16, fontWeight: '600', color: '#111827', marginBottom: 8 }}>What’s included</Text>
          <Text style={{ color: '#374151', lineHeight: 20 }}>
            • High-pressure rinse{"\n"}
            • pH-neutral shampoo{ "\n" }
            • Soft microfiber hand wash and dry{"\n"}
            • Windows and mirrors cleaning{"\n"}
            • Tyre shine and exterior finishing
          </Text>
        </View>

        <View style={{ backgroundColor: '#ffffff', borderRadius: 12, padding: 14, borderWidth: 1, borderColor: '#e5e7eb' }}>
          <Text style={{ fontSize: 16, fontWeight: '600', color: '#111827', marginBottom: 8 }}>Notes</Text>
          <Text style={{ color: '#374151', lineHeight: 20 }}>
            Duration depends on vehicle size and condition. Prices may vary by provider. You can select a worker from the Home map and proceed to booking.
          </Text>
        </View>

        {/* Actions */}
        <View style={{ marginTop: 16 }}>
          <Button onPress={() => (navigation as any).navigate('MainTabs', { screen: 'Home' })}>Find nearby providers</Button>
          <Button variant="outline" onPress={() => navigation.goBack()}>Back</Button>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
