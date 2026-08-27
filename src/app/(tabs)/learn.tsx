/**
 * Screen 6 — Learn.
 *
 * Per-SKU video cards and an FAQ.
 *
 * On the videos: there are no videos on her product pages (checked all five
 * for YouTube embeds and Shopify-hosted mp4/m3u8, zero hits), so the tap
 * opens a placeholder player, as briefed. Thumbnails are her real CDN
 * imagery rather than grey boxes, and every title is written in her voice
 * about what that SKU actually does on her own listing.
 *
 * The FAQ is pulled from the accordions on her real product pages.
 */

import { Image } from 'expo-image';
import { useState } from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Card, Page } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { BLText } from '@/components/ui/text';
import { PRODUCTS, productById, type Product } from '@/constants/products';
import { color, radius, shadow, space, type } from '@/constants/theme';
import { useDemo } from '@/lib/store';

/**
 * Video titles, written in her voice from her own listing copy for each SKU.
 * No claim here that is not already on her product page.
 */
const VIDEO_TITLE: Record<string, string> = {
  'walk-easy': 'Getting a stiff dog moving again',
  dental: 'What bad breath is actually telling you',
  ear: 'Spotting an ear infection early',
  'cat-allergy': 'Why your cat sneezes every spring',
  'peaceful-paws': 'Getting ahead of fireworks and car rides',
};

export default function Learn() {
  const insets = useSafeAreaInsets();
  const { pet } = useDemo();
  const [playing, setPlaying] = useState<Product | null>(null);
  const [openFaq, setOpenFaq] = useState<string | null>(null);

  const theirs = productById(pet.productId);
  // Their SKU first, then the rest.
  const ordered = theirs
    ? [theirs, ...PRODUCTS.filter((p) => p.id !== theirs.id)]
    : PRODUCTS;

  const faqs = theirs?.faqs ?? PRODUCTS[0].faqs;

  return (
    <View style={styles.flex}>
      <Page contentStyle={{ paddingTop: insets.top + space.x4 }}>
        <BLText variant="display" size={type.h2} style={{ color: color.navy }}>
          Learn
        </BLText>
        <BLText variant="meta" style={styles.sub}>
          Short guides for the remedies you use.
        </BLText>

        <View style={styles.videos}>
          {ordered.map((p, i) => (
            <Pressable
              key={p.id}
              onPress={() => setPlaying(p)}
              accessibilityRole="button"
              style={({ pressed }) => [pressed && { opacity: 0.85 }]}
            >
              <Card style={styles.video} padded={false}>
                <View style={styles.thumbWrap}>
                  <Image
                    source={{ uri: p.image }}
                    style={styles.thumb}
                    contentFit="contain"
                    transition={200}
                  />
                  <View style={styles.playBadge}>
                    <View style={styles.playCircle}>
                      {/* Unfilled: the filled variant inverts to a white disc
                          and loses the triangle against the navy badge. */}
                      <Icon name="play" size={26} color={color.white} />
                    </View>
                  </View>
                  {i === 0 && theirs ? (
                    <View style={styles.yoursTag}>
                      <BLText variant="label" size={10} style={{ color: color.white }}>
                        YOURS
                      </BLText>
                    </View>
                  ) : null}
                </View>
                <View style={styles.videoText}>
                  <BLText variant="title" size={13} numberOfLines={2}>
                    {VIDEO_TITLE[p.id] ?? p.shortName}
                  </BLText>
                  <BLText variant="meta" size={12} style={styles.videoSub} numberOfLines={1}>
                    {p.shortName}
                  </BLText>
                </View>
              </Card>
            </Pressable>
          ))}
        </View>

        {/* FAQ, straight off her product pages */}
        <BLText variant="eyebrow" style={styles.faqLabel}>
          Common questions
        </BLText>
        <Card padded={false}>
          {faqs.map((f, i) => {
            const open = openFaq === f.q;
            return (
              <Pressable
                key={f.q}
                onPress={() => setOpenFaq(open ? null : f.q)}
                style={[styles.faqRow, i > 0 && styles.faqRowBorder]}
                accessibilityRole="button"
                accessibilityState={{ expanded: open }}
              >
                <View style={styles.faqHead}>
                  <BLText variant="label" size={type.sm} style={styles.faqQ}>
                    {f.q}
                  </BLText>
                  <View style={open ? styles.chevOpen : undefined}>
                    <Icon name="chevron-right" size={17} color={color.textFaint} />
                  </View>
                </View>
                {open ? (
                  <BLText variant="body" size={type.sm} style={styles.faqA}>
                    {f.a}
                  </BLText>
                ) : null}
              </Pressable>
            );
          })}
        </Card>
      </Page>

      {/* Placeholder player, as briefed. */}
      <Modal
        visible={!!playing}
        transparent
        animationType="fade"
        onRequestClose={() => setPlaying(null)}
      >
        <Pressable style={styles.playerBackdrop} onPress={() => setPlaying(null)}>
          <View style={styles.player}>
            <View style={styles.playerStage}>
              {playing ? (
                <Image
                  source={{ uri: playing.image }}
                  style={styles.playerImg}
                  contentFit="contain"
                  transition={150}
                />
              ) : null}
              <View style={styles.playerScrim} />
              <Icon name="play" size={54} color={color.white} />
            </View>
            <View style={styles.playerFoot}>
              <BLText variant="title" size={13} center>
                {playing ? VIDEO_TITLE[playing.id] ?? playing.shortName : ''}
              </BLText>
              <BLText variant="meta" size={12} center style={styles.playerNote}>
                Video player is a placeholder in this demo.
              </BLText>
            </View>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: color.bg },
  sub: { marginTop: space.x1 },

  videos: { marginTop: space.x5, gap: space.x4 },
  video: { overflow: 'hidden' },
  thumbWrap: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: color.bgAlt,
    paddingVertical: space.x3,
  },
  thumb: { width: '100%', height: '100%' },
  playBadge: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  /* Solid disc so the play glyph reads against her light product shots. */
  playCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: 'rgba(23,57,88,0.82)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  yoursTag: {
    position: 'absolute',
    top: space.x3,
    left: space.x3,
    backgroundColor: color.badgeBlue,
    paddingHorizontal: space.x2,
    paddingVertical: 3,
    borderRadius: radius.pill,
  },
  videoText: { padding: space.x4 },
  videoSub: { marginTop: 3 },

  faqLabel: { marginTop: space.x8, marginBottom: space.x3 },
  faqRow: { paddingHorizontal: space.x4, paddingVertical: space.x4 },
  faqRowBorder: { borderTopWidth: 1, borderTopColor: color.borderSoft },
  faqHead: { flexDirection: 'row', alignItems: 'center' },
  faqQ: { flex: 1, marginRight: space.x3 },
  chevOpen: { transform: [{ rotate: '90deg' }] },
  faqA: { marginTop: space.x3, color: color.textMuted },

  playerBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(26,26,26,0.72)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: space.x5,
  },
  player: {
    width: '100%',
    borderRadius: radius.card,
    overflow: 'hidden',
    backgroundColor: color.surface,
    ...shadow.block,
  },
  playerStage: {
    width: '100%',
    aspectRatio: 16 / 9,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: color.text,
  },
  playerImg: { position: 'absolute', width: '100%', height: '100%' },
  playerScrim: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(26,26,26,0.45)',
  },
  playerFoot: { padding: space.x5 },
  playerNote: { marginTop: space.x2 },
});
