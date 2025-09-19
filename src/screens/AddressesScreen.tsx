import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Alert } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { MapPin, Plus, MoreVertical, Home, Briefcase } from 'lucide-react-native';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Header } from '../components/ui/Header';
import { useThemeColors } from '../lib/theme';
import { useLanguage } from '../contexts/LanguageContext';

interface Address {
  id: string;
  label: string;
  address: string;
  type: 'home' | 'work' | 'other';
  isDefault: boolean;
}

const mockAddresses: Address[] = [
  {
    id: "1",
    label: "Home",
    address: "123 Avenue Mohammed V, Marrakech, Morocco",
    type: "home",
    isDefault: true,
  },
  {
    id: "2",
    label: "Office",
    address: "456 Boulevard Zerktouni, Marrakech, Morocco",
    type: "work",
    isDefault: false,
  },
];

export default function AddressesScreen() {
  const navigation = useNavigation();
  const [addresses, setAddresses] = useState<Address[]>(mockAddresses);
  const insets = useSafeAreaInsets();
  const theme = useThemeColors();
  const { t } = useLanguage();

  const getTypeIcon = (type: Address['type']) => {
    switch (type) {
      case 'home':
        return Home;
      case 'work':
        return Briefcase;
      default:
        return MapPin;
    }
  };

  const handleAddressAction = (action: string, addressId: string, addressLabel: string) => {
    switch (action) {
      case 'edit':
        Alert.alert(t('edit_address'), t('edit_functionality_coming_soon').replace('{label}', addressLabel));
        break;
      case 'delete':
        Alert.alert(
          t('delete_address'),
          t('are_you_sure_delete_address').replace('{label}', addressLabel),
          [
            { text: t('cancel'), style: 'cancel' },
            { 
              text: t('delete_address'), 
              style: 'destructive',
              onPress: () => setAddresses(prev => prev.filter(addr => addr.id !== addressId))
            }
          ]
        );
        break;
      case 'setDefault':
        setAddresses(prev =>
          prev.map(addr => ({
            ...addr,
            isDefault: addr.id === addressId,
          }))
        );
        break;
    }
  };

  const showAddressOptions = (address: Address) => {
    const options = ['Edit Address'];
    
    if (!address.isDefault) {
      options.push('Set as Default');
    }
    
    options.push('Delete Address');
    options.push('Cancel');

    Alert.alert(
      address.label,
      t('choose_an_action'),
      [
        { text: t('edit_address'), onPress: () => handleAddressAction('edit', address.id, address.label) },
        ...(address.isDefault ? [] : [{ 
          text: t('set_as_default'), 
          onPress: () => handleAddressAction('setDefault', address.id, address.label) 
        }]),
        { 
          text: t('delete_address'), 
          style: 'destructive',
          onPress: () => handleAddressAction('delete', address.id, address.label) 
        },
        { text: t('cancel'), style: 'cancel' }
      ]
    );
  };

  const handleAddNewAddress = () => {
    (navigation as any).navigate('AddAddress');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]} edges={['bottom']}>
      <Header 
        title={t('manage_addresses')} 
        onBack={() => navigation.goBack()} 
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.content, { paddingBottom: Math.max(insets.bottom, 24) }]}
      >
        {/* Add New Address Button */}
        <Button style={styles.addButton} onPress={handleAddNewAddress}>
          <View style={styles.addButtonContent}>
            <Plus size={20} color="#ffffff" />
            <Text style={styles.addButtonText}>{t('add_new_address')}</Text>
          </View>
        </Button>

        {/* Addresses List */}
        <View style={styles.addressesList}>
          {addresses.map((address) => {
            const IconComponent = getTypeIcon(address.type);
            return (
              <Card key={address.id} style={styles.addressCard}>
                <View style={styles.addressContent}>
                  <View style={[styles.addressIconContainer, { backgroundColor: theme.overlay }]}>
                    <IconComponent size={20} color={theme.accent} />
                  </View>
                  <View style={styles.addressInfo}>
                    <View style={styles.addressHeader}>
                      <Text style={[styles.addressLabel, { color: theme.textPrimary }]}>{address.label}</Text>
                      {address.isDefault && (
                        <Badge variant="secondary" style={[styles.defaultBadge, { backgroundColor: theme.surface }]}>
                          <Text style={[styles.defaultBadgeText, { color: theme.textPrimary }]}>{t('default')}</Text>
                        </Badge>
                      )}
                    </View>
                    <Text style={[styles.addressText, { color: theme.textSecondary }]}>{address.address}</Text>
                  </View>
                  <Pressable 
                    style={styles.moreButton} 
                    onPress={() => showAddressOptions(address)}
                  >
                    <MoreVertical size={16} color={theme.textSecondary} />
                  </Pressable>
                </View>
              </Card>
            );
          })}
        </View>

        {addresses.length === 0 && (
          <View style={styles.emptyState}>
            <MapPin size={48} color={theme.textSecondary} style={styles.emptyIcon} />
            <Text style={[styles.emptyTitle, { color: theme.textPrimary }]}>{t('no_addresses_saved')}</Text>
            <Text style={[styles.emptyDescription, { color: theme.textSecondary }]}>
              {t('add_frequently_used_addresses')}
            </Text>
            <Button style={styles.emptyButton} onPress={handleAddNewAddress}>
              <Text style={styles.emptyButtonText}>{t('add_your_first_address')}</Text>
            </Button>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    backgroundColor: '#ffffff',
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  addButton: {
    height: 48,
    marginBottom: 16,
  },
  addButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  addressesList: {
    gap: 12,
  },
  addressCard: {
    padding: 16,
  },
  addressContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  addressIconContainer: {
    width: 40,
    height: 40,
    backgroundColor: '#eff6ff',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addressInfo: {
    flex: 1,
    minWidth: 0,
  },
  addressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  addressLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
  },
  defaultBadge: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  defaultBadgeText: {
    fontSize: 12,
    color: '#374151',
    fontWeight: '500',
  },
  addressText: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  moreButton: {
    padding: 8,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyIcon: {
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 20,
  },
  emptyButton: {
    paddingHorizontal: 24,
    height: 44,
  },
  emptyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
});
