/**
 * Screen 7 — Reorder.
 *
 * Product card linking out to the listing.
 *
 * On the Amazon link: her site carries no amazon.com links at all, so there
 * is no real ASIN to point at and guessing one would put a wrong product
 * behind a buy button. Each SKU has an `amazonUrl` field in products.ts that
 * is null today; fill it in and this screen switches to Amazon automatically.
 * Until then the CTA goes to her own product page, which works right now.
 */

import { Image } from 'expo-image';
import { useMemo } from 'react';
import { Linking, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BLButton } from '@/components/ui/button';
import { Card, Page, Tag } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { BLText } from '@/components/ui/text';
import {
  PRODUCTS,
  productById,
  productUrl,
  type Product,
} from '@/constants/products';
import { brand, color, radius, shadow, space, type } from '@/constants/theme';
import { daysOfSupply, doseFor } from '@/lib/dosing';
import { useDemo } from '@/lib/store';

export default function Reorder() {
  const insets = useSafeAreaInsets();
  const { pet } = useDemo();

  const theirs = productById(pet.productId);
  const dose = useMemo(
    () => (theirs ? doseFor(theirs, pet) : null),
    [theirs, pet],
  );

  const supply = daysOfSupply(dose, pet.bottlePills);
  const daysLeft = supply != null ? supply - pet.bottleStartedDaysAgo : null;

  const others = PRODUCTS.filter(
    (p) => p.id !== theirs?.id && p.species.includes(pet.species),
  );

  if (!theirs) return null;

  return (
    <View style={styles.flex}>
      <Page contentStyle={{ paddingTop: insets.top + space.x4 }}>
        <BLText variant="display" size={type.h2} style={{ color: color.navy }}>
          Reorder
        </BLText>
        <BLText variant="meta" style={styles.sub}>
          {daysLeft != null && daysLeft > 0
            ? `About ${daysLeft} days left in ${pet.name}’s bottle.`
            : `Time for a refill for ${pet.name}.`}
        </BLText>

        <ProductCard product={theirs} primary />

        {/* Her trust block, her wording. */}
        <Card style={styles.trust}>
          {brand.trust.slice(0, 4).map((t, i) => (
            <View key={t.label} style={[styles.trustRow, i > 0 && styles.trustBorder]}>
              <View style={styles.trustTick}>
                <Icon name="check" size={13} color={color.success} />
              </View>
              <View style={styles.trustText}>
                <BLText variant="label" size={type.sm}>
                  {t.label}
                </BLText>
                <BLText variant="meta" size={12} style={styles.trustDetail}>
                  {t.detail}
                </BLText>
              </View>
            </View>
          ))}
        </Card>

        {others.length ? (
          <>
            <BLText variant="eyebrow" style={styles.othersLabel}>
              Others for {pet.species === 'dog' ? 'dogs' : 'cats'}
            </BLText>
            <View style={styles.others}>
              {others.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </View>
          </>
        ) : null}

        <BLText variant="meta" size={12} tone="textFaint" center style={styles.foot}>
          {brand.shippingBar}
        </BLText>
      </Page>
    </View>
  );
}

function ProductCard({ product, primary }: { product: Product; primary?: boolean }) {
  const href = product.amazonUrl ?? productUrl(product);
  const onAmazon = !!product.amazonUrl;
  const open = () => Linking.openURL(href);

  if (!primary) {
    return (
      <Pressable onPress={open} accessibilityRole="link">
        <Card style={styles.small}>
          <Image source={{ uri: product.image }} style={styles.smallImg} contentFit="contain" transition={180} />
          <View style={styles.smallText}>
            <BLText variant="title" size={12} numberOfLines={2}>
              {product.shortName}
            </BLText>
            <View style={styles.priceRow}>
              <BLText variant="label" size={type.sm} style={{ color: color.navy }}>
                ${product.price.toFixed(2)}
              </BLText>
              {product.compareAt ? (
                <BLText variant="meta" size={12} style={styles.strike}>
                  ${product.compareAt.toFixed(2)}
                </BLText>
              ) : null}
            </View>
          </View>
          <Icon name="chevron-right" size={18} color={color.textFaint} />
        </Card>
      </Pressable>
    );
  }

  return (
    <Card style={styles.hero} padded={false}>
      <View style={styles.heroTop}>
        <Image source={{ uri: product.image }} style={styles.heroImg} contentFit="contain" transition={200} />
      </View>
      <View style={styles.heroBody}>
        <BLText variant="title" size={15}>
          {product.name}
        </BLText>

        <View style={styles.priceRow}>
          <BLText variant="display" size={24} style={{ color: color.navy }}>
            ${product.price.toFixed(2)}
          </BLText>
          {product.compareAt ? (
            <>
              <BLText variant="meta" style={styles.strike}>
                ${product.compareAt.toFixed(2)}
              </BLText>
              <View style={styles.saveTag}>
                <BLText variant="label" size={11} style={{ color: color.white }}>
                  SAVE ${(product.compareAt - product.price).toFixed(2)}
                </BLText>
              </View>
            </>
          ) : null}
        </View>

        <BLText variant="body" size={type.sm} tone="textMuted" style={styles.blurb}>
          {product.blurb}
        </BLText>

        <View style={styles.tags}>
          {product.helpsWith.map((h) => (
            <Tag key={h} label={h} tone="blue" />
          ))}
        </View>

        <BLButton
          label={onAmazon ? 'Buy on Amazon' : 'Reorder now'}
          onPress={open}
          style={styles.cta}
          left={<Icon name="external" size={17} color={color.onAccent} />}
        />
        <BLText variant="meta" size={12} center tone="textFaint" style={styles.ctaNote}>
          {onAmazon ? 'Opens the Amazon listing' : 'Opens bestlife4pets.com'}
        </BLText>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: color.bg },
  sub: { marginTop: space.x1 },

  hero: { marginTop: space.x5, overflow: 'hidden' },
  heroTop: {
    backgroundColor: color.bgAlt,
    alignItems: 'center',
    paddingVertical: space.x6,
  },
  heroImg: { width: 150, height: 150 },
  heroBody: { padding: space.x5 },

  priceRow: { flexDirection: 'row', alignItems: 'center', marginTop: space.x2, gap: space.x2 },
  strike: { textDecorationLine: 'line-through', color: color.textFaint },
  saveTag: {
    backgroundColor: color.sale,
    paddingHorizontal: space.x2,
    paddingVertical: 3,
    borderRadius: radius.pill,
  },

  blurb: { marginTop: space.x3 },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: space.x2, marginTop: space.x4 },
  cta: { marginTop: space.x5 },
  ctaNote: { marginTop: space.x2 },

  trust: { marginTop: space.x5 },
  trustRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: space.x3 },
  trustBorder: { borderTopWidth: 1, borderTopColor: color.borderSoft },
  trustTick: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: color.successBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  trustText: { flex: 1, marginLeft: space.x3 },
  trustDetail: { marginTop: 1 },

  othersLabel: { marginTop: space.x8, marginBottom: space.x3 },
  others: { gap: space.x3 },
  small: { flexDirection: 'row', alignItems: 'center', padding: space.x3 },
  smallImg: {
    width: 52,
    height: 52,
    borderRadius: radius.sm,
    backgroundColor: color.bgAlt,
  },
  smallText: { flex: 1, marginLeft: space.x3 },

  foot: { marginTop: space.x8, lineHeight: 18 },
});
