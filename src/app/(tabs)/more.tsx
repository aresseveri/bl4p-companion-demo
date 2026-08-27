/**
 * More: the native surfaces plus settings.
 *
 * The widget and the Siri shortcut cannot run inside a web export, so this
 * screen renders an honest preview of each and says plainly where it works.
 * They are the strongest answers to App Store guideline 4.2, which is why
 * they are shown to the founder rather than left as a bullet on a roadmap.
 */

import { useRouter } from 'expo-router';
import { Platform, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Card, Page } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { BLText } from '@/components/ui/text';
import { productById } from '@/constants/products';
import { color, radius, shadow, space, type } from '@/constants/theme';
import { doseFor, isAsNeeded } from '@/lib/dosing';
import { useDemo } from '@/lib/store';

const isWeb = Platform.OS === 'web';

export default function More() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { pet, pets, resetDemo, email } = useDemo();

  const product = productById(pet.productId);
  const dose = product ? doseFor(product, pet) : null;
  const givenToday = pet.history[pet.history.length - 1];

  return (
    <View style={styles.flex}>
      <Page contentStyle={{ paddingTop: insets.top + space.x4 }}>
        <BLText variant="display" size={type.h2} style={{ color: color.navy }}>
          More
        </BLText>

        {/* Home screen widget */}
        <BLText variant="eyebrow" style={styles.sectionLabel}>
          Home screen widget
        </BLText>
        <View style={styles.widgetStage}>
          <View style={styles.widget}>
            <View style={styles.widgetTop}>
              <Icon name="paw" size={14} color={color.navy} />
              <BLText variant="label" size={11} style={styles.widgetName} numberOfLines={1}>
                {pet.name}
              </BLText>
            </View>
            <BLText variant="display" size={19} style={styles.widgetDose} numberOfLines={2}>
              {dose ? dose.text.replace(/ a day$/, '') : 'See label'}
            </BLText>
            <View style={styles.widgetFoot}>
              <View
                style={[
                  styles.widgetPill,
                  { backgroundColor: givenToday ? color.successBg : color.accent },
                ]}
              >
                <BLText
                  variant="label"
                  size={10}
                  style={{ color: givenToday ? color.success : color.onAccent }}
                >
                  {givenToday ? 'DONE' : 'DUE'}
                </BLText>
              </View>
              <BLText variant="meta" size={10} style={styles.widgetStreak}>
                {pet.streak} day streak
              </BLText>
            </View>
          </View>
        </View>
        <BLText variant="meta" size={12} tone="textFaint" style={styles.caption}>
          {isWeb
            ? 'A preview. Widgets are an installed-app feature, so this one is drawn here rather than live.'
            : 'Add it from your home screen: long press, tap the plus, search BestLife4Pets.'}
        </BLText>

        {/* Siri */}
        <BLText variant="eyebrow" style={styles.sectionLabel}>
          Hands free
        </BLText>
        <Card>
          <View style={styles.siriRow}>
            <View style={styles.siriOrb} />
            <View style={styles.siriText}>
              <BLText variant="label" size={type.sm}>
                “Hey Siri, mark {pet.name}’s dose given”
              </BLText>
              <BLText variant="meta" size={12} style={styles.siriSub}>
                {isWeb
                  ? 'Voice shortcuts are an installed-app feature.'
                  : 'Works once you have marked a dose in the app.'}
              </BLText>
            </View>
          </View>
        </Card>

        {/* Scan */}
        <BLText variant="eyebrow" style={styles.sectionLabel}>
          Your remedies
        </BLText>
        <Pressable onPress={() => router.push('/scan')}>
          <Card style={styles.row}>
            <Icon name="camera" size={20} color={color.navy} />
            <View style={styles.rowText}>
              <BLText variant="label" size={type.sm}>
                Scan a bottle
              </BLText>
              <BLText variant="meta" size={12} style={styles.siriSub}>
                {product
                  ? `${pet.name} is on ${product.shortName}${
                      isAsNeeded(product) ? ', as needed' : ''
                    }`
                  : 'Pick a remedy'}
              </BLText>
            </View>
            <Icon name="chevron-right" size={18} color={color.textFaint} />
          </Card>
        </Pressable>

        <Pressable onPress={() => router.push('/health')}>
          <Card style={[styles.row, styles.rowGap]}>
            <Icon name="clock" size={20} color={color.navy} />
            <View style={styles.rowText}>
              <BLText variant="label" size={type.sm}>
                Health log
              </BLText>
              <BLText variant="meta" size={12} style={styles.siriSub}>
                Weight history and vet notes
              </BLText>
            </View>
            <Icon name="chevron-right" size={18} color={color.textFaint} />
          </Card>
        </Pressable>

        {/* Privacy, which is the honest selling point here */}
        <BLText variant="eyebrow" style={styles.sectionLabel}>
          Your data
        </BLText>
        <Card>
          <BLText variant="body" size={type.sm} tone="textMuted">
            {pets.length} pet{pets.length === 1 ? '' : 's'}, their doses, photos
            and notes are stored on this device only. There is no account and
            no server.{email ? ` We have ${email} for your care plan.` : ''}
          </BLText>
          <Pressable onPress={resetDemo} style={styles.reset} hitSlop={8}>
            <BLText variant="meta" style={{ color: color.link }}>
              Reset this demo
            </BLText>
          </Pressable>
        </Card>
      </Page>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: color.bg },
  sectionLabel: { marginTop: space.x8, marginBottom: space.x3 },
  caption: { marginTop: space.x3, lineHeight: 17 },

  widgetStage: {
    backgroundColor: color.bgAlt,
    borderRadius: radius.md,
    paddingVertical: space.x8,
    alignItems: 'center',
  },
  widget: {
    width: 150,
    height: 150,
    borderRadius: 22,
    backgroundColor: color.surface,
    padding: space.x4,
    justifyContent: 'space-between',
    ...shadow.md,
  },
  widgetTop: { flexDirection: 'row', alignItems: 'center' },
  widgetName: { marginLeft: space.x2, color: color.navy },
  widgetDose: { color: color.navy },
  widgetFoot: { flexDirection: 'row', alignItems: 'center' },
  widgetPill: { paddingHorizontal: space.x2, paddingVertical: 3, borderRadius: radius.pill },
  widgetStreak: { marginLeft: space.x2 },

  siriRow: { flexDirection: 'row', alignItems: 'center' },
  siriOrb: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: color.badgeBlue,
    opacity: 0.85,
  },
  siriText: { flex: 1, marginLeft: space.x3 },
  siriSub: { marginTop: 2 },

  row: { flexDirection: 'row', alignItems: 'center' },
  rowGap: { marginTop: space.x3 },
  rowText: { flex: 1, marginLeft: space.x3 },

  reset: { marginTop: space.x4 },
});
