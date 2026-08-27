/**
 * The HTML shell for the static web export.
 *
 * This is what makes the export behave like an app when she taps
 * "Add to Home Screen" in mobile Safari rather than like a web page:
 *  - viewport-fit=cover so safe-area insets work on notched iPhones
 *  - apple-mobile-web-app-capable so it opens without Safari chrome
 *  - a title and theme colour in her brand
 *  - overscroll locked so the page does not rubber-band like a document
 */

import { ScrollViewStyleReset } from 'expo-router/html';
import type { PropsWithChildren } from 'react';

export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1, viewport-fit=cover, shrink-to-fit=no"
        />

        <title>BestLife4Pets</title>

        {/* Home-screen install, iOS */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="BestLife4Pets" />
        <meta name="mobile-web-app-capable" content="yes" />

        {/* Her page ground, so the status bar and overscroll match the app. */}
        <meta name="theme-color" content="#FCFAF9" />

        {/* Her brand fonts, served from her own CDN. See BRAND_FONT_CSS. */}
        <style dangerouslySetInnerHTML={{ __html: BRAND_FONT_CSS }} />

        {/* Resets the html/body so RN's ScrollViews scroll, not the document. */}
        <ScrollViewStyleReset />

        <style dangerouslySetInnerHTML={{ __html: shell }} />
      </head>
      <body>{children}</body>
    </html>
  );
}

/**
 * Her real brand fonts, loaded from her own CDN rather than bundled.
 *
 * Futura and Helvetica Neue are commercial faces she licenses and self-hosts.
 * Serving them from bestlife4pets.com means this demo never redistributes the
 * font binaries, which shipping them inside a public repo would. Her CDN
 * returns `access-control-allow-origin: *` on these, so cross-origin loading
 * works. The family names here must match `font` in constants/theme.ts.
 */
const CDN = 'https://www.bestlife4pets.com/cdn';

const BRAND_FONT_CSS = `
  @font-face { font-family: 'Futura'; font-weight: 400; font-display: swap;
    src: url('${CDN}/shop/files/Futura-Book.woff2?v=1765861963') format('woff2'); }
  @font-face { font-family: 'FuturaMedium'; font-weight: 400; font-display: swap;
    src: url('${CDN}/shop/files/Futura_2fb4d718-e5ea-4d7a-acf1-df266ca61c7e.woff2?v=1765861964') format('woff2'); }
  @font-face { font-family: 'FuturaBold'; font-weight: 400; font-display: swap;
    src: url('${CDN}/shop/files/Futura-Bold.woff2?v=1765861228') format('woff2'); }
  @font-face { font-family: 'FuturaBlack'; font-weight: 400; font-display: swap;
    src: url('${CDN}/shop/files/FuturaBlack.woff2?v=1765861963') format('woff2'); }
  @font-face { font-family: 'HelveticaNeue'; font-weight: 400; font-display: swap;
    src: url('${CDN}/shop/files/HelveticaNeue-Roman.woff2?v=1765457358') format('woff2'); }
  @font-face { font-family: 'HelveticaNeueBold'; font-weight: 400; font-display: swap;
    src: url('${CDN}/shop/files/HelveticaNeue-Bold.woff2?v=1765457285') format('woff2'); }
  @font-face { font-family: 'Jost'; font-weight: 500; font-display: swap;
    src: url('${CDN}/fonts/jost/jost_n5.7c8497861ffd15f4e1284cd221f14658b0e95d61.woff2') format('woff2'); }
`;

const shell = `
  html, body { background-color: #FCFAF9; }
  body {
    overscroll-behavior-y: none;
    -webkit-tap-highlight-color: transparent;
  }
  /* Text selection off, so long-press reads as an app not a web page. */
  body { -webkit-user-select: none; user-select: none; }
  input, textarea { -webkit-user-select: text; user-select: text; }
`;
