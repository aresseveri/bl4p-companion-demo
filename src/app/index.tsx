/**
 * Onboarding.
 *
 * A guided setup that ends with the email ask. The order is deliberate: by
 * the time we ask, they have named their pet, entered its weight, picked
 * their remedy and seen a dose computed from the label. Asking first, before
 * any of that, both converts worse and risks App Store guideline 5.1.1(v),
 * which says apps may not require personal information to function.
 *
 * The email step is skippable for that reason. It keeps the app usable
 * without an address, which is what 5.1.1(v) actually asks for.
 */

import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  KeyboardAvoidingView,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BLButton } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { BLText } from '@/components/ui/text';
import { productById, productsForSpecies, type Species } from '@/constants/products';
import { brand, color, font, radius, shadow, space, type } from '@/constants/theme';
import { doseFor } from '@/lib/dosing';
import { imgSource } from '@/lib/img';
import { schedulePetReminder } from '@/lib/reminders';
import { useDemo } from '@/lib/store';

const LOGO = require('../../assets/brand/logo-horizontal.webp');
const HERO =
  'https://www.bestlife4pets.com/cdn/shop/files/Picture_Hero_8f_png.jpg?v=1763029839&width=1200';

const TERMS_URL = 'https://www.bestlife4pets.com/en-us/pages/terms-of-service';
const PRIVACY_URL = 'https://www.bestlife4pets.com/en-us/pages/privacy-policy';

const TRUST = brand.trust.filter((t) =>
  ['Made in USA', '60-Day Guarantee', 'Vet-Approved'].includes(t.label),
);

type Step =
  | 'welcome'
  | 'disclaimer'
  | 'name'
  | 'about'
  | 'product'
  | 'photo'
  | 'reminder'
  | 'email';

/** Steps that show the progress bar, in order. */
const FLOW: Step[] = ['name', 'about', 'product', 'photo', 'reminder', 'email'];

