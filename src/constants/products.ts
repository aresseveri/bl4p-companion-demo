/**
 * Five real BestLife4Pets SKUs.
 *
 * Everything here was fetched from her live listings and re-audited on
 * 2026-08-27:
 *   name, price, compareAt -> Shopify products.json
 *   image                  -> her real CDN URLs (no placeholders anywhere)
 *   dosing                 -> the Dosage block on each product page
 *   howToGive              -> her "Three easy ways to give it" tiles
 *   helpsWith              -> the concern chips on her own product cards
 *   faqs                   -> the FAQ accordion on each product page, verbatim
 *   blurb                  -> her meta description
 *
 * RULES OBSERVED:
 *  - No dose is invented. Every band is transcribed from her label.
 *  - No health claim appears here that is not already on her own listing.
 *  - Every FAQ is a question SHE asks on the page, with her answer. None are
 *    paraphrased into existence.
 *  - Where her label is ambiguous, `labelNote` says so rather than guessing.
 */

export type Species = 'dog' | 'cat';

/** One weight band off her label. maxLb is exclusive; null means "and up". */
export interface DoseBand {
  /** Her own wording for the band, e.g. "Medium Dogs (25 - 60 lbs)". */
  label: string;
  minLb: number;
  maxLb: number | null;
  /** Which species this band applies to. Some SKUs band cats and dogs together. */
  species: Species[];
  /** Pills per administration, as printed. Ranges keep both ends. */
  pills: string;
  /** Administrations per day. */
  timesPerDay: number;
  /** Rendered as she writes it, e.g. "6 pills twice a day". */
  text: string;
}

/**
 * One of the three ways to administer.
 *
 * These are ALTERNATIVES, not steps. Her page presents them as three parallel
 * tiles under "Three easy ways to give it" — a pet parent picks one. Do not
 * render them as a numbered sequence.
 */
export interface GiveMethod {
  /** Her tile label. */
  short: string;
  /** Her fuller sentence from the Directions block. */
  full: string;
}

export interface Product {
  id: string;
  handle: string;
  /** Exact title from her catalog. */
  name: string;
  /** Shorter name for tight UI. Still her wording, just trimmed. */
  shortName: string;
  species: Species[];
  price: number;
  compareAt: number | null;
  image: string;
  imageAlt: string;
  /** Her meta description, verbatim. */
  blurb: string;
  /** The concern chips she puts on her own product cards, verbatim. */
  helpsWith: string[];
  /** Weight-banded dosing, transcribed from her label. */
  dosing: DoseBand[];
  /** Her maintenance / follow-on note, verbatim, if the label has one. */
  maintenance: string | null;
  /** Three alternatives, in her order. See GiveMethod. */
  howToGive: GiveMethod[];
  /** Anything ambiguous or missing on her listing. Surfaced, not hidden. */
  labelNote: string | null;
  /** Her real FAQ, verbatim. */
  faqs: { q: string; a: string }[];
  /**
   * Amazon listing URL for the Reorder screen.
   *
   * INTENTIONALLY EMPTY. There is not a single amazon.com link anywhere on
   * bestlife4pets.com (checked the homepage and all five product pages), so
   * there is no real ASIN to use and guessing one would put a wrong product
   * behind a buy button. Paste the real listing URLs here before the call and
   * the Reorder screen switches over automatically.
   */
  amazonUrl: string | null;
}

const SITE = 'https://www.bestlife4pets.com/en-us/products';

/** Her own product page. Used as the Reorder CTA until amazonUrl is filled in. */
export const productUrl = (p: Product) => `${SITE}/${p.handle}`;

/**
 * Her heading above the three methods. Her site renders this with a typo
 * ("Tree easy ways to give it"); spelled correctly here rather than
 * reproducing the typo in her own demo.
 */
export const GIVE_HEADING = 'Three easy ways to give it';

/**
 * The three ways, in the order her page shows them. Identical across her
 * whole line apart from the animal noun.
 */
const HOW_TO_GIVE = (animal: string): GiveMethod[] => [
  {
    short: 'Crush & sprinkle',
    full: 'Crush into powder and sprinkle on food or mix with water.',
  },
  { short: 'Mix food or treat', full: 'Mix with food or hide in a treat.' },
  { short: 'Give directly', full: `Give directly to your ${animal} by mouth.` },
];

/** Her standing storage note, on every label. */
export const STORAGE_NOTE =
  'Pills may not dissolve quickly in water. This is okay, your pet is still receiving the remedy. Store in a dry place and away from essential oils and strong scents.';

