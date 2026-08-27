/**
 * Screen 4 — Dose detail.
 *
 * The computed dose for this pet and product, straight from her label bands,
 * a reminder time picker that only sets state, and a 30-day history grid.
 *
 * Nothing here schedules a notification. That is part of the real build.
 */

import { Image } from 'expo-image';
import { useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { Card, Page, ScreenHeader } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { BLText } from '@/components/ui/text';
import { GIVE_HEADING, STORAGE_NOTE, productById } from '@/constants/products';
import { color, radius, space, type } from '@/constants/theme';
import { doseFor, frequencyWord, isAsNeeded } from '@/lib/dosing';
import { useDemo } from '@/lib/store';

export default function DoseDetail() {
  const { pet, history, reminder, set } = useDemo();
  const [picking, setPicking] = useState(false);

  const product = productById(pet.productId);
  const dose = useMemo(() => (product ? doseFor(product, pet) : null), [product, pet]);

  if (!product) return null;
  const asNeeded = isAsNeeded(product);

  return (
    <View style={styles.flex}>
      <ScreenHeader title={product.shortName} back />
      <Page tabBarInset={false}>
        {/* Computed dose */}
        <Card style={styles.hero}>
          <View style={styles.heroTop}>
            <Image source={{ uri: product.image }} style={styles.heroImg} contentFit="contain" transition={180} />
            <View style={styles.heroText}>
              <BLText variant="eyebrow" style={{ color: color.badgeBlue }}>
                For {pet.name}, {pet.weightLb} lbs
              </BLText>
              {dose ? (
                <>
                  <BLText variant="display" size={26} style={styles.doseText}>
                    {dose.pills} {Number(dose.pills.split('-')[0]) === 1 ? 'pill' : 'pills'}
                  </BLText>
                  <BLText variant="label" size={type.sm} tone="textMuted">
                    {asNeeded
                      ? 'before a stressful event'
                      : frequencyWord(dose.timesPerDay)}
                  </BLText>
                </>
              ) : (
                <BLText variant="body" size={type.sm} style={styles.noBand}>
                  Her label does not print a band for a pet this size.
                </BLText>
              )}
            </View>
          </View>

          {dose ? (
            <View style={styles.provenance}>
              <Icon name="info" size={15} color={color.textFaint} />
              <BLText variant="meta" size={12} style={styles.provenanceText}>
                Taken from her label: “{dose.bandLabel}, {dose.text}”
              </BLText>
            </View>
          ) : null}
        </Card>

        {/* Anything her label leaves open, surfaced rather than filled in. */}
        {product.labelNote ? (
          <Card style={styles.note}>
            <View style={styles.noteRow}>
              <Icon name="info" size={17} color={color.warning} />
              <BLText variant="body" size={type.sm} style={styles.noteText}>
                {product.labelNote}
              </BLText>
            </View>
          </Card>
        ) : null}

        {/* Reminder — UI only */}
        <BLText variant="eyebrow" style={styles.sectionLabel}>
          Reminder
        </BLText>
        <Pressable onPress={() => setPicking(true)}>
          <Card style={styles.reminder}>
            <Icon name="clock" size={20} color={color.navy} />
            <View style={styles.reminderText}>
              <BLText variant="label">{fmtTime(reminder)}</BLText>
              <BLText variant="meta" size={12}>
                {asNeeded ? 'A nudge to keep some on hand' : 'Every day'}
              </BLText>
            </View>
            <Icon name="chevron-right" size={18} color={color.textFaint} />
          </Card>
        </Pressable>

        {/*
          Her wording. These are ALTERNATIVES, not steps: her page shows three
          parallel tiles under "Three easy ways to give it" and a pet parent
          picks one. Numbering them would tell someone to do all three.
        */}
        <BLText variant="eyebrow" style={styles.sectionLabel}>
          {GIVE_HEADING}
        </BLText>
        <Card>
          {product.howToGive.map((h, i) => (
            <View key={h.short}>
              {i > 0 ? (
                <View style={styles.orRow}>
                  <View style={styles.orLine} />
                  <BLText variant="meta" size={11} style={styles.orText}>
                    or
                  </BLText>
                  <View style={styles.orLine} />
                </View>
              ) : null}
              <View style={styles.howRow}>
                <View style={styles.howDot} />
                <View style={styles.howText}>
                  <BLText variant="label" size={type.sm}>
                    {h.short}
                  </BLText>
                  <BLText variant="body" size={type.sm} tone="textMuted" style={styles.howFull}>
                    {h.full}
                  </BLText>
                </View>
              </View>
            </View>
          ))}
        </Card>

        {product.maintenance ? (
          <>
            <BLText variant="eyebrow" style={styles.sectionLabel}>
              {asNeeded ? 'Repeating a dose' : 'Once symptoms clear'}
            </BLText>
            <Card>
              <BLText variant="body" size={type.sm}>
                {product.maintenance}
              </BLText>
            </Card>
          </>
        ) : null}

        {/* 30-day history */}
        <BLText variant="eyebrow" style={styles.sectionLabel}>
          Last 30 days
        </BLText>
        <Card>
          <View style={styles.grid}>
            {history.map((given, i) => {
              // The last slot is today. Not yet given is pending, not missed.
              const isToday = i === history.length - 1;
              return (
                <View
                  key={i}
                  style={[
                    styles.cell,
                    given ? styles.cellOn : isToday ? styles.cellToday : styles.cellOff,
                  ]}
                >
                  {given ? <Icon name="check" size={11} color={color.white} /> : null}
                </View>
              );
            })}
          </View>
          <View style={styles.legend}>
            <View style={[styles.legendDot, styles.cellOn]} />
            <BLText variant="meta" size={12} style={styles.legendText}>
              Given
            </BLText>
            <View style={[styles.legendDot, styles.cellOff]} />
            <BLText variant="meta" size={12} style={styles.legendText}>
              Missed
            </BLText>
            <View style={[styles.legendDot, styles.cellToday]} />
            <BLText variant="meta" size={12} style={styles.legendText}>
              Today
            </BLText>
          </View>
        </Card>

        <BLText variant="meta" size={12} tone="textFaint" style={styles.storage}>
          {STORAGE_NOTE}
        </BLText>
      </Page>

      <TimePicker
        visible={picking}
        value={reminder}
        onClose={() => setPicking(false)}
        onPick={(v) => {
          set({ reminder: v });
          setPicking(false);
        }}
      />
    </View>
  );
}

/** Sets state only. Nothing is scheduled. */
function TimePicker({
  visible,
  value,
  onPick,
  onClose,
}: {
  visible: boolean;
  value: { hour: number; minute: number };
  onPick: (v: { hour: number; minute: number }) => void;
  onClose: () => void;
}) {
  const times = useMemo(() => {
    const out: { hour: number; minute: number }[] = [];
    for (let h = 6; h <= 22; h++) {
      out.push({ hour: h, minute: 0 });
      out.push({ hour: h, minute: 30 });
    }
    return out;
  }, []);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.sheetBackdrop} onPress={onClose} />
      <View style={styles.sheet}>
        <View style={styles.sheetGrab} />
        <BLText variant="heading" center style={styles.sheetTitle}>
          Remind me at
        </BLText>
        <BLText variant="meta" center tone="textFaint" style={styles.sheetNote}>
          Demo only. Real reminders come with the built app.
        </BLText>
        <ScrollView style={styles.sheetList} showsVerticalScrollIndicator={false}>
          {times.map((t) => {
            const on = t.hour === value.hour && t.minute === value.minute;
            return (
              <Pressable
                key={`${t.hour}:${t.minute}`}
                onPress={() => onPick(t)}
                style={[styles.timeRow, on && styles.timeRowOn]}
              >
                <BLText variant="body" style={on ? { color: color.navy } : undefined}>
                  {fmtTime(t)}
                </BLText>
                {on ? <Icon name="check" size={17} color={color.navy} /> : null}
              </Pressable>
            );
          })}
        </ScrollView>
      </View>
    </Modal>
  );
}

