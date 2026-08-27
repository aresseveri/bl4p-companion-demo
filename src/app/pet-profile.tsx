/**
 * Screen 2 — Pet profile.
 *
 * Name, species, breed, weight, birth year, and which SKU they bought.
 * Photo upload is optional and stays on the device.
 */

import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
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
import { Card } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { BLText } from '@/components/ui/text';
import { PRODUCTS, productsForSpecies, type Species } from '@/constants/products';
import { color, font, radius, shadow, space, type } from '@/constants/theme';
import { imgSource } from '@/lib/img';
import { useDemo } from '@/lib/store';

export default function PetProfile() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { pet, setPet } = useDemo();
  const [focus, setFocus] = useState<string | null>(null);

  /** Only offer SKUs her label actually covers for this species. */
  const available = useMemo(() => productsForSpecies(pet.species), [pet.species]);

  const onSpecies = (s: Species) => {
    const patch: Parameters<typeof setPet>[0] = { species: s };
    // If the current product is not sold for the new species, move to one that is.
    const stillValid = PRODUCTS.find((p) => p.id === pet.productId)?.species.includes(s);
    if (!stillValid) patch.productId = productsForSpecies(s)[0]?.id ?? pet.productId;
    setPet(patch);
  };

  const pickPhoto = async () => {
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!res.canceled && res.assets[0]?.uri) setPet({ photo: res.assets[0].uri });
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
          { paddingTop: insets.top + space.x6, paddingBottom: insets.bottom + space.x10 },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <BLText variant="display" center style={styles.h1}>
          Tell us about your pet
        </BLText>
        <BLText variant="body" center tone="textMuted" style={styles.sub}>
          We use this to work out the right dose from the label. Nothing here
          leaves your phone.
        </BLText>

        {/* Photo */}
        <Pressable onPress={pickPhoto} style={styles.avatarWrap} accessibilityRole="button">
          {pet.photo ? (
            <Image source={imgSource(pet.photo)} style={styles.avatar} contentFit="cover" transition={200} />
          ) : (
            <View style={[styles.avatar, styles.avatarEmpty]}>
              <Icon name="paw" size={34} color={color.textFaint} />
            </View>
          )}
          <View style={styles.avatarBadge}>
            <Icon name="camera" size={15} color={color.onAccent} />
          </View>
        </Pressable>
        <BLText variant="meta" center tone="textFaint" style={styles.photoHint}>
          Add a photo (optional)
        </BLText>

        <Card style={styles.form}>
          <Field
            label="Name"
            value={pet.name}
            onChangeText={(v) => setPet({ name: v })}
            placeholder="Your pet’s name"
            focused={focus === 'name'}
            onFocus={() => setFocus('name')}
            onBlur={() => setFocus(null)}
          />

          {/* Species */}
          <View style={styles.field}>
            <BLText variant="eyebrow" style={styles.label}>
              Dog or cat
            </BLText>
            <View style={styles.segment}>
              {(['dog', 'cat'] as Species[]).map((s) => {
                const on = pet.species === s;
                return (
                  <Pressable
                    key={s}
                    onPress={() => onSpecies(s)}
                    accessibilityRole="radio"
                    accessibilityState={{ selected: on }}
                    style={[styles.segmentItem, on && styles.segmentItemOn]}
                  >
                    <BLText
                      variant="label"
                      size={type.sm}
                      style={{ color: on ? color.onAccent : color.textMuted }}
                    >
                      {s === 'dog' ? 'Dog' : 'Cat'}
                    </BLText>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <Field
            label="Breed"
            value={pet.breed}
            onChangeText={(v) => setPet({ breed: v })}
            placeholder="e.g. English Bulldog"
            focused={focus === 'breed'}
            onFocus={() => setFocus('breed')}
            onBlur={() => setFocus(null)}
          />

          <View style={styles.pair}>
            <View style={styles.pairItem}>
              <Field
                label="Weight (lbs)"
                value={String(pet.weightLb)}
                onChangeText={(v) => setPet({ weightLb: Number(v.replace(/[^0-9]/g, '')) || 0 })}
                placeholder="52"
                keyboardType="number-pad"
                focused={focus === 'weight'}
                onFocus={() => setFocus('weight')}
                onBlur={() => setFocus(null)}
              />
            </View>
            <View style={styles.pairGap} />
            <View style={styles.pairItem}>
              <Field
                label="Birth year"
                value={String(pet.birthYear)}
                onChangeText={(v) => setPet({ birthYear: Number(v.replace(/[^0-9]/g, '')) || 0 })}
                placeholder="2018"
                keyboardType="number-pad"
                maxLength={4}
                focused={focus === 'year'}
                onFocus={() => setFocus('year')}
                onBlur={() => setFocus(null)}
              />
            </View>
          </View>
        </Card>

        {/* Product picker */}
        <BLText variant="eyebrow" style={styles.pickerLabel}>
          Which one did you buy?
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

        <BLButton
          label={`Continue`}
          onPress={() => router.replace('/home')}
          style={styles.cta}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

/** One labelled text input, styled from her --input-* tokens. */
function Field({
  label,
  focused,
  ...input
}: {
  label: string;
  focused?: boolean;
} & React.ComponentProps<typeof TextInput>) {
  return (
    <View style={styles.field}>
      <BLText variant="eyebrow" style={styles.label}>
        {label}
      </BLText>
      <TextInput
        {...input}
        placeholderTextColor={color.textFaint}
        style={[styles.input, focused && styles.inputFocused]}
      />
    </View>
  );
}

const AVATAR = 104;

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: color.bg },
  scroll: { paddingHorizontal: space.x5 },

  h1: { color: color.navy },
  sub: { marginTop: space.x2, paddingHorizontal: space.x2 },

  avatarWrap: { alignSelf: 'center', marginTop: space.x6 },
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
  avatarBadge: {
    position: 'absolute',
    right: -2,
    bottom: -2,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: color.accent,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: color.bg,
  },
  photoHint: { marginTop: space.x2 },

  form: { marginTop: space.x6 },

  field: { marginBottom: space.x4 },
  label: { marginBottom: space.x2 },
  input: {
    height: 46,
    borderRadius: radius.input,
    borderWidth: 1,
    borderColor: color.border,
    backgroundColor: color.bg,
    paddingHorizontal: space.x4,
    fontFamily: font.body,
    fontSize: type.base,
    color: color.text,
  },
  inputFocused: { borderColor: color.badgeBlue, borderWidth: 2 },

  segment: {
    flexDirection: 'row',
    backgroundColor: color.bgAlt,
    borderRadius: radius.pill,
    padding: 4,
  },
  segmentItem: {
    flex: 1,
    height: 38,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentItemOn: { backgroundColor: color.accent },

  pair: { flexDirection: 'row' },
  pairItem: { flex: 1 },
  pairGap: { width: space.x4 },

  pickerLabel: { marginTop: space.x8, marginBottom: space.x3 },
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
  productImg: {
    width: 46,
    height: 46,
    borderRadius: radius.sm,
    backgroundColor: color.bgAlt,
  },
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

  cta: { marginTop: space.x8 },
});
