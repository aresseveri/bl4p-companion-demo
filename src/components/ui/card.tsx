/**
 * Surfaces and page chrome shared across screens.
 * Radii and shadows come from her --rounded-* / --shadow-* scale.
 */

import { useRouter } from 'expo-router';
import type { ReactNode } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { color, radius, shadow, space } from '@/constants/theme';

import { Icon } from './icon';
import { BLText } from './text';

/** White surface with her card radius. */
export function Card({
  children,
  style,
  padded = true,
}: {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  padded?: boolean;
}) {
  return (
    <View style={[styles.card, padded && styles.cardPad, style]}>{children}</View>
  );
}

/** Small pill used for concern tags, exactly like the ones on her product cards. */
export function Tag({ label, tone = 'neutral' }: { label: string; tone?: 'neutral' | 'blue' | 'green' }) {
  const bg = { neutral: color.bgAlt, blue: '#EAF2FA', green: color.successBg }[tone];
  const fg = { neutral: color.textMuted, blue: color.badgeBlue, green: color.success }[tone];
  return (
    <View style={[styles.tag, { backgroundColor: bg }]}>
      <BLText variant="label" size={11} style={{ color: fg }}>
        {label}
      </BLText>
    </View>
  );
}

/** Section heading in her Futura, matching the h2 treatment on her site. */
export function SectionTitle({
  children,
  style,
}: {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View style={[styles.sectionTitle, style]}>
      <BLText variant="heading">{children}</BLText>
    </View>
  );
}

/** Screen header with an optional back chevron. */
export function ScreenHeader({
  title,
  back,
  right,
}: {
  title: string;
  back?: boolean;
  right?: ReactNode;
}) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.header, { paddingTop: insets.top + space.x3 }]}>
      {back ? (
        <Pressable
          onPress={() => router.back()}
          hitSlop={12}
          style={styles.headerBtn}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Icon name="chevron-left" size={22} color={color.navy} />
        </Pressable>
      ) : (
        <View style={styles.headerBtn} />
      )}
      <BLText variant="title" size={15} center style={styles.headerTitle} numberOfLines={1}>
        {title}
      </BLText>
      <View style={styles.headerBtn}>{right}</View>
    </View>
  );
}

/** Standard scrolling page body with her gutters. */
export function Page({
  children,
  contentStyle,
  /** Extra bottom padding so content clears the tab bar. */
  tabBarInset = true,
}: {
  children: ReactNode;
  contentStyle?: StyleProp<ViewStyle>;
  tabBarInset?: boolean;
}) {
  const insets = useSafeAreaInsets();
  return (
    <ScrollView
      style={styles.page}
      contentContainerStyle={[
        styles.pageContent,
        { paddingBottom: (tabBarInset ? 96 : space.x10) + insets.bottom },
        contentStyle,
      ]}
      showsVerticalScrollIndicator={false}
    >
      {children}
    </ScrollView>
  );
}

/** A row that reads as tappable, used for list navigation. */
export function RowLink({
  label,
  value,
  onPress,
}: {
  label: string;
  value?: string;
  onPress?: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={({ pressed }) => [styles.row, pressed && { opacity: 0.6 }]}
    >
      <BLText variant="body" style={styles.rowLabel}>
        {label}
      </BLText>
      {value ? (
        <BLText variant="meta" style={styles.rowValue}>
          {value}
        </BLText>
      ) : null}
      <Icon name="chevron-right" size={18} color={color.textFaint} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: color.surface,
    borderRadius: radius.card,
    ...shadow.sm,
  },
  cardPad: { padding: space.x5 },

  tag: {
    paddingHorizontal: space.x3,
    paddingVertical: 5,
    borderRadius: radius.pill,
    alignSelf: 'flex-start',
  },

  sectionTitle: { marginTop: space.x8, marginBottom: space.x4 },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: space.x4,
    paddingBottom: space.x3,
    backgroundColor: color.bg,
    borderBottomWidth: 1,
    borderBottomColor: color.borderSoft,
  },
  headerBtn: { width: 40, alignItems: 'flex-start' },
  headerTitle: { flex: 1, color: color.navy },

  page: { flex: 1, backgroundColor: color.bg },
  pageContent: { paddingHorizontal: space.x5, paddingTop: space.x5 },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: space.x4,
    borderBottomWidth: 1,
    borderBottomColor: color.borderSoft,
  },
  rowLabel: { flex: 1 },
  rowValue: { marginRight: space.x2 },
});