export const PRODUCTS: Product[] = [
  {
    id: 'walk-easy',
    handle: 'hip-and-joint-treatment-for-dogs',
    name: 'Dog WALK-EASY™ Advanced Hip & Joint Pain Remedy',
    shortName: 'WALK-EASY™ Advanced',
    species: ['dog'],
    price: 47.99,
    compareAt: 56.99,
    image:
      'https://cdn.shopify.com/s/files/1/0019/4985/9885/files/WalkEasyExtra-IMG1.jpg?v=1769478027',
    imageAlt:
      'https://cdn.shopify.com/s/files/1/0019/4985/9885/files/WalkEasyExtra-IMG2.jpg?v=1769478118',
    blurb:
      "Boost your dog's mobility and ease joint pain with WALK-EASY™, natural support for arthritis, ACL recovery, and active, playful pups.",
    helpsWith: ['ACL tears', 'Hip dysplasia', 'Joint swelling', 'Limping'],
    dosing: [
      {
        label: 'Small dogs (less than 25 lbs)',
        minLb: 0,
        maxLb: 25,
        species: ['dog'],
        pills: '1',
        timesPerDay: 2,
        text: '1 pill twice a day',
      },
      {
        label: 'Medium dogs (25-60 lbs)',
        minLb: 25,
        maxLb: 60,
        species: ['dog'],
        pills: '2',
        timesPerDay: 2,
        text: '2 pills twice a day',
      },
      {
        label: 'Large dogs (over 60 lbs)',
        minLb: 60,
        maxLb: null,
        species: ['dog'],
        pills: '2',
        timesPerDay: 3,
        text: '2 pills three times a day',
      },
    ],
    maintenance: null,
    howToGive: HOW_TO_GIVE('dog'),
    labelNote: null,
    faqs: [
      {
        q: 'What are the common causes of joint pain in dogs?',
        a: 'Joint pain in dogs is often caused by arthritis, hip dysplasia, ACL injuries, or sprains. As dogs age, their joints naturally wear down, leading to pain and stiffness.',
      },
      {
        q: 'How can I tell if my dog is suffering from joint pain?',
        a: 'Signs of joint pain include limping, stiffness, difficulty climbing stairs, and reluctance to jump or run.',
      },
      {
        q: 'How does weight affect my dog’s joints?',
        a: "Excess weight puts extra stress on your dog's joints, increasing the risk of conditions like arthritis. Keeping your dog at a healthy weight and using joint support supplements can help alleviate pressure on their joints and reduce the risk of pain.",
      },
      {
        q: 'Can exercise help reduce joint pain in dogs?',
        a: 'Yes, moderate exercise helps maintain muscle strength and joint flexibility, reducing pain over time. Low-impact activities like swimming or walking are ideal for dogs with joint problems.',
      },
      {
        q: 'How does cold weather affect joint pain in dogs?',
        a: 'Cold weather can increase joint stiffness and make it harder for dogs with arthritis or other joint issues to move comfortably. Natural joint supplements and gentle exercise can help keep your dog more comfortable during colder months.',
      },
      {
        q: 'Are certain dog breeds more prone to joint issues?',
        a: 'Yes, larger breeds like Labradors, German Shepherds, and Golden Retrievers are more prone to hip dysplasia and arthritis. These breeds often benefit from early use of joint supplements to protect and support their joint health.',
      },
    ],
    amazonUrl: null,
  },

  {
    id: 'dental',
    handle: 'dog-bad-breath-remedy',
    name: 'Dog Bad Breath & Dental Care Remedy',
    shortName: 'Bad Breath & Dental Care',
    species: ['dog'],
    price: 36.99,
    compareAt: 39.99,
    image:
      'https://cdn.shopify.com/s/files/1/0019/4985/9885/files/400_TABLETS_LARGE_TEXT-13.jpg?v=1772477850',
    imageAlt:
      'https://cdn.shopify.com/s/files/1/0019/4985/9885/files/dog_breath_freshener.jpg?v=1772477903',
    blurb:
      "Fight your dog's bad breath and gum pain naturally with BestLife4Pets dental care, supports oral health, reduces plaque, and soothes inflammation.",
    helpsWith: ['Bad Breath', 'Gingivitis', 'Plaque', 'Swollen Gums'],
    dosing: [
      {
        label: 'Small Dogs (Under 25 lbs)',
        minLb: 0,
        maxLb: 25,
        species: ['dog'],
        pills: '2-3',
        timesPerDay: 2,
        text: '2-3 pills twice a day',
      },
      {
        label: 'Medium Dogs (25 - 60 lbs)',
        minLb: 25,
        maxLb: 60,
        species: ['dog'],
        pills: '6',
        timesPerDay: 2,
        text: '6 pills twice a day',
      },
      {
        label: 'Large Dogs (Over 60 lbs)',
        minLb: 60,
        maxLb: null,
        species: ['dog'],
        pills: '6',
        timesPerDay: 3,
        text: '6 pills three times a day',
      },
    ],
    maintenance:
      'Once symptoms clear, transition to a preventative dose to maintain wellness: Small Dogs/Puppies 2 pills once per day, Medium/Large Dogs 3-4 pills once per day.',
    howToGive: HOW_TO_GIVE('dog'),
    labelNote: null,
    faqs: [
      {
        q: 'How can I prevent bad breath in dogs?',
        a: "Regularly brushing your dog's teeth, providing dental chews, and using natural remedies like BestLife4Pets Dog Bad Breath & Dental Care Solution can help prevent bad breath. Maintaining good oral hygiene is key to avoiding bacteria buildup that causes bad breath.",
      },
      {
        q: 'Can bad breath in dogs be a sign of a more serious health issue?',
        a: 'Yes, persistent bad breath can be a sign of underlying dental disease or other health problems such as stomatitis, gingivitis, or even kidney disease. It’s important to treat bad breath early to prevent further complications.',
      },
      {
        q: 'Why is dental care important for dogs?',
        a: 'Dental care is essential for preventing tooth decay, gum disease, and mouth infections in dogs. Poor oral hygiene can lead to more serious health issues, including tooth loss and systemic infections that affect the heart, liver, and kidneys.',
      },
      {
        q: 'Is gingivitis painful for dogs?',
        a: 'Gingivitis can be painful for dogs because their gums are inflamed. As the disease gets worse, their teeth become loose and can eventually start to fall out.',
      },
      {
        q: 'How to treat gingivitis in dogs?',
        a: 'Prevention is the key with gingivitis as with all aspects of your dog’s health. We recommend daily teeth brushing, feeding a nutritious diet that includes supplements like our Oral Health for Dogs, and giving crunchy treats.',
      },
    ],
    amazonUrl: null,
  },

  {
    id: 'ear',
    handle: 'ear-infection-treatment-for-dogs-and-cats',
    name: 'Dog & Cat Ear Infection & Itch Relief Remedy',
    shortName: 'Ear Infection & Itch Relief',
    species: ['dog', 'cat'],
    price: 37.95,
    compareAt: 38.99,
    image:
      'https://cdn.shopify.com/s/files/1/0019/4985/9885/files/Ear-IMG1.jpg?v=1769478020',
    imageAlt:
      'https://cdn.shopify.com/s/files/1/0019/4985/9885/files/Ear-IMG2.jpg?v=1769478018',
    blurb:
      'Ear infection medicine for dogs without vet prescription, soothe itching and discomfort with gentle, natural pellets.',
    helpsWith: ['Discharge', 'Infection', 'Itching', 'Redness'],
    dosing: [
      {
        label: 'Cats or Small Dogs (Under 25 lbs)',
        minLb: 0,
        maxLb: 25,
        species: ['dog', 'cat'],
        pills: '2-3',
        timesPerDay: 2,
        text: '2-3 pills twice a day',
      },
      {
        label: 'Medium Dogs (25 - 60 lbs)',
        minLb: 25,
        maxLb: 60,
        species: ['dog'],
        pills: '6',
        timesPerDay: 2,
        text: '6 pills twice a day',
      },
      {
        label: 'Large Dogs (Over 60 lbs)',
        minLb: 60,
        maxLb: null,
        species: ['dog'],
        pills: '6',
        timesPerDay: 3,
        text: '6 pills three times a day',
      },
    ],
    maintenance:
      'For pets with recurring infections, continue with half of the dose given once per day long-term.',
    howToGive: HOW_TO_GIVE('pet'),
    /**
     * Her label bands cats only in the "Cats or Small Dogs (Under 25 lbs)" row
     * and gives no band for a cat over 25 lbs. Very few cats are, but the app
     * would otherwise silently apply a large-DOG dose to a heavy cat, so this
     * is surfaced instead of guessed. See doseFor() in lib/dosing.ts.
     */
    labelNote:
      'Her label groups all cats into the under-25 lbs band and does not print a band for a cat over 25 lbs.',
    faqs: [
      {
        q: 'What causes ear infections in dogs?',
        a: 'Ear infections in dogs can be caused by bacteria, yeast, or tiny bugs called ear mites that live in their ears. When dogs have allergies, it can make their ears itchy and lead to infections.',
      },
      {
        q: 'How do I know if my dog or cat has an ear infection?',
        a: 'Common signs of ear infections in both dogs and cats include excessive scratching, head shaking, smelly discharge, redness, and swollen ears. If your pet exhibits any of these symptoms, it’s important to treat the infection promptly.',
      },
      {
        q: 'Can ear infections in dogs and cats clear up on their own?',
        a: 'While mild ear infections may seem to improve, most ear infections require treatment to fully heal. Untreated infections can worsen and lead to chronic ear issues or damage.',
      },
      {
        q: 'How long does it take for the ear infection remedy to work?',
        a: 'You may notice improvements in your pet’s symptoms within a few days of starting BestLife4Pets Ear Infection & Itch Relief. For persistent infections, continued use over 1-2 weeks is recommended for complete relief.',
      },
      {
        q: 'Is BestLife4Pets Ear Infection Remedy safe for kittens and puppies?',
        a: 'Yes, this remedy is made with gentle, natural ingredients and is safe for both kittens and puppies. It helps treat ear infections without the use of harsh chemicals, making it ideal for younger pets.',
      },
      {
        q: 'Can ear infections in pets cause hearing loss?',
        a: 'Yes, if left untreated, chronic ear infections can lead to hearing loss in dogs and cats. The buildup of infection and inflammation can cause damage to the ear canal. Early treatment is key to preventing permanent hearing issues.',
      },
    ],
    amazonUrl: null,
  },

  {
    id: 'cat-allergy',
    handle: 'cat-allergy-relief-immune-support',
    /**
     * Her full catalog title is longer:
     * "Cat Allergy Relief & Immune Support – Natural Remedy for Sneezing,
     * Itching & Seasonal Allergies". Trimmed at the dash for the UI; nothing
     * is added.
     */
    name: 'Cat Allergy Relief & Immune Support',
    shortName: 'Cat Allergy Relief',
    species: ['cat'],
    price: 31.95,
    compareAt: 34.95,
    image:
      'https://cdn.shopify.com/s/files/1/0019/4985/9885/files/CatAllergyBottle-IMG1.jpg?v=1768926104',
    imageAlt:
      'https://cdn.shopify.com/s/files/1/0019/4985/9885/files/CatAllergy-IMG2.jpg?v=1768926114',
    blurb:
      "Relieve your cat's allergies naturally. Eases sneezing, itching, congestion, and boosts immune health for lasting relief and recovery.",
    helpsWith: ['Low Energy', 'Recurring Infections', 'Runny Eyes', 'Sneezing'],
    /**
     * This SKU bands by life stage (cat vs kitten), not by weight. The app
     * resolves kitten from the pet's birth year rather than inventing a
     * weight cut-off she does not print.
     */
    dosing: [
      {
        label: 'For Cats',
        minLb: 0,
        maxLb: null,
        species: ['cat'],
        pills: '2-3',
        timesPerDay: 2,
        text: '2-3 pills twice a day',
      },
      {
        label: 'For Kittens',
        minLb: 0,
        maxLb: null,
        species: ['cat'],
        pills: '1-2',
        timesPerDay: 2,
        text: '1-2 pills twice a day',
      },
    ],
    maintenance:
      'Once symptoms clear, transition to a preventative daily dose to maintain wellness: Cats 2 pills once per day, Kittens 1 pill once per day.',
    howToGive: HOW_TO_GIVE('cat'),
    labelNote:
      'This label doses by life stage (cat vs kitten), not by weight. The app uses birth year to pick the band.',
    faqs: [
      {
        q: 'Can allergies make my cat more vulnerable to colds and infections?',
        a: 'Yes, allergies can weaken a cat’s immune system and make them more susceptible to infections. Symptoms like itching, sneezing, and inflammation can indicate a weakened immune response, making it important to manage both allergies and immunity.',
      },
      {
        q: 'How can I help strengthen my cat’s immune system?',
        a: 'You can strengthen your cat’s immune system through a combination of proper nutrition, reduced stress, and daily use of natural remedies that support immune health.',
      },
      {
        q: 'What causes a weakened immune system in cats?',
        a: 'A cat’s immune system can become weakened due to stress, poor nutrition, illness, or aging. Cats with a weakened immune system are more susceptible to infections and allergies.',
      },
      {
        q: 'Are certain cats more prone to colds or infections?',
        a: 'Yes, kittens, senior cats, and cats with pre-existing conditions or compromised immune systems are more prone to developing colds and infections. Stress and environmental factors can also play a role.',
      },
      {
        q: 'What are the symptoms of a cold or upper respiratory infection in cats?',
        a: 'Common symptoms of cat colds include sneezing, coughing, runny nose, watery eyes, congestion, and low energy. In some cases, your cat may also experience a reduced appetite or fever.',
      },
    ],
    amazonUrl: null,
  },

  {
    id: 'peaceful-paws',
    handle: 'peaceful-paws-dog-behavior-support',
    name: 'Peaceful Paws Dog Behavior Support',
    shortName: 'Peaceful Paws',
    species: ['dog'],
    price: 24.99,
    compareAt: 34.99,
    image:
      'https://cdn.shopify.com/s/files/1/0019/4985/9885/files/PeacefulPawsDogBehaviorSupport-400TABLETSLARGETEXT-19.jpg?v=1768584885',
    imageAlt:
      'https://cdn.shopify.com/s/files/1/0019/4985/9885/files/AMAZONIMAGE2DOGPEACEFULPAWS.jpg?v=1769478040',
    blurb:
      "Calm your dog's aggression, anxiety, and noise fears naturally with Peaceful Paws, a gentle remedy for a happier, stress-free pup at home or on the go.",
    helpsWith: [
      'Dog Training',
      'Fear or Territorial Behavior',
      'Obsessive, Reactive Barking',
      'Restlessness',
    ],
    /**
     * Event-based, not a standing daily schedule: given ~30 min before a
     * stressful event and repeatable. Kept as printed.
     */
    dosing: [
      {
        label: 'Small Dogs (under 25 lbs)',
        minLb: 0,
        maxLb: 25,
        species: ['dog'],
        pills: '3',
        timesPerDay: 1,
        text: '3 pills, about 30 minutes before a stressful event',
      },
      {
        label: 'Medium Dogs (25-60 lbs)',
        minLb: 25,
        maxLb: 60,
        species: ['dog'],
        pills: '4',
        timesPerDay: 1,
        text: '4 pills, about 30 minutes before a stressful event',
      },
      {
        label: 'Large Dogs (over 60 lbs)',
        minLb: 60,
        maxLb: null,
        species: ['dog'],
        pills: '5',
        timesPerDay: 1,
        text: '5 pills, about 30 minutes before a stressful event',
      },
    ],
    maintenance:
      'May be repeated every 30 minutes, up to 4 times per day, during stressful events or periods of increased agitation. Use until your dog appears more settled.',
    howToGive: HOW_TO_GIVE('dog'),
    labelNote:
      'Given before a stressful event rather than on a fixed daily schedule, so this SKU shows an as-needed card instead of a daily one.',
    faqs: [
      {
        q: 'Is this safe for long-term use?',
        a: 'Yes, this natural formula is made with non-toxic ingredients, making it safe for daily or long-term use without the risk of harmful side effects, ensuring ongoing support for anxiety and behavior management.',
      },
      {
        q: 'Will this make my dog sleepy or lethargic?',
        a: 'No, the formula is non-sedative, meaning it will calm your dog without causing drowsiness. Your dog will remain alert and active while experiencing reduced stress and agitation.',
      },
      {
        q: 'Can this help with car ride anxiety?',
        a: 'Absolutely! This remedy is ideal for helping dogs who experience anxiety during car rides. It can soothe your dog’s nerves, making travel less stressful and more enjoyable for both of you.',
      },
      {
        q: 'Does this work for dogs with noise sensitivity?',
        a: 'Yes, the remedy is specifically designed to help dogs that suffer from noise phobias, including fear of thunderstorms, fireworks, or other loud noises, helping them stay calm and relaxed during stressful events.',
      },
      {
        q: 'Is this safe for puppies?',
        a: 'Yes, this natural remedy is safe for puppies. It can help calm puppy anxiety and also assist in preventing the development of aggressive behaviors as they grow.',
      },
      {
        q: 'Can this help with barking caused by separation anxiety?',
        a: 'Yes, this remedy is designed to reduce anxiety in dogs, including behaviors associated with separation anxiety. By calming your dog naturally, it helps minimize excessive barking when left alone.',
      },
    ],
    amazonUrl: null,
  },
];

export const productById = (id: string) => PRODUCTS.find((p) => p.id === id);

export const productsForSpecies = (s: Species) =>
  PRODUCTS.filter((p) => p.species.includes(s));

export default PRODUCTS;
