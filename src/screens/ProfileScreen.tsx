import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { ArrowLeft, User, Mail, Phone, MapPin, Edit } from 'lucide-react-native';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Avatar } from '../components/ui/Avatar';
import { Separator } from '../components/ui/Separator';
import { useNavigation } from '@react-navigation/native';
import { useThemeColors } from '../lib/theme';

export const ProfileScreen: React.FC = () => {
  const navigation = useNavigation();
  const theme = useThemeColors();

  // Mock user data - in a real app, this would come from authentication context
  const user = {
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+212 6XX XXX XXX',
    location: 'Marrakech, Morocco',
    avatar: '/placeholder.svg?height=80&width=80',
    joinDate: 'January 2024',
  };

  const handleLogin = () => {
    navigation.navigate('Login' as never);
  };

  const handleSignup = () => {
    navigation.navigate('Signup' as never);
  };

  // For demo purposes, showing guest state
  const isGuest = true;

  if (isGuest) {
    return (
      <View style={[styles.container, { backgroundColor: theme.bg }]}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: theme.card, borderBottomColor: theme.cardBorder }] }>
          <Button
            variant="ghost"
            size="icon"
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <ArrowLeft size={20} color={theme.textPrimary} />
          </Button>
          <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>Profile</Text>
        </View>

        <View style={styles.content}>
          {/* Guest State */}
          <Card style={styles.guestCard}>
            <View style={styles.guestIcon}>
              <User size={32} color={theme.textSecondary} />
            </View>
            <Text style={[styles.guestTitle, { color: theme.textPrimary }]}>Welcome, Guest!</Text>
            <Text style={[styles.guestSubtitle, { color: theme.textSecondary }]}>
              Sign in or create an account to access your profile and booking history
            </Text>

            <View style={styles.guestButtons}>
              <Button onPress={handleLogin} style={styles.signInButton}>
                <Text style={styles.signInButtonText}>Sign In</Text>
              </Button>
              <Button onPress={handleSignup} variant="outline" style={styles.createAccountButton}>
                <Text style={[styles.createAccountButtonText, { color: theme.textPrimary }]}>Create Account</Text>
              </Button>
            </View>
          </Card>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }] }>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.card, borderBottomColor: theme.cardBorder }] }>
        <Button
          variant="ghost"
          size="icon"
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <ArrowLeft size={20} color={theme.textPrimary} />
        </Button>
        <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>Profile</Text>
        <View style={styles.headerActions}>
          <Button variant="ghost" size="icon" style={styles.editButton}>
            <Edit size={20} color={theme.textPrimary} />
          </Button>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <Card style={styles.profileCard}>
          <View style={styles.profileHeader}>
            <Avatar
              src={user.avatar}
              size={80}
              fallback={user.name.split(' ').map(n => n[0]).join('')}
            />
            <View style={styles.profileInfo}>
              <Text style={[styles.userName, { color: theme.textPrimary }]}>{user.name}</Text>
              <Text style={[styles.memberSince, { color: theme.textSecondary }]}>Member since {user.joinDate}</Text>
            </View>
          </View>
        </Card>

        {/* Contact Information */}
        <Card style={styles.contactCard}>
          <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Contact Information</Text>
          <View style={styles.contactList}>
            <View style={styles.contactItem}>
              <Mail size={20} color={theme.textSecondary} />
              <View style={styles.contactDetails}>
                <Text style={[styles.contactLabel, { color: theme.textPrimary }]}>Email</Text>
                <Text style={[styles.contactValue, { color: theme.textSecondary }]}>{user.email}</Text>
              </View>
            </View>

            <Separator style={styles.contactSeparator} />

            <View style={styles.contactItem}>
              <Phone size={20} color={theme.textSecondary} />
              <View style={styles.contactDetails}>
                <Text style={[styles.contactLabel, { color: theme.textPrimary }]}>Phone</Text>
                <Text style={[styles.contactValue, { color: theme.textSecondary }]}>{user.phone}</Text>
              </View>
            </View>

            <Separator style={styles.contactSeparator} />

            <View style={styles.contactItem}>
              <MapPin size={20} color={theme.textSecondary} />
              <View style={styles.contactDetails}>
                <Text style={[styles.contactLabel, { color: theme.textPrimary }]}>Location</Text>
                <Text style={[styles.contactValue, { color: theme.textSecondary }]}>{user.location}</Text>
              </View>
            </View>
          </View>
        </Card>

        {/* Account Actions */}
        <Card style={styles.actionsCard}>
          <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Account</Text>
          <View style={styles.actionsList}>
            <Button variant="ghost" style={styles.actionButton}>
              <Text style={[styles.actionButtonText, { color: theme.textPrimary }]}>Edit Profile</Text>
            </Button>
            <Button variant="ghost" style={styles.actionButton}>
              <Text style={[styles.actionButtonText, { color: theme.textPrimary }]}>Change Password</Text>
            </Button>
            <Button variant="ghost" style={styles.actionButton}>
              <Text style={[styles.actionButtonText, styles.destructiveText]}>Sign Out</Text>
            </Button>
          </View>
        </Card>
      </ScrollView>
    </View>
  );
};

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
    flex: 1,
  },
  headerActions: {
    marginLeft: 'auto',
  },
  editButton: {
    width: 40,
    height: 40,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  // Guest state styles
  guestCard: {
    padding: 24,
    alignItems: 'center',
    maxWidth: 320,
    alignSelf: 'center',
    marginTop: 32,
  },
  guestIcon: {
    width: 64,
    height: 64,
    backgroundColor: '#f3f4f6',
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  guestTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  guestSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  guestButtons: {
    gap: 12,
    width: '100%',
  },
  signInButton: {
    height: 48,
    justifyContent: 'center',
  },
  signInButtonText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  createAccountButton: {
    height: 48,
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  createAccountButtonText: {
    color: '#374151',
    fontWeight: '600',
  },
  // Authenticated user styles
  profileCard: {
    padding: 24,
    marginBottom: 24,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  profileInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  memberSince: {
    fontSize: 14,
    color: '#6b7280',
  },
  contactCard: {
    padding: 24,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  contactList: {
    gap: 16,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  contactDetails: {
    flex: 1,
  },
  contactLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 2,
  },
  contactValue: {
    fontSize: 14,
    color: '#6b7280',
  },
  contactSeparator: {
    marginVertical: 0,
  },
  actionsCard: {
    padding: 24,
  },
  actionsList: {
    gap: 8,
  },
  actionButton: {
    height: 48,
    justifyContent: 'flex-start',
    paddingHorizontal: 0,
  },
  actionButtonText: {
    fontSize: 16,
    color: '#374151',
  },
  destructiveText: {
    color: '#ef4444',
  },
});

export default ProfileScreen;
