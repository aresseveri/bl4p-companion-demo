/**
 * Screen 1 — Welcome / email gate.
 *
 * Commercially the most important screen, so it carries her real logo, her
 * real lifestyle hero, her tagline verbatim, and her trust markers verbatim.
 * "Continue" advances on any input. No validation, no account, no network.
 */

import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BLButton } from '@/components/ui/button';
import { BLText } from '@/components/ui/text';
import { brand, color, font, radius, shadow, space, type } from '@/constants/theme';
import { useDemo } from '@/lib/store';

const LOGO = require('../../assets/brand/logo-horizontal.webp');

/** Her own lifestyle hero image, straight off her CDN. */
const HERO =
  'https://www.bestlife4pets.com/cdn/shop/files/Picture_Hero_8f_png.jpg?v=1763029839&width=1200';

/** The three trust markers she leads with. Wording is hers. */
const TRUST = brand.trust.filter((t) =>
  ['Made in USA', '60-Day Guarantee', 'Vet-Approved'].includes(t.label),
);

export default function Welcome() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { email, marketingOptIn, set } = useDemo();
  const [focused, setFocused] = useState(false);

  const onContinue = () => {
    set({ onboarded: true });
    router.push('/pet-profile');
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        style={styles.flex}
        contentContainerStyle={[
          styles.scroll,
          { paddingTop: insets.top + space.x5, paddingBottom: insets.bottom + space.x8 },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Image source={LOGO} style={styles.logo} contentFit="contain" transition={200} />

        <View style={styles.heroWrap}>
          <Image
            source={{ uri: HERO }}
            style={styles.hero}
            contentFit="cover"
            transition={250}
          />
        </View>

        <BLText variant="eyebrow" center style={styles.eyebrow}>
          {brand.eyebrow}
        </BLText>

        {/* Her tagline, verbatim. */}
        <BLText variant="display" center size={type.h1} style={styles.tagline}>
          {brand.tagline}
        </BLText>

        <BLText variant="body" center tone="textMuted" style={styles.sub}>
          Track every dose, watch the change, and never run out. Made for the pet
          parents who already trust us with their best friend.
        </BLText>

        {/* Email */}
        <View style={styles.field}>
          <BLText variant="eyebrow" style={styles.fieldLabel}>
            Email
          </BLText>
          <TextInput
            value={email}
            onChangeText={(v) => set({ email: v })}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder="you@example.com"
            placeholderTextColor={color.textFaint}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            inputMode="email"
            style={[styles.input, focused && styles.inputFocused]}
          />
        </View>

        {/* Marketing consent, unchecked by default. */}
        <Pressable
          accessibilityRole="checkbox"
          accessibilityState={{ checked: marketingOptIn }}
          onPress={() => set({ marketingOptIn: !marketingOptIn })}
          style={styles.consent}
          hitSlop={8}
        >
          <View style={[styles.box, marketingOptIn && styles.boxOn]}>
            {marketingOptIn ? <Check /> : null}
          </View>
          <BLText variant="meta" style={styles.consentText}>
            Email me care tips and offers for my pet{'’'}s health. You can
            unsubscribe any time.
          </BLText>
        </Pressable>

        <BLButton label="Continue" onPress={onContinue} style={styles.cta} />

        <BLText variant="meta" center tone="textFaint" style={styles.noAccount}>
          No account needed. Nothing leaves your phone.
        </BLText>

        {/* Trust markers, her wording. */}
        <View style={styles.trust}>
          {TRUST.map((t, i) => (
            <View key={t.label} style={styles.trustItem}>
              {i > 0 ? <View style={styles.trustDot} /> : null}
              <BLText variant="label" size={type.xs} center style={styles.trustLabel}>
                {t.label}
              </BLText>
            </View>
          ))}
        </View>

        <BLText variant="meta" center tone="textFaint" style={styles.proof}>
          {brand.socialProof}
        </BLText>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

/** Small tick, drawn rather than pulled from an icon font. */
function Check() {
  return (
    <View style={checkStyles.wrap}>
      <View style={checkStyles.short} />
      <View style={checkStyles.long} />
    </View>
  );
}

const checkStyles = StyleSheet.create({
  wrap: { width: 12, height: 12, transform: [{ rotate: '-45deg' }], marginTop: -2 },
  short: {
    position: 'absolute',
    left: 0,
    bottom: 0,
    width: 2,
    height: 6,
    backgroundColor: color.onAccent,
    borderRadius: 1,
  },
  long: {
    position: 'absolute',
    left: 0,
    bottom: 0,
    width: 11,
    height: 2,
    backgroundColor: color.onAccent,
    borderRadius: 1,
  },
});

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: color.bg },
  scroll: { paddingHorizontal: space.x6 },

  logo: { width: 168, height: 38, alignSelf: 'center' },

  heroWrap: {
    marginTop: space.x6,
    borderRadius: radius.md,
    overflow: 'hidden',
    backgroundColor: color.bgAlt,
    ...shadow.base,
  },
  hero: { width: '100%', aspectRatio: 1200 / 348 },

  eyebrow: { marginTop: space.x8, color: color.badgeBlue },
  tagline: { marginTop: space.x2, color: color.navy },
  sub: { marginTop: space.x3, paddingHorizontal: space.x1 },

  field: { marginTop: space.x8 },
  fieldLabel: { marginBottom: space.x2 },
  input: {
    height: 50, // --input-height: 3.125rem
    borderRadius: radius.input, // --rounded-input: 0.5rem
    borderWidth: 1,
    borderColor: color.border,
    backgroundColor: color.surface,
    paddingHorizontal: space.x5, // --input-padding-inline
    fontFamily: font.body,
    fontSize: type.base,
    color: color.text,
  },
  inputFocused: { borderColor: color.badgeBlue, borderWidth: 2 },

  consent: { flexDirection: 'row', alignItems: 'flex-start', marginTop: space.x4 },
  box: {
    width: 22,
    height: 22,
    borderRadius: radius.xs,
    borderWidth: 2,
    borderColor: color.border,
    backgroundColor: color.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  boxOn: { backgroundColor: color.accent, borderColor: color.accent },
  consentText: { flex: 1, marginLeft: space.x3 },

  cta: { marginTop: space.x6 },
  noAccount: { marginTop: space.x3 },

  trust: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: space.x8,
    paddingTop: space.x5,
    borderTopWidth: 1,
    borderTopColor: color.borderSoft,
  },
  trustItem: { flexDirection: 'row', alignItems: 'center' },
  trustDot: {
    width: 3,
    height: 3,
    borderRadius: 2,
    backgroundColor: color.textFaint,
    marginHorizontal: space.x3,
  },
  trustLabel: { color: color.navy, letterSpacing: 0.2 },

  proof: { marginTop: space.x3 },
});
