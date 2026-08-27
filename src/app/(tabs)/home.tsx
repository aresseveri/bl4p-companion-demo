/**
 * Home.
 *
 * Pet switcher, today's dose with a big "Mark as given", adherence streak,
 * reorder nudge, and a progress-photo prompt. The dose is resolved from her
 * label bands, never computed.
 */

import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Card, Page } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { PetSwitcher } from '@/components/ui/pet-switcher';
import { BLText } from '@/components/ui/text';
import { productById } from '@/constants/products';
import { brand, color, radius, shadow, space, type } from '@/constants/theme';
import { daysOfSupply, doseFor, isAsNeeded } from '@/lib/dosing';
import { imgSource } from '@/lib/img';
import { useDemo } from '@/lib/store';

export default function Home() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { pet, markTodayGiven, ownerName, pets } = useDemo();

  /**
   * The greeting reads the clock, so hold a stable value until after mount
   * to keep the first render deterministic.
   */
  const [greet, setGreet] = useState('Welcome back');
  useEffect(() => setGreet(greeting()), []);

  const product = productById(pet.productId);
  const dose = useMemo(() => (product ? doseFor(product, pet) : null), [product, pet]);

  const givenToday = pet.history[pet.history.length - 1];
  const last14 = pet.history.slice(-14);
  const adherence = Math.round(
    (pet.history.filter(Boolean).length / pet.history.length) * 100,
  );

  const supply = daysOfSupply(dose, pet.bottlePills);
  const daysLeft = supply != null ? supply - pet.bottleStartedDaysAgo : null;
  const asNeeded = product ? isAsNeeded(product) : false;

  const lastPhoto = pet.progress.length ? pet.progress[pet.progress.length - 1] : null;
  const daysSincePhoto = lastPhoto ? daysSince(lastPhoto.date) : null;

  if (!product) return null;

  return (
    <View style={styles.flex}>
      <Page contentStyle={{ paddingTop: insets.top + space.x4 }}>
        {pets.length > 1 ? (
          <View style={styles.switcher}>
            <PetSwitcher />
          </View>
        ) : null}

        <View style={styles.petRow}>
          {pet.photo ? (
            <Image
              source={imgSource(pet.photo)}
              style={styles.petPhoto}
              contentFit="cover"
              transition={200}
            />
          ) : (
            <View style={[styles.petPhoto, styles.petPhotoEmpty]}>
              <Icon name="paw" size={24} color={color.textFaint} />
            </View>
          )}
          <View style={styles.petText}>
            <BLText variant="eyebrow">
              {greet}, {ownerName}
            </BLText>
            <BLText variant="display" size={type.h2} style={styles.petName}>
              {pet.name}
            </BLText>
            <BLText variant="meta" numberOfLines={1}>
              {pet.breed} · {pet.weightLb} lbs
            </BLText>
          </View>
        </View>

        {/* Today's dose */}
        <Card style={styles.doseCard} padded={false}>
          <View style={styles.doseHead}>
            <View style={styles.doseHeadText}>
              <BLText variant="eyebrow" style={{ color: color.badgeBlue }}>
                {asNeeded ? 'As needed' : 'Today’s dose'}
              </BLText>
              <BLText variant="title" size={15} style={styles.doseProduct} numberOfLines={2}>
                {product.shortName}
              </BLText>
            </View>
            <Image
              source={{ uri: product.image }}
              style={styles.doseImg}
              contentFit="contain"
              transition={180}
            />
          </View>

          <View style={styles.doseBody}>
            {dose ? (
              <>
                <BLText variant="display" size={30} style={styles.doseText}>
                  {dose.text}
                </BLText>
                <BLText variant="meta" style={styles.doseBand}>
                  Her label, for {dose.bandLabel.toLowerCase()}
                </BLText>
              </>
            ) : (
              /* Her label has no band for this pet. Say so, do not invent one. */
              <View style={styles.noBand}>
                <Icon name="info" size={18} color={color.warning} />
                <BLText variant="body" style={styles.noBandText}>
                  {product.labelNote ??
                    'This label does not print a dose for a pet this size.'}{' '}
                  Check the directions on the bottle.
                </BLText>
              </View>
            )}

            <Pressable
              onPress={() => markTodayGiven()}
              disabled={givenToday}
              accessibilityRole="button"
              style={({ pressed }) => [
                styles.markBtn,
                givenToday && styles.markBtnDone,
                pressed && !givenToday && { opacity: 0.85, transform: [{ scale: 0.99 }] },
              ]}
            >
              <Icon name="check" size={19} color={givenToday ? color.success : color.onAccent} />
              <BLText
                variant="bodyBold"
                style={[
                  styles.markLabel,
                  { color: givenToday ? color.success : color.onAccent },
                ]}
              >
                {givenToday ? 'Given today' : 'Mark as given'}
              </BLText>
            </Pressable>

            <Pressable onPress={() => router.push('/dose')} style={styles.doseLink}>
              <BLText variant="meta" style={{ color: color.link }}>
                See full directions and history
              </BLText>
              <Icon name="chevron-right" size={15} color={color.link} />
            </Pressable>
          </View>
        </Card>

        {/* Streak */}
        <Card style={styles.streakCard}>
          <View style={styles.streakTop}>
            <View style={styles.streakFlame}>
              <Icon name="flame" size={20} color={color.accent} filled />
            </View>
            <View style={styles.streakText}>
              <BLText variant="label">{pet.streak} day streak</BLText>
              <BLText variant="meta">{adherence}% of doses given this month</BLText>
            </View>
          </View>
          <View style={styles.grid}>
            {last14.map((given, i) => {
              const isToday = i === last14.length - 1;
              return (
                <View
                  key={i}
                  style={[
                    styles.dot,
                    given ? styles.dotOn : isToday ? styles.dotToday : styles.dotOff,
                  ]}
                />
              );
            })}
          </View>
        </Card>

        {/* Reorder nudge */}
        <Pressable onPress={() => router.push('/reorder')}>
          <Card style={styles.reorder}>
            <View style={styles.reorderText}>
              <BLText variant="label" size={type.sm}>
                {daysLeft == null
                  ? `Reorder ${pet.name}’s ${product.shortName}`
                  : daysLeft > 0
                    ? `About ${daysLeft} days left in this bottle`
                    : 'You’re due for a refill'}
              </BLText>
              <BLText variant="meta" size={12} style={styles.reorderSub}>
                {brand.trust[1].label} · {brand.trust[1].detail}
              </BLText>
            </View>
            <Icon name="chevron-right" size={18} color={color.navy} />
          </Card>
        </Pressable>

        {/* A next action, not merchandising. */}
        <Pressable onPress={() => router.push('/progress')}>
          <Card style={styles.photoNudge}>
            {lastPhoto ? (
              <Image
                source={imgSource(lastPhoto.photo)}
                style={styles.photoThumb}
                contentFit="cover"
                transition={200}
              />
            ) : (
              <View style={[styles.photoThumb, styles.photoThumbEmpty]}>
                <Icon name="camera" size={20} color={color.textFaint} />
              </View>
            )}
            <View style={styles.photoText}>
              <BLText variant="label" size={type.sm}>
                How’s {pet.name} looking?
              </BLText>
              <BLText variant="meta" size={12} style={styles.photoSub}>
                {daysSincePhoto == null
                  ? 'Add your first progress photo'
                  : daysSincePhoto === 0
                    ? 'Last photo added today'
                    : `Last photo ${daysSincePhoto} day${daysSincePhoto === 1 ? '' : 's'} ago`}
              </BLText>
            </View>
            <Icon name="chevron-right" size={18} color={color.navy} />
          </Card>
        </Pressable>

        {/* Health log */}
        <Pressable onPress={() => router.push('/health')}>
          <Card style={styles.photoNudge}>
            <View style={[styles.photoThumb, styles.healthIcon]}>
              <Icon name="clock" size={20} color={color.navy} />
            </View>
            <View style={styles.photoText}>
              <BLText variant="label" size={type.sm}>
                Health log
              </BLText>
              <BLText variant="meta" size={12} style={styles.photoSub}>
                {pet.weights.length} weigh-in{pet.weights.length === 1 ? '' : 's'} ·{' '}
                {pet.vetNotes.length} vet note{pet.vetNotes.length === 1 ? '' : 's'}
              </BLText>
            </View>
            <Icon name="chevron-right" size={18} color={color.navy} />
          </Card>
        </Pressable>
      </Page>
    </View>
  );
}

