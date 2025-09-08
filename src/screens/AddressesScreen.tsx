import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Alert } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { ArrowLeft, MapPin, Plus, MoreVertical, Home, Briefcase } from 'lucide-react-native';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { useThemeColors } from '../lib/theme';

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
        Alert.alert('Edit Address', `Edit functionality for ${addressLabel} will be available soon.`);
        break;
      case 'delete':
        Alert.alert(
          'Delete Address',
          `Are you sure you want to delete ${addressLabel}?`,
          [
            { text: 'Cancel', style: 'cancel' },
            { 
              text: 'Delete', 
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
      'Choose an action',
      [
        { text: 'Edit Address', onPress: () => handleAddressAction('edit', address.id, address.label) },
        ...(address.isDefault ? [] : [{ 
          text: 'Set as Default', 
          onPress: () => handleAddressAction('setDefault', address.id, address.label) 
        }]),
        { 
          text: 'Delete Address', 
          style: 'destructive',
          onPress: () => handleAddressAction('delete', address.id, address.label) 
        },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  const handleAddNewAddress = () => {
    (navigation as any).navigate('AddAddress');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]} edges={['top','bottom']}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.card, borderBottomColor: theme.cardBorder }]}>
        <Pressable style={styles.backButton} onPress={() => navigation.goBack()}>
          <ArrowLeft size={20} color={theme.textPrimary} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>Manage Addresses</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.content, { paddingBottom: Math.max(insets.bottom, 24) }]}
      >
        {/* Add New Address Button */}
        <Button style={styles.addButton} onPress={handleAddNewAddress}>
          <View style={styles.addButtonContent}>
            <Plus size={20} color="#ffffff" />
            <Text style={styles.addButtonText}>Add New Address</Text>
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
                        <Badge variant="secondary" style={[styles.defaultBadge, { backgroundColor: theme.surface }] }>
                          <Text style={[styles.defaultBadgeText, { color: theme.textPrimary }]}>Default</Text>
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
            <Text style={[styles.emptyTitle, { color: theme.textPrimary }]}>No addresses saved</Text>
            <Text style={[styles.emptyDescription, { color: theme.textSecondary }] }>
              Add your frequently used addresses for faster booking
            </Text>
            <Button style={styles.emptyButton} onPress={handleAddNewAddress}>
              <Text style={styles.emptyButtonText}>Add Your First Address</Text>
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
