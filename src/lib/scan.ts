/**
 * Scan the bottle to identify which of her remedies you have.
 *
 * Her SKUs are matched by barcode. The map below is EMPTY on purpose: I do
 * not have her real GTINs, and inventing barcodes would mean the scanner
 * confidently selects the wrong product. Fill these in from the bottles and
 * scanning starts working with no other change.
 *
 * Until then the scanner still opens, reads a code, and tells you honestly
 * that the code is not one we recognise, which is the correct behaviour for
 * an unknown barcode anyway.
 */

/** Map of barcode value -> product id from products.ts. */
export const BARCODE_TO_PRODUCT: Record<string, string> = {
  // '850012345678': 'walk-easy',
  // '850012345685': 'dental',
  // '850012345692': 'ear',
  // '850012345708': 'cat-allergy',
  // '850012345715': 'peaceful-paws',
};

export function productForBarcode(code: string): string | null {
  return BARCODE_TO_PRODUCT[code.trim()] ?? null;
}

export const hasBarcodeData = Object.keys(BARCODE_TO_PRODUCT).length > 0;
