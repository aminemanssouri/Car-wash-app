import React, { useEffect, useRef } from 'react';
import { Modal, View, Text, StyleSheet, Animated, Pressable } from 'react-native';
import { CheckCircle2, Info, AlertTriangle, X } from 'lucide-react-native';
import { useThemeColors } from '../../lib/theme';

export type AnimatedModalProps = {
  visible: boolean;
  type?: 'success' | 'info' | 'warning';
  title: string;
  message?: string;
  onClose?: () => void;
  primaryActionText?: string;
  onPrimaryAction?: () => void;
};

export const AnimatedModal: React.FC<AnimatedModalProps> = ({
  visible,
  type = 'info',
  title,
  message,
  onClose,
  primaryActionText,
  onPrimaryAction,
}) => {
  const theme = useThemeColors();
  const scale = useRef(new Animated.Value(0.8)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(scale, { toValue: 1, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 1, duration: 180, useNativeDriver: true }),
      ]).start();
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulse, { toValue: 1, duration: 700, useNativeDriver: true }),
          Animated.timing(pulse, { toValue: 0, duration: 700, useNativeDriver: true }),
        ])
      ).start();
    } else {
      scale.setValue(0.8);
      opacity.setValue(0);
      pulse.stopAnimation();
      pulse.setValue(0);
    }
  }, [visible]);

  const Icon = type === 'success' ? CheckCircle2 : type === 'warning' ? AlertTriangle : Info;
  const accent = type === 'success' ? '#22c55e' : type === 'warning' ? '#f59e0b' : theme.accent;

  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
      <View style={[styles.backdrop, { backgroundColor: theme.isDark ? 'rgba(0,0,0,0.6)' : 'rgba(17,24,39,0.45)' }]}>
        <Animated.View
          style={{
            transform: [{ scale }],
            opacity,
            backgroundColor: theme.card,
            borderRadius: 16,
            padding: 20,
            width: '86%',
            borderWidth: 1,
            borderColor: theme.cardBorder,
          }}
        >
          <View style={styles.headerRow}>
            <Animated.View
              style={{
                transform: [
                  {
                    scale: pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.06] }),
                  },
                ],
              }}
            >
              <Icon size={28} color={accent} />
            </Animated.View>
            <Pressable onPress={onClose} style={styles.closeBtn}>
              <X size={20} color={theme.textSecondary} />
            </Pressable>
          </View>

          <Text style={[styles.title, { color: theme.textPrimary }]}>{title}</Text>
          {message ? (
            <Text style={[styles.message, { color: theme.textSecondary }]}>{message}</Text>
          ) : null}

          <View style={styles.actionsRow}>
            {onClose && (
              <Pressable onPress={onClose} style={[styles.actionBtn, { borderColor: theme.cardBorder }]}>
                <Text style={[styles.actionText, { color: theme.textPrimary }]}>OK</Text>
              </Pressable>
            )}
            {onPrimaryAction && (
              <Pressable
                onPress={onPrimaryAction}
                style={[styles.primaryBtn, { backgroundColor: accent }]}
              >
                <Text style={[styles.primaryText, { color: '#fff' }]}>{primaryActionText || 'Continue'}</Text>
              </Pressable>
            )}
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 6,
  },
  message: {
    fontSize: 14,
    lineHeight: 20,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 16,
  },
  actionBtn: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
  },
  primaryBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
  },
  primaryText: {
    fontSize: 14,
    fontWeight: '700',
  },
});

export default AnimatedModal;
