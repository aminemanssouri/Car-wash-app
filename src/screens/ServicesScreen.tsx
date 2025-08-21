import React from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Wrench, Sparkles, Droplets, Brush, SprayCan } from 'lucide-react-native';
import { Button } from '../components/ui/Button';
import { useNavigation } from '@react-navigation/native';
import type { NavigationProp } from '@react-navigation/native';
import type { RootStackParamList } from '../types/navigation';

const SERVICES = [
  { key: 'basic', title: 'Basic Wash', desc: 'Exterior wash and dry', price: 60, Icon: Droplets },
  { key: 'deluxe', title: 'Deluxe Wash', desc: 'Exterior + interior clean', price: 120, Icon: Sparkles },
  { key: 'deep', title: 'Deep Clean', desc: 'Full detailing in/out', price: 220, Icon: Wrench },
  { key: 'interior', title: 'Interior Detail', desc: 'Vacuum and interior detail', price: 140, Icon: Brush },
  { key: 'pro', title: 'Pro Package', desc: 'Rinse, wax, and shine', price: 260, Icon: SprayCan },
];

export default function ServicesScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  return (
    <SafeAreaView edges={["top", "bottom"]} style={{ flex: 1, backgroundColor: '#f8fafc' }}>
      <View style={{ paddingHorizontal: 16, paddingTop: 8, paddingBottom: 12 }}>
        <Text style={{ fontSize: 22, fontWeight: '700', color: '#111827' }}>Services</Text>
        <Text style={{ marginTop: 4, color: '#6b7280' }}>Choose a service that fits your car</Text>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: Math.max(16, insets.bottom + 12) }}
        showsVerticalScrollIndicator={false}
      >
        {SERVICES.map(({ key, title, desc, price, Icon }) => (
          <Pressable
            key={key}
            style={{
              backgroundColor: '#ffffff',
              borderRadius: 12,
              padding: 14,
              marginBottom: 12,
              borderWidth: 1,
              borderColor: '#e5e7eb',
              shadowColor: '#000',
              shadowOpacity: 0.05,
              shadowRadius: 8,
            }}
            onPress={() => (navigation as any).navigate('ServiceDetail', { serviceKey: key })}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: '#eff6ff',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: 12,
                }}
              >
                <Icon color="#2563eb" size={20} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 16, fontWeight: '600', color: '#111827' }}>{title}</Text>
                <Text style={{ marginTop: 2, color: '#6b7280' }}>{desc}</Text>
              </View>
              <Text style={{ fontWeight: '700', color: '#2563eb' }}>{price} MAD</Text>
            </View>
            <View style={{ marginTop: 12 }}>
              <Button onPress={() => (navigation as any).navigate('ServiceDetail', { serviceKey: key })}>
                View details
              </Button>
            </View>
          </Pressable>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
