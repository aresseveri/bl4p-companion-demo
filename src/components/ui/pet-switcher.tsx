/**
 * Household pet switcher.
 *
 * Multiple pets is the normal case and it is also the clearest answer to
 * App Store guideline 4.2: a one-pet product-manual app is thin, a household
 * medication tracker is not.
 */

import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { color, space } from '@/constants/theme';
import { imgSource } from '@/lib/img';
import { useDemo } from '@/lib/store';

import { Icon } from './icon';
import { BLText } from './text';

export function PetSwitcher() {
  const router = useRouter();
  const { pets, activePetId, setActivePet, addPet } = useDemo();

  if (pets.length === 0) return null;

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
    >
      {pets.map((p) => {
        const on = p.id === activePetId;
        const pending = !p.history[p.history.length - 1];
        return (
          <Pressable
            key={p.id}
            onPress={() => setActivePet(p.id)}
            style={styles.item}
            accessibilityRole="tab"
            accessibilityState={{ selected: on }}
          >
            <View style={[styles.avatarRing, on && styles.avatarRingOn]}>
              {p.photo ? (
                <Image
                  source={imgSource(p.photo)}
                  style={styles.avatar}
                  contentFit="cover"
                  transition={150}
                />
              ) : (
                <View style={[styles.avatar, styles.avatarEmpty]}>
                  <Icon name="paw" size={20} color={color.textFaint} />
                </View>
              )}
              {/* A dot when today's dose is still open. */}
              {pending ? <View style={styles.dot} /> : null}
            </View>
            <BLText
              variant="label"
              size={11}
              center
              style={{ color: on ? color.navy : color.textMuted, marginTop: space.x1 }}
              numberOfLines={1}
            >
              {p.name || 'New'}
            </BLText>
          </Pressable>
        );
      })}

      <Pressable
        onPress={() => {
          addPet();
          router.push('/');
        }}
        style={styles.item}
        accessibilityRole="button"
        accessibilityLabel="Add a pet"
      >
        <View style={[styles.avatarRing, styles.addRing]}>
          <Icon name="plus" size={20} color={color.navy} />
        </View>
        <BLText variant="label" size={11} center style={styles.addLabel}>
          Add
        </BLText>
      </Pressable>
    </ScrollView>
  );
}

const SIZE = 52;

const styles = StyleSheet.create({
  row: { gap: space.x4, paddingVertical: space.x1, paddingRight: space.x5 },
  item: { alignItems: 'center', width: 60 },
  avatarRing: {
    width: SIZE + 6,
    height: SIZE + 6,
    borderRadius: (SIZE + 6) / 2,
    borderWidth: 2,
    borderColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarRingOn: { borderColor: color.accent },
  avatar: { width: SIZE, height: SIZE, borderRadius: SIZE / 2, backgroundColor: color.bgAlt },
  avatarEmpty: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: color.border,
  },
  addRing: {
    borderColor: color.border,
    borderStyle: 'dashed',
    backgroundColor: color.bgAlt,
  },
  addLabel: { color: color.textMuted, marginTop: space.x1 },
  dot: {
    position: 'absolute',
    right: 2,
    top: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: color.accent,
    borderWidth: 2,
    borderColor: color.bg,
  },
});

export default PetSwitcher;
