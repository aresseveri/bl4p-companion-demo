/**
 * Screen 5 — Progress photos.
 *
 * Timeline of timestamped photos plus a side-by-side before/after compare.
 * Adding a photo uses the device picker and stays local.
 */

import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { useMemo, useState } from 'react';
import { Modal, Pressable, Share, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Card, Page } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { BLText } from '@/components/ui/text';
import type { ProgressEntry } from '@/constants/demo';
import { color, radius, shadow, space, type } from '@/constants/theme';
import { imgSource, type PhotoRef } from '@/lib/img';
import { useDemo } from '@/lib/store';

type Mode = 'timeline' | 'compare';

export default function Progress() {
  const insets = useSafeAreaInsets();
  const { pet, addProgress } = useDemo();
  const progress = pet.progress;
  const [mode, setMode] = useState<Mode>('timeline');

  // Oldest and newest, which is what a before/after actually means.
  const [beforeIdx, setBeforeIdx] = useState(0);
  const [afterIdx, setAfterIdx] = useState(progress.length - 1);

  const before = progress[Math.min(beforeIdx, progress.length - 1)];
  const after = progress[Math.min(afterIdx, progress.length - 1)];

  const span = useMemo(() => {
    if (!before || !after) return null;
    const d =
      (new Date(after.date).getTime() - new Date(before.date).getTime()) / 86400000;
    return Math.max(0, Math.round(d));
  }, [before, after]);

  const [adding, setAdding] = useState(false);

  const addPhoto = async (fromCamera: boolean) => {
    setAdding(false);
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
    if (!res.canceled && res.assets[0]?.uri) {
      addProgress({ date: new Date().toISOString().slice(0, 10), photo: res.assets[0].uri });
      setAfterIdx(progress.length);
    }
  };

  /**
   * Share the before/after as text plus the two dates. Uses the OS share
   * sheet on device and the Web Share API on a phone browser, so it lands in
   * Messages or Mail without us handling any of the content.
   */
  const shareCompare = async () => {
    if (!before || !after || span == null) return;
    const message =
      `${pet.name}'s progress on BestLife4Pets\n` +
      `${fmtDate(before.date)} to ${fmtDate(after.date)}, ${span} days apart.\n` +
      (after.note ? `"${after.note}"` : '');
    try {
      await Share.share({ message, title: `${pet.name}'s progress` });
    } catch {
      // User dismissed the sheet, or the platform refused. Nothing to do.
    }
  };

  return (
    <View style={styles.flex}>
      <Page contentStyle={{ paddingTop: insets.top + space.x4 }}>
        <View style={styles.head}>
          <View style={styles.headText}>
            <BLText variant="display" size={type.h2} style={{ color: color.navy }}>
              {pet.name}’s progress
            </BLText>
            <BLText variant="meta">
              {progress.length} photos{span != null ? ` over ${span} days` : ''}
            </BLText>
          </View>
          <Pressable
            onPress={() => setAdding(true)}
            style={styles.addBtn}
            accessibilityRole="button"
            accessibilityLabel="Add a photo"
          >
            <Icon name="plus" size={20} color={color.onAccent} />
          </Pressable>
        </View>

        {/* Mode switch */}
        <View style={styles.segment}>
          {(['timeline', 'compare'] as Mode[]).map((m) => {
            const on = mode === m;
            return (
              <Pressable
                key={m}
                onPress={() => setMode(m)}
                style={[styles.segmentItem, on && styles.segmentItemOn]}
                accessibilityRole="tab"
                accessibilityState={{ selected: on }}
              >
                <BLText
                  variant="label"
                  size={type.sm}
                  style={{ color: on ? color.onAccent : color.textMuted }}
                >
                  {m === 'timeline' ? 'Timeline' : 'Before / after'}
                </BLText>
              </Pressable>
            );
          })}
        </View>

        {mode === 'timeline' ? (
          <View style={styles.timeline}>
            {progress
              .slice()
              .reverse()
              .map((e: ProgressEntry, i: number, arr: ProgressEntry[]) => (
                <View key={e.date + i} style={styles.entry}>
                  <View style={styles.rail}>
                    <View style={styles.railDot} />
                    {i < arr.length - 1 ? <View style={styles.railLine} /> : null}
                  </View>
                  <View style={styles.entryBody}>
                    <BLText variant="eyebrow" style={{ color: color.badgeBlue }}>
                      {fmtDate(e.date)}
                    </BLText>
                    <Image
                      source={imgSource(e.photo)}
                      style={styles.entryPhoto}
                      contentFit="cover"
                      transition={200}
                    />
                    {e.note ? (
                      <BLText variant="body" size={type.sm} style={styles.entryNote}>
                        {e.note}
                      </BLText>
                    ) : null}
                  </View>
                </View>
              ))}
          </View>
        ) : (
          <View>
            <Card style={styles.compareCard} padded={false}>
              <View style={styles.compareRow}>
                <ComparePane label="Before" entry={before} />
                <View style={styles.compareDivider} />
                <ComparePane label="After" entry={after} />
              </View>
              {span != null ? (
                <View style={styles.spanBar}>
                  <BLText variant="label" size={type.sm} style={{ color: color.navy }}>
                    {span} days apart
                  </BLText>
                </View>
              ) : null}
            </Card>

            <Pressable onPress={shareCompare} style={styles.shareBtn} accessibilityRole="button">
              <Icon name="external" size={17} color={color.navy} />
              <BLText variant="label" size={type.sm} style={styles.shareLabel}>
                Share with your vet
              </BLText>
            </Pressable>

            <BLText variant="eyebrow" style={styles.pickLabel}>
              Before
            </BLText>
            <Strip
              entries={progress}
              selected={beforeIdx}
              onSelect={setBeforeIdx}
            />

            <BLText variant="eyebrow" style={styles.pickLabel}>
              After
            </BLText>
            <Strip entries={progress} selected={afterIdx} onSelect={setAfterIdx} />
          </View>
        )}
      </Page>

      <Modal visible={adding} transparent animationType="slide" onRequestClose={() => setAdding(false)}>
        <Pressable style={styles.backdrop} onPress={() => setAdding(false)} />
        <View style={styles.sheet}>
          <View style={styles.grab} />
          <BLText variant="heading" center style={styles.sheetTitle}>
            Add a photo of {pet.name}
          </BLText>
          <Pressable onPress={() => addPhoto(true)} style={styles.sheetRow}>
            <Icon name="camera" size={20} color={color.navy} />
            <BLText variant="body" style={styles.sheetRowText}>
              Take a photo
            </BLText>
          </Pressable>
          <Pressable onPress={() => addPhoto(false)} style={[styles.sheetRow, styles.sheetRowBorder]}>
            <Icon name="plus" size={20} color={color.navy} />
            <BLText variant="body" style={styles.sheetRowText}>
              Choose from library
            </BLText>
          </Pressable>
        </View>
      </Modal>
    </View>
  );
}

