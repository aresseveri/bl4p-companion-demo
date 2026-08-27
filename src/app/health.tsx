/**
 * Health log: weight history and vet notes.
 *
 * Depth beyond "product manual". Weight matters here specifically because it
 * is what selects the dose band on her label, so a weigh-in can change the
 * dose, and the app says so.
 */

import { useMemo, useState } from 'react';
import { Modal, Pressable, StyleSheet, TextInput, View } from 'react-native';

import { BLButton } from '@/components/ui/button';
import { Card, Page, ScreenHeader } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { BLText } from '@/components/ui/text';
import { productById } from '@/constants/products';
import { color, font, radius, space, type } from '@/constants/theme';
import { doseFor } from '@/lib/dosing';
import { useDemo } from '@/lib/store';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const fmtDate = (iso: string) => {
  const [y, m, d] = iso.split('-').map(Number);
  return `${MONTHS[(m ?? 1) - 1]} ${d}, ${y}`;
};
/** Month and day only, for chart axes and short references. */
const fmtShort = (iso: string) => {
  const [, m, d] = iso.split('-').map(Number);
  return `${MONTHS[(m ?? 1) - 1]} ${d}`;
};
const todayIso = () => new Date().toISOString().slice(0, 10);

export default function Health() {
  const { pet, addWeight, addVetNote } = useDemo();
  const [sheet, setSheet] = useState<null | 'weight' | 'note'>(null);

  const product = productById(pet.productId);
  const dose = useMemo(() => (product ? doseFor(product, pet) : null), [product, pet]);

  const weights = pet.weights;
  const first = weights[0];
  const latest = weights[weights.length - 1];
  const change = first && latest ? latest.lb - first.lb : 0;

  const min = weights.length ? Math.min(...weights.map((w) => w.lb)) : 0;
  const max = weights.length ? Math.max(...weights.map((w) => w.lb)) : 1;
  const span = Math.max(1, max - min);

  return (
    <View style={styles.flex}>
      <ScreenHeader title={`${pet.name}’s health`} back />
      <Page tabBarInset={false}>
        {/* Weight */}
        <View style={styles.sectionHead}>
          <BLText variant="heading" size={type.h4}>
            Weight
          </BLText>
          <Pressable onPress={() => setSheet('weight')} hitSlop={10} style={styles.addBtn}>
            <Icon name="plus" size={16} color={color.onAccent} />
          </Pressable>
        </View>

        <Card>
          {weights.length === 0 ? (
            <BLText variant="body" size={type.sm} tone="textMuted">
              No weigh-ins yet. Weight is what picks the dose band on the label,
              so it is worth keeping current.
            </BLText>
          ) : (
            <>
              <View style={styles.weightTop}>
                <BLText variant="display" size={30} style={{ color: color.navy }}>
                  {latest.lb} lbs
                </BLText>
                {weights.length > 1 ? (
                  <View
                    style={[
                      styles.changePill,
                      { backgroundColor: change <= 0 ? color.successBg : color.warningBg },
                    ]}
                  >
                    <BLText
                      variant="label"
                      size={11}
                      style={{ color: change <= 0 ? color.success : color.warning }}
                    >
                      {change > 0 ? '+' : ''}
                      {change} lbs since {fmtShort(first.date)}
                    </BLText>
                  </View>
                ) : null}
              </View>

              {/* Simple bar chart. Enough to show a trend, no library needed. */}
              <View style={styles.chart}>
                {weights.map((w) => {
                  const h = 20 + ((w.lb - min) / span) * 60;
                  return (
                    <View key={w.date} style={styles.chartCol}>
                      <BLText variant="meta" size={10} center style={styles.chartVal}>
                        {w.lb}
                      </BLText>
                      <View style={[styles.bar, { height: h }]} />
                      <BLText variant="meta" size={9} center style={styles.chartLabel}>
                        {fmtShort(w.date)}
                      </BLText>
                    </View>
                  );
                })}
              </View>

              {dose ? (
                <View style={styles.doseNote}>
                  <Icon name="info" size={15} color={color.textFaint} />
                  <BLText variant="meta" size={12} style={styles.doseNoteText}>
                    At {pet.weightLb} lbs the label puts {pet.name} in “{dose.bandLabel}”,
                    which is {dose.text}.
                  </BLText>
                </View>
              ) : null}
            </>
          )}
        </Card>

        {/* Vet notes */}
        <View style={styles.sectionHead}>
          <BLText variant="heading" size={type.h4}>
            Vet notes
          </BLText>
          <Pressable onPress={() => setSheet('note')} hitSlop={10} style={styles.addBtn}>
            <Icon name="plus" size={16} color={color.onAccent} />
          </Pressable>
        </View>

        {pet.vetNotes.length === 0 ? (
          <Card>
            <BLText variant="body" size={type.sm} tone="textMuted">
              Nothing logged yet. Keep what your vet said here so it is with you
              at the next appointment.
            </BLText>
          </Card>
        ) : (
          <View style={styles.notes}>
            {pet.vetNotes
              .slice()
              .reverse()
              .map((n) => (
                <Card key={n.date + n.title}>
                  <BLText variant="eyebrow" style={{ color: color.badgeBlue }}>
                    {fmtDate(n.date)}
                  </BLText>
                  <BLText variant="label" style={styles.noteTitle}>
                    {n.title}
                  </BLText>
                  <BLText variant="body" size={type.sm} tone="textMuted" style={styles.noteBody}>
                    {n.note}
                  </BLText>
                </Card>
              ))}
          </View>
        )}
      </Page>

      <EntrySheet
        mode={sheet}
        onClose={() => setSheet(null)}
        onWeight={(lb) => {
          addWeight({ date: todayIso(), lb });
          setSheet(null);
        }}
        onNote={(title, note) => {
          addVetNote({ date: todayIso(), title, note });
          setSheet(null);
        }}
      />
    </View>
  );
}

