/**
 * ============================================================
 *  DEMO SEED DATA  --  THE ONLY FILE YOU EDIT BEFORE THE CALL
 * ============================================================
 *
 * Swap the founder's own pets in here. Nothing else needs touching:
 * every screen reads from this file. Items marked  <-- SWAP  are the ones
 * you are most likely to change.
 *
 * ---------------------------------------------------------------
 *  AI-GENERATED PLACEHOLDER PHOTOS  --  READ BEFORE THE CALL
 * ---------------------------------------------------------------
 * The photos in assets/progress/ are AI-generated (Higgsfield,
 * nano_banana_2) images of one invented dog. They exist so the timeline and
 * the before/after view read as a real progress log instead of the same
 * photo four times.
 *
 * They are NOT customers and NOT evidence. They deliberately show the same
 * healthy dog on four different days in four settings, and do not depict a
 * sick pet becoming a well one, because a fabricated health transformation
 * for a supplement could be mistaken for a real testimonial if it ever left
 * this demo. Keep it that way if you regenerate them.
 */

import type { PhotoRef } from '@/lib/img';

const PHOTOS = {
  bed: require('../../assets/progress/rosie-01.jpg'),
  steps: require('../../assets/progress/rosie-02.jpg'),
  beach: require('../../assets/progress/rosie-03.jpg'),
  door: require('../../assets/progress/rosie-04.jpg'),
} as const;

export interface ProgressEntry {
  /** ISO date, YYYY-MM-DD. */
  date: string;
  photo: PhotoRef;
  /** Optional one-line note from the pet parent. */
  note?: string;
}

export interface WeightEntry {
  date: string;
  lb: number;
}

export interface VetNote {
  date: string;
  title: string;
  note: string;
}

export interface Pet {
  id: string;
  name: string;
  species: 'dog' | 'cat';
  breed: string;
  weightLb: number;
  birthYear: number;
  photo: PhotoRef;
  /** Which of her SKUs they are on. Must be an id from products.ts. */
  productId: string;
  /** Reminder time. Scheduled locally on device; nothing leaves the phone. */
  reminder: { hour: number; minute: number };
  /** Whether the daily reminder is on. */
  reminderOn: boolean;
  /** 30 entries, oldest first, last is today. */
  history: boolean[];
  streak: number;
  progress: ProgressEntry[];
  weights: WeightEntry[];
  vetNotes: VetNote[];
  /**
   * Pills in the bottle they actually have. Read it off her label: her counts
   * differ per SKU and her site states them inconsistently (WALK-EASY photo
   * reads 180 tablets, Peaceful Paws 400, the dental page says 450 pills in
   * copy while its own image is named 400_TABLETS). null drops the day count
   * from the reorder nudge rather than inventing one.
   */
  bottlePills: number | null;
  /** Days since this bottle was opened. Tune against bottlePills. */
  bottleStartedDaysAgo: number;
}

/**
 * Build a 30-day history.
 * Today is deliberately left UNGIVEN so the founder can tap "Mark as given"
 * on the Home screen and watch the streak tick up. That tap is the demo.
 */
function buildHistory(streak: number, missedDaysAgo: number[]): boolean[] {
  const days = 30;
  const out: boolean[] = [];
  for (let i = 0; i < days; i++) {
    const daysAgo = days - 1 - i;
    if (daysAgo === 0) out.push(false);
    else if (daysAgo <= streak) out.push(true);
    else out.push(!missedDaysAgo.includes(daysAgo));
  }
  return out;
}

/**
 * <-- SWAP: the founder's pets go here.
 *
 * The first pet is the one Home opens on. Two pets on different remedies is
 * the normal household case and the clearest way to show depth on the call.
 */
export const DEMO_PETS: Pet[] = [
  {
    id: 'rosie',
    name: 'Rosie',
    species: 'dog',
    breed: 'English Bulldog',
    weightLb: 52,
    birthYear: 2018,
    photo: PHOTOS.door,
    productId: 'walk-easy',
    reminder: { hour: 8, minute: 0 },
    reminderOn: true,
    history: buildHistory(12, [17, 21, 22]),
    streak: 12,
    // WALK-EASY at 2 pills twice a day is 4/day. 180 tablets is 45 days.
    bottlePills: 180,
    bottleStartedDaysAgo: 31,
    progress: [
      {
        date: '2026-06-14',
        photo: PHOTOS.bed,
        note: 'Day one. Stiff getting up from her bed in the mornings.',
      },
      {
        date: '2026-07-05',
        photo: PHOTOS.steps,
        note: 'Three weeks in. Taking the back steps on her own again.',
      },
      { date: '2026-07-26', photo: PHOTOS.beach, note: 'Beach walk, no limp afterwards.' },
      {
        date: '2026-08-23',
        photo: PHOTOS.door,
        note: 'Two months. Back to meeting me at the door.',
      },
    ],
    weights: [
      { date: '2026-06-14', lb: 56 },
      { date: '2026-07-05', lb: 55 },
      { date: '2026-07-26', lb: 53 },
      { date: '2026-08-23', lb: 52 },
    ],
    vetNotes: [
      {
        date: '2026-06-10',
        title: 'Annual check-up',
        note: 'Dr. Patel flagged stiffness in both hips. Suggested keeping her weight down and starting joint support.',
      },
      {
        date: '2026-08-19',
        title: 'Follow-up call',
        note: 'Reported better mobility on the stairs. Keep going, recheck in the spring.',
      },
    ],
  },
  {
    id: 'miso',
    name: 'Miso',
    species: 'cat',
    breed: 'Domestic Shorthair',
    weightLb: 11,
    birthYear: 2021,
    // No photo on purpose: shows the empty-avatar state in the pet switcher.
    photo: '',
    productId: 'cat-allergy',
    reminder: { hour: 19, minute: 30 },
    reminderOn: false,
    history: buildHistory(4, [9, 10, 14]),
    streak: 4,
    bottlePills: null, // her cat-allergy listing does not print a count
    bottleStartedDaysAgo: 9,
    progress: [],
    weights: [{ date: '2026-08-01', lb: 11 }],
    vetNotes: [],
  },
];

/** <-- SWAP: the pet parent's name, used in the Home greeting. */
export const DEMO_OWNER_FIRST_NAME = 'Sam';

/**
 * <-- SWAP: pre-fill the email captured at the END of onboarding.
 * Leave empty so the founder types her own on the call.
 */
export const DEMO_EMAIL = '';

/** A blank pet, used when adding one through onboarding. */
export const emptyPet = (id: string): Pet => ({
  id,
  name: '',
  species: 'dog',
  breed: '',
  weightLb: 0,
  birthYear: new Date().getFullYear() - 3,
  photo: '',
  productId: 'walk-easy',
  reminder: { hour: 8, minute: 0 },
  reminderOn: true,
  history: buildHistory(0, []),
  streak: 0,
  progress: [],
  weights: [],
  vetNotes: [],
  bottlePills: null,
  bottleStartedDaysAgo: 0,
});

export default DEMO_PETS;
