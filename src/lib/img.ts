/**
 * Photos in demo.ts can be either a remote URL (her CDN) or a bundled local
 * asset via require(). This normalises both into something <Image> accepts.
 */

import type { ImageSource } from 'expo-image';

/** What demo.ts may hold for a photo: an https URL, or a require()'d asset. */
export type PhotoRef = string | number;

export function imgSource(photo: PhotoRef): ImageSource | number {
  return typeof photo === 'string' ? { uri: photo } : photo;
}
