import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Alert } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NavigationProp } from '@react-navigation/native';
import { MapPin, ChevronRight, ChevronLeft, Home, Building, Navigation } from 'lucide-react-native';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Header } from '../components/ui/Header';
import { Input } from '../components/ui/Input';
import { Textarea } from '../components/ui/Textarea';
import { useThemeColors } from '../lib/theme';
import { useLanguage } from '../contexts/LanguageContext';
import { useBooking } from '../contexts/BookingContext';
import type { RootStackParamList } from '../types/navigation';

const quickAddresses = [
  {
    id: 'current',
    title: 'Current Location',
    subtitle: 'Use my current location',
    icon: Navigation,
    address: 'Current Location - Marrakech, Morocco',
  },
  {
    id: 'home',
    title: 'Home',
    subtitle: 'My home address',
    icon: Home,
    address: 'Home Address',
  },
  {
    id: 'work',
    title: 'Work',
    subtitle: 'My workplace',
    icon: Building,
    address: 'Work Address',
  },
];


export default function BookingLocationScreen() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const insets = useSafeAreaInsets();
  const colors = useThemeColors();
  const { t } = useLanguage();
  const { bookingData, updateBookingData, setCurrentStep } = useBooking();

  const [address, setAddress] = useState(bookingData.address || '');
  const [selectedQuickAddress, setSelectedQuickAddress] = useState<string | null>(null);

  const handleQuickAddressSelect = (quickAddr: typeof quickAddresses[0]) => {
    setSelectedQuickAddress(quickAddr.id);
    setAddress(quickAddr.address);
  };


  const handleContinue = () => {
    if (!address.trim()) {
      Alert.alert('Missing Fields', 'Please enter service address');
      return;
    }

    updateBookingData({
      address: address.trim(),
    });

    setCurrentStep(5);
    navigation.navigate('BookingPayment' as any);
  };

  const handleBack = () => {
    setCurrentStep(3);
    navigation.goBack();
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]} edges={['bottom']}>
      <Header 
        title="Service Location" 
        onBack={handleBack}
        subtitle="Step 4 of 5"
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Progress Indicator */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: '80%', backgroundColor: colors.accent }]} />
          </View>
          <Text style={[styles.progressText, { color: colors.textSecondary }]}>
            Step 4 of 5: Service Location
          </Text>
        </View>

        {/* Quick Address Selection */}
        <Card style={[styles.sectionCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          <View style={styles.sectionHeader}>
            <MapPin size={20} color={colors.accent} />
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Quick Select</Text>
          </View>
          
          <View style={styles.quickAddressGrid}>
            {quickAddresses.map((quickAddr) => {
              const isSelected = selectedQuickAddress === quickAddr.id;
              const IconComponent = quickAddr.icon;
              
              return (
                <Pressable
                  key={quickAddr.id}
                  onPress={() => handleQuickAddressSelect(quickAddr)}
                  style={[
                    styles.quickAddressCard,
                    {
                      backgroundColor: isSelected ? colors.accent : colors.card,
                      borderColor: isSelected ? colors.accent : colors.cardBorder,
                    }
                  ]}
                >
                  <IconComponent 
                    size={20} 
                    color={isSelected ? '#ffffff' : colors.accent} 
                  />
                  <View style={styles.quickAddressInfo}>
                    <Text style={[
                      styles.quickAddressTitle,
                      { color: isSelected ? '#ffffff' : colors.textPrimary }
                    ]}>
                      {quickAddr.title}
                    </Text>
                    <Text style={[
                      styles.quickAddressSubtitle,
                      { color: isSelected ? '#ffffff' : colors.textSecondary }
                    ]}>
                      {quickAddr.subtitle}
                    </Text>
                  </View>
                </Pressable>
              );
            })}
          </View>
        </Card>

        {/* Manual Address Input */}
        <Card style={[styles.sectionCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Service Address *</Text>
          
          <Input
            value={address}
            onChangeText={(text) => {
              setAddress(text);
              setSelectedQuickAddress(null);
            }}
            placeholder="Enter your full address"
            style={styles.addressInput}
            multiline
            numberOfLines={2}
          />
          
          <Text style={[styles.helperText, { color: colors.textSecondary }]}>
            Include building number, street, and area
          </Text>
        </Card>


        {/* Location Info */}
        <Card style={[styles.infoCard, { backgroundColor: colors.surface, borderColor: colors.cardBorder }]}>
          <Text style={[styles.infoTitle, { color: colors.textPrimary }]}>Service Information</Text>
          <View style={styles.infoList}>
            <View style={styles.infoItem}>
              <View style={[styles.infoBullet, { backgroundColor: colors.accent }]} />
              <Text style={[styles.infoText, { color: colors.textSecondary }]}>
                Worker will arrive at your scheduled time
              </Text>
            </View>
            <View style={styles.infoItem}>
              <View style={[styles.infoBullet, { backgroundColor: colors.accent }]} />
              <Text style={[styles.infoText, { color: colors.textSecondary }]}>
                Service typically takes 30-60 minutes
              </Text>
            </View>
            <View style={styles.infoItem}>
              <View style={[styles.infoBullet, { backgroundColor: colors.accent }]} />
              <Text style={[styles.infoText, { color: colors.textSecondary }]}>
                All water and equipment provided
              </Text>
            </View>
          </View>
        </Card>
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={[styles.footer, { backgroundColor: colors.card, borderTopColor: colors.cardBorder, paddingBottom: Math.max(insets.bottom, 16) }]}>
        <View style={styles.footerButtons}>
          <Button 
            variant="ghost"
            size="icon"
            style={[styles.backButton, { 
              backgroundColor: colors.surface,
              borderWidth: 1,
              borderColor: colors.cardBorder,
              borderRadius: 12,
              width: 48,
              height: 48,
              marginTop: 4,
              alignItems: 'center',
              justifyContent: 'center',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.05,
              shadowRadius: 4,
              elevation: 2,
            }]}
            onPress={handleBack}
          >
            <ChevronLeft size={22} color={colors.textPrimary} strokeWidth={2.5} />
          </Button>
          
          <Button 
            style={[styles.continueButton, { opacity: address.trim() ? 1 : 0.5 }]}
            onPress={handleContinue}
            disabled={!address.trim()}
          >
            <Text style={styles.continueButtonText}>Continue</Text>
            <ChevronRight size={16} color="#ffffff" />
          </Button>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  progressContainer: {
    marginBottom: 24,
  },
  progressBar: {
    height: 4,
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 2,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 12,
    fontWeight: '500',
  },
  sectionCard: {
    padding: 16,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  quickAddressGrid: {
    gap: 12,
  },
  quickAddressCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
  },
  quickAddressInfo: {
    flex: 1,
  },
  quickAddressTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  quickAddressSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  addressInput: {
    marginTop: 16,
    marginBottom: 8,
    minHeight: 60,
  },
  helperText: {
    fontSize: 12,
    marginTop: 4,
  },
  popularAreasGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 16,
  },
  popularAreaChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  popularAreaText: {
    fontSize: 12,
    fontWeight: '500',
  },
  textarea: {
    marginTop: 16,
    marginBottom: 8,
  },
  infoCard: {
    padding: 16,
    marginBottom: 24,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
  },
  infoList: {
    gap: 8,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  infoBullet: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginTop: 6,
  },
  infoText: {
    fontSize: 12,
    lineHeight: 16,
    flex: 1,
  },
  footer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    borderTopWidth: 1,
  },
  footerButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  backButton: {
    flex: 1,
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  continueButton: {
    flex: 2,
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
});
