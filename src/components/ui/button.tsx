/**
 * Her button, rebuilt from computed styles on the live site:
 *   border-radius 60px, background #FCCC10, color #4D4D4D,
 *   Helvetica 700 uppercase 16px, padding 16px 32px.
 */

import { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { button, color, font, radius, space, type } from '@/constants/theme';

type Variant = 'primary' | 'navy' | 'outline' | 'ghost';

export interface BLButtonProps {
  label: string;
  onPress?: () => void;
  variant?: Variant;
  disabled?: boolean;
  loading?: boolean;
  full?: boolean;
  style?: StyleProp<ViewStyle>;
  /** Optional element rendered to the left of the label. */
  left?: React.ReactNode;
}

export function BLButton({
  label,
  onPress,
  variant = 'primary',
  disabled,
  loading,
  full = true,
  style,
  left,
}: BLButtonProps) {
  const [pressed, setPressed] = useState(false);

  const bg = {
    primary: color.accent,
    navy: color.navy,
    outline: 'transparent',
    ghost: 'transparent',
  }[variant];

  const fg = {
    primary: color.onAccent,
    navy: color.white,
    outline: color.navy,
    ghost: color.textMuted,
  }[variant];

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: !!disabled, busy: !!loading }}
      onPress={disabled || loading ? undefined : onPress}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      style={[
        styles.base,
        { backgroundColor: bg },
        variant === 'outline' && styles.outline,
        full && styles.full,
        // Her theme dims buttons via --button-background-opacity on hover.
        pressed && !disabled && { opacity: 0.85, transform: [{ scale: 0.985 }] },
        disabled && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={fg} />
      ) : (
        <View style={styles.row}>
          {left ? <View style={styles.left}>{left}</View> : null}
          <Text style={[styles.label, { color: fg }]} numberOfLines={1}>
            {label}
          </Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: button.height,
    paddingHorizontal: button.paddingH,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  full: { alignSelf: 'stretch' },
  outline: { borderWidth: 2, borderColor: color.navy },
  disabled: { opacity: 0.45 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  left: { marginRight: space.x2 },
  label: {
    fontFamily: font.body,
    fontWeight: button.fontWeight,
    fontSize: type.base,
    textTransform: button.textTransform,
    textAlign: 'center',
  },
});

export default BLButton;
