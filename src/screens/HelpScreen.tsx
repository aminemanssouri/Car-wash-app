import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Alert, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { ArrowLeft, MessageCircle, Phone, Mail, ChevronRight } from 'lucide-react-native';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { useLanguage } from '../contexts/LanguageContext';

export default function HelpScreen() {
  const navigation = useNavigation();
  const { t } = useLanguage();

  const helpSections = [
    {
      title: "Getting Started",
      items: [
        "How to book a car wash service",
        "Finding the right car washer",
        "Understanding pricing",
        "Payment methods",
      ],
    },
    {
      title: "Managing Bookings",
      items: ["Canceling or rescheduling", "Tracking your booking", "Rating and reviews", "Booking history"],
    },
    {
      title: "Account & Settings",
      items: ["Creating an account", "Managing your profile", "Notification settings", "Privacy and security"],
    },
    {
      title: "Troubleshooting",
      items: ["App not working properly", "Payment issues", "Worker didn't show up", "Quality concerns"],
    },
  ];

  const contactOptions = [
    {
      icon: MessageCircle,
      title: "Live Chat",
      description: "Chat with our support team",
      action: () => Alert.alert("Live Chat", "Chat feature will be available soon"),
    },
    {
      icon: Phone,
      title: "Call Us",
      description: "+212 5XX XXX XXX",
      action: () => Linking.openURL('tel:+2125XXXXXXX'),
    },
    {
      icon: Mail,
      title: "Email Support",
      description: "support@carwash.ma",
      action: () => Linking.openURL('mailto:support@carwash.ma'),
    },
  ];

  const handleEmergencyCall = () => {
    Alert.alert(
      "Emergency Contact",
      "Call emergency hotline?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Call", onPress: () => Linking.openURL('tel:+2125XXXXXXX') }
      ]
    );
  };

  const handleFAQItem = (item: string) => {
    Alert.alert("Help Topic", `Information about: ${item}\n\nThis feature will be available soon with detailed help content.`);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top','bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => navigation.goBack()}>
          <ArrowLeft size={20} color="#374151" />
        </Pressable>
        <Text style={styles.headerTitle}>{t('help_center')}</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Contact Support */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Support</Text>
          <Card style={styles.card}>
            {contactOptions.map((option, index) => (
              <View key={index}>
                <Pressable style={styles.contactItem} onPress={option.action}>
                  <View style={styles.contactIconContainer}>
                    <option.icon size={20} color="#3b82f6" />
                  </View>
                  <View style={styles.contactContent}>
                    <Text style={styles.contactTitle}>{option.title}</Text>
                    <Text style={styles.contactDescription}>{option.description}</Text>
                  </View>
                  <ChevronRight size={20} color="#9ca3af" />
                </Pressable>
                {index < contactOptions.length - 1 && <View style={styles.separator} />}
              </View>
            ))}
          </Card>
        </View>

        {/* FAQ Sections */}
        {helpSections.map((section, sectionIndex) => (
          <View key={sectionIndex} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <Card style={styles.card}>
              {section.items.map((item, itemIndex) => (
                <View key={itemIndex}>
                  <Pressable style={styles.faqItem} onPress={() => handleFAQItem(item)}>
                    <Text style={styles.faqTitle}>{item}</Text>
                    <ChevronRight size={20} color="#9ca3af" />
                  </Pressable>
                  {itemIndex < section.items.length - 1 && <View style={styles.separator} />}
                </View>
              ))}
            </Card>
          </View>
        ))}

        {/* Emergency Contact */}
        <Card style={styles.emergencyCard}>
          <Text style={styles.emergencyTitle}>Emergency Contact</Text>
          <Text style={styles.emergencyDescription}>
            If you have an urgent safety concern or emergency, please contact us immediately.
          </Text>
          <Button style={styles.emergencyButton} onPress={handleEmergencyCall}>
            <View style={styles.emergencyButtonContent}>
              <Phone size={16} color="#ffffff" />
              <Text style={styles.emergencyButtonText}>Emergency Hotline: +212 5XX XXX XXX</Text>
            </View>
          </Button>
        </Card>
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
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  card: {
    padding: 0,
    overflow: 'hidden',
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'transparent',
  },
  contactIconContainer: {
    width: 40,
    height: 40,
    backgroundColor: '#eff6ff',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  contactContent: {
    flex: 1,
  },
  contactTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 2,
  },
  contactDescription: {
    fontSize: 14,
    color: '#6b7280',
  },
  faqItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: 'transparent',
  },
  faqTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
    flex: 1,
  },
  separator: {
    height: 1,
    backgroundColor: '#e5e7eb',
    marginLeft: 16,
    marginRight: 16,
  },
  emergencyCard: {
    padding: 16,
    backgroundColor: '#fef2f2',
    borderColor: '#fecaca',
    borderWidth: 1,
    marginBottom: 24,
  },
  emergencyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#7f1d1d',
    marginBottom: 8,
  },
  emergencyDescription: {
    fontSize: 14,
    color: '#991b1b',
    lineHeight: 20,
    marginBottom: 12,
  },
  emergencyButton: {
    backgroundColor: '#dc2626',
    height: 48,
  },
  emergencyButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  emergencyButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
});