function ComparePane({
  label,
  entry,
}: {
  label: string;
  entry?: { date: string; photo: PhotoRef };
}) {
  if (!entry) return <View style={styles.pane} />;
  return (
    <View style={styles.pane}>
      <Image source={imgSource(entry.photo)} style={styles.paneImg} contentFit="cover" transition={200} />
      <View style={styles.paneTag}>
        <BLText variant="label" size={11} style={{ color: color.white }}>
          {label}
        </BLText>
      </View>
      <BLText variant="meta" size={12} center style={styles.paneDate}>
        {fmtDate(entry.date)}
      </BLText>
    </View>
  );
}

/** Horizontal thumbnail strip for picking which two photos to compare. */
function Strip({
  entries,
  selected,
  onSelect,
}: {
  entries: { date: string; photo: PhotoRef }[];
  selected: number;
  onSelect: (i: number) => void;
}) {
  return (
    <View style={styles.strip}>
      {entries.map((e, i) => (
        <Pressable key={e.date + i} onPress={() => onSelect(i)} style={styles.thumbWrap}>
          <Image
            source={imgSource(e.photo)}
            style={[styles.thumb, selected === i && styles.thumbOn]}
            contentFit="cover"
            transition={150}
          />
        </Pressable>
      ))}
    </View>
  );
}