/** Whole days between an ISO date and today, floored at 0. */
function daysSince(iso: string) {
  const [y, m, d] = iso.split('-').map(Number);
  const then = Date.UTC(y, (m ?? 1) - 1, d ?? 1);
  const n = new Date();
  const today = Date.UTC(n.getFullYear(), n.getMonth(), n.getDate());
  return Math.max(0, Math.round((today - then) / 86400000));
}

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: color.bg },

  switcher: { marginBottom: space.x5 },

  petRow: { flexDirection: 'row', alignItems: 'center' },
  petPhoto: {
    width: 66,
    height: 66,
    borderRadius: 33,
    backgroundColor: color.bgAlt,
    borderWidth: 3,
    borderColor: color.surface,
    ...shadow.sm,
  },
  petPhotoEmpty: { alignItems: 'center', justifyContent: 'center' },
  petText: { flex: 1, marginLeft: space.x4 },
  petName: { color: color.navy, marginTop: 1 },

  doseCard: { marginTop: space.x6, overflow: 'hidden' },
  doseHead: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: color.navy,
    paddingHorizontal: space.x5,
    paddingVertical: space.x4,
  },
  doseHeadText: { flex: 1 },
  doseProduct: { color: color.white, marginTop: 3 },
  doseImg: {
    width: 52,
    height: 52,
    borderRadius: radius.sm,
    backgroundColor: color.white,
    marginLeft: space.x3,
  },
  doseBody: { padding: space.x5 },
  doseText: { color: color.navy },
  doseBand: { marginTop: space.x1 },

  noBand: { flexDirection: 'row', alignItems: 'flex-start' },
  noBandText: { flex: 1, marginLeft: space.x2, fontSize: type.sm, lineHeight: 21 },

  markBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: space.x5,
    height: 56,
    borderRadius: radius.pill,
    backgroundColor: color.accent,
  },
  markBtnDone: { backgroundColor: color.successBg },
  markLabel: { marginLeft: space.x2, textTransform: 'uppercase' },

  doseLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: space.x4,
  },

  streakCard: { marginTop: space.x4 },
  streakTop: { flexDirection: 'row', alignItems: 'center' },
  streakFlame: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: color.warningBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  streakText: { flex: 1, marginLeft: space.x3 },
  grid: { flexDirection: 'row', marginTop: space.x4, gap: 5 },
  dot: { flex: 1, height: 26, borderRadius: 5 },
  dotOn: { backgroundColor: color.success },
  dotOff: { backgroundColor: color.bgAlt, borderWidth: 1, borderColor: color.border },
  dotToday: { backgroundColor: color.warningBg, borderWidth: 2, borderColor: color.accent },

  reorder: {
    marginTop: space.x4,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: color.warningBg,
  },
  reorderText: { flex: 1 },
  reorderSub: { marginTop: 2 },

  photoNudge: { marginTop: space.x4, flexDirection: 'row', alignItems: 'center' },
  photoThumb: {
    width: 46,
    height: 46,
    borderRadius: radius.sm,
    backgroundColor: color.bgAlt,
  },
  photoThumbEmpty: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: color.border,
    borderStyle: 'dashed',
  },
  healthIcon: { alignItems: 'center', justifyContent: 'center' },
  photoText: { flex: 1, marginLeft: space.x3 },
  photoSub: { marginTop: 2 },
});
