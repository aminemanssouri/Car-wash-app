import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Alert } from 'react-native';
import { ArrowLeft, Eye, EyeOff, Mail, Phone } from 'lucide-react-native';
import { useForm } from 'react-hook-form';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { FormInput } from '../components/ui/FormInput';
import { Separator } from '../components/ui/Separator';
import { loginValidation } from '../utils/validationSchemas';
import { useNavigation } from '@react-navigation/native';
import { useThemeColors } from '../lib/theme';
import { useAuth } from '../contexts/AuthContext';

interface LoginFormData {
  email: string;
  phone: string;
  password: string;
}

export default function LoginScreen() {
  const navigation = useNavigation();
  const [showPassword, setShowPassword] = useState(false);
  const [loginType, setLoginType] = useState<'email' | 'phone'>('email');
  const [isLoading, setIsLoading] = useState(false);
  const theme = useThemeColors();

  const { control, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
    defaultValues: {
      email: '',
      phone: '',
      password: '',
    }
  });

  const { signIn } = useAuth();

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    
    try {
      if (loginType === 'phone') {
        Alert.alert('Not supported yet', 'Phone-based login is not available yet. Please use email.');
        return;
      }
      await signIn(data.email, data.password);
      navigation.goBack();
    } catch (error: any) {
      Alert.alert('Login Failed', error.message || 'Please check your credentials and try again.');
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
      onPress={() => setLoginType(value)}
    >
      <Icon size={16} color={isActive ? theme.accent : theme.textSecondary} />
      <Text style={[styles.tabText, { color: theme.textSecondary }, isActive && { color: theme.accent }]}>{label}</Text>
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
        <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>Sign In</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Welcome Section */}
        <View style={styles.welcomeSection}>
          <View style={styles.logoContainer}>
            <View style={styles.logo} />
          </View>
          <Text style={[styles.welcomeTitle, { color: theme.textPrimary }]}>Welcome Back</Text>
          <Text style={[styles.welcomeSubtitle, { color: theme.textSecondary }]}>Sign in to book your car wash service</Text>
        </View>

        {/* Login Form */}
        <Card style={styles.formCard}>
          <View style={styles.form}>
            {/* Login Type Tabs */}
            <View style={styles.tabsContainer}>
              <View style={styles.tabsList}>
                <TabButton 
                  label="Email" 
                  value="email" 
                  icon={Mail} 
                  isActive={loginType === 'email'} 
                />
                {/* Phone login temporarily disabled until OTP flow is implemented */}
              </View>
            </View>

            {/* Input Fields */}
            {loginType === 'email' ? (
              <FormInput
                name="email"
                control={control}
                label="Email Address"
                placeholder="Enter your email"
                keyboardType="email-address"
                autoCapitalize="none"
                rules={loginValidation.email}
                error={errors.email}
              />
            ) : null}

            {/* Password Field */}
            <View style={styles.passwordContainer}>
              <FormInput
                name="password"
                control={control}
                label="Password"
                placeholder="Enter your password"
                secureTextEntry={!showPassword}
                style={styles.passwordInput}
                rules={loginValidation.password}
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

            {/* Forgot Password */}
            <View style={styles.forgotPasswordContainer}>
              <Pressable onPress={() => Alert.alert('Forgot Password', 'Password reset coming soon')}>
                <Text style={[styles.forgotPasswordText, { color: theme.accent }]}>Forgot password?</Text>
              </Pressable>
            </View>

            {/* Submit Button */}
            <Button 
              onPress={handleSubmit(onSubmit)} 
              style={styles.submitButton}
              disabled={isLoading}
            >
              <Text style={styles.submitButtonText}>
                {isLoading ? 'Signing in...' : 'Sign In'}
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

            {/* Sign Up Link */}
            <View style={styles.signupContainer}>
              <Text style={[styles.signupText, { color: theme.textSecondary }] }>
                Don't have an account?{' '}
                <Pressable onPress={() => navigation.navigate('Signup' as never)}>
                  <Text style={[styles.signupLink, { color: theme.accent }]}>Sign up</Text>
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
  forgotPasswordContainer: {
    alignItems: 'flex-end',
    marginTop: -8,
  },
  forgotPasswordText: {
    fontSize: 14,
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
  signupContainer: {
    alignItems: 'center',
    marginTop: 8,
  },
  signupText: {
    fontSize: 14,
    color: '#6b7280',
  },
  signupLink: {
    color: '#3b82f6',
    fontWeight: '500',
  },
});
