/**
 * Typography primitives that map 1:1 onto how her site sets type.
 * Nothing else in the app should set fontFamily directly.
 */

import { Text as RNText, StyleSheet, type TextProps } from 'react-native';

import { color, font, leading, type } from '@/constants/theme';

type Variant =
  /** Futura 700, matching her h3 heading treatment at small sizes. */
  | 'display'
  /** Futura 700 uppercase. Her product card titles. */
  | 'title'
  /** Futura 700. Smaller headings. */
  | 'heading'
  /** Helvetica Neue 700. Her sub-headings and labels. */
  | 'label'
  /** Helvetica 400. Body copy. */
  | 'body'
  /** Helvetica 700. Emphasised body. */
  | 'bodyBold'
  /** Helvetica Neue 400, small. Meta, dates, fine print. */
  | 'meta'
  /** Helvetica Neue 700 uppercase, small. Eyebrows. */
  | 'eyebrow';

export interface BLTextProps extends TextProps {
  variant?: Variant;
  /** Overrides the variant colour. */
  tone?: keyof typeof color;
  size?: number;
  center?: boolean;
}

export function BLText({
  variant = 'body',
  tone,
  size,
  center,
  style,
  ...rest
}: BLTextProps) {
  return (
    <RNText
      {...rest}
      style={[
        styles[variant],
        size != null && { fontSize: size, lineHeight: size * lineFactor(variant) },
        tone && { color: color[tone] as string },
        center && { textAlign: 'center' },
        style,
      ]}
    />
  );
}

function lineFactor(v: Variant) {
  if (v === 'display' || v === 'title' || v === 'heading') return leading.heading;
  if (v === 'meta' || v === 'eyebrow') return leading.snug;
  return leading.body;
}

const styles = StyleSheet.create({
  display: {
    fontFamily: font.displayBold,
    fontSize: type.h1,
    lineHeight: type.h1 * leading.heading,
    color: color.text,
  },
  title: {
    fontFamily: font.displayBold,
    fontSize: type.h4,
    lineHeight: type.h4 * leading.heading,
    textTransform: 'uppercase',
    color: color.text,
  },
  heading: {
    fontFamily: font.displayBold,
    fontSize: type.h3,
    lineHeight: type.h3 * leading.heading,
    color: color.text,
  },
  label: {
    fontFamily: font.neueBold,
    fontSize: type.base,
    lineHeight: type.base * leading.snug,
    color: color.text,
  },
  body: {
    fontFamily: font.body,
    fontSize: type.base,
    lineHeight: type.base * leading.body,
    color: color.text,
  },
  bodyBold: {
    fontFamily: font.body,
    fontWeight: '700',
    fontSize: type.base,
    lineHeight: type.base * leading.body,
    color: color.text,
  },
  meta: {
    fontFamily: font.neue,
    fontSize: type.sm,
    lineHeight: type.sm * leading.snug,
    color: color.textMuted,
  },
  eyebrow: {
    fontFamily: font.neueBold,
    fontSize: type.xs,
    lineHeight: type.xs * leading.snug,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    color: color.textMuted,
  },
});

export default BLText;
