/**
 * ============================================================
 *  DEMO SEED DATA  --  THE ONLY FILE YOU EDIT BEFORE THE CALL
 * ============================================================
 *
 * Swap the founder's own pet in here. Nothing else needs touching:
 * every screen reads from this file.
 *
 * The three things you will most likely change are marked  <-- SWAP
 */

import type { PhotoRef } from '@/lib/img';

import { PRODUCTS } from './products';

/**
 * ---------------------------------------------------------------
 *  AI-GENERATED PLACEHOLDER PHOTOS  --  READ BEFORE THE CALL
 * ---------------------------------------------------------------
 * The four photos in assets/progress/ are AI-generated (Higgsfield,
 * nano_banana_2) images of one invented dog. They exist so the timeline and
 * the before/after view read as a real progress log instead of the same
 * photo four times.
 *
 * They are NOT customers and NOT evidence. They deliberately show the same
 * healthy dog on four different days in four settings — they do not depict a
 * sick pet becoming a well one, because a fabricated health transformation
 * for a supplement could be mistaken for a real testimonial if it ever left
 * this demo. Keep it that way if you regenerate them.
 *
 * Replace with the founder's own pet before the call.
 */

export interface DemoPet {
  name: string;
  species: 'dog' | 'cat';
  breed: string;
  weightLb: number;
  birthYear: number;
  /** An https URL or a bundled local asset via require(). */
  photo: PhotoRef;
  /** Which SKU they bought. Must be an id from products.ts. */
  productId: string;
}

/** <-- SWAP: the founder's pet goes here. */
export const DEMO_PET: DemoPet = {
  name: 'Rosie',
  species: 'dog',
  breed: 'English Bulldog',
  weightLb: 52,
  birthYear: 2018,
  // The most recent of the four generated photos, so the avatar and the end
  // of the progress timeline are the same dog.
  photo: require('../../assets/progress/rosie-04.jpg'),
  productId: 'walk-easy',
};

/** <-- SWAP: the pet parent's name, used in a couple of greetings. */
export const DEMO_OWNER_FIRST_NAME = 'Sam';

/** <-- SWAP: how many days running they have marked a dose given. */
export const DEMO_STREAK_DAYS = 12;

/**
 * Dose history for the 30-day grid on the Dose Detail screen.
 * `true` = marked as given. Index 0 is 29 days ago, last index is today.
 *
 * Today is deliberately left UNGIVEN so the founder can tap "Mark as given"
 * on the Home screen and watch the streak tick up. That tap is the demo.
 */
export const DEMO_HISTORY: boolean[] = buildHistory(30, DEMO_STREAK_DAYS, [17, 21, 22]);

function buildHistory(days: number, streak: number, missedDaysAgo: number[]): boolean[] {
  const out: boolean[] = [];
  for (let i = 0; i < days; i++) {
    const daysAgo = days - 1 - i;
    if (daysAgo === 0) out.push(false); // today, waiting to be tapped
    else if (daysAgo <= streak) out.push(true); // the current streak
    else out.push(!missedDaysAgo.includes(daysAgo));
  }
  return out;
}

/**
 * When the current bottle was started. Drives the reorder nudge.
 *
 * Tune this against DEMO_BOTTLE_PILLS. On WALK-EASY a 52 lb dog takes
 * 2 pills twice a day, so a 180-tablet bottle is 45 days; 31 days in leaves
 * about two weeks and the nudge reads sensibly on the call.
 */
export const DEMO_BOTTLE_STARTED_DAYS_AGO = 31;

/**
 * <-- SWAP: how many pills are in the bottle the founder actually has.
 *
 * Read it off her label. Her counts differ per SKU and her site does not
 * state them consistently, so this is NOT derived: the WALK-EASY product
 * photo reads 180 tablets, Peaceful Paws reads 400, and the dental page says
 * 450 pills in the copy while its own image is named 400_TABLETS.
 *
 * 180 here matches the WALK-EASY bottle in her own product photo, which is
 * the SKU this demo pet is on. If you change DEMO_PET.productId, change this
 * too, or set it to null and the reorder nudge simply drops the day count
 * instead of showing a number nobody can source.
 */
export const DEMO_BOTTLE_PILLS: number | null = 180;

/** Reminder time shown on the Dose Detail screen. UI state only, nothing is scheduled. */
export const DEMO_REMINDER_TIME = { hour: 8, minute: 0 };

export interface ProgressEntry {
  /** ISO date. Shown as "Mar 4" etc. */
  date: string;
  photo: PhotoRef;
  /** Optional one-line note from the pet parent. */
  note?: string;
}

/**
 * <-- SWAP: progress photos. STILL THE HIGHEST-VALUE EDIT BEFORE THE CALL.
 *
 * Four AI-generated photos of one invented dog (see the note at the top of
 * this file), oldest first. Same animal, four different days and settings, so
 * the timeline and the before/after compare read like a real log.
 *
 * Why generated rather than sourced: her site has no same-pet progression
 * photos anywhere, and seeding four different real customer pets made the
 * compare view show a bulldog next to two black cats, which reads as a broken
 * app. These are clearly placeholders, not customers.
 *
 * Swap in four real photos of the founder's own pet taken weeks apart.
 */
export const DEMO_PROGRESS: ProgressEntry[] = [
  {
    date: '2026-06-14',
    photo: require('../../assets/progress/rosie-01.jpg'),
    note: 'Day one. Stiff getting up from her bed in the mornings.',
  },
  {
    date: '2026-07-05',
    photo: require('../../assets/progress/rosie-02.jpg'),
    note: 'Three weeks in. Taking the back steps on her own again.',
  },
  {
    date: '2026-07-26',
    photo: require('../../assets/progress/rosie-03.jpg'),
    note: 'Beach walk, no limp afterwards.',
  },
  {
    date: '2026-08-23',
    photo: require('../../assets/progress/rosie-04.jpg'),
    note: 'Two months. Back to meeting me at the door.',
  },
];

/** The pet's product, resolved. */
export const demoProduct = () =>
  PRODUCTS.find((p) => p.id === DEMO_PET.productId) ?? PRODUCTS[0];

export default DEMO_PET;