export default function Onboarding() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { pet, setPet, set, email } = useDemo();
  const [step, setStep] = useState<Step>('welcome');

  const idx = FLOW.indexOf(step);
  const progress = idx < 0 ? 0 : (idx + 1) / FLOW.length;

  const go = (next: Step) => setStep(next);

  const finish = (withEmail: boolean) => {
    set({ onboarded: true, marketingOptIn: withEmail });
    if (pet.reminderOn) schedulePetReminder(pet).catch(() => {});
    router.replace('/home');
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {idx >= 0 ? (
        <View style={[styles.progressWrap, { paddingTop: insets.top + space.x3 }]}>
          <Pressable
            onPress={() => go(idx === 0 ? 'welcome' : FLOW[idx - 1])}
            hitSlop={12}
            style={styles.backBtn}
            accessibilityLabel="Go back"
            accessibilityRole="button"
          >
            <Icon name="chevron-left" size={20} color={color.navy} />
          </Pressable>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
          </View>
          <BLText variant="meta" size={12} style={styles.progressCount}>
            {idx + 1}/{FLOW.length}
          </BLText>
        </View>
      ) : null}

      <ScrollView
        style={styles.flex}
        contentContainerStyle={[
          styles.scroll,
          {
            paddingTop: idx >= 0 ? space.x6 : insets.top + space.x5,
            paddingBottom: insets.bottom + space.x10,
          },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {step === 'welcome' && (
          <StepWelcome onNext={() => go('disclaimer')} />
        )}

        {step === 'disclaimer' && (
          <StepDisclaimer
            onNext={() => {
              set({ disclaimerAccepted: true });
              go('name');
            }}
          />
        )}

        {step === 'name' && (
          <StepName pet={pet} setPet={setPet} onNext={() => go('about')} />
        )}

        {step === 'about' && (
          <StepAbout pet={pet} setPet={setPet} onNext={() => go('product')} />
        )}

        {step === 'product' && (
          <StepProduct pet={pet} setPet={setPet} onNext={() => go('photo')} />
        )}

        {step === 'photo' && (
          <StepPhoto pet={pet} setPet={setPet} onNext={() => go('reminder')} />
        )}

        {step === 'reminder' && (
          <StepReminder pet={pet} setPet={setPet} onNext={() => go('email')} />
        )}

        {step === 'email' && (
          <StepEmail
            email={email}
            onEmail={(v) => set({ email: v })}
            petName={pet.name || 'Your pet'}
            onFinish={finish}
          />
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

/* ------------------------------------------------------------------ */

type PetProps = {
  pet: ReturnType<typeof useDemo>['pet'];
  setPet: ReturnType<typeof useDemo>['setPet'];
  onNext: () => void;
};

function StepWelcome({ onNext }: { onNext: () => void }) {
  return (
    <View>
      <Image source={LOGO} style={styles.logo} contentFit="contain" transition={200} />
      <View style={styles.heroWrap}>
        <Image source={{ uri: HERO }} style={styles.hero} contentFit="cover" transition={250} />
      </View>
      <BLText variant="eyebrow" center style={styles.eyebrow}>
        {brand.eyebrow}
      </BLText>
      <BLText variant="display" center size={type.h1} style={styles.tagline}>
        {brand.tagline}
      </BLText>
      <BLText variant="body" center tone="textMuted" style={styles.sub}>
        Track every dose, watch the change, and never run out. Setting up takes
        about a minute.
      </BLText>
      <BLButton label="Get started" onPress={onNext} style={styles.cta} />
      <BLText variant="meta" center tone="textFaint" style={styles.note}>
        No account needed. Everything stays on your phone.
      </BLText>
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
      <BLText variant="meta" center tone="textFaint" style={styles.note}>
        {brand.socialProof}
      </BLText>
    </View>
  );
}

/** Guideline 1.4.1 territory: say plainly what this is and is not. */
function StepDisclaimer({ onNext }: { onNext: () => void }) {
  return (
    <View>
      <View style={styles.disclaimerIcon}>
        <Icon name="info" size={26} color={color.navy} />
      </View>
      <BLText variant="display" center size={type.h2} style={styles.stepTitle}>
        Before we start
      </BLText>
      <BLText variant="body" center tone="textMuted" style={styles.sub}>
        This app shows the dosing printed on your BestLife4Pets label for your
        pet{'’'}s weight, and helps you keep track of it. It is not veterinary
        advice and it cannot diagnose anything.
      </BLText>
      <BLText variant="body" center tone="textMuted" style={styles.sub}>
        Always talk to your vet about your pet{'’'}s health, especially if they
        are on other medication or something changes.
      </BLText>
      <BLButton label="I understand" onPress={onNext} style={styles.cta} />
    </View>
  );
}

function StepName({ pet, setPet, onNext }: PetProps) {
  return (
    <View>
      <BLText variant="display" size={type.h2} style={styles.stepTitle}>
        Who are we caring for?
      </BLText>
      <BLText variant="body" tone="textMuted" style={styles.stepSub}>
        Start with their name.
      </BLText>
      <Field
        label="Name"
        value={pet.name}
        onChangeText={(v) => setPet({ name: v })}
        placeholder="Rosie"
      />
      <View style={styles.speciesRow}>
        {(['dog', 'cat'] as Species[]).map((s) => {
          const on = pet.species === s;
          return (
            <Pressable
              key={s}
              onPress={() => {
                const valid = productsForSpecies(s);
                const keeps = valid.some((p) => p.id === pet.productId);
                setPet({
                  species: s,
                  ...(keeps ? {} : { productId: valid[0]?.id ?? pet.productId }),
                });
              }}
              style={[styles.speciesCard, on && styles.speciesCardOn]}
              accessibilityRole="radio"
              accessibilityState={{ selected: on }}
            >
              <Icon name="paw" size={26} color={on ? color.onAccent : color.textFaint} />
              <BLText
                variant="label"
                size={type.sm}
                style={{
                  color: on ? color.onAccent : color.textMuted,
                  marginTop: space.x2,
                }}
              >
                {s === 'dog' ? 'Dog' : 'Cat'}
              </BLText>
            </Pressable>
          );
        })}
      </View>
      <BLButton label="Next" onPress={onNext} disabled={!pet.name.trim()} style={styles.cta} />
    </View>
  );
}

function StepAbout({ pet, setPet, onNext }: PetProps) {
  return (
    <View>
      <BLText variant="display" size={type.h2} style={styles.stepTitle}>
        Tell us about {pet.name}
      </BLText>
      <BLText variant="body" tone="textMuted" style={styles.stepSub}>
        Weight is what decides the dose, so it matters most.
      </BLText>
      <Field
        label="Breed"
        value={pet.breed}
        onChangeText={(v) => setPet({ breed: v })}
        placeholder={pet.species === 'dog' ? 'English Bulldog' : 'Domestic Shorthair'}
      />
      <View style={styles.pair}>
        <View style={styles.pairItem}>
          <Field
            label="Weight (lbs)"
            value={pet.weightLb ? String(pet.weightLb) : ''}
            onChangeText={(v) => setPet({ weightLb: Number(v.replace(/[^0-9]/g, '')) || 0 })}
            placeholder="52"
            keyboardType="number-pad"
          />
        </View>
        <View style={styles.pairGap} />
        <View style={styles.pairItem}>
          <Field
            label="Birth year"
            value={pet.birthYear ? String(pet.birthYear) : ''}
            onChangeText={(v) => setPet({ birthYear: Number(v.replace(/[^0-9]/g, '')) || 0 })}
            placeholder="2018"
            keyboardType="number-pad"
            maxLength={4}
          />
        </View>
      </View>
      <BLButton label="Next" onPress={onNext} disabled={!pet.weightLb} style={styles.cta} />
    </View>
  );
}

function StepProduct({ pet, setPet, onNext }: PetProps) {
  const available = productsForSpecies(pet.species);
  return (
    <View>
      <BLText variant="display" size={type.h2} style={styles.stepTitle}>
        Which one did you buy?
      </BLText>
      <BLText variant="body" tone="textMuted" style={styles.stepSub}>
        We{'’'}ll read the dose off that label.
      </BLText>
      <View style={styles.picker}>
        {available.map((p) => {
          const on = pet.productId === p.id;
          return (
            <Pressable
              key={p.id}
              onPress={() => setPet({ productId: p.id })}
              accessibilityRole="radio"
              accessibilityState={{ selected: on }}
              style={[styles.product, on && styles.productOn]}
            >
              <Image
                source={{ uri: p.image }}
                style={styles.productImg}
                contentFit="contain"
                transition={180}
              />
              <View style={styles.productText}>
                <BLText variant="title" size={12} numberOfLines={2}>
                  {p.shortName}
                </BLText>
                <BLText variant="meta" size={12} style={styles.productPrice}>
                  ${p.price.toFixed(2)}
                </BLText>
              </View>
              <View style={[styles.radio, on && styles.radioOn]}>
                {on ? <Icon name="check" size={13} color={color.onAccent} /> : null}
              </View>
            </Pressable>
          );
        })}
      </View>
      <BLButton label="Next" onPress={onNext} style={styles.cta} />
    </View>
  );
}

function StepPhoto({ pet, setPet, onNext }: PetProps) {
  const pick = async (fromCamera: boolean) => {
    if (fromCamera) {
      const perm = await ImagePicker.requestCameraPermissionsAsync();
      if (!perm.granted) return;
    }
    const fn = fromCamera ? ImagePicker.launchCameraAsync : ImagePicker.launchImageLibraryAsync;
    const res = await fn({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!res.canceled && res.assets[0]?.uri) setPet({ photo: res.assets[0].uri });
  };

  return (
    <View>
      <BLText variant="display" center size={type.h2} style={styles.stepTitle}>
        Add a photo of {pet.name}
      </BLText>
      <BLText variant="body" center tone="textMuted" style={styles.stepSub}>
        This becomes the first entry in their progress timeline. Optional.
      </BLText>
      <View style={styles.avatarWrap}>
        {pet.photo ? (
          <Image
            source={imgSource(pet.photo)}
            style={styles.avatar}
            contentFit="cover"
            transition={200}
          />
        ) : (
          <View style={[styles.avatar, styles.avatarEmpty]}>
            <Icon name="paw" size={40} color={color.textFaint} />
          </View>
        )}
      </View>
      <View style={styles.photoBtns}>
        <BLButton
          label="Take a photo"
          variant="navy"
          onPress={() => pick(true)}
          left={<Icon name="camera" size={17} color={color.white} />}
        />
        <BLButton label="Choose from library" variant="outline" onPress={() => pick(false)} />
      </View>
      <BLButton
        label={pet.photo ? 'Next' : 'Skip for now'}
        onPress={onNext}
        style={styles.cta}
      />
    </View>
  );
}

function StepReminder({ pet, setPet, onNext }: PetProps) {
  const dose = useMemo(() => {
    const p = productById(pet.productId);
    return p ? doseFor(p, pet) : null;
  }, [pet]);

  const times = useMemo(() => {
    const out: number[] = [];
    for (let h = 6; h <= 21; h++) out.push(h);
    return out;
  }, []);

  return (
    <View>
      <BLText variant="display" size={type.h2} style={styles.stepTitle}>
        When should we remind you?
      </BLText>

      {/* The payoff. They see the label dose before we ask for anything. */}
      {dose ? (
        <View style={styles.dosePreview}>
          <BLText variant="eyebrow" style={{ color: color.badgeBlue }}>
            {pet.name}
            {'’'}s dose
          </BLText>
          <BLText variant="display" size={26} style={styles.doseBig}>
            {dose.text}
          </BLText>
          <BLText variant="meta" size={12}>
            From your label, for {dose.bandLabel.toLowerCase()}
          </BLText>
        </View>
      ) : (
        <View style={styles.stepSub} />
      )}

      <View style={styles.timeGrid}>
        {times.map((h) => {
          const on = pet.reminder.hour === h;
          return (
            <Pressable
              key={h}
              onPress={() => setPet({ reminder: { hour: h, minute: 0 }, reminderOn: true })}
              style={[styles.timeChip, on && styles.timeChipOn]}
            >
              <BLText
                variant="label"
                size={type.sm}
                style={{ color: on ? color.onAccent : color.textMuted }}
              >
                {fmtHour(h)}
              </BLText>
            </Pressable>
          );
        })}
      </View>

      <Pressable
        onPress={() => setPet({ reminderOn: !pet.reminderOn })}
        style={styles.toggleRow}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: pet.reminderOn }}
      >
        <View style={[styles.checkbox, pet.reminderOn && styles.checkboxOn]}>
          {pet.reminderOn ? <Icon name="check" size={13} color={color.onAccent} /> : null}
        </View>
        <BLText variant="body" size={type.sm} style={styles.toggleText}>
          Remind me daily at {fmtHour(pet.reminder.hour)}
        </BLText>
      </Pressable>

      <BLButton label="Next" onPress={onNext} style={styles.cta} />
    </View>
  );
}

/** The email step. Last on purpose. */
function StepEmail({
  email,
  onEmail,
  petName,
  onFinish,
}: {
  email: string;
  onEmail: (v: string) => void;
  petName: string;
  onFinish: (withEmail: boolean) => void;
}) {
  const [focused, setFocused] = useState(false);
  const fade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fade, { toValue: 1, duration: 320, useNativeDriver: true }).start();
  }, [fade]);

  const has = email.trim().length > 0;

  return (
    <Animated.View style={{ opacity: fade }}>
      <View style={styles.doneIcon}>
        <Icon name="check" size={26} color={color.success} />
      </View>
      <BLText variant="display" center size={type.h2} style={styles.stepTitle}>
        {petName} is all set
      </BLText>
      <BLText variant="body" center tone="textMuted" style={styles.stepSub}>
        Where should we send {petName}
        {'’'}s care plan? We{'’'}ll include the dosing schedule and a nudge
        before the bottle runs out.
      </BLText>

      <View style={styles.field}>
        <BLText variant="eyebrow" style={styles.label}>
          Email
        </BLText>
        <TextInput
          value={email}
          onChangeText={onEmail}
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

      <BLButton
        label={has ? 'Send my care plan' : 'Continue'}
        onPress={() => onFinish(has)}
        style={styles.cta}
      />

      <BLText variant="meta" size={12} center tone="textFaint" style={styles.consent}>
        By continuing you agree to our{' '}
        <BLText
          variant="meta"
          size={12}
          style={styles.legalLink}
          onPress={() => Linking.openURL(TERMS_URL)}
        >
          Terms
        </BLText>{' '}
        and{' '}
        <BLText
          variant="meta"
          size={12}
          style={styles.legalLink}
          onPress={() => Linking.openURL(PRIVACY_URL)}
        >
          Privacy Policy
        </BLText>
        , and to get care tips and offers for your pet by email. Unsubscribe any
        time.
      </BLText>

      {/*
        Skippable on purpose. A hard email wall risks App Store guideline
        5.1.1(v), which says an app may not require personal information to
        function, and it converts worse than asking after the value landed.
      */}
      <Pressable onPress={() => onFinish(false)} style={styles.skip} hitSlop={10}>
        <BLText variant="meta" center style={{ color: color.textMuted }}>
          Skip for now
        </BLText>
      </Pressable>
    </Animated.View>
  );
}

/* ------------------------------------------------------------------ */

function Field({
  label,
  ...input
}: { label: string } & React.ComponentProps<typeof TextInput>) {
  const [focused, setFocused] = useState(false);
  return (
    <View style={styles.field}>
      <BLText variant="eyebrow" style={styles.label}>
        {label}
      </BLText>
      <TextInput
        {...input}
        onFocus={(e) => {
          setFocused(true);
          input.onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocused(false);
          input.onBlur?.(e);
        }}
        placeholderTextColor={color.textFaint}
        style={[styles.input, focused && styles.inputFocused]}
      />
    </View>
  );
}

function fmtHour(h: number) {
  const ampm = h < 12 ? 'am' : 'pm';
  const n = h % 12 === 0 ? 12 : h % 12;
  return `${n}${ampm}`;
}

const AVATAR = 120;

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: color.bg },
  scroll: { paddingHorizontal: space.x6 },

  progressWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: space.x5,
    paddingBottom: space.x3,
  },
  backBtn: { width: 32 },
  progressTrack: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    backgroundColor: color.border,
    overflow: 'hidden',
  },
  progressFill: { height: 4, borderRadius: 2, backgroundColor: color.accent },
  progressCount: { width: 34, textAlign: 'right' },

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
  sub: { marginTop: space.x3 },
  note: { marginTop: space.x3 },

  disclaimerIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: color.warningBg,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginTop: space.x6,
    marginBottom: space.x5,
  },
  doneIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: color.successBg,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginTop: space.x4,
    marginBottom: space.x5,
  },

  stepTitle: { color: color.navy, marginTop: space.x2 },
  stepSub: { marginTop: space.x2, marginBottom: space.x6 },

  field: { marginBottom: space.x4 },
  label: { marginBottom: space.x2 },
  input: {
    height: 50,
    borderRadius: radius.input,
    borderWidth: 1,
    borderColor: color.border,
    backgroundColor: color.surface,
    paddingHorizontal: space.x5,
    fontFamily: font.body,
    fontSize: type.base,
    color: color.text,
  },
  inputFocused: { borderColor: color.badgeBlue, borderWidth: 2 },

  speciesRow: { flexDirection: 'row', gap: space.x3, marginTop: space.x2 },
  speciesCard: {
    flex: 1,
    paddingVertical: space.x5,
    borderRadius: radius.card,
    backgroundColor: color.surface,
    borderWidth: 2,
    borderColor: 'transparent',
    alignItems: 'center',
    ...shadow.sm,
  },
  speciesCardOn: { backgroundColor: color.accent, borderColor: color.accent },

  pair: { flexDirection: 'row' },
  pairItem: { flex: 1 },
  pairGap: { width: space.x4 },

  picker: { gap: space.x3 },
  product: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: color.surface,
    borderRadius: radius.card,
    borderWidth: 2,
    borderColor: 'transparent',
    padding: space.x3,
    ...shadow.sm,
  },
  productOn: { borderColor: color.accent },
  productImg: { width: 46, height: 46, borderRadius: radius.sm, backgroundColor: color.bgAlt },
  productText: { flex: 1, marginLeft: space.x3 },
  productPrice: { marginTop: 2, color: color.textMuted },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: color.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOn: { backgroundColor: color.accent, borderColor: color.accent },

  avatarWrap: { alignSelf: 'center', marginBottom: space.x5 },
  avatar: {
    width: AVATAR,
    height: AVATAR,
    borderRadius: AVATAR / 2,
    backgroundColor: color.bgAlt,
  },
  avatarEmpty: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: color.border,
    borderStyle: 'dashed',
  },
  photoBtns: { gap: space.x3 },

  dosePreview: {
    backgroundColor: color.surface,
    borderRadius: radius.card,
    padding: space.x5,
    marginTop: space.x2,
    marginBottom: space.x6,
    ...shadow.sm,
  },
  doseBig: { color: color.navy, marginVertical: space.x1 },

  timeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: space.x2 },
  timeChip: {
    paddingHorizontal: space.x4,
    paddingVertical: space.x3,
    borderRadius: radius.pill,
    backgroundColor: color.bgAlt,
    borderWidth: 1,
    borderColor: color.border,
  },
  timeChipOn: { backgroundColor: color.accent, borderColor: color.accent },

  toggleRow: { flexDirection: 'row', alignItems: 'center', marginTop: space.x5 },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: radius.xs,
    borderWidth: 2,
    borderColor: color.border,
    backgroundColor: color.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxOn: { backgroundColor: color.accent, borderColor: color.accent },
  toggleText: { flex: 1, marginLeft: space.x3 },

  cta: { marginTop: space.x6 },
  consent: { marginTop: space.x4, lineHeight: 17, paddingHorizontal: space.x2 },
  legalLink: { color: color.link, textDecorationLine: 'underline' },
  skip: { marginTop: space.x5, paddingVertical: space.x2 },

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
});