/**
 * Deterministic on purpose. toLocaleDateString resolves differently in the
 * Node build than in the browser, which desyncs static HTML from hydration
 * and throws React error #418.
 */
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

function fmtDate(iso: string) {
  const [y, m, d] = iso.split('-').map(Number);
  return `${MONTHS[(m ?? 1) - 1]} ${d}, ${y}`;
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: color.bg },

  head: { flexDirection: 'row', alignItems: 'center' },
  headText: { flex: 1 },
  addBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: color.accent,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow.sm,
  },

  segment: {
    flexDirection: 'row',
    backgroundColor: color.bgAlt,
    borderRadius: radius.pill,
    padding: 4,
    marginTop: space.x5,
  },
  segmentItem: {
    flex: 1,
    height: 38,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentItemOn: { backgroundColor: color.accent },

  timeline: { marginTop: space.x6 },
  entry: { flexDirection: 'row' },
  rail: { width: 22, alignItems: 'center' },
  railDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: color.accent,
    borderWidth: 2,
    borderColor: color.navy,
    marginTop: 4,
  },
  railLine: { flex: 1, width: 2, backgroundColor: color.border, marginTop: 4 },
  entryBody: { flex: 1, marginLeft: space.x3, paddingBottom: space.x6 },
  entryPhoto: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: radius.card,
    marginTop: space.x2,
    backgroundColor: color.bgAlt,
    ...shadow.sm,
  },
  entryNote: { marginTop: space.x3 },

  compareCard: { marginTop: space.x6, overflow: 'hidden' },
  compareRow: { flexDirection: 'row' },
  compareDivider: { width: 2, backgroundColor: color.bg },
  pane: { flex: 1 },
  paneImg: { width: '100%', aspectRatio: 0.86, backgroundColor: color.bgAlt },
  paneTag: {
    position: 'absolute',
    top: space.x3,
    left: space.x3,
    backgroundColor: color.navy,
    paddingHorizontal: space.x3,
    paddingVertical: 4,
    borderRadius: radius.pill,
  },
  paneDate: { paddingVertical: space.x3 },
  spanBar: {
    alignItems: 'center',
    paddingVertical: space.x3,
    backgroundColor: color.warningBg,
  },

  pickLabel: { marginTop: space.x6, marginBottom: space.x3 },
  strip: { flexDirection: 'row', gap: space.x3 },
  thumbWrap: { flex: 1 },
  thumb: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: radius.sm,
    backgroundColor: color.bgAlt,
    borderWidth: 3,
    borderColor: 'transparent',
  },
  thumbOn: { borderColor: color.accent },

  shareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: space.x4,
    height: 48,
    borderRadius: radius.pill,
    borderWidth: 2,
    borderColor: color.navy,
  },
  shareLabel: { marginLeft: space.x2, color: color.navy },

  backdrop: { flex: 1, backgroundColor: 'rgba(26,26,26,0.35)' },
  sheet: {
    backgroundColor: color.surface,
    borderTopLeftRadius: radius.md,
    borderTopRightRadius: radius.md,
    paddingBottom: space.x10,
  },
  grab: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: color.border,
    alignSelf: 'center',
    marginTop: space.x3,
  },
  sheetTitle: { marginTop: space.x4, marginBottom: space.x3, color: color.navy },
  sheetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: space.x6,
    paddingVertical: space.x4,
  },
  sheetRowBorder: { borderTopWidth: 1, borderTopColor: color.borderSoft },
  sheetRowText: { marginLeft: space.x4 },
});
