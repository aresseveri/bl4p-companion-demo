/**
 * An iOS-style scrolling time picker: hour, minute, AM/PM.
 *
 * Built by hand rather than using the platform picker because this ships as
 * a web export, and the native picker degrades to an HTML time input in a
 * browser, which looks nothing like the rest of the app. A custom wheel
 * behaves identically on the phone and in the browser.
 *
 * Snapping is handled manually on a debounce rather than through
 * snapToInterval, because momentum-scroll end events are not reliable on
 * react-native-web.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';

import { color, font, radius, space } from '@/constants/theme';

import { BLText } from './text';

const ITEM_H = 44;
/** Odd, so one row sits dead centre. */
const VISIBLE = 5;
const HEIGHT = ITEM_H * VISIBLE;
const PAD = (HEIGHT - ITEM_H) / 2;

export interface Time {
  hour: number;
  minute: number;
}

export function TimeWheel({
  value,
  onChange,
}: {
  value: Time;
  onChange: (t: Time) => void;
}) {
  const hours = Array.from({ length: 12 }, (_, i) => i + 1);
  const minutes = Array.from({ length: 60 }, (_, i) => i);
  const meridiems = ['AM', 'PM'];

  const h12 = value.hour % 12 === 0 ? 12 : value.hour % 12;
  const isPm = value.hour >= 12;

  const commit = (nextH12: number, nextMin: number, nextPm: boolean) => {
    const base = nextH12 % 12; // 12 -> 0
    const hour = nextPm ? base + 12 : base;
    onChange({ hour, minute: nextMin });
  };

  return (
    <View style={styles.wrap}>
      {/* The selection band, drawn behind the columns. */}
      <View pointerEvents="none" style={styles.band} />

      <View style={styles.columns}>
        <Column
          values={hours.map(String)}
          index={hours.indexOf(h12)}
          onIndex={(i) => commit(hours[i], value.minute, isPm)}
          align="right"
        />
        <BLText variant="display" size={22} style={styles.colon}>
          :
        </BLText>
        <Column
          values={minutes.map((m) => String(m).padStart(2, '0'))}
          index={value.minute}
          onIndex={(i) => commit(h12, minutes[i], isPm)}
          align="left"
        />
        <Column
          values={meridiems}
          index={isPm ? 1 : 0}
          onIndex={(i) => commit(h12, value.minute, i === 1)}
          align="left"
          narrow
        />
      </View>

      {/* Fades top and bottom, so the wheel reads as continuous. */}
      <View pointerEvents="none" style={[styles.fade, styles.fadeTop]} />
      <View pointerEvents="none" style={[styles.fade, styles.fadeBottom]} />
    </View>
  );
}

function Column({
  values,
  index,
  onIndex,
  align,
  narrow,
}: {
  values: string[];
  index: number;
  onIndex: (i: number) => void;
  align: 'left' | 'right';
  narrow?: boolean;
}) {
  const ref = useRef<ScrollView>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const settling = useRef(false);
  const [active, setActive] = useState(index);

  // Keep the wheel in sync when the value changes from outside.
  useEffect(() => {
    setActive(index);
    if (settling.current) return;
    ref.current?.scrollTo({ y: index * ITEM_H, animated: false });
  }, [index]);

  const snap = useCallback(
    (y: number) => {
      const i = Math.max(0, Math.min(values.length - 1, Math.round(y / ITEM_H)));
      settling.current = true;
      ref.current?.scrollTo({ y: i * ITEM_H, animated: true });
      onIndex(i);
      setTimeout(() => {
        settling.current = false;
      }, 240);
    },
    [onIndex, values.length],
  );

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const y = e.nativeEvent.contentOffset.y;
    // Light-up the row under the band while dragging.
    const i = Math.max(0, Math.min(values.length - 1, Math.round(y / ITEM_H)));
    setActive(i);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => snap(y), 110);
  };

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  return (
    <ScrollView
      ref={ref}
      style={[styles.col, narrow && styles.colNarrow]}
      contentContainerStyle={{ paddingVertical: PAD }}
      showsVerticalScrollIndicator={false}
      onScroll={onScroll}
      scrollEventThrottle={16}
      // Native gets real snapping; web is handled by the debounce above.
      {...(Platform.OS === 'web'
        ? {}
        : { snapToInterval: ITEM_H, decelerationRate: 'fast' as const })}
    >
      {values.map((v, i) => {
        const dist = Math.abs(i - active);
        const on = dist === 0;
        return (
          <Pressable
            key={v}
            onPress={() => {
              ref.current?.scrollTo({ y: i * ITEM_H, animated: true });
              onIndex(i);
            }}
            style={styles.item}
            accessibilityRole="button"
            accessibilityLabel={v}
          >
            <BLText
              variant={on ? 'display' : 'body'}
              size={on ? 24 : 20}
              style={[
                styles.itemText,
                { textAlign: align },
                {
                  color: on ? color.navy : color.textFaint,
                  // Falls away with distance, like the real wheel.
                  opacity: on ? 1 : Math.max(0.25, 1 - dist * 0.32),
                },
              ]}
            >
              {v}
            </BLText>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

/** "8:00 AM", matching how the wheel reads. */
export function fmtTime({ hour, minute }: Time) {
  const ampm = hour < 12 ? 'AM' : 'PM';
  const h = hour % 12 === 0 ? 12 : hour % 12;
  return `${h}:${String(minute).padStart(2, '0')} ${ampm}`;
}

const styles = StyleSheet.create({
  wrap: {
    height: HEIGHT,
    justifyContent: 'center',
    overflow: 'hidden',
  },
  band: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: PAD,
    height: ITEM_H,
    borderRadius: radius.input,
    backgroundColor: color.bgAlt,
  },
  columns: { flexDirection: 'row', alignItems: 'stretch', justifyContent: 'center' },
  col: { width: 60, height: HEIGHT },
  /* AM/PM sits a little apart from the digits, as it does on iOS. */
  colNarrow: { width: 58, marginLeft: space.x4 },
  colon: {
    color: color.navy,
    alignSelf: 'center',
    marginHorizontal: 2,
    marginBottom: 2,
  },
  item: { height: ITEM_H, justifyContent: 'center', paddingHorizontal: space.x1 },
  itemText: { fontFamily: font.displayBold },

  fade: { position: 'absolute', left: 0, right: 0, height: PAD },
  fadeTop: { top: 0, backgroundColor: color.surface, opacity: 0.72 },
  fadeBottom: { bottom: 0, backgroundColor: color.surface, opacity: 0.72 },
});

export default TimeWheel;
