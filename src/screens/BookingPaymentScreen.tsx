import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Alert } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NavigationProp } from '@react-navigation/native';
import { CreditCard, Banknote, Smartphone, Wallet } from 'lucide-react-native';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Header } from '../components/ui/Header';
import { BookingFooter } from '../components/ui/BookingFooter';
import { useThemeColors } from '../lib/theme';
import { useLanguage } from '../contexts/LanguageContext';
import { useBooking } from '../contexts/BookingContext';
import type { RootStackParamList } from '../types/navigation';

const paymentMethods = [
  {
    id: 'cash',
    title: 'Cash on Delivery',
    subtitle: 'Pay with cash when service is completed',
    icon: Banknote,
    recommended: true,
    available: true,
  },
  {
    id: 'card',
    title: 'Credit/Debit Card',
    subtitle: 'Pay securely with your card',
    icon: CreditCard,
    recommended: false,
    available: false, // Not implemented yet
  },
  {
    id: 'mobile',
    title: 'Mobile Payment',
    subtitle: 'Pay with mobile wallet apps',
    icon: Smartphone,
    recommended: false,
    available: false, // Not implemented yet
  },
  {
    id: 'wallet',
    title: 'Digital Wallet',
    subtitle: 'Pay with digital wallet services',
    icon: Wallet,
    recommended: false,
    available: false, // Not implemented yet
  },
];

