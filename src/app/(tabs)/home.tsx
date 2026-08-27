/**
 * Home.
 *
 * One job: did today's dose happen? Everything else is secondary and is
 * sized that way.
 *
 * This screen previously stacked seven blocks of equal weight, including the
 * pet's photo twice (switcher and header) and three near-identical chevron
 * rows for Progress, Reorder and Health. Two of those three were pure
 * navigation to places that are already tabs, so they were noise. Now there
 * is one hero, one compact streak strip, and at most ONE contextual nudge
 * chosen by urgency.
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
import { color, radius, shadow, space, type } from '@/constants/theme';
import { bandPhrase, daysOfSupply, doseFor, isAsNeeded } from '@/lib/dosing';
import { imgSource } from '@/lib/img';
import { useDemo } from '@/lib/store';

export default function Home() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { pet, markTodayGiven, ownerName, pets } = useDemo();

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

  const multi = pets.length > 1;

  /**
   * At most one nudge, picked by urgency. Running out of product beats
   * anything else; a stale photo is next. When neither is pressing, Home
   * ends after the streak, which is the right amount of screen.
   */
  const nudge: 'reorder' | 'photo' | null =
    daysLeft != null && daysLeft <= 21
      ? 'reorder'
      : daysSincePhoto == null || daysSincePhoto >= 14
        ? 'photo'
        : null;

  if (!product) return null;

  return (
    <View style={styles.flex}>
      <Page contentStyle={{ paddingTop: insets.top + space.x4 }}>
        {/*
          With several pets the switcher already shows the active one, so the
          header drops the photo instead of printing it twice.
        */}
        {multi ? (
          <View style={styles.switcher}>
            <PetSwitcher />
          </View>
        ) : null}

        <View style={styles.petRow}>
          {!multi && pet.photo ? (
            <Image
              source={imgSource(pet.photo)}
              style={styles.petPhoto}
              contentFit="cover"
              transition={200}
            />
          ) : null}
          <View style={[styles.petText, !multi && pet.photo ? styles.petTextInset : null]}>
            <BLText variant="eyebrow">
              {greet}, {ownerName}
            </BLText>
            <BLText variant="display" size={type.h2} style={styles.petName}>
              {pet.name}
            </BLText>
          </View>
        </View>

        {/* The hero. */}
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
                <BLText
                  variant="display"
                  size={dose.text.length > 20 ? 26 : 30}
                  style={styles.doseText}
                >
                  {dose.text}
                </BLText>
                <BLText variant="meta" style={styles.doseBand}>
                  Her label, for {bandPhrase(dose.bandLabel)}
                </BLText>
              </>
            ) : (
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

            {/* Streak folded in, so it is context on the dose rather than
                a second card competing with it. */}
            <Pressable onPress={() => router.push('/dose')} style={styles.streak}>
              <View style={styles.streakLine}>
                <Icon name="flame" size={15} color={color.accent} filled />
                <BLText variant="label" size={type.sm} style={styles.streakText}>
                  {pet.streak} day streak
                </BLText>
                <BLText variant="meta" size={12}>
                  {adherence}% this month
                </BLText>
                <Icon name="chevron-right" size={15} color={color.textFaint} />
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
            </Pressable>
          </View>
        </Card>

        {/* At most one. */}
        {nudge === 'reorder' ? (
          <Pressable onPress={() => router.push('/reorder')}>
            <Card style={styles.nudge}>
              <View style={styles.nudgeIcon}>
                <Icon name="cart" size={18} color={color.navy} />
              </View>
              <View style={styles.nudgeText}>
                <BLText variant="label" size={type.sm}>
                  {daysLeft != null && daysLeft > 0
                    ? `About ${daysLeft} days left in this bottle`
                    : 'You’re due for a refill'}
                </BLText>
                <BLText variant="meta" size={12} style={styles.nudgeSub}>
                  Reorder before {pet.name} runs out
                </BLText>
              </View>
              <Icon name="chevron-right" size={18} color={color.navy} />
            </Card>
          </Pressable>
        ) : nudge === 'photo' ? (
          <Pressable onPress={() => router.push('/progress')}>
            <Card style={styles.nudge}>
              {lastPhoto ? (
                <Image
                  source={imgSource(lastPhoto.photo)}
                  style={styles.nudgeThumb}
                  contentFit="cover"
                  transition={200}
                />
              ) : (
                <View style={styles.nudgeIcon}>
                  <Icon name="camera" size={18} color={color.navy} />
                </View>
              )}
              <View style={styles.nudgeText}>
                <BLText variant="label" size={type.sm}>
                  How’s {pet.name} looking?
                </BLText>
                <BLText variant="meta" size={12} style={styles.nudgeSub}>
                  {daysSincePhoto == null
                    ? 'Add your first progress photo'
                    : `Last photo ${daysSincePhoto} days ago`}
                </BLText>
              </View>
              <Icon name="chevron-right" size={18} color={color.navy} />
            </Card>
          </Pressable>
        ) : null}
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
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: color.bgAlt,
    borderWidth: 3,
    borderColor: color.surface,
    ...shadow.sm,
  },
  petText: { flex: 1 },
  petTextInset: { marginLeft: space.x4 },
  petName: { color: color.navy, marginTop: 1 },

  doseCard: { marginTop: space.x5, overflow: 'hidden' },
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
    width: 48,
    height: 48,
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

  streak: {
    marginTop: space.x5,
    paddingTop: space.x4,
    borderTopWidth: 1,
    borderTopColor: color.borderSoft,
  },
  streakLine: { flexDirection: 'row', alignItems: 'center', gap: space.x2 },
  streakText: { flex: 1, marginLeft: space.x1 },
  grid: { flexDirection: 'row', marginTop: space.x3, gap: 4 },
  dot: { flex: 1, height: 18, borderRadius: 4 },
  dotOn: { backgroundColor: color.success },
  dotOff: { backgroundColor: color.bgAlt, borderWidth: 1, borderColor: color.border },
  dotToday: { backgroundColor: color.warningBg, borderWidth: 2, borderColor: color.accent },

  nudge: { marginTop: space.x4, flexDirection: 'row', alignItems: 'center' },
  nudgeIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: color.warningBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nudgeThumb: { width: 42, height: 42, borderRadius: radius.sm, backgroundColor: color.bgAlt },
  nudgeText: { flex: 1, marginLeft: space.x3 },
  nudgeSub: { marginTop: 2 },
});
