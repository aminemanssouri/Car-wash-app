import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Alert } from 'react-native';
import { ArrowLeft, Eye, EyeOff, Mail, Phone, User } from 'lucide-react-native';
import { useForm, Controller } from 'react-hook-form';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { FormInput } from '../components/ui/FormInput';
import { Separator } from '../components/ui/Separator';
import { Switch } from '../components/ui/Switch';
import { signupValidation } from '../utils/validationSchemas';
import { useNavigation } from '@react-navigation/native';

interface SignupFormData {
  name: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  agreeToTerms: boolean;
}

export default function SignupScreen() {
  const navigation = useNavigation();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [signupType, setSignupType] = useState<'email' | 'phone'>('email');
  const [isLoading, setIsLoading] = useState(false);

  const { control, handleSubmit, formState: { errors }, watch } = useForm<SignupFormData>({
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
      agreeToTerms: false,
    }
  });

  const password = watch('password');

  const onSubmit = async (data: SignupFormData) => {
    if (data.password !== data.confirmPassword) {
      Alert.alert('Error', "Passwords don't match");
      return;
    }

    if (!data.agreeToTerms) {
      Alert.alert('Error', 'Please agree to the terms and conditions');
      return;
    }

    setIsLoading(true);

    // Simulate signup process
    setTimeout(() => {
      setIsLoading(false);
      Alert.alert('Success', 'Account created successfully!', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    }, 1500);
  };

  const handleContinueAsGuest = () => {
    navigation.goBack();
  };

  const TabButton = ({ label, value, icon: Icon, isActive }: { 
    label: string; 
    value: 'email' | 'phone'; 
    icon: any; 
    isActive: boolean 
  }) => (
    <Pressable
      style={[styles.tabButton, isActive && styles.activeTab]}
      onPress={() => setSignupType(value)}
    >
      <Icon size={16} color={isActive ? '#3b82f6' : '#6b7280'} />
      <Text style={[styles.tabText, isActive && styles.activeTabText]}>{label}</Text>
    </Pressable>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Button
          variant="ghost"
          size="icon"
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <ArrowLeft size={20} color="#374151" />
        </Button>
        <Text style={styles.headerTitle}>Sign Up</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Welcome Section */}
        <View style={styles.welcomeSection}>
          <View style={styles.logoContainer}>
            <View style={styles.logo} />
          </View>
          <Text style={styles.welcomeTitle}>Create Account</Text>
          <Text style={styles.welcomeSubtitle}>Join us to book professional car wash services</Text>
        </View>

        {/* Signup Form */}
        <Card style={styles.formCard}>
          <View style={styles.form}>
            {/* Full Name */}
            <View style={styles.nameContainer}>
              <FormInput
                name="name"
                control={control}
                label="Full Name"
                placeholder="Enter your full name"
                autoCapitalize="words"
                rules={signupValidation.name}
                error={errors.name}
              />
              <View style={styles.nameIcon}>
                <User size={16} color="#6b7280" />
              </View>
            </View>

            {/* Signup Type Tabs */}
            <View style={styles.tabsContainer}>
              <View style={styles.tabsList}>
                <TabButton 
                  label="Email" 
                  value="email" 
                  icon={Mail} 
                  isActive={signupType === 'email'} 
                />
                <TabButton 
                  label="Phone" 
                  value="phone" 
                  icon={Phone} 
                  isActive={signupType === 'phone'} 
                />
              </View>
            </View>

            {/* Email/Phone Input */}
            {signupType === 'email' ? (
              <FormInput
                name="email"
                control={control}
                label="Email Address"
                placeholder="Enter your email"
                keyboardType="email-address"
                autoCapitalize="none"
                rules={signupValidation.email}
                error={errors.email}
              />
            ) : (
              <FormInput
                name="phone"
                control={control}
                label="Phone Number"
                placeholder="+212 6XX XXX XXX"
                keyboardType="phone-pad"
                rules={signupValidation.phone}
                error={errors.phone}
              />
            )}

            {/* Password Field */}
            <View style={styles.passwordContainer}>
              <FormInput
                name="password"
                control={control}
                label="Password"
                placeholder="Create a password"
                secureTextEntry={!showPassword}
                style={styles.passwordInput}
                rules={signupValidation.password}
                error={errors.password}
              />
              <Pressable
                style={styles.passwordToggle}
                onPress={() => setShowPassword(!showPassword)}
              >
                {showPassword ? 
                  <EyeOff size={20} color="#6b7280" /> : 
                  <Eye size={20} color="#6b7280" />
                }
              </Pressable>
            </View>

            {/* Confirm Password Field */}
            <View style={styles.passwordContainer}>
              <FormInput
                name="confirmPassword"
                control={control}
                label="Confirm Password"
                placeholder="Confirm your password"
                secureTextEntry={!showConfirmPassword}
                style={styles.passwordInput}
                rules={{
                  required: 'Please confirm your password',
                  validate: (value: string) => value === password || 'Passwords do not match'
                }}
                error={errors.confirmPassword}
              />
              <Pressable
                style={styles.passwordToggle}
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? 
                  <EyeOff size={20} color="#6b7280" /> : 
                  <Eye size={20} color="#6b7280" />
                }
              </Pressable>
            </View>

            {/* Terms and Conditions */}
            <View style={styles.termsContainer}>
              <Controller
                name="agreeToTerms"
                control={control}
                rules={{ required: 'You must agree to the terms' }}
                render={({ field: { onChange, value } }) => (
                  <Switch
                    checked={value}
                    onCheckedChange={onChange}
                  />
                )}
              />
              <Text style={styles.termsText}>
                I agree to the{' '}
                <Pressable onPress={() => Alert.alert('Terms', 'Terms of Service')}>
                  <Text style={styles.termsLink}>Terms of Service</Text>
                </Pressable>
                {' '}and{' '}
                <Pressable onPress={() => Alert.alert('Privacy', 'Privacy Policy')}>
                  <Text style={styles.termsLink}>Privacy Policy</Text>
                </Pressable>
              </Text>
            </View>

            {/* Submit Button */}
            <Button 
              onPress={handleSubmit(onSubmit)} 
              style={styles.submitButton}
              disabled={isLoading}
            >
              <Text style={styles.submitButtonText}>
                {isLoading ? 'Creating account...' : 'Create Account'}
              </Text>
            </Button>

            {/* Divider */}
            <View style={styles.divider}>
              <Separator style={styles.dividerLine} />
              <Text style={styles.dividerText}>or</Text>
              <Separator style={styles.dividerLine} />
            </View>

            {/* Continue as Guest */}
            <Button 
              variant="outline" 
              onPress={handleContinueAsGuest}
              style={styles.guestButton}
            >
              <Text style={styles.guestButtonText}>Continue as Guest</Text>
            </Button>

            {/* Sign In Link */}
            <View style={styles.signinContainer}>
              <Text style={styles.signinText}>
                Already have an account?{' '}
                <Pressable onPress={() => navigation.navigate('Login' as never)}>
                  <Text style={styles.signinLink}>Sign in</Text>
                </Pressable>
              </Text>
            </View>
          </View>
        </Card>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingTop: 50,
  },
  backButton: {
    width: 40,
    height: 40,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  welcomeSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoContainer: {
    width: 64,
    height: 64,
    backgroundColor: '#eff6ff',
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  logo: {
    width: 32,
    height: 32,
    backgroundColor: '#3b82f6',
    borderRadius: 16,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
  },
  formCard: {
    padding: 24,
    maxWidth: 400,
    alignSelf: 'center',
    width: '100%',
  },
  form: {
    gap: 16,
  },
  nameContainer: {
    position: 'relative',
  },
  nameInput: {
    paddingRight: 50,
  },
  nameIcon: {
    position: 'absolute',
    right: 12,
    top: 38,
    padding: 8,
  },
  tabsContainer: {
    marginBottom: 8,
  },
  tabsList: {
    flexDirection: 'row',
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    padding: 4,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    gap: 8,
  },
  activeTab: {
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
  },
  activeTabText: {
    color: '#3b82f6',
  },
  passwordContainer: {
    position: 'relative',
  },
  passwordInput: {
    paddingRight: 50,
  },
  passwordToggle: {
    position: 'absolute',
    right: 12,
    top: 38,
    padding: 8,
  },
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  termsText: {
    flex: 1,
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  termsLink: {
    color: '#3b82f6',
    fontWeight: '500',
  },
  submitButton: {
    height: 48,
    justifyContent: 'center',
    marginTop: 8,
  },
  submitButtonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 16,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginVertical: 8,
  },
  dividerLine: {
    flex: 1,
  },
  dividerText: {
    fontSize: 14,
    color: '#6b7280',
  },
  guestButton: {
    height: 48,
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  guestButtonText: {
    color: '#374151',
    fontWeight: '600',
    fontSize: 16,
  },
  signinContainer: {
    alignItems: 'center',
    marginTop: 8,
  },
  signinText: {
    fontSize: 14,
    color: '#6b7280',
  },
  signinLink: {
    color: '#3b82f6',
    fontWeight: '500',
  },
});