function EntrySheet({
  mode,
  onClose,
  onWeight,
  onNote,
}: {
  mode: null | 'weight' | 'note';
  onClose: () => void;
  onWeight: (lb: number) => void;
  onNote: (title: string, note: string) => void;
}) {
  const [lb, setLb] = useState('');
  const [title, setTitle] = useState('');
  const [note, setNote] = useState('');

  return (
    <Modal visible={!!mode} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View style={styles.sheet}>
        <View style={styles.grab} />
        <BLText variant="heading" center style={styles.sheetTitle}>
          {mode === 'weight' ? 'Add a weigh-in' : 'Add a vet note'}
        </BLText>

        {mode === 'weight' ? (
          <>
            <TextInput
              value={lb}
              onChangeText={(v) => setLb(v.replace(/[^0-9.]/g, ''))}
              placeholder="Weight in lbs"
              placeholderTextColor={color.textFaint}
              keyboardType="decimal-pad"
              style={styles.input}
            />
            <BLButton
              label="Save"
              disabled={!Number(lb)}
              onPress={() => {
                onWeight(Number(lb));
                setLb('');
              }}
              style={styles.sheetCta}
            />
          </>
        ) : (
          <>
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="Visit or call"
              placeholderTextColor={color.textFaint}
              style={styles.input}
            />
            <TextInput
              value={note}
              onChangeText={setNote}
              placeholder="What did they say?"
              placeholderTextColor={color.textFaint}
              multiline
              style={[styles.input, styles.inputMulti]}
            />
            <BLButton
              label="Save"
              disabled={!title.trim()}
              onPress={() => {
                onNote(title.trim(), note.trim());
                setTitle('');
                setNote('');
              }}
              style={styles.sheetCta}
            />
          </>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: color.bg },

  sectionHead: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: space.x6,
    marginBottom: space.x3,
  },
  addBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: color.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 'auto',
  },

  weightTop: { flexDirection: 'row', alignItems: 'center', gap: space.x3 },
  changePill: { paddingHorizontal: space.x3, paddingVertical: 4, borderRadius: radius.pill },

  chart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: space.x2,
    marginTop: space.x5,
    minHeight: 110,
  },
  chartCol: { flex: 1, alignItems: 'center' },
  chartVal: { marginBottom: 2, color: color.textMuted },
  bar: { width: '70%', borderRadius: 6, backgroundColor: color.badgeBlue },
  chartLabel: { marginTop: space.x2, color: color.textFaint },

  doseNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: space.x5,
    paddingTop: space.x4,
    borderTopWidth: 1,
    borderTopColor: color.borderSoft,
  },
  doseNoteText: { flex: 1, marginLeft: space.x2 },

  notes: { gap: space.x3 },
  noteTitle: { marginTop: space.x1 },
  noteBody: { marginTop: space.x2 },

  backdrop: { flex: 1, backgroundColor: 'rgba(26,26,26,0.35)' },
  sheet: {
    backgroundColor: color.surface,
    borderTopLeftRadius: radius.md,
    borderTopRightRadius: radius.md,
    padding: space.x5,
    paddingBottom: space.x10,
  },
  grab: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: color.border,
    alignSelf: 'center',
  },
  sheetTitle: { marginTop: space.x4, marginBottom: space.x5, color: color.navy },
  input: {
    height: 50,
    borderRadius: radius.input,
    borderWidth: 1,
    borderColor: color.border,
    backgroundColor: color.bg,
    paddingHorizontal: space.x4,
    fontFamily: font.body,
    fontSize: type.base,
    color: color.text,
    marginBottom: space.x3,
  },
  inputMulti: { height: 100, paddingTop: space.x3, textAlignVertical: 'top' },
  sheetCta: { marginTop: space.x2 },
});
