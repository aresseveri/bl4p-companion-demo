/**
 * Dose resolution.
 *
 * This file contains NO dosing numbers. Every value comes out of the bands
 * transcribed from her labels in constants/products.ts. If a pet does not
 * fall inside a printed band, this returns `null` and the UI says so rather
 * than extrapolating a dose she never printed.
 */

import type { DoseBand, Product, Species } from '@/constants/products';

export interface PetLike {
  species: Species;
  weightLb: number;
  birthYear: number;
}

/** Under a year old. Used only for the cat/kitten split her label prints. */
export function isJuvenile(pet: PetLike, now = new Date()): boolean {
  return now.getFullYear() - pet.birthYear < 1;
}

export interface ResolvedDose {
  band: DoseBand;
  /** Her exact band wording, for showing provenance in the UI. */
  bandLabel: string;
  /** Her exact dose wording, e.g. "6 pills twice a day". */
  text: string;
  pills: string;
  timesPerDay: number;
  /** True when the label bands by life stage rather than weight. */
  byLifeStage: boolean;
}

/**
 * Resolve the printed dose for this pet and product.
 *
 * Returns null when her label has no band covering this pet, which happens
 * for e.g. a cat over 25 lbs on the Ear Infection SKU. The caller must show
 * the product's `labelNote` and point at her directions instead of guessing.
 */
export function doseFor(product: Product, pet: PetLike): ResolvedDose | null {
  const forSpecies = product.dosing.filter((b) => b.species.includes(pet.species));
  if (forSpecies.length === 0) return null;

  // Life-stage banding (Cat Allergy: "For Cats" / "For Kittens"). Detected by
  // every band spanning the full weight range, i.e. weight is not the axis.
  const byLifeStage =
    forSpecies.length > 1 &&
    forSpecies.every((b) => b.minLb === 0 && b.maxLb === null);

  if (byLifeStage) {
    const juvenile = isJuvenile(pet);
    const band =
      forSpecies.find((b) => /kitten|puppy/i.test(b.label)) ?? forSpecies[0];
    const adult =
      forSpecies.find((b) => !/kitten|puppy/i.test(b.label)) ?? forSpecies[0];
    const chosen = juvenile ? band : adult;
    return {
      band: chosen,
      bandLabel: chosen.label,
      text: chosen.text,
      pills: chosen.pills,
      timesPerDay: chosen.timesPerDay,
      byLifeStage: true,
    };
  }

  const match = forSpecies.find(
    (b) => pet.weightLb >= b.minLb && (b.maxLb === null || pet.weightLb < b.maxLb),
  );
  if (!match) return null;

  return {
    band: match,
    bandLabel: match.label,
    text: match.text,
    pills: match.pills,
    timesPerDay: match.timesPerDay,
    byLifeStage: false,
  };
}

/**
 * Her band labels are not written to a single pattern. Weight bands read
 * "Medium dogs (25-60 lbs)", but the life-stage bands on Cat Allergy read
 * "For Cats" and "For Kittens". Prefixing every one with "for" produced
 * "for for cats", so strip a leading "for" when the label already has one.
 */
export function bandPhrase(bandLabel: string): string {
  const lower = bandLabel.toLowerCase();
  return lower.startsWith('for ') ? lower.slice(4) : lower;
}

/** "twice a day" / "three times a day", matching how she writes it. */
export function frequencyWord(timesPerDay: number): string {
  if (timesPerDay === 1) return 'once a day';
  if (timesPerDay === 2) return 'twice a day';
  if (timesPerDay === 3) return 'three times a day';
  return `${timesPerDay} times a day`;
}

/**
 * Whether this SKU runs on a fixed daily schedule or is given before an event.
 * Peaceful Paws is the event-driven one.
 */
export function isAsNeeded(product: Product): boolean {
  return product.id === 'peaceful-paws';
}

/**
 * Rough days of supply in a bottle, for the reorder nudge.
 *
 * `bottlePills` MUST come from the label of the bottle in front of you. It is
 * not hardcoded here because her bottle counts differ per SKU and are not
 * stated consistently on her site: the WALK-EASY photo reads 180 tablets,
 * Peaceful Paws reads 400, and the dental page says 450 pills in the body
 * copy while its own image file is named 400_TABLETS. Assuming one number for
 * the whole line produced a "days left" figure that was simply invented.
 *
 * Returns null when the count is unknown, and the UI then shows a reorder
 * nudge with no day count rather than a made-up one.
 */
export function daysOfSupply(
  dose: ResolvedDose | null,
  bottlePills: number | null,
): number | null {
  if (!dose || !bottlePills || bottlePills <= 0) return null;
  // Use the low end of a range like "2-3" so the nudge is not alarmist.
  const low = parseInt(dose.pills.split('-')[0], 10);
  if (!Number.isFinite(low) || low <= 0) return null;
  const perDay = low * dose.timesPerDay;
  if (perDay <= 0) return null;
  return Math.floor(bottlePills / perDay);
}
