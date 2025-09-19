import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Alert, Dimensions, TextInput, Image, ActivityIndicator } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NavigationProp } from '@react-navigation/native';
import { Car, ChevronRight, ChevronLeft, Search, Check } from 'lucide-react-native';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Header } from '../components/ui/Header';
import { ComboBox, ComboBoxOption } from '../components/ui/ComboBox';
import { useThemeColors } from '../lib/theme';
import { useLanguage } from '../contexts/LanguageContext';
import { useBooking } from '../contexts/BookingContext';
import { NaqiagoVehicleAPI, CarBrand, CarModel } from '../services/NaqiagoVehicleAPI';
import type { RootStackParamList } from '../types/navigation';

const carTypes = [
  { id: "sedan", name: "Sedan", multiplier: 1, icon: "🚗" },
  { id: "suv", name: "SUV", multiplier: 1.3, icon: "🚙" },
  { id: "hatchback", name: "Hatchback", multiplier: 0.9, icon: "🚗" },
  { id: "truck", name: "Truck", multiplier: 1.5, icon: "🚚" },
  { id: "van", name: "Van", multiplier: 1.4, icon: "🚐" },
  { id: "coupe", name: "Coupe", multiplier: 1.1, icon: "🏎️" },
  { id: "convertible", name: "Convertible", multiplier: 1.2, icon: "🏎️" },
];


const carColors = [
  { id: "white", name: "White", color: "#FFFFFF", border: "#E5E7EB" },
  { id: "black", name: "Black", color: "#000000", border: "#000000" },
  { id: "silver", name: "Silver", color: "#C0C0C0", border: "#9CA3AF" },
  { id: "gray", name: "Gray", color: "#6B7280", border: "#6B7280" },
  { id: "red", name: "Red", color: "#EF4444", border: "#EF4444" },
  { id: "blue", name: "Blue", color: "#3B82F6", border: "#3B82F6" },
  { id: "green", name: "Green", color: "#10B981", border: "#10B981" },
  { id: "yellow", name: "Yellow", color: "#F59E0B", border: "#F59E0B" },
  { id: "brown", name: "Brown", color: "#92400E", border: "#92400E" },
  { id: "other", name: "Other", color: "#8B5CF6", border: "#8B5CF6" },
];

