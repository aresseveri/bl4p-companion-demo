/**
 * BestLife4Pets brand tokens.
 *
 * Every value here was read off the live site (www.bestlife4pets.com), not invented:
 *  - colors  -> CSS custom properties on the Shopify theme (theme.css / inline :root)
 *  - type    -> computed styles on the rendered homepage
 *  - radii   -> --rounded-* scale on the theme
 *  - fonts   -> her self-hosted woff2 files, loaded from her CDN in public/index.html
 *
 * Screens must read from this file. Do not hardcode a hex anywhere else.
 */

/* ------------------------------------------------------------------ *
 * Color
 * Source: --background, --text-primary, --accent, --header-text, etc.
 * ------------------------------------------------------------------ */
export const color = {
  /** --background: 252 250 249. The page ground on her site. */
  bg: '#FCFAF9',
  /** --background-primary: 247 245 246. Computed <body> background. */
  bgAlt: '#F7F5F6',
  /** Cards sit on white above the warm ground. */
  surface: '#FFFFFF',

  /** --text-primary: 26 26 26 */
  text: '#1A1A1A',
  /** Muted body copy. --text-primary at 62%, flattened over bg. */
  textMuted: '#6B6968',
  /** Fine print. --text-primary at 45%, flattened over bg. */
  textFaint: '#918E8C',

  /** --header-text / --footer-background: 23 57 88. Her deep navy. */
  navy: '#173958',
  /** Navy lightened for pressed/hover states. */
  navySoft: '#24507A',

  /** --accent / --button-background-primary: 252 204 16. The brand yellow. */
  accent: '#FCCC10',
  /** --button-text-primary: 77 77 77. What she puts ON the yellow. */
  onAccent: '#4D4D4D',
  /** --shipping-accent: 253 210 38 */
  accentWarm: '#FDD226',

  /** --body-link-color: 25 123 189 */
  link: '#197BBD',
  /** --body-link-hover-color: 28 146 226 */
  linkHover: '#1C92E2',
  /** --primary-badge-background: 41 120 187 */
  badgeBlue: '#2978BB',
  /** --primary-badge-text */
  onBadgeBlue: '#FFFFFF',

  /** --star-color: 255 183 74 */
  star: '#FFB74A',

  /** --success-text: 0 163 65 / --success-background: 224 244 232 */
  success: '#00A341',
  successBg: '#E0F4E8',
  /** --on-sale-text / --error-text: 248 58 58, bg 254 231 231 */
  sale: '#F83A3A',
  saleBg: '#FEE7E7',
  /** --warning-text: 255 183 74 / --warning-background: 255 246 233 */
  warning: '#FFB74A',
  warningBg: '#FFF6E9',

  /** --border-color: --text-primary / 0.12, flattened over bg. */
  border: '#E3DFDD',
  /** Hairline dividers inside cards. */
  borderSoft: '#EFEBE9',

  white: '#FFFFFF',
  black: '#000000',
} as const;

/* ------------------------------------------------------------------ *
 * Type
 *
 * Her real stack, confirmed by computed styles on the live homepage:
 *   Futura        -> all display / headings / product titles (the brand face)
 *   Helvetica Neue-> sub-headings, labels, meta, small print
 *   Helvetica     -> body copy and buttons (700, uppercase)
 *   Jost          -> vestigial Shopify theme default, one footer element.
 *                    Kept only so nothing that references it breaks.
 *
 * Note: Futura on her site is a self-hosted webfont with weights
 * 100/400/500/700/900, but those numbers do not describe how the files look.
 * Her 500 is visually a Book weight; her 700 is the first genuinely bold cut;
 * her 900 is the decorative Art Deco Futura Black, not a heavy Futura. See
 * the note on `font` below for which face each heading actually uses.
 * ------------------------------------------------------------------ */
export const font = {
  /**
   * Display / headings.
   *
   * Weight note, because her file names mislead. Her @font-face weight 500
   * (Futura_2fb4d718) is visually a BOOK weight, barely heavier than her 400.
   * She gets away with it on desktop at 32px, but at phone heading sizes it
   * reads thin and weak. Her own small headings (h3.sbc-title, "Shop by
   * Concern", 18px navy) use Futura 700, so headings here use `displayBold`
   * to match that treatment.
   *
   * `displayBlack` is her FuturaBlack file, which is the decorative Art Deco
   * Futura Black, not a heavy Futura. Do not use it for text.
   */
  display: 'Futura',
  /** Her weight-500 file. Book-ish. Only for large, airy headings. */
  displayBook: 'FuturaMedium',
  /** Her weight-700 file. The correct face for headings at phone sizes. */
  displayBold: 'FuturaBold',
  /** Decorative Art Deco face. Reserved, unused. */
  displayBlack: 'FuturaBlack',
  /** Sub-headings and meta. */
  neue: 'HelveticaNeue',
  neueBold: 'HelveticaNeueBold',
  /** Body + buttons. Real Helvetica on iOS, falls back on other platforms. */
  body: 'Helvetica, Arial, sans-serif',
  /** Vestigial. Present on her site, effectively unused. */
  jost: 'Jost',
} as const;

