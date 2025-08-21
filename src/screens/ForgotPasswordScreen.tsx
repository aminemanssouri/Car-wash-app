import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ArrowLeft, Mail, Phone, CheckCircle } from 'lucide-react-native';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { FormInput } from '../components/ui/FormInput';
import { Label } from '../components/ui/Label';
import { useForm } from 'react-hook-form';

interface ForgotPasswordFormData {
  email: string;
  phone: string;
}

export default function ForgotPasswordScreen() {
  const navigation = useNavigation();
  const [resetType, setResetType] = useState<'email' | 'phone'>('email');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedValue, setSubmittedValue] = useState('');

  const { control, handleSubmit, formState: { errors }, watch } = useForm<ForgotPasswordFormData>({
    defaultValues: {
      email: '',
      phone: '',
    }
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setIsLoading(true);
    const value = resetType === 'email' ? data.email : data.phone;
    setSubmittedValue(value);

    // Simulate password reset process
    setTimeout(() => {
      setIsLoading(false);
      setIsSubmitted(true);
    }, 1500);
  };

  const TabButton = ({ label, value, icon: Icon, isActive }: { 
    label: string; 
    value: 'email' | 'phone'; 
    icon: any; 
    isActive: boolean 
  }) => (
    <Pressable
      style={[styles.tabButton, isActive && styles.activeTab]}
      onPress={() => setResetType(value)}
    >
      <Icon size={16} color={isActive ? '#3b82f6' : '#6b7280'} />
      <Text style={[styles.tabText, isActive && styles.activeTabText]}>{label}</Text>
    </Pressable>
  );

  if (isSubmitted) {
    return (
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable style={styles.backButton} onPress={() => (navigation as any).navigate('Login')}>
            <ArrowLeft size={20} color="#374151" />
          </Pressable>
          <Text style={styles.headerTitle}>Reset Password</Text>
        </View>

        <View style={styles.content}>
          <Card style={styles.successCard}>
            <View style={styles.successIcon}>
              <CheckCircle size={32} color="#16a34a" />
            </View>
            <Text style={styles.successTitle}>
              Check Your {resetType === 'email' ? 'Email' : 'Phone'}
            </Text>
            <Text style={styles.successMessage}>
              We've sent password reset instructions to{' '}
              <Text style={styles.successValue}>{submittedValue}</Text>
            </Text>
            <Button style={styles.backToLoginButton} onPress={() => (navigation as any).navigate('Login')}>
              <Text style={styles.buttonText}>Back to Sign In</Text>
            </Button>
          </Card>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => navigation.goBack()}>
          <ArrowLeft size={20} color="#374151" />
        </Pressable>
        <Text style={styles.headerTitle}>Reset Password</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header Section */}
        <View style={styles.welcomeSection}>
          <View style={styles.logoContainer}>
            <View style={styles.logo} />
          </View>
          <Text style={styles.welcomeTitle}>Forgot Password?</Text>
          <Text style={styles.welcomeSubtitle}>
            Enter your email or phone number and we'll send you instructions to reset your password
          </Text>
        </View>

        {/* Reset Form */}
        <Card style={styles.formCard}>
          <View style={styles.form}>
            {/* Reset Type Tabs */}
            <View style={styles.tabsContainer}>
              <View style={styles.tabsList}>
                <TabButton 
                  label="Email" 
                  value="email" 
                  icon={Mail} 
                  isActive={resetType === 'email'} 
                />
                <TabButton 
                  label="Phone" 
                  value="phone" 
                  icon={Phone} 
                  isActive={resetType === 'phone'} 
                />
              </View>
            </View>

            {/* Input Fields */}
            {resetType === 'email' ? (
              <FormInput
                name="email"
                control={control}
                label="Email Address"
                placeholder="Enter your email"
                keyboardType="email-address"
                autoCapitalize="none"
                rules={{
                  required: 'Email is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Invalid email address'
                  }
                }}
                error={errors.email}
              />
            ) : (
              <FormInput
                name="phone"
                control={control}
                label="Phone Number"
                placeholder="+212 6XX XXX XXX"
                keyboardType="phone-pad"
                rules={{
                  required: 'Phone number is required',
                  pattern: {
                    value: /^\+?[1-9]\d{1,14}$/,
                    message: 'Invalid phone number'
                  }
                }}
                error={errors.phone}
              />
            )}

            {/* Submit Button */}
            <Button 
              onPress={handleSubmit(onSubmit)} 
              style={styles.submitButton}
              disabled={isLoading}
            >
              <Text style={styles.submitButtonText}>
                {isLoading ? 'Sending...' : 'Send Reset Instructions'}
              </Text>
            </Button>

            {/* Back to Login */}
            <View style={styles.backToLoginContainer}>
              <Pressable onPress={() => (navigation as any).navigate('Login')}>
                <Text style={styles.backToLoginText}>Back to Sign In</Text>
              </Pressable>
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
    paddingVertical: 32,
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
    textAlign: 'center',
    marginBottom: 8,
  },
  welcomeSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  formCard: {
    padding: 24,
  },
  form: {
    gap: 20,
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
    gap: 6,
  },
  activeTab: {
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
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
  submitButton: {
    height: 48,
    marginTop: 8,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  backToLoginContainer: {
    alignItems: 'center',
    marginTop: 8,
  },
  backToLoginText: {
    fontSize: 14,
    color: '#3b82f6',
    textDecorationLine: 'underline',
  },
  successCard: {
    padding: 24,
    alignItems: 'center',
    maxWidth: 400,
    alignSelf: 'center',
  },
  successIcon: {
    width: 64,
    height: 64,
    backgroundColor: '#dcfce7',
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  successTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 8,
  },
  successMessage: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  successValue: {
    fontWeight: '500',
    color: '#111827',
  },
  backToLoginButton: {
    width: '100%',
    height: 48,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
});
