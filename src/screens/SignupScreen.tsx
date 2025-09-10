import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Alert } from 'react-native';
import { ArrowLeft, Eye, EyeOff, Mail, Phone, User, UserCheck, Briefcase } from 'lucide-react-native';
import { useForm, Controller } from 'react-hook-form';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { FormInput } from '../components/ui/FormInput';
import { Separator } from '../components/ui/Separator';
import { Switch } from '../components/ui/Switch';
import { signupValidation } from '../utils/validationSchemas';
import { useNavigation } from '@react-navigation/native';
import { useThemeColors } from '../lib/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../contexts/AuthContext';

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
  const insets = useSafeAreaInsets();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [signupType, setSignupType] = useState<'email' | 'phone'>('email');
  const [role, setRole] = useState<'customer' | 'worker'>('customer');
  const [isLoading, setIsLoading] = useState(false);
  const theme = useThemeColors();

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

  const { signUp } = useAuth();

  const password = watch('password');

  const onSubmit = async (data: SignupFormData) => {
    if (signupType === 'phone') {
      Alert.alert('Not supported yet', 'Phone-based sign up is not available yet. Please use email.');
      return;
    }
    if (data.password !== data.confirmPassword) {
      Alert.alert('Error', "Passwords don't match");
      return;
    }

    if (!data.agreeToTerms) {
      Alert.alert('Error', 'Please agree to the terms and conditions');
      return;
    }

    setIsLoading(true);
    
    try {
      const email = data.email;
      await signUp(email, data.password, data.name, data.phone, role);
      Alert.alert('Success', 'Account created successfully!', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error: any) {
      Alert.alert('Signup Failed', error.message || 'Please try again.');
    } finally {
      setIsLoading(false);
    }
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
      style={[
        styles.tabButton,
        { backgroundColor: 'transparent' },
        isActive && { backgroundColor: theme.card, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2 },
      ]}
      onPress={() => setSignupType(value)}
    >
      <Icon size={16} color={isActive ? theme.accent : theme.textSecondary} />
      <Text style={[styles.tabText, { color: theme.textSecondary }, isActive && { color: theme.accent }]}>{label}</Text>
    </Pressable>
  );

  const RoleButton = ({ label, value, icon: Icon, isActive }: { 
    label: string; 
    value: 'customer' | 'worker'; 
    icon: any; 
    isActive: boolean 
  }) => (
    <Pressable
      style={[
        styles.roleButton,
        { backgroundColor: 'transparent', borderColor: theme.cardBorder },
        isActive && { backgroundColor: theme.accent + '10', borderColor: theme.accent },
      ]}
      onPress={() => setRole(value)}
    >
      <Icon size={20} color={isActive ? theme.accent : theme.textSecondary} />
      <Text style={[styles.roleText, { color: theme.textSecondary }, isActive && { color: theme.accent }]}>{label}</Text>
    </Pressable>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.card, borderBottomColor: theme.cardBorder }]}>
        <Button
          variant="ghost"
          size="icon"
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <ArrowLeft size={20} color={theme.textSecondary} />
        </Button>
        <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>Sign Up</Text>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: Math.max(insets.bottom, 16) }} showsVerticalScrollIndicator={false}>
        {/* Welcome Section */}
        <View style={styles.welcomeSection}>
          <View style={styles.logoContainer}>
            <View style={styles.logo} />
          </View>
          <Text style={[styles.welcomeTitle, { color: theme.textPrimary }]}>Create {role === 'worker' ? 'Worker' : 'Customer'} Account</Text>
          <Text style={[styles.welcomeSubtitle, { color: theme.textSecondary }]}>Join us to book professional car wash services</Text>
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
                <User size={16} color={theme.textSecondary} />
              </View>
            </View>

            {/* Signup Type Tabs */}
            <View style={styles.tabsContainer}>
              <View style={[styles.tabsList, { backgroundColor: theme.surface }] }>
                <TabButton 
                  label="Email" 
                  value="email" 
                  icon={Mail} 
                  isActive={signupType === 'email'} 
                />
                {/* Temporarily disabled phone signup until OTP flow is implemented */}
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

            {/* Role selection */}
            <View style={styles.roleContainer}>
              <Text style={styles.roleLabel}>I am signing up as</Text>
              <View style={styles.roleButtons}>
                <RoleButton label="Customer" value="customer" icon={UserCheck} isActive={role === 'customer'} />
                <RoleButton label="Worker" value="worker" icon={Briefcase} isActive={role === 'worker'} />
              </View>
            </View>

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
                  <EyeOff size={20} color={theme.textSecondary} /> : 
                  <Eye size={20} color={theme.textSecondary} />
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
                  <EyeOff size={20} color={theme.textSecondary} /> : 
                  <Eye size={20} color={theme.textSecondary} />
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
              <Text style={[styles.termsText, { color: theme.textPrimary }]}>
                I agree to the{' '}
                <Pressable onPress={() => Alert.alert('Terms', 'Terms of Service')}>
                  <Text style={[styles.termsLink, { color: theme.accent }]}>Terms of Service</Text>
                </Pressable>
                {' '}and{' '}
                <Pressable onPress={() => Alert.alert('Privacy', 'Privacy Policy')}>
                  <Text style={[styles.termsLink, { color: theme.accent }]}>Privacy Policy</Text>
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
              <Separator style={[styles.dividerLine, { backgroundColor: theme.cardBorder }]} />
              <Text style={[styles.dividerText, { color: theme.textSecondary }]}>or</Text>
              <Separator style={[styles.dividerLine, { backgroundColor: theme.cardBorder }]} />
            </View>

            {/* Continue as Guest */}
            <Button 
              variant="outline" 
              onPress={handleContinueAsGuest}
              style={styles.guestButton}
            >
              <Text style={[styles.guestButtonText, { color: theme.textPrimary }]}>Continue as Guest</Text>
            </Button>

            {/* Sign In Link */}
            <View style={styles.signinContainer}>
              <Text style={[styles.signinText, { color: theme.textSecondary }] }>
                Already have an account?{' '}
                <Pressable onPress={() => navigation.navigate('Login' as never)}>
                  <Text style={[styles.signinLink, { color: theme.accent }]}>Sign in</Text>
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
  roleContainer: {
    marginBottom: 16,
  },
  roleLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    color: '#374151',
  },
  roleButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  roleButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderRadius: 8,
    backgroundColor: 'transparent',
  },
  roleText: {
    fontSize: 14,
    fontWeight: '500',
  },
});