export default function BookingPaymentScreen() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const insets = useSafeAreaInsets();
  const colors = useThemeColors();
  const { t } = useLanguage();
  const { bookingData, updateBookingData, setCurrentStep, resetBookingData } = useBooking();

  const [selectedPayment, setSelectedPayment] = useState(bookingData.paymentMethod || 'cash');

  const handleContinue = () => {
    if (!selectedPayment) {
      Alert.alert('Missing Fields', 'Please select payment method');
      return;
    }

    updateBookingData({
      paymentMethod: selectedPayment,
    });

    // Generate booking ID and navigate directly to confirmation
    const bookingId = `CW${Date.now().toString().slice(-6)}`;
    
    // Reset booking data and navigate to confirmation
    resetBookingData();
    navigation.navigate('BookingConfirmation', { bookingId } as any);
  };

  const handleBack = () => {
    setCurrentStep(4);
    navigation.goBack();
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]} edges={['bottom']}>
      <Header 
        title="Payment Method" 
        onBack={handleBack}
        subtitle="Step 5 of 5"
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Progress Indicator */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: '100%', backgroundColor: colors.accent }]} />
          </View>
          <Text style={[styles.progressText, { color: colors.textSecondary }]}>
            Step 5 of 5: Payment Method
          </Text>
        </View>

        {/* Payment Methods */}
        <Card style={[styles.sectionCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          <View style={styles.sectionHeader}>
            <CreditCard size={20} color={colors.accent} />
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Select Payment Method *</Text>
          </View>
          
          <View style={styles.paymentMethodsList}>
            {paymentMethods.map((method) => {
              const isSelected = selectedPayment === method.id;
              const IconComponent = method.icon;
              
              return (
                <Pressable
                  key={method.id}
                  onPress={() => method.available && setSelectedPayment(method.id)}
                  disabled={!method.available}
                  style={[
                    styles.paymentMethodCard,
                    {
                      backgroundColor: isSelected ? colors.accent : colors.card,
                      borderColor: isSelected ? colors.accent : colors.cardBorder,
                      opacity: method.available ? 1 : 0.5,
                    }
                  ]}
                >
                  <View style={styles.paymentMethodLeft}>
                    <View style={[
                      styles.paymentMethodIcon,
                      { 
                        backgroundColor: isSelected ? 'rgba(255,255,255,0.2)' : colors.surface,
                      }
                    ]}>
                      <IconComponent 
                        size={20} 
                        color={isSelected ? '#ffffff' : colors.accent} 
                      />
                    </View>
                    
                    <View style={styles.paymentMethodInfo}>
                      <View style={styles.paymentMethodTitleRow}>
                        <Text style={[
                          styles.paymentMethodTitle,
                          { color: isSelected ? '#ffffff' : colors.textPrimary }
                        ]}>
                          {method.title}
                        </Text>
                        {method.recommended && (
                          <View style={[
                            styles.recommendedBadge,
                            { backgroundColor: isSelected ? 'rgba(255,255,255,0.2)' : colors.accent }
                          ]}>
                            <Text style={[
                              styles.recommendedText,
                              { color: isSelected ? '#ffffff' : '#ffffff' }
                            ]}>
                              {t('recommended')}
                            </Text>
                          </View>
                        )}
                      </View>
                      <Text style={[
                        styles.paymentMethodSubtitle,
                        { color: isSelected ? '#ffffff' : colors.textSecondary }
                      ]}>
                        {method.subtitle}
                      </Text>
                      {!method.available && (
                        <Text style={[
                          styles.comingSoonText,
                          { color: colors.textSecondary }
                        ]}>
                          {t('coming_soon')}
                        </Text>
                      )}
                    </View>
                  </View>
                  
                  {isSelected && (
                    <View style={[styles.selectedIndicator, { backgroundColor: '#ffffff' }]}>
                      <View style={[styles.selectedDot, { backgroundColor: colors.accent }]} />
                    </View>
                  )}
                </Pressable>
              );
            })}
          </View>
        </Card>

        {/* Payment Details */}
        {selectedPayment === 'cash' && (
          <Card style={[styles.detailsCard, { backgroundColor: colors.surface, borderColor: colors.cardBorder }]}>
            <Text style={[styles.paymentTitle, { color: colors.textPrimary }]}>Cash on Delivery</Text>
            <View style={styles.detailsList}>
              <View style={styles.detailItem}>
                <View style={[styles.detailBullet, { backgroundColor: colors.accent }]} />
                <Text style={[styles.detailText, { color: colors.textSecondary }]}>
                  Payment due after service completion
                </Text>
              </View>
              <View style={styles.detailItem}>
                <View style={[styles.detailBullet, { backgroundColor: colors.accent }]} />
                <Text style={[styles.detailText, { color: colors.textSecondary }]}>
                  Exact change appreciated
                </Text>
              </View>
              <View style={styles.detailItem}>
                <View style={[styles.detailBullet, { backgroundColor: colors.accent }]} />
                <Text style={[styles.detailText, { color: colors.textSecondary }]}>
                  Receipt will be provided
                </Text>
              </View>
            </View>
          </Card>
        )}
        {selectedPayment === 'card' && (
          <Card style={[styles.detailsCard, { backgroundColor: colors.surface, borderColor: colors.cardBorder }]}>
            <Text style={[styles.paymentTitle, { color: colors.textSecondary }]}>Credit/Debit Card</Text>
            <View style={styles.detailsList}>
              <View style={styles.detailItem}>
                <View style={[styles.detailBullet, { backgroundColor: colors.accent }]} />
                <Text style={[styles.detailText, { color: colors.textSecondary }]}>
                  Payment due after service completion
                </Text>
              </View>
              <View style={styles.detailItem}>
                <View style={[styles.detailBullet, { backgroundColor: colors.accent }]} />
                <Text style={[styles.detailText, { color: colors.textSecondary }]}>
                  Exact change appreciated
                </Text>
              </View>
              <View style={styles.detailItem}>
                <View style={[styles.detailBullet, { backgroundColor: colors.accent }]} />
                <Text style={[styles.detailText, { color: colors.textSecondary }]}>
                  Receipt will be provided
                </Text>
              </View>
            </View>
          </Card>
        )}

        {/* Price Summary */}
        <Card style={[styles.priceCard, { backgroundColor: colors.surface, borderColor: colors.cardBorder }]}>
          <Text style={[styles.paymentTitle, { color: colors.textPrimary }]}>Payment Summary</Text>
          
          <View style={styles.priceBreakdown}>
            <View style={styles.priceRow}>
              <Text style={[styles.paymentDescription, { color: colors.textSecondary }]}>Pay after service completion</Text>
              <Text style={[styles.priceValue, { color: colors.textPrimary }]}>{bookingData.basePrice} MAD</Text>
            </View>
            
            {bookingData.carType && (
              <View style={styles.priceRow}>
                <Text style={[styles.priceLabel, { color: colors.textSecondary }]}>
                  Vehicle Type ({bookingData.carType}):
                </Text>
                <Text style={[styles.priceValue, { color: colors.textPrimary }]}>
                  {bookingData.finalPrice - bookingData.basePrice >= 0 ? '+' : ''}
                  {bookingData.finalPrice - bookingData.basePrice} MAD
                </Text>
              </View>
            )}
            
            <View style={[styles.priceDivider, { backgroundColor: colors.cardBorder }]} />
            
            <View style={styles.totalRow}>
              <Text style={[styles.totalLabel, { color: colors.textPrimary }]}>Total Amount:</Text>
              <Text style={[styles.totalValue, { color: colors.accent }]}>{bookingData.finalPrice} MAD</Text>
            </View>
          </View>
          
          <View style={[styles.paymentNote, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
            <Text style={[styles.paymentNoteText, { color: colors.textSecondary }]}>
              {selectedPayment === 'cash' 
                ? 'Amount to be paid in cash after service'
                : 'Secure payment processing'
              }
            </Text>
          </View>
        </Card>

        {/* Security Info */}
        <Card style={[styles.infoCard, { backgroundColor: colors.surface, borderColor: colors.cardBorder }]}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Payment Information</Text>
          <View style={styles.infoList}>
            <View style={styles.infoItem}>
              <View style={[styles.infoBullet, { backgroundColor: colors.accent }]} />
              <Text style={[styles.infoText, { color: colors.textSecondary }]}>
                All transactions are secure
              </Text>
            </View>
            <View style={styles.infoItem}>
              <View style={[styles.infoBullet, { backgroundColor: colors.accent }]} />
              <Text style={[styles.infoText, { color: colors.textSecondary }]}>
                No payment required now
              </Text>
            </View>
            <View style={styles.infoItem}>
              <View style={[styles.infoBullet, { backgroundColor: colors.accent }]} />
              <Text style={[styles.infoText, { color: colors.textSecondary }]}>
                No hidden fees or charges
              </Text>
            </View>
            <View style={styles.infoItem}>
              <View style={[styles.infoBullet, { backgroundColor: colors.accent }]} />
              <Text style={[styles.infoText, { color: colors.textSecondary }]}>
                Satisfaction guaranteed
              </Text>
            </View>
          </View>
        </Card>
      </ScrollView>

      {/* Footer */}
      <BookingFooter
        onBack={handleBack}
        onContinue={handleContinue}
        continueDisabled={!selectedPayment}
      />
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
  paymentMethodsList: {
    gap: 12,
  },
  paymentMethodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  paymentMethodLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  paymentMethodIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  paymentMethodInfo: {
    flex: 1,
  },
  paymentMethodTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  paymentMethodTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  recommendedBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  recommendedText: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  paymentMethodSubtitle: {
    fontSize: 12,
    marginBottom: 2,
  },
  comingSoonText: {
    fontSize: 10,
    fontStyle: 'italic',
  },
  selectedIndicator: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  detailsCard: {
    padding: 16,
    marginBottom: 24,
  },
  detailsTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
  },
  detailsList: {
    gap: 8,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  detailBullet: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginTop: 6,
  },
  detailText: {
    fontSize: 12,
    lineHeight: 16,
    flex: 1,
  },
  priceCard: {
    padding: 16,
    marginBottom: 24,
  },
  priceTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
  },
  priceBreakdown: {
    marginBottom: 16,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  priceLabel: {
    fontSize: 14,
  },
  priceValue: {
    fontSize: 14,
  },
  priceDivider: {
    height: 1,
    marginVertical: 8,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  paymentNote: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  paymentNoteText: {
    fontSize: 12,
    textAlign: 'center',
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
  paymentTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  paymentDescription: {
    fontSize: 12,
    color: '#6b7280',
  },
});