export default function BookingVehicleScreen() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const insets = useSafeAreaInsets();
  const colors = useThemeColors();
  const { t } = useLanguage();
  const { bookingData, updateBookingData, setCurrentStep } = useBooking();

  const [selectedCarType, setSelectedCarType] = useState(bookingData.carType);
  const [selectedBrand, setSelectedBrand] = useState<number | null>(bookingData.carBrandId || null);
  const [selectedColor, setSelectedColor] = useState(bookingData.carColor || '');
  const [selectedModel, setSelectedModel] = useState<number | null>(bookingData.carModelId || null);
  const [selectedYear, setSelectedYear] = useState<number | null>(bookingData.carYear ? parseInt(bookingData.carYear) : null);
  const [showAllBrands, setShowAllBrands] = useState(false);
  const [brandSearch, setBrandSearch] = useState('');
  
  // API data states
  const [brands, setBrands] = useState<CarBrand[]>([]);
  const [models, setModels] = useState<CarModel[]>([]);
  const [loadingBrands, setLoadingBrands] = useState(true);
  const [loadingModels, setLoadingModels] = useState(false);

  const { width: screenWidth } = Dimensions.get('window');
  const isTablet = screenWidth >= 768;
  const cardColumns = isTablet ? 4 : 2;
  const brandColumns = isTablet ? 6 : 3;

  // Load brands on component mount
  useEffect(() => {
    loadBrands();
  }, []);

  // Load models when brand is selected
  useEffect(() => {
    if (selectedBrand) {
      loadModels(selectedBrand);
    } else {
      setModels([]);
      setSelectedModel(null);
    }
  }, [selectedBrand]);

  const loadBrands = async () => {
    try {
      setLoadingBrands(true);
      const brandsData = await NaqiagoVehicleAPI.getAllBrands();
      setBrands(brandsData);
    } catch (error) {
      console.error('Error loading brands:', error);
      // Fallback to cached or default brands
      setBrands(NaqiagoVehicleAPI.getPopularBrands());
    } finally {
      setLoadingBrands(false);
    }
  };

  const loadModels = async (brandId: number) => {
    try {
      setLoadingModels(true);
      const modelsData = await NaqiagoVehicleAPI.getModelsForBrand(brandId);
      setModels(modelsData);
    } catch (error) {
      console.error('Error loading models:', error);
      setModels(NaqiagoVehicleAPI.getPopularModels());
    } finally {
      setLoadingModels(false);
    }
  };

  const popularBrands = brands.filter(brand => brand.popular);
  const otherBrands = brands.filter(brand => !brand.popular);
  const filteredBrands = NaqiagoVehicleAPI.searchBrands(
    showAllBrands ? brands : popularBrands,
    brandSearch
  );
  const displayedBrands = filteredBrands;

  // Generate options for ComboBoxes
  const modelOptions: ComboBoxOption[] = models.map(model => ({
    id: model.id,
    label: model.name,
    value: model.id
  }));

  const yearOptions: ComboBoxOption[] = NaqiagoVehicleAPI.getYearOptions().map(year => ({
    id: year,
    label: year.toString(),
    value: year
  }));

  const selectedBrandData = brands.find(brand => brand.id === selectedBrand);
  const selectedModelData = models.find(model => model.id === selectedModel);

  const selectedCarTypeData = carTypes.find(type => type.id === selectedCarType);
  const basePrice = bookingData.basePrice || 80;
  const adjustedPrice = selectedCarTypeData ? Math.round(basePrice * selectedCarTypeData.multiplier) : basePrice;

  const handleContinue = () => {
    if (!selectedCarType || !selectedBrand) {
      Alert.alert('Missing Fields', 'Please select car type and brand');
      return;
    }

    const finalPrice = adjustedPrice;
    
    updateBookingData({
      carType: selectedCarType,
      carBrand: selectedBrandData?.name || '',
      carModel: selectedModelData?.name || '',
      carYear: selectedYear?.toString() || '',
      carColor: selectedColor,
      carBrandId: selectedBrand || undefined,
      carModelId: selectedModel || undefined,
      finalPrice,
    });

    setCurrentStep(3);
    navigation.navigate('BookingLocation' as any);
  };

  const handleBrandSelect = (brandId: number) => {
    setSelectedBrand(brandId);
    // Reset model and year when brand changes
    setSelectedModel(null);
    setSelectedYear(null);
  };

  const handleBack = () => {
    setCurrentStep(1);
    navigation.goBack();
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]} edges={['bottom']}>
      <Header 
        title="Vehicle Details" 
        onBack={handleBack}
        subtitle="Step 2 of 5"
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Progress Indicator */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: '40%', backgroundColor: colors.accent }]} />
          </View>
          <Text style={[styles.progressText, { color: colors.textSecondary }]}>
            Step 2 of 5: Vehicle Details
          </Text>
        </View>

        {/* Car Type Selection */}
        <Card style={[styles.sectionCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          <View style={styles.sectionHeader}>
            <Car size={20} color={colors.accent} />
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Vehicle Type *</Text>
          </View>
          
          <View style={[styles.carTypeGrid, { gap: isTablet ? 16 : 12 }]}>
            {carTypes.map((type) => {
              const isSelected = selectedCarType === type.id;
              const price = Math.round(basePrice * type.multiplier);
              
              return (
                <Pressable
                  key={type.id}
                  onPress={() => setSelectedCarType(type.id)}
                  style={[
                    styles.carTypeCard,
                    {
                      backgroundColor: isSelected ? colors.accent : colors.surface,
                      borderColor: isSelected ? colors.accent : colors.cardBorder,
                      width: screenWidth < 400 ? '100%' : screenWidth < 600 ? '48%' : '31%',
                      marginBottom: 12,
                      shadowColor: colors.textPrimary,
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: isSelected ? 0.15 : 0.05,
                      shadowRadius: 8,
                      elevation: isSelected ? 4 : 2,
                    }
                  ]}
                >
                  {isSelected && (
                    <View style={[styles.selectedBadge, { backgroundColor: '#ffffff' }]}>
                      <Check size={12} color={colors.accent} />
                    </View>
                  )}
                  <Text style={[styles.carTypeIcon, { fontSize: isTablet ? 32 : 24 }]}>{type.icon}</Text>
                  <Text style={[
                    styles.carTypeName,
                    { 
                      color: isSelected ? '#ffffff' : colors.textPrimary,
                      fontSize: isTablet ? 16 : 14
                    }
                  ]}>
                    {type.name}
                  </Text>
                  <Text style={[
                    styles.carTypePrice,
                    { 
                      color: isSelected ? '#ffffff' : colors.accent,
                      fontSize: isTablet ? 14 : 12,
                      fontWeight: '600'
                    }
                  ]}>
                    {price} MAD
                  </Text>
                  {type.multiplier !== 1 && (
                    <View style={[styles.multiplierBadge, { 
                      backgroundColor: isSelected ? 'rgba(255,255,255,0.2)' : colors.accent + '20' 
                    }]}>
                      <Text style={[
                        styles.carTypeMultiplier,
                        { 
                          color: isSelected ? '#ffffff' : colors.accent,
                          fontSize: 10
                        }
                      ]}>
                        ×{type.multiplier}
                      </Text>
                    </View>
                  )}
                </Pressable>
              );
            })}
          </View>
        </Card>

        {/* Car Brand Selection */}
        <Card style={[styles.sectionCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Car Brand *</Text>
          </View>
          
          {/* Search Bar */}
          <View style={[styles.modernSearchContainer, { backgroundColor: colors.surface, borderColor: colors.cardBorder }]}>
            <Search size={18} color={colors.textSecondary} style={styles.modernSearchIcon} />
            <TextInput
              value={brandSearch}
              onChangeText={setBrandSearch}
              placeholder="Search brands..."
              style={[styles.modernSearchInput, { color: colors.textPrimary }]}
              placeholderTextColor={colors.textSecondary}
            />
          </View>
          
          {/* Popular Brands Badge */}
          {!showAllBrands && (
            <View style={styles.popularBadge}>
              <Text style={[styles.popularBadgeText, { color: colors.accent }]}>
                ⭐ Popular Brands
              </Text>
            </View>
          )}
          
          {loadingBrands ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.accent} />
              <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Loading brands...</Text>
            </View>
          ) : (
            <View style={[styles.brandGrid, { gap: isTablet ? 12 : 8 }]}>
              {displayedBrands.map((brand) => {
                const isSelected = selectedBrand === brand.id;
                
                return (
                  <Pressable
                    key={brand.id}
                    onPress={() => handleBrandSelect(brand.id)}
                    style={[
                      styles.brandCard,
                      {
                        backgroundColor: isSelected ? colors.accent : colors.surface,
                        borderColor: isSelected ? colors.accent : colors.cardBorder,
                        width: isTablet ? '15%' : '30%',
                        minWidth: 80,
                        shadowColor: colors.textPrimary,
                        shadowOffset: { width: 0, height: 1 },
                        shadowOpacity: isSelected ? 0.1 : 0.03,
                        shadowRadius: 4,
                        elevation: isSelected ? 2 : 1,
                      }
                    ]}
                  >
                    {isSelected && (
                      <View style={[styles.selectedBadge, { backgroundColor: '#ffffff', top: 4, right: 4 }]}>
                        <Check size={10} color={colors.accent} />
                      </View>
                    )}
                    
                    {/* Brand Logo - Circle Mode */}
                    <View style={[
                      styles.brandCircle,
                      {
                        backgroundColor: isSelected ? colors.accent : colors.surface,
                        borderColor: isSelected ? colors.accent : colors.cardBorder,
                      }
                    ]}>
                      {brand.logo ? (
                        <Image
                          source={{ uri: brand.logo }}
                          style={styles.brandCircleLogo}
                          resizeMode="contain"
                        />
                      ) : (
                        <Text style={[
                          styles.brandCircleInitial, 
                          { color: isSelected ? '#ffffff' : colors.textSecondary }
                        ]}>
                          {brand.name.charAt(0)}
                        </Text>
                      )}
                    </View>
                    
                    <Text style={[
                      styles.brandName,
                      { 
                        color: isSelected ? '#ffffff' : colors.textPrimary,
                        fontSize: isTablet ? 13 : 12
                      }
                    ]}>
                      {brand.name}
                    </Text>
                    {brand.popular && !showAllBrands && (
                      <View style={styles.popularDot} />
                    )}
                  </Pressable>
                );
              })}
            </View>
          )}
          
          {!showAllBrands && filteredBrands.length === popularBrands.length && (
            <Pressable
              onPress={() => setShowAllBrands(true)}
              style={[styles.showMoreButton, { borderColor: colors.cardBorder }]}
            >
              <Text style={[styles.showMoreText, { color: colors.accent }]}>
                Show All Brands ({brands.length - popularBrands.length} more)
              </Text>
            </Pressable>
          )}
          
          {brandSearch && displayedBrands.length === 0 && (
            <View style={styles.noResultsContainer}>
              <Text style={[styles.noResultsText, { color: colors.textSecondary }]}>
                No brands found matching "{brandSearch}"
              </Text>
            </View>
          )}
        </Card>

        {/* Model and Year Selection */}
        <Card style={[styles.sectionCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Vehicle Details</Text>
          
          <View style={styles.detailsRow}>
            <View style={styles.detailsItem}>
              <Text style={[styles.fieldLabel, { color: colors.textPrimary }]}>Model</Text>
              {loadingModels ? (
                <View style={[styles.loadingComboBox, { backgroundColor: colors.surface, borderColor: colors.cardBorder }]}>
                  <ActivityIndicator size="small" color={colors.accent} />
                  <Text style={[styles.loadingComboText, { color: colors.textSecondary }]}>Loading models...</Text>
                </View>
              ) : (
                <ComboBox
                  options={modelOptions}
                  value={selectedModel}
                  onSelect={(option) => setSelectedModel(option.value as number)}
                  placeholder={selectedBrand ? "Select model" : "Select brand first"}
                  disabled={!selectedBrand || models.length === 0}
                  searchable={true}
                />
              )}
            </View>
            
            <View style={styles.detailsItem}>
              <Text style={[styles.fieldLabel, { color: colors.textPrimary }]}>Year</Text>
              <ComboBox
                options={yearOptions}
                value={selectedYear}
                onSelect={(option) => setSelectedYear(option.value as number)}
                placeholder="Select year"
                searchable={true}
              />
            </View>
          </View>
          
          {/* Selected Vehicle Summary */}
          {selectedBrandData && (
            <View style={[styles.vehicleSummary, { backgroundColor: colors.surface, borderColor: colors.cardBorder }]}>
              <Text style={[styles.summaryTitle, { color: colors.textPrimary }]}>Selected Vehicle:</Text>
              <Text style={[styles.summaryText, { color: colors.accent }]}>
                {selectedYear ? `${selectedYear} ` : ''}
                {selectedBrandData.name}
                {selectedModelData ? ` ${selectedModelData.name}` : ''}
              </Text>
            </View>
          )}
        </Card>

        {/* Car Color Selection */}
        <Card style={[styles.sectionCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Car Color</Text>
          
          <View style={[styles.colorGrid, { gap: isTablet ? 16 : 12 }]}>
            {carColors.map((color) => {
              const isSelected = selectedColor === color.id;
              
              return (
                <Pressable
                  key={color.id}
                  onPress={() => setSelectedColor(color.id)}
                  style={[
                    styles.colorCard,
                    {
                      backgroundColor: isSelected ? colors.surface : colors.card,
                      borderColor: isSelected ? colors.accent : colors.cardBorder,
                      borderWidth: isSelected ? 2 : 1,
                      width: isTablet ? '18%' : '28%',
                      shadowColor: colors.textPrimary,
                      shadowOffset: { width: 0, height: 1 },
                      shadowOpacity: isSelected ? 0.1 : 0.03,
                      shadowRadius: 4,
                      elevation: isSelected ? 2 : 1,
                    }
                  ]}
                >
                  {isSelected && (
                    <View style={[styles.selectedBadge, { backgroundColor: colors.accent, top: 4, right: 4 }]}>
                      <Check size={10} color="#ffffff" />
                    </View>
                  )}
                  <View 
                    style={[
                      styles.colorCircle,
                      { 
                        backgroundColor: color.color,
                        borderColor: color.border,
                        width: isTablet ? 32 : 24,
                        height: isTablet ? 32 : 24,
                        borderRadius: isTablet ? 16 : 12,
                      }
                    ]} 
                  />
                  <Text style={[
                    styles.colorName,
                    { 
                      color: colors.textPrimary,
                      fontSize: isTablet ? 12 : 10
                    }
                  ]}>
                    {color.name}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </Card>

        {/* Price Summary */}
        {selectedCarTypeData && (
          <Card style={[styles.priceCard, { backgroundColor: colors.surface, borderColor: colors.cardBorder }]}>
            <View style={styles.priceRow}>
              <Text style={[styles.priceLabel, { color: colors.textSecondary }]}>Base Price:</Text>
              <Text style={[styles.priceValue, { color: colors.textPrimary }]}>{basePrice} MAD</Text>
            </View>
            {selectedCarTypeData.multiplier !== 1 && (
              <View style={styles.priceRow}>
                <Text style={[styles.priceAdjustment, { color: colors.textSecondary }]}>
                  {selectedCarTypeData.name} adjustment:
                </Text>
                <Text style={[styles.priceAdjustment, { color: colors.textSecondary }]}>×{selectedCarTypeData.multiplier}</Text>
              </View>
            )}
            <View style={[styles.priceDivider, { backgroundColor: colors.cardBorder }]} />
            <View style={styles.totalRow}>
              <Text style={[styles.totalLabel, { color: colors.textPrimary }]}>Total:</Text>
              <Text style={[styles.totalValue, { color: colors.accent }]}>{adjustedPrice} MAD</Text>
            </View>
          </Card>
        )}
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={[styles.footer, { backgroundColor: colors.card, borderTopColor: colors.cardBorder, paddingBottom: Math.max(insets.bottom, 16) }]}>
        <View style={styles.footerButtons}>
          <Button 
            variant="outline"
            style={styles.backButton}
            onPress={handleBack}
          >
            <ChevronLeft size={16} color={colors.accent} />
            <Text style={[styles.backButtonText, { color: colors.accent }]}>Back</Text>
          </Button>
          
          <Button 
            style={[styles.continueButton, { opacity: selectedCarType && selectedBrand ? 1 : 0.5 }]}
            onPress={handleContinue}
            disabled={!selectedCarType || !selectedBrand}
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
  carTypeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  carTypeCard: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1.5,
    alignItems: 'center',
    minHeight: 120,
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 6,
  },
  carTypeIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  carTypeName: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 4,
  },
  carTypePrice: {
    fontSize: 12,
    fontWeight: '500',
  },
  carTypeMultiplier: {
    fontSize: 10,
    fontWeight: '400',
    marginTop: 2,
  },
  selectedBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  multiplierBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  brandGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  brandCard: {
    paddingHorizontal: 12,
    paddingVertical: 16,
    borderRadius: 16,
    borderWidth: 1.5,
    marginBottom: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 100,
  },
  brandName: {
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 16,
  },
  modernSearchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    borderWidth: 1,
    marginBottom: 16,
    minHeight: 48,
  },
  modernSearchIcon: {
    marginRight: 12,
  },
  modernSearchInput: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
    padding: 0,
    margin: 0,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
    minHeight: 48,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInputWrapper: {
    flex: 1,
  },
  searchInput: {
    fontSize: 16,
    padding: 0,
    margin: 0,
    height: 24,
    lineHeight: 24,
  },
  popularBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 12,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
  },
  popularBadgeText: {
    fontSize: 12,
    fontWeight: '500',
  },
  popularDot: {
    position: 'absolute',
    top: 8,
    left: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
    borderWidth: 1,
    borderColor: '#ffffff',
  },
  noResultsContainer: {
    padding: 20,
    alignItems: 'center',
  },
  noResultsText: {
    fontSize: 14,
    fontStyle: 'italic',
  },
  showMoreButton: {
    marginTop: 8,
    padding: 12,
    borderWidth: 1,
    borderRadius: 8,
    alignItems: 'center',
    borderStyle: 'dashed',
  },
  showMoreText: {
    fontSize: 14,
    fontWeight: '500',
  },
  detailsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  detailsItem: {
    flex: 1,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  modernInputContainer: {
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 48,
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  modernInput: {
    fontSize: 16,
    padding: 0,
    margin: 0,
    lineHeight: 20,
  },
  inputContainer: {
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    minHeight: 44,
    justifyContent: 'center',
  },
  detailInput: {
    fontSize: 16,
    padding: 0,
    margin: 0,
    height: 24,
    lineHeight: 24,
  },
  input: {
    marginBottom: 0,
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 16,
  },
  colorCard: {
    width: '18%',
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 60,
  },
  colorCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 4,
  },
  colorName: {
    fontSize: 10,
    fontWeight: '500',
    textAlign: 'center',
  },
  priceCard: {
    padding: 16,
    marginBottom: 24,
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
  priceAdjustment: {
    fontSize: 12,
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
  // New styles for API integration
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    fontWeight: '500',
  },
  loadingComboBox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    minHeight: 48,
    gap: 12,
  },
  loadingComboText: {
    fontSize: 14,
  },
  vehicleSummary: {
    marginTop: 16,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  summaryTitle: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  summaryText: {
    fontSize: 16,
    fontWeight: '600',
  },
  // Circular brand styles
  brandCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  brandCircleLogo: {
    width: 32,
    height: 32,
  },
  brandCircleInitial: {
    fontSize: 18,
    fontWeight: '700',
  },
});