/**
 * Type scale.
 * --text-h1..h6 / --text-base / --text-sm / --text-xs from her theme,
 * shifted to the mobile end of her responsive ramp since this is a phone app.
 */
export const type = {
  h0: 40, // --text-h0 mobile: 2.5rem
  h1: 28, // --text-h1 mobile: 1.75rem
  h2: 24, // --text-h2 mobile: 1.5rem
  h3: 22, // --text-h3 mobile: 1.375rem
  h4: 18, // --text-h4 mobile: 1.125rem
  h5: 18, // --text-h5
  h6: 16, // --text-h6 mobile: 1rem
  base: 16, // --text-base
  lg: 20, // --text-lg
  sm: 14, // --text-sm
  xs: 12, // --text-xs
} as const;

/**
 * Line heights. Her body copy computes to 25.6px on 16px, i.e. 1.6.
 * Headings are tighter.
 */
export const leading = {
  tight: 1.15,
  heading: 1.2,
  snug: 1.35,
  body: 1.6,
} as const;

/* ------------------------------------------------------------------ *
 * Radius — her --rounded-* scale, verbatim.
 * ------------------------------------------------------------------ */
export const radius = {
  xs: 4, // --rounded-xs: 0.25rem
  input: 8, // --rounded-input: 0.5rem
  sm: 11, // --rounded-sm: 0.6875rem
  card: 16, // computed .product-card border-radius
  md: 22, // --rounded: 1.375rem
  lg: 44, // --rounded-lg: 2.75rem
  pill: 60, // --rounded-button: 3.75rem, computed 60px
  full: 9999, // --rounded-full
} as const;

/* ------------------------------------------------------------------ *
 * Spacing — her --spacing-N scale (N * 0.25rem = N * 4px).
 * ------------------------------------------------------------------ */
export const space = {
  x1: 4,
  x2: 8,
  x3: 12,
  x4: 16,
  x5: 20,
  x6: 24,
  x8: 32,
  x10: 40,
  x12: 48,
  x14: 56,
  x16: 64,
  x20: 80,
} as const;

/* ------------------------------------------------------------------ *
 * Elevation — her --shadow-* set, translated to RN shadow props.
 * ------------------------------------------------------------------ */
export const shadow = {
  /** --shadow-sm: 0 2px 8px rgb(26 26 26 / .1) */
  sm: {
    shadowColor: color.text,
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  /** --shadow: 0 5px 15px rgb(26 26 26 / .1) */
  base: {
    shadowColor: color.text,
    shadowOpacity: 0.1,
    shadowRadius: 15,
    shadowOffset: { width: 0, height: 5 },
    elevation: 4,
  },
  /** --shadow-md: 0 5px 30px rgb(26 26 26 / .1) */
  md: {
    shadowColor: color.text,
    shadowOpacity: 0.1,
    shadowRadius: 30,
    shadowOffset: { width: 0, height: 5 },
    elevation: 6,
  },
  /** --shadow-block: 0 18px 50px rgb(26 26 26 / .1) */
  block: {
    shadowColor: color.text,
    shadowOpacity: 0.1,
    shadowRadius: 50,
    shadowOffset: { width: 0, height: 18 },
    elevation: 10,
  },
} as const;

/* ------------------------------------------------------------------ *
 * Button — computed off her live .button element.
 * padding 16px 32px, radius 60, Helvetica 700 uppercase 16px.
 * ------------------------------------------------------------------ */
export const button = {
  height: 54,
  paddingH: space.x8,
  radius: radius.pill,
  fontSize: type.base,
  fontWeight: '700' as const,
  textTransform: 'uppercase' as const,
} as const;

/* ------------------------------------------------------------------ *
 * Brand copy — her words, taken from the site. Not paraphrased.
 * ------------------------------------------------------------------ */
export const brand = {
  name: 'BestLife4Pets',
  tagline: 'Help Your Pets Live Their Best Life & Stay Healthy Longer',
  eyebrow: 'All Natural Pet Supplements',
  /** Her announcement bar, verbatim. */
  shippingBar:
    'FREE Standard Shipping On All Orders Over $64.99 - 60 Day No Hassle Returns',
  /** The trust block on her homepage, verbatim (label + her own subline). */
  trust: [
    { label: 'Made in USA', detail: 'Premium ingredients, strict quality control.' },
    { label: '60-Day Guarantee', detail: 'Love it or get your money back.' },
    { label: 'Vet-Approved', detail: 'Expertly crafted for safe daily use.' },
    { label: 'Family-Owned, Pet-Loved', detail: 'Real people who care deeply.' },
    { label: 'No Animal Testing', detail: 'Kind to animals, kind to pets.' },
    {
      label: '100% Natural Ingredients',
      detail: 'Pure botanical extracts, gentle and effective',
    },
  ],
  socialProof: 'Loved by 500k+ Pet Parents Worldwide',
  site: 'https://www.bestlife4pets.com',
} as const;

/** Phone frame width the web export is sized to. */
export const PHONE_MAX_WIDTH = 440;

export const theme = {
  color,
  font,
  type,
  leading,
  radius,
  space,
  shadow,
  button,
  brand,
} as const;

export default theme;