function fmtTime({ hour, minute }: { hour: number; minute: number }) {
  const ampm = hour < 12 ? 'AM' : 'PM';
  const h = hour % 12 === 0 ? 12 : hour % 12;
  return `${h}:${String(minute).padStart(2, '0')} ${ampm}`;
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: color.bg },

  hero: {},
  heroTop: { flexDirection: 'row', alignItems: 'center' },
  heroImg: {
    width: 76,
    height: 76,
    borderRadius: radius.sm,
    backgroundColor: color.bgAlt,
  },
  heroText: { flex: 1, marginLeft: space.x4 },
  doseText: { color: color.navy, marginTop: 2 },
  noBand: { marginTop: space.x1, color: color.text },

  provenance: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: space.x4,
    paddingTop: space.x4,
    borderTopWidth: 1,
    borderTopColor: color.borderSoft,
  },
  provenanceText: { flex: 1, marginLeft: space.x2 },

  note: { marginTop: space.x4, backgroundColor: color.warningBg },
  noteRow: { flexDirection: 'row', alignItems: 'flex-start' },
  noteText: { flex: 1, marginLeft: space.x2 },

  sectionLabel: { marginTop: space.x8, marginBottom: space.x3 },

  reminder: { flexDirection: 'row', alignItems: 'center' },
  reminderText: { flex: 1, marginLeft: space.x3 },

  howRow: { flexDirection: 'row', alignItems: 'flex-start', paddingVertical: space.x3 },
  /* A dot, not a number: these are interchangeable options. */
  howDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: color.accent,
    marginTop: 7,
  },
  howText: { flex: 1, marginLeft: space.x3 },
  howFull: { marginTop: 2 },
  orRow: { flexDirection: 'row', alignItems: 'center' },
  orLine: { flex: 1, height: 1, backgroundColor: color.borderSoft },
  orText: {
    marginHorizontal: space.x3,
    textTransform: 'uppercase',
    letterSpacing: 1,
    color: color.textFaint,
  },

  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  cell: {
    width: 28,
    height: 28,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cellOn: { backgroundColor: color.success },
  cellOff: { backgroundColor: color.bgAlt, borderWidth: 1, borderColor: color.border },
  /* Today, still open. Distinct from a missed day. */
  cellToday: {
    backgroundColor: color.warningBg,
    borderWidth: 2,
    borderColor: color.accent,
  },
  legend: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: space.x4,
    paddingTop: space.x3,
    borderTopWidth: 1,
    borderTopColor: color.borderSoft,
  },
  legendDot: { width: 14, height: 14, borderRadius: 4 },
  legendText: { marginLeft: space.x2, marginRight: space.x4 },

  storage: { marginTop: space.x6, lineHeight: 18 },

  sheetBackdrop: { flex: 1, backgroundColor: 'rgba(26,26,26,0.35)' },
  sheet: {
    backgroundColor: color.surface,
    borderTopLeftRadius: radius.md,
    borderTopRightRadius: radius.md,
    paddingBottom: space.x8,
    maxHeight: '62%',
  },
  sheetGrab: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: color.border,
    alignSelf: 'center',
    marginTop: space.x3,
  },
  sheetTitle: { marginTop: space.x4, color: color.navy },
  sheetNote: { marginTop: space.x1, marginBottom: space.x3 },
  sheetList: { paddingHorizontal: space.x5 },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: space.x3,
    paddingHorizontal: space.x3,
    borderRadius: radius.input,
  },
  timeRowOn: { backgroundColor: color.warningBg },
});
